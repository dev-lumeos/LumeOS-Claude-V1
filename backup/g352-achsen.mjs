// G-352: welche Achse kann ein Nutzer am Schirm setzen? Nur lesend.
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'

const B = 'http://127.0.0.1:3200'
const b = await chromium.launch()
const s = await b.newContext({ viewport: { width: 1400, height: 1100 } })
const p = await s.newPage()

await p.goto(`${B}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', 'dev@lumeos.app')
await p.fill('input[type=password]', wortFuer('dev@lumeos.app'))
await Promise.all([
  p.waitForURL(u => !u.pathname.includes('login'), { timeout: 60000 }),
  p.click('button[type=submit]'),
])

const raus = {}

// ── 1 · Settings: die Zielrichtung (profiles.nutrition_goal) ───────
await p.goto(`${B}/v2/settings`, { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)
const selects = await p.locator('select').count()
raus.settings = { selects }
for (let i = 0; i < selects; i += 1) {
  const opts = await p.locator('select').nth(i).locator('option').allTextContents()
  const werte = await p.locator('select').nth(i).locator('option')
    .evaluateAll(n => n.map(e => e.value))
  if (werte.some(w => /lose_weight|gain_muscle|maintain/.test(w))) {
    raus.settings.zielrichtung = { texte: opts, werte }
  }
}
await p.screenshot({ path: 'backup/g352-settings.png', fullPage: false })

// ── 2 · Goals: kann man goal_type / subtype waehlen? ───────────────
await p.goto(`${B}/v2/goals`, { waitUntil: 'networkidle' })
await p.waitForTimeout(2800)
const txt = await p.locator('body').innerText()
raus.goals = {
  neues_ziel_knopf: /Neues Ziel|Ziel anlegen|New goal/i.test(txt),
  selects: await p.locator('select').count(),
  auswahlen: [],
}
for (let i = 0; i < raus.goals.selects; i += 1) {
  raus.goals.auswahlen.push(
    await p.locator('select').nth(i).locator('option')
      .evaluateAll(n => n.map(e => e.value)).catch(() => []))
}
// Steht eine der vier goal_type-Kategorien zur Wahl?
raus.goals.goal_type_waehlbar = raus.goals.auswahlen.some(a =>
  a.some(w => /body_composition|lifestyle/.test(w)))
raus.goals.subtype_waehlbar = raus.goals.auswahlen.some(a =>
  a.some(w => /gain_muscle|cardio_frequency|training_capacity/.test(w)))
await p.screenshot({ path: 'backup/g352-goals.png', fullPage: true })

console.log(JSON.stringify(raus, null, 2))
await b.close()
