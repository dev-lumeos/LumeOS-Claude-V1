// G-421/A1 - welche Reiter zeigt Goals & Body, und was steht darin?
//
// `[cmd]` **`vollstaendigkeit.mjs` meldet vier fehlende Reiter.**
// `[read]` **Das Werkzeug misst NAMEN** - und Namen wurden heute
// viermal falsch geraten. **Deshalb am Schirm.**
//
// `[read]` **Je Reiter: die Kacheltitel.** Eine Kachel, die da ist,
// hat einen Titel; eine fehlende hat keinen.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const ZIEL = process.argv[2] ?? 'http://localhost:3200'
const MARKE = process.argv[3] ?? 'ist'

const REITER = [
  'goals', 'phase', 'tdee', 'cross', 'timeline',
  'metrics', 'measure', 'comp', 'physique', 'poses',
]

const b = await chromium.launch()
const c = await b.newContext({ colorScheme: 'dark', viewport: { width: 1680, height: 1400 } })
const p = await c.newPage()

const fehler = []
p.on('console', m => { if (m.type() === 'error') fehler.push(m.text().slice(0, 120)) })
p.on('pageerror', e => fehler.push(`SEITENFEHLER: ${String(e).slice(0, 120)}`))

await p.goto(`${ZIEL}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', 'dev@lumeos.app')
await p.fill('input[type=password]', wortFuer('dev@lumeos.app'))
await p.click('button[type=submit]')
await p.waitForURL(u => !u.pathname.includes('login'), { timeout: 25000 })

for (const r of REITER) {
  fehler.length = 0
  await p.goto(`${ZIEL}/v2/goals?tab=${r}`, { waitUntil: 'networkidle' })
  await p.waitForTimeout(1300)

  const l = await p.evaluate(() => {
    // `[read]` **Die Kacheln der Seite** - jede `.v2-card` traegt
    // einen Titel. **Verschachtelte zaehlen einmal**, deshalb nur
    // solche, die keine Karte ueber sich haben.
    const karten = [...document.querySelectorAll('.v2-card')]
      .filter(k => !k.parentElement?.closest('.v2-card'))
      .map(k => ({
        titel: (k.querySelector('h3, h2, .v2-card-title')?.textContent ?? '').trim(),
        // Traegt sie eine Attrappenmarke?
        attrappe: /mockup|attrappe|entwurf|draft/i.test(k.className)
          || Boolean(k.querySelector('[data-attrappe]')),
        hoehe: Math.round(k.getBoundingClientRect().height),
      }))
    // Die Trennlinie der Mockup-Referenz.
    const txt = document.body.innerText
    return {
      karten,
      referenz: /mockup|referenz/i.test(txt),
      leer: txt.includes('Kein') || txt.includes('keine Daten'),
      zeichen: txt.length,
    }
  })

  console.log(`\n=== ${r} ===  ${l.karten.length} Kacheln`)
  l.karten.forEach(k => console.log(`   ${k.titel || '(ohne Titel)'}  ${k.hoehe}px${k.attrappe ? '  [Attrappe]' : ''}`))
  if (fehler.length) console.log(`   FEHLER: ${fehler.slice(0, 2).join(' | ')}`)

  await p.screenshot({ path: `docs/bilder/g421/${MARKE}-${r}.png`, fullPage: true })
}

await b.close()
