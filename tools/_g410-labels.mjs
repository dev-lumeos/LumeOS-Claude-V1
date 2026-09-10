// Welche Beschriftungen stehen am Schirm noch englisch? — G-410.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const B = 'http://localhost:3220'
const b = await chromium.launch()
const c = await b.newContext({ colorScheme: 'dark', viewport: { width: 1600, height: 1200 } })
const p = await c.newPage()
await p.goto(`${B}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', 'coach@lumeos.app')
await p.fill('input[type=password]', wortFuer('coach@lumeos.app'))
await p.click('button[type=submit]')
await p.waitForURL(u => !u.pathname.startsWith('/login'), { timeout: 20000 })
await p.goto(`${B}/?draft=athletes&kind=record`, { waitUntil: 'networkidle' })
const alle = new Set()
for (const r of ['Overview','Training','Nutrition','Recovery','Supplements','Body','Medical','Timeline']) {
  await p.click(`.dk-modulwahl button:has-text("${r}")`)
  await p.waitForTimeout(200)
  const l = await p.evaluate(() => [
    ...document.querySelectorAll('.dp-inhalt .v2-eyebrow, .dp-inhalt .v2-row-l, .dp-inhalt .dk-balken-label'),
  ].map(e => e.textContent.trim()))
  l.forEach(x => alle.add(x))
}
await b.close()
console.log([...alle].sort().join('\n'))
