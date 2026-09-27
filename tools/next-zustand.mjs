#!/usr/bin/env node
/**
 * G-518 — sagt in Klartext, ob ein `.next` vergiftet ist.
 *
 * `[cmd]` **Anlass (2026-09-08 und 2026-09-27, zweimal derselbe
 * Vorfall):** der Dev-Server lieferte HTML ohne JavaScript, 404 auf
 * `main-app.js` und `app-pages-internals.js`. **Beide Male hat ein
 * Neustart es weggemacht** — und beim zweiten Mal war es wieder da.
 *
 * `[read]` **Ein Neustart ist keine Behebung, weil der Dev-Server
 * sich beim naechsten Uebersetzen selbst repariert.** **Genau das
 * verdeckt die Ursache:** wer neu startet, sieht Gruen und misst
 * nie, warum es rot war.
 *
 * ## Die Ursache, gemessen
 *
 * `[cmd]` **`next build` OHNE `LUMEOS_DIST_DIR` schreibt nach
 * `.next`** — in dasselbe Verzeichnis, aus dem der Dev-Server
 * ausliefert. **Der Build raeumt es beim Start ab und schreibt es
 * neu**, waehrend der Dev-Server dieselben Dateien fortschreibt.
 *
 * `[cmd]` **B-18 hat genau das schon einmal behoben** — deshalb
 * gibt es `scripts/gate-build.js` und `.next-gate`. `[read]` **Die
 * Trennung ist dicht; umgangen wird sie, wenn jemand `next build`
 * direkt ruft statt `pnpm build`.**
 *
 * `[cmd]` **Am 2026-09-27 gemessen:** `apps/web/.next/BUILD_ID`
 * trug `9Gr-DMlsJLyVv6vA_Zhks`, `.next-gate/BUILD_ID` dagegen
 * `M191AWaoOQ5UC1-_xp4al` — **zwei verschiedene Builds, einer davon
 * im Verzeichnis des Dev-Servers.**
 *
 * ## Was dieses Werkzeug NICHT tut
 *
 * `[read]` **Es startet nichts, beendet nichts, loescht nichts.**
 * `[cmd]` **`.next` wird nicht angefasst** — auch dann nicht, wenn
 * der Befund sagt, dass es neu gebaut gehoert. **Das ist Toms
 * Entscheidung** (Projektregel).
 *
 * Aufruf:
 *   node tools/next-zustand.mjs            alle Anwendungen
 *   node tools/next-zustand.mjs web        nur eine
 *   node tools/next-zustand.mjs --json     fuer Werkzeuge
 *
 * Rueckgabe: 0 = sauber, 1 = vergiftet.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const args = process.argv.slice(2)
const alsJson = args.includes('--json')
const nurApp = args.find(a => !a.startsWith('--'))

const APPS = [
  { name: 'web', pfad: 'apps/web', port: 3200 },
  { name: 'coach', pfad: 'apps/coach', port: 3220 },
  { name: 'admin', pfad: 'apps/admin', port: 3210 },
].filter(a => !nurApp || a.name === nurApp)

/**
 * Artefakte, die NUR ein Produktionsbau erzeugt.
 *
 * `[cmd]` **Gemessen 2026-09-27:** ein `next dev` legt keine davon
 * an. `[read]` **Liegt eine in `.next`, war dort ein Build** — das
 * ist der Befund, nicht eine Vermutung darueber.
 */
const NUR_BUILD = [
  'BUILD_ID',
  'prerender-manifest.json',
  'routes-manifest.json',
  'export-marker.json',
  'required-server-files.json',
]

/** Die Buendel, die eine Dev-Seite anfordert. Ohne Namenshash. */
const DEV_BUENDEL = [
  'main-app.js', 'app-pages-internals.js', 'webpack.js', 'polyfills.js',
]

