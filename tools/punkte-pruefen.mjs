#!/usr/bin/env node
// Prueft die Punktverwaltung — gegen das REPO, nicht gegen sich selbst.
//
// ══ WARUM ES DIESEN WAECHTER GIBT ═══════════════════════════════════
//
// `[cmd]` **`tools/nummern-pruefen.mjs` prueft `TODO.md` gegen
// `ERLEDIGT.md`, `LAUFEND.md` und `docs/auftraege/`** — also die
// Buchhaltung gegen sich selbst. **Er kann nicht bemerken, dass eine
// Tabelle im falschen Schema steht oder eine Zahl seit dem Messen
// gewachsen ist.**
//
// `[cmd]` **Was dadurch am 2026-08-27 durchkam — vier Auftraege auf
// toten Praemissen an einem Tag:**
//
//     G-186 nannte `wissen.entity_transporters`
//           -> die Tabellen liegen in `supplements.`
//     G-170 nannte `medical.medications`
//           -> gibt es nicht
//     G-176 sprach von 290 Substanzen
//           -> es sind 412
//     G-138 verglich Vorlagennamen mit Codenamen
//           -> `LogDoseModal` heisst hier `LogDoseFenster`
//
// `[read]` **Drei der vier haetten hier rot gemacht.** Der vierte
// (G-138) nicht — eine Namenszaehlung ist keine Behauptung ueber eine
// Tabelle oder Datei. **Das ist die Grenze dieses Waechters, und sie
// gehoert benannt statt uebergangen.**
//
// ══ WAS ER PRUEFT ═══════════════════════════════════════════════════
//
//     beruehrt.tabellen   gegen `information_schema`
//     beruehrt.dateien    gegen das Dateisystem
//     zahlen ohne         rot
//       gemessen:
//     nr                  genau einmal ueber ALLE Ordner
//     braucht             zeigt auf eine Nummer, die es gibt
//     kind_von            zeigt auf eine Nummer, die es gibt
//     Dateiname           passt zu `nr` und `modul`
//     erledigt/           Pflicht: erledigt, commit, beruehrt
//
// ══ WAS ER NICHT TUT ════════════════════════════════════════════════
//
// `[read]` **Er repariert nichts.** `docs/punkte/` gehoert dem
// Orchestrator und Codex; ein Waechter, der schreibt, nimmt ihnen die
// Entscheidung ab. **Er urteilt und nennt den Pfad.**
//
// Aufruf:
//     node tools/punkte-pruefen.mjs            (im Gate)
//     node tools/punkte-pruefen.mjs --ohne-db  (ohne Datenbank)
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

import { punkteLesen, nummernTeil, ORDNER } from './punkte-lesen.mjs'

const WURZEL = process.cwd()
const PUNKTE = path.join(WURZEL, 'docs', 'punkte')
const OHNE_DB = process.argv.includes('--ohne-db')

