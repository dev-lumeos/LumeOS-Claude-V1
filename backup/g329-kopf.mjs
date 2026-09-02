import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const b = await chromium.launch()
const s = await b.newPage({ viewport: { width: 1440, height: 2400 } })
await s.goto('http://127.0.0.1:3200/login', { waitUntil: 'networkidle' })
await s.fill('input[type="email"]', 'dev@lumeos.app')
await s.fill('input[type="password"]', wortFuer('dev@lumeos.app'))
await s.click('button[type="submit"]')
await s.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })
await s.goto('http://127.0.0.1:3200/v2/nutrition?tab=diary', { waitUntil: 'networkidle' })
await s.waitForTimeout(3000)

const koepfe = s.locator('[data-probe="ghost-kopf-summe"]')
console.log(`Ghost-Köpfe: ${await koepfe.count()}`)
console.log(`erster: ${JSON.stringify((await koepfe.first().innerText()).replace(/\n/g, ' '))}`)

// Stimmt der Kopf mit der Summe seiner Zeilen?
const karte = koepfe.first().locator('xpath=ancestor::*[contains(@class,"v2-card")][1]')
const zeilen = karte.locator('[data-probe="ghost-zeile"]')
const n = await zeilen.count()
console.log(`\nZeilen dieser Karte: ${n}`)
let sk = 0, sp = 0, skh = 0, sf = 0, sg = 0
for (let i = 0; i < n; i++) {
  const tds = await zeilen.nth(i).locator('td').allInnerTexts()
  const zahl = (x) => Number((x ?? '').replace(/[^\d.,-]/g, '').replace(',', '.')) || 0
  const g = Number(await zeilen.nth(i).locator('input').inputValue())
  sg += g; sk += zahl(tds[3]); sp += zahl(tds[4]); skh += zahl(tds[5]); sf += zahl(tds[6])
  console.log(`  ${JSON.stringify(tds.slice(1,7).join(' | '))}  (g=${g})`)
}
console.log(`\nZeilensumme: g=${sg} kcal=${Math.round(sk)} P=${Math.round(sp)} K=${Math.round(skh)} F=${Math.round(sf)}`)
console.log(`Kopf:        ${JSON.stringify((await koepfe.first().innerText()).replace(/\n/g, ' '))}`)

// Und nach dem Entfernen einer Zutat?
console.log('\n── nach dem Entfernen der ersten Zutat ──')
await karte.locator('[data-probe="ghost-entfernen"]').first().click()
await s.waitForTimeout(700)
console.log(`Kopf: ${JSON.stringify((await koepfe.first().innerText()).replace(/\n/g, ' '))}`)
console.log(`Zeilen: ${await karte.locator('[data-probe="ghost-zeile"]').count()} (vorher ${n})`)
await s.screenshot({ path: 'backup/g329-kopf.png', fullPage: true })
await b.close()
