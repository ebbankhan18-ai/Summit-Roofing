import { createFileRoute } from '@tanstack/react-router'
import { DashboardLeadsView } from '#/components/DashboardLeadsView'

/**
 * DASHBOARD VIEW — renders inside the Whop business dashboard iframe at
 * /dashboard/[companyId] (registered as the app's dashboard_path). Whop's
 * proxy injects the acting user's JWT into requests made from this page.
 */
export const Route = createFileRoute('/dashboard/$companyId')({
  head: () => ({
    meta: [
      { title: 'Summit Shield Roofing — Leads' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: DashboardLeadsPage,
})

function DashboardLeadsPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight text-stone-900">Estimate leads</h1>
      <p className="mt-1 text-sm text-stone-600">
        Live estimate requests for this account, straight from the Whop Leads API.
      </p>
      <div className="mt-6">
        <DashboardLeadsView />
      </div>
    </section>
  )
}
