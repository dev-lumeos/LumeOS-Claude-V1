// Wie viele Attrappenmarken stehen IM Reiter - nicht in der Huelle?
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'

const KONTO = 'dev@lumeos.app'
const browser = await chromium.launch()
const seite = await browser.newPage({ viewport: { width: 1440, height: 2400 } })

await seite.goto('http://127.0.0.1:3200/login', { waitUntil: 'networkidle' })
await seite.fill('input[type="email"]', KONTO)
await seite.fill('input[type="password"]', wortFuer(KONTO))
await seite.click('button[type="submit"]')
await seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })

for (const tab of ['plans', 'planner', 'insights', 'rezepte']) {
  await seite.goto(`http://127.0.0.1:3200/v2/nutrition?tab=${tab}`,
    { waitUntil: 'networkidle' })
  await seite.waitForTimeout(900)
  // Nur der Inhaltsbereich, nicht die Kontextleiste rechts.
  const gesamt = await seite.locator('.v2-attrappe').count()
  // `[cmd]` `InEntwicklungKnopf` setzt KEIN eigenes Attribut - der
  // erste Versuch (`[data-in-entwicklung]`) zaehlte deshalb immer 0.
  // Gezaehlt wird stattdessen der Knopf am Text.
  const inEntwicklung = await seite.getByRole('button')
    .filter({ hasText: /Copy week|New recipe|Neuen Plan anlegen/ }).count()
  const buddy = await seite.locator('text=Buddy ist in G-02 eine Attrappe').count()
  console.log(`${tab.padEnd(9)} v2-attrappe ${gesamt} | InEntwicklung ${inEntwicklung}`
    + ` | Buddy-Leiste ${buddy}`)
}

await browser.close()
