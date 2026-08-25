// G-154 in der Oberflaeche, beide Konten:
//   - steht die Allergen-Gruppe noch da?  (soll: nein)
//   - tragen die acht Pillen Zahlen?      (soll: ja, aus den Facetten)
//   - erscheint der Unvertraeglichkeits-Hinweis nur bei dev?
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3200'
const browser = await chromium.launch()

for (const [konto, wort, datei] of [
  ['test-user@lumeos.local', wortFuer('test-user@lumeos.local'), 'backup/g154-testuser.png'],
  ['dev@lumeos.app', 'LumeosDev2026', 'backup/g154-dev.png'],
]) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1100 } })
  const seite = await ctx.newPage()
  await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle', timeout: 60_000 })
  if (await seite.locator('input[type=email]').count()) {
    await seite.fill('input[type=email]', konto)
    await seite.fill('input[type=password]', wort)
    await Promise.all([
      seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 60_000 }),
      seite.click('button[type=submit]'),
    ])
  }
  await seite.goto(`${BASIS}/v2/nutrition?tab=foods`,
    { waitUntil: 'networkidle', timeout: 60_000 })
  await seite.waitForTimeout(1600)

  // Filterleiste oeffnen.
  const k = seite.locator('button:has-text("Filters")').first()
  if (await k.count()) { await k.click().catch(() => {}); await seite.waitForTimeout(700) }

  const d = await seite.evaluate(() => {
    const txt = (document.body.textContent ?? '').replace(/\s+/g, ' ')
    const pillen = [...document.querySelectorAll('button')]
      .map(b => (b.textContent ?? '').replace(/\s+/g, ' ').trim())
      .filter(t => /^(Vegan|Vegetarisch|Proteinreich|Low-Carb|Fettarm|Ballaststoffreich|Grundnahrungsmittel|Hochverarbeitet)/.test(t))
    return {
      treffer: txt.match(/([\d.]{3,})\s*Treffer/)?.[1] ?? null,
      allergenGruppe: /Allergene ausschliessen/.test(txt),
      ohneLaktosePille: /Ohne Laktose/.test(txt),
      unvertraeglich: /Unverträglichkeiten/.test(txt),
      pillen,
    }
  })
  console.log(`=== ${konto} ===`)
  console.log('  Treffer               :', d.treffer)
  console.log('  „Allergene ausschliessen" da? :', d.allergenGruppe, ' (soll false)')
  console.log('  „Ohne Laktose"-Pille da?      :', d.ohneLaktosePille, ' (soll false)')
  console.log('  Unvertraeglichkeits-Hinweis   :', d.unvertraeglich)
  console.log('  Pillen mit Zahl       :', JSON.stringify(d.pillen))
  await seite.screenshot({ path: datei, fullPage: true })
  await ctx.close()
  console.log()
}
await browser.close()
