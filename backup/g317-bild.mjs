// G-317: das Nachweisbild — drei Statusfarben gleichzeitig.
// `[read]` NUR LESEN: kein Klick auf einen Schreibknopf (dev!).
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const KONTO = process.env.G317_KONTO ?? 'dev@lumeos.app'
const b = await chromium.launch()
const s = await b.newPage({ viewport: { width: 1440, height: 1700 } })
await s.goto('http://127.0.0.1:3200/login', { waitUntil: 'networkidle' })
await s.fill('input[type="email"]', KONTO)
await s.fill('input[type="password"]', wortFuer(KONTO))
await s.click('button[type="submit"]')
await s.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })
// Der Tag mit allen drei Zustaenden: 27.8. skipped, 28.8. confirmed,
// 29.8. deviated — der Reiter zeigt HEUTE, also den Zeitraum lesen.
await s.goto('http://127.0.0.1:3200/v2/nutrition?tab=plans', { waitUntil: 'networkidle' })
await s.waitForTimeout(2600)
const t = await s.locator('body').innerText()
const pillen = s.locator('.v2-pill')
const farben = new Map()
for (let i = 0; i < await pillen.count(); i++) {
  const p = pillen.nth(i)
  const txt = (await p.innerText()).trim()
  if (!['bestätigt', 'abgewichen', 'ausgelassen', 'offen'].includes(txt)) continue
  if (!farben.has(txt)) farben.set(txt, await p.evaluate(x => getComputedStyle(x).color))
}
console.log('Statuspillen am Schirm:')
for (const [k, v] of farben) console.log(`  ${k.padEnd(12)} ${v}`)
console.log(`verschiedene Farben: ${new Set(farben.values()).size} von ${farben.size}`)
await s.screenshot({ path: process.env.G317_BILD ?? 'backup/g317-nachher-voll.png', fullPage: false })
console.log('\nBild: backup/g317-nachher-voll.png')
await b.close()
