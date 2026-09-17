// G-471 — der Befund in EINER Messung, wiederholbar.
//
// Aufruf:  node tools/_g471-lage.mjs
//          LUMEOS_BASIS=http://127.0.0.1:3200 node tools/_g471-lage.mjs
//
// ══ WAS GEMESSEN WIRD ═══════════════════════════════════════════════
//
// [cmd] Drei Faelle, die den Befund einkreisen:
//
//   A  angemeldeter Reiter -> /v2      stirbt (Produktionsbau)
//   B  FRISCHER Reiter     -> /v2      lebt
//   C  angemeldeter Reiter -> /dashboard, /nutrition   leben
//
// [read] Also weder die Route allein noch die Anmeldung allein —
// erst BEIDES zusammen toetet den Reiter. Und nur im Bau: der
// Dev-Server besteht alle drei Faelle.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3251'
const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'

function mitFrist(p, ms, beiFrist) {
  return Promise.race([
    p.catch(e => ({ fehler: String(e).slice(0, 140) })),
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

async function gehe(s, ziel) {
  const t0 = Date.now()
  let abgestuerzt = false
  const auf = () => { abgestuerzt = true }
  s.on('crash', auf)
  const r = await mitFrist(
    s.goto(`${BASIS}${ziel}`, { waitUntil: 'domcontentloaded', timeout: 15000 })
      .then(x => ({ status: x?.status() ?? null })),
    18000, { frist: true })
  s.off('crash', auf)
  return { ziel, ms: Date.now() - t0, status: r.status ?? null,
           abgestuerzt: abgestuerzt || !!r.frist }
}

const b = await chromium.launch({ headless: true })
const aus = {}

// A — angemeldeter Reiter, dann /v2
{
  const k = await b.newContext()
  const s = await anmelden(k)
  aus.A_angemeldeterReiterV2 = await gehe(s, '/v2')
  await k.close().catch(() => {})
}
// B — frischer Reiter, dieselbe Route
{
  const k = await b.newContext()
  const anm = await anmelden(k)
  await anm.close()
  const s = await k.newPage()
  aus.B_frischerReiterV2 = await gehe(s, '/v2')
  await k.close().catch(() => {})
}
// C — angemeldeter Reiter, aber ALTE Routen
{
  const k = await b.newContext()
  const s = await anmelden(k)
  aus.C_angemeldetAlteRouten = []
  for (const z of ['/dashboard', '/nutrition', '/training']) {
    aus.C_angemeldetAlteRouten.push(await gehe(s, z))
  }
  await k.close().catch(() => {})
}

console.log(JSON.stringify({ basis: BASIS, ...aus }, null, 2))
await b.close().catch(() => {})
