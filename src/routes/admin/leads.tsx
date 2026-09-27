import { createFileRoute } from '@tanstack/react-router'
import { AdminLeadsPanel } from '#/components/AdminLeadsPanel'

export const Route = createFileRoute('/admin/leads')({
  head: () => ({
    meta: [
      { title: 'Leads — team admin' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: AdminLeadsPage,
})

function AdminLeadsPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-stone-900">Estimate leads</h1>
      <p className="mt-1 text-sm text-stone-600">
        Internal team view of recent estimate requests — served live from the Whop Leads API.
      </p>
      <div className="mt-8">
        <AdminLeadsPanel />
      </div>
    </section>
  )
}
