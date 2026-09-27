import { validateToken } from '@whop-apps/auth'
import { getAccountId, whopApi } from '#/lib/server/whop'

/**
 * Dashboard-view authentication for Whop iframe pages.
 *
 * Whop's app proxy injects a short-lived ES256 JWT (x-whop-user-token) into
 * every same-origin request made inside an app iframe. validateToken verifies
 * it against Whop's public key (default JWK ships with @whop-apps/auth) and
 * checks the audience against this app's ID, returning the acting user.
 */
export interface DashboardUser {
  userId: string
  /** Account ID from the URL, e.g. biz_... */
  companyId: string
  /** True when the verified user is an admin (team member) of the account. */
  isAdmin: boolean
}


export async function getDashboardUser(request: Request): Promise<DashboardUser | null> {
  try {
    const appId = process.env.WHOP_APP_ID
    const auth = await validateToken({ req: request, dontThrow: true, appId })
    if (!auth?.userId) return null

    // Two iframe views reach this code: /dashboard/biz_... and /experiences/exp_...
    // (Whop creates an experience on install; the sidebar entry uses it).
    // Single-account template: the served account always comes from env.
    const companyId = getAccountId()

    // Dashboard apps are for account team members only.
    const access = await whopApi<{ has_access?: boolean; access_level?: string }>(
      `/api/v1/users/${encodeURIComponent(auth.userId)}/access/${encodeURIComponent(companyId)}`,
    )
    const isAdmin = access.access_level === 'admin'
    if (!isAdmin) return null

    return { userId: auth.userId, companyId, isAdmin: true }
  } catch {
    return null
  }
}