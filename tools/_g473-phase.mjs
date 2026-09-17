// G-473 — in WELCHER Phase stirbt der Reiter?
//
// [read] Wenn kein Fehlerfaenger mehr zum Zug kommt, ist die Frage
// nicht „welche Ausnahme", sondern „wie weit kam der Anstrich".
//
// [cmd] Gemessen ueber die Lebenszeichen des DevTools-Protokolls:
// `Page.frameStartedLoading`, `Page.domContentEventFired`,
// `Page.loadEventFired`, dazu `Network.responseReceived` je Buendel.
// Die LETZTE Nachricht vor dem Tod sagt, wo es passiert.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3251'
const ZIEL = '/' + (process.argv[2] ?? 'v2').replace(/^\/+/, '')
const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'

const b = await chromium.launch({ headless: true })
const k = await b.newContext()
const s = await k.newPage()

const spur = []
const t0 = () => Date.now() - start
let start = Date.now()
let abgestuerzt = false
s.on('crash', () => { abgestuerzt = true; spur.push([t0(), 'PAGE CRASH']) })

const cdp = await k.newCDPSession(s)
await cdp.send('Page.enable')
await cdp.send('Network.enable')
await cdp.send('Runtime.enable')

cdp.on('Page.frameStartedLoading', () => spur.push([t0(), 'frameStartedLoading']))
cdp.on('Page.domContentEventFired', () => spur.push([t0(), 'domContentEventFired']))
cdp.on('Page.loadEventFired', () => spur.push([t0(), 'loadEventFired']))
cdp.on('Page.frameStoppedLoading', () => spur.push([t0(), 'frameStoppedLoading']))
cdp.on('Runtime.consoleAPICalled', (e) =>
  spur.push([t0(), 'console.' + e.type + ': '
    + (e.args?.[0]?.value ?? '').toString().slice(0, 90)]))
cdp.on('Runtime.exceptionThrown', (e) =>
  spur.push([t0(), 'EXCEPTION: '
    + (e.exceptionDetails?.exception?.description ?? '').slice(0, 200)]))
cdp.on('Network.responseReceived', (e) => {
  const u = e.response.url.replace(BASIS, '')
  // Nur unsere Buendel, nicht jedes Bild.
  if (/\.js(\?|$)/.test(u)) spur.push([t0(), 'js: ' + u.slice(-60)])
})

// [cmd] G-473: der minimale Fall — ZWEIMAL dieselbe Route. Der
// zweite Aufruf toetet den Reiter (Produktionsbau), der Dev-Server
// besteht fuenf. Keine Anmeldung noetig, kein /v2.
await s.goto(`${BASIS}${ZIEL}`, { waitUntil: 'domcontentloaded' })
await s.waitForTimeout(1200)

// Ab hier zaehlt die Zeit.
spur.length = 0
start = Date.now()
cdp.send('Page.navigate', { url: `${BASIS}${ZIEL}` }).catch(
  e => spur.push([t0(), 'navigate-fehler: ' + String(e).slice(0, 80)]))

for (let i = 0; i < 40 && !abgestuerzt; i++) {
  await new Promise(r => setTimeout(r, 100))
}
await new Promise(r => setTimeout(r, 500))

console.log(JSON.stringify({
  basis: BASIS, ziel: ZIEL, abgestuerzt,
  spur: spur.map(([ms, was]) => `${String(ms).padStart(5)} ms  ${was}`),
}, null, 2))
await b.close().catch(() => {})
