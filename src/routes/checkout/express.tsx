import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { business } from '#/config/business'
import { planConfigs } from '#/config/site-config'
import { getServerPlanId } from '#/config/plans'
import { ExpressCheckoutClient } from '#/components/ExpressCheckoutClient'

const plan = planConfigs.inspection

const getPlanId = createServerFn({ method: 'GET' }).handler(() => {
  try {
    return getServerPlanId('inspection')
  } catch {
    return null
  }
})

export const Route = createFileRoute('/checkout/express')({
  head: () => ({
    meta: [{ title: `Express checkout — ${business.name}` }],
  }),
  loader: async () => ({ planId: await getPlanId() }),
  component: ExpressCheckoutPage,
})

function ExpressCheckoutPage() {
  const { planId } = Route.useLoaderData()
  return (
    <section className="mx-auto max-w-xl px-4 py-12">
      <Link to="/" className="text-sm font-semibold text-stone-600 hover:text-stone-900">
        ← Back to {business.name}
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-stone-900">Express checkout</h1>
      <p className="mt-2 text-sm leading-6 text-stone-600">
        Wallet-button checkout (Apple Pay / Google Pay) for the {plan.name} ({plan.priceUsd} USD) plan, mounted per the
        Whop Elements docs.
      </p>

      <div className="mt-8">
        {planId ? (
          <ExpressCheckoutClient planId={planId} planName={plan.name} />
        ) : (
          <div role="alert" className="rounded-2xl border border-amber-300 bg-amber-50 p-6 text-sm leading-6 text-amber-900">
            <p className="font-semibold">Plan not configured.</p>
            <p className="mt-2">Set WHOP_INSPECTION_PLAN_ID as an app secret (see README), then reload.</p>
          </div>
        )}
      </div>

      <p className="mt-6 text-xs leading-5 text-stone-500">
        Composition per docs: a checkout handle mounts exactly one entry element — ExpressCheckoutElement here,
        the full payment surface on the dedicated plan pages — each with the required BrandingElement.
      </p>
    </section>
  )
}
