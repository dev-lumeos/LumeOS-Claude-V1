// G-450/A7 — die vier Module unveraendert.
// `[read]` Recovery selbst ist NICHT darunter: es wurde geaendert.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const KONTO='dev@lumeos.app', BASIS='http://127.0.0.1:3200'
const MODULE=['/v2/nutrition','/v2/training','/v2/medical','/v2/goals','/v2/supplements']
const b = await chromium.launch({ headless: true })
const k = await b.newContext({ viewport: { width: 1600, height: 1100 } })
const s = await k.newPage()
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO); await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([s.waitForURL(u=>!u.pathname.includes('login')), s.click('button[type=submit]')])
}
const aus = {}
for (const m of MODULE) {
  const r = await s.goto(`${BASIS}${m}`, { waitUntil: 'networkidle' })
  await s.waitForTimeout(1500)
  aus[m] = { status: r?.status() ?? null, ...(await s.evaluate(() => ({
    zeichen: document.body.textContent?.length ?? 0,
    kacheln: document.querySelectorAll('.v2-card').length,
  }))) }
}
console.log(JSON.stringify(aus, null, 2))
await b.close()
