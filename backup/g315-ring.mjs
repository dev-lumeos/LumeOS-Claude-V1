import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const b = await chromium.launch()
const s = await b.newPage({ viewport: { width: 1440, height: 1400 } })
await s.goto('http://127.0.0.1:3200/login', { waitUntil: 'networkidle' })
await s.fill('input[type="email"]', 'dev@lumeos.app')
await s.fill('input[type="password"]', wortFuer('dev@lumeos.app'))
await s.click('button[type="submit"]')
await s.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })
await s.goto('http://127.0.0.1:3200/v2/nutrition?tab=plans', { waitUntil: 'networkidle' })
await s.waitForTimeout(2500)
const ring = s.locator('.v2-ring').first()
if (await ring.count() === 0) { console.log('kein Ring'); await b.close(); process.exit(0) }
const box = await ring.boundingBox()
console.log(`Ring: ${Math.round(box.width)}x${Math.round(box.height)} px`)
for (const [sel, name] of [['.v2-ring-label .v2-v', 'Wert'], ['.v2-ring-label .v2-l', 'Label']]) {
  const el = s.locator(sel).first()
  if (await el.count() === 0) { console.log(`  ${name}: fehlt`); continue }
  const bb = await el.boundingBox()
  const txt = (await el.innerText()).trim()
  console.log(`  ${name}: "${txt}" ${Math.round(bb.width)}x${Math.round(bb.height)} @ y=${Math.round(bb.y - box.y)}`)
}
const v = await s.locator('.v2-ring-label .v2-v').first().boundingBox()
const l = await s.locator('.v2-ring-label .v2-l').first().boundingBox()
if (v && l) {
  console.log(`  Wert endet bei y=${Math.round(v.y + v.height)}, Label beginnt bei y=${Math.round(l.y)}`)
  console.log(`  Ueberlappung: ${(v.y + v.height) > l.y ? 'JA' : 'nein'}`)
  console.log(`  Wert breiter als Ring: ${v.width > box.width ? 'JA' : 'nein'} (${Math.round(v.width)} vs ${Math.round(box.width)})`)
}
await b.close()
