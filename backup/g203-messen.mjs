// G-203: die Abschnitte von `ladeRegeln`, je Konto.
//
// Aufruf: node backup/g203-messen.mjs
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'

const BASIS = 'http://127.0.0.1:3200'
const KONTEN = ['dev@lumeos.app', 'test-user@lumeos.local']

for (const konto of KONTEN) {
  const b = await chromium.launch()
  const s = await b.newContext({ viewport: { width: 1280, height: 900 } })
  const p = await s.newPage()
  await p.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
  await p.fill('input[type="email"]', konto)
  await p.fill('input[type="password"]', wortFuer(konto))
  await p.click('button[type="submit"]')
  await p.waitForURL(u => !u.pathname.includes('/login'), { timeout: 30000 })

  // Dreimal, damit der erste (uebersetzende) Lauf erkennbar ist.
  for (let i = 1; i <= 3; i++) {
    const t = Date.now()
    const a = await p.request.get(`${BASIS}/api/messung-g203`)
    const rund = Date.now() - t
    if (!a.ok()) {
      console.log(`${konto} Lauf ${i}: HTTP ${a.status()}`)
      console.log((await a.text()).slice(0, 200))
      break
    }
    const d = await a.json()
    console.log(`\n══ ${konto} · Lauf ${i} ══`)
    for (const [k, v] of Object.entries(d)) {
      console.log(`  ${k.padEnd(28)} ${v}`)
    }
    console.log(`  ${'(Antwort der Route gesamt)'.padEnd(28)} ${rund} ms`)
  }
  await b.close()
}
