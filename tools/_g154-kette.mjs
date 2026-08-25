// G-154: Wirkt `prefs=1` durch die Route — auf beiden Konten?
//
// ANGESAGT, bevor gemessen wird:
//   test-user (0 Preferences)   7140  -> mit prefs=1 UNVERAENDERT 7140
//   dev (tree_nuts hard, lactose strong, ultra_processed hard)
//                                7140 -> mit prefs=1        5292
//     (7140 - 1848; die Vereinigung der drei Tags)
//   dev mit Suchwort 'milch'      261 -> mit prefs=1          168
//     `strong` wird bei expliziter Suche sichtbar (ADR), `hard` nicht.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3200'
const KONTEN = [
  ['test-user@lumeos.local', wortFuer('test-user@lumeos.local'), 7140, 7140, 261, 261],
  ['dev@lumeos.app', 'LumeosDev2026', 7140, 5292, 261, 168],
]

const browser = await chromium.launch()
console.log('Fall'.padEnd(46) + 'angesagt'.padStart(9) + 'gemessen'.padStart(10) + '  Urteil')
console.log('-'.repeat(76))
let alleGut = true

for (const [konto, wort, ohnePrefs, mitPrefs, suchOhne, suchMit] of KONTEN) {
  const ctx = await browser.newContext()
  const seite = await ctx.newPage()
  await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle', timeout: 60_000 })
  if (await seite.locator('input[type=email]').count()) {
    await seite.fill('input[type=email]', konto)
    await seite.fill('input[type=password]', wort)
    await Promise.all([
      seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 60_000 }),
      seite.click('button[type=submit]'),
    ])
  }
  await seite.goto(`${BASIS}/v2/nutrition`, { waitUntil: 'networkidle', timeout: 60_000 })

  const hole = (q, prefs) => seite.evaluate(async ([qq, pp]) => {
    const p = new URLSearchParams({ q: qq, limit: '1', offset: '0', sort: 'relevance' })
    if (pp) p.set('prefs', '1')
    const r = await fetch(`/api/nutrition/foods?${p}`)
    return (await r.json())?.total ?? null
  }, [q, prefs])

  const kurz = konto.split('@')[0]
  for (const [name, q, prefs, ansage] of [
    [`${kurz}  leer, ohne prefs`, '', false, ohnePrefs],
    [`${kurz}  leer, MIT prefs`, '', true, mitPrefs],
    [`${kurz}  'milch', ohne prefs`, 'milch', false, suchOhne],
    [`${kurz}  'milch', MIT prefs`, 'milch', true, suchMit],
  ]) {
    const g = await hole(q, prefs)
    const ok = g === ansage
    alleGut = alleGut && ok
    console.log(name.padEnd(46) + String(ansage).padStart(9)
      + String(g).padStart(10) + '  ' + (ok ? 'ok' : 'ABWEICHUNG'))
  }
  await ctx.close()
}
console.log()
console.log('Alle Ansagen getroffen:', alleGut)
await browser.close()
