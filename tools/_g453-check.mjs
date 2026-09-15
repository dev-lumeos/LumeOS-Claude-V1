import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const KONTO='dev@lumeos.app', BASIS='http://127.0.0.1:3200'
const b = await chromium.launch({ headless: true })
const k = await b.newContext({ viewport: { width: 1600, height: 1100 } })
const s = await k.newPage()
const fehler = []
s.on('console', m => { if (m.type() === 'error') fehler.push(m.text().slice(0, 400)) })
s.on('pageerror', e => fehler.push('PAGEERROR: ' + e.message.slice(0, 400)))
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO); await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([s.waitForURL(u=>!u.pathname.includes('login')), s.click('button[type=submit]')])
}
await s.goto(`${BASIS}/v2/supplements?tab=produkte`, { waitUntil: 'networkidle' })
await s.waitForTimeout(3000)
console.log(JSON.stringify({
  suchfeld: await s.locator('input[aria-label="Produkt suchen"]').count(),
  markenfeld: await s.locator('input[aria-label="Marke filtern"]').count(),
  text: (await s.evaluate(() => document.querySelector('.v2-tabinhalt')?.textContent?.slice(0,300))),
  fehler: fehler.slice(0, 4),
}, null, 2))
await b.close()
