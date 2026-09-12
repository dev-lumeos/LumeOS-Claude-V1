// G-433 - sind die NEUEN Flaechen einzeln anwaehlbar?
//
// `[cmd]` **Die erste Fassung klickte immer dasselbe Element** - die
// neuen Flaechen liegen groesstenteils auf der VORDERansicht, und
// `locator(...).first()` traf die Rueckansicht-Karte, wo es sie nicht
// gibt. **Alle Klicks meldeten `["latissimus"]`** - der alte Zustand.
//
// `[read]` **Also je Flaeche den Punkt suchen, der WIRKLICH auf ihr
// liegt** - dieselbe Lehre wie bei der Sichel in G-432.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const ZIEL = process.argv[2] ?? 'http://localhost:3200'
const KONTO = process.argv[3] ?? 'test-user@lumeos.local'

const b = await chromium.launch()
const c = await b.newContext({ colorScheme: 'dark', viewport: { width: 1680, height: 1500 } })
const p = await c.newPage()
const fehler = []
p.on('pageerror', e => fehler.push(String(e).slice(0, 180)))

await p.goto(`${ZIEL}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', KONTO)
await p.fill('input[type=password]', wortFuer(KONTO))
await p.click('button[type=submit]')
await p.waitForURL(u => !u.pathname.includes('login'), { timeout: 25000 })

await p.goto(`${ZIEL}/v2/recovery?tab=checkin`, { waitUntil: 'networkidle' })
await p.waitForTimeout(1800)

async function hervorgehoben() {
  return p.evaluate(() => {
    const aus = []
    for (const g of document.querySelectorAll('[data-muskel]')) {
      const pfad = g.querySelector('path')
      if (!pfad) continue
      const sw = Number(getComputedStyle(pfad).strokeWidth.replace('px', '')) || 0
      if (sw > 1.2) aus.push(g.getAttribute('data-muskel'))
    }
    return [...new Set(aus)]
  })
}

/**
 * Einen Punkt finden, der WIRKLICH auf der Flaeche liegt.
 *
 * `[read]` **Ueber ALLE Vorkommen** - eine Flaeche kann in beiden
 * Ansichten stehen, und nur eine davon zeigt sie.
 */
async function treffer(code) {
  return p.evaluate((c2) => {
    for (const g of document.querySelectorAll(`[data-muskel="${c2}"]`)) {
      const r = g.getBoundingClientRect()
      if (r.width < 1 || r.height < 1) continue
      // `[cmd]` **9x9 war zu grob** — `adductor-longus`,
      // `adductor-brevis` und `achillessehne` sind schmale Sicheln,
      // und kein Rasterpunkt lag auf ihnen. **Jetzt 29x29.**
      for (let i = 1; i <= 29; i += 1) {
        for (let j = 1; j <= 29; j += 1) {
          const x = r.left + (r.width * i) / 30, y = r.top + (r.height * j) / 30
          const el = document.elementFromPoint(x, y)
          if (el && el.closest('[data-muskel]')?.getAttribute('data-muskel') === c2) {
            return { x, y }
          }
        }
      }
    }
    return null
  }, code)
}

const NEU = [
  'rectus-femoris', 'vastus-lateralis', 'vastus-medialis',
  'adductor-longus', 'adductor-magnus', 'adductor-brevis',
  'gastrocnemius-lateralis', 'gastrocnemius-medialis', 'achillessehne',
  'serratus-anterior', 'external-oblique',
  'rectus-abdominis', 'tendinous-inscriptions',
  'triceps-longum', 'triceps-lateralis', 'triceps-mediale',
  'forearm-flexors', 'brachioradialis', 'forearm-extensors',
  'forearm-extensors-ulnar', 'sternocleidomastoid', 'nacken',
]

console.log(`\n=== G-433: die neuen Flaechen, ${KONTO} ===\n`)
let gut = 0, schlecht = []
for (const code of NEU) {
  const t = await treffer(code)
  if (!t) {
    // `[read]` **Wer liegt stattdessen oben?** — das unterscheidet
    // „nicht gezeichnet" von „verdeckt".
    const wer = await p.evaluate((c2) => {
      for (const g of document.querySelectorAll(`[data-muskel="${c2}"]`)) {
        const r = g.getBoundingClientRect()
        if (r.width < 1 || r.height < 1) continue
        const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
        return {
          kasten: `${Math.round(r.width)}x${Math.round(r.height)}`,
          oben: el?.closest('[data-muskel]')?.getAttribute('data-muskel') ?? el?.tagName ?? '?',
        }
      }
      return null
    }, code)
    console.log(`  ${code.padEnd(26)} KEIN TREFFPUNKT  `
      + `(${wer?.kasten ?? '?'} px, oben liegt: ${wer?.oben ?? '?'})`)
    schlecht.push(code); continue
  }
  await p.mouse.click(t.x, t.y)
  await p.waitForTimeout(500)
  const n = await hervorgehoben()
  const ok = n.length === 1 && n[0] === code
  console.log(`  ${code.padEnd(26)} ${JSON.stringify(n)} ${ok ? '' : '  <-- NICHT er selbst'}`)
  if (ok) gut += 1; else schlecht.push(code)
}

console.log(`\n${gut} von ${NEU.length} einzeln anwaehlbar.`)
if (schlecht.length) console.log(`Nicht: ${schlecht.join(', ')}`)

await p.screenshot({ path: 'docs/bilder/g433/neue-flaechen.png' })
console.log(`\nSeitenfehler: ${fehler.length} ${JSON.stringify(fehler.slice(0, 2))}`)
await b.close()
