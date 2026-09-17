// G-471/A1 — die Ausnahme im Browser, mit Stapel.
//
// Aufruf:  node tools/_g471-absturz.mjs [route]
//
// [read] Ein abgestuerzter Reiter kann seinen eigenen Fehler nicht
// mehr melden — `page.on('pageerror')` kommt zu spaet. Deshalb wird
// das DevTools-Protokoll direkt abgehoert (`Runtime.exceptionThrown`,
// `Log.entryAdded`) UND der Speicher mitgeschrieben.
//
// [cmd] „Page crashed" ohne Konsolenmeldung heisst meist: der
// Speicher ist voll (Endlosschleife, unbegrenzt wachsendes Array)
// oder ein Anstrich ruft sich selbst auf.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3251'
const ROUTE = '/' + (process.argv[2] ?? 'v2/settings').replace(/^\/+/, '')
const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'

const b = await chromium.launch({ headless: true })
const k = await b.newContext()
const s = await k.newPage()

const ausnahmen = []
const logzeilen = []
const konsole = []
const speicher = []
let abgestuerzt = false

s.on('console', m => {
  if (m.type() === 'error' || m.type() === 'warning') {
    konsole.push(`${m.type()}: ${m.text().slice(0, 240)}`)
  }
})
s.on('pageerror', e => ausnahmen.push({ quelle: 'pageerror', text: String(e).slice(0, 400) }))
s.on('crash', () => { abgestuerzt = true })

// ── Das DevTools-Protokoll ───────────────────────────────────────
const cdp = await k.newCDPSession(s)
await cdp.send('Runtime.enable')
await cdp.send('Log.enable')
cdp.on('Runtime.exceptionThrown', (e) => {
  const d = e.exceptionDetails
  ausnahmen.push({
    quelle: 'Runtime.exceptionThrown',
    text: (d.exception?.description ?? d.text ?? '').slice(0, 600),
    stapel: (d.stackTrace?.callFrames ?? []).slice(0, 8).map(f =>
      `${f.functionName || '(anonym)'} @ ${f.url.replace(BASIS, '')}:${f.lineNumber}`),
  })
})
cdp.on('Log.entryAdded', (e) => {
  if (e.entry.level === 'error') {
    logzeilen.push(`${e.entry.source}: ${e.entry.text.slice(0, 240)}`)
  }
})

async function speicherLesen() {
  try {
    const m = await cdp.send('Runtime.evaluate', {
      expression: 'performance.memory ? performance.memory.usedJSHeapSize : 0',
      returnByValue: true,
    })
    return Math.round((m.result.value ?? 0) / 1048576)
  } catch { return null }
}

// ── Anmelden ─────────────────────────────────────────────────────
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await s.fill('input[type=email]', KONTO)
await s.fill('input[type=password]', wortFuer(KONTO))
await s.click('button[type=submit]')
await s.waitForTimeout(5000)
const angemeldet = (await k.cookies()).some(c => c.name.includes('auth-token'))

// ── Die verdaechtige Route ───────────────────────────────────────
let fehler = null
const t0 = Date.now()
// [cmd] `page.goto()` KEHRT NICHT ZURUECK, wenn der Reiter waehrend
// der Navigation stirbt — ein erster Versuch lief 600 s ins Leere,
// ohne eine einzige Zeile auszugeben.
//
// [read] Deshalb wird die Navigation NICHT abgewartet: im Reiter
// angestossen, und daneben im Sekundentakt nachgesehen, was
// passiert. So ueberlebt die Messung den Absturz.
s.evaluate((u) => { window.location.href = u }, `${BASIS}${ROUTE}`)
  .catch(() => {})
for (let i = 0; i < 15 && !abgestuerzt; i++) {
  await new Promise(r => setTimeout(r, 1000))
  const mb = await speicherLesen()
  if (mb !== null) speicher.push(mb)
}
if (abgestuerzt) fehler = 'Reiter abgestuerzt (crash-Ereignis)'

console.log(JSON.stringify({
  basis: BASIS, route: ROUTE, angemeldet,
  abgestuerzt,
  dauerMs: Date.now() - t0,
  speicherMB: speicher,
  ausnahmen: ausnahmen.slice(0, 5),
  logzeilen: logzeilen.slice(0, 6),
  konsole: konsole.slice(0, 8),
  fehler,
}, null, 2))
await b.close().catch(() => {})
