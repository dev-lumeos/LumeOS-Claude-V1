// G-473 — stirbt er auch OHNE Messwerkzeug?
//
// [read] Kein Profil, keine Ausnahme, kein Log, kein Speicher-
// wachstum — alles Zeichen dafuer, dass der Renderer von aussen
// beendet wird. Ein Verdacht bleibt: das Messwerkzeug selbst.
//
// [cmd] Diese Probe benutzt KEIN CDP, keine addInitScript, keine
// Ereignishaken ausser `crash` — nur navigieren und nachsehen.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3251'
const ZIEL = '/' + (process.argv[2] ?? 'v2/dashboard').replace(/^\/+/, '')

const b = await chromium.launch({ headless: true })
const k = await b.newContext()
const s = await k.newPage()
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await s.fill('input[type=email]', 'dev@lumeos.app')
await s.fill('input[type=password]', wortFuer('dev@lumeos.app'))
await s.click('button[type=submit]')
await s.waitForTimeout(5000)

// Kein goto — im Reiter navigieren und danach nur POLLEN.
await s.evaluate((u) => { window.location.assign(u) }, `${BASIS}${ZIEL}`).catch(()=>{})
let lebt = null
const stand = []
for (let i = 0; i < 20; i++) {
  await new Promise(r => setTimeout(r, 500))
  try {
    const x = await s.evaluate(() => ({
      url: location.pathname,
      zeichen: document.body ? document.body.textContent.length : 0,
      bereit: document.readyState,
    }))
    stand.push(`${i*500} ms  ${x.url}  ${x.bereit}  ${x.zeichen} Zeichen`)
    lebt = true
  } catch (e) {
    stand.push(`${i*500} ms  TOT: ${String(e).slice(0, 80)}`)
    lebt = false
    break
  }
}
console.log(JSON.stringify({ basis: BASIS, ziel: ZIEL, lebt, stand }, null, 2))
await b.close().catch(() => {})
