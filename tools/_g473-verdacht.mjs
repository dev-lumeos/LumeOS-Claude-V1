// G-473 — welcher Baustein im Layout toetet den Reiter?
//
// [read] Die Spur zeigt: der Reiter stirbt WAEHREND `app/layout`
// laeuft, bevor die v2-Buendel ueberhaupt angefordert werden. Der
// einzige Unterschied zwischen dem sterbenden und dem lebenden
// Reiter ist die SITZUNG.
//
// [cmd] Also wird je Verdacht ein Baustein im Reiter lahmgelegt und
// gemessen, ob der Absturz ausbleibt.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3251'
const ZIEL = '/' + (process.argv[2] ?? 'v2').replace(/^\/+/, '')
const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'

function mitFrist(p, ms, beiFrist) {
  return Promise.race([
    p.catch(e => ({ fehler: String(e).slice(0, 160) })),
    new Promise(r => setTimeout(() => r(beiFrist), ms)),
  ])
}

async function probe(name, initSkript) {
  const b = await chromium.launch({ headless: true })
  const k = await b.newContext()
  if (initSkript) await k.addInitScript(initSkript)
  const s = await k.newPage()
  let abgestuerzt = false
  s.on('crash', () => { abgestuerzt = true })
  await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
  await s.fill('input[type=email]', KONTO)
  await s.fill('input[type=password]', wortFuer(KONTO))
  await s.click('button[type=submit]')
  await s.waitForTimeout(5000)
  const r = await mitFrist(
    s.goto(`${BASIS}${ZIEL}`, { waitUntil: 'domcontentloaded', timeout: 15000 })
      .then(x => ({ status: x?.status() ?? null })),
    18000, { frist: true })
  await b.close().catch(() => {})
  return { fall: name, abgestuerzt: abgestuerzt || !!r.frist,
           status: r.status ?? null }
}

const aus = []
aus.push(await probe('unveraendert', null))

// [read] Der Sitzungskeks ist gross (2.614 Zeichen) und wird beim
// Anstrich gelesen. Ohne ihn ist der Reiter wie ein frischer.
aus.push(await probe('ohne Sitzungskeks', () => {
  const echt = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie')
  Object.defineProperty(document, 'cookie', {
    get() { return '' },
    set(v) { return echt?.set?.call(document, v) },
  })
}))

// [read] `localStorage` traegt die Oberflaechen-Einstellungen, die
// das Layout beim ersten Effekt liest.
aus.push(await probe('leerer localStorage', () => {
  try { localStorage.clear() } catch { /* egal */ }
}))

// [read] Verdacht: `history` — Next schreibt beim Anstrich in die
// Verlaufsliste. Eine Schleife darin toetet ohne Ausnahme.
aus.push(await probe('history.replaceState gedrosselt', () => {
  const echt = history.replaceState.bind(history)
  let n = 0
  history.replaceState = (...a) => {
    if (++n > 50) return
    return echt(...a)
  }
  const echt2 = history.pushState.bind(history)
  let m = 0
  history.pushState = (...a) => {
    if (++m > 50) return
    return echt2(...a)
  }
}))

console.log(JSON.stringify({ basis: BASIS, ziel: ZIEL, faelle: aus }, null, 2))
