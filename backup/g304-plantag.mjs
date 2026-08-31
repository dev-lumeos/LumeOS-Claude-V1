// G-304: an einem Tag INNERHALB der Planlaufzeit — was steht dort?
//
// `[read]` Der Plan lief 18.6.–15.7. Heute ist der 31.8., deshalb
// zeigt die Kachel „kein Eintrag". **Die Frage ist, ob die Flow-4-
// Knoepfe an einem Plantag erscheinen.**
//
// **Nichts gedrueckt, was schreibt** — nur gelesen.
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'

const BASIS = 'http://127.0.0.1:3200'
const browser = await chromium.launch()
const seite = await browser.newPage({ viewport: { width: 1500, height: 1200 } })

await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await seite.fill('input[type="email"]', 'dev@lumeos.app')
await seite.fill('input[type="password"]', wortFuer('dev@lumeos.app'))
await seite.click('button[type="submit"]')
await seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })

for (const datum of ['2026-06-18', '2026-08-31']) {
  await seite.goto(`${BASIS}/v2/nutrition?tab=plans&datum=${datum}`,
    { waitUntil: 'networkidle' })
  await seite.waitForTimeout(1300)
  const t = await seite.locator('body').innerText()
  const ab = t.indexOf('Plan-Einträge')
  console.log(`\n=== ${datum} ===`)
  console.log(t.slice(ab, ab + 420).split('\n').filter(Boolean)
    .map(s => `  ${s}`).join('\n'))
  const wie = await seite.getByRole('button', { name: /Wie geplant/ }).count()
  const aus = await seite.getByRole('button', { name: /Auslassen/ }).count()
  console.log(`  -> Knopf „Wie geplant": ${wie} | „Auslassen": ${aus}`)
}

await browser.close()
