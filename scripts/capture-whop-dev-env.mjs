/**
 * Local-dev helper. `whop apps dev` injects a short-lived access token as
 * WHOP_API_KEY (plus WHOP_ACCOUNT_ID) into the npm process environment, but
 * the Cloudflare worker runtime reads env bindings from .env.local. This
 * script copies the injected token into .env.local so server routes work in
 * local dev. It never prints the value and only runs under `whop apps dev`;
 * a plain `npm run dev` exits silently. Restarting `whop apps dev` refreshes
 * the token.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

const key = process.env.WHOP_API_KEY
if (!key) {
  console.log('[capture] no injected WHOP_API_KEY — run this app via `whop apps dev`. Skipping.')
  process.exit(0)
}

const lines = existsSync('.env.local') ? readFileSync('.env.local', 'utf8').split('\n') : []
const filtered = lines.filter((l) => !l.startsWith('WHOP_API_KEY=') && l !== '')
filtered.push(`WHOP_API_KEY=${key}`)
writeFileSync('.env.local', filtered.join('\n') + '\n')
console.log(`[capture] refreshed local WHOP_API_KEY (short-lived dev token, expires soon)`)
