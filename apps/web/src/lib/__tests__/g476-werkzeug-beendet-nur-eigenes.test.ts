// G-476 — ein Werkzeug darf nur seinen EIGENEN Bau beenden.
//
// ══ WAS PASSIERT IST ════════════════════════════════════════════════
//
// `[cmd]` **Nach einem Lauf von `_g474-anstrich.mjs` horchte Port
// 3200 nicht mehr.** **Tom: *„server laeuft nicht"*.**
//
// `[cmd]` **Die Ursache, gemessen 2026-09-18:** am Ende stand
//
//     taskkill /F /T /PID <pid der cmd-Huelle>
//
// `[cmd]` **Die `cmd`-Huelle aus `shell: true` lebt rund fuenf
// Sekunden und stirbt DANN — der Server laeuft weiter:**
//
//     1s..5s  huelleLebt=true   portOffen=true
//     6s      huelleLebt=FALSE  portOffen=true
//
// `[read]` **Am Ende des Laufs war die gemerkte PID also TOT.**
// **Windows vergibt PIDs neu, und `/T` nimmt den ganzen Baum unter
// dieser Nummer mit** — getroffen hat es Toms Dev-Server.
//
// ══ DIE REGEL ═══════════════════════════════════════════════════════
//
// `[read]` **„Nie start, neustart, aufraeumen" gilt auch fuer
// Werkzeuge.** **Wer doch startet, beendet ueber den PORT, ohne
// `/T`, und nur den eigenen Bau.**
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = path.resolve(process.cwd(), '../..')
const WERKZEUGE = path.join(WURZEL, 'tools')

function ohneKommentare(q: string): string {
  return q.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
}

/**
 * Die Werkzeuge, die einen Server starten koennen.
 *
 * `[read]` **Gesucht wird der ZUGRIFF, nicht das Wort** — ein
 * `next start` im Kommentar ist eine Erklaerung, kein Start.
 */
