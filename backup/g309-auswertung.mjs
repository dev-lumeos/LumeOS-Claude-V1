// G-309 Punkt 4: die Auswertung am Schirm.
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'

const KONTO = process.env.G309_KONTO ?? 'test-user@lumeos.local'
const BASIS = 'http://127.0.0.1:3200'
const TAG = process.env.G309_TAG ?? new Date().toISOString().slice(0, 10)

const browser = await chromium.launch()
const seite = await browser.newPage({ viewport: { width: 1400, height: 1400 } })
await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await seite.fill('input[type="email"]', KONTO)
await seite.fill('input[type="password"]', wortFuer(KONTO))
await seite.click('button[type="submit"]')
await seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })

await seite.goto(`${BASIS}/v2/nutrition?tab=plans&datum=${TAG}`,
  { waitUntil: 'networkidle' })
await seite.waitForTimeout(2000)

const t = await seite.locator('body').innerText()
const ab = t.indexOf('Was du regelmäßig wechselst')
console.log(`Konto: ${KONTO} · Tag: ${TAG}`)
console.log(`Kachel „Was du regelmäßig wechselst": ${ab >= 0 ? 'da' : 'FEHLT'}`)
if (ab >= 0) {
  console.log('--- Inhalt ---')
  console.log(t.slice(ab, ab + 420).split('\n').filter(Boolean)
    .map(s => `  ${s}`).join('\n'))
}
const eh = t.indexOf('Einhaltung')
if (eh >= 0) {
  console.log('--- Einhaltung daneben ---')
  console.log(t.slice(eh, eh + 190).split('\n').filter(Boolean)
    .map(s => `  ${s}`).join('\n'))
}
await seite.screenshot({ path: 'backup/g309-auswertung.png', fullPage: false })
await browser.close()
