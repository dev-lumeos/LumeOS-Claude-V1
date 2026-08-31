// Die zwei unteren Kacheln einzeln - sie stehen unter dem Falz.
import { chromium } from '@playwright/test'
// G-175: das Wort kommt aus dem Helfer, nicht aus einer Vermutung.
import { wortFuer } from '../tools/konten.mjs'

const browser = await chromium.launch()
const seite = await browser.newPage({ viewport: { width: 1440, height: 3000 } })

await seite.goto('http://127.0.0.1:3200/login', { waitUntil: 'networkidle' })
await seite.fill('input[type="email"]', 'dev@lumeos.app')
await seite.fill('input[type="password"]', wortFuer('dev@lumeos.app'))
await seite.click('button[type="submit"]')
await seite.waitForURL(/\/v2\//, { timeout: 30000 }).catch(() => {})

await seite.goto('http://127.0.0.1:3200/v2/nutrition?tab=insights',
  { waitUntil: 'networkidle' })
await seite.waitForTimeout(1500)

// Nach Titel suchen, nicht nach Reihenfolge - robuster.
for (const [titel, datei] of [
  ['Makros im Detail', 'g291-makrodetail.png'],
  ['Auffaellige Naehrstoffe', 'g291-warnungen.png'],
  ['Verlauf', 'g291-verlauf.png'],
  ['Tagesdeckung', 'g291-heatmap.png'],
]) {
  // Die Karte selbst, nicht der Titel-Container: von der Ueberschrift
  // aus zum naechsten Vorfahren mit der Kartenklasse.
  const karte = seite.locator('.v2-card').filter({
    hasText: titel,
  }).first()
  const n = await karte.count()
  if (n === 0) { console.log(`FEHLT: ${titel}`); continue }
  await karte.screenshot({ path: `backup/${datei}` })
  console.log(`ok ${titel} -> backup/${datei}`)
}

// Und den Text der zwei unteren Kacheln als Beleg.
const text = await seite.locator('body').innerText()
const ab = text.indexOf('Makros im Detail')
console.log('\n=== Text ab „Makros im Detail" ===')
console.log(text.slice(ab, ab + 2200))

await browser.close()
