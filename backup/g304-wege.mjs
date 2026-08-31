// G-304: jeden Knopf am Schirm anfassen und messen, was passiert.
//
// `[read]` **Ein gruener Endpunkt beweist nicht, dass ein Knopf ihn
// erreicht** (G-298). Deshalb: klicken, Netzverkehr mitschreiben,
// DOM-Aenderung messen.
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'

const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'
const BASIS = 'http://127.0.0.1:3200'

const browser = await chromium.launch()
const seite = await browser.newPage({ viewport: { width: 1600, height: 1400 } })

const netz = []
seite.on('request', r => {
  if (r.method() !== 'GET' && r.url().includes('/api/')) {
    netz.push(`${r.method()} ${r.url().replace(BASIS, '')}`)
  }
})

await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await seite.fill('input[type="email"]', KONTO)
await seite.fill('input[type="password"]', wortFuer(KONTO))
await seite.click('button[type="submit"]')
await seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })

const REITER = process.argv[2] ?? 'plans'
await seite.goto(`${BASIS}/v2/nutrition?tab=${REITER}`, { waitUntil: 'networkidle' })
await seite.waitForTimeout(1400)

console.log(`\n=== Reiter: ${REITER} — Konto ${KONTO} ===\n`)

// Alle sichtbaren Knoepfe im Inhaltsbereich (ohne Huelle/Sidebar).
const inhalt = seite.locator('main, [role="main"]').first()
const wurzel = await inhalt.count() > 0 ? inhalt : seite.locator('body')
const knoepfe = wurzel.locator('button:visible')
const n = await knoepfe.count()
console.log(`sichtbare Knoepfe: ${n}\n`)

for (let i = 0; i < n; i += 1) {
  const k = knoepfe.nth(i)
  let name = ''
  try {
    name = ((await k.innerText()) || (await k.getAttribute('aria-label')) || '')
      .replace(/\s+/g, ' ').trim().slice(0, 46)
  } catch { continue }
  if (!name) name = '(ohne Text)'

  const vorherDom = (await wurzel.innerText()).length
  const vorherUrl = seite.url()
  netz.length = 0

  // `[cmd]` **Am 2026-08-31 hat dieser Durchgang auf `dev`
  // geschrieben:** „Speichern" an einem Rezept loeste einen POST aus
  // und schrieb `recipe_ingredients` neu (Werte gleich, `updated_at`
  // neu). **Der Auftrag sagt: nichts auf dev.**
  //
  // `[read]` **Ein Messwerkzeug darf nicht schreiben.** Knoepfe, die
  // nachweislich senden, werden benannt statt gedrueckt - ihre
  // Wirkung ist aus dem Code und aus G-289/G-298 belegt.
  const SCHREIBT = /^(Speichern|Übernehmen|Bestätigen|Generieren|Hinzufügen|Aktivieren|Wirklich)$/
  let geklickt = true
  if (SCHREIBT.test(name.trim())) {
    console.log(`  ${String(i).padStart(2)}  ${name.padEnd(46)} SCHREIBT - nicht gedrueckt`)
    continue
  }
  try {
    await k.click({ timeout: 2500 })
    await seite.waitForTimeout(900)
  } catch {
    geklickt = false
  }

  const nachherDom = (await wurzel.innerText()).length
  const nachherUrl = seite.url()
  const modal = await seite.locator('.v2-modal:visible').count()
  const delta = nachherDom - vorherDom

  const wirkung = []
  if (!geklickt) wirkung.push('NICHT KLICKBAR')
  if (netz.length) wirkung.push(`schreibt: ${netz.join(', ')}`)
  if (modal > 0) wirkung.push('Dialog offen')
  if (nachherUrl !== vorherUrl) wirkung.push(`Adresse -> ${nachherUrl.split('?')[1] ?? ''}`)
  if (delta !== 0) wirkung.push(`DOM ${delta > 0 ? '+' : ''}${delta}`)
  if (wirkung.length === 0) wirkung.push('*** NICHTS ***')

  console.log(`  ${String(i).padStart(2)}  ${name.padEnd(46)} ${wirkung.join(' | ')}`)

  // Dialoge wieder schliessen, sonst verdecken sie die naechsten.
  if (modal > 0) {
    const zu = seite.locator('.v2-modal button[aria-label="Schliessen"]')
    if (await zu.count() > 0) await zu.first().click().catch(() => {})
    else await seite.keyboard.press('Escape').catch(() => {})
    await seite.waitForTimeout(400)
  }
  // Nach einem Adresswechsel zurueck auf den Reiter.
  if (nachherUrl !== vorherUrl) {
    await seite.goto(`${BASIS}/v2/nutrition?tab=${REITER}`, { waitUntil: 'networkidle' })
    await seite.waitForTimeout(900)
  }
}

await browser.close()
