import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { wortFuer } from './konten.mjs'
const [,, ziel, ...pfade] = process.argv
mkdirSync(ziel, { recursive: true })
const b = await chromium.launch()
const c = await b.newContext({ colorScheme: 'dark', viewport: { width: 1600, height: 1100 } })
const p = await c.newPage()
const fehler = []
p.on('pageerror', e => fehler.push(String(e).slice(0, 200)))
await p.goto('http://localhost:3220/login', { waitUntil: 'networkidle' })
await p.fill('input[type=email]', 'coach@lumeos.app')
await p.fill('input[type=password]', wortFuer('coach@lumeos.app'))
await p.click('button[type=submit]')
await p.waitForURL(u => !u.pathname.startsWith('/login'), { timeout: 20000 })
for (const s of pfade) {
  //  **Nur am ERSTEN Gleichheitszeichen trennen** — die
  // Adresse traegt selbst welche (). Der erste
  // Anlauf schnitt sie ab und mass dreimal das Dashboard.
  const i = s.indexOf('=')
  const name = s.slice(0, i)
  const url = s.slice(i + 1)
  await p.goto('http://localhost:3220' + url, { waitUntil: 'networkidle' })
  await p.waitForTimeout(350)
  const m = await p.evaluate(() => ({
    karten: document.querySelectorAll('.dp-inhalt .v2-card').length,
    vermerke: document.querySelectorAll('.dp-inhalt .dk-attrappe').length,
    leer: document.querySelectorAll('.dp-inhalt .v2-leer').length,
  }))
  await p.screenshot({ path: `${ziel}/${name}.png` })
  console.log(`${name.padEnd(12)} Karten=${m.karten} Vermerke=${m.vermerke} Leer=${m.leer}`)
}
if (fehler.length) console.log('SEITENFEHLER:', fehler.slice(0, 3))
await b.close()
