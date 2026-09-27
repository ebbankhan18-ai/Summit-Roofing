import { createFileRoute } from '@tanstack/react-router'
import { getDashboardUser } from '#/lib/server/dashboard-auth'
import { fetchRecentLeads } from '#/lib/server/leads'

/**
 * DASHBOARD — leads for the Whop dashboard view of this app.
 *
 * GET /api/dashboard/leads?first=25 — only reachable from inside the app's
 * dashboard iframe: Whop's proxy injects a short-lived user JWT
 * (x-whop-user-token) into same-origin iframe requests, which we verify via
 * @whop-apps/auth, then confirm the user is an admin (team member) of the
 * biz_ account in the URL path. Everything else gets 401/403.
 */
export const Route = createFileRoute('/api/dashboard/leads')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await getDashboardUser(request)
        if (!user) {
          return Response.json({ ok: false, error: 'Dashboard authentication required.' }, { status: 401 })
        }

        const url = new URL(request.url)
        const firstParam = Number.parseInt(url.searchParams.get('first') ?? '25', 10)
        const result = await fetchRecentLeads(Number.isFinite(firstParam) ? firstParam : 25)
        if (!result.ok) {
          return Response.json({ ok: false, error: result.error }, { status: result.status })
        }
        return Response.json({ ...result, ok: true })
      },
    },
  },
})
