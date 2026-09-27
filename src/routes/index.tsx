import { createFileRoute, Link } from '@tanstack/react-router'
import { business } from '#/config/business'
import { planList } from '#/config/site-config'
import { ServiceCard } from '#/components/ServiceCard'
import { EstimateForm } from '#/components/EstimateForm'
import { usd } from '#/lib/format'
import { track } from '#/lib/track'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: `${business.name} — ${business.tagline}` },
      {
        name: 'description',
        content:
          'Dallas roof repair, replacement, and inspections. Photo-documented estimates, itemized quotes, and flat-rate inspections from a local crew. Request a free estimate today.',
      },
    ],
  }),
  component: Home,
})

/** Navigates to deposit checkout and fires whop.track("deposit_started") first. */
function DepositLink({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <Link
      to="/checkout/deposit"
      className={className}
      onClick={() =>
        track('deposit_started', {
          service_name: 'Project Deposit',
          source_section: 'home',
          city: business.city,
          plan_type: 'deposit',
        })
      }
    >
      {children}
    </Link>
  )
}

const anchorClass =
  'inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-base font-semibold shadow-sm transition focus-visible:outline-2 focus-visible:outline-amber-600'

function Home() {
  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(60%_60%_at_70%_20%,rgba(245,158,11,0.18),transparent)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">{business.hero.eyebrow}</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              {business.hero.title}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-stone-300">{business.hero.subtitle}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#estimate" className={`${anchorClass} bg-amber-500 text-slate-950 hover:bg-amber-400`}>
                {business.hero.primaryCta}
              </a>
              <Link
                to="/checkout/inspection"
                className={`${anchorClass} border border-stone-600 bg-transparent text-white hover:border-stone-400 hover:bg-white/5`}
              >
                {business.hero.secondaryCta} — {usd(149)}
              </Link>
            </div>
            <p className="mt-4 text-sm text-stone-400">
              Prefer to talk first? Call{' '}
              <a href={business.phoneHref} className="font-semibold text-white hover:underline">
                {business.phone}
              </a>
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="text-lg font-semibold">Today’s flat-rate services</h2>
            <ul className="mt-4 space-y-3">
              {planList.map((plan) => (
                <li key={plan.key} className="flex items-center justify-between gap-4 rounded-xl bg-slate-800/70 p-4">
                  <div>
                    <p className="font-semibold text-white">{plan.name}</p>
                    <p className="text-sm text-stone-400">{plan.tagline}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-amber-400">{usd(plan.priceUsd)}</p>
                    <Link
                      to={plan.key === 'deposit' ? '/checkout/deposit' : plan.checkoutPath}
                      className="text-xs font-semibold text-stone-300 underline decoration-stone-500 underline-offset-2 hover:text-white"
                      onClick={() => {
                        if (plan.key === 'deposit') {
                          track('deposit_started', {
                            service_name: plan.name,
                            source_section: 'hero_plan_list',
                            city: business.city,
                            plan_type: 'deposit',
                          })
                        }
                      }}
                    >
                      Checkout →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-5 text-stone-400">
              Paid securely through Whop checkout. Final project balances are invoiced through Whop after the work is
              done.
            </p>
          </div>
        </div>
      </section>

      {/* ============ TRUST STRIP ============ */}
      <section aria-label="Why homeowners choose us" className="border-b border-stone-200 bg-white">
        <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-x-4 gap-y-3 px-4 py-6 text-sm font-medium text-stone-700 sm:grid-cols-4">
          {business.trustStrip.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span aria-hidden="true" className="text-amber-600">★</span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* ============ SERVICES ============ */}
      <section id="services" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-700">Services</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          Everything your roof needs, documented in writing
        </h2>
        <p className="mt-3 max-w-2xl text-stone-600">
          Tap a service to see what’s included. Every visit comes with photos, plain-English findings, and an itemized
          quote — no pressure, no mystery line items.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {business.services.map((service) => (
            <ServiceCard key={service.key} name={service.name} icon={service.icon} blurb={service.blurb} points={service.points} />
          ))}
        </div>
      </section>

      {/* ============ SERVICE AREA ============ */}
      <section id="service-area" className="scroll-mt-20 border-y border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-700">Service area</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Dallas and the surrounding Metroplex
          </h2>
          <p className="mt-3 max-w-2xl text-stone-600">
            Based in Dallas and working across North Texas. If your city isn’t listed, call {business.phone} — we can
            usually still help or point you to someone who can.
          </p>
          <ul className="mt-8 flex flex-wrap gap-2">
            {business.serviceAreas.map((area) => (
              <li
                key={area}
                className="rounded-full border border-stone-300 bg-stone-50 px-4 py-2 text-sm font-medium text-stone-700"
              >
                {area}, {business.state}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ FINANCING ============ */}
      <section id="financing" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-start">
            <span aria-hidden="true" className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500 text-2xl text-slate-950">
              ％
            </span>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">{business.financing.title}</h2>
              <p className="mt-3 max-w-3xl leading-7 text-stone-700">{business.financing.body}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <DepositLink className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-amber-600">
                  Start project deposit — {usd(500)}
                </DepositLink>
                <a
                  href={business.phoneHref}
                  className="inline-flex items-center justify-center rounded-xl border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-amber-600"
                >
                  Call {business.phone}
                </a>
              </div>
              <p className="mt-4 text-xs leading-5 text-stone-600">
                Deposit checkout is hosted by Whop. Where financing is offered, it is provided by Whop’s payment
                partners to eligible customers of approved merchants — terms are shown at checkout, never promised here.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ REVIEWS ============ */}
      <section id="reviews" className="scroll-mt-20 border-y border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-amber-700">Reviews</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
                What homeowners say
              </h2>
            </div>
            <p className="rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-800">
              {business.testimonialsLabel}
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {business.testimonials.map((t) => (
              <figure key={t.author} className="flex h-full flex-col rounded-2xl border border-stone-200 bg-stone-50 p-6 shadow-sm">
                <p aria-hidden="true" className="text-amber-500">★★★★★</p>
                <blockquote className="mt-3 flex-1 text-sm leading-6 text-stone-700">“{t.quote}”</blockquote>
                <figcaption className="mt-4 text-sm font-semibold text-stone-900">
                  {t.author}
                  <span className="block text-xs font-normal text-stone-500">{t.area}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-700">How it works</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          From first call to final balance
        </h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-4">
          {business.howItWorks.map((step) => (
            <li key={step.step} className="relative rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-900 text-sm font-bold text-amber-400">
                {step.step}
              </span>
              <h3 className="mt-4 font-semibold text-stone-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-stone-600">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ============ ESTIMATE FORM ============ */}
      <section id="estimate" className="scroll-mt-20 border-y border-stone-200 bg-slate-900 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">Free estimate</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Tell us about your roof — get real numbers back
            </h2>
            <p className="mt-4 max-w-md leading-7 text-stone-300">
              Fill this out once and we’ll follow up with a photo-documented estimate and honest advice about repair
              versus replacement. No obligation, no spam.
            </p>
            <dl className="mt-8 space-y-3 text-sm text-stone-300">
              <div className="flex gap-3">
                <dt className="font-semibold text-white">Phone</dt>
                <dd>
                  <a href={business.phoneHref} className="underline decoration-stone-500 underline-offset-2 hover:text-white">
                    {business.phone}
                  </a>
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="font-semibold text-white">Email</dt>
                <dd>{business.email}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="font-semibold text-white">Hours</dt>
                <dd>{business.hours}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-3xl bg-white p-6 text-stone-900 shadow-xl sm:p-8">
            <EstimateForm />
          </div>
        </div>
      </section>

      {/* ============ CONTACT ============ */}
      <section id="contact" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-700">Contact</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">{business.contact.title}</h2>
            <p className="mt-3 max-w-xl text-stone-600">{business.contact.body}</p>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <dt className="text-xs font-semibold uppercase tracking-wider text-stone-500">Service location</dt>
              <dd className="mt-1 text-lg font-bold text-slate-900">{business.serviceLocation}</dd>
            </div>
          </dl>
        </div>
      </section>
    </>
  )
}
