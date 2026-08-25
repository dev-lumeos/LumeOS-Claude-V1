// G-179: Bildschirmfotos der drei Detailfenster.
//
// `[read]` Der Nachweis verlangt drei: eines mit vollem Inhalt, eines
// mit Luecken, ein Enhanced. Dazu der Sammeleintrag mit seinen Formen —
// das ist der Teil aus §9, den bis jetzt niemand sehen konnte.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3200'
const KONTO = process.env.LUMEOS_KONTO ?? 'test-user@lumeos.local'

const PROBEN = [
  ['Creatine monohydrate', 'g179-voll.png'],
  ['Magnesium', 'g179-formen.png'],
  ['1-Testosterone', 'g179-enhanced.png'],
]

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1200 } })
const seite = await ctx.newPage()

await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle', timeout: 60_000 })
await seite.fill('input[type=email]', KONTO)
await seite.fill('input[type=password]', wortFuer(KONTO))
await Promise.all([
  seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 60_000 }),
  seite.click('button[type=submit]'),
])

for (const [name, bild] of PROBEN) {
  await seite.goto(`${BASIS}/v2/supplements?tab=database`,
    { waitUntil: 'networkidle', timeout: 90_000 })
  await seite.waitForTimeout(1500)
  const zeile = seite.locator(`.v2-tbl tbody tr:has-text("${name}")`).first()
  if (!await zeile.count()) { console.log(`${name}: nicht gefunden`); continue }
  await zeile.click()
  await seite.waitForSelector('[role=dialog]', { timeout: 30_000 })
  await seite.waitForTimeout(900)
  const dlg = seite.locator('[role=dialog]').first()
  await dlg.screenshot({ path: `backup/${bild}` })
  const hoehe = await dlg.evaluate(e => e.scrollHeight)
  console.log(`${name.padEnd(22)} -> backup/${bild}   ${hoehe} px hoch`)
}

await browser.close()
