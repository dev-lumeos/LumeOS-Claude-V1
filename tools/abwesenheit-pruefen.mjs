#!/usr/bin/env node
// A-62: Waechter und Texte, die eine ABWESENHEIT sichern.
//
// `[read]` **Das Problem, sechsmal am 30.08.:** eine Aussage ist
// richtig, wenn sie geschrieben wird, und wird still falsch, sobald
// Codex das Schema liefert. **Kein Waechter meldet das** — der
// Waechter selbst bleibt gruen, weil er etwas anderes prueft.
//
//     G-272-Waechter    verbot die Nutzung von `lifecycle`
//     G-270-Waechter    listete `GhostEintraegeEcht` als entfernt
//     G-274-Waechter    invertierte, als der MealCam-Knopf fiel
//     Planumfang-Karte  "Lebenszyklus fehlt im Schema"
//     C-175-Kommentar   "shopping_lists gibt es nicht"
//     C-177-Waechter    fand seinen Namen im eigenen Kommentar
//
// `[read]` **Die Frage aus dem Auftrag:** kann ein Waechter sagen
// *,,ich sichere eine Abwesenheit, pruef mich, wenn sie endet"*?
//
// **Ja.** Eine Aussage traegt eine Marke mit ihrer Bedingung; dieser
// Waechter prueft die Bedingungen und faellt, sobald eine endet.
//
//     // @abwesend nutrition.shopping_lists
//     // `[cmd]` Die Tabelle gibt es nicht - deshalb kein Schreibweg.
//
// **Sobald `supabase/_pipeline/` ein `CREATE TABLE` dafuer fuehrt,
// faellt dieser Waechter** und nennt Datei und Zeile.
//
// `[read]` **Warum gegen die Pipeline und nicht gegen die laufende
// Datenbank:** der Gate laeuft ohne Zugangsdaten, und die Pipeline ist
// die Quelle — sie steht vor der Datenbank, nicht danach. **Eine
// Aussage, die kippt, kippt hier zuerst.**
//
// Markenformen:
//     @abwesend <schema>.<tabelle>        eine Tabelle
//     @abwesend <schema>.*                ein ganzes Schema
//     @abwesend-spalte <tabelle>.<spalte> eine Spalte
//     @abwesend-api <schema>              nicht ueber PostgREST
//
// Aufruf:
//     node tools/abwesenheit-pruefen.mjs
//     node tools/abwesenheit-pruefen.mjs --liste    nur auflisten
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const WURZEL = process.cwd()
const NUR_LISTE = process.argv.includes('--liste')

// ── Die markierten Aussagen einsammeln ──────────────────────────────
function dateien() {
  const roh = execFileSync('git', ['ls-files', '--',
    'apps/**/*.ts', 'apps/**/*.tsx', 'packages/**/*.ts',
    'packages/**/*.tsx', 'tools/*.mjs',
    // `[cmd]` **G-386: `docs/ssot/` dazu.** Gemessen in G-385: die
    // Liste sah **0** Dateien aus `docs/ssot/` ? eine Marke dort war
    // unsichtbar. `[read]` **Die SSOT beschreibt den Ist-Zustand;
    // eine Abwesenheit ist ein Teil davon** und kippt still, sobald
    // Codex die Tabelle baut.
    //
    // ══ WARUM OHNE `**` ════════════════════════════════════════════
    //
    // `[cmd]` **`docs/ssot/**\/*.md` fand 16 von 174 Dateien** ? nur
    // die in `70-spec-audit/`. **`git ls-files` behandelt `**\/` als
    // „mindestens eine Ebene tiefer"**, die 156 Dateien direkt in
    // `docs/ssot/` fielen durch.
    //
    // `[cmd]` **Dasselbe traf `docs/spezifikation/**\/*.md` seit
    // A-62: 126 von 137** ? **11 flache Dateien wurden nie
    // gelesen**, darunter `00-QUELLEN.md` und `00-MODULPLAN.md`.
    //
    // `[read]` **Ein Verzeichnispfad ohne Muster nimmt beide
    // Ebenen** ? die Endung prueft die Schleife unten ohnehin.
    // **Eine stille Null sieht aus wie „keine Marke da".**
    'docs/spezifikation/', 'docs/ssot/',
  ], { cwd: WURZEL, encoding: 'utf8' })
  // `[read]` Ein Verzeichnispfad bringt alles mit ? 209 Dateien ohne
  // `.md` (fast nur `.gitkeep`). **Die Endung hier pruefen**, statt
  // sie ins Glob zu zwingen und dabei Ebenen zu verlieren.
  return roh.split('\n').map(z => z.trim()).filter(Boolean)
    .filter(f => !f.startsWith('docs/')
              || f.endsWith('.md'))
}

const MARKE = /@abwesend(-spalte|-api)?\s+([A-Za-z_][\w.*]*)/