// `[cmd]` **ORTSZEIT, nicht UTC.** `toISOString()` verschob
// `10:36:39` auf `03:36:39` — und eine Uhrzeit, die nicht zu der im
// Dateimanager passt, laesst den Leser am Befund zweifeln statt an
// der Zeitzone.
const zeit = p => {
  try {
    const d = statSync(p).mtime
    const z = n => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())} `
      + `${z(d.getHours())}:${z(d.getMinutes())}:${z(d.getSeconds())}`
  } catch { return null }
}

function pruefe(app) {
  const next = join(app.pfad, '.next')
  const gate = join(app.pfad, '.next-gate')
  const b = {
    app: app.name, port: app.port, verzeichnis: next,
    vorhanden: existsSync(next),
    befunde: [],
  }
  if (!b.vorhanden) {
    // `[read]` **Kein `.next` ist kein Fehler** — der Dev-Server legt
    // es beim ersten Lauf an.
    b.zustand = 'kein .next'
    return b
  }

  // ── 1 · Liegt ein Produktionsbau im Dev-Verzeichnis? ────────────
  const bauartefakte = NUR_BUILD.filter(f => existsSync(join(next, f)))
  if (bauartefakte.length) {
    const bid = existsSync(join(next, 'BUILD_ID'))
      ? readFileSync(join(next, 'BUILD_ID'), 'utf8').trim() : null
    const gbid = existsSync(join(gate, 'BUILD_ID'))
      ? readFileSync(join(gate, 'BUILD_ID'), 'utf8').trim() : null
    b.befunde.push({
      art: 'BUILD_IN_DEV_VERZEICHNIS',
      satz: `Ein Produktionsbau hat nach ${next} geschrieben — in das `
        + 'Verzeichnis, aus dem der Dev-Server ausliefert.',
      artefakte: bauartefakte.map(f => `${f}  ${zeit(join(next, f))}`),
      build_id: bid,
      build_id_gate: gbid,
      ...(bid && gbid && bid !== gbid
        ? { hinweis: 'Verschiedene BUILD_ID — zwei getrennte Baulaeufe. '
            + 'Der Gate-Bau ging richtig nach .next-gate; dieser hier '
            + 'kam von einem direkten `next build`.' }
        : {}),
    })
  }

  // ── 2 · Fehlen die Dev-Buendel, die eine Seite anfordert? ───────
  //
  // `[cmd]` **FALSCHMELDUNG GEMESSEN (2026-09-27):** das Werkzeug
  // meldete `admin` als vergiftet, waehrend `curl` fuer dieselben
  // drei Buendel 200 lieferte. `[read]` **Der Dev-Server schreibt
  // sie beim Uebersetzen neu — fuer Sekundenbruchteile sind sie
  // weg.** **Ein einzelner Blick sieht einen Zwischenstand und
  // nennt ihn einen Befund.**
  //
  // `[read]` **Deshalb zweimal hinsehen, mit Abstand.** **Nur was
  // BEIDE Male fehlt, ist ein Befund** — was dazwischen
  // wiederkommt, war ein Uebersetzungslauf.
  const chunks = join(next, 'static', 'chunks')
  if (existsSync(chunks)) {
    const fehlendeJetzt = () => {
      const da = new Set(readdirSync(chunks))
      return DEV_BUENDEL.filter(f => !da.has(f))
    }
    let fehlend = fehlendeJetzt()
    if (fehlend.length) {
      // `[read]` **Kurz warten, ohne Zeitgeber** — das Werkzeug
      // laeuft synchron, und eine halbe Sekunde Blockade ist
      // billiger als eine Falschmeldung.
      const bis = Date.now() + 700
      while (Date.now() < bis) { /* warten */ }
      const zweiter = fehlendeJetzt()
      // Nur was BEIDE Male fehlte.
      fehlend = fehlend.filter(f => zweiter.includes(f))
    }
    if (fehlend.length) {
      b.befunde.push({
        art: 'DEV_BUENDEL_FEHLEN',
        satz: 'Die Buendel, die eine Dev-Seite anfordert, liegen nicht '
          + 'im Verzeichnis — zweimal nachgesehen, mit Abstand. Das HTML '
          + 'kommt, kein JavaScript laedt: kein Knopf wirkt, und jede '
          + 'Route sieht aus, als fehle sie.',
        fehlend,
      })
    }
  }

  // ── 3 · Zwei Generationen nebeneinander ─────────────────────────
  //
  // `[read]` **Gehashte Chunks stammen aus einem Bau, ungehashte aus
  // dem Dev-Server.** **Beide zusammen heisst: der Bau hat
  // hineingeschrieben und der Dev-Server hat danach weitergemacht.**
  if (existsSync(chunks)) {
    const alle = readdirSync(chunks).filter(n => n.endsWith('.js'))
    const gehasht = alle.filter(n => /[-.][0-9a-f]{16}\.js$/.test(n))
    const dev = alle.filter(n => DEV_BUENDEL.includes(n))
    if (gehasht.length && dev.length) {
      b.befunde.push({
        art: 'ZWEI_GENERATIONEN',
        satz: `${gehasht.length} gehashte Bau-Chunks liegen neben `
          + `${dev.length} Dev-Buendeln. Die Manifeste gehoeren nur einer `
          + 'von beiden Generationen — die andere wird 404.',
        beispiel_bau: gehasht.slice(0, 3),
      })
    }
  }

  b.zustand = b.befunde.length ? 'VERGIFTET' : 'sauber'
  return b
}

const BEHEBUNG = [
  'BEHEBUNG (in dieser Reihenfolge):',
  '  1. NICHT neu starten und NICHT .next loeschen, bevor gemessen ist —',
  '     der Dev-Server repariert sich beim naechsten Uebersetzen selbst,',
  '     und damit ist der Beweis weg.',
  '  2. Die Ursache abstellen: `next build` NIE direkt rufen.',
  '     Immer `pnpm build` (es geht ueber scripts/gate-build.js und',
  '     schreibt nach .next-gate) oder LUMEOS_DIST_DIR setzen.',
  '  3. Erst danach entscheidet Tom, ob .next neu gebaut wird.',
].join('\n')

const berichte = APPS.map(pruefe)
const vergiftet = berichte.filter(b => b.zustand === 'VERGIFTET')

if (alsJson) {
  console.log(JSON.stringify({ vergiftet: vergiftet.length, berichte }, null, 2))
} else {
  for (const b of berichte) {
    const marke = b.zustand === 'VERGIFTET' ? 'VERGIFTET' : b.zustand
    console.log(`\n${b.app.padEnd(6)} :${b.port}  ${b.verzeichnis}  ->  ${marke}`)
    for (const f of b.befunde) {
      console.log(`  [${f.art}]`)
      console.log(`  ${f.satz}`)
      for (const [k, v] of Object.entries(f)) {
        if (k === 'art' || k === 'satz') continue
        console.log(`    ${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
      }
    }
  }
  if (vergiftet.length) console.log(`\n${BEHEBUNG}\n`)
  else console.log('\nAlle geprueften Verzeichnisse sauber.\n')
}

process.exitCode = vergiftet.length ? 1 : 0
