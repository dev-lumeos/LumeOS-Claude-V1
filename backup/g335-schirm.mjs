// G-335: der Nachweis am Schirm — welche Namen stehen wo.
import { chromium } from '@playwright/test'

const B = 'http://127.0.0.1:3200'
const b = await chromium.launch()
const s = await b.newContext({ viewport: { width: 1400, height: 1000 } })
const p = await s.newPage()

await p.goto(`${B}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', 'dev@lumeos.app')
await p.fill('input[type=password]', 'LumeosDev2026')
await Promise.all([
  p.waitForURL(u => !u.pathname.includes('login'), { timeout: 60000 }),
  p.click('button[type=submit]'),
])

const raus = {}

// ── 1 · Tagebuch: die Kartennamen ───────────────────────────────────
await p.goto(`${B}/v2/nutrition?tab=diary`, { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)
const txt = await p.locator('body').innerText()
raus.diary_englisch = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Pre-Workout',
  'Post-Workout'].filter(w => txt.includes(w))
raus.diary_roh = ['pre_workout', 'post_workout', 'meal_type']
  .filter(w => txt.includes(w))
await p.screenshot({ path: 'backup/g335-diary.png', fullPage: true })

// ── 2 · Vorlieben: die Verschmelzung ────────────────────────────────
await p.goto(`${B}/v2/nutrition?tab=prefs`, { waitUntil: 'networkidle' })
await p.waitForTimeout(2000)
const pt = await p.locator('body').innerText()
raus.prefs = {
  mahlzeitenstruktur: pt.includes('Mahlzeitenstruktur'),
  hauptmahlzeiten: pt.includes('Hauptmahlzeiten'),
  vorkochen: pt.includes('Vorkochen'),
  slot_zeilen: await p.locator('[data-probe="slot-zeile"]').count(),
  slot_namen: await p.locator('[data-probe="slot-name"]')
    .evaluateAll(n => n.map(e => e.value)),
}
await p.screenshot({ path: 'backup/g335-prefs.png', fullPage: true })

// ── 3 · Plans: die Ghost-Karten ─────────────────────────────────────
await p.goto(`${B}/v2/nutrition?tab=plans`, { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)
const gt = await p.locator('body').innerText()
raus.plans_englisch = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Pre-Workout',
  'Post-Workout'].filter(w => gt.includes(w))
raus.plans_roh = ['pre_workout', 'post_workout'].filter(w => gt.includes(w))
await p.screenshot({ path: 'backup/g335-plans.png', fullPage: true })

// ── 4 · Planner ─────────────────────────────────────────────────────
await p.goto(`${B}/v2/nutrition?tab=planner`, { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)
const nt = await p.locator('body').innerText()
raus.planner_englisch = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']
  .filter(w => nt.includes(w))
await p.screenshot({ path: 'backup/g335-planner.png', fullPage: true })

console.log(JSON.stringify(raus, null, 2))
await b.close()