function starter(): string[] {
  return fs.readdirSync(WERKZEUGE)
    .filter(d => d.endsWith('.mjs'))
    .filter(d => {
      const roh = fs.readFileSync(path.join(WERKZEUGE, d), 'utf8')
      const q = ohneKommentare(roh)
      // `[cmd]` **Sabotagewerkzeuge tragen den Startaufruf als
      // SUCHTEXT in einer Zeichenkette, nicht als Aufruf** —
      // `_g474-sabotage.mjs` wurde deshalb gemeldet.
      //
      // `[read]` **Erkannt an der SACHE:** ein Sabotagewerkzeug
      // schreibt Dateien zurueck (`writeFileSync`) und ruft die
      // Probenreihe — es startet nichts.
      if (/writeFileSync/.test(q) && /--test/.test(q)) return false
      return /spawn\(\s*['"]npx['"]\s*,\s*\[\s*['"]next['"]\s*,\s*['"]start['"]/
        .test(q)
    })
}

test('G-476: kein Werkzeug toetet einen Prozessbaum (/T)', () => {
  // ══ DER GEMESSENE GRUND ══════════════════════════════════════════
  //
  // `[cmd]` **`/T` nimmt alles unter der PID mit.** `[read]` **Bei
  // einer wiederverwendeten PID ist das ein fremder Baum** — hier
  // Toms Dev-Server.
  //
  // `[read]` **Ausgenommen ist nur die Diagnose selbst**
  // (`_g476-baum.mjs`), die an einem EIGENEN, harmlosen Baum misst,
  // was `/T` anrichtet.
  const AUSNAHME = '_g476-baum.mjs'
  const funde: string[] = []
  for (const d of fs.readdirSync(WERKZEUGE).filter(x => x.endsWith('.mjs'))) {
    if (d === AUSNAHME) continue
    const q = ohneKommentare(fs.readFileSync(path.join(WERKZEUGE, d), 'utf8'))
    // `[read]` **Sabotagewerkzeuge fuehren `/T` als SUCHTEXT** — sie
    // schreiben Dateien zurueck und rufen die Probenreihe, sie toeten
    // nichts. `[cmd]` **Erkannt an der Sache, nicht am Namen.**
    if (/writeFileSync/.test(q) && /--test/.test(q)) continue
    if (/['"]\/T['"]/.test(q)) funde.push(d)
  }
  assert.deepEqual(funde, [],
    'Ein Werkzeug ruft `taskkill /T` und toetet damit einen ganzen '
    + 'Prozessbaum. Bei einer wiederverwendeten PID trifft das einen '
    + 'fremden Prozess — so ist Toms Dev-Server auf 3200 gestorben '
    + '(G-476). Ueber den PORT beenden, ohne `/T`. Gefunden:\n  '
    + funde.join('\n  '))
})

test('G-476: wer startet, beendet ueber den PORT', () => {
  // `[read]` **Eine gemerkte PID ist nach Sekunden wertlos** — die
  // `cmd`-Huelle stirbt vor dem Server. `[cmd]` **Der Port sagt, wer
  // JETZT dort antwortet.**
  const funde: string[] = []
  for (const d of starter()) {
    const q = ohneKommentare(fs.readFileSync(path.join(WERKZEUGE, d), 'utf8'))
    // `[cmd]` **Nicht das VORKOMMEN pruefen, sondern den GEBRAUCH:**
    // eine Sabotage, die `const pid = pidAmPort(PORT)` durch die
    // gemerkte PID ersetzte, liess die Probe gruen — die Funktion
    // stand ja noch in der Datei.
    if (!/=\s*pidAmPort\s*\(/.test(q)) {
      funde.push(`${d}: das Beenden benutzt pidAmPort nicht`)
      continue
    }
    // Und die gemerkte PID darf NICHT an `taskkill` gehen.
    if (/taskkill['"]\s*,\s*\[[^\]]*String\(\s*eigenerServer\.pid/.test(q)) {
      funde.push(`${d}: toetet die gemerkte PID`)
    }
  }
  assert.deepEqual(funde, [],
    'Ein startendes Werkzeug beendet nicht ueber den Port, sondern '
    + 'ueber eine gemerkte PID. Die kann tot und neu vergeben sein '
    + '(G-476). Gefunden:\n  ' + funde.join('\n  '))
})

test('G-476: Starten ist die Ausnahme, nicht die Vorgabe', () => {
  // **Die Regel:** *„nie start, neustart, aufraeumen"* — Tom besitzt
  // die Server. `[read]` **Ein Werkzeug, das ungefragt startet, muss
  // auch beenden, und genau dabei ist der Schaden entstanden.**
  const funde: string[] = []
  for (const d of starter()) {
    const q = ohneKommentare(fs.readFileSync(path.join(WERKZEUGE, d), 'utf8'))
    // `[cmd]` **Auch hier der Gebrauch:** `DARF_STARTEN = true` liess
    // `LUMEOS_START` im Text stehen — und die Probe gruen.
    // `[read]` **Beide Schreibweisen sind gueltige Tore** —
    // `=== '1'` (erlauben) und `!== '1'` (abbrechen). `[cmd]` **Nur
    // `=== '1'` zu verlangen machte `_g476-huelle.mjs` faelschlich
    // rot**, obwohl sie richtig abriegelt.
    if (!/LUMEOS_START\s*[!=]==\s*["']1["']/.test(q)) funde.push(d)
  }
  assert.deepEqual(funde, [],
    'Ein Werkzeug startet einen Server OHNE ausdrueckliche '
    + 'Erlaubnis (`LUMEOS_START=1`). Ohne sie soll es melden, dass '
    + 'der Server fehlt — nicht selbst eingreifen. Gefunden:\n  '
    + funde.join('\n  '))
})

test('G-476: es GIBT ein startendes Werkzeug — sonst prueft nichts', () => {
  // `[read]` **Eine leere Liste ist kein bestandener Test, sondern
  // ein abgeschalteter** (die Lehre aus G-470 und G-474).
  const s = starter()
  assert.ok(s.length >= 1,
    'Kein Werkzeug startet mehr einen Server — dann laufen die drei '
    + 'Proben oben ins Leere und sind immer gruen.')
  assert.ok(s.includes('_g474-anstrich.mjs'),
    `_g474-anstrich.mjs startet nicht mehr — die Liste ist ${s.join(', ')}.`)
})

test('G-476: KONTROLLE — das blosse Wort macht keine Probe rot', () => {
  assert.ok(ohneKommentare("// taskkill '/T'\ncode").indexOf('/T') === -1,
    'ohneKommentare entfernt Zeilenkommentare nicht — dann findet '
    + 'die Probe ihre eigene Begruendung.')
})
