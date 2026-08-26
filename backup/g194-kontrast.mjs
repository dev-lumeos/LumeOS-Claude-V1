// G-194: Kontrast der Ueberschriftenfarben, in BEIDEN Themen.
//
// ══ WARUM UEBER CANVAS ═════════════════════════════════════════════
//
// `[cmd]` **Die erste Fassung las `getComputedStyle().color` und kam
// auf Unsinn** — `--fg` gegen `--bg` ergab 1.0. Ursache: Chrome gibt
// `oklch(0.55 0.13 80)` woertlich zurueck, und die Zahlen daraus als
// RGB zu lesen ist falsch. **Canvas zwingt zur Aufloesung nach sRGB**;
// `getImageData` liefert dann echte Bytes.
//
// `[read]` **Die Schwelle ist 4.5:1** (WCAG AA, Normaltext). Die
// Ueberschriften sind 10 px und in Grossbuchstaben — das ist KEIN
// Grosstext im Sinne der Norm (dafuer braucht es 18.66 px, oder
// 14 px fett). **Also 4.5, nicht 3.0.**
//
// Aufruf: node backup/g194-kontrast.mjs
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'

const BASIS = 'http://127.0.0.1:3200'
const KONTO = process.env.LUMEOS_KONTO ?? 'test-user@lumeos.local'

const TOKENS = ['--warn', '--acc', '--pos', '--neg', '--acc-suppl',
  '--fg', '--fg-muted', '--fg-dim']
const GRUENDE = ['--surface', '--bg-elev', '--bg', '--surface-2']

const b = await chromium.launch()
const s = await b.newContext({ viewport: { width: 1440, height: 900 } })
const p = await s.newPage()

await p.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type="email"]', KONTO)
await p.fill('input[type="password"]', wortFuer(KONTO))
await p.click('button[type="submit"]')
await p.waitForURL(u => !u.pathname.includes('/login'), { timeout: 30000 })
await p.goto(`${BASIS}/v2/supplements?tab=database`, { waitUntil: 'networkidle' })

const messen = async (thema) => p.evaluate(
  ({ tokens, gruende, thema }) => {
    document.documentElement.setAttribute('data-theme', 'lume')
    // `[cmd]` Der Schalter ist `data-mode`, NICHT `data-theme`:
    // `lume` allein ist dunkel, mit `data-mode='light'` hell.
    if (thema === 'light') document.documentElement.setAttribute('data-mode', 'light')
    else document.documentElement.removeAttribute('data-mode')
    const cs = getComputedStyle(document.documentElement)
    const cv = document.createElement('canvas')
    cv.width = cv.height = 1
    const ctx = cv.getContext('2d', { willReadFrequently: true })

    /** Ein Tokenwert nach echten sRGB-Bytes. */
    const rgb = (token) => {
      const wert = cs.getPropertyValue(token).trim()
      ctx.clearRect(0, 0, 1, 1)
      ctx.fillStyle = '#000'
      ctx.fillStyle = wert          // ungueltig => bleibt schwarz
      ctx.fillRect(0, 0, 1, 1)
      const d = ctx.getImageData(0, 0, 1, 1).data
      return { rgb: [d[0], d[1], d[2]], wert }
    }
    const lum = ([r, g, bl]) => {
      const f = (v) => {
        const x = v / 255
        return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)
      }
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl)
    }
    const verh = (a, b) => {
      const [h, n] = [lum(a), lum(b)].sort((x, y) => y - x)
      return (h + 0.05) / (n + 0.05)
    }

    const aus = { istHell: null, werte: {} }
    const bg = rgb('--bg')
    aus.istHell = lum(bg.rgb) > 0.5
    for (const t of tokens) {
      const f = rgb(t)
      aus.werte[t] = { wert: f.wert, gegen: {} }
      for (const g of gruende) {
        aus.werte[t].gegen[g] = Math.round(verh(f.rgb, rgb(g).rgb) * 100) / 100
      }
    }
    return aus
  }, { tokens: TOKENS, gruende: GRUENDE, thema })

// `[cmd]` Welches Thema hell ist, wird ueber die Leuchtdichte
// gegengeprueft — nicht ueber den Namen des Attributs.
for (const thema of ['dunkel', 'light']) {
  const d = await messen(thema)
  console.log(`\n══ ${thema} — ${d.istHell ? 'HELL' : 'DUNKEL'} ══`)
  console.log(`${'Token'.padEnd(13)}${GRUENDE.map(g => g.replace('--', '').padStart(10)).join('')}`)
  for (const [t, w] of Object.entries(d.werte)) {
    const zeile = GRUENDE.map(g => {
      const v = w.gegen[g]
      return `${v < 4.5 ? '!' : ' '}${String(v).padStart(8)} `
    }).join('')
    console.log(`${t.padEnd(13)}${zeile}`)
  }
}
console.log('\n! = unter 4.5:1')

await b.close()
