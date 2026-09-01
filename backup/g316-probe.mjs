// G-316: die Abweichung wird beziffert — auf test-user, nicht dev.
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const b = await chromium.launch()
const s = await b.newPage({ viewport: { width: 1440, height: 1400 } })
const netz = []
s.on('response', r => { if (r.url().includes('/api/nutrition/plan')) netz.push(r.status()) })
await s.goto('http://127.0.0.1:3200/login', { waitUntil: 'networkidle' })
await s.fill('input[type="email"]', 'test-user@lumeos.local')
await s.fill('input[type="password"]', wortFuer('test-user@lumeos.local'))
await s.click('button[type="submit"]')
await s.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })
await s.goto('http://127.0.0.1:3200/v2/nutrition?tab=plans', { waitUntil: 'networkidle' })
await s.waitForTimeout(2500)
const k = s.getByRole('button', { name: 'Log deviation' })
console.log(`Log-deviation-Knoepfe: ${await k.count()}`)
if (await k.count() === 0) { await b.close(); process.exit(1) }
await k.first().click()
await s.waitForTimeout(500)
const feld = s.locator('input[aria-label^="Menge "]').first()
const alt = await feld.inputValue()
await feld.fill(String(Math.round(Number(alt) * 3)))
console.log(`Menge ${alt} -> ${Math.round(Number(alt) * 3)} g`)
await s.getByRole('button', { name: /Mengen buchen/ }).click()
await s.waitForTimeout(3000)
console.log(`Netz: ${netz.join(', ')}`)
await b.close()
