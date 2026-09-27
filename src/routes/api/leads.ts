import { createFileRoute } from '@tanstack/react-router'
import { getAccountId, whopApi, WhopApiError } from '#/lib/server/whop'
import { validateEstimate } from '#/lib/validation'

interface WhopLead {
  id: string
}

/** Tiny in-memory rate limiter per IP (best-effort; resets on deploy). */
const hits = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 5

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = hits.get(ip)
  if (!entry || entry.resetAt < now) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }
  entry.count += 1
  return entry.count > MAX_PER_WINDOW
}

export const Route = createFileRoute('/api/leads')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // ---- Parse + validate (shared validator, server is authoritative) ----
        let raw: unknown
        try {
          raw = await request.json()
        } catch {
          return Response.json({ error: 'Invalid JSON body.' }, { status: 400 })
        }

        const parsed = validateEstimate(raw)
        if (!parsed.ok) {
          return Response.json({ errors: parsed.errors }, { status: 422 })
        }

        // ---- Best-effort rate limiting ----
        const ip =
          request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
          request.headers.get('cf-connecting-ip') ??
          'unknown'
        if (rateLimited(ip)) {
          return Response.json({ error: 'Too many requests. Please wait a minute and try again.' }, { status: 429 })
        }

        // ---- Create the real Lead on the Whop account (Leads API) ----
        try {
          const value = parsed.value
          const lead = await whopApi<WhopLead>('/api/v1/leads', {
            method: 'POST',
            body: {
              account_id: getAccountId(),
              // Leads API requires a user when the caller authenticates as an
              // app/company. Leads are attributed to the account user below;
              // the prospect's details ride in the lead metadata (and the
              // business follows up from Whop's CRM).
              user_id: process.env.WHOP_LEAD_USER_ID || undefined,
              product_id: process.env.WHOP_PRODUCT_ID || undefined,
              // Non-sensitive funnel metadata. Email/phone ride on the lead via
              // the Whop user record; we never send card or payment data here.
              metadata: {
                source: 'estimate_form',
                full_name: value.fullName,
                email: value.email,
                phone: value.phone,
                zip: value.zip,
                requested_service: value.service,
                preferred_timeline: value.timeline,
                message: value.message.slice(0, 2000),
                consent_contact: 'true',
                site: 'summit-shield-roofing-template',
              },
            },
          })

          return Response.json({ ok: true, leadId: lead.id }, { status: 201 })
        } catch (err) {
          if (err instanceof WhopApiError) {
            // Distinguish client-fixable problems (validation/permission) from outages.
            const status = err.status === 401 || err.status === 403 ? 500 : 502
            console.error('[api/leads] Whop API error', err.status, err.code, err.message)
            return Response.json(
              { error: 'We could not record your request right now. Please call us — it helps us fix it faster.' },
              { status },
            )
          }
          console.error('[api/leads] unexpected error', err)
          return Response.json({ error: 'Unexpected server error. Please try again or call us.' }, { status: 500 })
        }
      },
    },
  },
})
