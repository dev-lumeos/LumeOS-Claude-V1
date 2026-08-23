// G-172: Ist die Substanzliste erreichbar — oben UND unten?
//
// Gemessen wird nicht „gibt es overflow", sondern: **kommt man an die
// letzte Zeile?** Bei 566 Zeilen ist das die eigentliche Frage.
import { chromium } from '@playwright/test'

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3200'
const BREITE = Number(process.argv[2] ?? 1440)

const browser = await chromium.launch()
const seite = await (await browser.newContext({
  viewport: { width: BREITE, height: 900 } })).newPage()

await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle', timeout: 60_000 })
if (await seite.locator('input[type=email]').count()) {
  await seite.fill('input[type=email]', process.env.LUMEOS_KONTO ?? 'dev@lumeos.app')
  await seite.fill('input[type=password]', process.env.LUMEOS_WORT ?? 'LumeosDev2026')
  await Promise.all([
    seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 60_000 }),
    seite.click('button[type=submit]'),
  ])
}
await seite.goto(`${BASIS}/v2/supplements?tab=catalog`,
  { waitUntil: 'networkidle', timeout: 60_000 })
await seite.waitForTimeout(1600)

const d = await seite.evaluate(() => {
  const tbody = document.querySelector('.v2-supp-tbl-wrap tbody')
  const wrap = document.querySelector('.v2-supp-tbl-wrap')
  if (!tbody || !wrap) return { fehler: 'keine Tabelle gefunden' }
  const zeilen = tbody.querySelectorAll('tr')
  const letzte = zeilen[zeilen.length - 1]
  const stil = getComputedStyle(wrap)
  // Erreichbar heisst: die letzte Zeile laesst sich in den Blick holen.
  letzte?.scrollIntoView({ block: 'center' })
  const r = letzte?.getBoundingClientRect()
  return {
    zeilen: zeilen.length,
    overflowY: stil.overflowY,
    maxHeight: stil.maxHeight,
    wrapHoehe: Math.round(wrap.getBoundingClientRect().height),
    scrollHoehe: wrap.scrollHeight,
    // Nach `scrollIntoView`: steht die letzte Zeile im Fenster?
    letzteSichtbar: !!r && r.top >= 0 && r.bottom <= window.innerHeight,
    letzteText: letzte?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 40) ?? null,
    // Der Kopf soll beim Scrollen stehenbleiben.
    kopfSticky: getComputedStyle(
      document.querySelector('.v2-supp-tbl-wrap thead th')).position,
  }
})
console.log(`Breite ${BREITE}:`, JSON.stringify(d, null, 2))
await browser.close()
