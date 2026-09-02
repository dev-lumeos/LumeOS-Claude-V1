import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const b = await chromium.launch()
const s = await b.newPage({ viewport: { width: 1440, height: 800 } })
await s.goto('http://127.0.0.1:3200/login', { waitUntil: 'networkidle' })
await s.fill('input[type="email"]', 'dev@lumeos.app')
await s.fill('input[type="password"]', wortFuer('dev@lumeos.app'))
await s.click('button[type="submit"]')
await s.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })

console.log('══ Befund 5 · welches Anlege-Feld? ══')
// Kandidat: Planner, Eintrag hinzufuegen
await s.goto('http://127.0.0.1:3200/v2/nutrition?tab=planner', { waitUntil: 'networkidle' })
await s.waitForTimeout(3000)
const plus = s.locator('button[aria-label^="Eintrag hinzufügen"]')
console.log(`  Planner-Plus: ${await plus.count()}`)
if (await plus.count()) {
  await plus.first().click()
  await s.waitForTimeout(900)
  const form = s.locator('.v2-planner-form')
  console.log(`  Formular offen: ${await form.count()}`)
  // Klick INS Formular — verschwindet es?
  const feld = form.locator('select, input').first()
  if (await feld.count()) {
    await feld.click()
    await s.waitForTimeout(600)
    console.log(`  nach Klick ins Feld: Formular ${await form.count()}, sichtbar=${await form.first().isVisible().catch(()=>false)}`)
  }
}

console.log('\n══ Befund 6 · Meal plans, Plan bearbeiten ══')
await s.goto('http://127.0.0.1:3200/v2/nutrition?tab=plans', { waitUntil: 'networkidle' })
await s.waitForTimeout(3000)
const bk = s.getByRole('button', { name: 'Bearbeiten' })
console.log(`  Bearbeiten-Knoepfe: ${await bk.count()}`)
if (await bk.count()) {
  await bk.first().click()
  await s.waitForTimeout(1200)
  const m = s.locator('[role="dialog"]').first()
  if (await m.count()) {
    const bb = await m.boundingBox()
    console.log(`  Modal y=${bb.y.toFixed(0)} h=${bb.height.toFixed(0)} · Fenster 800`)
    console.log(`  passt: ${bb.y + bb.height <= 800 ? 'ja' : `NEIN (${(bb.y+bb.height-800).toFixed(0)} px darunter)`}`)
  }
}
await s.screenshot({ path: 'backup/g335-befund6.png' })
await b.close()
