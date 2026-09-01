// G-310: der Plan-Reiter am Schirm, Kachel fuer Kachel.
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'

const KONTO = process.env.G310_KONTO ?? 'test-user@lumeos.local'
const BASIS = 'http://127.0.0.1:3200'
const browser = await chromium.launch()
const seite = await browser.newPage({ viewport: { width: 1500, height: 1600 } })
await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await seite.fill('input[type="email"]', KONTO)
await seite.fill('input[type="password"]', wortFuer(KONTO))
await seite.click('button[type="submit"]')
await seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })
await seite.goto(`${BASIS}/v2/nutrition?tab=plans`, { waitUntil: 'networkidle' })
await seite.waitForTimeout(2500)

const t = await seite.locator('body').innerText()

console.log('=== Kacheltitel: Attrappe vs. heute ===')
for (const [titel, quelle] of [
  ['Plan settings', 'Attrappe Z. 246'],
  ['7-day compliance', 'Attrappe Z. 301'],
  ['Lifecycle types', 'Attrappe Z. 274'],
  ["Today's ghost entries", 'Attrappe Z. 190'],
  ['Was du regelmäßig wechselst', 'G-309, von Tom bestellt'],
]) {
  console.log(`  ${titel.padEnd(30)} ${t.includes(titel) ? 'da  ' : 'FEHLT'} ${quelle}`)
}
console.log('\n=== Entfernt (durfte nicht bleiben) ===')
for (const [titel, warum] of [
  ['Planumfang', 'erfundener Titel'],
  ['Einhaltung', 'erfundener Titel'],
  ['Herkunft', 'Kachel je Spaltengruppe'],
  ['Next restart', 'Termin ohne Ausfuehrer'],
  ['Confirm mode', 'liegt an meal_plan_logs'],
  ['read-only while active', 'E-42'],
  ['Pause plan', 'E-42'],
]) {
  console.log(`  ${titel.padEnd(24)} ${t.includes(titel) ? 'NOCH DA' : 'weg    '} ${warum}`)
}
console.log('\n=== Die Compliance-Rechnung (Attrappe Z. 164) ===')
const m = t.match(/\([^)]*bestätigt[^)]*\)[^\n]*/)
console.log(`  ${m ? m[0].trim() : 'FEHLT'}`)
console.log('\n=== Die Badges (Mockup Z. 89) ===')
for (const b of ['Von Coach', 'Marketplace', 'AI erstellt']) {
  console.log(`  ${b.padEnd(14)} ${(t.match(new RegExp(b, 'g')) ?? []).length}x`)
}
console.log(`  self_created traegt keines: ${!t.includes('selbst erstellt') ? 'ja' : 'NEIN'}`)
console.log('\n=== Plan settings, Inhalt ===')
const ps = t.indexOf('Plan settings')
if (ps >= 0) console.log(t.slice(ps, ps + 240).split('\n').filter(Boolean).map(s => `  ${s}`).join('\n'))
console.log('\n=== 7-day compliance, Inhalt ===')
const sc = t.indexOf('7-day compliance')
if (sc >= 0) console.log(t.slice(sc, sc + 200).split('\n').filter(Boolean).map(s => `  ${s}`).join('\n'))

await seite.screenshot({ path: 'backup/g310-nachher.png', fullPage: false })
console.log('\nBild: backup/g310-nachher.png')
await browser.close()
