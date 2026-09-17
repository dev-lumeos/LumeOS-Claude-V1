// G-473 — der Unterschied liegt im EINTRITT, nicht in der Seite.
//
// [cmd] Gemessen: ein frischer Reiter oeffnet /v2 (-> /v2/dashboard)
// ohne Absturz; derselbe Reiter nach der Anmeldung stirbt.
//
// [read] Frage: liegt es daran, dass der Reiter VORHER /login
// gerendert hat? Dann ist es kein Sitzungs-, sondern ein
// Uebergangsproblem — React haengt eine neue Wurzel an einen Baum,
// der schon einen anderen Anstrich hatte.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3251'
const ZIEL = '/' + (process.argv[2] ?? 'v2/dashboard').replace(/^\/+/, '')

function mitFrist(p, ms, beiFrist) {
  return Promise.race([p.catch(e => ({ fehler: String(e).slice(0,160) })),
    new Promise(r => setTimeout(() => r(beiFrist), ms))])
}
async function geh(s, u) {
  let tot = false
  const auf = () => { tot = true }
  s.on('crash', auf)
  const r = await mitFrist(
    s.goto(`${BASIS}${u}`, { waitUntil: 'domcontentloaded', timeout: 15000 })
      .then(x => ({ status: x?.status() ?? null })), 18000, { frist: true })
  s.off('crash', auf)
  return { ziel: u, abgestuerzt: tot || !!r.frist, status: r.status ?? null }
}

const b = await chromium.launch({ headless: true })
const aus = []

// 1: Reiter war auf /login, ABER nicht angemeldet -> ans Ziel.
{
  const k = await b.newContext()
  const s = await k.newPage()
  await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
  aus.push({ fall: 'login besucht, NICHT angemeldet', ...await geh(s, ZIEL) })
  await k.close().catch(()=>{})
}
// 2: angemeldet in EINEM anderen Reiter, dieser war auf /login.
{
  const k = await b.newContext()
  const anm = await k.newPage()
  await anm.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
  await anm.fill('input[type=email]', 'dev@lumeos.app')
  await anm.fill('input[type=password]', wortFuer('dev@lumeos.app'))
  await anm.click('button[type=submit]')
  await anm.waitForTimeout(5000)
  await anm.close()
  const s = await k.newPage()
  await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
  aus.push({ fall: 'angemeldet, dieser Reiter erst auf /login', ...await geh(s, ZIEL) })
  await k.close().catch(()=>{})
}
// 3: angemeldet in diesem Reiter, aber ueber einen harten Neuladen.
{
  const k = await b.newContext()
  const s = await k.newPage()
  await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
  await s.fill('input[type=email]', 'dev@lumeos.app')
  await s.fill('input[type=password]', wortFuer('dev@lumeos.app'))
  await s.click('button[type=submit]')
  await s.waitForTimeout(5000)
  await mitFrist(s.reload({ waitUntil: 'domcontentloaded', timeout: 15000 }), 18000, {frist:true})
  aus.push({ fall: 'angemeldet + reload, dann ans Ziel', ...await geh(s, ZIEL) })
  await k.close().catch(()=>{})
}
console.log(JSON.stringify(aus, null, 2))
await b.close().catch(() => {})