// ══ DER SOLLSTAND ═══════════════════════════════════════════════════
//
// **Tom, 2026-08-27:** *„Sollstand 225, scharf im Gate. Mehr ist rot,
// weniger ist rot mit dem Hinweis, den Sollstand nachzuziehen."*
//
// `[read]` **Muster von `regel-operatoren-pruefen.mjs` (C-313b).** Der
// Grund ist derselbe: **ein Waechter, der von Tag eins rot steht,
// blockiert jeden Commit — auch die Arbeit, mit der die Befunde
// behoben werden.** Ein Sollstand macht ihn ab sofort scharf, ohne
// die Migration auszusperren.
//
// `[cmd]` **Gemessen 2026-08-27 gegen Codex' Migration (A-52), 247
// Punkte:**
//
//     125  beruehrt.dateien zeigt ins Leere
//      54  kind_von auf eine Nummer, die kein Punkt ist
//      23  Pflichtfeld `angelegt` fehlt
//      23  beruehrt.tabellen gibt es nicht
//       1  kinder/kind_von widersprechen sich
//     ───
//     226
//
// `[read]` **Die Zahl steht hier und nicht in `package.json`** — ein
// Sollstand ist eine Messung, kein Aufrufparameter. Wer ihn aendert,
// aendert eine Datei mit Begruendung daneben.
//
// **Beim Nachziehen: die neue Zahl UND das Datum eintragen.**
//
// ══ DER SOLLSTAND WANDERT MIT JEDEM NEUEN PUNKT ═════════════════════
//
// `[cmd]` **Waehrend dieses Auftrags von 225 auf 226 gestiegen** —
// Codex legte `A-54` an, und der Punkt traegt `kind_von: A-52`,
// waehrend `A-52` ihn nicht in `kinder` fuehrt. **Der Waechter hat
// ihn binnen Minuten gefunden; das ist der Beleg, dass er wirkt.**
//
// `[read]` **Aber es ist auch die Schwaeche dieser Bauform:** ein
// Sollstand ueber ALLE Arten steigt auch dann, wenn jemand einen
// richtigen Punkt anlegt und nur eine Ruecksicht vergisst. **Wer
// haeufig anlegt, zieht haeufig nach — und beim Nachziehen sieht
// niemand, ob die Zahl wegen eines neuen Fehlers oder wegen einer
// Behebung gewandert ist.**
//
// `[read]` **Die bessere Bauform waere ein Sollstand JE ART** (125
// Dateien, 54 kind_von, 23 …). **Das ist bewusst nicht gebaut** — der
// Auftrag nennt eine Zahl, und eine Bauform zu erweitern, die noch
// keinen Tag alt ist, waere geraten. **Gemeldet im Bericht.**
//
// ══ NACHGEZOGEN — A-58, 2026-08-28 ══════════════════════════════════
//
// `[cmd]` **Von 55 auf 25**, weil die `kinder`-Gegenprobe entfernt
// ist (siehe unten bei Abschnitt 3). **Gemessen dreimal
// hintereinander gleich, gegen 263 Punkte.**
//
// `[cmd]` **Die Aufteilung vorher, gegen 263 Punkte:**
//
//     57  kind_von  — davon
//                     32  Gegenprobe „fuehrt X nicht in kinder"
//                     25  Nummer gibt es nicht
//
// `[read]` **Die 32 waren keine Befunde, sondern ein Waechterfehler:**
// sie verlangten ein Feld, das das Modell gestrichen hat. **Mehr als
// die Haelfte des Sollstands war Rauschen aus meiner eigenen
// Nachlaessigkeit.**
//
// `[cmd]` **Was bleibt, sind 25 Verweise auf 15 verschiedene
// Nummern** — alle 15 kommen in `TODO.md` und `ERLEDIGT.md`
// ausschliesslich als Fliesstext vor, nie als Punktueberschrift.
// **Es sind Auftragsnummern (`G-90`, `G-135`, `C-128`), keine
// Punkte** — derselbe Befund wie in G-212.
//
// `[read]` **Sie bleiben rot und gehoeren so.** Ein `kind_von`, das
// auf einen Agentenauftrag zeigt, ist eine Behauptung ueber etwas,
// das die Punktverwaltung nicht kennt.
//
// **HIER nachziehen, nirgends sonst — mit Datum und Anlass.**
const SOLLSTAND = 24

const meldungen = []
function rot(pfad, text) { meldungen.push({ pfad, text }) }

if (!fs.existsSync(PUNKTE)) {
  console.log('[punkte] docs/punkte/ gibt es nicht — nichts zu pruefen.')
  process.exit(0)
}

const punkte = punkteLesen(PUNKTE)

// ── 0 · Was sich gar nicht lesen laesst ─────────────────────────────
//
// `[read]` **Zuerst, und ohne Abbruch.** Ein Waechter, der beim
// ersten kaputten Punkt aufhoert, zeigt den zweiten nie.
for (const p of punkte) {
  for (const f of p.lesefehler) rot(p.relativ, `Frontmatter: ${f}`)
  if (!p.daten) continue
  for (const pflicht of ['nr', 'typ', 'modul', 'schwere', 'angelegt']) {
    if (p.daten[pflicht] === undefined || p.daten[pflicht] === null) {
      rot(p.relativ, `Pflichtfeld fehlt: ${pflicht}`)
    }
  }
}

