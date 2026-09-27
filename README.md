# Summit Shield Roofing — Whop Website Template

A production-ready, reusable roofing-business website template built on **Whop Websites**
(TanStack Start + React 19 + TypeScript + Tailwind CSS 4), deployed through the Whop CLI
to a `*.whop.site` URL. All payments run through **Whop Payments** (Payment/Checkout
Elements, Express Checkout, Setup Intents/card-on-file, Invoices API). Estimate requests
create **real Whop Leads**. All business data lives in one config module for easy rebranding.

> **Template disclosure:** testimonials, statistics, and business claims in this template
> are illustrative sample content, clearly labeled on the site. Replace everything in
> `src/config/business.ts` before launching for a real company.

---

## 1. What's inside

```
src/
  config/
    business.ts        ← ALL business copy, plans pricing, areas, testimonials (REBRAND HERE)
    site-config.ts     ← plan catalog + nav
    plans.ts           ← server-side plan-ID resolution from env vars
  components/
    Header.tsx Footer.tsx ServiceCard.tsx EstimateForm.tsx
    PaymentFlow.tsx          ← Whop Payments group (PaymentElement + EmailElement + BrandingElement)
    ExpressCheckoutClient.tsx← Whop Checkout group with ExpressCheckoutElement (Apple/Google Pay)
  routes/
    index.tsx                ← homepage (hero, trust, services, area, financing, reviews,
                               how-it-works, estimate form, contact)
    checkout/inspection.tsx  ← $149 Roof Inspection checkout
    checkout/deposit.tsx     ← $500 deposit checkout (charges AND saves the payment method)
    checkout/emergency-repair.tsx ← $399 flat-rate emergency repair checkout
    checkout/express.tsx     ← ExpressCheckoutElement (wallet buttons) page
    checkout/success.tsx     ← confirmation page
    admin/leads.tsx          ← password-protected team page listing recent leads
    api/leads.ts             ← POST → real Whop Lead (server-side, validated, rate-limited)
    api/payments/confirm.ts  ← POST → server-side payment confirmation via Whop API
    api/admin/final-invoice.ts ← POST → Whop Invoices API (admin-secret protected)
  lib/
    track.ts           ← whop.track() helper (service_viewed, estimate_requested, deposit_started)
    validation.ts      ← shared client+server validation
    server/whop.ts     ← minimal server-only Whop REST client
```

## 2. Requirements

- Node 20+ and npm
- Whop CLI (`npm i -g @whop/cli` or bundled), logged in: `whop login`
- A Whop business account (this template was built against `biz_SicRXVUA2dIhum`)

## 3. One-time setup

### 3.1 App, product, and plans (already done for the demo account)

Re-create on a fresh account with:

```bash
whop apps init --app_type website --name "Summit Shield Roofing" --route your-route
cd your-route && npm install

# Product + three one-time plans
whop products create --account_id biz_XXX --title "Summit Shield Roofing Services" --description "..."
whop plans create --account_id biz_XXX --product_id prod_XXX --title "Roof Inspection" \
  --initial_price 149 --currency usd --plan_type one_time
whop plans create --account_id biz_XXX --product_id prod_XXX --title "Project Deposit" \
  --initial_price 500 --currency usd --plan_type one_time
whop plans create --account_id biz_XXX --product_id prod_XXX --title "Emergency Roof Repair" \
  --initial_price 399 --currency usd --plan_type one_time
```

(The dashboard equivalent: Whop Dashboard → your business → Products → create product →
add three **one-time** plans at $149 / $500 / $399.)

### 3.2 App permissions / scopes

The app requests these scopes (dashboard → your app → Permissions, or
`whop apps permissions <app_id>` with an API-key login):

- `lead:manage` — create leads from the estimate form
- `member:basic:read`, `member:email:read`, `access_pass:basic:read` — required alongside
  lead creation per the Leads API docs
- `invoice:create` — final-balance invoices
- `payment:basic:read`, `payment:setup_intent:read` — payment/setup-intent reads

### 3.3 App secrets

```bash
whop apps secrets set \
  --secret WHOP_PRODUCT_ID=prod_xxx \
  --secret WHOP_INSPECTION_PLAN_ID=plan_xxx \
  --secret WHOP_DEPOSIT_PLAN_ID=plan_xxx \
  --secret WHOP_EMERGENCY_REPAIR_PLAN_ID=plan_xxx \
  --secret WHOP_COMPANY_ID=biz_xxx \
  --secret WHOP_LEAD_USER_ID=user_xxx \
  --secret INVOICE_ADMIN_SECRET=<long random string>
```

