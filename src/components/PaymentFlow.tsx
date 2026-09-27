import { useState } from 'react'
import { loadWhop } from '@whop/elements'
import {
  WhopElements,
  Payments,
  usePayments,
  useWhop,
  PaymentElement,
  EmailElement,
  BrandingElement,
} from '@whop/elements-react'
import { business } from '#/config/business'

export type CheckoutPlanKey = 'inspection' | 'deposit' | 'emergency-repair'

export interface PaymentFlowProps {
  /** biz_ account (public information) — required by the Payments group. */
  accountId: string
  planId: string
  planKey: CheckoutPlanKey
  planName: string
  planPriceUsd: number
  /** Deposit flow: also store the payment method for the later final balance. */
  saveMethod: boolean
}

type Stage = 'collect' | 'confirming' | 'action' | 'done' | 'error'

/**
 * Whop Payments-group flow used by every checkout page (docs: Elements →
 * Payments). The elements collect the payment method in Whop-hosted
 * PCI-isolated frames; createConfirmationToken() tokenizes; the SERVER
 * confirms with the Whop API; WhopElements.payments.handleNextAction() runs
 * any 3DS step. No card inputs exist on this site.
 *
 * With saveMethod=true (deposit), the group mounts with
 * setupFutureUsage:"off_session" — Whop charges now AND stores the method
 * for the later final balance.
 */
export function PaymentFlow({ accountId, planId, planKey, planName, planPriceUsd, saveMethod }: PaymentFlowProps) {
  const origin = typeof window === 'undefined' ? '' : window.location.origin
  return (
    <WhopElements elements={loadWhop()} locale="en">
      <Payments
        accountId={accountId}
        plan={planId}
        mode="payment"
        setupFutureUsage={saveMethod ? 'off_session' : undefined}
        returnUrl={`${origin}/checkout/success?flow=${saveMethod ? 'deposit' : planKey}`}
        onLoadingChange={() => {}}
      >
        <PaymentInner planKey={planKey} planName={planName} planPriceUsd={planPriceUsd} saveMethod={saveMethod} />
      </Payments>
      <p className="mt-4 text-center text-xs text-stone-500">
        Whop acts as merchant of record and collects this payment over PCI-compliant infrastructure. Financing or
        extended payment options, where offered, appear for eligible customers of approved merchants at checkout —
        availability is decided at checkout, never promised here.
      </p>
    </WhopElements>
  )
}

function PaymentInner({ planKey, planName, planPriceUsd, saveMethod }: Omit<PaymentFlowProps, 'accountId' | 'planId'>) {
  const payments = usePayments()
  const whop = useWhop()
  const [stage, setStage] = useState<Stage>('collect')
  const [error, setError] = useState<string | null>(null)
  const busy = stage === 'confirming' || stage === 'action'

  async function handlePay() {
    if (!payments) return
    setError(null)
    setStage('confirming')
    try {
      // 1) Tokenize the buyer's selected method (mounted EmailElement
      //    supplies the email; the payment element collects billing details).
      const { confirmationToken } = await payments.createConfirmationToken({})

      // 2) Server-side confirmation — amount/plan are fixed by the server.
      const res = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmationToken, planKey }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        paymentId?: string
        status?: string
        clientSecret?: string | null
        error?: string
      }

      if (!res.ok || !data.ok) {
        setError(data.error ?? 'The payment could not be confirmed. Please try again or call us.')
        setStage('error')
        return
      }

      // 3) Whop may require a 3DS/issuer step — run it with the client secret.
      if (data.status === 'requires_action' && data.clientSecret && whop) {
        setStage('action')
        const action = await whop.payments.handleNextAction({ clientSecret: data.clientSecret })
        if (action.status === 'succeeded' || action.status === 'processing') {
          window.location.href = `/checkout/success?flow=${saveMethod ? 'deposit' : planKey}`
          setStage('done')
          return
        }
        setError('The bank did not finish the verification. No charge went through — please try again.')
        setStage('error')
        return
      }

      window.location.href = `/checkout/success?flow=${saveMethod ? 'deposit' : planKey}`
      setStage('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error starting the payment.')
      setStage('error')
    }
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-stone-900">
        {saveMethod ? 'Pay deposit & save payment method' : `Pay for ${planName}`}
      </h2>
      <p className="mt-1 text-sm text-stone-600">
        {business.name} will charge ${planPriceUsd} today
        {saveMethod ? ' and securely save your payment method with Whop for the final balance.' : '.'}
      </p>
      <div className="mt-4">
        <EmailElement />
      </div>
      <div className="mt-4">
        {/* Whop's hosted method tiles + fields — no card inputs on this site. */}
        <PaymentElement />
      </div>
      {/* Required beside any payment surface: the Powered-by-Whop notice. */}
      <div className="mt-4">
        <BrandingElement />
      </div>
      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={handlePay}
        disabled={busy}
        className="mt-6 w-full rounded-xl bg-slate-900 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {stage === 'action' ? 'Finish with your bank…' : busy ? 'Confirming…' : saveMethod ? 'Pay deposit' : `Pay $${planPriceUsd}`}
      </button>
      {saveMethod && (
        <p className="mt-3 text-center text-xs text-stone-500">
          By paying you authorize {business.shortName} to save this payment method with Whop for the final balance.
        </p>
      )}
    </div>
  )
}