const gueltig = punkte.filter(p => p.daten && p.daten.nr)

// ── 1 · `nr` genau einmal ueber ALLE Ordner ─────────────────────────
//
// `[read]` **Der Ersatz fuer die drei Meldungen *„steht offen UND
// erledigt"*, die der alte Waechter am 27.08. ausgab.** Im neuen
// Modell kann das nicht entstehen — **hier wird belegt, dass es nicht
// entsteht.**
const jeNummer = new Map()
for (const p of gueltig) {
  const nr = String(p.daten.nr)
  if (!jeNummer.has(nr)) jeNummer.set(nr, [])
  jeNummer.get(nr).push(p)
}
for (const [nr, liste] of jeNummer) {
  if (liste.length > 1) {
    rot(liste.map(x => x.relativ).join('  +  '),
      `Nummer ${nr} liegt ${liste.length}-mal`)
  }
}

// ── 2 · Dateiname gegen Frontmatter ─────────────────────────────────
//
// `[cmd]` **Vorgabe:** `<modul>-<reihe>-<nummer vierstellig>-<titel>.md`
for (const p of gueltig) {
  const teil = nummernTeil(p.daten.nr)
  if (!teil) {
    rot(p.relativ, `nr nicht deutbar: ${p.daten.nr}`)
    continue
  }
  const soll = `${String(p.daten.modul ?? '').toLowerCase()}-${teil.toLowerCase()}-`
  if (!p.name.toLowerCase().startsWith(soll)) {
    rot(p.relativ, `Dateiname passt nicht zu nr/modul — erwartet Beginn `
      + `\`${soll}\``)
  }
}

// ── 3 · braucht / kind_von ──────────────────────────────────────────
const bekannt = new Set(gueltig.map(p => String(p.daten.nr)))
const alsListe = v => (Array.isArray(v) ? v : (v == null ? [] : [v]))
  .map(x => String(x).trim()).filter(Boolean)

// ══ DIE ALTBESTANDS-AUSNAHME ════════════════════════════════════════
//
// `[cmd]` **Gemessen 2026-08-27 gegen Codex' Migration:** 61
// verschiedene Nummern werden als `kind_von` oder `braucht` genannt und
// liegen in keinem Punktordner. **46 davon stehen in `ERLEDIGT.md`** —
// sie existieren, sie wurden nur nicht migriert (A-52 hat die 244
// OFFENEN ueberfuehrt, nicht die 385 erledigten).
//
// `[read]` **Das ist eine Luecke im Modell, kein Datenfehler.** Ein
// Punkt darf auf einen erledigten Vorgaenger zeigen — genau dafuer ist
// `kind_von` da. **Wuerde der Waechter das rot melden, meldete er 93
// Mal etwas Richtiges als falsch, und niemand liest ihn mehr.**
//
// `[read]` **Deshalb gilt `ERLEDIGT.md` als zweite Quelle bekannter
// Nummern — bis die erledigten Punkte migriert sind.** Der Waechter
// sagt, wie viele Verweise er nur so aufloesen konnte; **diese Zahl
// ist der Fortschrittsbalken der Migration.**
const ALT = path.join(WURZEL, 'docs', 'todo', 'ERLEDIGT.md')
const altbestand = new Set()
if (fs.existsSync(ALT)) {
  const roh = fs.readFileSync(ALT, 'utf8')
  for (const m of roh.matchAll(/\*\*([A-Z]+-\d+)[:*\s]/g)) altbestand.add(m[1])
}
let ausAltbestand = 0
const kennt = (nr) => {
  if (bekannt.has(nr)) return true
  if (altbestand.has(nr)) { ausAltbestand += 1; return true }
  return false
}

