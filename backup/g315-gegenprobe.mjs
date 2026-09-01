import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const b = await chromium.launch()
const s = await b.newPage()
await s.goto('http://127.0.0.1:3200/login', { waitUntil: 'networkidle' })
await s.fill('input[type="email"]', 'dev@lumeos.app')
await s.fill('input[type="password"]', wortFuer('dev@lumeos.app'))
await s.click('button[type="submit"]')
await s.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })
const id = process.env.G315_COACH_PLAN
for (const [was, koerper] of [
  ['status (Ausfuehrung)', { status: 'assigned' }],
  ['name (Inhalt)', { name: 'Cut 4-Meal 2200' }],
  ['target_kcal (Inhalt)', { target_kcal: 2200 }],
]) {
  const r = await s.evaluate(async ([i, k]) => {
    const res = await fetch('/api/nutrition/plan', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ art: 'plan_aendern', id: i, ...k }),
    })
    const t = await res.text()
    return { s: res.status, t: t.slice(0, 130) }
  }, [id, koerper])
  console.log(`  ${was.padEnd(22)} HTTP ${r.s}  ${r.s === 200 ? 'durch' : r.t}`)
}
await b.close()
