// G-473 — mit anderen Grenzen: wird aus dem stillen Tod eine Meldung?
// [read] `--js-flags=--stack-size` zeigt Stapelueberlaeufe frueher,
// `--max-old-space-size` schliesst Speichermangel aus, und
// `--single-process` bringt den Fehler in den Hauptprozess.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3251'
const ZIEL = '/' + (process.argv[2] ?? 'v2').replace(/^\/+/, '')

function mitFrist(p, ms, beiFrist) {
  return Promise.race([p.catch(e => ({ fehler: String(e).slice(0, 200) })),
    new Promise(r => setTimeout(() => r(beiFrist), ms))])
}

async function probe(name, args) {
  const b = await chromium.launch({ headless: true, args })
  const k = await b.newContext()
  const s = await k.newPage()
  let abgestuerzt = false
  const meldungen = []
  s.on('crash', () => { abgestuerzt = true })
  s.on('pageerror', e => meldungen.push('pageerror: ' + String(e).slice(0, 250)))
  s.on('console', m => { if (m.type()==='error') meldungen.push('console: ' + m.text().slice(0,250)) })
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
           status: r.status ?? null, meldungen: meldungen.slice(0, 4) }
}

const aus = []
aus.push(await probe('kleiner Stapel (500k)', ['--js-flags=--stack-size=500']))
aus.push(await probe('grosser Stapel (30M)', ['--js-flags=--stack-size=30000']))
aus.push(await probe('viel Speicher', ['--js-flags=--max-old-space-size=4096']))
console.log(JSON.stringify(aus, null, 2))
