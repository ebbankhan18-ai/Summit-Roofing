import { useCallback, useEffect, useMemo, useState } from 'react'
import { business } from '#/config/business'

type Status = 'gate' | 'loading' | 'ready' | 'error'

interface AdminLead {
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

const STORAGE_KEY = 'ssr_admin_secret'

/** Client-side convenience only — the server enforces the real gate. */
function readStoredSecret(): string {
  try {
    return sessionStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

export function AdminLeadsPanel() {
  const [secret, setSecret] = useState('')
  const [status, setStatus] = useState<Status>('gate')
  const [error, setError] = useState<string | null>(null)
  const [leads, setLeads] = useState<AdminLead[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [query, setQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const load = useCallback(async (candidate: string) => {
    setStatus('loading')
    setError(null)
    try {
      const res = await fetch('/api/admin/leads?first=50', {
        headers: { 'x-admin-secret': candidate },
      })
      if (res.status === 404) {
        setError('Incorrect admin password (or the server secret is not configured).')
        setStatus('gate')
        return
      }
      if (res.status === 403) {
        setError('Server credential lacks lead read permission. Check the app permissions in the Whop dashboard.')
        setStatus('error')
        return
      }
      const data = (await res.json()) as { ok?: boolean; leads?: AdminLead[]; hasMore?: boolean; error?: string }
      if (!res.ok || !data.ok || !data.leads) {
        setError(data.error ?? 'Could not load leads.')
        setStatus('error')
        return
      }
      setLeads(data.leads)
      setHasMore(Boolean(data.hasMore))
      setStatus('ready')
      try {
        sessionStorage.setItem(STORAGE_KEY, candidate)
      } catch {
        /* private mode etc. — non-fatal */
      }
    } catch {
      setError('Network error loading leads. Check your connection and retry.')
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    const stored = readStoredSecret()
    if (stored) {
      setSecret(stored)
      void load(stored)
    }
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

  if (status === 'gate' || status === 'loading') {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void load(secret)
        }}
        className="mx-auto max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-stone-900">Team admin sign-in</h2>
        <p className="mt-1 text-sm text-stone-600">
          Enter the admin secret to view recent estimate leads. (Same INVOICE_ADMIN_SECRET the server uses.)
        </p>
        <label htmlFor="admin-secret" className="mt-5 block text-sm font-medium text-stone-800">
          Admin secret
        </label>
        <input
          id="admin-secret"
          type="password"
          autoComplete="current-password"
          className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-amber-600 focus:outline-2 focus:outline-amber-600/40"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          aria-describedby="admin-secret-note"
        />
        <p id="admin-secret-note" className="mt-1 text-xs text-stone-500">
          Sent only over HTTPS to this site's own server; stored for this tab session only.
        </p>
        {error && (
          <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={status === 'loading' || !secret}
          className="mt-5 w-full rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'loading' ? 'Checking…' : 'View leads'}
        </button>
      </form>
    )
  }

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <p role="alert" className="text-sm text-red-800">{error}</p>
        <button
          type="button"
          onClick={() => void load(secret)}
          className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-900 hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-red-600"
        >
          Retry
        </button>
      </div>
    )
  }

  const fmt = (iso: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
    } catch {
      return iso
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-600">
          {filtered.length} lead{filtered.length === 1 ? '' : 's'}{hasMore ? ' (more available on Whop)' : ''} · newest
          first
        </p>
        <div className="flex gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by name, email, ZIP…"
            aria-label="Filter leads"
            className="w-56 rounded-lg border border-stone-300 px-3 py-2 text-sm shadow-sm focus:border-amber-600 focus:outline-2 focus:outline-amber-600/40"
          />
          <button
            type="button"
            onClick={() => void load(secret)}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-amber-600"
          >
            Refresh
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-600">
          No leads yet. Submit the estimate form on the homepage to see one appear here.
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
                    <p className="text-xs text-stone-500">
                      {fmt(lead.createdAt)} · {lead.id}
                    </p>
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
                          <a href={`tel:${lead.phone.replace(/[^\d+]/g, '')}`} className="font-semibold text-slate-900 underline focus-visible:outline-2 focus-visible:outline-amber-600">
                            Call
                          </a>
                        )}
                        {lead.email && (
                          <a href={`mailto:${lead.email}`} className="font-semibold text-slate-900 underline focus-visible:outline-2 focus-visible:outline-amber-600">
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

      <p className="text-center text-xs text-stone-500">
        Served from the Whop Leads API on every load. {business.name} internal tooling — do not share this URL.
      </p>
    </div>
  )
}
