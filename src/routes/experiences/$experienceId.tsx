import { createFileRoute, Link } from '@tanstack/react-router'
import { DashboardLeadsView } from '#/components/DashboardLeadsView'

/**
 * EXPERIENCE VIEW — Whop creates an experience (exp_…) when the app is
 * installed; the dashboard-sidebar entry opens this view inside the iframe.
 * Whop injects the acting user's JWT into requests from this page, so the
 * leads API authenticates exactly as it does on the dashboard path.
 */
export const Route = createFileRoute('/experiences/$experienceId')({
  head: () => ({
    meta: [
      { title: 'Summit Shield Roofing — Leads' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: ExperienceLeadsPage,
})

function ExperienceLeadsPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight text-stone-900">Estimate leads</h1>
      <p className="mt-1 text-sm text-stone-600">
        Live estimate requests, straight from the Whop Leads API.
      </p>
      <div className="mt-6">
        <DashboardLeadsView />
      </div>
      <p className="mt-8 border-t border-stone-200 pt-4 text-xs text-stone-500">
        Need to bill a final balance? Open the standalone admin page:{' '}
        <Link
          to="/admin/leads"
          className="font-semibold text-slate-900 underline focus-visible:outline-2 focus-visible:outline-amber-600"
        >
          /admin/leads
        </Link>{' '}
        (admin password required there).
      </p>
    </section>
  )
}
