import { useState } from 'react'
import { SERVICE_OPTIONS, TIMELINE_OPTIONS, validateEstimate, type FieldErrors } from '#/lib/validation'
import { track } from '#/lib/track'
import { business } from '#/config/business'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  zip: '',
  service: '',
  timeline: '',
  message: '',
  consent: false,
}

const inputClass =
  'w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-amber-600 focus:outline-2 focus:outline-amber-600/40'

export function EstimateForm() {
  const [form, setForm] = useState(initialForm)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [serverError, setServerError] = useState<string | null>(null)

  const busy = status === 'submitting'

  function set<K extends keyof typeof initialForm>(key: K, value: (typeof initialForm)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setFieldErrors((e) => ({ ...e, [key]: undefined }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setServerError(null)

    // Client-side validation (the server re-validates everything).
    const parsed = validateEstimate({ ...form, consent: form.consent })
    if (!parsed.ok) {
      setFieldErrors(parsed.errors)
      setStatus('idle')
      return
    }

    setStatus('submitting')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.value),
      })
      const data: { ok?: boolean; leadId?: string; errors?: FieldErrors; error?: string } = await res.json().catch(() => ({}))

      if (res.ok && data.ok && data.leadId) {
        // Fire only after the lead actually exists on the Whop account.
        track('estimate_requested', {
          service_name: parsed.value.service,
          source_section: 'estimate_form',
          city: business.city,
          timeline: parsed.value.timeline,
        })
        setStatus('success')
        setForm(initialForm)
        setFieldErrors({})
        return
      }
      if (res.status === 429) {
        setServerError('Too many requests from this connection. Please wait a minute and try again, or call us.')
        setStatus('error')
        return
      }
      if (data.errors) {
        setFieldErrors(data.errors)
        setStatus('idle')
        return
      }
      setServerError(data.error ?? 'Something went wrong submitting your request. Please call us instead.')
      setStatus('error')
    } catch {
      setServerError('Network error — please check your connection and try again, or call us.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div role="status" className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-3xl" aria-hidden="true">✅</p>
        <h3 className="mt-2 text-lg font-semibold text-green-900">Request received</h3>
        <p className="mt-1 text-sm leading-6 text-green-800">
          Your estimate request is in — it landed in our Whop CRM as a lead and we will reach out shortly. Need us
          sooner? Call{' '}
          <a href={business.phoneHref} className="font-semibold underline focus-visible:outline-2 focus-visible:outline-green-700">
            {business.phone}
          </a>
          .
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-4 rounded-lg border border-green-300 px-4 py-2 text-sm font-semibold text-green-900 hover:bg-green-100 focus-visible:outline-2 focus-visible:outline-green-700"
        >
          Submit another request
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {status === 'error' && serverError && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {serverError}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="est-name" className="block text-sm font-medium text-stone-800">Full name</label>
          <input
            id="est-name" name="fullName" type="text" autoComplete="name" required
            className={inputClass} value={form.fullName} onChange={(e) => set('fullName', e.target.value)}
            aria-invalid={Boolean(fieldErrors.fullName)} aria-describedby={fieldErrors.fullName ? 'est-name-err' : undefined}
          />
          {fieldErrors.fullName && <p id="est-name-err" className="mt-1 text-xs font-medium text-red-700">{fieldErrors.fullName}</p>}
        </div>
        <div>
          <label htmlFor="est-email" className="block text-sm font-medium text-stone-800">Email</label>
          <input
            id="est-email" name="email" type="email" autoComplete="email" required
            className={inputClass} value={form.email} onChange={(e) => set('email', e.target.value)}
            aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? 'est-email-err' : undefined}
          />
          {fieldErrors.email && <p id="est-email-err" className="mt-1 text-xs font-medium text-red-700">{fieldErrors.email}</p>}
        </div>
        <div>
          <label htmlFor="est-phone" className="block text-sm font-medium text-stone-800">Phone</label>
          <input
            id="est-phone" name="phone" type="tel" autoComplete="tel" required
            className={inputClass} value={form.phone} onChange={(e) => set('phone', e.target.value)}
            aria-invalid={Boolean(fieldErrors.phone)} aria-describedby={fieldErrors.phone ? 'est-phone-err' : undefined}
          />
          {fieldErrors.phone && <p id="est-phone-err" className="mt-1 text-xs font-medium text-red-700">{fieldErrors.phone}</p>}
        </div>
        <div>
          <label htmlFor="est-zip" className="block text-sm font-medium text-stone-800">Dallas-area ZIP code</label>
          <input
            id="est-zip" name="zip" type="text" inputMode="numeric" autoComplete="postal-code" required maxLength={5}
            className={inputClass} value={form.zip} onChange={(e) => set('zip', e.target.value.replace(/\D/g, '').slice(0, 5))}
            aria-invalid={Boolean(fieldErrors.zip)} aria-describedby={fieldErrors.zip ? 'est-zip-err' : undefined}
          />
          {fieldErrors.zip && <p id="est-zip-err" className="mt-1 text-xs font-medium text-red-700">{fieldErrors.zip}</p>}
        </div>
        <div>
          <label htmlFor="est-service" className="block text-sm font-medium text-stone-800">Requested service</label>
          <select
            id="est-service" name="service" required
            className={inputClass} value={form.service} onChange={(e) => set('service', e.target.value)}
            aria-invalid={Boolean(fieldErrors.service)} aria-describedby={fieldErrors.service ? 'est-service-err' : undefined}
          >
            <option value="" disabled>Select a service…</option>
            {SERVICE_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {fieldErrors.service && <p id="est-service-err" className="mt-1 text-xs font-medium text-red-700">{fieldErrors.service}</p>}
        </div>
        <div>
          <label htmlFor="est-timeline" className="block text-sm font-medium text-stone-800">Preferred timeline</label>
          <select
            id="est-timeline" name="timeline" required
            className={inputClass} value={form.timeline} onChange={(e) => set('timeline', e.target.value)}
            aria-invalid={Boolean(fieldErrors.timeline)} aria-describedby={fieldErrors.timeline ? 'est-timeline-err' : undefined}
          >
            <option value="" disabled>When do you need this?</option>
            {TIMELINE_OPTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {fieldErrors.timeline && <p id="est-timeline-err" className="mt-1 text-xs font-medium text-red-700">{fieldErrors.timeline}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="est-message" className="block text-sm font-medium text-stone-800">
          Message <span className="font-normal text-stone-500">(optional)</span>
        </label>
        <textarea
          id="est-message" name="message" rows={4} maxLength={2000}
          className={inputClass} value={form.message} onChange={(e) => set('message', e.target.value)}
          placeholder="Roof age, visible damage, insurance claim, anything helpful…"
          aria-invalid={Boolean(fieldErrors.message)} aria-describedby={fieldErrors.message ? 'est-message-err' : undefined}
        />
        {fieldErrors.message && <p id="est-message-err" className="mt-1 text-xs font-medium text-red-700">{fieldErrors.message}</p>}
      </div>

      <div>
        <label htmlFor="est-consent" className="flex items-start gap-3 text-sm text-stone-700">
          <input
            id="est-consent" name="consent" type="checkbox" required
            className="mt-0.5 h-4 w-4 rounded border-stone-300 text-amber-600 focus:outline-2 focus:outline-amber-600"
            checked={form.consent} onChange={(e) => set('consent', e.target.checked)}
            aria-invalid={Boolean(fieldErrors.consent)} aria-describedby={fieldErrors.consent ? 'est-consent-err' : undefined}
          />
          <span>
            I agree to be contacted by {business.name} about my estimate by phone, email, or text. We never sell your
            information.
          </span>
        </label>
        {fieldErrors.consent && <p id="est-consent-err" className="mt-1 text-xs font-medium text-red-700">{fieldErrors.consent}</p>}
      </div>

      <button
        type="submit" disabled={busy}
        className="w-full rounded-xl bg-slate-900 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? 'Sending your request…' : 'Request my free estimate'}
      </button>
      <p className="text-center text-xs text-stone-500">
        Submitting creates a lead in the business owner’s Whop CRM. No payment is taken on this form.
      </p>
    </form>
  )
}
