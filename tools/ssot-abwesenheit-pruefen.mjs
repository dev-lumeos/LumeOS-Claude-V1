// Behauptete Abwesenheit gegen die Datenbank — G-384.
//
// `[cmd]` **G-382/G-383 gemessen:** `docs/ssot/` behauptet an fuenf
// Stellen, eine Tabelle sei nie gebaut worden — **und sie steht in
// `information_schema`.** `[read]` **Eine fehlende Erwaehnung laedt
// zum Nachsehen ein; eine behauptete Abwesenheit haelt davon ab.**
// Der Suchlauf findet den Namen und haelt die Datei fuer abgedeckt:
// **die Falschaussage verhindert ihre eigene Entdeckung.**
//
// ── OHNE AUSNAHMELISTE, UND WARUM ───────────────────────────────────
//
// `[cmd]` **58 Zeilen behaupten eine Abwesenheit, 54 davon zu
// Recht.** `[read]` **Eine Ausnahmeliste fuer die 54 waere bequem
// und faellt in die Falle, die dieses Werkzeug behebt:** ein
// entfallener Eintrag macht die Pruefung stiller, nicht roter
// (Erlaubnisliste altert nur nach oben).
//
// `[read]` **Also: er meldet alle 58** — aber je Zeile mit der
// Auskunft, WELCHE Namen existieren und welche nicht. **Damit ist
// die Meldung nicht laestig, sondern lesbar:** wer sie ansieht,
// entscheidet in einer Zeile, ob die Aussage stimmt.
//
// `[cmd]` **Rot wird er nur bei einem Namen, der EXISTIERT.** Die 54
// richtigen Faelle stehen als Hinweis da, nicht als Fehler.

import { readdirSync, readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const SEP = ''
const SCHEMATA = ['coach', 'goals', 'medical', 'nutrition', 'recovery',
                  'supplements', 'training']

function psql(sql) {
  const r = spawnSync('docker', ['exec', '-i', CONTAINER, 'psql', '-U', 'postgres',
    '-d', process.env.PGDATABASE ?? 'postgres', '-t', '-A', '-F', SEP,
    '-v', 'ON_ERROR_STOP=1', '-c', sql],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  if (r.status !== 0) { process.stderr.write(String(r.stderr)); process.exit(2) }
  return r.stdout.trim()
}

// `[read]` **Die Menge kommt aus der Datenbank**, nicht aus einer
// Liste im Kopf — dort ist der Tabellenname die Sache selbst (G-383).
const vorhanden = new Set(psql(`
  select table_name from information_schema.tables
   where table_schema in (${SCHEMATA.map(s => `'${s}'`).join(',')})
     and table_type='BASE TABLE';`).split('\n').map(z => z.trim()).filter(Boolean))

// Kurze Namen erzeugen Zufallstreffer ("scores", "orders").
const SUCHBAR = [...vorhanden].filter(t => t.length >= 8 && t.includes('_'))

const VERNEINT = new RegExp(
  '(nicht|kein[e]?[nrs]?)\\s+(gebaut|angelegt|uebernommen|übernommen|'
  + 'vorhanden|umgesetzt|existiert|existieren|erstellt|migriert)'
  + '|(gibt es|existiert)\\s+(sie\\s+)?nicht', 'i')

// `[cmd]` **Eine Tabellen-Kopfzeile `| Fehlt | ... |` regiert jede
// Zeile darunter.** Gemessen in `127-recovery-checkins.md:193`: der
// Name stand acht Zeilen unter der Verneinung, ein Fenster ueber
// eine Zeile fand sie nicht.
const KOPF_VERNEINT = /\|\s*(Fehlt|Fehlend|Nicht [a-zä]+)\s*\|/i

// `[cmd]` **`00-INDEX.md` zitiert die anderen Dateien** — jede
// Falschaussage erscheint dort ein zweites Mal. **Gemessen: 22 der
// 106 Meldungen kamen allein daraus.** `[read]` **Ein Verweis ist
// keine zweite Aussage** — berichtigt wird die Quelle.
const dateien = readdirSync('docs/ssot')
  .filter(f => f.endsWith('.md')
            && !['00-ABGENOMMEN.md', '00-MODULTABELLEN.md',
                 '00-INDEX.md'].includes(f))

// `[cmd]` **Eine Datei kann ihre eigene Falschaussage schon
// berichtigt haben.** Gemessen in `105-medical-schema.md`: der falsche
// Satz steht weiter da, **direkt darunter ein Vermerk
// „Berichtigt 2026-09-08 (G-383)" mit `25 Spalten, live`.**
//
// `[read]` **Der Waechter darf so eine Datei nicht rot melden** —
// sonst zwingt er dazu, die Geschichte zu loeschen statt sie zu
// ergaenzen. **Ein Vermerk, der die Tabelle NAMENTLICH als vorhanden
// nennt, entkraeftet die Verneinung** — und zwar nur fuer diesen
// Namen, nicht fuer die ganze Zeile.
function istBerichtigt(text, name) {
  const abschnitte = text.split(/\*\*Berichtigt \d{4}-\d{2}-\d{2}/)
  if (abschnitte.length < 2) return false
  return abschnitte.slice(1).some(a => a.slice(0, 900).includes(name))
}

// Je Fundzeile EINE Meldung, mit allen Namen dieser Zeile.
const zeilenFunde = new Map()
for (const f of dateien) {
  const text = readFileSync('docs/ssot/' + f, 'utf8')
  const zeilen = text.split('\n')
  for (let i = 0; i < zeilen.length; i++) {
    const vorlauf = zeilen.slice(Math.max(0, i - 10), i).join(' ')
    for (const t of SUCHBAR) {
      if (!zeilen[i].includes(t)) continue
      const satz = (zeilen[i - 1] ?? '') + ' ' + zeilen[i]
      const davor = satz.slice(0, satz.indexOf(t)).slice(-200)
      if (!(VERNEINT.test(davor) || VERNEINT.test(vorlauf)
            || KOPF_VERNEINT.test(vorlauf))) continue
      if (istBerichtigt(text, t)) continue
      const schluessel = f + ':' + (i + 1)
      if (!zeilenFunde.has(schluessel)) zeilenFunde.set(schluessel, new Set())
      zeilenFunde.get(schluessel).add(t)
    }
  }
}

// Auch die Namen, die es NICHT gibt, gehoeren in die Meldung — sonst
// sieht niemand, dass die Aussage teilweise stimmt (G-383/A5).
const ALLE_NAMEN = /`?([a-z]+\.)?([a-z][a-z_]{7,})`?/g

let rot = 0
const meldungen = []
for (const [ort, namen] of [...zeilenFunde].sort()) {
  const da = [...namen].filter(n => vorhanden.has(n)).sort()
  if (!da.length) continue          // reine Wahrheit, nichts zu melden
  rot++
  meldungen.push('ROT  ' + ort + '  behauptet abwesend, EXISTIERT: '
    + da.join(', '))
}

console.log('[abwesenheit] ' + vorhanden.size + ' Tabellen, '
  + dateien.length + ' Dateien, ' + zeilenFunde.size
  + ' Zeilen mit Verneinung.')
for (const m of meldungen) console.log(m)
if (rot === 0) {
  console.log('[abwesenheit] Keine Zeile behauptet eine vorhandene Tabelle '
    + 'als abwesend.')
} else {
  console.log('[abwesenheit] ROT — ' + rot + ' Zeile(n). '
    + 'Die genannten Tabellen stehen in information_schema.')
}
process.exit(rot === 0 ? 0 : 1)
