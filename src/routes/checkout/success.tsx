import { createFileRoute, Link } from '@tanstack/react-router'
import { business } from '#/config/business'
import { planList } from '#/config/site-config'
import { usd } from '#/lib/format'

type Search = { flow?: string; plan?: string }

export const Route = createFileRoute('/checkout/success')({
  validateSearch: (search: Record<string, unknown>): Search => ({
    flow: typeof search.flow === 'string' ? search.flow : undefined,
    plan: typeof search.plan === 'string' ? search.plan : undefined,
  }),
  head: () => ({
    meta: [{ title: `Order confirmed — ${business.name}` }],
  }),
  component: CheckoutSuccess,
})

function CheckoutSuccess() {
  const { flow, plan: planKey } = Route.useSearch()
  const plan = planList.find((p) => p.key === planKey)

  const title =
    flow === 'deposit-setup'
      ? 'Your card is saved — deposit received'
      : plan
        ? `${plan.name} confirmed`
        : 'Payment confirmed'

  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <div className="rounded-3xl border border-green-200 bg-green-50 p-8 text-center sm:p-10">
        <p className="text-4xl" aria-hidden="true">🏆</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-green-950">{title}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-green-900">
          {flow === 'deposit-setup'
            ? 'Thank you — your deposit payment is confirmed and your payment method is securely saved with Whop for the final balance. We will reach out with your project schedule.'
            : 'Thank you — your payment went through and your booking is confirmed. A Whop receipt is on its way to your email, and we will contact you shortly to schedule.'}{' '}
          Questions in the meantime? Call{' '}
          <a href={business.phoneHref} className="font-semibold underline focus-visible:outline-2 focus-visible:outline-green-700">
            {business.phone}
          </a>
          .
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-stone-900">What happens next</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-stone-700">
          <li>You will get a confirmation email from Whop with your receipt.</li>
          <li>{business.shortName} will contact you to schedule — keep an eye on your phone and inbox.</li>
          <li>
            For deposits: after the work is completed, the final balance is collected through Whop — either charged to
            your saved card or sent as a manual invoice, whichever you prefer.
          </li>
        </ol>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-amber-600"
          >
            Back to home
          </Link>
          <a
            href="/#estimate"
            className="inline-flex items-center justify-center rounded-xl border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-amber-600"
          >
            Request another service
          </a>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-stone-500">
        All payments are processed by Whop as merchant of record. {business.name} never sees your card details. Prices
        in USD — {planList.map((p) => usd(p.priceUsd)).join(', ')} flat rates shown are template demo pricing.
      </p>
    </section>
  )
}
