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
await s.waitForTimeout(1500)
const vorher = await s.evaluate(() => document.body.textContent.match(/[\d.]+ von [\d.]+ Treffern/)?.[0])
// Marke waehlen
await s.selectOption('select[aria-label="Marke filtern"]', { index: 3 })
await s.waitForTimeout(1800)
const gewaehlt = await s.evaluate(() => document.querySelector('select[aria-label="Marke filtern"]').value)
const nachher = await s.evaluate(() => document.body.textContent.match(/[\d.]+ von [\d.]+ Treffern/)?.[0])
const marken = await s.evaluate(() => Array.from(
  document.querySelectorAll('.v2-tbl tbody tr td:nth-child(2)')).map(t=>t.textContent.trim()))
await s.screenshot({ path: 'backup/x-g452-a4-markenfilter.png' })
console.log(JSON.stringify({ vorher, gewaehlt, nachher,
  markenInListe: [...new Set(marken)], zeilen: marken.length }, null, 2))
await b.close()
