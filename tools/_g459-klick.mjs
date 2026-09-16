// G-459 — A5: den Vorschlag anklicken und sehen, was die Kachel sagt.
//
// [read] Der Unterschied, den Tom nennt: „ich habe es notiert" gegen
// „LumeOS schuetzt mich davor". Gemessen wird der SATZ und seine
// Farbe, nicht der Klassenname.
//
// [cmd] SCHREIBT NICHT. Der Knopf wird nicht gedrueckt — die
// Klickprobe soll keine Zeile anlegen (Lehre: „Klickprobe schreibt
// mit").
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'
const BASIS = 'http://127.0.0.1:3200'
const FOTO = process.argv[2] && process.argv[2] !== '-' ? process.argv[2] : null

const b = await chromium.launch({ headless: true })
const k = await b.newContext({ viewport: { width: 1600, height: 1100 } })
const s = await k.newPage()
const fehler = []
s.on('pageerror', e => fehler.push('PAGEERROR: ' + e.message.slice(0, 200)))

await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO)
  await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([
    s.waitForURL(u => !u.pathname.includes('login')),
    s.click('button[type=submit]'),
  ])
}
await s.goto(`${BASIS}/v2/settings`, { waitUntil: 'networkidle' })
await s.waitForTimeout(2200)

const form = s.locator('.v2-allergie-form').first()
await form.scrollIntoViewIfNeeded({ timeout: 15000 }).catch(() => {})

async function satz() {
  return await s.evaluate(() => {
    const r = document.querySelector('.v2-allergie-reichweite')
    if (!r) return null
    const f = getComputedStyle(r).color
    return {
      text: r.textContent.trim(),
      farbe: f,
      geprueft: r.classList.contains('ist-geprueft'),
      feldwert: document.querySelector(
        '.v2-allergie-form input[aria-label="Stoff"]')?.value ?? null,
    }
  })
}

const feld = form.locator('input[aria-label="Stoff"]')
await feld.click()
await feld.fill('laktose')
await s.waitForSelector('.v2-allergie-vorschlag', { timeout: 6000 })
const vorher = await satz()

await s.locator('.v2-allergie-vorschlag').first().click()
await s.waitForTimeout(500)
const nachher = await satz()

// Und zurueck zum Freitext: tippen loest den gewaehlten Code wieder.
await feld.fill('eigenes wort')
await s.waitForTimeout(500)
const wiederFrei = await satz()

if (FOTO) {
  // Fuers Foto den geprueften Zustand zeigen.
  await feld.fill('laktose')
  await s.waitForSelector('.v2-allergie-vorschlag', { timeout: 6000 })
  await s.locator('.v2-allergie-vorschlag').first().click()
  await s.waitForTimeout(600)
  await s.screenshot({ path: FOTO })
}

console.log(JSON.stringify({ vorher, nachher, wiederFrei, fehler }, null, 2))
await b.close()
