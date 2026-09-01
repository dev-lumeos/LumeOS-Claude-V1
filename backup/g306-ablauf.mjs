// C-377/C-373: die Ablauffrage am Schirm — drei Wege, ein Vorschlag.
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'

const KONTO = 'test-user@lumeos.local'
const BASIS = 'http://127.0.0.1:3200'
const browser = await chromium.launch()
const seite = await browser.newPage({ viewport: { width: 1400, height: 1300 } })

await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await seite.fill('input[type="email"]', KONTO)
await seite.fill('input[type="password"]', wortFuer(KONTO))
await seite.click('button[type="submit"]')
await seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })
await seite.goto(`${BASIS}/v2/nutrition?tab=planner`, { waitUntil: 'networkidle' })
await seite.waitForTimeout(1400)

const t = await seite.locator('body').innerText()
const ab = t.indexOf('Alle Pläne')
console.log('=== Die Ablauffrage ===')
console.log(t.slice(ab, ab + 900).split('\n').filter(Boolean)
  .map(s => `  ${s}`).join('\n'))

console.log('\n=== Die drei Wege als Knoepfe ===')
for (const name of ['Denselben Plan neu starten', 'Einen anderen Plan aktivieren',
                    'Ohne Plan weitermachen']) {
  const n = await seite.getByRole('button', { name: new RegExp(name) }).count()
  console.log(`  ${name.padEnd(32)} ${n > 0 ? 'da' : 'FEHLT'}`)
}
const vor = await seite.getByText('vorgeschlagen').count()
console.log(`  Marke „vorgeschlagen"            ${vor > 0 ? 'da' : 'FEHLT'}`)
const datum = await seite.getByLabel('Neues Startdatum').count()
console.log(`  Datumsfeld bei „neu starten"     ${datum > 0 ? 'da' : 'FEHLT'}`)

await seite.screenshot({ path: 'backup/g306-ablauffrage.png', fullPage: false })
console.log('\nBild: backup/g306-ablauffrage.png')
await browser.close()
