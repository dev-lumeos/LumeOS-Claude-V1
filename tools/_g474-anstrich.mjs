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
//
// ══ G-476: WIE DIESES WERKZEUG TOMS DEV-SERVER GETOETET HAT ═════════
//
// [cmd] Hier stand am Ende:
//
//     taskkill /F /T /PID <pid der cmd-Huelle>
//
// [cmd] GEMESSEN 2026-09-18: die `cmd`-Huelle aus `shell: true` lebt
// rund fuenf Sekunden und stirbt DANN — der Server laeuft weiter:
//
//     1s..5s  huelleLebt=true   portOffen=true
//     6s      huelleLebt=FALSE  portOffen=true
//
// [read] Am Ende des Laufs war `kind.pid` also ein TOTER PID. Windows
// vergibt PIDs neu — und `/T` nimmt den ganzen Baum unter dieser
// Nummer mit. Getroffen hat es Toms Dev-Server auf 3200.
//
// [read] DESHALB: niemals eine gemerkte PID toeten, niemals `/T`.
// Beendet wird genau der Prozess, der auf MEINEM Port hoert — und
// nur, wenn ICH ihn gestartet habe.
import { chromium } from '@playwright/test'
import { spawn, execFileSync } from 'node:child_process'
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

/**
 * Wer hoert auf diesem Port? — G-476.
 *
 * `[read]` **Der Port ist die einzige verlaessliche Kennung.** Eine
 * gemerkte PID kann tot und neu vergeben sein; der Port sagt, wer
 * JETZT dort antwortet.
 *
 * `[cmd]` **Ueber `netstat`, nicht ueber PowerShell** —
 * `Get-NetTCPConnection` brauchte hier ueber 60 Sekunden.
 */
function pidAmPort(port) {
  try {
    const o = execFileSync('netstat', ['-ano'], { encoding: 'utf8', timeout: 20000 })
    const zeilen = o.split(String.fromCharCode(10))
    for (const z of zeilen) {
      if (z.indexOf(":" + port + " ") === -1) continue
      // Deutsch `ABHOEREN`, englisch `LISTENING`.
      if (!/ABH|LISTEN/i.test(z)) continue
      const t = z.trim().split(/\s+/)
      const pid = t[t.length - 1]
      if (/^[0-9]+$/.test(pid) && pid !== '0') return pid
    }
  } catch { /* nichts gefunden */ }
  return null
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

// ══ A4: DIESES WERKZEUG STARTET KEINEN SERVER ══════════════════════
//
// [read] **Die Regel lautet „nie start, neustart, aufraeumen"** —
// Tom besitzt die Server. [cmd] **Ein Werkzeug, das selbst startet,
// muss auch selbst beenden — und genau dabei ist 3200 gestorben.**
//
// [read] **Deshalb ist Starten jetzt die AUSNAHME**, nicht die
// Vorgabe: ohne `LUMEOS_START=1` sagt das Werkzeug nur, dass der
// Server fehlt, und hoert auf. **Kein `?`, kein stiller Fehlschlag.**
const DARF_STARTEN = process.env.LUMEOS_START === "1"

if (!schonGelaufen && !DARF_STARTEN) {
  console.log(JSON.stringify({
    fehler: `Kein Produktionsbau auf Port ${PORT}.`,
    sowirdsgemacht: [
      `1. pnpm --filter @lumeos/web build`,
      `2. cd apps/web && LUMEOS_DIST_DIR=.next-gate npx next start -p ${PORT}`,
      `3. node tools/_g474-anstrich.mjs`,
    ],
    hinweis: "Mit LUMEOS_START=1 startet dieses Werkzeug den Bau "
      + "selbst und beendet NUR ihn (ueber den Port, ohne /T).",
  }, null, 2))
  process.exit(1)
}

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

// ══ A2: NUR DEN EIGENEN BAU BEENDEN ════════════════════════════════
//
// [read] Drei Sicherungen, jede einzeln noetig:
//   1  nur wenn dieses Werkzeug den Server gestartet hat
//   2  der Prozess wird ueber den PORT gesucht, nicht ueber eine
//      gemerkte PID (die kann tot und neu vergeben sein)
//   3  OHNE `/T` — kein Baum, genau ein Prozess
if (eigenerServer) {
  const pid = pidAmPort(PORT)
  if (pid) {
    try {
      execFileSync('taskkill', ['/F', '/PID', pid], { stdio: 'ignore' })
    } catch { /* schon weg — dann ist nichts zu tun */ }
  }
  // [read] Die Huelle nur ueber das Handle, nie ueber `taskkill`:
  // `kill()` trifft genau diesen Prozess, auch wenn er schon weg ist.
  eigenerServer.kill()
}
