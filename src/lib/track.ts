/**
 * Whop pixel tracking helper. The Whop pixel ships in every whop.site page
 * and exposes window.whop.track(). Page views and Whop checkout events are
 * tracked automatically; this module covers the funnel steps Whop cannot see
 * on its own (service views, lead submissions, deposit starts).
 */
export interface TrackProperties {
  service_name?: string
  source_section?: string
  city?: string
  plan_type?: string
  [key: string]: unknown
}

interface WhopPixel {
  track(name: string, payload?: Record<string, unknown>): void
}

function getWhopPixel(): WhopPixel | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { whop?: Partial<WhopPixel> }
  if (w.whop && typeof w.whop.track === 'function') {
    return { track: w.whop.track.bind(w.whop) }
  }
  return null
}

/** Strip undefined values so payloads stay clean in Whop reporting. */
function clean(props: TrackProperties): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) out[key] = value
  }
  return out
}

export function track(name: string, props: TrackProperties = {}): void {
  const payload = clean(props)
  const pixel = getWhopPixel()
  if (pixel) {
    pixel.track(name, payload)
  } else if (import.meta.env.DEV) {
    // Local dev without the hosted runtime: log instead of failing silently.
    console.info(`[whop.track] ${name}`, payload)
  }
}
