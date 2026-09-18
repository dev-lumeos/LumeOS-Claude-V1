// G-474 — WELCHE Stildatei toetet?
// [read] Die Seite laedt mehrere. Je eine blockieren und messen.
import { chromium } from '@playwright/test'
const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3251'
const ROUTE = '/' + (process.argv[2] ?? 'login').replace(/^\/+/, '')

function mitFrist(p, ms, beiFrist) {
  return Promise.race([p.catch(e => ({ fehler: String(e).slice(0,140) })),
    new Promise(r => setTimeout(() => r(beiFrist), ms))])
}

// 1) Welche CSS-Dateien laedt die Seite ueberhaupt?
const b0 = await chromium.launch({ headless: true })
const k0 = await b0.newContext()
const s0 = await k0.newPage()
const dateien = []
s0.on('response', r => {
  if (r.url().endsWith('.css')) dateien.push(r.url())
})
await s0.goto(`${BASIS}${ROUTE}`, { waitUntil: 'domcontentloaded' })
await new Promise(r => setTimeout(r, 1200))
await b0.close().catch(()=>{})

// 2) Je eine blockieren.
async function probe(name, blockiere) {
  const b = await chromium.launch({ headless: true })
  const k = await b.newContext()
  await k.route('**/*.css', r => blockiere(r.request().url()) ? r.abort() : r.continue())
  const s = await k.newPage()
  let tot = false
  s.on('crash', () => { tot = true })
  const laeufe = []
  for (let i = 0; i < 2 && !tot; i++) {
    const r = await mitFrist(
      s.goto(`${BASIS}${ROUTE}`, { waitUntil: 'domcontentloaded', timeout: 20000 })
        .then(x => ({ status: x?.status() ?? null })), 24000, { frist: true })
    await new Promise(x => setTimeout(x, 900))
    laeufe.push(tot || r.frist ? 'TOT' : (r.status ?? '?'))
  }
  await b.close().catch(()=>{})
  return { fall: name, laeufe, stirbt: laeufe[1] === 'TOT' }
}

const aus = []
for (const d of [...new Set(dateien)]) {
  aus.push(await probe('ohne ' + d.split('/').pop(), (u) => u === d))
}
console.log(JSON.stringify({ route: ROUTE, geladen: [...new Set(dateien)].map(d => d.split('/').pop()), faelle: aus }, null, 2))
