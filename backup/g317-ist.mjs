// G-317: die drei gemeldeten Zeilen am Schirm nachmessen.
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const b = await chromium.launch()
const s = await b.newPage({ viewport: { width: 1440, height: 1600 } })
await s.goto('http://127.0.0.1:3200/login', { waitUntil: 'networkidle' })
await s.fill('input[type="email"]', 'dev@lumeos.app')
await s.fill('input[type="password"]', wortFuer('dev@lumeos.app'))
await s.click('button[type="submit"]')
await s.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })
await s.goto('http://127.0.0.1:3200/v2/nutrition?tab=plans', { waitUntil: 'networkidle' })
await s.waitForTimeout(2600)

console.log('=== Z. 364: Ring, Label unter der Zahl ===')
const ring = s.locator('.v2-ring').first()
if (await ring.count()) {
  const rb = await ring.boundingBox()
  const v = await s.locator('.v2-ring-label .v2-v').first().boundingBox()
  const l = await s.locator('.v2-ring-label .v2-l').first().boundingBox()
  console.log(`  Ring ${Math.round(rb.width)}px`)
  console.log(`  Wert  y ${Math.round(v.y - rb.y)}..${Math.round(v.y + v.height - rb.y)}`)
  console.log(`  Label y ${Math.round(l.y - rb.y)}..${Math.round(l.y + l.height - rb.y)}`)
  console.log(`  Label unter dem Wert: ${l.y >= v.y + v.height ? 'ja' : 'NEIN'}`)
  console.log(`  Label ragt aus dem Ring: ${(l.y + l.height) > (rb.y + rb.height) ? 'JA' : 'nein'}`)
}

console.log('\n=== Z. 393: die Statuspillen und ihre Farben ===')
const pillen = s.locator('.v2-pill')
const n = await pillen.count()
const gesehen = new Map()
for (let i = 0; i < n; i++) {
  const p = pillen.nth(i)
  const txt = (await p.innerText()).trim()
  if (!['bestätigt', 'abgewichen', 'ausgelassen', 'offen'].includes(txt)) continue
  const farbe = await p.evaluate(x => getComputedStyle(x).color)
  const rand = await p.evaluate(x => getComputedStyle(x).borderColor)
  if (!gesehen.has(txt)) gesehen.set(txt, { farbe, rand })
}
for (const [txt, f] of gesehen) console.log(`  ${txt.padEnd(12)} Text ${f.farbe.padEnd(20)} Rand ${f.rand}`)
console.log(`  verschiedene Textfarben: ${new Set([...gesehen.values()].map(x => x.farbe)).size} von ${gesehen.size}`)

console.log('\n=== Z. 394: kcal rechtsbuendig ===')
const kcal = s.locator('span.v2-num.v2-dim').filter({ hasText: /kcal$/ })
const kn = await kcal.count()
console.log(`  kcal-Spannen: ${kn}`)
if (kn > 0) {
  const el = kcal.first()
  const ml = await el.evaluate(x => getComputedStyle(x).marginLeft)
  console.log(`  marginLeft: ${ml}`)
}

console.log('\n=== 4: die Kopfkarte ===')
const t = await s.locator('body').innerText()
const kopf = t.indexOf('Aufbau-Wochenplan')
if (kopf >= 0) {
  const block = t.slice(kopf, t.indexOf('Today', kopf) > 0 ? t.indexOf('Today', kopf) : kopf + 600)
  console.log(block.split('\n').filter(Boolean).map(x => `    ${x}`).join('\n'))
}
await b.close()
