// G-194: der Nachweis — Ueberschrift → Bedeutung → Token → Kontrast.
//
// `[read]` **Gemessen an der GERENDERTEN Seite**, nicht an der
// Zuordnungstabelle: die Frage ist, welche Farbe der Browser malt,
// nicht welche im Code steht. Beide Themen, weil die Tokens je Thema
// andere Werte haben.
//
// Aufruf: node backup/g194-tabelle.mjs
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'

const BASIS = 'http://127.0.0.1:3200'
const KONTO = process.env.LUMEOS_KONTO ?? 'test-user@lumeos.local'
// Vier Substanzen, damit jede der vier Bedeutungen vorkommt.
const SUBSTANZEN = ['1-Testosterone', 'Creatine monohydrate', 'Semaglutide']

const b = await chromium.launch()
const s = await b.newContext({ viewport: { width: 1440, height: 1000 } })
const p = await s.newPage()

await p.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type="email"]', KONTO)
await p.fill('input[type="password"]', wortFuer(KONTO))
await p.click('button[type="submit"]')
await p.waitForURL(u => !u.pathname.includes('/login'), { timeout: 30000 })

const alle = new Map()

for (const thema of ['dunkel', 'hell'] ) {
  for (const name of SUBSTANZEN) {
    await p.goto(`${BASIS}/v2/supplements?tab=database`, { waitUntil: 'networkidle' })
    // Das Thema NACH jedem Laden neu setzen - der Server rendert es
    // aus dem Cookie, ein Klick auf eine Zeile laedt nicht neu, aber
    // ein goto schon.
    await p.evaluate((t) => {
      document.documentElement.setAttribute('data-theme', 'lume')
      //  **Entfernen genuegt NICHT.** Ein Startskript setzt
      //  sonst aus  — die erste
      // Fassung mass deshalb zweimal HELL und meldete fuer «dunkel»
      // Werte wie 1.09, die auf dunklem Grund unmoeglich sind.
      document.documentElement.setAttribute('data-mode',
        t === 'hell' ? 'light' : 'dark')
    }, thema)

    const suche = p.locator('.v2-supp-suche input, input[type="search"]').first()
    await suche.waitFor({ state: 'visible', timeout: 20000 })
    await suche.fill(name)
    await p.waitForTimeout(700)
    const zeile = p.locator('tbody tr', { hasText: name }).first()
    if (await zeile.count() === 0) continue
    await zeile.click()
    await p.waitForTimeout(800)

    // Alle Reiter durchgehen, damit auch Sicherheit/Community zaehlen.
    const reiter = p.locator('.v2-supp-reiter-knopf')
    const n = await reiter.count()
    for (let i = 0; i < n; i++) {
      await reiter.nth(i).click()
      await p.waitForTimeout(350)

      const treffer = await p.evaluate(() => {
        const cv = document.createElement('canvas')
        cv.width = cv.height = 1
        const ctx = cv.getContext('2d', { willReadFrequently: true })
        const bytes = (farbe) => {
          ctx.clearRect(0, 0, 1, 1)
          ctx.fillStyle = '#000'
          ctx.fillStyle = farbe
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
          const [h, n2] = [lum(a), lum(c)].sort((x, y) => y - x)
          return (h + 0.05) / (n2 + 0.05)
        }
        /** Der erste nicht durchsichtige Hintergrund ueber der Kette. */
        const grund = (e) => {
          for (let x = e; x; x = x.parentElement) {
            const c = getComputedStyle(x).backgroundColor
            const m = c.match(/[\d.]+/g)
            if (m && (m.length < 4 || Number(m[3]) > 0.9)) {
              return [Number(m[0]), Number(m[1]), Number(m[2])]
            }
          }
          return [0, 0, 0]
        }

        const aus = []
        for (const e of document.querySelectorAll('.v2-eyebrow')) {
          const titel = (e.textContent || '').trim()
          if (!titel) continue
          const vorne = bytes(getComputedStyle(e).color)
          aus.push({
            titel,
            ton: e.getAttribute('data-ton'),
            kontrast: Math.round(verh(vorne, grund(e)) * 100) / 100,
            groesse: getComputedStyle(e).fontSize,
          })
        }
        return aus
      })

      for (const t of treffer) {
        const key = `${thema}|${t.titel}`
        if (!alle.has(key)) alle.set(key, { thema, ...t })
      }
    }
  }
}

const TOKEN = { gefahr: '--warn', wirkung: '--acc', pruefen: '--acc-suppl',
  entwarnung: '--pos', null: '(keins)' }

for (const thema of ['dunkel', 'hell']) {
  const zeilen = [...alle.values()].filter(z => z.thema === thema)
    .sort((a, c) => String(a.ton).localeCompare(String(c.ton))
      || a.titel.localeCompare(c.titel))
  console.log(`\n══ ${thema} ═══════════════════════════════════════════`)
  console.log(`${'Ueberschrift'.padEnd(30)}${'Bedeutung'.padEnd(13)}`
    + `${'Token'.padEnd(14)}Kontrast`)
  for (const z of zeilen) {
    const flag = z.kontrast < 4.5 ? ' !' : ''
    console.log(`${z.titel.slice(0, 29).padEnd(30)}`
      + `${String(z.ton ?? '—').padEnd(13)}`
      + `${TOKEN[String(z.ton)].padEnd(14)}`
      + `${String(z.kontrast).padStart(6)}${flag}`)
  }
}
console.log('\n! = unter 4.5:1')

await b.close()
