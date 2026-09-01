// G-311: die drei Sackgassen, jede einzeln geprueft.
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const BASIS = 'http://127.0.0.1:3200'
const b = await chromium.launch()
const s = await b.newPage({ viewport: { width: 1500, height: 1400 } })
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await s.fill('input[type="email"]', 'test-user@lumeos.local')
await s.fill('input[type="password"]', wortFuer('test-user@lumeos.local'))
await s.click('button[type="submit"]')
await s.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })
await s.goto(`${BASIS}/v2/nutrition?tab=planner`, { waitUntil: 'networkidle' })
await s.waitForTimeout(2200)

console.log('=== 3 · Die Rezepte-Auflistung ===')
const tabelle = await s.locator('th', { hasText: 'Kueche' }).count()
      + await s.locator('th', { hasText: 'Küche' }).count()
console.log(`  Tabelle mit Spalte "Kueche": ${tabelle > 0 ? 'NOCH DA' : 'weg'}`)

console.log('\n=== 1 · Der Werkbank-Sprung ===')
const vorher = await s.locator('body').innerText()
const nameVorher = (vorher.match(/G-310 [^\n·]+/) ?? ['?'])[0].trim()
console.log(`  Raster zeigt vorher: ${nameVorher}`)
const knopf = s.getByRole('button', { name: 'Bearbeiten' })
const n = await knopf.count()
console.log(`  Bearbeiten-Knoepfe: ${n}`)
if (n > 0) {
  await knopf.first().click()
  await s.waitForTimeout(2500)
  console.log(`  URL danach: ${new URL(s.url()).search}`)
  const nachher = await s.locator('body').innerText()
  console.log(`  "In der Werkbank": ${nachher.includes('In der Werkbank') ? 'da' : 'fehlt'}`)
  const nameNachher = (nachher.match(/Wochen[\s\S]{0,80}?G-310 [^\n·]+/) ?? ['?'])[0]
  console.log(`  Raster zeigt nachher: ${nameNachher.split('\n').pop()?.trim()}`)
}

console.log('\n=== 2 · Ein Rezept im Raster oeffnen ===')
const rezeptKnopf = s.locator('button[aria-label$="— Zutaten"]')
const r = await rezeptKnopf.count()
console.log(`  klickbare Rezepte im Raster: ${r}`)
if (r > 0) {
  const label = await rezeptKnopf.first().getAttribute('aria-label')
  await rezeptKnopf.first().click()
  await s.waitForTimeout(600)
  console.log(`  geklickt: ${label}`)
  console.log(`  aria-expanded: ${await rezeptKnopf.first().getAttribute('aria-expanded')}`)
  const auf = await s.locator('body').innerText()
  console.log('  Zutaten sichtbar:')
  for (const z of ['Grillh', 'Reis', 'Broccoli', 'Brokkoli', 'Zutaten']) {
    if (auf.includes(z)) console.log(`    ${z}`)
  }
}
await s.screenshot({ path: 'backup/g311-nachher.png', fullPage: false })
console.log('\nBild: backup/g311-nachher.png')
await b.close()
