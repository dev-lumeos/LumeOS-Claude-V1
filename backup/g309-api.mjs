// G-309: den Leseweg direkt fragen — trennt API von Anzeige.
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'

const KONTO = 'test-user@lumeos.local'
const BASIS = 'http://127.0.0.1:3200'
const heute = process.argv[2] ?? new Date().toISOString().slice(0, 10)

const browser = await chromium.launch()
const seite = await browser.newPage()
await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await seite.fill('input[type="email"]', KONTO)
await seite.fill('input[type="password"]', wortFuer(KONTO))
await seite.click('button[type="submit"]')
await seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })

const antwort = await seite.evaluate(async d => {
  const r = await fetch(`/api/nutrition/plan?datum=${d}`)
  return { status: r.status, koerper: await r.text() }
}, heute)

console.log(`GET /api/nutrition/plan?datum=${heute} -> ${antwort.status}`)
try {
  const j = JSON.parse(antwort.koerper)
  const e = j.eintraege ?? []
  console.log(`Eintraege: ${e.length}`)
  for (const g of e) {
    console.log(`  ${g.meal_type.padEnd(10)} ${g.status.padEnd(9)} `
      + `${g.rezept ? `[${g.rezept}] ` : ''}${g.posten.length} Posten, ${g.kcal} kcal`)
    for (const p of g.posten) {
      console.log(`      ${p.name.slice(0, 44).padEnd(46)} ${p.amount_g} g  ${p.kcal} kcal`)
    }
  }
} catch {
  console.log(antwort.koerper.slice(0, 600))
}
await browser.close()
