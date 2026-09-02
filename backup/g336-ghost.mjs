// G-336 Punkt 4: folgen die Ghost-Eintraege der Planstruktur? Nur lesend.
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

// Der aktive Plan ist Aufbau-Wochenplan; seine Ghosts stehen im Diary.
await p.goto(`${B}/v2/nutrition?tab=diary`, { waitUntil: 'networkidle' })
await p.waitForTimeout(3000)

const raus = {
  ghost_karten: await p.locator('[data-probe="ghost-eintrag"]').count(),
  // Die Ueberschriften der Ghost-Karten: heissen sie wie die Slots?
  namen: await p.locator('[data-probe="ghost-eintrag"] span')
    .evaluateAll(n => n.map(e => e.textContent.trim())
      .filter(t => t && t.length < 30).slice(0, 40)),
}

const t = await p.locator('body').innerText()
raus.englisch = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Pre-Workout']
  .filter(w => t.includes(w))
raus.slotnamen_im_text = ['Frühstück', 'Snack', 'Mittagessen',
  'Nachmittagssnack', 'Abendessen'].filter(w => t.includes(w))

await p.screenshot({ path: 'backup/g336-ghost.png', fullPage: true })
console.log(JSON.stringify(raus, null, 2))
await b.close()
