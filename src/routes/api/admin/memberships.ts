import { createFileRoute } from '@tanstack/react-router'
import { getAccountId, whopApi, WhopApiError } from '#/lib/server/whop'

/**
 * ADMIN — recent memberships on this product (protected by INVOICE_ADMIN_SECRET).
 *
 * GET /api/admin/memberships?first=25 with header `x-admin-secret`. 404 without
 * the secret so the endpoint's existence is not disclosed. Powers the member
 * picker in the final-balance invoice panel: the admin picks a customer and the
 * mber_ id, email, and name auto-fill. Only non-sensitive fields are returned.
 */
interface MembershipItem {
  id: string
  status?: string | null
  joined_at?: string | null
  created_at?: string | null
  initial_price_paid?: string | null
  member?: { id?: string | null } | null
  plan?: { id?: string | null } | null
  user?: { email?: string | null; name?: string | null; username?: string | null } | null
}

interface MembershipsConnection {
  data?: MembershipItem[]
  page_info?: { has_next_page?: boolean }
}

export const Route = createFileRoute('/api/admin/memberships')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const adminSecret = process.env.INVOICE_ADMIN_SECRET
        const provided = request.headers.get('x-admin-secret')
        if (!adminSecret || !provided || provided !== adminSecret) {
          return new Response(null, { status: 404 })
        }

        const productId = process.env.WHOP_PRODUCT_ID
        if (!productId) {
          return Response.json({ ok: false, error: 'WHOP_PRODUCT_ID is not configured.' }, { status: 500 })
        }

        const url = new URL(request.url)
        const firstParam = Number.parseInt(url.searchParams.get('first') ?? '25', 10)
        const first = Number.isFinite(firstParam) ? Math.min(Math.max(firstParam, 1), 50) : 25

        const params = new URLSearchParams({
          account_id: getAccountId(),
          product_ids: productId,
          first: String(first),
          order: 'created_at',
          direction: 'desc',
        })

        try {
          const conn = await whopApi<MembershipsConnection>(`/api/v1/memberships?${params.toString()}`)
          const members = (conn.data ?? [])
            .map((m) => ({
              memberId: m.member?.id ?? null,
              membershipId: m.id,
              name: m.user?.name ?? m.user?.username ?? null,
              email: m.user?.email ?? null,
              status: m.status ?? null,
              pricePaid: m.initial_price_paid ?? null,
              joinedAt: m.joined_at ?? m.created_at ?? null,
            }))
            // Invoicing needs the member relationship; skip rows without one.
            .filter((m): m is typeof m & { memberId: string } => typeof m.memberId === 'string' && m.memberId.startsWith('mber_'))

          return Response.json({ ok: true, members, hasMore: Boolean(conn.page_info?.has_next_page) })
        } catch (err) {
          const status = err instanceof WhopApiError ? (err.status === 403 ? 403 : 502) : 500
          console.error('[api/admin/memberships] Whop API error', err)
          return Response.json(
            {
              ok: false,
              error:
                status === 403
                  ? 'Server credential lacks member read permission (member:basic:read). Check app permissions in the Whop dashboard.'
                  : 'Could not load memberships from the Whop API. Check server logs.',
            },
            { status },
          )
        }
      },
    },
  },
})