const marken = []
for (const rel of dateien()) {
  let text
  try {
    text = fs.readFileSync(path.join(WURZEL, rel), 'utf8')
  } catch {
    continue
  }
  // Zwei Orte tragen Marken, die keine Aussagen sind:
  //   die eigene Datei      -- die Formbeschreibung im Kopf
  //   __tests__/            -- die Wirkungsprobe schreibt eine Marke
  //                            auf etwas Vorhandenes, damit der
  //                            Waechter faellt. Genau das soll sie.
  // Am 2026-08-30 ist der Waechter an beidem gescheitert: erst
  // abgestuerzt, dann hat er seinen eigenen Beweis als Befund gemeldet.
  // Ein Waechter, der seine eigene Probe liest, prueft nichts (G-186).
  if (rel === 'tools/abwesenheit-pruefen.mjs') continue
  if (rel.includes('__tests__/')) continue
  if (!text.includes('@abwesend')) continue
  text.split('\n').forEach((zeile, i) => {
    const m = MARKE.exec(zeile)
    if (!m) return
    // Eine Marke ohne Punkt ist keine: `@abwesend public\.user_inventory`
    // aus einem Regex-Literal liefert nur `public`. Der Waechter ist am
    // 2026-08-30 daran abgestuerzt -- an seiner eigenen Testdatei.
    // Ein Waechter, der seine eigene Dokumentation liest, prueft nichts;
    // einer, der daran stirbt, blockiert alles (A-62, G-186).
    const art = m[1] ?? ''
    const ziel = m[2]
    if (art !== '-api' && !ziel.includes('.')) return
    marken.push({ datei: rel, zeile: i + 1, art, ziel })
  })
}

// ── Die Pipeline lesen: was existiert bereits? ──────────────────────
function pipelineText() {
  const roh = execFileSync('git', ['ls-files', '--', 'supabase/'],
    { cwd: WURZEL, encoding: 'utf8' })
  let alles = ''
  for (const rel of roh.split('\n').map(z => z.trim()).filter(Boolean)) {
    if (!rel.endsWith('.sql')) continue
    try {
      alles += '\n' + fs.readFileSync(path.join(WURZEL, rel), 'utf8')
    } catch { /* unlesbar: zaehlt als nicht vorhanden */ }
  }
  return alles
}

const SQL = pipelineText()

// `[read]` **Mit Wortgrenze, nie `includes`** — G-187/G-197/G-201:
// `wechselwirkungen` traf `wechselwirkungenX`. Ein Tabellenname darf
// nicht auf einen laengeren passen.
function grenze(name) {
  return `(?<![A-Za-z0-9_])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![A-Za-z0-9_])`
}

function tabelleDa(voll) {
  const [schema, tab] = voll.split('.')
  if (tab === '*') {
    // Ein ganzes Schema: existiert, sobald irgendein CREATE TABLE
    // darauf zeigt.
    return new RegExp(`create\\s+table[^;]*?${grenze(schema)}\\s*\\.`, 'is').test(SQL)
  }
  return new RegExp(
    `create\\s+table[^;]*?${grenze(schema)}\\s*\\.\\s*${grenze(tab)}`, 'is').test(SQL)
}

function spalteDa(ziel) {
  // <tabelle>.<spalte> — die Spalte gilt als da, wenn sie in einem
  // CREATE TABLE oder einem ADD COLUMN fuer diese Tabelle vorkommt.
  const [tab, spalte] = ziel.split('.')
  const block = new RegExp(
    `create\\s+table[^;]*?${grenze(tab)}\\s*\\(([\\s\\S]*?)\\);`, 'i').exec(SQL)
  if (block && new RegExp(grenze(spalte), 'i').test(block[1])) return true
  return new RegExp(
    `alter\\s+table[^;]*?${grenze(tab)}[^;]*?add\\s+column[^;]*?${grenze(spalte)}`,
    'is').test(SQL)
}

function apiFrei(schema) {
  const cfg = fs.readFileSync(path.join(WURZEL, 'supabase/config.toml'), 'utf8')
  const m = cfg.match(/^\s*schemas\s*=\s*\[([^\]]*)\]/m)
  if (!m) return false
  return new RegExp(`"${schema}"`).test(m[1])
}

// ── Pruefen ─────────────────────────────────────────────────────────
const gekippt = []
for (const eintrag of marken) {
  let da = false
  if (eintrag.art === '-spalte') da = spalteDa(eintrag.ziel)
  else if (eintrag.art === '-api') da = apiFrei(eintrag.ziel)
  else da = tabelleDa(eintrag.ziel)
  if (da) gekippt.push(eintrag)
}

if (NUR_LISTE) {
  console.log(`[abwesenheit] ${marken.length} markierte Aussagen:`)
  for (const e of marken) {
    const zustand = gekippt.includes(e) ? 'GEKIPPT' : 'gilt'
    console.log(`  ${zustand.padEnd(8)} ${e.datei}:${e.zeile}  @abwesend${e.art} ${e.ziel}`)
  }
  process.exit(0)
}

if (gekippt.length) {
  console.error('[abwesenheit] FEHLER: '
    + `${gekippt.length} Aussage(n) sichern eine Abwesenheit, die geendet hat.`)
  for (const e of gekippt) {
    const was = e.art === '-api'
      ? `Schema "${e.ziel}" steht in config.toml`
      : e.art === '-spalte'
        ? `Spalte "${e.ziel}" steht in der Pipeline`
        : `"${e.ziel}" steht in der Pipeline`
    console.error(`  ${e.datei}:${e.zeile} — ${was}.`)
  }
  console.error('')
  console.error('  Die Aussage nachfuehren, dann die Marke entfernen oder umschreiben.')
  console.error('  Sie war richtig, als sie geschrieben wurde — das ist A-62.')
  process.exit(1)
}

console.log(`[abwesenheit] ${marken.length} markierte Aussagen geprueft, alle gelten noch.`)
