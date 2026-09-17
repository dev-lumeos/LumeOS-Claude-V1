// G-471 — liegt es an navigator.locks?
//
// [read] @supabase/ssr serialisiert Sitzungszugriffe ueber die
// LockManager-API. Mehrere Klienten im selben Reiter (app-shell,
// v2/shell, login-form) konkurrieren dann um dieselbe Sperre.
//
// [cmd] Gegenprobe: `navigator.locks` im Reiter abschalten. Faellt
// der Absturz weg, ist die Sperre die Ursache.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3251'
const ZIEL = '/' + (process.argv[2] ?? 'v2/settings').replace(/^\/+/, '')

function mitFrist(p, ms, beiFrist) {
  return Promise.race([p.catch(e => ({ fehler: String(e).slice(0, 140) })),
    new Promise(r => setTimeout(() => r(beiFrist), ms))])
}

async function probe(name, ohneLocks) {
  const b = await chromium.launch({ headless: true })
  const k = await b.newContext()
  if (ohneLocks) {
    // VOR jedem Skript der Seite ausfuehren.
    await k.addInitScript(() => {
      try { Object.defineProperty(navigator, 'locks', { get: () => undefined }) }
      catch { /* egal */ }
    })
  }
  const s = await k.newPage()
  let abgestuerzt = false
  s.on('crash', () => { abgestuerzt = true })
  await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
  await s.fill('input[type=email]', 'dev@lumeos.app')
  await s.fill('input[type=password]', wortFuer('dev@lumeos.app'))
  await s.click('button[type=submit]')
  await s.waitForTimeout(5000)
  const r = await mitFrist(
    s.goto(`${BASIS}${ZIEL}`, { waitUntil: 'domcontentloaded', timeout: 20000 })
      .then(x => ({ status: x?.status() ?? null })), 24000, { frist: true })
  await b.close().catch(() => {})
  return { fall: name, abgestuerzt: abgestuerzt || !!r.frist, status: r.status ?? null }
}

console.log(JSON.stringify({
  basis: BASIS, ziel: ZIEL,
  mitLocks: await probe('navigator.locks vorhanden', false),
  ohneLocks: await probe('navigator.locks abgeschaltet', true),
}, null, 2))
