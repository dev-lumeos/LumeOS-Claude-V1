// G-315: Aktivieren geht bei einem Coach-Plan.
// `[read]` LESEND belegt: der Aufruf wird gesendet, die Antwort
// geprueft — dev wird NICHT veraendert (Rueckbau am Ende).
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const b = await chromium.launch()
const s = await b.newPage({ viewport: { width: 1440, height: 1400 } })
await s.goto('http://127.0.0.1:3200/login', { waitUntil: 'networkidle' })
await s.fill('input[type="email"]', 'dev@lumeos.app')
await s.fill('input[type="password"]', wortFuer('dev@lumeos.app'))
await s.click('button[type="submit"]')
await s.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })

// Den Coach-Plan finden — nur lesen.
const plaene = await s.evaluate(async () => {
  const r = await fetch('/api/nutrition/plan?datum=2026-09-02')
  return r.status
})
console.log(`GET plan: ${plaene}`)

// Die Vorschau des Schreibwegs: dieselbe Pruefung, ohne zu schreiben.
// `[read]` Wir senden `status: 'assigned'` auf einen Plan, der schon
// `assigned` ist — die Herkunftspruefung laeuft, der Wert aendert sich
// nicht.
const coachPlan = process.env.G315_COACH_PLAN
if (!coachPlan) { console.log('G315_COACH_PLAN fehlt'); await b.close(); process.exit(0) }
const antwort = await s.evaluate(async id => {
  const r = await fetch('/api/nutrition/plan', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ art: 'plan_aendern', id, status: 'assigned' }),
  })
  return { status: r.status, body: (await r.text()).slice(0, 220) }
}, coachPlan)
console.log(`POST plan_aendern (status: assigned) auf den COACH-Plan:`)
console.log(`  HTTP ${antwort.status}`)
console.log(`  ${antwort.body}`)
await b.close()

// Gegenprobe: eine INHALTS-Aenderung muss weiter abgewiesen werden.
EOFMARK