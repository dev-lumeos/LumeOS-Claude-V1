// `[cmd]` **2026-09-08, A-74.** Tom: *,,wenn wir den tag
// abschliessen wird nachgetragen, denn da liegt die wahre source."*
//
// `[cmd]` **Gemessen: letzter Commit in `docs/ssot/` am 27.08.,
// seither 112 Commits in `supabase/` und `apps/`** ? **326 Punkte
// abgenommen, keiner nachgetragen.**
//
// `[read]` **Von Hand nachtragen erzeugt genau den Rueckstand, den
// es beheben soll.** `[read]` **Also: erzeugen.**
//
// `[read]` **Was dieses Werkzeug NICHT tut: den Ist-Zustand
// beschreiben.** `[read]` **Es traegt zusammen, was abgenommen
// wurde, mit Datum und Commit** ? **die Beschreibung bleibt
// Handarbeit, aber sie hat jetzt eine Grundlage.**

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const ERLEDIGT = 'docs/punkte/erledigt'
const ZIEL = 'docs/ssot/00-ABGENOMMEN.md'
const AB = process.argv.includes('--ab')
  ? process.argv[process.argv.indexOf('--ab') + 1]
  : '2026-08-28'

function kopf(text) {
  const teile = text.split('---')
  return teile.length > 1 ? teile[1] : ''
}
function feld(fm, name) {
  const m = fm.match(new RegExp('^' + name + ':\\s*(.+)$', 'm'))
  return m ? m[1].trim() : null
}

const jeModul = new Map()
let gesamt = 0
for (const datei of readdirSync(ERLEDIGT)) {
  if (!datei.endsWith('.md')) continue
  const text = readFileSync(join(ERLEDIGT, datei), 'utf8')
  const fm = kopf(text)
  const erledigt = feld(fm, 'erledigt')
  const nr = feld(fm, 'nr')
  const modul = feld(fm, 'modul') ?? '?'
  const commit = feld(fm, 'commit')
  if (!erledigt || !nr || erledigt < AB) continue
  const titel = (text.match(/^#\s+\S+\s*[-\u2014]\s*(.+)$/m) ?? [, datei])[1]
  if (!jeModul.has(modul)) jeModul.set(modul, [])
  jeModul.get(modul).push({ erledigt, nr, titel: titel.trim(), commit })
  gesamt += 1
}

const zeilen = [
  '# Abgenommen seit ' + AB,
  '',
  '**Erzeugt von `tools/ssot-nachtragen.mjs`.** `[read]` **Nicht von',
  'Hand aendern** ? **die Quelle ist `docs/punkte/erledigt/`.**',
  '',
  '`[read]` **Diese Datei sagt, WAS abgenommen wurde.** `[read]` **Was',
  'gebaut IST, beschreiben die Modul-Dateien in diesem Ordner** ? **das',
  'bleibt Handarbeit, aber sie hat jetzt eine Grundlage.**',
  '',
  '`[cmd]` **Stand: ' + new Date().toISOString().slice(0, 10) +
    ', ' + gesamt + ' Punkte.**',
  '',
]
for (const modul of [...jeModul.keys()].sort()) {
  const liste = jeModul.get(modul).sort((a, b) =>
    a.erledigt === b.erledigt ? a.nr.localeCompare(b.nr)
                              : a.erledigt.localeCompare(b.erledigt))
  zeilen.push('## ' + modul + ' ? ' + liste.length + ' Punkte', '')
  zeilen.push('| Datum | Nr | Titel | Commit |')
  zeilen.push('|---|---|---|---|')
  for (const p of liste) {
    zeilen.push('| ' + p.erledigt + ' | ' + p.nr + ' | ' +
      p.titel.replace(/\|/g, '\\|') + ' | `' + (p.commit ?? '?') + '` |')
  }
  zeilen.push('')
}

if (process.argv.includes('--schreiben')) {
  writeFileSync(ZIEL, zeilen.join('\n'), 'utf8')
  console.log('[ssot] ' + gesamt + ' Punkte -> ' + ZIEL)
} else {
  console.log('[ssot] ' + gesamt + ' Punkte seit ' + AB +
    ' in ' + jeModul.size + ' Modulen (--schreiben zum Ablegen)')
}
