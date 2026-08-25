// Setzt den Erfahrungsgrad auf test-user — Hilfsschritt fuer die Bilder.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3200'
const LABEL = { beginner: 'Beginner', advanced: 'Advanced', pro: 'Pro', elite: 'Elite' }
const ziel = process.argv[2]

const browser = await chromium.launch()
const seite = await (await browser.newContext()).newPage()
await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle', timeout: 60_000 })
if (await seite.locator('input[type=email]').count()) {
  await seite.fill('input[type=email]', process.env.LUMEOS_KONTO ?? 'test-user@lumeos.local')
  await seite.fill('input[type=password]', wortFuer('test-user@lumeos.local'))
  await Promise.all([
    seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 60_000 }),
    seite.click('button[type=submit]'),
  ])
}
await seite.goto(`${BASIS}/v2/settings`, { waitUntil: 'networkidle', timeout: 60_000 })
await seite.waitForTimeout(900)
for (const l of Object.values(LABEL)) {
  const k = seite.locator(`button.v2-wahl:has(.v2-wahl-titel:text-is("${l}"))`)
  if (await k.getAttribute('data-on') === 'true') { await k.click(); await seite.waitForTimeout(200) }
}
if (ziel && LABEL[ziel]) {
  await seite.click(`button.v2-wahl:has(.v2-wahl-titel:text-is("${LABEL[ziel]}"))`)
  await seite.waitForTimeout(200)
}
const antwort = seite.waitForResponse(r =>
  r.url().includes('/api/profile') && r.request().method() === 'PUT')
await seite.click('button[type=submit]')
console.log(`Grad ${ziel ?? '(keiner)'} gesetzt -> PUT ${(await antwort).status()}`)
await browser.close()
