import { createFileRoute } from '@tanstack/react-router'
import { getAccountId, whopApi, WhopApiError } from '#/lib/server/whop'
import { getServerPlanId } from '#/config/plans'

/**
 * Server-side confirmation for the deposit payment.
 *
 * The deposit page's <Payments setupFutureUsage="off_session"> tokenizes the
 * buyer's chosen payment method (Whop-hosted PCI frames) and hands us a
 * ctok_ confirmation token. The actual payment is created HERE, server-side,
 * with the Whop API — the browser never sees card data and cannot set the
 * amount or plan. setupFutureUsage makes Whop store the payment method for
 * later off-session charges (the final balance) in the same flow.
 */
interface PaymentResponse {
  id: string
  status: string
  client_secret?: string | null
}

export const Route = createFileRoute('/api/payments/confirm')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { confirmationToken?: unknown; planKey?: unknown }
        try {
          body = (await request.json()) as { confirmationToken?: unknown; planKey?: unknown }
        } catch {
          return Response.json({ error: 'Invalid JSON body.' }, { status: 400 })
        }

        // The client may name a plan, but the server decides what it is worth:
        // only these three keys resolve, and each maps to its own plan ID.
        const planKey = typeof body.planKey === 'string' ? body.planKey : 'deposit'
        const allowed = ['inspection', 'deposit', 'emergency-repair'] as const
        if (!allowed.includes(planKey as (typeof allowed)[number])) {
          return Response.json({ error: 'Unknown plan.' }, { status: 400 })
        }

        const confirmationToken = typeof body.confirmationToken === 'string' ? body.confirmationToken : ''
        if (!confirmationToken.startsWith('ctok_')) {
          return Response.json({ error: 'A valid confirmation token is required.' }, { status: 400 })
        }

        let planId: string
        try {
          // The charged plan is fixed server-side — never trusted from the client.
          planId = getServerPlanId(planKey as 'inspection' | 'deposit' | 'emergency-repair')
        } catch {
          return Response.json({ error: 'Deposit plan is not configured on the server.' }, { status: 500 })
        }

        try {
          const payment = await whopApi<PaymentResponse>('/api/v1/payments', {
            method: 'POST',
            idempotencyKey: request.headers.get('x-idempotency-key') ?? undefined,
            body: {
              account_id: getAccountId(),
              confirmation_token: confirmationToken,
              line_items: [{ plan_id: planId, quantity: 1 }],
              metadata: {
                purpose: 'project_deposit',
                card_on_file: 'setup_future_usage_off_session',
                template: 'summit-shield-roofing',
              },
            },
          })

          return Response.json(
            {
              ok: true,
              paymentId: payment.id,
              status: payment.status,
              clientSecret: payment.client_secret ?? null,
            },
            { status: 201 },
          )
        } catch (err) {
          console.error('[api/payments/confirm] failed', err)
          const status = err instanceof WhopApiError ? 502 : 500
          return Response.json(
            { error: 'The payment could not be confirmed. No charge was made — please try again or call us.' },
            { status },
          )
        }
      },
    },
  },
})
