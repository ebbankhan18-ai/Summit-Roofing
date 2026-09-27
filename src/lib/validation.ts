/** Shared client + server validation for the estimate request form. */
export const SERVICE_OPTIONS = [
  'Roof repair',
  'Roof replacement',
  'Roof inspection',
  'Emergency roof repair',
  'Storm / hail damage',
  'Not sure — need advice',
] as const

export const TIMELINE_OPTIONS = [
  'ASAP (emergency)',
  'Within 1 week',
  'Within 2–4 weeks',
  'Just planning / budgeting',
] as const

export type ServiceOption = (typeof SERVICE_OPTIONS)[number]
export type TimelineOption = (typeof TIMELINE_OPTIONS)[number]

export interface EstimateInput {
  fullName: string
  email: string
  phone: string
  zip: string
  service: string
  timeline: string
  message: string
  consent: boolean
}

export type FieldErrors = Partial<Record<keyof EstimateInput, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^[0-9+()\-.\s]{7,20}$/

export function validateEstimate(raw: unknown): { ok: true; value: EstimateInput } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {}
  const input = (raw ?? {}) as Record<string, unknown>

  const fullName = typeof input.fullName === 'string' ? input.fullName.trim() : ''
  if (!fullName) errors.fullName = 'Please enter your full name.'
  else if (fullName.length > 120) errors.fullName = 'Name is too long.'

  const email = typeof input.email === 'string' ? input.email.trim() : ''
  if (!email) errors.email = 'Please enter your email address.'
  else if (!EMAIL_RE.test(email)) errors.email = 'Please enter a valid email address.'

  const phone = typeof input.phone === 'string' ? input.phone.trim() : ''
  if (!phone) errors.phone = 'Please enter a phone number.'
  else if (!PHONE_RE.test(phone)) errors.phone = 'Please enter a valid phone number.'

  const zip = typeof input.zip === 'string' ? input.zip.trim() : ''
  if (!/^\d{5}$/.test(zip)) errors.zip = 'Enter a 5-digit ZIP code.'

  const service = typeof input.service === 'string' ? input.service.trim() : ''
  if (!SERVICE_OPTIONS.includes(service as ServiceOption)) errors.service = 'Please choose a service.'

  const timeline = typeof input.timeline === 'string' ? input.timeline.trim() : ''
  if (!TIMELINE_OPTIONS.includes(timeline as TimelineOption)) errors.timeline = 'Please choose a timeline.'

  const message = typeof input.message === 'string' ? input.message.trim() : ''
  if (message.length > 2000) errors.message = 'Message is too long (2,000 characters max).'

  const consent = input.consent === true
  if (!consent) errors.consent = 'Please agree to be contacted about your estimate.'

  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return { ok: true, value: { fullName, email, phone, zip, service, timeline, message, consent } }
}
