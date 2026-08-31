#!/usr/bin/env node
// A-50: eine Spalte faellt in der Kette — zeigt noch ein Lesepfad darauf?
//
// `[read]` **Die Gegenrichtung zu `abwesenheit-pruefen.mjs`.** Der
// prueft, ob etwas Fehlendes wieder da ist. **Hier war etwas da und
// ist weg** — und ein `.select()` darauf laesst jede Zeile scheitern,
// ohne dass der Typecheck etwas sieht.
//
// `[cmd]` **Der gemessene Fall (C-215/G-160):** `acwr_used` fiel, und
// `scores-read.ts` las weiter darauf. **Ergebnis: die Score-Kachel
// fiel still auf den Entwurf zurueck** — kein Absturz, keine Meldung.
//
// ══ WAS ER PRUEFT, UND WAS NICHT ════════════════════════════════════
//
// `[read]` **Die Wirkung, nicht das Wort.** Ein `DROP COLUMN` allein
// ist kein Befund: `[cmd]` **`im_katalog` wird in
// `144_kimi_wave3_name_bridge.ts:91-92` geworfen und in derselben
// Datei zwei Zeilen weiter neu angelegt** (als GENERATED-Spalte).
// **Wer nur `DROP` zaehlt, meldet das als Fehler.**
//
// **Deshalb faellt eine Spalte nur, wenn danach kein `ADD COLUMN`
// mehr kommt** — in Kettenreihenfolge gelesen.
//
// `[read]` **Und ein Verweis im KOMMENTAR ist kein Lesepfad.** `[cmd]`
// Vier Dateien nennen `acwr_used` im Kommentar; das ist Geschichte,
// kein Zugriff. **Gesucht wird der Code ohne Kommentare.**
//
// Aufruf:
//     node tools/gefallene-spalten-pruefen.mjs
//     node tools/gefallene-spalten-pruefen.mjs --liste
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const WURZEL = process.cwd()
const NUR_LISTE = process.argv.includes('--liste')

function dateien(...muster) {
  const roh = execFileSync('git', ['ls-files', '--', ...muster],
    { cwd: WURZEL, encoding: 'utf8' })
  return roh.split('\n').map(z => z.trim()).filter(Boolean)
}

const lies = (rel) => {
  try {
    return fs.readFileSync(path.join(WURZEL, rel), 'utf8')
  } catch {
    return ''
  }
}

// ── 1. Welche Spalten fallen, ohne spaeter wiederzukommen? ──────────
//
// `[read]` Die Kette laeuft in Dateinamen-Reihenfolge — dieselbe
// Ordnung, in der `kette-ausfuehren.ts` sie einspielt.
const sql = dateien('supabase/**/*.sql', 'supabase/**/*.ts').sort()

const RX_DROP = /drop\s+column\s+(?:if\s+exists\s+)?([a-z_][a-z0-9_]*)/gi
const RX_ADD = /add\s+column\s+(?:if\s+not\s+exists\s+)?([a-z_][a-z0-9_]*)/gi

/** Spalte -> zuletzt gesehene Aktion. */
const stand = new Map()
for (const rel of sql) {
  const t = lies(rel)
  if (!t) continue
  // Position im Text entscheidet, was zuletzt kam — auch innerhalb
  // einer Datei (`im_katalog` faellt und kommt zwei Zeilen spaeter).
  const ereignisse = []
  for (const m of t.matchAll(RX_DROP)) ereignisse.push({ pos: m.index, sp: m[1], art: 'drop' })
  for (const m of t.matchAll(RX_ADD)) ereignisse.push({ pos: m.index, sp: m[1], art: 'add' })
  ereignisse.sort((a, b) => a.pos - b.pos)
  for (const e of ereignisse) stand.set(e.sp, { art: e.art, datei: rel })
}

const gefallen = [...stand.entries()]
  .filter(([, v]) => v.art === 'drop')
  .map(([sp, v]) => ({ spalte: sp, datei: v.datei }))
  .sort((a, b) => a.spalte.localeCompare(b.spalte))

// ── 2. Zeigt noch lebender Code darauf? ─────────────────────────────
//
// `[read]` **Tests sind keine Lesepfade.** `[cmd]` Der G-173-Waechter
// nennt `acwr_used` viermal — jedes Mal, um zu pruefen, dass der
// KOMMENTAR den richtigen Punkt nennt. **Ein Waechter, der einen
// Waechter meldet, erzieht dazu, ihn abzuschalten.**
//
// `[read]` **Die Grenze ist scharf:** ein `__tests__`-Ordner liest
// keine Datenbank. Was dort steht, ist eine Behauptung ueber Code.
const code = dateien('apps/**/*.ts', 'apps/**/*.tsx', 'packages/**/*.ts',
  'packages/**/*.tsx')
  .filter(p => !/(^|\/)__tests__\//.test(p) && !/\.test\.tsx?$/.test(p))

// `[read]` **Mit Wortgrenze, nie `includes`** — G-187/G-197/G-201.
function wort(name) {
  return new RegExp(`(?<![A-Za-z0-9_])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![A-Za-z0-9_])`)
}

function ohneKommentare(t) {
  return t
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
}

const funde = []
for (const { spalte, datei } of gefallen) {
  const rx = wort(spalte)
  for (const rel of code) {
    const t = lies(rel)
    if (!t || !rx.test(t)) continue
    if (rx.test(ohneKommentare(t))) funde.push({ spalte, quelle: datei, wo: rel })
  }
}

if (NUR_LISTE) {
  console.log(`[gefallene-spalten] ${gefallen.length} Spalten fallen ohne Wiederkehr:`)
  for (const g of gefallen) {
    const treffer = funde.filter(f => f.spalte === g.spalte).length
    console.log(`  ${treffer ? 'GELESEN ' : 'still   '} ${g.spalte.padEnd(26)} ${g.datei}`)
  }
  process.exit(0)
}

if (funde.length) {
  console.error('[gefallene-spalten] FEHLER: '
    + `${funde.length} Lesestelle(n) zeigen auf eine gefallene Spalte.`)
  for (const f of funde) {
    console.error(`  ${f.wo}`)
    console.error(`      liest \`${f.spalte}\` — geworfen in ${f.quelle}`)
  }
  console.error('')
  console.error('  Ein `.select()` auf eine fehlende Spalte laesst JEDE Zeile')
  console.error('  scheitern — die Kachel faellt still auf den Entwurf zurueck')
  console.error('  (gemessen in G-160: `acwr_used` nach C-215).')
  console.error('  Den Lesepfad nachziehen, dann diese Meldung pruefen.')
  process.exit(1)
}

console.log(`[gefallene-spalten] ${gefallen.length} gefallene Spalten geprueft, `
  + `${code.length} Codedateien — kein lebender Lesepfad darauf.`)
