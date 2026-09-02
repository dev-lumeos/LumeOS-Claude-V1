import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const b = await chromium.launch()
const s = await b.newPage({ viewport: { width: 1440, height: 2200 } })
await s.goto('http://127.0.0.1:3200/login', { waitUntil: 'networkidle' })
await s.fill('input[type="email"]', 'dev@lumeos.app')
await s.fill('input[type="password"]', wortFuer('dev@lumeos.app'))
await s.click('button[type="submit"]')
await s.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })
await s.goto('http://127.0.0.1:3200/v2/nutrition?tab=diary', { waitUntil: 'networkidle' })
await s.waitForTimeout(2800)

const kopf = s.locator('[data-probe="kopf-summe"]').first()
console.log(`Karten-Kopfzeile: ${JSON.stringify((await kopf.innerText()).replace(/\n/g, ' '))}`)

const th = s.locator('[data-probe="spalten-kopf"]').first()
console.log(`Tabellenkopf:     ${JSON.stringify((await th.innerText()).replace(/\n/g, ' | '))}`)
const kx = await th.locator('th').evaluateAll(ns =>
  ns.map(n => Math.round(n.getBoundingClientRect().right)))
const zeile = s.locator('[data-probe="spalten-kopf"]').first()
  .locator('xpath=../..').locator('tbody tr').first()
const zx = await zeile.locator('td').evaluateAll(ns =>
  ns.map(n => Math.round(n.getBoundingClientRect().right)))
console.log(`Zeile: ${JSON.stringify((await zeile.innerText()).replace(/\n/g, ' | '))}`)
console.log(`\nFlucht — rechte Kante je Spalte:`)
const namen = ['(Punkt)', '(Name)', 'G', 'KCAL', 'P', 'K', 'F', '(Menü)']
let ok = 0
kx.forEach((v, i) => {
  const d = v - (zx[i] ?? 0)
  if (Math.abs(d) <= 1) ok++
  console.log(`  ${namen[i].padEnd(8)} thead=${v} tbody=${zx[i]} Δ=${d}${Math.abs(d) <= 1 ? ' ok' : '  ABWEICHUNG'}`)
})
console.log(`\n${ok} von ${kx.length} Spalten fluchten`)
await s.screenshot({ path: 'backup/g330-nachher.png', fullPage: true })
await b.close()
