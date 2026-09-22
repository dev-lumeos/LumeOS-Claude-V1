// G-492/A13 -- das VORHER-Bild, bevor die Aktion nach oben wandert.
//
// [read] Wer erst nachbessert und dann fotografiert, hat kein
// Vorher mehr. Der Ausgangszustand wird gemessen, bevor er faellt.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const KONTO='dev@lumeos.app', BASIS='http://127.0.0.1:3200'

const b = await chromium.launch({ headless: true })
const s = await (await b.newContext({viewport:{width:1500,height:1200}})).newPage()
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO); await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([s.waitForURL(u=>!u.pathname.includes('login')), s.click('button[type=submit]')])
}

// ── Substanzen: die Tafel aufklappen ─────────────────────────────
// [cmd] `tab=catalog`, nicht `katalog` -- gemessen in ansicht.tsx:556.
await s.goto(`${BASIS}/v2/supplements?tab=catalog`, { waitUntil: 'domcontentloaded' })
await s.waitForTimeout(3000)
await s.locator('.v2-tbl tbody tr').first().waitFor({ timeout: 30000 }).catch(()=>{})
const n = await s.locator('.v2-tbl tbody tr').count()
// [read] Die ERSTE ZELLE treffen, nicht die Zeile -- die letzte
// Spalte traegt [Add]/[View], und ein Klick dorthin oeffnet ein
// Modal statt der Tafel.
await s.locator('.v2-tbl tbody tr').first().locator('td').first().click()
await s.waitForTimeout(3000)

const d = await s.evaluate(() => {
  const t = document.body.textContent ?? ''
  const knopf = [...document.querySelectorAll('button')]
    .find(b => (b.textContent ?? '').includes('Zum Stack hinzufügen'))
  const leiste = document.querySelector('.v2-supp-reiter')
  return {
    reiter: [...document.querySelectorAll('.v2-supp-reiter-knopf')]
      .map(k => (k.textContent ?? '').trim()),
    knopfDa: !!knopf,
    // [read] Die Frage ist nicht "gibt es ihn", sondern "wo steht
    // er" -- der Abstand von der Leiste nach unten ist der Befund.
    knopfY: knopf ? Math.round(knopf.getBoundingClientRect().top) : null,
    leisteY: leiste ? Math.round(leiste.getBoundingClientRect().top) : null,
    scrollNoetig: knopf
      ? knopf.getBoundingClientRect().bottom > window.innerHeight : null,
    text: t.includes('Zum Stack hinzufügen'),
  }
})
console.log('SUBSTANZ VORHER  zeilen=' + n, JSON.stringify(d, null, 2))
await s.screenshot({ path: '../../backup/x-g492-a13-vorher.png' })

// ── Produkte: die Tafel OHNE Subnav ──────────────────────────────
await s.goto(`${BASIS}/v2/supplements?tab=produkte`, { waitUntil: 'domcontentloaded' })
await s.waitForSelector('input[aria-label="Produkt suchen"]', { timeout: 40000 })
await s.waitForTimeout(1500)
await s.locator('input[aria-label="Produkt suchen"]').type('Gold Standard 100% Whey Chocolate Peanut Butter', { delay: 15 })
await s.waitForTimeout(4000)
await s.locator('.v2-tbl tbody tr').first().waitFor({ timeout: 30000 }).catch(()=>{})
await s.locator('.v2-tbl tbody tr', { hasText: 'ON Optimum Nutrition' })
  .first().locator('td').first().click()
await s.waitForTimeout(3500)

const p = await s.evaluate(() => {
  const akt = document.querySelector('[data-probe="produkt-aktion"]')
  return {
    // [cmd] Der Befund aus dem G-491-Foto: hat die Produkt-Tafel
    // ueberhaupt eine Reiterleiste? (Erwartet: nein.)
    reiter: [...document.querySelectorAll('.v2-supp-reiter-knopf')]
      .map(k => (k.textContent ?? '').trim()),
    aktionDa: !!akt,
    aktionY: akt ? Math.round(akt.getBoundingClientRect().top) : null,
    scrollNoetig: akt ? akt.getBoundingClientRect().bottom > window.innerHeight : null,
    // [cmd] A1-Befund: traegt die Liste eine Formspalte mit Inhalt?
    formLeer: [...document.querySelectorAll('.v2-tbl tbody tr')].slice(0,8)
      .map(r => (r.children[2]?.textContent ?? '').trim()),
  }
})
console.log('\nPRODUKT VORHER', JSON.stringify(p, null, 2))
await s.screenshot({ path: '../../backup/x-g492-a11-vorher.png' })
await b.close().catch(()=>{})
