// G-336: der Vorher-Stand. Nur lesend.
import { chromium } from '@playwright/test'

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

const raus = {}

// ── Planner: welcher Plan, wie viele Zeilen, welcher Satz ───────────
async function raster(planId, name) {
  const url = planId
    ? `${B}/v2/nutrition?tab=planner&plan=${planId}`
    : `${B}/v2/nutrition?tab=planner`
  await p.goto(url, { waitUntil: 'networkidle' })
  await p.waitForTimeout(2500)
  const t = await p.locator('body').innerText()
  const m = t.match(/(\d+) Reihen aus [^\n.]*\./)
  return {
    plan: name,
    satz: m ? m[0] : '(kein Satz gefunden)',
    reihen_im_satz: m ? Number(m[1]) : null,
  }
}

// Welche Pläne gibt es, mit ID?
await p.goto(`${B}/v2/nutrition?tab=plans`, { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)
raus.plaene = await p.locator('[data-probe*="plan"], a[href*="plan="]')
  .evaluateAll(n => n.map(e => e.getAttribute('href')).filter(Boolean).slice(0, 12))

raus.aktiv = await raster(null, '(aktiver Plan)')
raus.test = await raster('635463c1-dcc7-4463-a1c7-82f1bab32918', 'test (5 Slots)')
raus.aufbau = await raster('0aef80dd-0f94-4f65-a90f-92a1ebe50566', 'Aufbau (0 Slots)')
raus.lean = await raster('cb439c85-be58-49fb-870f-27d567b4937f', 'Lean bulk (marketplace)')

await p.screenshot({ path: 'backup/g336-nachher-planner.png', fullPage: true })

// ── Diary: das inline-Formular ──────────────────────────────────────
await p.goto(`${B}/v2/nutrition?tab=diary`, { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)
await p.screenshot({ path: 'backup/g336-nachher-diary-zu.png', fullPage: true })

const knopf = p.locator('[data-probe="freie-mahlzeit-oeffnen"]')
raus.knopf_vorher = await knopf.count()
if (await knopf.count()) {
  const kasten = await knopf.boundingBox()
  await knopf.click()
  await p.waitForTimeout(1200)
  raus.nach_klick = {
    knopf_noch_da: await p.locator('[data-probe="freie-mahlzeit-oeffnen"]').count(),
    formular_da: await p.locator('[data-probe="freie-mahlzeit"]').count(),
    dialog: await p.locator('[role=dialog]').count(),
    knopf_lag_bei_y: kasten ? Math.round(kasten.y) : null,
    auswahl: await p.locator('[data-probe="freie-art"] option')
      .evaluateAll(n => n.map(e => e.textContent.trim())),
    hinweis: await p.locator('[data-probe="freie-hinweis"]').innerText()
      .catch(() => '(kein Hinweis)'),
    hinweis_sichtbar: await p.locator('[data-probe="freie-hinweis"]')
      .isVisible().catch(() => false),
  }
  await p.screenshot({ path: 'backup/g336-nachher-diary-offen.png', fullPage: true })
}

console.log(JSON.stringify(raus, null, 2))
await b.close()
