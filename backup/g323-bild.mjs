import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const ziel = process.argv[2] ?? 'backup/g323-nachher.png'
const b = await chromium.launch()
const s = await b.newPage({ viewport: { width: 1440, height: 1700 } })
await s.goto('http://127.0.0.1:3200/login', { waitUntil: 'networkidle' })
await s.fill('input[type="email"]', 'dev@lumeos.app')
await s.fill('input[type="password"]', wortFuer('dev@lumeos.app'))
await s.click('button[type="submit"]')
await s.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })
await s.goto('http://127.0.0.1:3200/v2/nutrition?tab=rezepte', { waitUntil: 'networkidle' })
await s.waitForTimeout(2600)
// Ein bestehendes Rezept bearbeiten — dort stehen die Zutaten.
const edit = s.locator('button[aria-label*="bearbeiten"], button[aria-label*="ändern"]')
console.log(`Bearbeiten-Knoepfe: ${await edit.count()}`)
if (await edit.count()) {
  await edit.first().click()
  await s.waitForTimeout(1600)
}
const zeilen = s.locator('[data-probe="zutat-zeile"]')
const alt = s.locator('input[aria-label^="Menge "]')
console.log(`Zutatzeilen (neu): ${await zeilen.count()} · Mengenfelder: ${await alt.count()}`)
if (await zeilen.count()) {
  for (let i = 0; i < Math.min(3, await zeilen.count()); i++) {
    console.log(`  ${JSON.stringify((await zeilen.nth(i).innerText()).replace(/\n/g,' | '))}`)
  }
}
await s.screenshot({ path: ziel, fullPage: false })
console.log(`Bild: ${ziel}`)
await b.close()
