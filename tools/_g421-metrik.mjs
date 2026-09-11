// G-421/A3 - zeigen die zwei neuen Kacheln echte Reihen?
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const b = await chromium.launch()
const c = await b.newContext({ colorScheme: 'dark', viewport: { width: 1680, height: 1400 } })
const p = await c.newPage()
await p.goto('http://localhost:3200/login', { waitUntil: 'networkidle' })
await p.fill('input[type=email]', 'dev@lumeos.app')
await p.fill('input[type=password]', wortFuer('dev@lumeos.app'))
await p.click('button[type=submit]')
await p.waitForURL(u => !u.pathname.includes('login'), { timeout: 25000 })
await p.goto('http://localhost:3200/v2/goals?tab=metrics', { waitUntil: 'networkidle' })
await p.waitForTimeout(1800)
const d = await p.evaluate(() => {
  const karten = [...document.querySelectorAll('.v2-card')]
    .filter(k => !k.parentElement?.closest('.v2-card'))
  const finde = t => {
    const k = karten.find(x =>
      (x.querySelector('h3, h2, .v2-card-title')?.textContent ?? '').trim().startsWith(t))
    if (!k) return null
    return {
      unter: k.querySelector('[class*=sub]')?.textContent?.trim() ?? null,
      attrappe: /mockup|attrappe/i.test(k.className),
      pfade: k.querySelectorAll('svg path').length,
      text: k.innerText.replace(/\s+/g, ' ').slice(0, 150),
    }
  }
  return { fett: finde('Body fat trend'), mager: finde('Lean mass') }
})
console.log(JSON.stringify(d, null, 1))
await p.screenshot({ path: 'docs/bilder/g421/soll-metrics.png', fullPage: true })
await b.close()
