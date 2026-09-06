// G-340: Quick-Add am Schirm. Nur lesend — es wird NICHTS angelegt.
import { chromium } from '@playwright/test'

const MARKE = process.argv[2] ?? 'vorher'
const B = 'http://127.0.0.1:3200'
const b = await chromium.launch()
const s = await b.newContext({ viewport: { width: 1400, height: 950 } })
const p = await s.newPage()

await p.goto(`${B}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', 'dev@lumeos.app')
await p.fill('input[type=password]', 'LumeosDev2026')
await Promise.all([
  p.waitForURL(u => !u.pathname.includes('login'), { timeout: 60000 }),
  p.click('button[type=submit]'),
])

await p.goto(`${B}/v2/nutrition?tab=diary`, { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)

await p.getByRole('button', { name: /Quick-add/i }).first().click()
await p.waitForTimeout(1500)

const d = p.locator('[role=dialog]').first()
const raus = {
  dialog: await p.locator('[role=dialog]').count(),
  inhalt: (await d.innerText().catch(() => '(kein Dialog)')).slice(0, 700),
  felder: await p.locator('[role=dialog] input, [role=dialog] select')
    .evaluateAll(n => n.map(e => e.getAttribute('aria-label')
      ?? e.getAttribute('data-probe') ?? e.tagName)),
  // Schreibt der Knopf, oder ist er "in Entwicklung"?
  knoepfe: await p.locator('[role=dialog] button')
    .evaluateAll(n => n.map(e => e.textContent.trim()).filter(Boolean)),
  ziehbar: await p.locator('[data-probe="titelleiste"]').count(),
}

await p.screenshot({ path: `backup/g340-${MARKE}-quickadd.png`, fullPage: false })
console.log(JSON.stringify(raus, null, 2))
await b.close()
