// Warum hakt der Posten nicht ab? Route gegen Oberflaeche trennen.
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'

const KONTO = 'test-user@lumeos.local'
const BASIS = 'http://127.0.0.1:3200'
const browser = await chromium.launch()
const seite = await browser.newPage({ viewport: { width: 1500, height: 1300 } })
const netz = []
seite.on('response', r => {
  if (r.url().includes('/api/nutrition/rezept')) netz.push(`${r.status()} ${r.url()}`)
})

await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await seite.fill('input[type="email"]', KONTO)
await seite.fill('input[type="password"]', wortFuer(KONTO))
await seite.click('button[type="submit"]')
await seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })
await seite.goto(`${BASIS}/v2/nutrition?tab=rezepte`, { waitUntil: 'networkidle' })
await seite.waitForTimeout(1200)

// `[cmd]` `button[aria-pressed]` trifft AUCH die Segmentschalter
// (10 Treffer, der erste leer). Der Posten sitzt in der
// Einkaufslisten-Karte - dort suchen, nicht auf der Seite.
const karte = seite.locator('.v2-card').filter({ hasText: 'Portionen)' }).first()
const posten = karte.locator('button[aria-pressed]')
console.log(`Posten mit aria-pressed: ${await posten.count()}`)
if (await posten.count() === 0) {
  console.log('KEINE Posten sichtbar — Abbruch.')
  console.log((await seite.locator('body').innerText()).slice(0, 600))
  await browser.close(); process.exit(1)
}

console.log(`erster Posten: "${(await posten.first().innerText()).replace(/\n/g, ' ')}"`)
await posten.first().click()
await seite.waitForTimeout(2500)
console.log('Netzverkehr an /api/nutrition/rezept:')
netz.forEach(z => console.log(`  ${z}`))

// Die Antwort im Klartext.
const antwort = await seite.evaluate(async () => {
  const knopf = document.querySelector('button[aria-pressed]')
  const r = await fetch('/api/nutrition/rezept', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ art: 'posten_haken', id: 'nicht-existent', is_checked: true }),
  })
  return { status: r.status, koerper: await r.text(), hatKnopf: Boolean(knopf) }
})
console.log(`\nDirekter Aufruf mit falscher id: ${antwort.status}`)
console.log(`  ${antwort.koerper.slice(0, 200)}`)

await browser.close()
