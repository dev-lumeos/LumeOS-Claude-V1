// G-473 — welche VORSEITE toetet den Uebergang nach /v2?
// [cmd] Schon ein Besuch von /login OHNE Anmeldung reicht. Also ist
// die Sitzung unschuldig — es ist der Uebergang von Seite X nach /v2.
import { chromium } from '@playwright/test'
const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3251'
const ZIEL = '/' + (process.argv[2] ?? 'v2/dashboard').replace(/^\/+/, '')
const VOR = (process.argv[3] ?? '/login,/,/dashboard,/nutrition,(keine)').split(',')

function mitFrist(p, ms, beiFrist) {
  return Promise.race([p.catch(e => ({ fehler: String(e).slice(0,140) })),
    new Promise(r => setTimeout(() => r(beiFrist), ms))])
}
const b = await chromium.launch({ headless: true })
const aus = []
for (const vor of VOR) {
  const k = await b.newContext()
  const s = await k.newPage()
  let tot = false
  s.on('crash', () => { tot = true })
  if (vor !== '(keine)') {
    await mitFrist(s.goto(`${BASIS}${vor}`, { waitUntil: 'domcontentloaded', timeout: 15000 }),
      18000, { frist: true })
    await new Promise(r => setTimeout(r, 1200))
  }
  const r = await mitFrist(
    s.goto(`${BASIS}${ZIEL}`, { waitUntil: 'domcontentloaded', timeout: 15000 })
      .then(x => ({ status: x?.status() ?? null })), 18000, { frist: true })
  aus.push({ vorseite: vor, abgestuerzt: tot || !!r.frist, status: r.status ?? null })
  await k.close().catch(()=>{})
}
console.log(JSON.stringify(aus, null, 2))
await b.close().catch(() => {})
