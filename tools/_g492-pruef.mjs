// G-492 -- die Abnahmebedingungen messen und fotografieren.
//
// A1   Knopf in der zweithintersten Spalte
// A2   ein Klick oeffnet das Modal OHNE die Liste zu verlassen
// A3   Kapsel: nur Stack      A4  Pulver: beides
// A6   Aktion oben, ohne Scrollen
// A11  Subnav      A12  Aktion in JEDEM Reiter
// A13  Substanz-Aktion oben   A15/A16/A17 die vier Reiter
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const KONTO='dev@lumeos.app', BASIS='http://127.0.0.1:3200'
const SUCHFELD = 'input[aria-label="Produkt suchen"]'

// [read] Die gespeicherten Filter erst LEEREN -- G-491 hat gemessen,
// dass ein gespeicherter `kategorie: protein` jede andere Suche leer
// laufen laesst. Und geschrieben wird von einem ANDEREN Reiter aus:
// der Produkte-Reiter hat einen eigenen Speicher-Effekt (400 ms), der
// den Stand sonst mit SEINEM State ueberschreibt.
async function filterLeeren(s) {
  await s.goto(`${BASIS}/v2/supplements?tab=heute`, { waitUntil: 'domcontentloaded' })
  await s.evaluate(async () => {
    await fetch('/api/supplements/filter', {
      method: 'PUT', headers: {'content-type':'application/json'},
      body: JSON.stringify({ status:'On Market', kategorie:null, form:null,
                             marken:[], allergienAn:true, leisteOffen:false }),
    })
  })
}

const KAPSEL = ['Ultraplex Vitamin D3', 'Elevation Health']
const PULVER = ['Gold Standard 100% Whey Chocolate Peanut Butter', 'ON Optimum Nutrition']

const b = await chromium.launch({ headless: true })
const s = await (await b.newContext({viewport:{width:1500,height:1200}})).newPage()
const fehler=[]; s.on('pageerror', e=>fehler.push(String(e).slice(0,200)))
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO); await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([s.waitForURL(u=>!u.pathname.includes('login')), s.click('button[type=submit]')])
}

async function suchen(wort) {
  await s.goto(`${BASIS}/v2/supplements?tab=produkte`, { waitUntil: 'domcontentloaded' })
  await s.waitForSelector(SUCHFELD, { timeout: 40000 })
  await s.waitForTimeout(1500)
  await s.locator(SUCHFELD).type(wort, { delay: 15 })
  await s.waitForTimeout(4000)
  await s.locator('.v2-tbl tbody tr').first().waitFor({ timeout: 30000 }).catch(()=>{})
}

// ── A1: die Spaltenordnung ───────────────────────────────────────
await filterLeeren(s)
await suchen(PULVER[0])
const a1 = await s.evaluate(() => {
  const z = document.querySelector('.v2-tbl tbody tr')
  const zellen = [...(z?.children ?? [])]
  const add = document.querySelector('[data-probe="zeile-add"]')
  const idx = zellen.findIndex(c => c.contains(add))
  return {
    spalten: zellen.length,
    addInSpalte: idx,
    zweithinterste: idx === zellen.length - 2,
    kopfSpalten: document.querySelectorAll('.v2-tbl thead th').length,
  }
})
console.log('A1 SPALTEN', JSON.stringify(a1))
await s.screenshot({ path: '../../backup/x-g492-a1-spalte.png' })

// ── A2: ein Klick, Modal auf, Liste bleibt ───────────────────────
const vorher = await s.locator('.v2-tbl tbody tr').count()
await s.locator('[data-probe="zeile-add"]').first().click()
await s.waitForTimeout(2500)
const a2 = await s.evaluate((vorher) => {
  const m = document.querySelector('[data-probe="produkt-modal"]')
  return {
    modalDa: !!m,
    zeilenDanach: document.querySelectorAll('.v2-tbl tbody tr').length,
    listeBleibt: document.querySelectorAll('.v2-tbl tbody tr').length === vorher,
    // [read] Eine aufgeklappte Tafel waere das Gegenteil von A2.
    tafelOffen: !!document.querySelector('.v2-supp-tafel-zeile'),
    stack: !!document.querySelector('[data-probe="aktion-stack"]'),
    mahlzeit: !!document.querySelector('[data-probe="aktion-mahlzeit"]'),
  }
}, vorher)
console.log('A2/A4 MODAL (Pulver)', JSON.stringify(a2))
await s.screenshot({ path: '../../backup/x-g492-a2-modal-pulver.png' })

