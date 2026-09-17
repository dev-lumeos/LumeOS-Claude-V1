// G-471 — WAS im v2-Anstrich toetet den Reiter?
//
// [read] Statt zu raten: Bausteine im Reiter abschalten und messen.
// `addInitScript` laeuft VOR dem Seitenskript, also lassen sich
// Browser-APIs vorher ersetzen.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3251'
const ZIEL = '/' + (process.argv[2] ?? 'v2').replace(/^\/+/, '')

function mitFrist(p, ms, beiFrist) {
  return Promise.race([p.catch(e => ({ fehler: String(e).slice(0, 140) })),
    new Promise(r => setTimeout(() => r(beiFrist), ms))])
}

async function probe(name, initSkript) {
  const b = await chromium.launch({ headless: true })
  const k = await b.newContext()
  if (initSkript) await k.addInitScript(initSkript)
  const s = await k.newPage()
  let abgestuerzt = false
  const fehler = []
  s.on('crash', () => { abgestuerzt = true })
  s.on('pageerror', e => fehler.push(String(e).slice(0, 160)))
  await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
  await s.fill('input[type=email]', 'dev@lumeos.app')
  await s.fill('input[type=password]', wortFuer('dev@lumeos.app'))
  await s.click('button[type=submit]')
  await s.waitForTimeout(5000)
  const r = await mitFrist(
    s.goto(`${BASIS}${ZIEL}`, { waitUntil: 'domcontentloaded', timeout: 15000 })
      .then(x => ({ status: x?.status() ?? null })), 18000, { frist: true })
  await b.close().catch(() => {})
  return { fall: name, abgestuerzt: abgestuerzt || !!r.frist,
           status: r.status ?? null, fehler: fehler.slice(0, 2) }
}

const aus = []
aus.push(await probe('unveraendert', null))
// Verdacht 1: ein ResizeObserver/IntersectionObserver in Schleife.
aus.push(await probe('ohne ResizeObserver', () => {
  window.ResizeObserver = class { observe(){} unobserve(){} disconnect(){} }
}))
// Verdacht 2: requestAnimationFrame-Schleife.
aus.push(await probe('rAF gedrosselt', () => {
  const echt = window.requestAnimationFrame
  let n = 0
  window.requestAnimationFrame = (cb) => {
    if (++n > 400) return 0
    return echt(cb)
  }
}))
// Verdacht 3: Canvas/WebGL (die Diagramme).
aus.push(await probe('ohne Canvas-Kontext', () => {
  HTMLCanvasElement.prototype.getContext = () => null
}))
console.log(JSON.stringify({ basis: BASIS, ziel: ZIEL, faelle: aus }, null, 2))
