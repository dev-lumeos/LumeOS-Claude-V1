// G-491/A3+A4 -- die Fotos.
//
// A3  behoben: der Leersatz nennt JEDEN gesetzten Filter.
// A4  G-484/A5+A6 nachgeliefert: eine Kapsel bietet nur den Stack,
//     ein Pulver bietet beides.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const KONTO='dev@lumeos.app', BASIS='http://127.0.0.1:3200'

const b = await chromium.launch({ headless: true })
const s = await (await b.newContext({viewport:{width:1500,height:1200}})).newPage()
const fehler=[]; s.on('pageerror', e=>fehler.push(String(e).slice(0,200)))
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO); await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([s.waitForURL(u=>!u.pathname.includes('login')), s.click('button[type=submit]')])
}

const SUCHFELD = 'input[aria-label="Produkt suchen"]'

async function reiter() {
  await s.goto(`${BASIS}/v2/supplements?tab=produkte`, { waitUntil: 'domcontentloaded' })
  await s.waitForSelector(SUCHFELD, { timeout: 40000 })
  await s.waitForTimeout(1500)
}

async function filterSetzen(stand) {
  // [read] Ueber die PUT-Route, die der Reiter selbst benutzt --
  // damit der Ausgangszustand derselbe ist, den ein F5 herstellt.
  await s.evaluate(async (stand) => {
    await fetch('/api/supplements/filter', {
      method: 'PUT', headers: {'content-type':'application/json'},
      body: JSON.stringify(stand),
    })
  }, stand)
}

// ── A3: der Leersatz mit DREI Filtern ────────────────────────────
//
// [read] Die Filter werden von einer NEUTRALEN Seite aus geschrieben,
// nicht vom Produkte-Reiter: der Reiter hat einen eigenen Speicher-
// Effekt, und der ueberschreibt den Stand 400 ms nach dem Laden mit
// SEINEM State. Vom Reiter aus zu schreiben heisst, gegen ihn zu
// schreiben -- gemessen 2026-09-21, der Satz nannte danach nur noch
// die Allergenmeidung.
await s.goto(`${BASIS}/v2/supplements?tab=heute`, { waitUntil: 'domcontentloaded' })
await filterSetzen({
  status: 'On Market', kategorie: 'protein', form: 'Powder [E0162]',
  marken: ['Optimum Nutrition'], allergienAn: true, leisteOffen: true,
})
await reiter()
await s.locator(SUCHFELD).type('Micronized Creatine Monohydrate', { delay: 15 })
await s.waitForTimeout(3500)
const satz = await s.evaluate(() => {
  const t = document.body.textContent ?? ''
  return (t.match(/Kein Produkt[^.]{0,400}\./g) ?? []).slice(0,2)
})
console.log('A3 LEERSATZ:', JSON.stringify(satz, null, 2))
await s.screenshot({ path: "../../backup/x-g491-a3-leersatz.png", fullPage: false })

// ── A4: Filter LEER, dann Kapsel und Pulver oeffnen ──────────────
await s.goto(`${BASIS}/v2/supplements?tab=heute`, { waitUntil: 'domcontentloaded' })
await filterSetzen({
  status: 'On Market', kategorie: null, form: null,
  marken: [], allergienAn: true, leisteOffen: false,
})

async function oeffnen(wort, datei, marke) {
  await reiter()
  await s.locator(SUCHFELD).type(wort, { delay: 15 })
  await s.waitForTimeout(4000)
  // [read] VOR dem Klick zaehlen -- die aufgeklappte Tafel ist selbst
  // eine <tr> und verschoebe die Zahl.
  // [read] Auf eine ZEILE warten statt auf eine feste Zeit -- der
  // Filter-Effekt laeuft nach dem Laden und stoesst die Suche neu an.
  await s.locator('.v2-tbl tbody tr').first().waitFor({ timeout: 30000 })
    .catch(() => {})
  const n = await s.locator('.v2-tbl tbody tr').count()
  if (n === 0) {
    const t = await s.evaluate(() => (document.body.textContent ?? '')
      .match(/Kein Produkt[^.]{0,300}\./)?.[0] ?? null)
    console.log(`  KEINE ZEILE fuer "${wort}" -- ${t}`)
    return {}
  }
  // [read] Die ZEILE mit der Marke treffen -- gleichnamige Produkte
  // gibt es fuenffach (G-484).
  const ziel = marke
    ? s.locator('.v2-tbl tbody tr', { hasText: marke }).first()
    : s.locator('.v2-tbl tbody tr').first()
  await ziel.click()
  await s.waitForTimeout(3000)
  const d = await s.evaluate(() => {
    const t = document.body.textContent ?? ''
    return {
      tafel: !!document.querySelector('[data-probe="produkt-aktion"]'),
      stack: !!document.querySelector('[data-probe="aktion-stack"]'),
      mahlzeit: !!document.querySelector('[data-probe="aktion-mahlzeit"]'),
      nurStack: (t.match(/Diese Darreichungsform[^.]{0,120}\./) ?? [])[0] ?? null,
    }
  })
  console.log(`\n${datei}  "${wort}"  zeilen=${n}`, JSON.stringify(d))
  // [read] Der Aktionsblock steht am FUSS der Tafel -- ohne Scrollen
  // zeigt das Foto die Naehrwerte statt der Knoepfe, um die es geht.
  await s.locator('[data-probe="produkt-aktion"]').scrollIntoViewIfNeeded()
    .catch(() => {})
  await s.waitForTimeout(600)
  await s.screenshot({ path: `../../backup/${datei}`, fullPage: false })
  return d
}

const kapsel = await oeffnen('Ultraplex Vitamin D3', 'x-g491-a4-kapsel.png', 'Elevation Health')
const pulver = await oeffnen('Gold Standard 100% Whey Chocolate Peanut Butter',
                             'x-g491-a4-pulver.png', 'ON Optimum Nutrition')

console.log('\nA5 Kapsel: nur Stack?', kapsel.stack && !kapsel.mahlzeit)
console.log('A6 Pulver: beides?  ', pulver.stack && pulver.mahlzeit)
console.log('Seitenfehler:', fehler.slice(0,3))
await b.close().catch(()=>{})
