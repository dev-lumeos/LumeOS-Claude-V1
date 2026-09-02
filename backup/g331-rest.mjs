import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const b = await chromium.launch()
const s = await b.newPage({ viewport: { width: 1440, height: 2200 } })
await s.goto('http://127.0.0.1:3200/login', { waitUntil: 'networkidle' })
await s.fill('input[type="email"]', 'dev@lumeos.app')
await s.fill('input[type="password"]', wortFuer('dev@lumeos.app'))
await s.click('button[type="submit"]')
await s.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })

console.log('── Kontext NACH dem Wählen ──')
await s.goto('http://127.0.0.1:3200/v2/nutrition?tab=diary', { waitUntil: 'networkidle' })
await s.waitForTimeout(3000)
await s.locator('button[aria-label="Position hinzufuegen"]').first().click()
await s.waitForTimeout(900)
await s.fill('[role="dialog"] input[aria-label="Lebensmittel suchen"]', 'banane')
await s.waitForTimeout(2200)
await s.locator('[role="dialog"] tbody tr').first().locator('button').click()
await s.waitForTimeout(1400)
console.log(`  ${JSON.stringify(await s.locator('[data-probe="tageskontext"]').innerText())}`)
console.log(`  Vorschau: ${JSON.stringify((await s.locator('[data-probe="vorschau"]').innerText()).replace(/\n/g,' '))}`)

console.log('\n── Planner-Verweis: greift der Zweig? ──')
// Der Zweig laeuft nur ohne Plan — pruefen wir den Code statt der Anzeige.
const t = await s.evaluate(() => document.body.innerText)
console.log(`  Planner zeigt einen Plan: ${t.includes('Woche') ? 'ja (Zweig laeuft nicht)' : 'nein'}`)
await b.close()
