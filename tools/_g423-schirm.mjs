// Was steht wirklich auf /v2/supplements?
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const ZIEL = process.argv[2] ?? 'http://localhost:3220'
const b = await chromium.launch()
const c = await b.newContext({ colorScheme: 'dark', viewport: { width: 1680, height: 1400 } })
const p = await c.newPage()
const f = []
p.on('pageerror', e => f.push(String(e).slice(0, 200)))
await p.goto(`${ZIEL}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', 'dev@lumeos.app')
await p.fill('input[type=password]', wortFuer('dev@lumeos.app'))
await p.click('button[type=submit]')
await p.waitForURL(u => !u.pathname.includes('login'), { timeout: 25000 })
console.log('nach Login:', p.url())
await p.goto(`${ZIEL}/v2/supplements?tab=today`, { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)
const d = await p.evaluate(() => ({
  url: location.href,
  klassen: [...new Set([...document.querySelectorAll('[class*=card]')]
    .map(x => x.className).slice(0, 6))],
  anzahlCard: document.querySelectorAll('.v2-card').length,
  text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 400),
}))
console.log(JSON.stringify(d, null, 1))
if (f.length) console.log('SEITENFEHLER:', f.slice(0, 2))
await p.screenshot({ path: 'docs/bilder/g423/schirm-today.png', fullPage: true })
await b.close()
