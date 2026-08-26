// G-197: traegt der rosa Boden nur Supplements, oder alle Module?
//
// `[read]` **Die Frage entscheidet, wo es geloest wird.** Wenn
// Recovery und Training denselben Ton tragen, ist es kein
// Supplements-Problem, sondern eines des Designsystems — und dann
// gehoert es gemeldet, nicht hier repariert.
//
// Gemessen wird der Akzentton je Modul und was `color-mix(--acc 4%)`
// daraus macht.
//
// Aufruf: node backup/g197-module.mjs
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'

const BASIS = 'http://127.0.0.1:3200'
const KONTO = process.env.LUMEOS_KONTO ?? 'test-user@lumeos.local'
const MODULE = ['dashboard', 'nutrition', 'training', 'recovery',
  'supplements', 'goals', 'medical', 'coach']

async function lauf(modus) {
  const b = await chromium.launch()
  const s = await b.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: modus === 'hell' ? 'light' : 'dark',
  })
  const p = await s.newPage()
  await p.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
  await p.fill('input[type="email"]', KONTO)
  await p.fill('input[type="password"]', wortFuer(KONTO))
  await p.click('button[type="submit"]')
  await p.waitForURL(u => !u.pathname.includes('/login'), { timeout: 30000 })

  const aus = []
  for (const m of MODULE) {
    await p.goto(`${BASIS}/v2/${m}`, { waitUntil: 'domcontentloaded' })
    await p.waitForTimeout(500)
    aus.push(await p.evaluate((modul) => {
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
      //  **Der Akzent haengt an , nicht
      // an der Wurzel.** Die erste Fassung las an 
      // und meldete fuer alle acht Module denselben Wert — das war
      // die Messung, nicht das System.
      const wurzel = document.querySelector('[class*="lume-shell-"]')
        ?? document.querySelector('.v2-supp-tafel')
        ?? document.documentElement
      const cs = getComputedStyle(wurzel)
      const t = (n) => cs.getPropertyValue(n).trim()
      // Der Ton, den `.v2-supp-tafel` benutzt: 4 % Akzent auf bg-elev.
      const boden = `color-mix(in oklch, ${t('--acc')} 4%, ${t('--bg-elev')})`
      return {
        modul,
        gemessenAn: wurzel.className ? String(wurzel.className).slice(0,34) : "(wurzel)",
        acc: t('--acc'),
        bgElev: t('--bg-elev'),
        // Wie stark weicht der getoente Boden vom reinen ab?
        boden_lum: Math.round(lum(by(boden)) * 1000) / 1000,
        rein_lum: Math.round(lum(by(t('--bg-elev'))) * 1000) / 1000,
        // Und was kostet es den Warntext darauf?
        warn_auf_toenung: verh(by(t('--warn')),
          by(`color-mix(in oklch, ${t('--warn')} 5%, ${boden})`)),
        warn_auf_rein: verh(by(t('--warn')),
          by(`color-mix(in oklch, ${t('--warn')} 5%, ${t('--bg-elev')})`)),
      }
    }, m))
  }
  await b.close()
  return aus
}

for (const modus of ['hell', 'dunkel']) {
  console.log(`\n══ ${modus} ═══════════════════════════════════════════`)
  console.log(`${'Modul'.padEnd(13)}${'--acc'.padEnd(24)}`
    + `${'Boden'.padStart(8)}${'rein'.padStart(8)}`
    + `${'warn/ton'.padStart(10)}${'warn/rein'.padStart(11)}`)
  for (const z of await lauf(modus)) {
    const flag = z.warn_auf_toenung < 4.5 ? ' !' : ''
    console.log(`${z.modul.padEnd(13)}${z.acc.padEnd(24)}`
      + `${String(z.boden_lum).padStart(8)}${String(z.rein_lum).padStart(8)}`
      + `${String(z.warn_auf_toenung).padStart(10)}`
      + `${String(z.warn_auf_rein).padStart(11)}${flag}`)
  }
}
console.log('\n! = Warntext auf getoentem Boden unter 4.5:1')
