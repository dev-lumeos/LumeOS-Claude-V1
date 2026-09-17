// G-473 — liegt es an der ANZAHL der Navigationen im Reiter?
// [cmd] Nach /login + / stirbt auch /dashboard — eine Route, die
// vorher im selben Reiter lebte. Also nicht /v2, sondern die
// Wiederholung.
import { chromium } from '@playwright/test'
const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3251'
// [cmd] OHNE fuehrenden Schraegstrich uebergeben — Git Bash macht
// aus `/login` sonst `C:/Program Files/Git/login`. Hier wird er
// ergaenzt, damit beide Schreibweisen gehen.
const FOLGE = (process.argv[2] ?? 'dashboard,dashboard,dashboard,dashboard,dashboard')
  .split(',').map(z => '/' + z.trim().replace(/^\/+/, ''))
function mitFrist(p, ms, beiFrist) {
  return Promise.race([p.catch(e => ({ fehler: String(e).slice(0,120) })),
    new Promise(r => setTimeout(() => r(beiFrist), ms))])
}
const b = await chromium.launch({ headless: true })
const k = await b.newContext()
const s = await k.newPage()
let tot = false
s.on('crash', () => { tot = true })
const aus = []
for (let i = 0; i < FOLGE.length; i++) {
  if (tot) { aus.push({ nr: i+1, ziel: FOLGE[i], uebersprungen: true }); continue }
  const r = await mitFrist(
    s.goto(`${BASIS}${FOLGE[i]}`, { waitUntil: 'domcontentloaded', timeout: 15000 })
      .then(x => ({ status: x?.status() ?? null })), 18000, { frist: true })
  await new Promise(r2 => setTimeout(r2, 700))
  aus.push({ nr: i+1, ziel: FOLGE[i], status: r.status ?? null, abgestuerzt: tot || !!r.frist })
}
console.log(JSON.stringify({ folge: aus }, null, 2))
await b.close().catch(() => {})
