import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const b = await chromium.launch()
const s = await b.newPage({ viewport: { width: 1440, height: 2000 } })
await s.goto('http://127.0.0.1:3200/login', { waitUntil: 'networkidle' })
await s.fill('input[type="email"]', 'dev@lumeos.app')
await s.fill('input[type="password"]', wortFuer('dev@lumeos.app'))
await s.click('button[type="submit"]')
await s.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })
await s.goto('http://127.0.0.1:3200/v2/nutrition?tab=planner', { waitUntil: 'networkidle' })
await s.waitForTimeout(3000)
const t = await s.locator('body').innerText()
const i = t.indexOf('Reihen')
console.log(`Zeilengrund: ${JSON.stringify(t.slice(Math.max(0,i-40), i+90).replace(/\n/g,' '))}`)
const slots = ['Frühstück','Mittag','Abend','Snack','Breakfast','Lunch','Dinner']
  .filter(x => t.includes(x))
console.log(`Reihen sichtbar: ${JSON.stringify(slots)}`)
await s.screenshot({ path: 'backup/g332-planner.png', fullPage: true })
await b.close()
