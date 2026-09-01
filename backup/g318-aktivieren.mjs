// G-318: Aktivieren im Planner — der Plan mit dem Wochensprung.
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const b = await chromium.launch()
const s = await b.newPage({ viewport: { width: 1440, height: 1500 } })
await s.goto('http://127.0.0.1:3200/login', { waitUntil: 'networkidle' })
await s.fill('input[type="email"]', 'dev@lumeos.app')
await s.fill('input[type="password"]', wortFuer('dev@lumeos.app'))
await s.click('button[type="submit"]')
await s.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })
const id = process.env.G318_PLAN
const heute = process.env.G318_START ?? new Date().toISOString().slice(0, 10)
const r = await s.evaluate(async ([i, d]) => {
  const res = await fetch('/api/nutrition/plan', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ art: 'plan_aendern', id: i, status: 'active',
                           start_date: d, lifecycle_type: 'once' }),
  })
  return { s: res.status, t: (await res.text()).slice(0, 200) }
}, [id, heute])
console.log(`POST plan_aendern (aktivieren, start=${heute}): HTTP ${r.s}`)
console.log(`  ${r.t}`)
await b.close()
