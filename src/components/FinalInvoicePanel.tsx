import { useCallback, useEffect, useState } from 'react'

interface InvoiceResult {
  ok: boolean
  invoiceId?: string
  status?: string
  payOnlineUrl?: string | null
  mode?: string
  error?: string
}

interface MemberOption {
  memberId: string
  membershipId: string
  name: string | null
  email: string | null
  status: string | null
  pricePaid: string | null
  joinedAt: string | null
}

/**
 * ADMIN EXAMPLE — create a final-balance invoice through the Whop Invoices
 * API (POST /api/admin/final-invoice). Requires the member ID of a customer
 * who has already paid the deposit (that's where the payment method was
 * saved), plus the remaining balance. Two collection modes:
 * - Auto-charge: Whop charges the card stored at deposit time off-session.
 * - Manual link: Whop emails the customer a pay-online invoice link.
 */
export function FinalInvoicePanel({ adminSecret }: { adminSecret: string }) {
  const [memberId, setMemberId] = useState('')
  const [emailAddress, setEmailAddress] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [amount, setAmount] = useState('')
  const [autoCharge, setAutoCharge] = useState(true)
  const [dueDate, setDueDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<InvoiceResult | null>(null)
  const [members, setMembers] = useState<MemberOption[]>([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [membersError, setMembersError] = useState<string | null>(null)
  const [selectedMembership, setSelectedMembership] = useState('')

  const loadMembers = useCallback(async () => {
    setMembersLoading(true)
    setMembersError(null)
    try {
      const res = await fetch('/api/admin/memberships?first=50', {
        headers: { 'x-admin-secret': adminSecret },
      })
      const data = (await res.json()) as { ok?: boolean; members?: MemberOption[]; error?: string }
      if (!res.ok || !data.ok || !data.members) {
        setMembersError(data.error ?? `Could not load customers (${res.status}).`)
        return
      }
      setMembers(data.members)
    } catch {
      setMembersError('Network error loading customers.')
    } finally {
      setMembersLoading(false)
    }
  }, [adminSecret])

  useEffect(() => {
    void loadMembers()
  }, [loadMembers])

  function applyMember(membershipId: string) {
    setSelectedMembership(membershipId)
    const m = members.find((x) => x.membershipId === membershipId)
    if (!m) return
    setMemberId(m.memberId)
    if (m.email) setEmailAddress(m.email)
    if (m.name) setCustomerName(m.name)
  }

  const valid =
    memberId.trim().startsWith('mber_') &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress.trim()) &&
    Number.isFinite(Number(amount)) &&
    Number(amount) >= 1 &&
    Number(amount) <= 100000

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid || submitting) return
    setSubmitting(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/final-invoice', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-admin-secret': adminSecret,
          'x-idempotency-key': crypto.randomUUID(),
        },
        body: JSON.stringify({
          memberId: memberId.trim(),
          emailAddress: emailAddress.trim(),
          customerName: customerName.trim() || undefined,
          amount: Number(amount),
          autoCharge,
          dueDate: dueDate || undefined,
        }),
      })
      const data = (await res.json()) as InvoiceResult
      setResult(data.ok ? data : { ok: false, error: data.error ?? `Request failed (${res.status}).` })
    } catch {
      setResult({ ok: false, error: 'Network error creating the invoice.' })
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls =
    'mt-1 w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-amber-600 focus:outline-2 focus:outline-amber-600/40'
  const labelCls = 'block text-sm font-medium text-stone-800'

  return (
    <section aria-labelledby="final-invoice-heading" className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <h2 id="final-invoice-heading" className="text-lg font-semibold text-stone-900">
        Final balance invoice
      </h2>
      <p className="mt-1 text-sm text-stone-600">
        Bill the remaining balance through the Whop Invoices API after the deposit is paid. Auto-charge uses the card the
        customer saved at deposit; manual mode emails them a secure pay-online link.
      </p>

      <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="fi-member-pick" className="text-sm font-semibold text-stone-800">
            Pick a customer <span className="font-normal text-stone-500">— auto-fills the form below</span>
          </label>
          <button
            type="button"
            onClick={() => void loadMembers()}
            disabled={membersLoading}
            className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-amber-600 disabled:opacity-60"
          >
            {membersLoading ? 'Loading…' : 'Refresh list'}
          </button>
        </div>
        {membersError && (
          <p role="alert" className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
            {membersError}
          </p>
        )}
        <select
          id="fi-member-pick"
          className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-amber-600 focus:outline-2 focus:outline-amber-600/40"
          value={selectedMembership}
          onChange={(e) => applyMember(e.target.value)}
        >
          <option value="">
            {membersLoading
              ? 'Loading customers…'
              : members.length === 0
                ? 'No memberships found on this product yet'
                : `${members.length} customer${members.length === 1 ? '' : 's'} — select one…`}
          </option>
          {members.map((m) => (
            <option key={m.membershipId} value={m.membershipId}>
              {m.name ?? m.email ?? m.memberId}
              {m.email && m.name ? ` — ${m.email}` : ''}
              {m.status ? ` (${m.status})` : ''}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-stone-500">
          Newest first, from the Whop Memberships API on this product. Picking one fills the member ID, email, and
          name; still set the balance yourself.
        </p>
      </div>

      <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="fi-member" className={labelCls}>
            Member ID
          </label>
          <input
            id="fi-member"
            className={inputCls}
            placeholder="mber_…"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            required
          />
          <p className="mt-1 text-xs text-stone-500">From the customer's membership after their deposit checkout.</p>
        </div>

        <div>
          <label htmlFor="fi-email" className={labelCls}>
            Customer email
          </label>
          <input
            id="fi-email"
            type="email"
            className={inputCls}
            placeholder="customer@example.com"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="fi-name" className={labelCls}>
            Customer name <span className="font-normal text-stone-500">(optional)</span>
          </label>
          <input id="fi-name" className={inputCls} value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        </div>

        <div>
          <label htmlFor="fi-amount" className={labelCls}>
            Balance due (USD)
          </label>
          <input
            id="fi-amount"
            type="number"
            min="1"
            max="100000"
            step="0.01"
            className={inputCls}
            placeholder="4351.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="fi-due" className={labelCls}>
            Due date <span className="font-normal text-stone-500">(optional)</span>
          </label>
          <input id="fi-due" type="date" className={inputCls} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>

        <fieldset className="sm:col-span-2">
          <legend className={labelCls}>Collection method</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm ${
                autoCharge ? 'border-amber-600 bg-amber-50' : 'border-stone-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="collection"
                checked={autoCharge}
                onChange={() => setAutoCharge(true)}
                className="mt-0.5 accent-amber-700"
              />
              <span>
                <span className="font-semibold text-stone-900">Auto-charge saved card</span>
                <span className="block text-xs text-stone-600">
                  Charges off-session automatically (charge_automatically).
                </span>
              </span>
            </label>
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm ${
                !autoCharge ? 'border-amber-600 bg-amber-50' : 'border-stone-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="collection"
                checked={!autoCharge}
                onChange={() => setAutoCharge(false)}
                className="mt-0.5 accent-amber-700"
              />
              <span>
                <span className="font-semibold text-stone-900">Email a payment link</span>
                <span className="block text-xs text-stone-600">Customer pays the invoice themselves (send_invoice).</span>
              </span>
            </label>
          </div>
        </fieldset>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={!valid || submitting}
            className="w-full rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-amber-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {submitting ? 'Creating invoice…' : 'Create final-balance invoice'}
          </button>
        </div>
      </form>

      {result && (
        <div
          role="status"
          className={`mt-5 rounded-xl border p-4 text-sm ${
            result.ok ? 'border-green-200 bg-green-50 text-green-900' : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {result.ok ? (
            <>
              <p className="font-semibold">
                Invoice {result.invoiceId} created ({result.mode}).
              </p>
              {result.payOnlineUrl && (
                <p className="mt-1 break-all">
                  Pay-online link:{' '}
                  <a href={result.payOnlineUrl} className="underline" target="_blank" rel="noreferrer">
                    {result.payOnlineUrl}
                  </a>
                </p>
              )}
              <p className="mt-1 text-xs opacity-80">Manage it in the Whop dashboard under Invoices.</p>
            </>
          ) : (
            <p>{result.error}</p>
          )}
        </div>
      )}
    </section>
  )
}
