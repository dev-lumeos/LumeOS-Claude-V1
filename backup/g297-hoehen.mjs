// G-297: wie hoch sind Verlaufs- und Tagesdeckungskachel wirklich?
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'

const KONTO = 'dev@lumeos.app'
const browser = await chromium.launch()
const seite = await browser.newPage({ viewport: { width: 1440, height: 1400 } })

await seite.goto('http://127.0.0.1:3200/login', { waitUntil: 'networkidle' })
await seite.fill('input[type="email"]', KONTO)
await seite.fill('input[type="password"]', wortFuer(KONTO))
await seite.click('button[type="submit"]')
await seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })

await seite.goto('http://127.0.0.1:3200/v2/nutrition?tab=insights',
  { waitUntil: 'networkidle' })
await seite.waitForTimeout(1200)

for (const titel of ['Verlauf', 'Tagesdeckung']) {
  const karte = seite.locator('.v2-card').filter({ hasText: titel }).first()
  const box = await karte.boundingBox()
  console.log(`${titel.padEnd(14)} ${Math.round(box?.height ?? 0)} px hoch, `
    + `${Math.round(box?.width ?? 0)} px breit`)
}

// Wie viel Leerraum bleibt unter dem Inhalt der Kachel?
const leer = await seite.locator('.v2-card').filter({ hasText: 'Tagesdeckung' })
  .first().evaluate(el => {
    const kind = el.lastElementChild
    return kind
      ? Math.round(el.getBoundingClientRect().bottom - kind.getBoundingClientRect().bottom)
      : -1
  })
console.log(`Leerraum unten  ${leer} px`)

await browser.close()