for (const p of gueltig) {
  for (const b of alsListe(p.daten.braucht)) {
    if (!kennt(b)) rot(p.relativ, `braucht: ${b} — diese Nummer gibt es nicht`)
  }
  const el = p.daten.kind_von
  if (el != null && String(el).trim() && !kennt(String(el).trim())) {
    rot(p.relativ, `kind_von: ${el} — diese Nummer gibt es nicht`)
  }
}

// ══ DIE `kinder`-GEGENPROBE IST ENTFERNT — A-58 ═════════════════════
//
// `[cmd]` **Hier stand eine Pruefung beider Richtungen:** ob das Kind
// seinen Elternteil kennt UND ob der Elternteil sein Kind fuehrt.
//
// `[read]` **Das Modell fuehrt `kinder` nicht mehr.**
// `docs/punkte/00-LIESMICH.md`, Abschnitt *„Es gibt kein Feld
// `kinder`"*: **nach der Migration standen 121 `kind_von` gegen 1
// `kinder`** — wer ein Kind anlegt, traegt `kind_von` ein; **niemand
// geht zum Elternteil zurueck und pflegt die Gegenrichtung.**
//
// `[cmd]` **Der Waechter hat das nicht mitbekommen und jeden neuen
// Kindpunkt rot gemacht** — zwei Punkte mit `kind_von: G-186`
// blockierten jeden Commit, weil G-186 ein Feld nicht fuehrt, das
// seine Datei gar nicht mehr hat.
//
// `[cmd]` **Gemessen 2026-08-28, was dadurch gemeldet wurde:**
// **32 der 57 Befunde waren diese Gegenprobe** — mehr als die
// Haelfte, und alle 32 verlangten etwas, das das Modell verbietet.
//
// `[read]` **Was bleibt, ist die Existenzpruefung von `kind_von`**
// (oben) — sie prueft eine Behauptung ueber die Welt, nicht die
// Buchhaltung gegen sich selbst. **Die Kinder leitet der Index aus
// `kind_von` ab; gepflegt wird nichts.**

// ── 4 · zahlen ohne gemessen ────────────────────────────────────────
//
// `[read]` **Die Regel aus A-51:** eine Zahl ohne Stichtag ist keine
// Zahl. `[cmd]` G-176 sprach von 290 Substanzen — es sind 412, und
// niemand konnte sehen, wann die 290 galten.
for (const p of gueltig) {
  const z = p.daten.zahlen
  if (z == null) continue
  if (typeof z !== 'object' || Array.isArray(z)) {
    rot(p.relativ, 'zahlen: ist kein Block')
    continue
  }
  const schluessel = Object.keys(z)
  if (schluessel.length === 0) continue
  if (!z.gemessen) {
    rot(p.relativ, `zahlen: ohne gemessen: — ${schluessel.join(', ')}`)
  }
}

// ── 5 · beruehrt.dateien gegen das Dateisystem ──────────────────────
for (const p of gueltig) {
  for (const d of alsListe(p.daten.beruehrt?.dateien)) {
    // `[read]` **Ein Glob ist keine Behauptung ueber eine Datei.**
    // Wer `apps/web/src/**/*.tsx` schreibt, meint eine Menge; die
    // pruefen wir nicht, statt sie falsch zu pruefen.
    if (/[*?]/.test(d)) continue
    if (!fs.existsSync(path.join(WURZEL, d))) {
      rot(p.relativ, `beruehrt.dateien: ${d} — gibt es nicht`)
    }
  }
}

