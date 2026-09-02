// G-335: Befund 3 und 5/6 — die Modale im Planner, gezielt.
import { chromium } from '@playwright/test'

const B = 'http://127.0.0.1:3200'
const b = await chromium.launch()
const s = await b.newContext({ viewport: { width: 1400, height: 900 } })
const p = await s.newPage()

await p.goto(`${B}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', 'dev@lumeos.app')
await p.fill('input[type=password]', 'LumeosDev2026')
await Promise.all([
  p.waitForURL(u => !u.pathname.includes('login'), { timeout: 60000 }),
  p.click('button[type=submit]'),
])

const raus = {}
const ENGL = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Pre-Workout',
  'Pre-workout', 'Post-Workout']

await p.goto(`${B}/v2/nutrition?tab=planner`, { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)

// ── Welche Knöpfe gibt es? ──────────────────────────────────────────
raus.knoepfe = await p.locator('button').evaluateAll(
  n => n.map(e => e.innerText.trim()).filter(t => t && t.length < 40))

// ── Alle Pulldowns auf der Seite: was steht drin? ───────────────────
raus.selects_seite = await p.locator('select').evaluateAll(
  n => n.map(e => [...e.options].map(o => o.text)))

// ── "Plan bearbeiten" öffnen ────────────────────────────────────────
const bearb = p.locator('button', { hasText: /bearbeiten/i }).first()
if (await bearb.count()) {
  await bearb.click()
  await p.waitForTimeout(2000)
  const t = await p.locator('body').innerText()
  raus.bearbeiten = {
    dialoge: await p.locator('[role=dialog], .v2-modal, [data-probe*=modal]').count(),
    inhalt: await p.locator('[role=dialog], .v2-modal, [data-probe*=modal]')
      .first().innerText().catch(() => '(nicht lesbar)'),
    ueberschriften: await p.locator('h1,h2,h3').evaluateAll(
      n => n.map(e => e.innerText.trim()).slice(-8)),
    englisch: ENGL.filter(w => t.includes(w)),
    roh: ['pre_workout', 'post_workout'].filter(w => t.includes(w)),
    selects: await p.locator('select').evaluateAll(
      n => n.map(e => [...e.options].map(o => o.text))),
  }
  // Befund 6: muss das Modal gescrollt werden?
  raus.bearbeiten.rollen = await p.evaluate(() => {
    const alle = [...document.querySelectorAll('*')]
    const t = alle.filter(e => e.scrollHeight > e.clientHeight + 4
      && getComputedStyle(e).overflowY !== 'visible'
      && e.clientHeight > 200)
    return t.map(e => ({
      klasse: (e.className || '').toString().slice(0, 40),
      scroll: e.scrollHeight, sicht: e.clientHeight,
    }))
  })
  await p.screenshot({ path: 'backup/g335-bearbeiten.png', fullPage: true })
  await p.keyboard.press('Escape')
  await p.waitForTimeout(800)
}

// ── "Neuer Plan" öffnen ─────────────────────────────────────────────
const neu = p.locator('button', { hasText: /^Neuer Plan$/ }).first()
if (await neu.count()) {
  await neu.click()
  await p.waitForTimeout(2000)
  raus.neuer_plan = {
    inhalt: await p.locator('[role=dialog], .v2-modal, [data-probe*=modal]')
      .first().innerText().catch(() => '(kein Dialog)'),
    selects: await p.locator('select').evaluateAll(
      n => n.map(e => [...e.options].map(o => o.text))),
  }
  await p.screenshot({ path: 'backup/g335-neuer-plan.png', fullPage: true })
}

console.log(JSON.stringify(raus, null, 2))
await b.close()
