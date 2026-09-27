import { useCallback, useEffect, useMemo, useState } from 'react'

type Status = 'loading' | 'ready' | 'error'

interface DashboardLead {
  id: string
  createdAt: string
  converted: boolean
  productTitle: string | null
  fullName: string | null
  email: string | null
  phone: string | null
  zip: string | null
  service: string | null
  timeline: string | null
  message: string | null
  consent: boolean
  source: string | null
}

/**
 * Leads list for the Whop dashboard iframe. Fetches /api/dashboard/leads,
 * which Whop authenticates automatically via the injected user JWT — no
 * passwords or secrets involved on this surface.
 */
export function DashboardLeadsView() {
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState<string | null>(null)
  const [leads, setLeads] = useState<DashboardLead[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [query, setQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const res = await fetch('/api/dashboard/leads?first=50')
      const data = (await res.json()) as { ok?: boolean; leads?: DashboardLead[]; hasMore?: boolean; error?: string }
      if (!res.ok || !data.ok || !data.leads) {
        setError(data.error ?? 'Could not load leads. Make sure this app is installed on the account.')
        setStatus('error')
        return
      }
      setLeads(data.leads)
      setHasMore(Boolean(data.hasMore))
      setStatus('ready')
    } catch {
      setError('Network error loading leads.')
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return leads
    return leads.filter((lead) =>
      [lead.fullName, lead.email, lead.phone, lead.zip, lead.service].some((field) =>
        (field ?? '').toLowerCase().includes(q),
      ),
    )
  }, [leads, query])

  const fmt = (iso: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
    } catch {
      return iso
    }
  }

  if (status === 'error') {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        <p role="alert">{error}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-900 hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-red-600"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-600">
          {status === 'loading'
            ? 'Loading leads…'
            : `${filtered.length} lead${filtered.length === 1 ? '' : 's'}${hasMore ? ' (more in Whop CRM)' : ''} · newest first`}
        </p>
        <div className="flex gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by name, email, ZIP…"
            aria-label="Filter leads"
            className="w-52 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-600 focus:outline-2 focus:outline-amber-600/40"
          />
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-amber-600"
          >
            Refresh
          </button>
        </div>
      </div>

      {status === 'loading' ? (
        <div className="space-y-3" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-stone-100" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-600">
          No leads yet. Submissions from the website estimate form appear here instantly.
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((lead) => {
            const open = expandedId === lead.id
            return (
              <li key={lead.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-stone-900">
                      {lead.fullName ?? 'Unnamed lead'}{' '}
                      {lead.converted && (
                        <span className="ml-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                          converted
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-stone-500">{fmt(lead.createdAt)} · {lead.id}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {lead.service && (
                      <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                        {lead.service}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setExpandedId(open ? null : lead.id)}
                      aria-expanded={open}
                      className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-amber-600"
                    >
                      {open ? 'Hide details' : 'Details'}
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-stone-700">
                  {lead.email ?? 'no email'}
                  {lead.phone ? ` · ${lead.phone}` : ''}
                  {lead.zip ? ` · ${lead.zip}` : ''}
                </p>
                {open && (
                  <dl className="mt-3 grid gap-x-6 gap-y-2 border-t border-stone-100 pt-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-stone-500">Timeline</dt>
                      <dd className="text-stone-800">{lead.timeline ?? '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-stone-500">Consent to contact</dt>
                      <dd className="text-stone-800">{lead.consent ? 'Yes' : 'No'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-stone-500">Source</dt>
                      <dd className="text-stone-800">{lead.source ?? '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-stone-500">Product</dt>
                      <dd className="text-stone-800">{lead.productTitle ?? '—'}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-semibold uppercase tracking-wider text-stone-500">Message</dt>
                      <dd className="whitespace-pre-wrap text-stone-800">{lead.message || '—'}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-semibold uppercase tracking-wider text-stone-500">Quick contact</dt>
                      <dd className="flex flex-wrap gap-3">
                        {lead.phone && (
                          <a href={`tel:${lead.phone.replace(/[^\d+]/g, '')}`} className="font-semibold text-slate-900 underline">
                            Call
                          </a>
                        )}
                        {lead.email && (
                          <a href={`mailto:${lead.email}`} className="font-semibold text-slate-900 underline">
                            Email
                          </a>
                        )}
                      </dd>
                    </div>
                  </dl>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
