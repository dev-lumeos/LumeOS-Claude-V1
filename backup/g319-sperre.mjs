import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const b = await chromium.launch()
const s = await b.newPage({ viewport: { width: 1440, height: 1500 } })
await s.goto('http://127.0.0.1:3200/login', { waitUntil: 'networkidle' })
await s.fill('input[type="email"]', 'dev@lumeos.app')
await s.fill('input[type="password"]', wortFuer('dev@lumeos.app'))
await s.click('button[type="submit"]')
await s.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })
const id = process.env.G319_PLAN
await s.goto(`http://127.0.0.1:3200/v2/nutrition?tab=planner&plan=${id}`,
  { waitUntil: 'networkidle' })
await s.waitForTimeout(2500)
const t = await s.locator('body').innerText()
console.log(`Schlossmarke "gesperrt": ${t.includes('gesperrt') ? 'da' : 'FEHLT'}`)
const knopf = s.getByRole('button', { name: 'Bearbeiten' })
console.log(`Bearbeiten-Knopf: ${await knopf.count()}`)
if (await knopf.count()) {
  console.log(`  deaktiviert: ${await knopf.first().isDisabled() ? 'ja' : 'NEIN'}`)
}
const grund = t.match(/Dieser Plan (kommt|stammt)[^\n]*/)
console.log(`Grund: ${grund ? grund[0].slice(0, 90) : 'FEHLT'}`)
await s.screenshot({ path: 'backup/g319-sperre.png', fullPage: false })
await b.close()
