// G-471 — haengt der Absturz am REITER oder an der ROUTE?
//
// [cmd] Gemessen: ein FRISCHER Reiter oeffnet /v2/settings ohne
// Absturz (11 von 11 Routen gruen). Derselbe Reiter, der sich gerade
// ANGEMELDET hat, stirbt auf derselben Route.
//
// [read] Also ist nicht die Route der Unterschied, sondern der
// Zustand des Reiters. Diese Probe haelt beide Faelle nebeneinander.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3251'
const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'
const ZIEL = '/' + (process.argv[2] ?? 'v2/settings').replace(/^\/+/, '')

function mitFrist(p, ms, beiFrist) {
  return Promise.race([
    p.catch(e => ({ fehler: String(e).slice(0, 200) })),
    new Promise(r => setTimeout(() => r(beiFrist), ms)),
  ])
}

async function anmelden(k) {
  const s = await k.newPage()
  await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
  await s.fill('input[type=email]', KONTO)
  await s.fill('input[type=password]', wortFuer(KONTO))
  await s.click('button[type=submit]')
  await s.waitForTimeout(5000)
  return s
}

// [read] Im SELBEN Reiter nach der Anmeldung: welche Ziele
// ueberleben, welche nicht? Das grenzt ein, WAS den Reiter toetet.
const ZIELE = (process.argv[2] ?? 'dashboard,nutrition,v2,v2/goals,v2/settings')
  .split(',').map(z => '/' + z.replace(/^\/+/, ''))

const b = await chromium.launch({ headless: true })
const k = await b.newContext()
const s = await anmelden(k)
let abgestuerzt = false
s.on('crash', () => { abgestuerzt = true })

const aus = []
for (const ziel of ZIELE) {
  if (abgestuerzt) { aus.push({ ziel, uebersprungen: true }); continue }
  const t0 = Date.now()
  const r = await mitFrist(
    s.goto(`${BASIS}${ziel}`, { waitUntil: 'domcontentloaded', timeout: 15000 })
      .then(x => ({ status: x?.status() ?? null })),
    18000, { frist: true })
  aus.push({
    ziel, ms: Date.now() - t0,
    status: r.status ?? null,
    abgestuerzt: abgestuerzt || !!r.frist,
  })
}
console.log(JSON.stringify({ basis: BASIS, reihenfolge: aus }, null, 2))
await b.close().catch(() => {})
