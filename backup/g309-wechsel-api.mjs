import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const b = await chromium.launch(); const s = await b.newPage()
await s.goto('http://127.0.0.1:3200/login', { waitUntil: 'networkidle' })
await s.fill('input[type="email"]', 'test-user@lumeos.local')
await s.fill('input[type="password"]', wortFuer('test-user@lumeos.local'))
await s.click('button[type="submit"]')
await s.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })
// Die rohe PostgREST-Abfrage nachstellen.
const r = await s.evaluate(async () => {
  const res = await fetch('/api/nutrition/plan?datum=2026-09-02')
  return res.status
})
console.log('plan GET:', r)
await b.close()
