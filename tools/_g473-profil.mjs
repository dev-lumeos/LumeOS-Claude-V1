// G-473 — WAS laeuft in den stillen 822 ms vor dem Tod?
//
// [read] Alle Verdachtsproben sind fehlgeschlagen. Statt weiter zu
// raten: den Reiter beim Arbeiten filmen. Ein CPU-Profil nennt die
// laufenden Funktionen MIT NAMEN — und mit Quellkarten im Bau sind
// das die Namen aus dem Quelltext.
//
// [cmd] Das Profil wird waehrend der Navigation gestartet und kurz
// vor dem erwarteten Tod geholt. Stirbt der Reiter vorher, ist es
// verloren — deshalb wird in kurzen Abstaenden geerntet.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3251'
const ZIEL = '/' + (process.argv[2] ?? 'v2/dashboard').replace(/^\/+/, '')
const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'

function mitFrist(p, ms, beiFrist) {
  return Promise.race([
    p.catch(e => ({ fehler: String(e).slice(0, 200) })),
    new Promise(r => setTimeout(() => r(beiFrist), ms)),
  ])
}

const b = await chromium.launch({ headless: true })
const k = await b.newContext()
const s = await k.newPage()
let abgestuerzt = false
s.on('crash', () => { abgestuerzt = true })

const cdp = await k.newCDPSession(s)
await cdp.send('Profiler.enable')
await cdp.send('Runtime.enable')

await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await s.fill('input[type=email]', KONTO)
await s.fill('input[type=password]', wortFuer(KONTO))
await s.click('button[type=submit]')
await s.waitForTimeout(5000)

// [read] Feine Abtastung — der Tod kommt nach ~1,4 s.
await cdp.send('Profiler.setSamplingInterval', { interval: 100 })
await cdp.send('Profiler.start')

cdp.send('Page.navigate', { url: `${BASIS}${ZIEL}` }).catch(() => {})

// In Schritten ernten, damit wenigstens ein Profil ankommt.
let profil = null
for (let i = 0; i < 14 && !abgestuerzt; i++) {
  await new Promise(r => setTimeout(r, 100))
  if (i >= 8) {
    const p = await mitFrist(
      cdp.send('Profiler.stop').then(x => ({ p: x.profile })), 1200, { frist: true })
    if (p.p) { profil = p.p; break }
  }
}

let oben = []
if (profil && profil.nodes) {
  // Selbstzeit je Funktion: wie oft wurde sie beim Abtasten gesehen?
  const zaehler = new Map()
  const nachId = new Map(profil.nodes.map(n => [n.id, n]))
  for (const id of profil.samples ?? []) {
    const n = nachId.get(id)
    if (!n) continue
    const f = n.callFrame
    const schl = `${f.functionName || '(anonym)'} @ ${(f.url || '').replace(BASIS, '').slice(-58)}:${f.lineNumber}`
    zaehler.set(schl, (zaehler.get(schl) ?? 0) + 1)
  }
  oben = [...zaehler.entries()].sort((a, b) => b[1] - a[1]).slice(0, 18)
    .map(([k, v]) => `${String(v).padStart(6)}  ${k}`)
}

console.log(JSON.stringify({
  basis: BASIS, ziel: ZIEL, abgestuerzt,
  proben: profil?.samples?.length ?? 0,
  knoten: profil?.nodes?.length ?? 0,
  heisseste: oben,
}, null, 2))
await b.close().catch(() => {})
