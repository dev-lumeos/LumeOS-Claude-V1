// G-430/A7 - sehen die vier Module unveraendert aus, wo sie sollen?
//
// `[read]` **Die Aufteilung liegt in `packages/ui`** - und das gehoert
// allen Apps. **Also wird gemessen, ob ausser dem Ruecken etwas
// gewandert ist.**
//
// `[cmd]` **Je Modul: Kachelzahl, Flaechenzahl auf der Karte,
// Seitenfehler** - und ein Bild.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const ZIEL = process.argv[2] ?? 'http://localhost:3200'
const KONTO = process.argv[3] ?? 'test-user@lumeos.local'

const b = await chromium.launch()
const c = await b.newContext({ colorScheme: 'dark', viewport: { width: 1680, height: 1400 } })
const p = await c.newPage()
const fehler = []
p.on('pageerror', e => fehler.push(String(e).slice(0, 160)))

await p.goto(`${ZIEL}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', KONTO)
await p.fill('input[type=password]', wortFuer(KONTO))
await p.click('button[type=submit]')
await p.waitForURL(u => !u.pathname.includes('login'), { timeout: 25000 })

const SEITEN = [
  ['recovery', '/v2/recovery'],
  ['supplements', '/v2/supplements?tab=injection'],
  ['medical', '/v2/medical'],
  ['coach', '/v2/coach'],
]

console.log(`\n=== G-430/A7 — Regression, ${KONTO} ===\n`)
for (const [name, pfad] of SEITEN) {
  fehler.length = 0
  await p.goto(`${ZIEL}${pfad}`, { waitUntil: 'networkidle' })
  await p.waitForTimeout(1700)
  const m = await p.evaluate(() => {
    const karten = [...document.querySelectorAll('.v2-card')]
    const aeussere = karten.filter(k => !k.parentElement?.closest('.v2-card'))
    const flaechen = [...document.querySelectorAll('[data-muskel]')]
      .map(g => g.getAttribute('data-muskel'))
      .filter((v, i, a) => v && a.indexOf(v) === i)
    return {
      kacheln: aeussere.length,
      zeichen: document.body.innerText.length,
      flaechen: flaechen.length,
      // Steht eine der alten Flaechen noch irgendwo?
      alt: flaechen.filter(f => f === 'upper-back' || f === 'lower-back'),
      neu: flaechen.filter(f => ['latissimus', 'teres-major', 'teres-minor',
        'erector-spinae', 'flanke'].includes(f)),
    }
  })
  console.log(`${name.padEnd(13)} Kacheln ${String(m.kacheln).padStart(3)}`
    + `  Zeichen ${String(m.zeichen).padStart(5)}`
    + `  Kartenflaechen ${String(m.flaechen).padStart(2)}`
    + `  neu ${m.neu.length}  alt ${m.alt.length}`
    + `  Fehler ${fehler.length}`)
  if (fehler.length > 0) console.log(`              ${JSON.stringify(fehler.slice(0, 2))}`)
  await p.screenshot({ path: `docs/bilder/g430/a7-${name}.png`, fullPage: false })
}

console.log('\nBilder: docs/bilder/g430/a7-*.png')
await b.close()
