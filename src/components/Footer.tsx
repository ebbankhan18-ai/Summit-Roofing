import { business } from '#/config/business'
import { siteConfig } from '#/config/site-config'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-stone-800 bg-slate-900 text-stone-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <p className="flex items-center gap-2 text-lg font-bold text-white">
            <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-lg bg-slate-800 text-amber-400">
              ⛰
            </span>
            {business.name}
          </p>
          <p className="mt-3 max-w-xs text-sm leading-6">{business.tagline}. {business.serviceLocation}.</p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-400">Explore</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="hover:text-white focus-visible:outline-2 focus-visible:outline-amber-400">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-400">Contact</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href={business.phoneHref} className="font-semibold text-white hover:underline focus-visible:outline-2 focus-visible:outline-amber-400">
                {business.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${business.email}`} className="hover:text-white focus-visible:outline-2 focus-visible:outline-amber-400">
                {business.email}
              </a>
            </li>
            <li>{business.hours}</li>
            <li>{business.serviceLocation}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="mx-auto max-w-6xl space-y-3 px-4 py-6 text-xs leading-5 text-stone-400">
          <p className="rounded-lg bg-slate-800/60 p-3">{business.footerDisclosure}</p>
          <p>
            Payments are processed by Whop (merchant of record) over PCI-compliant infrastructure. This site never
            collects or stores card details. Prices in USD.
          </p>
          <p>© {year} {business.name} · Template demo content. Not a licensed roofing contractor advertisement.</p>
        </div>
      </div>
    </footer>
  )
}
