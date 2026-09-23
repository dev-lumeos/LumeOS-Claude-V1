// G-493/N3 -- kann die Anzeigeprobe rot werden?
//
// ══ WARUM NICHT DIE SPRACHDATEI SABOTIERT WIRD ════════════════════
//
// [cmd] Gemessen 2026-09-22: eine Sabotage an `messages/de.json`
// hat den LAUFENDEN Dev-Server vergiftet. Die Datei war danach
// wiederhergestellt, aber `.next/server/_rsc_messages_de_json.js`
// trug weiter `hinzufuegenX` -- und der Schirm zeigte tagelang
// `Allgemein.hinzufuegen`.
//
// [read] Next kompiliert die Sprachdatei in ein Servermodul und
// laedt es je Prozess EINMAL. Ein Schaden daran ueberlebt die
// Wiederherstellung und sieht danach aus wie ein Codefehler.
//
// [cmd] Deshalb wird hier der AUFRUF sabotiert, nicht die Datei:
// `tA('hinzufuegen')` -> `tA('gibtesnicht')`. Das ist genau der
// Fall, den N3 verlangt ("ein fehlender Schluessel wird rot") --
// und `.tsx` laedt Next bei jeder Aenderung neu.
import { readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'

const WURZEL = path.resolve(import.meta.dirname, '..')
const W = (p) => path.join(WURZEL, 'apps/web/src', p)
const PROBE = path.join(WURZEL, 'tools/_g493n-anzeige.mjs')

const LISTE = W('app/v2/supplements/tab-produkte.tsx')
const SUBSTANZ = W('app/v2/supplements/substanz-detail.tsx')

const SCHAEDEN = [
  [LISTE, 'die Liste ruft einen Schluessel, den es nicht gibt',
   "{tA('hinzufuegen')}", "{tA('gibtesnicht')}"],
  [SUBSTANZ, 'die Substanzen rufen einen Schluessel, den es nicht gibt',
   "{tA('hinzufuegen')}", "{tA('gibtesnicht')}"],
  [LISTE, 'die Liste schreibt das Wort wieder als Literal',
   "{tA('hinzufuegen')}", 'Add'],
]

// [read] Die Kontrolle MUSS gruen bleiben -- sonst faellt die Probe
// auf jede Aenderung und misst nichts.
const KONTROLLE = [LISTE, 'KONTROLLE (muss GRUEN bleiben)',
  "{tA('hinzufuegen')}", "{ tA('hinzufuegen') }"]

const laeuft = () => {
  try {
    execFileSync('node', [PROBE], {
      cwd: path.join(WURZEL, 'apps/web'), stdio: 'pipe',
    })
    return true
  } catch { return false }
}

let gut = 0, gesamt = 0
const sicherung = new Map()
for (const [datei] of [...SCHAEDEN, KONTROLLE]) {
  if (!sicherung.has(datei)) sicherung.set(datei, readFileSync(datei, 'utf8'))
}
try {
  for (const [datei, name, suche, ersatz] of [...SCHAEDEN, KONTROLLE]) {
    const kontrolle = name.startsWith('KONTROLLE')
    gesamt++
    const original = sicherung.get(datei)
    const kaputt = original.replaceAll(suche, ersatz)
    if (kaputt === original) {
      console.log(`  ??  ${name}: SUCHTEXT NICHT GEFUNDEN -- Schaden kam nie an`)
      continue
    }
    writeFileSync(datei, kaputt)
    // [read] Next braucht einen Moment, um die Aenderung zu uebernehmen.
    await new Promise(r => setTimeout(r, 4000))
    const gruen = laeuft()
    const ok = kontrolle ? gruen : !gruen
    if (ok) gut++
    console.log(`  ${ok ? 'OK' : '!!'}  ${gruen ? 'GRUEN' : 'ROT  '}  ${name}`)
    writeFileSync(datei, original)
    await new Promise(r => setTimeout(r, 4000))
  }
} finally {
  for (const [datei, inhalt] of sicherung) writeFileSync(datei, inhalt)
}
console.log(`\n${gut}/${gesamt}`)
process.exit(gut === gesamt ? 0 : 1)
