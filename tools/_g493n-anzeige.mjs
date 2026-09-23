// G-493/N3 -- die Probe, die die ANZEIGE prueft.
//
// ══ WARUM ES DIESE PROBE BRAUCHT ══════════════════════════════════
//
// [cmd] Mein A1-Nachweis verglich drei Knopftexte MITEINANDER und
// meldete "dreimal identisch". [read] Identisch waren sie -- und
// identisch FALSCH: alle drei zeigten `Allgemein.hinzufuegen`.
//
// [read] Eine Gleichheitsprobe kann nicht sagen, ob das Wort richtig
// ist. Sie braucht einen SOLL-Wert von aussen.
//
// [cmd] Und `tools/i18n-pruefen.mjs` half nicht: es meldete
// "109 Verwendungen, alle vorhanden" -- es liest die DATEIEN, nicht
// den Schirm. Genau dazwischen lag der Fehler.
import { chromium } from '@playwright/test'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { wortFuer } from './konten.mjs'

const KONTO='dev@lumeos.app', BASIS='http://127.0.0.1:3200'
const WURZEL = path.resolve(import.meta.dirname, '..')
const SUCHFELD = 'input[aria-label="Produkt suchen"]'

// [read] Der SOLL-Wert kommt aus der Sprachdatei, nicht aus dem
// Gedaechtnis -- sonst prueft die Probe eine Abschrift.
const DE = JSON.parse(readFileSync(
  path.join(WURZEL, 'apps/web/messages/de.json'), 'utf8'))
const SOLL = DE.Allgemein.hinzufuegen           // "Hinzufügen"
const SOLL_KOPF = DE.Supplements.supplementHinzufuegen

const b = await chromium.launch({ headless: true })
const s = await (await b.newContext({viewport:{width:1500,height:1200}})).newPage()
const fehler=[]; s.on('pageerror', e=>fehler.push(String(e).slice(0,200)))
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO); await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([s.waitForURL(u=>!u.pathname.includes('login')), s.click('button[type=submit]')])
}
await s.goto(`${BASIS}/v2/supplements?tab=heute`, { waitUntil: 'domcontentloaded' })
await s.evaluate(async () => {
  await fetch('/api/supplements/filter', { method:'PUT',
    headers:{'content-type':'application/json'},
    body: JSON.stringify({ status:'On Market', kategorie:null, form:null,
                           marken:[], allergienAn:true, leisteOffen:false }) })
})

const befunde = []
const pruefe = (was, ist, soll) => {
  const ok = ist === soll
  befunde.push({ was, ist, soll, ok })
  console.log(`  ${ok ? 'OK' : '!!'}  ${was}: ${JSON.stringify(ist)}`)
}

// ── Die Liste ────────────────────────────────────────────────────
await s.goto(`${BASIS}/v2/supplements?tab=produkte`, { waitUntil: 'domcontentloaded' })
await s.waitForSelector(SUCHFELD, { timeout: 40000 })
await s.waitForTimeout(1500)
await s.locator(SUCHFELD).type('Gold Standard 100% Whey Chocolate Peanut Butter', { delay: 15 })
await s.waitForTimeout(4500)
await s.locator('.v2-tbl tbody tr').first().waitFor({ timeout: 30000 }).catch(()=>{})

const zeile = await s.evaluate(() =>
  document.querySelector('[data-probe="zeile-add"]')?.textContent?.trim() ?? null)
pruefe('Liste', zeile, SOLL)

const kopf = await s.evaluate(() => {
  const k = [...document.querySelectorAll('button')]
    .find(x => /Supplement/i.test(x.textContent ?? '') && /hinzu/i.test(x.textContent ?? ''))
  return k ? (k.textContent ?? '').trim() : null
})
pruefe('Kopf', kopf, SOLL_KOPF)

// ── Die Tafel ────────────────────────────────────────────────────
await s.locator('.v2-tbl tbody tr', { hasText: 'ON Optimum Nutrition' })
  .first().locator('td').first().click()
await s.waitForTimeout(3500)
// [read] N5: in der Tafel steht KEIN Knopf mehr -- die Zeile traegt
// ihn schon, und die Tafel klappt direkt darunter auf.
// Tom: "dann erweitert gleich darunter derselbe button? dann kann
// man es gleich weglassen"
const tafel = await s.evaluate(() =>
  document.querySelector('[data-probe="produkt-add"]')?.textContent?.trim() ?? null)
pruefe('Tafel: KEIN zweiter Knopf', tafel, null)

// ── N5: EIN Knopf, nicht zwei ────────────────────────────────────
const n5 = await s.evaluate(() => {
  const tafel = document.querySelector('.v2-supp-prod-tafel')
  const zeile = document.querySelector('[data-probe="zeile-add"]')
  return {
    inDerTafel: !!document.querySelector('[data-probe="produkt-add"]'),
    inDerZeile: !!zeile,
    // [read] Die Frage ist nicht "gibt es sie", sondern "stehen sie
    // uebereinander" -- der Abstand ist der Befund.
    abstand: (tafel && zeile)
      ? Math.round(tafel.getBoundingClientRect().top - zeile.getBoundingClientRect().bottom)
      : null,
  }
})
console.log('\nN5 KNOEPFE:', JSON.stringify(n5))

// ── Die Substanzen ───────────────────────────────────────────────
await s.goto(`${BASIS}/v2/supplements?tab=catalog`, { waitUntil: 'domcontentloaded' })
await s.waitForTimeout(3500)
await s.locator('.v2-tbl tbody tr').first().waitFor({ timeout: 30000 }).catch(()=>{})
const subst = await s.evaluate(() => {
  const k = [...document.querySelectorAll('.v2-tbl tbody tr button')]
    .find(x => /hinzu|Add/i.test(x.textContent ?? ''))
  return k ? (k.textContent ?? '').trim() : null
})
pruefe('Substanzen', subst, SOLL)

await s.screenshot({ path: '../../backup/x-g493n-anzeige.png' })
console.log('\nSeitenfehler:', fehler.slice(0,2))
const schlecht = befunde.filter(x => !x.ok)
console.log(`\n${befunde.length - schlecht.length}/${befunde.length}`)
await b.close().catch(()=>{})
process.exit(schlecht.length === 0 ? 0 : 1)
