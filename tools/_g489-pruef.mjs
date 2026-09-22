// G-489 -- Supplemente im Mahlzeitenplan.
//
// A1  ein Supplement im Ghost sichtbar
// A2/A3  Bestaetigen macht eine Einnahme daraus
// A4  danach gruen und abgehakt (wie G-486)
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

await s.goto(`${BASIS}/v2/nutrition`, { waitUntil: 'domcontentloaded' })
await s.waitForTimeout(6000)

// [read] Den Ghost ueber seinen TEXT suchen, nicht ueber eine
// geratene Marke -- eine ausgedachte data-probe meldet 0 und belegt
// einen Scheinbefund.
// [read] Der GHOST, nicht der Tagebucheintrag. Beide koennen
// denselben Namen tragen -- die Unterscheidung ist die Karte, nicht
// das Wort (die Lehre aus G-492: Naehe ist keine Zugehoerigkeit).
const ghost = await s.evaluate(() => {
  // [cmd] Die Klassen stehen in ghost-eintrag.tsx:301 -- gelesen,
  // nicht geraten (G-486: v2-ghost-erfuellt / v2-ghost-offen).
  const karten = [...document.querySelectorAll('.v2-ghost-offen, .v2-ghost-erfuellt')]
  return karten.map(e => ({
    erfuellt: e.classList.contains('v2-ghost-erfuellt'),
    text: (e.textContent ?? '').trim().slice(0, 140),
  }))
})
console.log('GHOST-KARTEN:', JSON.stringify(ghost, null, 2))

const a1 = await s.evaluate(() => {
  const t = document.body.textContent ?? ''
  // [read] Nach einem TEILSTRING suchen -- die Karte kuerzt lange
  // Namen, und ein Volltreffer auf den ganzen Namen belegt sonst
  // faelschlich "nicht da".
  const karte = [...document.querySelectorAll('div,article,li')]
    .filter(e => /Chocolate Hazelnut/.test(e.textContent ?? ''))
    .sort((a, b) => (a.textContent ?? '').length - (b.textContent ?? '').length)[0]
  return {
    nenntWhey: /Chocolate Hazelnut/.test(t),
    nenntMarke: /Optimum Nutrition/.test(t),
    karteText: karte ? (karte.textContent ?? '').trim().slice(0, 220) : null,
    // Die Marken der Karte -- so heissen sie wirklich.
    marken: karte
      ? [...karte.querySelectorAll('[data-probe]')]
        .map(e => e.getAttribute('data-probe')).slice(0, 12)
      : [],
  }
})
console.log('A1 GHOST:', JSON.stringify(a1, null, 2))
await s.screenshot({ path: '../../backup/x-g489-a1-ghost.png', fullPage: false })
console.log('\nSeitenfehler:', fehler.slice(0,3))
await b.close().catch(()=>{})
