// G-421/A3 - zeigt die Kachel die geschriebene Session?
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const ZIEL = process.argv[2] ?? 'http://localhost:3200'
const KONTO = process.argv[3] ?? 'test-user@lumeos.local'
const b = await chromium.launch()
const c = await b.newContext({ colorScheme: 'dark', viewport: { width: 1680, height: 1400 } })
const p = await c.newPage()
await p.goto(`${ZIEL}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', KONTO)
await p.fill('input[type=password]', wortFuer(KONTO))
await p.click('button[type=submit]')
await p.waitForURL(u => !u.pathname.includes('login'), { timeout: 25000 })
await p.goto(`${ZIEL}/v2/goals?tab=measure`, { waitUntil: 'networkidle' })
await p.waitForTimeout(1800)
const d = await p.evaluate(() => {
  const karte = [...document.querySelectorAll('.v2-card')].find(k =>
    (k.querySelector('h3, h2, .v2-card-title')?.textContent ?? '').includes('Photo progression'))
  if (!karte) return { da: false }
  return {
    da: true,
    unter: karte.querySelector('.v2-card-sub, [class*=sub]')?.textContent?.trim() ?? null,
    bilder: karte.querySelectorAll('img').length,
    signiert: [...karte.querySelectorAll('img')].map(i => /token=|sign/.test(i.src)),
    text: karte.innerText.replace(/\s+/g, ' ').slice(0, 200),
  }
})
console.log(JSON.stringify(d, null, 1))
await p.screenshot({ path: 'docs/bilder/g421/ist-measure.png', fullPage: true })
await b.close()
