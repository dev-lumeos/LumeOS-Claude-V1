// G-304: die drei Fragen am Schirm beantworten.
//
// 1. Wie kommt ein Nutzer zu seinem ersten Plan?
// 2. Traegt die Oberflaeche den Unterschied Planner / Meal plans?
// 3. Was kann er mit einem abgelaufenen Plan tun?
//
// `[read]` **Nichts gedrueckt, was schreibt** — die Dialoge werden
// geoeffnet und gelesen, nicht bestaetigt.
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'

const KONTO = process.argv[2] ?? 'dev@lumeos.app'
const BASIS = 'http://127.0.0.1:3200'
const browser = await chromium.launch()
const seite = await browser.newPage({ viewport: { width: 1600, height: 1500 } })

await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await seite.fill('input[type="email"]', KONTO)
await seite.fill('input[type="password"]', wortFuer(KONTO))
await seite.click('button[type="submit"]')
await seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })
console.log(`### Konto: ${KONTO}\n`)

// ── FRAGE 1: der erste Plan ──────────────────────────────────────
await seite.goto(`${BASIS}/v2/nutrition?tab=plans`, { waitUntil: 'networkidle' })
await seite.waitForTimeout(1300)

console.log('=== FRAGE 1: „New plan" — was fragt der Dialog? ===')
const neu = seite.getByRole('button', { name: 'New plan' })
if (await neu.count() === 0) console.log('  KEIN „New plan"-Knopf sichtbar')
else {
  await neu.first().click()
  await seite.waitForTimeout(700)
  const m = seite.locator('.v2-modal')
  if (await m.count() === 0) console.log('  Knopf oeffnet KEINEN Dialog')
  else {
    console.log((await m.first().innerText()).split('\n')
      .filter(Boolean).map(s => `  ${s}`).join('\n'))
    // Welche Felder gibt es?
    const felder = await m.first().locator('input, select, textarea').count()
    console.log(`\n  Eingabefelder: ${felder}`)
    for (const sel of ['input', 'select']) {
      const l = m.first().locator(sel)
      for (let i = 0; i < await l.count(); i += 1) {
        const a = await l.nth(i).getAttribute('aria-label')
          ?? await l.nth(i).getAttribute('type') ?? sel
        console.log(`    ${sel}: ${a}`)
      }
    }
    // Fuehrt er zu Wochen/Tagen/Eintraegen?
    const txt = (await m.first().innerText()).toLowerCase()
    console.log(`\n  nennt „Woche": ${txt.includes('woche')}`)
    console.log(`  nennt „Tag": ${txt.includes('tag')}`)
    console.log(`  nennt „Eintrag"/"Zutat": ${txt.includes('eintrag') || txt.includes('zutat')}`)
    await seite.keyboard.press('Escape').catch(() => {})
    await seite.waitForTimeout(400)
  }
}

// ── FRAGE 3: der abgelaufene Plan ────────────────────────────────
console.log('\n=== FRAGE 3: abgelaufener Plan — welche Knoepfe? ===')
const koerper = await seite.locator('body').innerText()
const ab = koerper.indexOf('ALLE PLÄNE')
console.log(koerper.slice(ab, ab + 700).split('\n').filter(Boolean)
  .map(s => `  ${s}`).join('\n'))

console.log('\n  „Laufzeit ändern" — was bietet der Dialog?')
const lz = seite.getByRole('button', { name: 'Laufzeit ändern' })
if (await lz.count() > 0) {
  await lz.first().click()
  await seite.waitForTimeout(700)
  const m = seite.locator('.v2-modal')
  console.log((await m.first().innerText()).split('\n').filter(Boolean)
    .map(s => `    ${s}`).join('\n'))
  await seite.keyboard.press('Escape').catch(() => {})
  await seite.waitForTimeout(400)
}

// ── FRAGE 2: Planner gegen Meal plans ────────────────────────────
console.log('\n=== FRAGE 2: was zeigt welcher Reiter? ===')
for (const tab of ['plans', 'planner']) {
  await seite.goto(`${BASIS}/v2/nutrition?tab=${tab}`, { waitUntil: 'networkidle' })
  await seite.waitForTimeout(1200)
  const t = await seite.locator('body').innerText()
  const nachReiter = t.slice(t.indexOf('Rezepte') + 8)
  // Welche Ueberschriften traegt der Reiter?
  const karten = seite.locator('.v2-card-title')
  const titel = []
  for (let i = 0; i < await karten.count(); i += 1) {
    titel.push((await karten.nth(i).innerText()).trim())
  }
  console.log(`\n  ${tab}: ${titel.length} Karten`)
  titel.forEach(x => console.log(`    - ${x}`))
  console.log(`    nennt den Plannamen: ${nachReiter.includes('Aufbau-Wochenplan')}`)
  console.log(`    zeigt Eintraege je Tag: ${/Banane|Huhn|Lachs/.test(nachReiter)}`)
}

await browser.close()