- `WHOP_LEAD_USER_ID` — the user_ ID leads are attributed to. The Leads API requires a
  `user_id` when the caller authenticates as an app/company; use the business owner's
  user ID (`whop auth status` → identity.id). Prospect details ride in lead metadata.
- `INVOICE_ADMIN_SECRET` — protects `POST /api/admin/final-invoice`. Generate with
  `node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"`.

### 3.4 Environment files

`.env.example` lists every variable name (no values). Locally, `.env.local`
(gitignored) holds non-secret identifiers; `whop apps dev` injects a short-lived
`WHOP_API_KEY` automatically — never paste real secret keys into `.env.local`.

## 4. Local development & testing

```bash
whop apps dev        # from the project folder; serves http://localhost:3000
```

- `whop apps dev` injects a temporary `WHOP_API_KEY` and your app secrets. The bundled
  `scripts/capture-whop-dev-env.mjs` (wired into `npm run dev`) copies the injected
  token into `.env.local` so the Cloudflare worker runtime sees it. Restarting
  `whop apps dev` refreshes the token.
- `npm run typecheck` — TypeScript, no errors
- `npm run build` — production build + Whop archive (`dist/whop-build.zip`)

Smoke tests used during development (all verified locally):

| Check | Expectation |
| --- | --- |
| `GET /`, `/checkout/inspection`, `/checkout/deposit`, `/checkout/emergency-repair`, `/checkout/express`, `/checkout/success` | HTTP 200 |
| `POST /api/leads` with valid JSON | HTTP 201 `{"ok":true,"leadId":"lead_…"}` (real lead) |
| `POST /api/leads` with invalid JSON | HTTP 422 with per-field errors |
| `POST /api/admin/final-invoice` without `x-admin-secret` | HTTP 404 (existence hidden) |
| `POST /api/admin/final-invoice` with secret (`saveAsDraft:true`) | HTTP 201 `{"invoiceId":"inv_…",…}` |

## 5. Whop sandbox / test checkout

Sandbox targeting (elements `environment: "sandbox"` / sandbox API) is not generally
available yet, so the demo runs against the live API with Whop's own test payment
options where the account offers them (e.g. `demo_pay`), or a real card refunded after.

1. Start `whop apps dev` and open `http://localhost:3000/checkout/inspection`.
2. Fill the Whop-hosted email + payment element (no card fields exist on this site).
3. Complete the purchase; the Whop receipt/confirmation lands at `/checkout/success`.
4. Verify in **Whop Dashboard → Payments** that the $149 payment exists.

To make Whop show a sandbox-style "demo pay" method at checkout, enable it for the
account/plan in the dashboard (payment methods), or leave it off for a production site.

## 6. Verifying a created lead

1. Submit the estimate form on `/` (or `curl` the endpoint — see smoke tests above).
2. **Whop Dashboard → your business → CRM/Leads** (or People): a new lead appears with
   metadata: `full_name`, `email`, `phone`, `zip`, `requested_service`,
   `preferred_timeline`, `message`, `consent_contact`, `source: estimate_form`.
3. CLI alternative: leads are also visible via `whop waitlist-entries` / dashboard
   filtering by product "Summit Shield Roofing Services".
4. The form shows the green success state ONLY after Whop returned a real `lead_…` id —
   it never fakes success.

## 6.1 Team leads page (no dashboard needed)

`/admin/leads` on the live site is a password-protected internal page listing the
newest estimate leads straight from the Whop Leads API (name, email, phone, ZIP,
service, timeline, message, consent, conversion status), with filtering and a
call/email quick-contact. A **Billing tools** section on the same page opens a
final-balance invoice creator (`FinalInvoicePanel`) so team members can bill the
remaining balance through the Whop Invoices API — auto-charge the card saved at
deposit, or email a manual-pay link — without touching curl. A **member picker**
in the panel lists recent memberships on the product via the secret-protected
`GET /api/admin/memberships` (Whop Memberships API, newest first) and auto-fills
the member ID, email, and name on selection; the balance is entered manually. The password is the same `INVOICE_ADMIN_SECRET` app
secret; the server rejects anything else with a 404 and never serves lead data
unauthenticated. The page is `noindex, nofollow`. To rotate the password, update
the `INVOICE_ADMIN_SECRET` app secret and restart/redeploy.

## 7. Tracking events (whop.track)

The Whop pixel ships on every whop.site page; page views and Whop checkout events are
tracked automatically. This template adds three custom events:

