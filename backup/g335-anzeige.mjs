import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const b = await chromium.launch()
const s = await b.newPage({ viewport: { width: 1440, height: 800 } })
await s.goto('http://127.0.0.1:3200/login', { waitUntil: 'networkidle' })
await s.fill('input[type="email"]', 'dev@lumeos.app')
await s.fill('input[type="password"]', wortFuer('dev@lumeos.app'))
await s.click('button[type="submit"]')
await s.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })

console.log('══ Befund 5 · Anlege-Feld verschwindet beim Klick ══')
await s.goto('http://127.0.0.1:3200/v2/nutrition?tab=prefs', { waitUntil: 'networkidle' })
await s.waitForTimeout(3200)
const feld = s.locator('[data-probe="slots-anzahl"]')
console.log(`  vor Klick: ${await feld.count()}, Wert=${await feld.inputValue()}`)
await feld.click()
await s.waitForTimeout(400)
console.log(`  nach Klick: ${await feld.count()}, sichtbar=${await feld.isVisible()}`)
// Und ein Namensfeld?
const nf = s.locator('[data-probe="slot-name"]').first()
await nf.click()
await s.waitForTimeout(400)
console.log(`  Namensfeld nach Klick: sichtbar=${await nf.isVisible()}, Wert=${JSON.stringify(await nf.inputValue())}`)

console.log('\n══ Befund 6 · Plan bearbeiten muss gescrollt werden ══')
await s.goto('http://127.0.0.1:3200/v2/nutrition?tab=planner', { waitUntil: 'networkidle' })
await s.waitForTimeout(3000)
const bk = s.getByRole('button', { name: 'Bearbeiten' }).first()
if (await bk.count()) {
  await bk.click()
  await s.waitForTimeout(1200)
  const modal = s.locator('[role="dialog"]').first()
  if (await modal.count()) {
    const bb = await modal.boundingBox()
    const vp = s.viewportSize()
    console.log(`  Modal y=${bb.y.toFixed(0)} h=${bb.height.toFixed(0)} · Fenster h=${vp.height}`)
    console.log(`  passt ohne Scrollen: ${bb.y + bb.height <= vp.height ? 'ja' : `NEIN (${(bb.y+bb.height-vp.height).toFixed(0)} px darüber)`}`)
    const scroll = await s.evaluate(() => ({ y: window.scrollY, h: document.body.scrollHeight }))
    console.log(`  Seiten-Scroll: y=${scroll.y}`)
  } else console.log('  kein Modal')
}
await s.screenshot({ path: 'backup/g335-planmodal.png' })
await b.close()
