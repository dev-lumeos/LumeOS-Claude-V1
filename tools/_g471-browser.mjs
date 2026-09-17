// G-471 — stuerzt es in JEDEM Browser, oder nur im kopflosen Chromium?
// [read] Ein Absturz ohne Ausnahme, ohne Konsolenzeile und bei 10 MB
// Speicher ist verdaechtig NAH am Messwerkzeug. Das muss geklaert
// sein, bevor jemand Anwendungscode aendert.
import { chromium, firefox } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3251'
const ZIEL = '/' + (process.argv[2] ?? 'v2/settings').replace(/^\/+/, '')

function mitFrist(p, ms, beiFrist) {
  return Promise.race([p.catch(e => ({ fehler: String(e).slice(0, 140) })),
    new Promise(r => setTimeout(() => r(beiFrist), ms))])
}

async function probe(name, starter, optionen) {
  let b
  try { b = await starter.launch(optionen) } catch (e) {
    return { browser: name, nichtVerfuegbar: String(e).slice(0, 80) }
  }
  const k = await b.newContext()
  const s = await k.newPage()
  let abgestuerzt = false
  s.on('crash', () => { abgestuerzt = true })
  await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
  await s.fill('input[type=email]', 'dev@lumeos.app')
  await s.fill('input[type=password]', wortFuer('dev@lumeos.app'))
  await s.click('button[type=submit]')
  await s.waitForTimeout(5000)
  const r = await mitFrist(
    s.goto(`${BASIS}${ZIEL}`, { waitUntil: 'domcontentloaded', timeout: 20000 })
      .then(x => ({ status: x?.status() ?? null })), 24000, { frist: true })
  await b.close().catch(() => {})
  return { browser: name, abgestuerzt: abgestuerzt || !!r.frist, status: r.status ?? null }
}

const aus = []
aus.push(await probe('chromium headless', chromium, { headless: true }))
aus.push(await probe('chromium MIT Kopf', chromium, { headless: false }))
aus.push(await probe('firefox headless', firefox, { headless: true }))
console.log(JSON.stringify({ basis: BASIS, ziel: ZIEL, faelle: aus }, null, 2))
