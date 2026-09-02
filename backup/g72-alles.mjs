import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const b = await chromium.launch()
const s = await b.newPage({ viewport: { width: 1440, height: 2400 } })
await s.goto('http://127.0.0.1:3200/login', { waitUntil: 'networkidle' })
await s.fill('input[type="email"]', 'dev@lumeos.app')
await s.fill('input[type="password"]', wortFuer('dev@lumeos.app'))
await s.click('button[type="submit"]')
await s.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })

console.log('══ Ort 1: Preferences ══════════════════════')
await s.goto('http://127.0.0.1:3200/v2/nutrition?tab=prefs', { waitUntil: 'networkidle' })
await s.waitForTimeout(3200)
const lies = async (p) => {
  const e = s.locator(`[data-probe="${p}"]`)
  if (!await e.count()) return '— fehlt'
  return await e.first().evaluate(x =>
    x.tagName === 'TEXTAREA' ? x.value
    : x.tagName === 'INPUT' ? (x.type === 'checkbox' ? String(x.checked) : x.value)
    : x.innerText.slice(0, 70))
}
for (const p of ['meals-per-day','snacks-per-day','meal-prep-ok','planner-notes','struktur-wirkung'])
  console.log(`  ${p.padEnd(18)} ${JSON.stringify(await lies(p))}`)
await s.screenshot({ path: 'backup/g72-prefs.png', fullPage: true })

console.log('\n══ Ort 2: Nutzereinstellungen ══════════════')
await s.goto('http://127.0.0.1:3200/v2/settings', { waitUntil: 'networkidle' })
await s.waitForTimeout(2600)
const v = s.locator('[data-probe="struktur-verweis"]')
console.log(`  Verweis: ${await v.count()} · ${JSON.stringify((await v.first().innerText().catch(()=>'—')).replace(/\n/g,' ').slice(0,80))}`)
console.log(`  Link-Ziel: ${await v.locator('a').getAttribute('href').catch(()=>'—')}`)
await s.screenshot({ path: 'backup/g72-settings.png', fullPage: true })

console.log('\n══ Wirkung im Tagebuch ═════════════════════')
await s.goto('http://127.0.0.1:3200/v2/nutrition?tab=diary', { waitUntil: 'networkidle' })
await s.waitForTimeout(3000)
const t = await s.locator('body').innerText()
const da = ['Breakfast','Lunch','Dinner','Snack','Post-workout'].filter(x => t.includes(x))
console.log(`  Slots: ${JSON.stringify(da)} (${da.length})`)
await s.screenshot({ path: 'backup/g72-diary.png', fullPage: true })
await b.close()
