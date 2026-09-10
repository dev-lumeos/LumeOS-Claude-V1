// G-407/A3: zeigt apps/web nach der Paketaenderung dasselbe wie
// vorher?
//
// `[read]` **Die Paketaenderung trennt `.v2-empty` (Zeile) von
// `.v2-leer` (Block).** `[cmd]` **VIER rohe `div.v2-empty` in
// apps/web bauen auf die Zeile** — die duerfen sich nicht bewegen.
// `[cmd]` **56 Aufrufer von `Empty` bekommen den Block** — der sah
// vorher kaputt aus (alles in einer Zeile) und ist jetzt richtig.
//
// `[read]` **Also misst diese Probe ZWEI Sachen getrennt:**
// die Zeile muss GLEICH bleiben, der Block DARF sich aendern —
// und zwar genau so, wie es gemeint war.
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { wortFuer } from './konten.mjs'

const BASIS = 'http://localhost:3200'
const KONTO = 'test-user@lumeos.local'
const ZIEL = process.argv[2] ?? 'docs/bilder/g407/web-nachher'

// Seiten, die beide Bauformen zeigen.
const SEITEN = [
  ['nutrition', '/v2/nutrition'],
  ['coach', '/v2/coach'],
]

mkdirSync(ZIEL, { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({
  colorScheme: 'dark',
  viewport: { width: 1600, height: 1000 },
})
const p = await ctx.newPage()

await p.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (p.url().includes('login')) {
  await p.fill('input[type=email]', KONTO)
  await p.fill('input[type=password]', wortFuer(KONTO))
  await p.click('button[type=submit]')
  await p.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })
}
await p.waitForLoadState('networkidle')
console.log('angemeldet ->', p.url())

const mass = []
for (const [name, pfad] of SEITEN) {
  await p.goto(`${BASIS}${pfad}`, { waitUntil: 'networkidle' })
  await p.waitForTimeout(400)

  const m = await p.evaluate(() => {
    const kasten = (sel) => [...document.querySelectorAll(sel)].map(e => {
      const r = e.getBoundingClientRect()
      const cs = getComputedStyle(e)
      return {
        w: Math.round(r.width), h: Math.round(r.height),
        display: cs.display, textAlign: cs.textAlign,
        text: (e.textContent ?? '').trim().slice(0, 40),
      }
    })
    return { zeile: kasten('.v2-empty'), block: kasten('.v2-leer') }
  })
  await p.screenshot({ path: `${ZIEL}/${name}.png`, fullPage: false })
  mass.push({ seite: name, ...m })
  console.log(`${name.padEnd(12)} Zeilen(.v2-empty)=${m.zeile.length}`,
    `Bloecke(.v2-leer)=${m.block.length}`)
  for (const z of m.zeile) console.log(`   ZEILE  ${z.display.padEnd(6)} ${z.w}x${z.h}  "${z.text}"`)
  for (const b of m.block) console.log(`   BLOCK  ${b.display.padEnd(6)} ${b.w}x${b.h}  "${b.text}"`)
}

await browser.close()
console.log('\nBilder in', ZIEL)
