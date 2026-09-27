import { getAccountId, whopApi, WhopApiError } from '#/lib/server/whop'

/**
 * Shared lead-fetching for the two protected surfaces that show leads:
 * - /api/admin/leads   (x-admin-secret gate, standalone admin page)
 * - /api/dashboard/leads (Whop dashboard JWT + account-admin gate)
 */

export interface LeadListItem {
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
  page_info?: { has_next_page?: boolean }
}

export interface AdminLead {
  id: string
  createdAt: string
  converted: boolean
  productTitle: string | null
  fullName: string | null
  email: string | null
  phone: string | null
  zip: string | null
  service: string | null
  timeline: string | null
  message: string | null
  consent: boolean
  source: string | null
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export async function fetchRecentLeads(first: number): Promise<{ ok: true; leads: AdminLead[]; hasMore: boolean } | { ok: false; status: number; error: string }> {
  const capped = Math.min(Math.max(first, 1), 50)
  const productId = process.env.WHOP_PRODUCT_ID
  const params = new URLSearchParams({ account_id: getAccountId(), first: String(capped) })
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
    return { ok: true, leads, hasMore: Boolean(conn.page_info?.has_next_page) }
  } catch (err) {
    const status = err instanceof WhopApiError && err.status === 403 ? 403 : 502
    return {
      ok: false,
      status,
      error:
        status === 403
          ? 'The app credential is missing lead read permission.'
          : 'Could not load leads from the Whop API.',
    }
  }
}
