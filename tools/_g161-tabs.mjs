// G-161: Attrappen und echte Zahlen je Unter-Tab (active/library/shopping).
import { chromium } from '@playwright/test'

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3200'
const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'
const WORT = process.env.LUMEOS_WORT ?? 'LumeosDev2026'

const browser = await chromium.launch()
const seite = await (await browser.newContext({
  viewport: { width: 1440, height: 1100 } })).newPage()

await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle', timeout: 60_000 })
if (await seite.locator('input[type=email]').count()) {
  await seite.fill('input[type=email]', KONTO)
  await seite.fill('input[type=password]', WORT)
  await Promise.all([
    seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 60_000 }),
    seite.click('button[type=submit]'),
  ])
}
await seite.goto(`${BASIS}/v2/nutrition?tab=plans`,
  { waitUntil: 'networkidle', timeout: 60_000 })
await seite.waitForTimeout(1500)

console.log(`Konto: ${KONTO}`)
for (const [name, treffer] of [
  ['active', 'Active plan'], ['library', 'Plan library'], ['shopping', 'Shopping list'],
]) {
  const k = seite.locator(`button:has-text("${treffer}")`).first()
  if (await k.count()) { await k.click().catch(() => {}); await seite.waitForTimeout(900) }
  const d = await seite.evaluate(() => {
    const t = (document.body.textContent ?? '').replace(/\s+/g, ' ')
    return {
      attrappen: (t.match(/Attrappe/g) ?? []).length,
      plan: /Aufbau-Wochenplan/.test(t),
      // Die gemessenen Zahlen — 3 Wochen, 21 Tage, 56 Eintraege.
      zahlen: (t.match(/(\d+) Wochen · (\d+) Tage · (\d+) Eintr/) ?? []).slice(1),
    }
  })
  console.log(`  ${name.padEnd(9)} Attrappen ${d.attrappen}  Plan ${d.plan}`
    + `  Zahlen ${JSON.stringify(d.zahlen)}`)
}
await browser.close()
