// G-197: welcher der drei Wege bringt „Fuer wen das Verbot gilt"
// ueber 4.5:1?
//
// `[cmd]` **Gemessen im aufgeklappten Panel**, wo `--acc` wirklich
// der Supplements-Akzent ist (`oklch(0.55 0.15 25)`). Eine Messung
// an der Seitenwurzel liefert den Dashboard-Wert und ist falsch —
// das war mein erster Anlauf.
//
// Aufruf: node backup/g197-wege.mjs
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'

const BASIS = 'http://127.0.0.1:3200'
const KONTO = process.env.LUMEOS_KONTO ?? 'test-user@lumeos.local'

const b = await chromium.launch()
const s = await b.newContext({
  viewport: { width: 1440, height: 1000 }, colorScheme: 'light',
})
const p = await s.newPage()
await p.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type="email"]', KONTO)
await p.fill('input[type="password"]', wortFuer(KONTO))
await p.click('button[type="submit"]')
await p.waitForURL(u => !u.pathname.includes('/login'), { timeout: 30000 })
await p.goto(`${BASIS}/v2/supplements?tab=database`, { waitUntil: 'networkidle' })
const su = p.locator('.v2-supp-suche input, input[type="search"]').first()
await su.waitFor({ state: 'visible', timeout: 20000 })
await su.fill('1-Testosterone')
await p.waitForTimeout(900)
await p.locator('tbody tr', { hasText: '1-Testosterone' }).first().click()
await p.waitForTimeout(1400)

console.log(JSON.stringify(await p.evaluate(() => {
  const cv = document.createElement('canvas')
  cv.width = cv.height = 1
  const ctx = cv.getContext('2d', { willReadFrequently: true })
  const by = (f) => {
    ctx.clearRect(0, 0, 1, 1)
    ctx.fillStyle = 'rgba(0,0,0,0)'
    ctx.fillStyle = f
    ctx.fillRect(0, 0, 1, 1)
    const d = ctx.getImageData(0, 0, 1, 1).data
    return [d[0], d[1], d[2]]
  }
  const lum = ([r, g, bl]) => {
    const f = (v) => {
      const x = v / 255
      return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)
    }
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl)
  }
  const verh = (a, c) => {
    const [h, n] = [lum(a), lum(c)].sort((x, y) => y - x)
    return Math.round(((h + 0.05) / (n + 0.05)) * 100) / 100
  }

  const tafel = document.querySelector('.v2-supp-tafel')
  const cs = getComputedStyle(tafel)
  const t = (n) => cs.getPropertyValue(n).trim()
  const acc = t('--acc'), warn = t('--warn'), elev = t('--bg-elev')

  /** Der Warntext auf 5 % Warn-Toenung ueber einem Boden. */
  const aufBoden = (boden) => verh(by(warn),
    by(`color-mix(in oklch, ${warn} 5%, ${boden})`))

  const aus = { acc, warn, bgElev: elev, heute: {}, wege: {} }
  aus.heute.tafelBoden = cs.backgroundColor
  aus.heute.kontrast = aufBoden(cs.backgroundColor)

  // Weg 1: Ton ganz weg.
  aus.wege.ohne_ton = aufBoden(elev)
  // Weg 2: Ton abschwaechen — 4 % → 3 / 2 / 1 %.
  for (const pct of [3, 2, 1]) {
    aus.wege[`acc_${pct}pct`] =
      aufBoden(`color-mix(in oklch, ${acc} ${pct}%, ${elev})`)
  }
  // Weg 3: der Block bekommt eigenen Grund (voll deckend).
  aus.wege.eigener_grund_surface = aufBoden(t('--surface'))
  return aus
}), null, 2))

await b.close()
