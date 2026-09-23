// G-405/A5: je Bereich ein Bild, DUNKEL — und die Struktur am
// SCHIRM gemessen, nicht im Quelltext.
//
// `[read]` **Ein Quelltextzaehler haette gesagt, was gerendert werden
// SOLL.** **Dieses Skript zaehlt, was DA IST** — die Lehre aus den
// Attrappen, wo der Quelltext um Faktor 3 danebenlag.
//
// `[cmd]` **`colorScheme: 'dark'`** — apps/coach liest
// `prefers-color-scheme`, es gibt keinen Modus-Keks.
// `@playwright/test`, nicht `playwright` — nur ersteres steht in der
// Wurzel-package.json (`"@playwright/test": "1.41.2"`), und alle
// anderen Werkzeuge in `tools/` rufen es so.
import { chromium } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { wortFuer } from './konten.mjs'

const BASIS = 'http://localhost:3220'
const KONTO = 'coach@lumeos.app'
const ZIEL = 'docs/bilder/g405'

const BEREICHE = [
  'overview', 'athletes', 'checkins', 'assist', 'calendar', 'plans',
  'library', 'alerts', 'analytics', 'inbox', 'team',
]

mkdirSync(ZIEL, { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({
  colorScheme: 'dark',
  viewport: { width: 1600, height: 1000 },
})
const p = await ctx.newPage()

// ── Anmelden ────────────────────────────────────────────────────
await p.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', KONTO)
await p.fill('input[type=password]', wortFuer(KONTO))
await p.click('button[type=submit]')
await p.waitForURL(u => !u.pathname.startsWith('/login'), { timeout: 20000 })
await p.waitForLoadState('networkidle')
console.log('angemeldet als', KONTO, '->', p.url())

const bericht = []

for (const b of BEREICHE) {
  await p.goto(`${BASIS}/?draft=${b}`, { waitUntil: 'networkidle' })
  await p.waitForTimeout(300)

  const m = await p.evaluate(() => {
    const app = document.querySelector('.dp-app')
    if (!app) return { fehler: 'keine .dp-app — die Draft-Schale rendert nicht' }
    const cs = getComputedStyle(app)
    const kontext = document.querySelector('.dp-kontext')
    const sicht = el => {
      if (!el) return false
      const r = el.getBoundingClientRect()
      return r.width > 0 && r.height > 0
    }
    return {
      raster: cs.gridTemplateColumns,
      // Die Seitenleiste fuehrt NUR Eltern (Regel aus Zeile 2).
      leisteEintraege: document.querySelectorAll('.dp-leiste .dp-eintrag').length,
      gruppen: document.querySelectorAll('.dp-leiste .dp-gruppe-titel').length,
      badges: [...document.querySelectorAll('.dp-leiste .dp-badge')]
        .map(e => e.textContent.trim()),
      // Die Unterpunkte stehen IM INHALT.
      unternav: document.querySelectorAll('.dp-inhalt .v2-tabs .v2-tab').length,
      // Der Modulkopf.
      titel: document.querySelector('.v2-module-title')?.textContent?.trim() ?? null,
      pills: document.querySelectorAll('.v2-module-title-row .v2-pill').length,
      aktionen: document.querySelectorAll('.v2-module-actions button').length,
      // Die Kontextspalte.
      kontextBreite: kontext ? Math.round(kontext.getBoundingClientRect().width) : 0,
      kontextSichtbar: sicht(kontext),
      insights: document.querySelectorAll('.dp-insight').length,
      details: document.querySelectorAll('.dp-detail').length,
      // Attrappenvermerke, die WIRKLICH am Schirm stehen.
      vermerke: [...document.querySelectorAll('.v2-empty-title, .v2-empty h3, .v2-empty')]
        .map(e => e.textContent.trim()).filter(t => /Attrappe/.test(t)).length,
      hg: getComputedStyle(document.body).backgroundColor,
    }
  })

  await p.screenshot({ path: `${ZIEL}/${b}.png`, fullPage: false })
  bericht.push({ bereich: b, ...m })
  console.log(
    `${b.padEnd(10)} raster=${(m.raster ?? '-').slice(0, 34).padEnd(34)}`,
    `unternav=${String(m.unternav ?? '-').padStart(2)}`,
    `pills=${m.pills ?? '-'} akt=${m.aktionen ?? '-'}`,
    `ktx=${m.kontextBreite ?? '-'}px ins=${m.insights ?? '-'} det=${m.details ?? '-'}`,
    m.fehler ? `FEHLER: ${m.fehler}` : '')
}

// Die Kontextspalte abschaltbar? Der Knopf, nicht die Behauptung.
await p.goto(`${BASIS}/?draft=overview`, { waitUntil: 'networkidle' })
const vor = await p.evaluate(() =>
  ({ n: document.querySelectorAll('.dp-kontext').length,
     raster: getComputedStyle(document.querySelector('.dp-app')).gridTemplateColumns }))
await p.click('.dp-icon-knopf[title="Kontextspalte umschalten"]')
await p.waitForTimeout(250)
const nach = await p.evaluate(() =>
  ({ n: document.querySelectorAll('.dp-kontext').length,
     raster: getComputedStyle(document.querySelector('.dp-app')).gridTemplateColumns }))
console.log('\nSchalter:', JSON.stringify(vor), '->', JSON.stringify(nach))
await p.screenshot({ path: `${ZIEL}/overview-kontext-zu.png` })

writeFileSync(`${ZIEL}/messung.json`,
  JSON.stringify({ bereiche: bericht, schalter: { vor, nach } }, null, 2))

await browser.close()
console.log('\nBilder in', ZIEL)