| Event | Fired when | Where in code |
| --- | --- | --- |
| `service_viewed` | A visitor expands a service card | `ServiceCard.tsx` `onToggle` |
| `estimate_requested` | AFTER the Leads API returns success | `EstimateForm.tsx` success path |
| `deposit_started` | Immediately BEFORE deposit checkout begins | homepage `DepositLink` onClick (financing section + hero plan list) |

Properties are non-sensitive only: `service_name`, `source_section`, `city`,
`plan_type` (plus `timeline` on estimate_requested). No names, emails, phones,
addresses, or payment data are ever tracked.

**Verify:** open the site, perform each action, then check
**Whop Dashboard → Websites → (your site) → Events / pixel dashboard** — events appear
within about a minute. `deposit_started` fires on click, before the checkout page loads;
checkout/purchase events appear automatically from Whop's own pixel once payment completes.

## 8. Deposit → job → final balance flow (Whop end-to-end)

1. **Lead** — estimate form → `POST /api/leads` → Whop Leads API (verified above).
2. **Inspection** — `/checkout/inspection` → Whop Payment element → `POST /api/payments/confirm`
   (server-side confirm of the `ctok_` token against the $149 plan) → success page.
3. **Deposit + card-on-file** — `/checkout/deposit` mounts the Whop Payments group with
   `setupFutureUsage: "off_session"`: Whop charges the $500 deposit AND stores the
   payment method for later off-session use in one compliant flow (no card data ever
   touches this site; no custom card form).
4. **Final balance after the job** — two ways to invoke the same server-only,
   admin-secret protected `POST /api/admin/final-invoice` (Whop Invoices API,
   both documented modes):
   - **UI:** sign in at `/admin/leads` → *Billing tools* → *Create final-balance
     invoice* → pick the customer (auto-fills member ID, email, name), enter the
     amount, and choose the collection method.
   - **API:** direct POST as below.
   - `collection_method: "charge_automatically"` → charges the stored payment method
   - `collection_method: "send_invoice"` → emails a manual-pay invoice link

Example (run from the project folder; header value = your INVOICE_ADMIN_SECRET):

```bash
# Member path (customer has a membership - e.g. picked in the admin UI):
curl -X POST http://localhost:3000/api/admin/final-invoice \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: $INVOICE_ADMIN_SECRET" \
  -d '{"memberId":"mber_xxx","amount":2450,"autoCharge":true,"saveAsDraft":true}'

# Guest path (no membership yet - invoice by email instead):
curl -X POST http://localhost:3000/api/admin/final-invoice \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: $INVOICE_ADMIN_SECRET" \
  -d '{"amount":2450,"emailAddress":"customer@example.com","customerName":"Customer Name","autoCharge":false}'
```

- `memberId` — the paying member (pick them in the admin UI, or find in Whop Dashboard → People).
  The Whop Invoices API accepts **either** `memberId` **or** `emailAddress`, never both: with a
  `memberId` the email is ignored (member path); without one, a valid `emailAddress` is required (guest path).
- `saveAsDraft: true` creates a reviewable draft; set `false` to finalize immediately.
- `autoCharge: false` sends the manual-pay invoice instead of auto-charging.
- Both modes verified locally against the real API (real draft invoices `inv_…` were created; drafts are uncharged and can be discarded in the Whop dashboard).

**Security:** the endpoint 404s without the exact `x-admin-secret` header, is server-only,
and never returns the secret. Do not expose it through any public admin UI without adding
real authentication.

## 9. Deployment

```bash
whop apps deploy            # build + typecheck + upload + promote → LIVE
whop apps deploy --preview  # upload without promoting
whop apps logs app_XXX      # watch runtime logs (7-day retention)
```

Live URL after deploy: **https://summit-shield-roofing-3f7f.whop.site**
(from `whop apps get app_ZFv6eBEy99bUx9` → hosted_url).

## 10. Rebranding for another roofing company

1. Edit `src/config/business.ts` — name, tagline, phone, email, hours, service areas,
   testimonials, financing copy, disclosures. Every section of the site renders from it.
2. Edit `src/config/site-config.ts` — plan names/prices/copy and nav labels if needed.
3. Set new plan/product/secret env values (see 3.3).
4. `whop apps update app_XXX --name "New Name"` + dashboard branding.
5. Rebuild/deploy. No structural code changes required.

## 11. Security notes

- No Whop secret keys are in any client bundle; browser code only ever receives
  plan IDs (public) and the biz_ account id (public).
- The server confirms payments; the client cannot set amounts or plans.
- `.env.local` and `whop-build.zip` are gitignored; `.env.example` has names only.
- No git repository was initialized and nothing was pushed anywhere.
