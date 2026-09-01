// G-306/E-42: die feine Sperre durch die OBERFLAECHE.
//
// **Die Nachweiszeilen des Auftrags:**
//   nicht geloggte Position  aenderbar am aktiven Plan
//   geloggte Position        409
//   Zukunftstag              aenderbar
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'

const KONTO = process.env.LUMEOS_KONTO ?? 'test-user@lumeos.local'
const BASIS = 'http://127.0.0.1:3200'

const browser = await chromium.launch()
const seite = await browser.newPage({ viewport: { width: 1500, height: 1500 } })
const fehler = []
seite.on('console', m => { if (m.type() === 'error') fehler.push(m.text()) })

await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await seite.fill('input[type="email"]', KONTO)
await seite.fill('input[type="password"]', wortFuer(KONTO))
await seite.click('button[type="submit"]')
await seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })
await seite.goto(`${BASIS}/v2/nutrition?tab=planner`, { waitUntil: 'networkidle' })
await seite.waitForTimeout(1300)

// Die drei Positions-Ids kommen von aussen — mit erfundenen kaeme 404.
const GELOGGT = process.env.G306_GELOGGT ?? ''
const HEUTE = process.env.G306_HEUTE ?? ''
const ZUKUNFT = process.env.G306_ZUKUNFT ?? ''
const FOOD = process.env.G306_FOOD ?? ''

async function aendern(id, menge) {
  return await seite.evaluate(async ([i, f, m]) => {
    const r = await fetch('/api/nutrition/plan', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        art: 'eintrag_aendern', id: i,
        typ: 'bls', quelleId: f, mahlzeit: 'lunch', menge: m,
      }),
    })
    return { status: r.status, koerper: (await r.text()).slice(0, 150) }
  }, [id, FOOD, menge])
}

console.log('=== E-42: die Sperre haengt am Protokoll, nicht am Plan ===\n')
console.log('Der Plan ist AKTIV. Nach der alten Regel (C-372) waere')
console.log('jede dieser drei Aenderungen 409 gewesen.\n')

for (const [name, id, erwartet] of [
  ['geloggte Position (gestern, confirmed)', GELOGGT, 409],
  ['heutige Position (kein Log)', HEUTE, 200],
  ['Zukunftstag (+3 Tage, kein Log)', ZUKUNFT, 200],
]) {
  if (!id) { console.log(`  ${name.padEnd(42)} (keine Id uebergeben)`); continue }
  const a = await aendern(id, 250)
  const ok = a.status === erwartet
  console.log(`  ${name.padEnd(42)} HTTP ${a.status}  ${ok ? 'wie erwartet' : 'ABWEICHUNG'}`)
  if (a.status !== 200) console.log(`      ${a.koerper}`)
}

console.log(`\nKonsolenfehler: ${fehler.length}`)
await browser.close()
