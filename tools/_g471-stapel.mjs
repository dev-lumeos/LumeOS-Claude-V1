// G-471/A1 — die Ausnahme mit Stapel, ohne dass die Messung mitstirbt.
//
// [cmd] Der Absturz tritt NUR im Reiter auf, der sich gerade
// angemeldet hat (Fall A/C), nicht in einem frischen (Fall B) —
// gemessen 2026-09-17. `page.goto()` kehrt dabei nicht zurueck.
//
// [read] Deshalb: die Navigation wird IM Reiter angestossen und nicht
// abgewartet. Alles, was der Reiter noch sagt, kommt ueber das
// DevTools-Protokoll — und jeder Aufruf dorthin hat eine Frist.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3251'
const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'
const ZIEL = '/' + (process.argv[2] ?? 'v2/settings').replace(/^\/+/, '')

function mitFrist(p, ms, beiFrist) {
  return Promise.race([
    p.catch(e => ({ fehler: String(e).slice(0, 160) })),
    new Promise(r => setTimeout(() => r(beiFrist), ms)),
  ])
}

const b = await chromium.launch({ headless: true })
const k = await b.newContext()
const s = await k.newPage()

const ausnahmen = []
const konsole = []
const speicher = []
let abgestuerzt = false

s.on('crash', () => { abgestuerzt = true })
s.on('pageerror', e => ausnahmen.push({ quelle: 'pageerror', text: String(e).slice(0, 500) }))
s.on('console', m => {
  if (m.type() === 'error') konsole.push(m.text().slice(0, 300))
})

const cdp = await k.newCDPSession(s)
await cdp.send('Runtime.enable')
await cdp.send('Log.enable')
cdp.on('Runtime.exceptionThrown', (e) => {
  const d = e.exceptionDetails
  ausnahmen.push({
    quelle: 'Runtime',
    text: (d.exception?.description ?? d.text ?? '').slice(0, 700),
    stapel: (d.stackTrace?.callFrames ?? []).slice(0, 10).map(f =>
      `${f.functionName || '(anonym)'} @ ${f.url.replace(BASIS, '')}:${f.lineNumber}:${f.columnNumber}`),
  })
})
cdp.on('Log.entryAdded', (e) => {
  if (e.entry.level === 'error') konsole.push(`[log] ${e.entry.text.slice(0, 300)}`)
})

// ── Anmelden ─────────────────────────────────────────────────────
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await s.fill('input[type=email]', KONTO)
await s.fill('input[type=password]', wortFuer(KONTO))
await s.click('button[type=submit]')
await s.waitForTimeout(5000)

// ── Navigation anstossen, NICHT abwarten ─────────────────────────
// [read] Feiner abtasten: der Reiter stirbt zwischen zwei 700-ms-
// Proben, ohne eine Ausnahme zu hinterlassen. Mit 60 ms sieht man,
// OB der Speicher vorher steigt.
cdp.send('Page.navigate', { url: `${BASIS}${ZIEL}` }).catch(() => {})

for (let i = 0; i < 150 && !abgestuerzt; i++) {
  await new Promise(r => setTimeout(r, 60))
  const m = await mitFrist(
    cdp.send('Runtime.evaluate', {
      expression: 'performance.memory ? Math.round(performance.memory.usedJSHeapSize/1048576) : -1',
      returnByValue: true,
    }).then(x => ({ mb: x.result?.value })),
    1500, { frist: true })
  if (typeof m.mb === 'number') speicher.push(m.mb)
  else if (m.frist || m.fehler) { speicher.push(null); break }
}

console.log(JSON.stringify({
  basis: BASIS, ziel: ZIEL, abgestuerzt,
  // [read] Steigt der Speicher bis zum Abbruch, ist es eine
  // Endlosschleife; bleibt er flach, ist es etwas anderes.
  speicherMB: speicher,
  ausnahmen: ausnahmen.slice(0, 6),
  konsole: konsole.slice(0, 10),
}, null, 2))
await b.close().catch(() => {})
