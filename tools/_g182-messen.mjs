// G-182: die Zahlen VOR und NACH der Aenderung, an der gerenderten
// Seite gemessen.
//
//   Punkt 2 — wie oft steht der Enhanced-Kasten je Reiter?
//   Punkt 5 — bei wie vielen Substanzen steht `[object Object]`?
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3200'
const KONTO = process.env.LUMEOS_KONTO ?? 'test-user@lumeos.local'
// Wie viele Substanzen durchgesehen werden — die Mythen liegen quer
// durch den Katalog, deshalb eine Stichprobe ueber die ganze Liste.
const ANZAHL = Number(process.env.LUMEOS_ANZAHL ?? 40)

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1100 } })
const seite = await ctx.newPage()

await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle', timeout: 60_000 })
await seite.fill('input[type=email]', KONTO)
await seite.fill('input[type=password]', wortFuer(KONTO))
await Promise.all([
  seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 60_000 }),
  seite.click('button[type=submit]'),
])

/** Alle Reiter einer offenen Tafel durchklicken und Text sammeln. */
async function alleReiter() {
  const namen = await seite.$$eval('.v2-supp-reiter-knopf',
    ks => ks.map(k => k.textContent.trim()))
  const aus = []
  if (namen.length === 0) {
    aus.push({ reiter: '(einer)', text: await seite.$eval('.v2-supp-tafel',
      e => (e.textContent ?? '').replace(/\s+/g, ' ')) })
    return aus
  }
  for (const n of namen) {
    await seite.locator('.v2-supp-reiter-knopf', { hasText: n.replace(/\d+$/, '') })
      .first().click().catch(() => {})
    await seite.waitForTimeout(320)
    aus.push({ reiter: n, text: await seite.$eval('.v2-supp-tafel',
      e => (e.textContent ?? '').replace(/\s+/g, ' ')) })
  }
  return aus
}

await seite.goto(`${BASIS}/v2/supplements?tab=database`,
  { waitUntil: 'networkidle', timeout: 90_000 })
await seite.waitForTimeout(2000)

const namen = await seite.$$eval('.v2-tbl tbody tr td:first-child div:first-child',
  ds => ds.map(d => d.textContent.trim()))

let mitObjekt = 0
let geprueft = 0
const objektNamen = []
const kastenJeSubstanz = []

// Gleichmaessig ueber die Liste verteilt, nicht nur die ersten N.
const schritt = Math.max(1, Math.floor(namen.length / ANZAHL))
for (let i = 0; i < namen.length && geprueft < ANZAHL; i += schritt) {
  const name = namen[i]
  await seite.goto(`${BASIS}/v2/supplements?tab=database`,
    { waitUntil: 'networkidle', timeout: 90_000 })
  await seite.waitForTimeout(900)
  const zeile = seite.locator(`.v2-tbl tbody tr:has-text("${name}")`).first()
  if (!await zeile.count()) continue
  await zeile.click()
  if (!await seite.waitForSelector('.v2-supp-tafel', { timeout: 15_000 })
    .catch(() => null)) continue
  await seite.waitForTimeout(500)

  const reiter = await alleReiter()
  geprueft += 1
  const hatObjekt = reiter.some(r => r.text.includes('[object Object]'))
  if (hatObjekt) { mitObjekt += 1; objektNamen.push(name) }
  const kasten = reiter.filter(r => r.text.includes('Was nicht zurückkommt')).length
  if (kasten > 0) kastenJeSubstanz.push({ name, kasten, reiter: reiter.length })
}

console.log(`\n=== ${geprueft} Substanzen durchgesehen ===`)
console.log(`Punkt 5 — mit [object Object]: ${mitObjekt}`)
if (objektNamen.length) console.log(`   ${objektNamen.slice(0, 8).join(' · ')}`)
console.log(`Punkt 2 — Enhanced-Kasten je Substanz:`)
for (const k of kastenJeSubstanz.slice(0, 6)) {
  console.log(`   ${k.name.padEnd(30)} auf ${k.kasten} von ${k.reiter} Reitern`)
}
if (kastenJeSubstanz.length === 0) console.log('   (keine Enhanced in der Stichprobe)')

await browser.close()
