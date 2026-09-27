/**
 * Minimal server-only Whop REST client.
 * Calls go through WHOP_API_ORIGIN (set by the Whop runtime / `whop apps dev`),
 * whose outbound proxy attaches the app's API key server-side. The key never
 * enters this codebase, the browser, or a bundle.
 */
const API_ORIGIN = process.env.WHOP_API_ORIGIN ?? 'https://api.whop.com'

export class WhopApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message)
    this.name = 'WhopApiError'
  }
}

export async function whopApi<T>(
  path: string,
  init: { method?: string; body?: unknown; idempotencyKey?: string } = {},
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (init.idempotencyKey) headers['Idempotency-Key'] = init.idempotencyKey
  // Hosted runtime: the outbound proxy signs requests to WHOP_API_ORIGIN and
  // the key never reaches code. Local dev (`whop apps dev`): a short-lived
  // WHOP_API_KEY is injected as a normal env var, so we sign manually.
  const apiKey = process.env.WHOP_API_KEY
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`

  let res: Response
  try {
    res = await fetch(`${API_ORIGIN}${path}`, {
      method: init.method ?? 'GET',
      headers,
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    })
  } catch (err) {
    throw new WhopApiError(
      `Network error contacting the Whop API: ${err instanceof Error ? err.message : 'unknown error'}`,
      0,
    )
  }

  const text = await res.text()
  let json: unknown
  try {
    json = text ? JSON.parse(text) : undefined
  } catch {
    json = undefined
  }

  if (!res.ok) {
    const errObj = (json as { error?: { message?: string; type?: string; code?: string } } | undefined)?.error
    throw new WhopApiError(
      errObj?.message ?? `Whop API request failed with status ${res.status}`,
      res.status,
      errObj?.type ?? errObj?.code,
    )
  }
  return json as T
}

/** Resolve the biz_ account this app is hosted for. */
export function getAccountId(): string {
  const id = process.env.WHOP_ACCOUNT_ID ?? process.env.WHOP_COMPANY_ID
  if (!id) throw new WhopApiError('Missing WHOP_ACCOUNT_ID/WHOP_COMPANY_ID in the runtime environment.', 500)
  return id
}
