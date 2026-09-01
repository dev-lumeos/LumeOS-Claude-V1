import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const b = await chromium.launch()
const s = await b.newPage({ viewport: { width: 1440, height: 1700 } })
await s.goto('http://127.0.0.1:3200/login', { waitUntil: 'networkidle' })
await s.fill('input[type="email"]', 'dev@lumeos.app')
await s.fill('input[type="password"]', wortFuer('dev@lumeos.app'))
await s.click('button[type="submit"]')
await s.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })
await s.goto('http://127.0.0.1:3200/v2/nutrition?tab=plans', { waitUntil: 'networkidle' })
await s.waitForTimeout(2600)
const t = await s.locator('body').innerText()

console.log('=== 5: die Sparkline ===')
const i = t.indexOf('7-day compliance')
console.log(t.slice(i, i + 150).split('\n').filter(Boolean).map(x => `  ${x}`).join('\n'))

console.log('\n=== G-316: Log deviation ===')
const knopf = s.getByRole('button', { name: 'Log deviation' })
console.log(`  Knoepfe: ${await knopf.count()}`)
if (await knopf.count()) {
  await knopf.first().click()
  await s.waitForTimeout(600)
  const felder = s.locator('input[aria-label^="Menge "]')
  console.log(`  Mengenfelder: ${await felder.count()}`)
  const namen = await felder.evaluateAll(els => els.map(e => e.getAttribute('aria-label')))
  namen.slice(0, 5).forEach(n => console.log(`    ${n}`))
  console.log(`  Buchen-Knopf: ${await s.getByRole('button', { name: /Mengen buchen/ }).count()}`)
}

console.log('\n=== Punkt 6: der untere Teil ===')
const plaene = ['Aufbau-Wochenplan', 'Buddy auto-plan', 'Cut 4-Meal 2200', 'Lean bulk 3100']
for (const p of plaene) {
  console.log(`  ${p.padEnd(20)} ${(t.match(new RegExp(p, 'g')) ?? []).length}x`)
}
await s.screenshot({ path: 'backup/g317-nachher.png', fullPage: false })
await b.close()
