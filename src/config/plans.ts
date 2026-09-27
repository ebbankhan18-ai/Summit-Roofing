/**
 * SERVER-SIDE plan ID resolution. Plan IDs are account-specific, so they are
 * injected from environment variables (set via `whop apps secrets` or
 * .env.local during local testing). No account-specific ID is hardcoded.
 */
import type { PlanKey } from './site-config'

const SERVER_PLAN_IDS: Record<PlanKey, string | undefined> = {
  inspection: process.env.WHOP_INSPECTION_PLAN_ID,
  deposit: process.env.WHOP_DEPOSIT_PLAN_ID,
  'emergency-repair': process.env.WHOP_EMERGENCY_REPAIR_PLAN_ID,
}

export const SERVER_PRODUCT_ID: string | undefined = process.env.WHOP_PRODUCT_ID

export function getServerPlanId(key: PlanKey): string {
  const id = SERVER_PLAN_IDS[key]
  if (!id) {
    throw new Error(
      `Missing Whop plan ID for "${key}". Set WHOP_${key.replace(/-/g, '_').toUpperCase()}_PLAN_ID via app secrets.`,
    )
  }
  return id
}
