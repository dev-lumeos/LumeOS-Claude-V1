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
// Was steht RECHTS von der Summe in der Kopfzeile?
const eltern = await kopf.evaluate(n => {
  const p = n.parentElement
  return Array.from(p.children).map(c => ({
    tag: c.tagName, cls: c.className?.toString().slice(0, 30),
    label: c.getAttribute('aria-label') ?? '',
    r: Math.round(c.getBoundingClientRect().right),
    w: Math.round(c.getBoundingClientRect().width),
  }))
})
console.log('Kopfzeile, alle Kinder:')
eltern.forEach(e => console.log(`  ${e.tag} ${JSON.stringify(e.cls)} ${JSON.stringify(e.label)} rechts=${e.r} b=${e.w}`))
const tab = await s.locator('table').first().evaluate(n => Math.round(n.getBoundingClientRect().right))
const karte = await kopf.evaluate(n => Math.round(n.closest('.v2-card').getBoundingClientRect().right))
console.log(`\nTabelle rechts: ${tab} · Karte rechts: ${karte}`)
await b.close()
