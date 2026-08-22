// G-133: Der Ausschluss durch die ganze Kette — Tab -> Route ->
// food-search.ts -> rpc. Gemessen wird `total`, nicht die Seitenlaenge:
// nur `total` zeigt, dass die GESAMTMENGE kleiner wird.
//
// Konto: test-user@lumeos.local (0 Stacks, 0 Einnahmen, 0 Preferences).
// Fuer Trefferzahlen ist das egal — `p_user_id` ist hier nicht gesetzt.
import { chromium } from '@playwright/test'

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3200'
const KONTO = process.env.LUMEOS_KONTO ?? 'test-user@lumeos.local'
const WORT = process.env.LUMEOS_WORT ?? 'LumeosTestUser2026'

// ANGESAGT, bevor gemessen wird (aus SQL abgeleitet):
const ANSAGE = [
  ['ohne Filter', '', 7140],
  ['ohne Laktose', 'contains_lactose', 6119],
  ['ohne Gluten', 'contains_gluten', 6518],
  ['ohne Nuesse', 'contains_nuts', 7020],
  ['Laktose + Gluten', 'contains_lactose,contains_gluten', 5582],
  // Die Gegenprobe: ein falscher Code darf NICHTS ausschliessen.
  ['TIPPFEHLER contains_laktose', 'contains_laktose', 7140],
]

const browser = await chromium.launch()
const seite = await (await browser.newContext()).newPage()
await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle', timeout: 60_000 })
if (await seite.locator('input[type=email]').count()) {
  await seite.fill('input[type=email]', KONTO)
  await seite.fill('input[type=password]', WORT)
  await Promise.all([
    seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 60_000 }),
    seite.click('button[type=submit]'),
  ])
}
console.log('angemeldet als', KONTO, '->', seite.url())
await seite.goto(`${BASIS}/v2/nutrition`, { waitUntil: 'networkidle', timeout: 60_000 })

const hole = (ohne) => seite.evaluate(async o => {
  const p = new URLSearchParams({ q: '', limit: '1', offset: '0', sort: 'relevance' })
  if (o) p.set('ohne', o)
  const t0 = performance.now()
  const r = await fetch(`/api/nutrition/foods?${p}`)
  const b = await r.json()
  return { status: r.status, total: b?.total ?? null, ms: Math.round(performance.now() - t0) }
}, ohne)

console.log()
console.log('Fall'.padEnd(30) + 'angesagt'.padStart(9) + 'gemessen'.padStart(10)
  + 'ms'.padStart(7) + '  Urteil')
console.log('-'.repeat(70))
let alleGut = true
for (const [name, ohne, ansage] of ANSAGE) {
  const r = await hole(ohne)
  const ok = r.total === ansage
  alleGut = alleGut && ok && r.status === 200
  console.log(`${name.padEnd(30)} ${String(ansage).padStart(9)} `
    + `${String(r.total).padStart(9)} ${String(r.ms).padStart(6)}  `
    + `${ok ? 'ok' : 'ABWEICHUNG'}`)
}
console.log()
console.log('Alle Ansagen getroffen:', alleGut)
await browser.close()
