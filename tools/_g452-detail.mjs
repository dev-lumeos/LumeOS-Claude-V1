// G-452 — Bildschirmfotos der aufgeklappten Produktzeile.
//
// `[read]` **Warum nicht `tools/schuss.mjs`:** das Werkzeug klickt
// ZUERST und tippt DANN (Zeile 197). **Hier ist die Reihenfolge
// umgekehrt** — erst den Namen tippen, die Trefferliste abwarten, dann
// die Zeile aufklappen. `[read]` Ein Klick vor dem Tippen traefe die
// erste Zeile einer ungefilterten Liste, also irgendein Produkt.
//
// `[read]` **Anmeldung, Konto und Wort sind aus `schuss.mjs`
// uebernommen**, nicht neu erfunden — dieselbe eine Stelle
// (`tools/konten.mjs`) entscheidet, mit welchem Wort geklopft wird.
//
// Aufruf:
//   node tools/_g452-detail.mjs <suchtext> <ziel.png> [--status <wert>]
//                               [--breite 1600] [--zeile <n>]
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { wortFuer } from './konten.mjs'

const args = process.argv.slice(2)
const suchtext = args[0] ?? ''
const ziel = resolve(args[1] ?? 'backup/g452-detail.png')
const breite = Number(args[args.indexOf('--breite') + 1]) || 1600
const status = args.includes('--status') ? args[args.indexOf('--status') + 1] : null
// `[read]` **0-basiert** — welche Trefferzeile aufgeklappt wird.
const zeileNr = Number(args[args.indexOf('--zeile') + 1]) || 0

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3200'
const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'
const WORT = wortFuer(KONTO)

const browser = await chromium.launch({ headless: true })
// `[read]` **Die Breite steht VOR dem Laden** — nachtraeglich gesetzt
// misst man ein Layout, das die Seite nie hatte.
const kontext = await browser.newContext({ viewport: { width: breite, height: 1100 } })
const seite = await kontext.newPage()
const fehler = []
seite.on('console', m => { if (m.type() === 'error') fehler.push(m.text()) })

try {
  await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle', timeout: 60_000 })
  if (await seite.locator('input[type=email]').count()) {
    await seite.fill('input[type=email]', KONTO)
    await seite.fill('input[type=password]', WORT)
    await Promise.all([
      seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 60_000 }),
      seite.click('button[type=submit]'),
    ])
  }

  await seite.goto(`${BASIS}/v2/supplements?tab=produkte`,
                   { waitUntil: 'networkidle', timeout: 60_000 })
  await seite.waitForTimeout(1500)

  // Der Marktfilter, wo einer verlangt ist.
  // `[cmd]` **Dr. Mercola Miracle Whey ist `Off Market`** — gemessen
  // 2026-09-14. **Unter dem Standard „On Market" ist es nicht zu
  // finden**, und ohne diesen Schritt zeigte das Foto ein anderes
  // Produkt.
  if (status) {
    await seite.locator(`button:has-text("${status}")`).first().click({ timeout: 15_000 })
    await seite.waitForTimeout(900)
  }

  await seite.fill('input[aria-label="Produkt suchen"]', suchtext)
  // `[read]` **Auf die ANTWORT warten, nicht auf eine feste Zeit** —
  // eine Wartezeit, die heute reicht, reicht auf einem langsameren
  // Lauf nicht, und das Foto zeigt dann die alte Liste.
  await seite.waitForFunction(
    () => document.querySelectorAll('.v2-tbl tbody tr').length > 0,
    { timeout: 30_000 },
  ).catch(() => {})
  await seite.waitForTimeout(900)

  const zeilen = seite.locator('.v2-tbl tbody tr')
  const anzahl = await zeilen.count()
  if (anzahl > zeileNr) {
    await zeilen.nth(zeileNr).click({ timeout: 15_000 })
    // Das Detail wird nachgeladen — auf die Etiketttabelle warten.
    await seite.waitForFunction(
      () => document.querySelectorAll('.v2-supp-tafel-zeile .v2-tbl tbody tr').length > 0,
      { timeout: 30_000 },
    ).catch(() => {})
    await seite.waitForTimeout(900)
  }

  // `[cmd]` **Gezaehlt wird, was im DOM steht** — nicht, was im Foto
  // zu sehen ist. Ein Foto endet am unteren Rand, die Zahl nicht.
  const gemessen = await seite.evaluate(() => {
    const tafel = document.querySelector('.v2-supp-tafel-zeile')
    const etikett = tafel?.querySelectorAll('.v2-tbl tbody tr') ?? []
    const zeilen = Array.from(etikett)
    return {
      trefferzeilen: document.querySelectorAll('.v2-tbl tbody tr').length,
      etikettzeilen: zeilen.length,
      // Eingerueckt: die erste Zelle traegt ein padding-left ueber 14px.
      eingerueckt: zeilen.filter(tr => {
        const td = tr.querySelector('td')
        return td && parseFloat(getComputedStyle(td).paddingLeft) > 20
      }).length,
      ohneMenge: zeilen.filter(
        tr => tr.textContent?.includes('ohne Mengenangabe')).length,
      auswertbar: zeilen.filter(
        tr => tr.textContent?.includes('auswertbar')).length,
      nichtImKatalog: zeilen.filter(
        tr => tr.textContent?.includes('nicht im Katalog')).length,
      kennt: document.body.textContent?.match(
        /(\d+) von (\d+) Zutaten kennt LumeOS/)?.[0] ?? null,
      fusszeile: document.body.textContent?.match(
        /[\d.]+ von [\d.]+ Treffern[^·]*· [\d.]+ Produkte/)?.[0] ?? null,
    }
  })

  // `--scrollZu <text>`: die Stelle ins Bild holen, die belegt werden
  // soll. `[read]` **Ein Foto endet am unteren Rand** — die
  // Mischungszutaten liegen bei 54 Zeilen weit darunter.
  //
  // `[cmd]` **Das Ergebnis wird GEMELDET, nicht verschluckt.** Ein
  // erster Entwurf hing an einem `.catch(() => {})`: der Lauf war
  // gruen, das Foto zeigte den alten Ausschnitt, und nichts sagte es.
  const scrollZu = args.includes('--scrollZu')
    ? args[args.indexOf('--scrollZu') + 1] : null
  let gescrollt = null
  if (scrollZu) {
    try {
      await seite.locator(`text=${scrollZu}`).first()
        .scrollIntoViewIfNeeded({ timeout: 15_000 })
      gescrollt = true
      await seite.waitForTimeout(700)
    } catch (e) {
      gescrollt = `FEHLGESCHLAGEN: ${e.message.split('\n')[0]}`
    }
  }

  mkdirSync(dirname(ziel), { recursive: true })
  await seite.screenshot({ path: ziel, fullPage: false })
  console.log(JSON.stringify({
    ziel, suchtext, status, gescrollt, gemessen,
    konsolenfehler: fehler.length, meldungen: fehler.slice(0, 3),
  }, null, 2))
} finally {
  await browser.close()
}
