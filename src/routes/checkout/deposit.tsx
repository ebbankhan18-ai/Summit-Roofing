import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { business } from '#/config/business'
import { planConfigs } from '#/config/site-config'
import { getServerPlanId } from '#/config/plans'
import { getAccountId } from '#/lib/server/whop'
import { PaymentFlow } from '#/components/PaymentFlow'
import { usd } from '#/lib/format'

const plan = planConfigs.deposit

/** Server-side resolution of the public biz_ id and the deposit plan ID. */
const getDepositContext = createServerFn({ method: 'GET' }).handler(() => {
  try {
    return { accountId: getAccountId(), planId: getServerPlanId('deposit'), error: null as string | null }
  } catch (err) {
    return { accountId: null, planId: null, error: err instanceof Error ? err.message : 'Unknown error' }
  }
})

export const Route = createFileRoute('/checkout/deposit')({
  head: () => ({
    meta: [{ title: `Start your project deposit — ${business.name}` }],
  }),
  loader: async () => getDepositContext(),
  component: DepositCheckout,
})

function DepositCheckout() {
  const { accountId, planId, error } = Route.useLoaderData()

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <Link to="/" className="text-sm font-semibold text-stone-600 hover:text-stone-900">
        ← Back to {business.name}
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">Start your project — deposit</h1>
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
      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 text-sm leading-6 text-stone-700">
        <p className="font-semibold text-stone-900">How the deposit works</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>You pay the {usd(plan.priceUsd)} deposit today through Whop's secure checkout — card details never touch this site.</li>
          <li>Whop also securely saves your payment method for the final balance (you'll see it on your Whop receipt).</li>
          <li>After the work is completed, the final balance is collected through Whop — charged to your saved method or sent as a manual invoice link.</li>
        </ol>
      </div>

      <div className="mt-8">
        {accountId && planId ? (
          <PaymentFlow
            accountId={accountId}
            planId={planId}
            planKey="deposit"
            planName={plan.name}
            planPriceUsd={plan.priceUsd}
            saveMethod={true}
          />
        ) : (
          <div role="alert" className="rounded-2xl border border-amber-300 bg-amber-50 p-6 text-sm leading-6 text-amber-900">
            <p className="font-semibold">Deposit checkout is not configured yet.</p>
            <p className="mt-2">
              The server could not resolve the deposit plan{error ? `: ${error}` : '.'} Confirm that
              WHOP_DEPOSIT_PLAN_ID is set as an app secret (see README), then reload.
            </p>
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-stone-500">
        Not ready yet?{' '}
        <Link to="/checkout/inspection" className="underline hover:text-stone-700">
          Book an inspection
        </Link>{' '}
        or <Link to="/" className="underline hover:text-stone-700">return home</Link>.
      </p>
    </section>
  )
}
