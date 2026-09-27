import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { siteConfig } from '#/config/site-config'

const { business } = siteConfig

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-stone-900" aria-label={`${business.name} home`}>
          <span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-lg bg-slate-900 text-lg text-amber-400">
            ⛰
          </span>
          <span className="leading-tight">
            {business.name}
            <span className="block text-xs font-medium text-stone-500">{business.tagline}</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 text-sm font-medium text-stone-700 lg:flex">
          {siteConfig.nav.map((item) => (
            <a key={item.href} href={item.href} className="transition hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-amber-600">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={business.phoneHref}
            className="hidden text-sm font-semibold text-stone-800 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-amber-600 md:block"
          >
            {business.phone}
          </a>
          <a
            href="/#estimate"
            className="hidden rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-amber-600 sm:block"
          >
            Free estimate
          </a>
          <button
            type="button"
            className="rounded-lg border border-stone-300 p-2 text-stone-700 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label="Toggle navigation menu"
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              {open ? (
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-stone-200 bg-white px-4 py-3 lg:hidden">
          <ul className="flex flex-col gap-1">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-100"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a href={business.phoneHref} className="block rounded-lg px-3 py-2 text-sm font-semibold text-stone-900 hover:bg-stone-100">
                Call {business.phone}
              </a>
            </li>
            <li>
              <a href="/#estimate" className="mt-1 block rounded-lg bg-slate-900 px-3 py-2 text-center text-sm font-semibold text-white" onClick={() => setOpen(false)}>
                Get my free estimate
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
