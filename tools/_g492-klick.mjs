// G-492 -- warum loest der Speicherknopf nichts aus?
//
// [read] Nach zwei erfolglosen Vermutungen (verdeckt? disabled?)
// wird der Fall HALBIERT: erst messen, ob der Klick den Handler
// erreicht, dann warum er fruehzeitig zurueckkehrt.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const KONTO='dev@lumeos.app', BASIS='http://127.0.0.1:3200'

const b = await chromium.launch({ headless: true })
const s = await (await b.newContext({viewport:{width:1500,height:1200}})).newPage()
const netz = []
s.on('request', r => { if (r.url().includes('/api/')) netz.push('-> ' + r.method() + ' ' + r.url().slice(-60)) })
s.on('response', async r => {
  if (r.url().includes('/api/nutrition/diary')) {
    netz.push('<- ' + r.status() + ' ' + (await r.text().catch(() => '?')).slice(0, 200))
  }
})
s.on('requestfailed', r => {
  if (r.url().includes('/api/')) netz.push('XX ' + r.url().slice(-40) + ' ' + r.failure()?.errorText)
})
s.on('pageerror', e => console.log('PAGEERROR:', String(e).slice(0, 200)))

await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO); await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([s.waitForURL(u=>!u.pathname.includes('login')), s.click('button[type=submit]')])
}
await s.goto(`${BASIS}/v2/supplements?tab=produkte`, { waitUntil: 'domcontentloaded' })
await s.waitForSelector('input[aria-label="Produkt suchen"]', { timeout: 40000 })
await s.waitForTimeout(1500)
await s.locator('input[aria-label="Produkt suchen"]')
  .type('Gold Standard 100% Whey Chocolate Peanut Butter', { delay: 15 })
await s.waitForTimeout(15000)
await s.locator('[data-probe="zeile-add"]').first().click()
await s.waitForTimeout(3500)
await s.locator('[data-probe="aktion-mahlzeit"]').click()
await s.locator('[data-probe="mahlzeit-portion"]').waitFor({ timeout: 30000 })
await s.waitForTimeout(1200)

const vor = await s.evaluate(() => {
  const w = document.querySelector('[data-probe="mahlzeit-wahl"]')
  const p = document.querySelector('[data-probe="mahlzeit-portion"]')
  return {
    mahlzeitWert: w ? w.value : null,
    mahlzeitOptionen: w ? w.options.length : 0,
    portionWert: p ? p.value : null,
  }
})
console.log('VOR DEM KLICK:', JSON.stringify(vor))

netz.length = 0
await s.locator('[data-probe="mahlzeit-speichern"]').click()
await s.waitForTimeout(15000)
console.log('NETZ NACH KLICK:', netz)

const nach = await s.evaluate(() => ({
  fertig: document.querySelector('[data-probe="aktion-fertig"]')?.textContent ?? null,
  fehler: document.querySelector('[data-probe="aktion-fehler"]')?.textContent ?? null,
  knopfText: document.querySelector('[data-probe="mahlzeit-speichern"]')?.textContent ?? null,
}))
console.log('NACH DEM KLICK:', JSON.stringify(nach))
await b.close().catch(()=>{})
