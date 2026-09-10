// G-409/A1: jeden Klick im Draft anklicken und pruefen, wo er landet.
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { wortFuer } from './konten.mjs'
const [,, ziel, ...schritte] = process.argv
mkdirSync(ziel, { recursive: true })
const b = await chromium.launch()
const c = await b.newContext({ colorScheme: 'dark', viewport: { width: 1600, height: 1100 } })
const p = await c.newPage()
await p.goto('http://localhost:3220/login', { waitUntil: 'networkidle' })
await p.fill('input[type=email]', 'coach@lumeos.app')
await p.fill('input[type=password]', wortFuer('coach@lumeos.app'))
await p.click('button[type=submit]')
await p.waitForURL(u => !u.pathname.startsWith('/login'), { timeout: 20000 })
for (const s of schritte) {
  const i = s.indexOf('=')
  const [name, rest] = [s.slice(0, i), s.slice(i + 1)]
  const [url, sel] = rest.split('|')
  await p.goto('http://localhost:3220' + url, { waitUntil: 'networkidle' })
  if (sel) { await p.click(sel); await p.waitForTimeout(400) }
  await p.screenshot({ path: `${ziel}/${name}.png` })
  const m = await p.evaluate(() => ({
    schale: !!document.querySelector('.dp-app'),
    kontext: !!document.querySelector('.dp-kontext'),
    karten: document.querySelectorAll('.dp-inhalt .v2-card').length,
  }))
  console.log(`${name.padEnd(14)} ${p.url().replace('http://localhost:3220','')}`)
  console.log(`   Schale=${m.schale} Kontext=${m.kontext} Karten=${m.karten}`)
}
await b.close()
