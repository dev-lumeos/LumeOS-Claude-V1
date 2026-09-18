// G-474 — liegt es am Stilblatt?
//
// [cmd] `/` ueberlebt zweimal, `/login` stirbt. Beide tragen dieselbe
// Huelle. Der Unterschied: `/login` laedt `@lumeos/ui/styles.css`.
//
// [read] Ein entartetes Stilblatt toetet beim Neuberechnen — kein
// JS-Fehler, flacher Speicher, genau diese Signatur. Gegenprobe:
// CSS-Dateien blockieren und nachsehen, ob der Reiter stehen bleibt.
import { chromium } from '@playwright/test'
const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3251'
const ROUTE = '/' + (process.argv[2] ?? 'login').replace(/^\/+/, '')

function mitFrist(p, ms, beiFrist) {
  return Promise.race([p.catch(e => ({ fehler: String(e).slice(0,140) })),
    new Promise(r => setTimeout(() => r(beiFrist), ms))])
}

async function probe(name, vorbereiten) {
  const b = await chromium.launch({ headless: true })
  const k = await b.newContext()
  if (vorbereiten) await vorbereiten(k)
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
aus.push(await probe('unveraendert', null))
aus.push(await probe('CSS blockiert', async (k) => {
  await k.route('**/*.css', r => r.abort())
}))
aus.push(await probe('nur ui/styles blockiert', async (k) => {
  await k.route('**/*.css', async (r) => {
    const u = r.request().url()
    // Die Datei des Stilpakets erkennt man am Inhalt, nicht am Namen —
    // deshalb holen und pruefen.
    const antwort = await r.fetch().catch(() => null)
    const text = antwort ? await antwort.text().catch(() => '') : ''
    if (text.includes('v2-card') || text.includes('lume-shell')) return r.abort()
    return r.fulfill({ response: antwort })
  })
}))
console.log(JSON.stringify({ route: ROUTE, faelle: aus }, null, 2))
