// G-423/A1 - welche Reiter zeigt Supplements, und was steht darin?
//
// `[read]` **Am Schirm, nicht im Werkzeug** - `vollstaendigkeit.mjs`
// misst Namen, und die waren heute fuenfmal falsch geraten.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const ZIEL = process.argv[2] ?? 'http://localhost:3200'
const MARKE = process.argv[3] ?? 'ist'
const KONTO = process.argv[4] ?? 'dev@lumeos.app'

const REITER = [
  'today', 'stack', 'extended', 'catalog', 'stacks', 'intel',
  'inventory', 'injection', 'compliance', 'interactions', 'cost',
]

const b = await chromium.launch()
const c = await b.newContext({ colorScheme: 'dark', viewport: { width: 1680, height: 1400 } })
const p = await c.newPage()

const fehler = []
p.on('pageerror', e => fehler.push(`SEITENFEHLER: ${String(e).slice(0, 140)}`))

await p.goto(`${ZIEL}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', KONTO)
await p.fill('input[type=password]', wortFuer(KONTO))
await p.click('button[type=submit]')
await p.waitForURL(u => !u.pathname.includes('login'), { timeout: 25000 })

for (const r of REITER) {
  fehler.length = 0
  await p.goto(`${ZIEL}/v2/supplements?tab=${r}`, { waitUntil: 'networkidle' })
  await p.waitForTimeout(1300)

  const l = await p.evaluate(() => {
    // `[read]` **Nur die aeusseren Karten** - verschachtelte zaehlen
    // sonst doppelt.
    const karten = [...document.querySelectorAll('.v2-card')]
      .filter(k => !k.parentElement?.closest('.v2-card'))
      .map(k => ({
        titel: (k.querySelector('h3, h2, .v2-card-title')?.textContent ?? '').trim(),
        attrappe: /mockup|attrappe/i.test(k.className),
      }))
    return {
      karten,
      // Die Trennlinie der Mockup-Referenz teilt oben von unten.
      linie: document.body.innerText.includes('Mockup'),
    }
  })

  const echt = l.karten.filter(k => !k.attrappe)
  const attr = l.karten.filter(k => k.attrappe)
  console.log(`\n=== ${r} ===  ${echt.length} echt / ${attr.length} Attrappe`)
  echt.forEach(k => console.log(`   ECHT      ${k.titel || '(ohne Titel)'}`))
  attr.forEach(k => console.log(`   Attrappe  ${k.titel || '(ohne Titel)'}`))
  if (fehler.length) console.log(`   ${fehler[0]}`)

  await p.screenshot({ path: `docs/bilder/g423/${MARKE}-${r}.png`, fullPage: true })
}

await b.close()
