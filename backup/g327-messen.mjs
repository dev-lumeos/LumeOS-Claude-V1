import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const b = await chromium.launch()
const s = await b.newPage({ viewport: { width: 1440, height: 1800 } })
await s.goto('http://127.0.0.1:3200/login', { waitUntil: 'networkidle' })
await s.fill('input[type="email"]', 'dev@lumeos.app')
await s.fill('input[type="password"]', wortFuer('dev@lumeos.app'))
await s.click('button[type="submit"]')
await s.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })

const kopf = async () => {
  const t = await s.locator('body').innerText()
  const i = t.indexOf('7-day compliance')
  return (t.split('\n').find(z => z.includes('Tag ') && z.includes('von ')) ?? '—').trim()
}
const titel = async () => {
  const c = s.locator('.v2-card-title')
  return (await c.allInnerTexts()).slice(0, 3).join(' | ')
}

console.log('══ 1. Meal plans OHNE ?plan= ═══════════════')
await s.goto('http://127.0.0.1:3200/v2/nutrition?tab=plans', { waitUntil: 'networkidle' })
await s.waitForTimeout(2600)
const t1 = await s.locator('body').innerText()
const n1 = (t1.match(/^(.+)\n.*Tag \d+ von/m) ?? [])[1] ?? '—'
console.log(`Kopfkarte: ${JSON.stringify(t1.split('\n').filter(z => z.trim()).slice(6, 12).join(' | '))}`)

console.log('\n══ 2. Planner: anderen Plan anwaehlen ══════')
await s.goto('http://127.0.0.1:3200/v2/nutrition?tab=planner', { waitUntil: 'networkidle' })
await s.waitForTimeout(2600)
const k = s.locator('[role="button"][aria-label$="anwählen"]')
console.log(`anwaehlbare Kacheln: ${await k.count()}`)
const name = await k.first().getAttribute('aria-label')
await k.first().click()
await s.waitForTimeout(2000)
const url = new URL(s.url())
console.log(`geklickt: ${JSON.stringify(name)}`)
console.log(`URL jetzt: ${url.search}`)

console.log('\n══ 3. Zu Meal plans wechseln ═══════════════')
await s.goto(`http://127.0.0.1:3200/v2/nutrition?tab=plans&plan=${url.searchParams.get('plan')}`, { waitUntil: 'networkidle' })
await s.waitForTimeout(2600)
const t3 = await s.locator('body').innerText()
console.log(`Kopfkarte: ${JSON.stringify(t3.split('\n').filter(z => z.trim()).slice(6, 12).join(' | '))}`)
console.log(`\ngleich wie ohne ?plan=: ${t1.slice(0,600) === t3.slice(0,600) ? 'JA' : 'NEIN — der Kopf ist gewechselt'}`)
await s.screenshot({ path: 'backup/g327-vorher.png' })
await b.close()
