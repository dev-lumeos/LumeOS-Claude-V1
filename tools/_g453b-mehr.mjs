// G-453/3 — der Nachladeknopf: haengt er an oder ersetzt er?
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const KONTO='dev@lumeos.app', BASIS='http://127.0.0.1:3200'
const b = await chromium.launch({ headless: true })
const k = await b.newContext({ viewport: { width: 1600, height: 1100 } })
const s = await k.newPage()
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO); await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([s.waitForURL(u=>!u.pathname.includes('login')), s.click('button[type=submit]')])
}
await s.goto(`${BASIS}/v2/supplements?tab=produkte`, { waitUntil: 'networkidle' })
await s.waitForTimeout(2500)
const stand = () => s.evaluate(() => ({
  zeilen: document.querySelectorAll('.v2-tbl tbody tr').length,
  erste: document.querySelector('.v2-tbl tbody tr td')?.textContent?.trim().slice(0,28),
  fuss: document.body.textContent.match(/[\d.]+ von [\d.]+ geladen/)?.[0],
  knopf: Array.from(document.querySelectorAll('button')).find(x=>/weitere laden/.test(x.textContent))?.textContent?.trim(),
  seitenzahl: /Seite \d+/.test(document.body.textContent),
}))
const vorher = await stand()
await s.locator('button:has-text("weitere laden")').first().click()
await s.waitForTimeout(3500)
const nachher = await stand()
await s.screenshot({ path: 'backup/x-g453b-mehr-laden.png' })
console.log(JSON.stringify({ vorher, nachher,
  ersteZeileGleich: vorher.erste === nachher.erste }, null, 2))
await b.close()