// ── 6 · beruehrt.tabellen gegen information_schema ──────────────────
//
// `[cmd]` **Das ist der Teil, der G-186 und G-170 gefangen haette.**
// `[read]` **Lesend gegen die laufende Instanz** — der Auftrag
// erlaubt es ausdruecklich.
function tabellenAusDb() {
  const sql = "select table_schema || '.' || table_name from "
    + 'information_schema.tables;'
  const roh = execFileSync('docker', [
    'exec', 'supabase_db_LumeOS-Claude-V1', 'psql', '-U', 'postgres',
    '-d', 'postgres', '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
  return new Set(roh.split(/\r?\n/).map(x => x.trim().toLowerCase()).filter(Boolean))
}

const genannteTabellen = gueltig.flatMap(p =>
  alsListe(p.daten.beruehrt?.tabellen).map(t => ({ p, t })))

if (genannteTabellen.length > 0 && !OHNE_DB) {
  let vorhanden = null
  try {
    vorhanden = tabellenAusDb()
  } catch (e) {
    // `[read]` **Keine Datenbank ist kein Gruen.** Der Waechter sagt,
    // was er nicht pruefen konnte — sonst sieht ein Lauf ohne Docker
    // aus wie ein bestandener.
    console.log('[punkte] HINWEIS: `beruehrt.tabellen` nicht geprueft — '
      + 'die Datenbank antwortet nicht.')
    console.log('[punkte]          '
      + `${genannteTabellen.length} Tabellenangaben blieben ungeprueft.`)
    console.log(`[punkte]          (${String(e.message).split('\n')[0].slice(0, 100)})`)
  }
  if (vorhanden) {
    for (const { p, t } of genannteTabellen) {
      const name = String(t).trim().toLowerCase()
      // `[read]` **Ohne Schema ist es keine pruefbare Angabe.** Genau
      // daran ist G-186 gescheitert: `entity_transporters` allein
      // sagt nicht, ob `wissen.` oder `supplements.` gemeint war.
      if (!name.includes('.')) {
        rot(p.relativ, `beruehrt.tabellen: ${t} — ohne Schema, nicht pruefbar`)
        continue
      }
      if (!vorhanden.has(name)) {
        const woanders = [...vorhanden]
          .filter(x => x.split('.')[1] === name.split('.')[1])
          .slice(0, 3)
        rot(p.relativ, `beruehrt.tabellen: ${t} — gibt es nicht`
          + (woanders.length ? ` (aber: ${woanders.join(', ')})` : ''))
      }
    }
  }
}

// ── 7 · erledigt/ braucht mehr ──────────────────────────────────────
//
// `[read]` **Bewusst asymmetrisch:** `beruehrt` ist in `todos/`
// optional, in `erledigt/` Pflicht. **Die Beweislast liegt bei dem,
// der am Code war** — beim Anlegen waere sie geraten.
for (const p of gueltig.filter(x => x.ordner === 'erledigt')) {
  for (const feld of ['erledigt', 'commit']) {
    if (!p.daten[feld]) rot(p.relativ, `erledigt/: Pflichtfeld fehlt — ${feld}`)
  }
  const b = p.daten.beruehrt
  const leer = !b || typeof b !== 'object'
    || (alsListe(b.tabellen).length === 0 && alsListe(b.dateien).length === 0)
  if (leer) rot(p.relativ, 'erledigt/: beruehrt ist leer — Pflicht in erledigt/')
}

// ── 8 · Ordner, die es nicht geben darf ─────────────────────────────
for (const name of fs.readdirSync(PUNKTE)) {
  const voll = path.join(PUNKTE, name)
  if (!fs.statSync(voll).isDirectory()) continue
  if (!ORDNER.includes(name)) {
    rot(`docs/punkte/${name}/`, 'unbekannter Ordner - nicht im Modell')
    continue
  }
  // In laufend_<agent>/ ist genau ein Unterordner erlaubt: next/ mit
  // vorbereiteten Auftraegen. Alles andere waere ein Ort, an dem Punkte
  // liegen, die keine Zaehlung erreicht.
  for (const unter of fs.readdirSync(voll)) {
    const u = path.join(voll, unter)
    if (!fs.statSync(u).isDirectory()) continue
    if (!(name.startsWith('laufend_') && unter === 'next')) {
      rot(`docs/punkte/${name}/${unter}/`, 'unbekannter Unterordner - nicht im Modell')
    }
  }
}

// ── Ergebnis ────────────────────────────────────────────────────────
const jeOrdner = {}
for (const p of punkte) jeOrdner[p.ordner] = (jeOrdner[p.ordner] ?? 0) + 1

const teile = ORDNER.filter(o => jeOrdner[o])
  .map(o => `${o} ${jeOrdner[o]}`).join(' · ')
console.log(`[punkte] ${punkte.length} Punkte geprueft.  (${teile})`)

const vorbereitet = punkte.filter(p => p.vorbereitet)
if (vorbereitet.length) {
  const jeAgent = {}
  for (const p of vorbereitet) {
    const a = p.ordner.slice(8)
    jeAgent[a] = (jeAgent[a] ?? 0) + 1
  }
  const liste = Object.entries(jeAgent).map(([a, n]) => `${a} ${n}`).join(' | ')
  console.log(`[punkte] ${vorbereitet.length} vorbereitet, noch nicht raus: ${liste}`)
}
if (genannteTabellen.length > 0 && !OHNE_DB) {
  console.log(`[punkte] ${genannteTabellen.length} Tabellenangaben gegen `
    + 'information_schema gehalten.')
}
if (ausAltbestand > 0) {
  console.log(`[punkte] ${ausAltbestand} Verweis(e) nur ueber ERLEDIGT.md `
    + 'aufloesbar — so viele erledigte Punkte fehlen noch in erledigt/.')
}

// ── Die Aufschluesselung, immer ─────────────────────────────────────
//
// `[read]` **Sie steht auch im gruenen Lauf da.** Ein Sollstand ohne
// Aufschluesselung ist eine Zahl, aus der niemand Punkte machen kann.
const jeArt = new Map()
for (const m of meldungen) {
  const art = m.text.replace(/:.*$/, '').replace(/\s+—.*$/, '')
  jeArt.set(art, (jeArt.get(art) ?? 0) + 1)
}
if (meldungen.length > 0) {
  console.log('')
  console.log(`[punkte] ${meldungen.length} Befund(e), Soll ${SOLLSTAND}:`)
  for (const [art, n] of [...jeArt].sort((a, b) => b[1] - a[1])) {
    console.log(`         ${String(n).padStart(4)}  ${art}`)
  }
}

const AUSFUEHRLICH = process.argv.includes('--alle') || meldungen.length <= 20
if (meldungen.length > 0 && AUSFUEHRLICH) {
  console.log('')
  for (const m of meldungen) {
    console.log(`  ${m.pfad}`)
    console.log(`    ${m.text}`)
  }
} else if (meldungen.length > 0) {
  console.log('')
  console.log('         (einzeln: node tools/punkte-pruefen.mjs --alle)')
}

// ── Der Sollstand entscheidet ───────────────────────────────────────
if (meldungen.length === SOLLSTAND) {
  console.log('')
  console.log(`[punkte] gruen: ${meldungen.length} Befunde, genau der `
    + 'Sollstand. Kein neuer Schaden.')
  process.exit(0)
}

console.error('')
if (meldungen.length > SOLLSTAND) {
  console.error(`[punkte] ROT: ${meldungen.length} Befunde, Soll `
    + `${SOLLSTAND} — ${meldungen.length - SOLLSTAND} neu hinzugekommen.`)
  console.error('')
  console.error('  Ein Punkt behauptet etwas ueber die Welt. Diese Behauptung')
  console.error('  muss maschinell pruefbar sein — sonst wird daraus ein')
  console.error('  Auftrag auf einer toten Praemisse (docs/punkte/00-LIESMICH.md).')
} else {
  console.error(`[punkte] ROT: nur noch ${meldungen.length} Befunde, Soll `
    + `${SOLLSTAND} — ${SOLLSTAND - meldungen.length} behoben.`)
  console.error('')
  console.error('  Das ist eine gute Nachricht mit einer Pflicht: den')
  console.error(`  Sollstand in tools/punkte-pruefen.mjs auf ${meldungen.length}`)
  console.error('  nachziehen, mit Datum. Sonst faellt der naechste Rueckschritt')
  console.error('  nicht auf.')
}
process.exit(1)
