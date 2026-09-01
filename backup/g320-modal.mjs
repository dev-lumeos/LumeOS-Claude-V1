import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const b = await chromium.launch()
const s = await b.newPage({ viewport: { width: 1440, height: 1700 } })
await s.goto('http://127.0.0.1:3200/login', { waitUntil: 'networkidle' })
await s.fill('input[type="email"]', 'dev@lumeos.app')
await s.fill('input[type="password"]', wortFuer('dev@lumeos.app'))
await s.click('button[type="submit"]')
await s.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })
await s.goto('http://127.0.0.1:3200/v2/nutrition?tab=planner', { waitUntil: 'networkidle' })
await s.waitForTimeout(2600)

// Eine Zelle aufklappen: der "+"-Knopf am Zellenende.
const plus = s.locator('button[aria-label^="Eintrag hinzufügen"]')
console.log(`Hinzufuegen-Knoepfe: ${await plus.count()}`)
await plus.first().click()
await s.waitForTimeout(900)

// Auf "Lebensmittel" umstellen.
const art = s.locator('select').filter({ hasText: 'Rezept' }).first()
await art.selectOption('bls')
await s.waitForTimeout(500)
const t1 = await s.locator('body').innerText()
console.log(`alter Satz "noch nicht angebunden": ${t1.includes('noch nicht angebunden') ? 'NOCH DA' : 'weg'}`)
console.log(`Suchen-Knopf: ${await s.getByRole('button', { name: /Suchen/ }).count()}`)

await s.getByRole('button', { name: /Suchen/ }).first().click()
await s.waitForTimeout(700)
console.log(`Modal offen: ${await s.locator('[role="dialog"][aria-label="Lebensmittel suchen"]').count()}`)
console.log(`Sortierknoepfe: ${await s.locator('[role="dialog"] button[aria-pressed]').count()}`)

await s.fill('[role="dialog"] input[aria-label="Lebensmittel suchen"]', 'hammel')
await s.waitForTimeout(1800)
const zeilen = await s.locator('[role="dialog"] tbody tr').count()
console.log(`Treffer: ${zeilen}`)
console.log(`Trefferzahl-Text: ${await s.locator('[data-probe="trefferzahl"]').innerText().catch(() => 'FEHLT')}`)
await s.screenshot({ path: 'backup/g320-suche.png' })

if (zeilen) {
  await s.locator('[role="dialog"] tbody tr button').first().click()
  await s.waitForTimeout(1200)
  const v100 = await s.locator('[data-probe="vorschau"]').innerText()
  await s.fill('[role="dialog"] input[aria-label="Menge in Gramm"]', '150')
  await s.waitForTimeout(600)
  const v150 = await s.locator('[data-probe="vorschau"]').innerText()
  console.log(`\nVorschau bei Vorgabe: ${JSON.stringify(v100.replace(/\n/g, ' '))}`)
  console.log(`Vorschau bei 150 g:   ${JSON.stringify(v150.replace(/\n/g, ' '))}`)
  console.log(`aendert sich: ${v100 !== v150 ? 'JA' : 'NEIN'}`)
  console.log(`Kontext: ${JSON.stringify((await s.locator('[data-probe="tageskontext"]').innerText()).replace(/\n/g, ' '))}`)
  await s.screenshot({ path: 'backup/g320-menge.png' })
}
await b.close()
