// G-455 — Filter, Marken und Daumen am Schirm.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'
const BASIS = 'http://127.0.0.1:3200'
const b = await chromium.launch({ headless: true })
const k = await b.newContext({ viewport: { width: 1600, height: 1100 } })
const s = await k.newPage()
const fehler = []
s.on('pageerror', e => fehler.push('PAGEERROR: ' + e.message.slice(0, 160)))
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO); await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([s.waitForURL(u=>!u.pathname.includes('login')), s.click('button[type=submit]')])
}
await s.goto(`${BASIS}/v2/supplements?tab=produkte`, { waitUntil: 'networkidle' })
await s.waitForTimeout(3000)

const stand = () => s.evaluate(() => ({
  zeilen: document.querySelectorAll('.v2-tbl tbody tr').length,
  erste: Array.from(document.querySelectorAll('.v2-tbl tbody tr')).slice(0,3)
    .map(t => t.querySelector('td')?.textContent?.trim().slice(0,34)),
  daumen: document.querySelectorAll('button[aria-label*="mag ich"]').length,
  fuss: document.body.textContent.match(/[\d.]+ von [\d.]+ geladen/)?.[0],
  allergiehinweis: (document.body.textContent
    .match(/[\d.]+ Produkte enthalten eines deiner Allergene[^·]*(· \d+ davon aus dieser Liste entfernt)?/) ?? [])[0],
}))

await s.locator('button[aria-controls="v2-supp-prod-filter"]').click()
await s.waitForSelector('.v2-supp-prod-filter', { timeout: 20000 })
await s.waitForTimeout(1500)
const mitFilter = await stand()
await s.screenshot({ path: 'backup/x-g455-a4-allergiefilter.png' })

// Allergien abschalten -> Gegenprobe
await s.locator('.v2-supp-prod-filter button:has-text("Alle zeigen")').first().click()
await s.waitForTimeout(3000)
const ohneFilter = await stand()

console.log(JSON.stringify({ mitFilter, ohneFilter, fehler }, null, 2))
await b.close()
