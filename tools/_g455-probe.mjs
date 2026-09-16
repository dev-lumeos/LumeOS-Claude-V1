import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const b = await chromium.launch({ headless: true })
const ctx = await b.newContext({ viewport:{width:1600,height:1100} })
const s = await ctx.newPage()
s.on('pageerror', e => console.log('PAGEERROR', e.message.slice(0,200)))
s.on('console', m => { if (m.type()==='error') console.log('CONSOLE', m.text().slice(0,200)) })
await s.goto('http://127.0.0.1:3200/login', { waitUntil:'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]','dev@lumeos.app'); await s.fill('input[type=password]', wortFuer('dev@lumeos.app'))
  await Promise.all([s.waitForURL(u=>!u.pathname.includes('login')), s.click('button[type=submit]')])
}
const anfragen = []
s.on('requestfinished', async r => { if (!r.url().includes('/api/supplements/produkte')) return; try { const resp = await r.response(); const j = await resp.json(); anfragen.push({ q: r.url().split('?')[1], gesamt: j.gesamt, zeilen: j.zeilen?.length }) } catch(e) { anfragen.push({ q: r.url().split('?')[1], fehler: String(e).slice(0,60) }) } })
await s.goto('http://127.0.0.1:3200/v2/supplements?tab=produkte', { waitUntil:'networkidle' })
await s.waitForTimeout(2500)
await s.locator('button[aria-controls="v2-supp-prod-filter"]').click()
await s.waitForSelector('.v2-supp-prod-filter'); await s.waitForTimeout(1000)
anfragen.length = 0
s.on('console', m => { if (/g455probe/.test(m.text())) anfragen.push('LOG ' + m.text()) })
// Jede Anfrage protokollieren, auch abgebrochene.
s.on('requestfailed', r => { if (r.url().includes('/api/supplements/produkte')) anfragen.push({ ABBRUCH: r.url().split('?')[1], grund: r.failure()?.errorText }) })
await s.selectOption('select[aria-label="Marke auswählen"]', 'NOW')
await s.waitForTimeout(3000)
console.log(JSON.stringify({ anfragenNachKlick: anfragen,
  pillen: await s.evaluate(()=>Array.from(document.querySelectorAll('.v2-supp-prod-filter button[aria-label*="entfernen"]')).map(x=>x.textContent.trim())),
  fuss: await s.evaluate(()=>document.body.textContent.match(/[\d.]+ von [\d.]+ geladen/)?.[0]) }, null, 2))
await b.close()
