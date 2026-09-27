import { createFileRoute } from '@tanstack/react-router'
import { getAccountId, whopApi, WhopApiError } from '#/lib/server/whop'
import { EMAIL_RE } from '#/lib/emails'

/**
 * ADMIN EXAMPLE — Final balance invoice via the Whop Invoices API.
 *
 * PROTECTION MODEL
 * - Secret check: POST /api/admin/final-invoice with header x-admin-secret
 *   equal to the INVOICE_ADMIN_SECRET app secret. No secret → 404 (existence
 *   is not disclosed to scanners).
 * - Server-only: never returns the secret; runtime injects it via
 *   `whop apps secrets set --secret INVOICE_ADMIN_SECRET=...`.
 * - The endpoint can only invoice the stored member it is given; it cannot
 *   bill arbitrary public visitors, and unauthenticated calls are rejected.
 *
 * MODES (Whop Invoices API supports both)
 * - auto_charge=true  → charge the stored payment method (saved at deposit
 *   time via the setup intent) off-session.
 * - auto_charge=false → send the customer a manual-pay invoice link.
 */
interface InvoiceResponse {
  id: string
  status?: string
  pay_online_url?: string | null
}

interface FinalInvoiceBody {
  memberId?: unknown
  emailAddress?: unknown
  customerName?: unknown
  amount?: unknown
  lineItems?: unknown
  autoCharge?: unknown
  dueDate?: unknown
  chargeBuyerFee?: unknown
  saveAsDraft?: unknown
}

export const Route = createFileRoute('/api/admin/final-invoice')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // ---- Gate 1: admin secret ----
        const adminSecret = process.env.INVOICE_ADMIN_SECRET
        const provided = request.headers.get('x-admin-secret')
        if (!adminSecret || !provided || provided !== adminSecret) {
          return new Response(null, { status: 404 })
        }

        // ---- Parse body ----
        let body: FinalInvoiceBody
        try {
          body = (await request.json()) as FinalInvoiceBody
        } catch {
          return Response.json({ error: 'Invalid JSON body.' }, { status: 400 })
        }

        // Whop's createInvoice API accepts EITHER member_id OR email_address,
        // never both. Member path (customer with a membership): member_id only.
        // Guest path (no membership yet): email_address (+ optional name).
        const memberId = typeof body.memberId === 'string' ? body.memberId.trim() : ''
        const useMemberPath = memberId.startsWith('mber_')
        if (memberId && !useMemberPath) {
          return Response.json({ error: 'memberId must start with mber_ (or be omitted to invoice by email).' }, { status: 400 })
        }

        const amount = typeof body.amount === 'number' ? body.amount : NaN
        if (!Number.isFinite(amount) || amount < 1 || amount > 100000) {
          return Response.json({ error: 'amount must be a number between 1 and 100000 (USD).' }, { status: 400 })
        }

        const emailAddress = typeof body.emailAddress === 'string' ? body.emailAddress.trim() : ''
        if (!useMemberPath && !EMAIL_RE.test(emailAddress)) {
          return Response.json(
            { error: 'A valid emailAddress is required when invoicing without a member ID.' },
            { status: 400 },
          )
        }

        const customerName = typeof body.customerName === 'string' ? body.customerName.slice(0, 120) : undefined
        const autoCharge = body.autoCharge !== false
        const dueDate = typeof body.dueDate === 'string' ? body.dueDate : undefined
        const saveAsDraft = body.saveAsDraft === true

        const lineItems =
          Array.isArray(body.lineItems) &&
          body.lineItems.length > 0 &&
          body.lineItems.every(
            (item): item is { label: string; unitPrice: number; quantity?: number } =>
              typeof item === 'object' &&
              item !== null &&
              typeof (item as { label?: unknown }).label === 'string' &&
              typeof (item as { unitPrice?: unknown }).unitPrice === 'number',
          )
            ? (body.lineItems as Array<{ label: string; unitPrice: number; quantity?: number }>)
            : [{ label: 'Final balance — roofing project', unitPrice: amount, quantity: 1 }]

        try {
          const invoice = await whopApi<InvoiceResponse>('/api/v1/invoices', {
            method: 'POST',
            idempotencyKey: request.headers.get('x-idempotency-key') ?? undefined,
            body: {
              account_id: getAccountId(),
              // Exactly one of member_id / email_address (API constraint).
              ...(useMemberPath ? { member_id: memberId } : { email_address: emailAddress, customer_name: customerName }),
              // Whop invoices collect either by charging the stored payment
              // method automatically, or by sending the customer a manual-pay
              // invoice link (both documented InvoiceCollectionMethods).
              collection_method: autoCharge ? 'charge_automatically' : 'send_invoice',
              charge_buyer_fee: body.chargeBuyerFee === true,
              automatically_finalizes_at: autoCharge && !saveAsDraft ? dueDate : undefined,
              due_date: dueDate,
              line_items: lineItems.map((item) => ({
                label: item.label.slice(0, 200),
                unit_price: item.unitPrice,
                quantity: typeof item.quantity === 'number' ? item.quantity : 1,
              })),
              plan: {
                initial_price: amount,
                currency: 'usd',
                plan_type: 'one_time',
              },
              // Invoices price against an inline product (created/ad-hoc by
              // Whop for this invoice) — required by createInvoiceV2.
              product: {
                title: 'Final balance — roofing project',
              },
              save_as_draft: saveAsDraft,
            },
          })

          console.log('[api/admin/final-invoice] created', invoice.id, 'autoCharge=', autoCharge)
          return Response.json(
            {
              ok: true,
              invoiceId: invoice.id,
              status: invoice.status,
              payOnlineUrl: invoice.pay_online_url ?? null,
              mode: autoCharge ? 'auto_charge' : 'manual_invoice',
            },
            { status: 201 },
          )
        } catch (err) {
          console.error('[api/admin/final-invoice] Whop API error', err)
          const status = err instanceof WhopApiError ? 502 : 500
          return Response.json(
            { error: 'Invoice creation failed at the Whop API. Check server logs for details.' },
            { status },
          )
        }
      },
    },
  },
})
