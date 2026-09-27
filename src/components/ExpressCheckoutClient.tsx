import { loadWhop } from '@whop/elements'
import { WhopElements, Checkout, ExpressCheckoutElement, BrandingElement } from '@whop/elements-react'

export interface ExpressCheckoutClientProps {
  planId: string
  planName: string
}

/**
 * Dedicated wallet-button surface (Apple Pay / Google Pay) per the Whop
 * Elements docs (Elements → Checkout → ExpressCheckoutElement): a checkout
 * handle mounts exactly ONE entry element, so this component mounts
 * ExpressCheckoutElement alone inside a Checkout group driven by the plan,
 * alongside the required BrandingElement. The element renders only wallets
 * the buyer's device can pay with and only on a verified payment-method
 * domain (whop.site pages are pre-approved; custom domains register through
 * the Payment Method Domains API). Where no wallet is available it renders
 * nothing — visitors use the full Payment/Checkout page instead.
 */
export function ExpressCheckoutClient({ planId, planName }: ExpressCheckoutClientProps) {
  const origin = typeof window === 'undefined' ? '' : window.location.origin
  return (
    <WhopElements elements={loadWhop()} locale="en">
      <Checkout plan={planId} returnUrl={`${origin}/checkout/success?flow=express`}>
        <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-sm">
          <h2 className="sr-only">{`Express checkout for ${planName}`}</h2>
          <p className="text-sm font-semibold text-stone-900">One-tap checkout</p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-stone-600">
            Pay with Apple Pay or Google Pay when your device offers it. Buttons below appear only where a wallet is
            available; otherwise use the full checkout page.
          </p>
          <div className="mt-4 flex min-h-12 items-center justify-center">
            <ExpressCheckoutElement />
          </div>
        </div>
        <BrandingElement />
      </Checkout>
    </WhopElements>
  )
}