// ── A3: die Kapsel ───────────────────────────────────────────────
await suchen(KAPSEL[0])
await s.locator('.v2-tbl tbody tr', { hasText: KAPSEL[1] }).first()
  .locator('[data-probe="zeile-add"]').click()
await s.waitForTimeout(2500)
const a3 = await s.evaluate(() => ({
  modalDa: !!document.querySelector('[data-probe="produkt-modal"]'),
  stack: !!document.querySelector('[data-probe="aktion-stack"]'),
  mahlzeit: !!document.querySelector('[data-probe="aktion-mahlzeit"]'),
  grund: document.querySelector('[data-probe="nur-stack-grund"]')?.textContent?.trim() ?? null,
}))
console.log('A3 MODAL (Kapsel)', JSON.stringify(a3))
await s.screenshot({ path: '../../backup/x-g492-a3-modal-kapsel.png' })

// ── A6/A11/A12/A15-A17: die Tafel ────────────────────────────────
await suchen(PULVER[0])
await s.locator('.v2-tbl tbody tr', { hasText: PULVER[1] }).first()
  .locator('td').first().click()
await s.waitForTimeout(3500)
const tafel = await s.evaluate(() => {
  const leiste = document.querySelector('[data-probe="tafel-reiterleiste"]')
  const add = document.querySelector('[data-probe="produkt-add"]')
  return {
    reiter: [...document.querySelectorAll('.v2-supp-reiter-knopf')]
      .map(k => (k.textContent ?? '').trim()),
    leisteY: leiste ? Math.round(leiste.getBoundingClientRect().top) : null,
    addY: add ? Math.round(add.getBoundingClientRect().top) : null,
    // A6: ohne Scrollen sichtbar?
    addSichtbar: add
      ? add.getBoundingClientRect().bottom <= window.innerHeight
        && add.getBoundingClientRect().top >= 0 : null,
    // A16: die Inhaltsstoffe ohne Wechsel?
    buendel: document.querySelectorAll('.v2-supp-prod-buendel').length,
  }
})
console.log('\nA6/A11/A15/A16 TAFEL', JSON.stringify(tafel, null, 2))
await s.screenshot({ path: '../../backup/x-g492-a11-ueberblick.png' })

// A12/A17: die anderen Reiter
for (const [titel, datei] of [['Anwendung','x-g492-a12-anwendung.png'],
                              ['Hinweise','x-g492-a17-hinweise.png'],
                              ['Etikett','x-g492-a17-etikett.png']]) {
  await s.locator('.v2-supp-reiter-knopf', { hasText: titel }).first().click()
  await s.waitForTimeout(900)
  const d = await s.evaluate(() => {
    const add = document.querySelector('[data-probe="produkt-add"]')
    const w = document.querySelector('[data-probe^="wartet-"]')
    return {
      addDa: !!add,
      addSichtbar: add ? add.getBoundingClientRect().bottom <= window.innerHeight : null,
      satz: w ? (w.textContent ?? '').trim().slice(0, 150) : null,
    }
  })
  console.log(`  ${titel}:`, JSON.stringify(d))
  await s.screenshot({ path: `../../backup/${datei}` })
}

// ── A13: die Substanz-Tafel ──────────────────────────────────────
await s.goto(`${BASIS}/v2/supplements?tab=catalog`, { waitUntil: 'domcontentloaded' })
await s.waitForTimeout(3000)
await s.locator('.v2-tbl tbody tr').first().waitFor({ timeout: 30000 }).catch(()=>{})
await s.locator('.v2-tbl tbody tr').first().locator('td').first().click()
await s.waitForTimeout(3000)
const a13 = await s.evaluate(() => {
  const k = document.querySelector('[data-probe="substanz-add"]')
  const leiste = document.querySelector('[data-probe="tafel-reiterleiste"]')
  return {
    reiter: [...document.querySelectorAll('.v2-supp-reiter-knopf')]
      .map(x => (x.textContent ?? '').trim()),
    knopfY: k ? Math.round(k.getBoundingClientRect().top) : null,
    leisteY: leiste ? Math.round(leiste.getBoundingClientRect().top) : null,
    inLeiste: !!(k && leiste && leiste.contains(k)),
    sichtbar: k ? k.getBoundingClientRect().bottom <= window.innerHeight : null,
  }
})
console.log('\nA13 SUBSTANZ NACHHER', JSON.stringify(a13, null, 2))
await s.screenshot({ path: '../../backup/x-g492-a13-nachher.png' })

console.log('\nSeitenfehler:', fehler.slice(0,3))
await b.close().catch(()=>{})
