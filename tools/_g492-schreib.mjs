// G-492/A5+A8 -- die Vorschau rechnet, und das Eintragen bestaetigt.
//
// [read] Der Schreibweg wird GEGEN DIE DATENBANK geprueft, nicht nur
// gegen den Statuscode -- G-484 hat gemessen, dass eine Fehlermeldung
// ueber einen Erfolg moeglich ist (RETURNS uuid gegen data.id).
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const KONTO='dev@lumeos.app', BASIS='http://127.0.0.1:3200'
const SUCHFELD = 'input[aria-label="Produkt suchen"]'
const PULVER = ['Gold Standard 100% Whey Chocolate Peanut Butter', 'ON Optimum Nutrition']

const b = await chromium.launch({ headless: true })
const s = await (await b.newContext({viewport:{width:1500,height:1200}})).newPage()
const fehler=[]; s.on('pageerror', e=>fehler.push(String(e).slice(0,200)))
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO); await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([s.waitForURL(u=>!u.pathname.includes('login')), s.click('button[type=submit]')])
}
// Filter leeren, von einem anderen Reiter aus (G-491).
await s.goto(`${BASIS}/v2/supplements?tab=heute`, { waitUntil: 'domcontentloaded' })
await s.evaluate(async () => {
  await fetch('/api/supplements/filter', { method:'PUT',
    headers:{'content-type':'application/json'},
    body: JSON.stringify({ status:'On Market', kategorie:null, form:null,
                           marken:[], allergienAn:true, leisteOffen:false }) })
})

await s.goto(`${BASIS}/v2/supplements?tab=produkte`, { waitUntil: 'domcontentloaded' })
await s.waitForSelector(SUCHFELD, { timeout: 40000 })
await s.waitForTimeout(1500)
await s.locator(SUCHFELD).type(PULVER[0], { delay: 15 })
await s.waitForTimeout(4000)
await s.locator('.v2-tbl tbody tr', { hasText: PULVER[1] }).first()
  .locator('[data-probe="zeile-add"]').click()
await s.waitForTimeout(2500)

// ── A5: die Vorschau, bei Anzahl 1 und 2 ─────────────────────────
await s.locator('[data-probe="aktion-mahlzeit"]').click()
// [read] Auf die FELDER warten, nicht auf die Uhr -- hinter dem
// Klick haengen ZWEI Ladungen (produkt?id fuer die Portionen,
// produkt-ziele fuer Stacks und Mahlzeiten). Mit 2000 ms mass die
// Probe den Zustand davor und meldete eine leere Vorschau.
await s.locator('[data-probe="mahlzeit-portion"]').waitFor({ timeout: 30000 })
await s.locator('[data-probe="mahlzeit-vorschau"]').waitFor({ timeout: 30000 })
  .catch(() => {})
const eins = await s.evaluate(() =>
  document.querySelector('[data-probe="mahlzeit-vorschau"]')?.textContent?.trim() ?? null)
await s.locator('[data-probe="mahlzeit-anzahl"]').fill('2')
await s.waitForTimeout(700)
const zwei = await s.evaluate(() =>
  document.querySelector('[data-probe="mahlzeit-vorschau"]')?.textContent?.trim() ?? null)
console.log('A5 VORSCHAU  anzahl=1:', eins)
console.log('A5 VORSCHAU  anzahl=2:', zwei)
console.log('   rechnet mit:', eins !== zwei && !!eins && !!zwei)
await s.screenshot({ path: '../../backup/x-g492-a5-vorschau.png' })

// ── A8: eintragen, Bestaetigung lesen ────────────────────────────
await s.locator('[data-probe="mahlzeit-anzahl"]').fill('1')
await s.waitForTimeout(400)
const mahlzeit = await s.evaluate(() => {
  const w = document.querySelector('[data-probe="mahlzeit-wahl"]')
  return w ? w.options?.[w.selectedIndex]?.textContent?.trim() ?? null : null
})
await s.locator('[data-probe="mahlzeit-speichern"]').click()
// [read] Auf das ERGEBNIS warten, nicht auf die Uhr. Gemessen: der
// POST auf /api/nutrition/diary braucht beim ERSTEN Aufruf ueber
// 4 s (der Dev-Server kompiliert die Route). Mit 3500 ms las die
// Probe den Zustand "laeuft" und meldete weder Erfolg noch Fehler --
// ein Scheinbefund, der wie ein toter Knopf aussah.
await Promise.race([
  s.locator('[data-probe="aktion-fertig"]').waitFor({ timeout: 45000 }),
  s.locator('[data-probe="aktion-fehler"]').waitFor({ timeout: 45000 }),
]).catch(() => {})
const a8 = await s.evaluate(() => ({
  fertig: document.querySelector('[data-probe="aktion-fertig"]')?.textContent?.trim() ?? null,
  fehler: document.querySelector('[data-probe="aktion-fehler"]')?.textContent?.trim() ?? null,
  modalNochDa: !!document.querySelector('[data-probe="produkt-modal"]'),
}))
console.log('\nA8 gewaehlte Mahlzeit:', mahlzeit)
console.log('A8 BESTAETIGUNG', JSON.stringify(a8))
// [read] Der Statuscode allein belegt nichts -- G-484 hat gemessen,
// dass eine Fehlermeldung ueber einen ERFOLG moeglich ist. Die Zahl
// aus der Datenbank steht daneben im Bericht.
console.log('   -> in der Datenbank gegenpruefen:',
  'SELECT count(*) FROM supplements.intake_logs',
  "WHERE intake_date=CURRENT_DATE")
await s.screenshot({ path: '../../backup/x-g492-a8-bestaetigung.png' })

console.log('\nSeitenfehler:', fehler.slice(0,3))
await b.close().catch(()=>{})
