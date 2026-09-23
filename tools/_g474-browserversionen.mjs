// G-474 — stirbt auch ein NEUERER Browser?
//
// [cmd] Der Playwright-Chromium dieses Repos ist 121.0.6167.57
// (Anfang 2024). Ein Renderer-Absturz beim Neuladen mit
// zwischengespeichertem CSS ist genau die Art Fehler, die spaeter
// behoben wird. [read] Wenn Chrome/Edge von heute NICHT stirbt, ist
// es kein Fehler von LumeOS.
import { chromium } from '@playwright/test'
const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3251'
const ROUTE = '/' + (process.argv[2] ?? 'login').replace(/^\/+/, '')

function mitFrist(p, ms, beiFrist) {
  return Promise.race([p.catch(e => ({ fehler: String(e).slice(0,140) })),
    new Promise(r => setTimeout(() => r(beiFrist), ms))])
}

async function probe(name, optionen) {
  let b
  try { b = await chromium.launch({ headless: true, ...optionen }) }
  catch (e) { return { browser: name, nichtVerfuegbar: String(e).slice(0, 100) } }
  const version = b.version()
  const k = await b.newContext()
  const s = await k.newPage()
  let tot = false
  s.on('crash', () => { tot = true })
  const laeufe = []
  for (let i = 0; i < 3 && !tot; i++) {
    const r = await mitFrist(
      s.goto(`${BASIS}${ROUTE}`, { waitUntil: 'domcontentloaded', timeout: 20000 })
        .then(x => ({ status: x?.status() ?? null })), 24000, { frist: true })
    await new Promise(x => setTimeout(x, 900))
    laeufe.push(tot || r.frist ? 'TOT' : (r.status ?? '?'))
  }
  await b.close().catch(()=>{})
  return { browser: name, version, laeufe, stirbt: laeufe.includes('TOT') }
}

const aus = []
aus.push(await probe('Playwright-Chromium (Vorgabe)', {}))
aus.push(await probe('Google Chrome (System)', { channel: 'chrome' }))
aus.push(await probe('Microsoft Edge (System)', { channel: 'msedge' }))
console.log(JSON.stringify({ route: ROUTE, faelle: aus }, null, 2))
