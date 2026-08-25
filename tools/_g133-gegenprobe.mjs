// G-133, Gegenprobe: Wird die Pruefung rot, wenn ein falscher
// Tag-Code eingebaut ist?
//
// `[read]` Der Auftrag: „Eine Pruefung, die mit einem eingebauten
// Fehler nicht rot wird, misst nichts."
//
// **Zwei verschiedene Fehler, weil sie verschieden auffallen:**
//   1. Tippfehler im Code (`contains_laktose`) — die Datenbank kennt
//      ihn nicht, `total` bleibt bei 7.140. **Der Filter tut nichts.**
//   2. Falscher Code statt des richtigen (`vegan` statt
//      `contains_lactose`) — er schliesst etwas aus, aber das Falsche.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3200'
const browser = await chromium.launch()
const seite = await (await browser.newContext()).newPage()
await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle', timeout: 60_000 })
if (await seite.locator('input[type=email]').count()) {
  await seite.fill('input[type=email]', 'test-user@lumeos.local')
  await seite.fill('input[type=password]', wortFuer('test-user@lumeos.local'))
  await Promise.all([
    seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 60_000 }),
    seite.click('button[type=submit]'),
  ])
}
await seite.goto(`${BASIS}/v2/nutrition`, { waitUntil: 'networkidle', timeout: 60_000 })

const hole = (ohne) => seite.evaluate(async o => {
  const p = new URLSearchParams({ q: '', limit: '1', offset: '0', sort: 'relevance' })
  if (o) p.set('ohne', o)
  const r = await fetch(`/api/nutrition/foods?${p}`)
  return (await r.json())?.total ?? null
}, ohne)

// Die Pruefung, wie sie im Nachweis steht: „ohne Laktose muss 6119 sein".
const SOLL = 6119
const faelle = [
  ['richtig      contains_lactose', 'contains_lactose'],
  ['Tippfehler   contains_laktose', 'contains_laktose'],
  ['falscher Tag vegan', 'vegan'],
]
console.log('Die Pruefung lautet: „ohne Laktose -> total = 6119".')
console.log()
for (const [name, code] of faelle) {
  const total = await hole(code)
  const gruen = total === SOLL
  console.log(`  ${name.padEnd(32)} total ${String(total).padStart(5)}  `
    + `-> Pruefung ${gruen ? 'GRUEN' : 'ROT'}`)
}
console.log()
console.log('Erwartet: nur der erste Fall gruen. Sonst misst die Pruefung nichts.')
await browser.close()
