import { createFileRoute } from '@tanstack/react-router'
import { getAccountId, whopApi, WhopApiError } from '#/lib/server/whop'

/**
 * ADMIN — recent leads for the team (protected by INVOICE_ADMIN_SECRET).
 *
 * GET /api/admin/leads with header `x-admin-secret`. 404 without it so the
 * endpoint's existence is not disclosed. Returns the newest leads attached
 * to the roofing-services product with the prospect details the estimate
 * form stored in lead metadata. The admin secret never appears in a
 * response, and this route is server-only (no client bundle exposure).
 */
interface LeadListItem {
  id: string
  created_at: string
  updated_at: string
  metadata?: Record<string, unknown> | null
  product?: { id: string; title: string } | null
  member?: { id: string } | null
  user?: { id?: string; email?: string | null; name?: string | null } | null
}

interface LeadsConnection {
  data?: LeadListItem[]
  page_info?: { end_cursor?: string | null; has_next_page?: boolean }
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export const Route = createFileRoute('/api/admin/leads')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const adminSecret = process.env.INVOICE_ADMIN_SECRET
        const provided = request.headers.get('x-admin-secret')
        if (!adminSecret || !provided || provided !== adminSecret) {
          return new Response(null, { status: 404 })
        }

        const url = new URL(request.url)
        const firstParam = Number.parseInt(url.searchParams.get('first') ?? '25', 10)
        const first = Number.isFinite(firstParam) ? Math.min(Math.max(firstParam, 1), 50) : 25
        const productId = process.env.WHOP_PRODUCT_ID

        const params = new URLSearchParams({ account_id: getAccountId(), first: String(first) })
        if (productId) params.set('product_ids', productId)

        try {
          const conn = await whopApi<LeadsConnection>(`/api/v1/leads?${params.toString()}`)
          const leads = (conn.data ?? []).map((lead) => {
            const meta = (lead.metadata ?? {}) as Record<string, unknown>
            return {
              id: lead.id,
              createdAt: lead.created_at,
              converted: Boolean(lead.member?.id),
              productTitle: lead.product?.title ?? null,
              // Prospect details live in the lead metadata (estimate form).
              fullName: str(meta.full_name) || lead.user?.name || null,
              email: str(meta.email) || lead.user?.email || null,
              phone: str(meta.phone) || null,
              zip: str(meta.zip) || null,
              service: str(meta.requested_service) || null,
              timeline: str(meta.preferred_timeline) || null,
              message: str(meta.message) || null,
              consent: str(meta.consent_contact) === 'true',
              source: str(meta.source) || null,
            }
          })
          return Response.json({ ok: true, leads, hasMore: Boolean(conn.page_info?.has_next_page) })
        } catch (err) {
          console.error('[api/admin/leads] Whop API error', err)
          const status = err instanceof WhopApiError && err.status === 403 ? 403 : 502
          return Response.json(
            { error: status === 403 ? 'The app credential is missing lead read permission.' : 'Could not load leads from the Whop API.' },
            { status },
          )
        }
      },
    },
  },
})
