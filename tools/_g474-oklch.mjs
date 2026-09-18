// G-474 — liegt es an oklch()/color-mix?
//
// [cmd] Das 2-kB-Stilblatt traegt 50 `oklch()`-Deklarationen (die
// Theme-Tokens). Die uebrigen Blaetter loesen `color-mix(in oklch,
// var(--x) …)` dagegen auf. Faellt EINES der vier weg, ueberlebt der
// Reiter — das passt zu einer Wechselwirkung, nicht zu einer Menge.
//
// [read] Gegenprobe: dieselbe Seite, aber `oklch` durch eine
// gewoehnliche Farbe ersetzt bzw. `color-mix` entfernt.
import { chromium } from '@playwright/test'
const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3251'
const ROUTE = '/' + (process.argv[2] ?? 'login').replace(/^\/+/, '')

function mitFrist(p, ms, beiFrist) {
  return Promise.race([p.catch(e => ({ fehler: String(e).slice(0,140) })),
    new Promise(r => setTimeout(() => r(beiFrist), ms))])
}

async function probe(name, ersetze) {
  const b = await chromium.launch({ headless: true })
  const k = await b.newContext()
  if (ersetze) {
    await k.route('**/*.css', async (r) => {
      const a = await r.fetch().catch(() => null)
      if (!a) return r.continue()
      let text = await a.text().catch(() => '')
      text = ersetze(text)
      return r.fulfill({ status: 200, contentType: 'text/css', body: text })
    })
  }
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
aus.push(await probe('unveraendert (durchgereicht)', t => t))
aus.push(await probe('ohne color-mix', t =>
  t.replace(/color-mix\([^()]*(\([^()]*\)[^()]*)*\)/g, '#888')))
aus.push(await probe('oklch -> rgb', t =>
  t.replace(/oklch\([^()]*\)/g, 'rgb(128,128,128)')))
aus.push(await probe('beides ersetzt', t =>
  t.replace(/color-mix\([^()]*(\([^()]*\)[^()]*)*\)/g, '#888')
   .replace(/oklch\([^()]*\)/g, 'rgb(128,128,128)')))
console.log(JSON.stringify({ route: ROUTE, faelle: aus }, null, 2))
