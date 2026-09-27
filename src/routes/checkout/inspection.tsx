import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { business } from '#/config/business'
import { planConfigs } from '#/config/site-config'
import { getServerPlanId } from '#/config/plans'
import { getAccountId } from '#/lib/server/whop'
import { PaymentFlow } from '#/components/PaymentFlow'
import { usd } from '#/lib/format'

const plan = planConfigs.inspection

const getContext = createServerFn({ method: 'GET' }).handler(() => {
  try {
    return { accountId: getAccountId(), planId: getServerPlanId('inspection'), error: null as string | null }
  } catch (err) {
    return { accountId: null, planId: null, error: err instanceof Error ? err.message : 'Unknown error' }
  }
})

export const Route = createFileRoute('/checkout/inspection')({
  head: () => ({
    meta: [{ title: `Book your ${plan.name} — ${business.name}` }],
  }),
  loader: async () => getContext(),
  component: InspectionCheckout,
})

function InspectionCheckout() {
  const { accountId, planId, error } = Route.useLoaderData()
  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <Link to="/" className="text-sm font-semibold text-stone-600 hover:text-stone-900">
        ← Back to {business.name}
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">{plan.name}</h1>
          <p className="mt-1 text-stone-600">{plan.tagline}</p>
        </div>
        <p className="text-3xl font-extrabold text-slate-900">{usd(plan.priceUsd)}</p>
      </div>
      <p className="mt-4 text-stone-700">{plan.description}</p>
      <ul className="mt-4 space-y-1.5 text-sm text-stone-700">
        {plan.bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <span aria-hidden="true" className="text-amber-600">✓</span>
            {b}
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <p className="mb-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs leading-5 text-stone-600">
          Prefer Apple Pay or Google Pay?{' '}
          <Link to="/checkout/express" className="font-semibold text-slate-900 underline focus-visible:outline-2 focus-visible:outline-amber-600">
            Use express checkout →</Link>
        </p>
        {accountId && planId ? (
          <PaymentFlow
            accountId={accountId}
            planId={planId}
            planKey="inspection"
            planName={plan.name}
            planPriceUsd={plan.priceUsd}
            saveMethod={false}
          />
        ) : (
          <div role="alert" className="rounded-2xl border border-amber-300 bg-amber-50 p-6 text-sm leading-6 text-amber-900">
            <p className="font-semibold">Checkout is not configured yet.</p>
            <p className="mt-2">
              The server could not resolve the plan{error ? `: ${error}` : '.'} Set WHOP_INSPECTION_PLAN_ID as an app
              secret (see README), then reload.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
