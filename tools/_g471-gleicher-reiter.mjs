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

async function fallA() {
  // Anmelden und im SELBEN Reiter weiter.
  const b = await chromium.launch({ headless: true })
  const k = await b.newContext()
  const s = await anmelden(k)
  let abgestuerzt = false
  s.on('crash', () => { abgestuerzt = true })
  const r = await mitFrist(
    s.goto(`${BASIS}${ZIEL}`, { waitUntil: 'domcontentloaded', timeout: 20000 })
      .then(x => ({ status: x?.status() ?? null })),
    25000, { frist: true })
  const erg = { abgestuerzt: abgestuerzt || !!r.frist, ...r }
  await b.close().catch(() => {})
  return erg
}

async function fallB() {
  // Anmelden, dann einen NEUEN Reiter oeffnen.
  const b = await chromium.launch({ headless: true })
  const k = await b.newContext()
  const anm = await anmelden(k)
  await anm.close()
  const s = await k.newPage()
  let abgestuerzt = false
  s.on('crash', () => { abgestuerzt = true })
  const r = await mitFrist(
    s.goto(`${BASIS}${ZIEL}`, { waitUntil: 'domcontentloaded', timeout: 20000 })
      .then(x => ({ status: x?.status() ?? null })),
    25000, { frist: true })
  const erg = { abgestuerzt: abgestuerzt || !!r.frist, ...r }
  await b.close().catch(() => {})
  return erg
}

async function fallC() {
  // Anmelden, im selben Reiter ERST auf eine leichte Seite, dann ans Ziel.
  const b = await chromium.launch({ headless: true })
  const k = await b.newContext()
  const s = await anmelden(k)
  let abgestuerzt = false
  s.on('crash', () => { abgestuerzt = true })
  await mitFrist(s.goto(`${BASIS}/`, { waitUntil: 'domcontentloaded', timeout: 20000 }),
    22000, { frist: true })
  const r = await mitFrist(
    s.goto(`${BASIS}${ZIEL}`, { waitUntil: 'domcontentloaded', timeout: 20000 })
      .then(x => ({ status: x?.status() ?? null })),
    25000, { frist: true })
  const erg = { abgestuerzt: abgestuerzt || !!r.frist, ...r }
  await b.close().catch(() => {})
  return erg
}

console.log(JSON.stringify({
  basis: BASIS, ziel: ZIEL,
  A_selberReiterNachAnmeldung: await fallA(),
  B_neuerReiter: await fallB(),
  C_selberReiterUeberUmweg: await fallC(),
}, null, 2))
