import { business } from './business'

export type PlanKey = 'inspection' | 'deposit' | 'emergency-repair'

export interface PlanConfig {
  key: PlanKey
  name: string
  priceUsd: number
  planType: 'inspection' | 'deposit' | 'emergency-repair'
  checkoutPath: string
  tagline: string
  description: string
  bullets: string[]
  primary: boolean
}

/** Prices and copy live here; the actual plan IDs come from environment variables. */
export const planConfigs: Record<PlanKey, PlanConfig> = {
  inspection: {
    key: 'inspection',
    name: 'Roof Inspection',
    priceUsd: 149,
    planType: 'inspection',
    checkoutPath: '/checkout/inspection',
    tagline: 'Flat rate · photo report included',
    description:
      'A 26-point roof inspection by a Summit Shield professional, with a photo report and written recommendations. Flat rate, no obligation.',
    bullets: ['26-point inspection', 'Photo report delivered fast', 'Applies to any repair work we quote'],
    primary: true,
  },
  deposit: {
    key: 'deposit',
    name: 'Project Deposit',
    priceUsd: 500,
    planType: 'deposit',
    checkoutPath: '/checkout/deposit',
    tagline: 'Reserves your project start date',
    description:
      'The deposit that locks in materials, crew, and your start date after you approve your written quote. Credited against the project total.',
    bullets: ['Locks your start date', 'Credited to the project total', 'Secure Whop checkout'],
    primary: false,
  },
  'emergency-repair': {
    key: 'emergency-repair',
    name: 'Emergency Roof Repair',
    priceUsd: 399,
    planType: 'emergency-repair',
    checkoutPath: '/checkout/emergency-repair',
    tagline: 'Flat-rate priority dispatch',
    description:
      'Flat-rate priority dispatch for active leaks and storm damage: tarping, temporary sealing, and same-day stabilization of the affected area.',
    bullets: ['Priority dispatch', 'Tarp & temporary sealing', 'Credited toward full repair'],
    primary: false,
  },
}

export const planList: PlanConfig[] = [planConfigs.inspection, planConfigs.deposit, planConfigs['emergency-repair']]

export function getPlanConfig(key: string): PlanConfig | undefined {
  return (planConfigs as Record<string, PlanConfig | undefined>)[key]
}

export const siteConfig = {
  business,
  nav: [
    { label: 'Services', href: '/#services' },
    { label: 'Service area', href: '/#service-area' },
    { label: 'Financing', href: '/#financing' },
    { label: 'Reviews', href: '/#reviews' },
    { label: 'Contact', href: '/#contact' },
  ],
  checkout: {
    successPath: '/checkout/success',
  },
} as const
