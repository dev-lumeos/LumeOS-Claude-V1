// G-474 — stirbt der Reiter auch ohne GPU / in einem Prozess?
//
// Aufruf:  node tools/_g474-anstrich.mjs
//
// ══ STARTET DEN PRODUKTIONSBAU SELBST ═══════════════════════════════
//
// [cmd] Tom konnte `_g473-befund.mjs` nicht nachpruefen: der Bau auf
// 3251 lief nicht mehr, und alle Laeufe meldeten `?`. [read] Ein
// Werkzeug, das eine Vorbedingung braucht und nicht sagt, dass sie
// fehlt, ist eine Falle. Dieses hier startet den Server selbst,
// wartet auf ihn und beendet ihn am Ende.
//
// [cmd] Es fasst `.next` NICHT an — `next start` liest nur, und
// `LUMEOS_DIST_DIR=.next-gate` zeigt auf das Gate-Verzeichnis (B-18).
// Der Dev-Server auf 3200 laeuft unberuehrt weiter.
import { chromium } from '@playwright/test'
import { spawn } from 'node:child_process'
import net from 'node:net'
import fs from 'node:fs'
import path from 'node:path'

const PORT = Number(process.env.LUMEOS_PORT ?? 3251)
const BASIS = `http://127.0.0.1:${PORT}`
const ROUTE = '/' + (process.argv[2] ?? 'dashboard').replace(/^\/+/, '')
const WEB = path.join(process.cwd(), 'apps', 'web')

function mitFrist(p, ms, beiFrist) {
  return Promise.race([
    p.catch(e => ({ fehler: String(e).slice(0, 140) })),
    new Promise(r => setTimeout(() => r(beiFrist), ms)),
  ])
}

/** Hoert schon jemand auf dem Port? */
function portBelegt(port) {
  return new Promise(r => {
    const s = net.createConnection({ port, host: '127.0.0.1' })
    s.on('connect', () => { s.destroy(); r(true) })
    s.on('error', () => r(false))
    setTimeout(() => { s.destroy(); r(false) }, 1500)
  })
}

async function warteAufServer(ms = 45000) {
  const bis = Date.now() + ms
  while (Date.now() < bis) {
    if (await portBelegt(PORT)) return true
    await new Promise(r => setTimeout(r, 500))
  }
  return false
}

// ── Den Produktionsbau starten, wenn er nicht laeuft ─────────────
let eigenerServer = null
let schonGelaufen = await portBelegt(PORT)
if (!schonGelaufen) {
  if (!fs.existsSync(path.join(WEB, '.next-gate', 'BUILD_ID'))) {
    console.log(JSON.stringify({
      fehler: 'Kein Bau in apps/web/.next-gate. Erst bauen: '
        + 'pnpm --filter @lumeos/web build',
    }, null, 2))
    process.exit(1)
  }
  eigenerServer = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    cwd: WEB, shell: true, stdio: 'ignore',
    env: { ...process.env, LUMEOS_DIST_DIR: '.next-gate' },
  })
  if (!await warteAufServer()) {
    console.log(JSON.stringify({ fehler: `Server auf ${PORT} kam nicht hoch.` }, null, 2))
    eigenerServer.kill()
    process.exit(1)
  }
}

/**
 * Zweimal dieselbe Route — der minimale Fall aus G-473.
 *
 * [read] JE FALL ein eigener Browser: die Startschalter gelten je
 * Browser, nicht je Reiter.
 */
async function probe(name, args) {
  let b
  try {
    b = await chromium.launch({ headless: true, args })
  } catch (e) {
    return { fall: name, nichtStartbar: String(e).slice(0, 120) }
  }
  const k = await b.newContext()
  const s = await k.newPage()
  let tot = false
  const meldungen = []
  s.on('crash', () => { tot = true })
  s.on('pageerror', e => meldungen.push('pageerror: ' + String(e).slice(0, 200)))
  s.on('console', m => {
    if (m.type() === 'error') meldungen.push('console: ' + m.text().slice(0, 200))
  })
  const laeufe = []
  for (let i = 0; i < 2 && !tot; i++) {
    const r = await mitFrist(
      s.goto(`${BASIS}${ROUTE}`, { waitUntil: 'domcontentloaded', timeout: 20000 })
        .then(x => ({ status: x?.status() ?? null })),
      24000, { frist: true })
    await new Promise(x => setTimeout(x, 800))
    // [read] `?` heisst: kein Status. Das kann „lebt, aber ohne
    // Antwortobjekt" sein — deshalb wird NACHGESEHEN, statt zu raten.
    let lebt = null
    if (!tot && !r.frist) {
      const x = await mitFrist(
        s.evaluate(() => ({ p: location.pathname, n: document.body?.textContent.length ?? 0 }))
          .then(v => ({ v })), 6000, { frist: true })
      lebt = x.v ? `${x.v.p} ${x.v.n} Zeichen` : 'keine Antwort'
    }
    laeufe.push({
      stand: tot || r.frist ? 'TOT' : (r.status ?? '?'),
      fehler: r.fehler ?? null,
      lebt,
    })
  }
  await b.close().catch(() => {})
  return { fall: name, laeufe,
           zweiterStirbt: laeufe[1]?.stand === 'TOT',
           meldungen: meldungen.slice(0, 3) }
}

const aus = []
aus.push(await probe('unveraendert', []))
aus.push(await probe('--disable-gpu', ['--disable-gpu']))
aus.push(await probe('--single-process', ['--single-process']))
aus.push(await probe('--disable-gpu + --single-process',
  ['--disable-gpu', '--single-process']))
// [read] Die Software-Rasterung ist der dritte Weg: weder GPU noch
// der uebliche Pfad.
aus.push(await probe('--disable-software-rasterizer',
  ['--disable-gpu', '--disable-software-rasterizer']))

console.log(JSON.stringify({
  basis: BASIS, route: ROUTE,
  serverSelbstGestartet: !schonGelaufen,
  faelle: aus,
}, null, 2))

if (eigenerServer) {
  eigenerServer.kill()
  // Windows: der Kindprozess haengt an cmd, deshalb hart nachsetzen.
  spawn('taskkill', ['/F', '/T', '/PID', String(eigenerServer.pid)],
    { shell: true, stdio: 'ignore' })
}
