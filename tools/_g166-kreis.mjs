// G-166: Haelt der Erfahrungsgrad Speichern und Neuladen — alle vier
// Stufen einzeln, plus das Abwaehlen.
//
// Konto: test-user@lumeos.local. Gemessen wird der Wert, den die Seite
// NACH einem Neuladen zeigt — nicht der, den sie gerade gesetzt hat.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3200'
const STUFEN = ['beginner', 'advanced', 'pro', 'elite']
const LABEL = { beginner: 'Beginner', advanced: 'Advanced', pro: 'Pro', elite: 'Elite' }

const browser = await chromium.launch()
const seite = await (await browser.newContext({
  viewport: { width: 1440, height: 1100 } })).newPage()

await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle', timeout: 60_000 })
if (await seite.locator('input[type=email]').count()) {
  await seite.fill('input[type=email]', 'test-user@lumeos.local')
  await seite.fill('input[type=password]', wortFuer('test-user@lumeos.local'))
  await Promise.all([
    seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 60_000 }),
    seite.click('button[type=submit]'),
  ])
}

/** Was steht nach dem Neuladen im Formular — und traegt es den Punkt? */
async function lies() {
  await seite.goto(`${BASIS}/v2/settings`, { waitUntil: 'networkidle', timeout: 60_000 })
  await seite.waitForTimeout(900)
  return seite.evaluate(labels => {
    const raus = { gewaehlt: null, mitPunkt: [], ariaAn: [] }
    for (const b of document.querySelectorAll('button.v2-wahl')) {
      const titel = b.querySelector('.v2-wahl-titel')?.textContent?.trim() ?? ''
      if (!labels.includes(titel)) continue
      if (b.getAttribute('data-on') === 'true') raus.mitPunkt.push(titel)
      if (b.getAttribute('aria-pressed') === 'true') raus.ariaAn.push(titel)
      // Der Punkt ist nur gefuellt, wenn die CSS-Regel greift.
      const punkt = b.querySelector('.v2-wahl-punkt')
      if (punkt) {
        const bg = getComputedStyle(punkt).backgroundColor
        const gefuellt = bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent'
        if (gefuellt) raus.gewaehlt = titel
      }
    }
    return raus
  }, Object.values(LABEL))
}

async function setze(label) {
  // Die Seite muss stehen — `lies()` navigiert weg, deshalb hier zurueck.
  if (!seite.url().includes('/v2/settings')) {
    await seite.goto(`${BASIS}/v2/settings`, { waitUntil: 'networkidle', timeout: 60_000 })
    await seite.waitForTimeout(900)
  }
  await seite.click(`button.v2-wahl:has(.v2-wahl-titel:text-is("${label}"))`)
  await seite.waitForTimeout(300)
  const antwort = seite.waitForResponse(r =>
    r.url().includes('/api/profile') && r.request().method() === 'PUT')
  await seite.click('button[type=submit]')
  const r = await antwort
  return r.status()
}

console.log('Stufe'.padEnd(12) + 'PUT'.padStart(5)
  + '  nach Neuladen gefuellt   aria-pressed')
console.log('-'.repeat(62))
let alleGut = true
for (const s of STUFEN) {
  const status = await setze(LABEL[s])
  const nach = await lies()
  const ok = status === 200 && nach.gewaehlt === LABEL[s]
    && nach.ariaAn.includes(LABEL[s])
  alleGut = alleGut && ok
  console.log(LABEL[s].padEnd(12) + String(status).padStart(5)
    + '  ' + String(nach.gewaehlt ?? '—').padEnd(23)
    + JSON.stringify(nach.ariaAn) + (ok ? '' : '   ABWEICHUNG'))
}

// Abwaehlen: nochmal auf dieselbe Stufe klicken.
const status = await setze(LABEL.elite)
const nach = await lies()
const abgewaehlt = nach.gewaehlt === null && nach.ariaAn.length === 0
console.log('abwaehlen'.padEnd(12) + String(status).padStart(5)
  + '  ' + String(nach.gewaehlt ?? '—').padEnd(23)
  + JSON.stringify(nach.ariaAn) + (abgewaehlt ? '' : '   ABWEICHUNG'))

console.log()
console.log('Alle vier Stufen halten:', alleGut, '| Abwaehlen:', abgewaehlt)
await browser.close()
