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

console.log('══ G-330: Kopfzeile und Flucht ═════════════')
const kopf = s.locator('[data-probe="kopf-summe"]').first()
console.log(`Kopfzeile: ${JSON.stringify((await kopf.innerText()).replace(/\n/g, ' '))}`)
const th = s.locator('[data-probe="spalten-kopf"]').first()
const kx = await th.locator('th').evaluateAll(n => n.map(x => Math.round(x.getBoundingClientRect().right)))
const tr = s.locator('[data-probe="spalten-kopf"]').first().locator('xpath=../..').locator('tbody tr').first()
const zx = await tr.locator('td').evaluateAll(n => n.map(x => Math.round(x.getBoundingClientRect().right)))
console.log(`Flucht: ${kx.filter((v,i) => v === zx[i]).length} von ${kx.length} Spalten Δ=0`)

console.log('\n══ G-329: die Ghost-Zeile ══════════════════')
const gz = s.locator('[data-probe="ghost-zeile"]')
console.log(`Ghost-Zeilen: ${await gz.count()}`)
if (await gz.count()) {
  for (let i = 0; i < Math.min(2, await gz.count()); i++) {
    console.log(`  ${JSON.stringify((await gz.nth(i).innerText()).replace(/\n/g, ' | '))}`)
  }
  // Fluchten die Ghost-Spalten mit ihrem eigenen Kopf?
  const gth = s.locator('[data-probe="ghost-spalten"]').first()
  const gkx = await gth.locator('th').evaluateAll(n => n.map(x => Math.round(x.getBoundingClientRect().right)))
  const gzx = await gz.first().locator('td').evaluateAll(n => n.map(x => Math.round(x.getBoundingClientRect().right)))
  console.log(`  Ghost-Flucht: ${gkx.filter((v,i) => v === gzx[i]).length} von ${gkx.length} Δ=0`)
  console.log(`  Mengenfeld: ${await gz.first().locator('input').count()}`)
  console.log(`  Entfernen-Knopf: ${await s.locator('[data-probe="ghost-entfernen"]').count()}`)
  console.log(`  Zutat-suchen: ${await s.locator('[data-probe="ghost-zutat-suchen"]').count()}`)
  console.log(`  MealCam: ${await s.locator('[data-probe="ghost-mealcam"]').count()}`)

  // Menge aendern -> aendern sich die Werte?
  const vor = await gz.first().innerText()
  await gz.first().locator('input').fill('200')
  await s.waitForTimeout(600)
  const nach = await gz.first().innerText()
  console.log(`\n  Menge 200: ${JSON.stringify(nach.replace(/\n/g, ' | '))}`)
  console.log(`  Werte folgen: ${vor !== nach ? 'JA' : 'NEIN'}`)
}
await s.screenshot({ path: 'backup/g329-nachher.png', fullPage: true })
await b.close()
