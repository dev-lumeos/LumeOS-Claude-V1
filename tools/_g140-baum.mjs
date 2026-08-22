// G-140: Steht der Baum nach dem Entfernen von `stufe` unveraendert?
//
// Gemessen wird die EINRUECKUNG je Zeile — sie kommt aus `parent_code`
// (C-161) und darf sich nicht bewegt haben. Dazu die Zahl der
// Naehrstoffe und der Gruppen.
import { chromium } from '@playwright/test'

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3200'
const browser = await chromium.launch()
const seite = await (await browser.newContext({
  viewport: { width: 1440, height: 1200 } })).newPage()

await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle', timeout: 60_000 })
if (await seite.locator('input[type=email]').count()) {
  await seite.fill('input[type=email]', 'dev@lumeos.app')
  await seite.fill('input[type=password]', 'LumeosDev2026')
  await Promise.all([
    seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 60_000 }),
    seite.click('button[type=submit]'),
  ])
}
await seite.goto(`${BASIS}/v2/nutrition?tab=nutrients`,
  { waitUntil: 'networkidle', timeout: 60_000 })
await seite.waitForTimeout(1800)

const d = await seite.evaluate(() => {
  const txt = (document.body.textContent ?? '').replace(/\s+/g, ' ')
  // Die Einrueckung steckt im `padding-left` der Namenszelle.
  const einzuege = new Map()
  for (const td of document.querySelectorAll('td')) {
    const pl = getComputedStyle(td).paddingLeft
    if (pl && pl !== '0px') einzuege.set(pl, (einzuege.get(pl) ?? 0) + 1)
  }
  return {
    kopf: txt.match(/(\d+) Naehrstoffe in (\d+) Gruppen/)?.[0] ?? null,
    imFenster: txt.match(/(\d+) von (\d+) tragen im Fenster/)?.[0] ?? null,
    stufeKommtVor: /\bStufe\b/.test(txt),
    zeilen: document.querySelectorAll('tbody tr').length,
    einzuege: [...einzuege.entries()].sort((a, b) =>
      parseFloat(a[0]) - parseFloat(b[0])),
  }
})
console.log(JSON.stringify(d, null, 2))
await browser.close()
