import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const b = await chromium.launch()
const s = await b.newPage({ viewport: { width: 1440, height: 1800 } })
await s.goto('http://127.0.0.1:3200/login', { waitUntil: 'networkidle' })
await s.fill('input[type="email"]', 'dev@lumeos.app')
await s.fill('input[type="password"]', wortFuer('dev@lumeos.app'))
await s.click('button[type="submit"]')
await s.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })
await s.goto('http://127.0.0.1:3200/v2/nutrition?tab=planner', { waitUntil: 'networkidle' })
await s.waitForTimeout(2600)

const werkbankTitel = async () => {
  const c = await s.locator('.v2-card-title').allInnerTexts()
  return c.find(x => !x.includes('Alle Pläne')) ?? c[0] ?? '—'
}
console.log(`Werkbank zeigt (ohne ?plan=): ${JSON.stringify(await werkbankTitel())}`)
const k = s.locator('[role="button"][aria-label$="anwählen"]')
const name = await k.first().getAttribute('aria-label')
await k.first().click()
await s.waitForTimeout(2200)
console.log(`geklickt: ${JSON.stringify(name)}`)
console.log(`URL: ${new URL(s.url()).search}`)
console.log(`Werkbank zeigt jetzt: ${JSON.stringify(await werkbankTitel())}`)
console.log(`"In der Werkbank"-Marke: ${await s.getByText('In der Werkbank').count()}`)
await s.screenshot({ path: 'backup/g327-planner-nachher.png' })
await b.close()
