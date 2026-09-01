import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const b = await chromium.launch()
const s = await b.newPage({ viewport: { width: 1440, height: 1800 } })
await s.goto('http://127.0.0.1:3200/login', { waitUntil: 'networkidle' })
await s.fill('input[type="email"]', 'dev@lumeos.app')
await s.fill('input[type="password"]', wortFuer('dev@lumeos.app'))
await s.click('button[type="submit"]')
await s.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })
await s.goto('http://127.0.0.1:3200/v2/nutrition?tab=planner', { waitUntil: 'networkidle' })
await s.waitForTimeout(2500)

const vorher = new URL(s.url()).searchParams.get('plan')
const akt = s.getByRole('button', { name: 'Aktivieren' })
console.log(`Aktivieren-Knoepfe: ${await akt.count()}`)
await akt.first().click()
await s.waitForTimeout(1200)
const nachher = new URL(s.url()).searchParams.get('plan')
const t = await s.locator('body').innerText()
console.log(`  plan vorher:  ${vorher}`)
console.log(`  plan nachher: ${nachher}`)
console.log(`  Kachel mit angewaehlt: ${vorher !== nachher ? 'JA — Durchschlag!' : 'nein'}`)
console.log(`  Frage offen: ${t.includes('Plan aktivieren') ? 'ja' : 'NEIN'}`)
// Abbrechen darf ebenfalls nicht durchschlagen.
const ab = s.getByRole('button', { name: 'Abbrechen' })
if (await ab.count()) {
  await ab.first().click()
  await s.waitForTimeout(900)
  const n2 = new URL(s.url()).searchParams.get('plan')
  console.log(`  nach Abbrechen: ${n2} — ${n2 !== nachher ? 'DURCHSCHLAG' : 'nein'}`)
}
await b.close()
