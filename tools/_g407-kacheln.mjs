// G-407/A1+A2: je Unterpunkt die Kacheln AM SCHIRM zaehlen.
//
// `[read]` **Nicht im Quelltext** — die Lehre aus dem
// Attrappen-Audit, wo der Quelltext um Faktor 3 danebenlag.
// `[cmd]` **Hier zaehlt der Browser, was wirklich da ist.**
import { chromium } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { wortFuer } from './konten.mjs'

const BASIS = 'http://localhost:3220'
const ZIEL = 'docs/bilder/g407'
mkdirSync(ZIEL, { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({
  colorScheme: 'dark', viewport: { width: 1600, height: 1100 },
})
const p = await ctx.newPage()
const fehler = []
p.on('pageerror', e => fehler.push(String(e).slice(0, 160)))

await p.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', 'coach@lumeos.app')
await p.fill('input[type=password]', wortFuer('coach@lumeos.app'))
await p.click('button[type=submit]')
await p.waitForURL(u => !u.pathname.startsWith('/login'), { timeout: 20000 })

// Die Struktur aus der Seite selbst holen: Bereich -> Unterpunkte.
await p.goto(`${BASIS}/?draft=overview`, { waitUntil: 'networkidle' })
const bereiche = await p.$$eval('.dp-leiste .dp-eintrag', els => els
  .map(e => new URL(e.href).searchParams.get('draft'))
  .filter(Boolean))

const zeilen = []
for (const b of bereiche) {
  await p.goto(`${BASIS}/?draft=${b}`, { waitUntil: 'networkidle' })
  const kinder = await p.$$eval('.dp-inhalt .v2-tab', els => els
    .map(e => new URL(e.href).searchParams.get('kind'))
    .filter(Boolean))
  const punkte = kinder.length ? kinder : [null]

  for (const k of punkte) {
    const url = k ? `${BASIS}/?draft=${b}&kind=${k}` : `${BASIS}/?draft=${b}`
    await p.goto(url, { waitUntil: 'networkidle' })
    await p.waitForTimeout(200)
    const m = await p.evaluate(() => {
      const inhalt = document.querySelector('.dp-inhalt')
      if (!inhalt) return null
      // Nur Kacheln der obersten Ebene zaehlen — verschachtelte
      // wuerden doppelt zaehlen.
      const alle = [...inhalt.querySelectorAll('.v2-card')]
      const karten = alle.filter(c => !c.parentElement?.closest('.v2-card'))
      return {
        karten: karten.length,
        vermerke: inhalt.querySelectorAll('.dk-attrappe').length,
        kpi: inhalt.querySelectorAll('.v2-kpi').length,
        tabellen: inhalt.querySelectorAll('table').length,
        leerOhneGrund: inhalt.querySelectorAll('.v2-leer').length,
      }
    })
    zeilen.push({ bereich: b, kind: k, ...m })
    console.log(`${b.padEnd(10)} ${(k ?? '—').padEnd(11)}`,
      `Karten=${String(m.karten).padStart(2)}`,
      `Vermerke=${String(m.vermerke).padStart(2)}`,
      `KPI=${String(m.kpi).padStart(2)}`,
      `Tab=${m.tabellen}`,
      m.leerOhneGrund ? `LEER=${m.leerOhneGrund}` : '')
  }

  await p.goto(`${BASIS}/?draft=${b}`, { waitUntil: 'networkidle' })
  await p.screenshot({ path: `${ZIEL}/${b}.png` })
}

const k = zeilen.reduce((s, z) => s + z.karten, 0)
const v = zeilen.reduce((s, z) => s + z.vermerke, 0)
console.log(`\nUnterpunkte gemessen: ${zeilen.length}`)
console.log(`Kacheln gesamt      : ${k}`)
console.log(`davon mit Vermerk   : ${v}  (= Attrappe)`)
console.log(`davon aus Daten     : ${k - v}`)
console.log(`Leerzustaende       : ${zeilen.reduce((s, z) => s + z.leerOhneGrund, 0)}`)
if (fehler.length) console.log('SEITENFEHLER:', fehler.slice(0, 3))

writeFileSync(`${ZIEL}/kacheln.json`, JSON.stringify(zeilen, null, 1))
await browser.close()
