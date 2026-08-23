// G-172: Welche Sichttexte stehen auf dem Katalog-Tab — DE und EN?
//
// Der Nachweis ist nicht „es gibt Uebersetzungen", sondern: **steht in
// der deutschen Ansicht noch ein englisches Wort aus der Liste?**
import { chromium } from '@playwright/test'

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3200'

/** Die 22 aus dem Auftrag, soweit sie auf diesen Seiten stehen. */
const ENGLISCH = [
  'Today', 'Catalog', 'Intelligence', 'Inventory', 'Injections',
  'Compliance', 'Interactions', 'Cost', 'Export stack', 'Add supplement',
  'Search catalog', 'Evidence', 'In stack', 'Action',
]
const DEUTSCH = [
  'Heute', 'Katalog', 'Auswertung', 'Bestand', 'Injektionen',
  'Einnahmetreue', 'Wechselwirkungen', 'Kosten', 'Stack exportieren',
  'Supplement hinzufuegen', 'Evidenz', 'Im Stack',
]

const browser = await chromium.launch()

async function messen(sprache) {
  const ctx = await browser.newContext({ locale: sprache === 'en' ? 'en-US' : 'de-DE' })
  const seite = await ctx.newPage()
  await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle', timeout: 60_000 })
  if (await seite.locator('input[type=email]').count()) {
    await seite.fill('input[type=email]', 'dev@lumeos.app')
    await seite.fill('input[type=password]', 'LumeosDev2026')
    await Promise.all([
      seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 60_000 }),
      seite.click('button[type=submit]'),
    ])
  }
  // Die Sprache haengt am Cookie, den die Sprachwahl setzt.
  await ctx.addCookies([{
    name: 'lumeos-sprache', value: sprache, url: BASIS,
  }])
  await seite.goto(`${BASIS}/v2/supplements?tab=catalog`,
    { waitUntil: 'networkidle', timeout: 60_000 })
  await seite.waitForTimeout(1500)

  const t = (await seite.evaluate(() =>
    (document.body.textContent ?? '').replace(/\s+/g, ' ')))
  await ctx.close()
  return {
    englisch: ENGLISCH.filter(w => new RegExp(`\\b${w}\\b`).test(t)),
    deutsch: DEUTSCH.filter(w => new RegExp(`\\b${w}\\b`).test(t)),
  }
}

for (const s of ['de', 'en']) {
  const r = await messen(s)
  console.log(`=== ${s} ===`)
  console.log('  englische Woerter sichtbar:', r.englisch.length,
    r.englisch.length ? JSON.stringify(r.englisch) : '')
  console.log('  deutsche Woerter sichtbar :', r.deutsch.length,
    r.deutsch.length ? JSON.stringify(r.deutsch.slice(0, 8)) : '')
}
await browser.close()
