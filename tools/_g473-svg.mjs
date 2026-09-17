// G-473 — liegt es am SVG-Zeichnen?
// [read] Ein entartetes <path> (NaN, Infinity, riesige Werte) kann
// den Rasterisierer von Chromium toeten: kein JS-Fehler, flacher
// Speicher. Gegenprobe: `setAttribute('d', ...)` abfangen und
// verdaechtige Werte melden statt zeichnen.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3251'
const ZIEL = '/' + (process.argv[2] ?? 'v2/dashboard').replace(/^\/+/, '')

function mitFrist(p, ms, beiFrist) {
  return Promise.race([p.catch(e => ({ fehler: String(e).slice(0,160) })),
    new Promise(r => setTimeout(() => r(beiFrist), ms))])
}

async function probe(name, initSkript) {
  const b = await chromium.launch({ headless: true })
  const k = await b.newContext()
  if (initSkript) await k.addInitScript(initSkript)
  const s = await k.newPage()
  let abgestuerzt = false
  const gemeldet = []
  s.on('crash', () => { abgestuerzt = true })
  s.on('console', m => { if (m.text().startsWith('G473')) gemeldet.push(m.text().slice(0,200)) })
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
           status: r.status ?? null, gemeldet: gemeldet.slice(0, 5) }
}

const aus = []
aus.push(await probe('unveraendert', null))
aus.push(await probe('SVG-Pfade neutralisiert', () => {
  const echt = Element.prototype.setAttribute
  Element.prototype.setAttribute = function (n, v) {
    if (n === 'd' && this.tagName && this.tagName.toLowerCase() === 'path') {
      if (/NaN|Infinity|e\+\d\d/.test(String(v))) {
        console.log('G473 verdaechtiger Pfad: ' + String(v).slice(0, 120))
      }
      return echt.call(this, n, 'M 0 0')
    }
    return echt.call(this, n, v)
  }
}))
aus.push(await probe('alle SVG entfernt', () => {
  const echt = document.createElementNS.bind(document)
  document.createElementNS = (ns, name) => {
    if (ns && String(ns).includes('svg')) return document.createElement('span')
    return echt(ns, name)
  }
}))
console.log(JSON.stringify(aus, null, 2))
