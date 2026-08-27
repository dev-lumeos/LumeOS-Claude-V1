#!/usr/bin/env node
// Prueft, dass jede Lesestelle einer LEEREN `*_de`-Spalte ihr `_en`
// mitliest (C-254, 2026-08-23).
//
// ── WARUM ES DIESE PRUEFUNG GIBT ────────────────────────────────────
//
// `[read]` Die Regel stand seit A-50 als Merksatz im Register —
// *„`name_de` ist leer, die Anzeige faellt auf Englisch zurueck"*.
// **Notierte Regeln brechen:** C-250 wurde geschrieben, ohne dass
// jemand sie gegenprueft haette. Deshalb steht sie jetzt hier.
//
// ── WARUM SIE NICHT AUF JEDE `*_de`-SPALTE SCHAUT ───────────────────
//
// `[cmd]` **Gemessen am 2026-08-23** ueber alle 66 `*_de`-Textspalten:
// **25 tragen NIE Deutsch** (alle in `supplements`), **6 teils**,
// **21 IMMER** — darunter `nutrition.foods.name_de` mit 7.140 von
// 7.140 Zeilen.
//
// `[read]` **Eine Pruefung „jede `_de`-Spalte braucht einen Rueckfall"
// waere dauerhaft rot** und wuerde umgangen statt repariert. Sie
// pruefte `nutrition.foods.name_de` genauso wie
// `supplements.supplements.name_de`, obwohl die erste durchgehend
// deutsch ist.
//
// ── UND WARUM „LEER" NOCH NICHT REICHT ──────────────────────────────
//
// `[cmd]` **`nutrition.nutrient_details` traegt de und en identisch
// gefuellt** — detail 97/97, excess 41/41, tip 85/85, interactions
// 26/26. **Zeilen mit leerem `_de` und gefuelltem `_en`: 0.** Ein
// Rueckfall rettet dort NICHTS; wo Deutsch fehlt, fehlt Englisch auch.
//
// `[cmd]` **Und zweimal gibt es gar kein Gegenstueck:**
// `nutrition.exclusion_presets.caveat_de` und
// `supplements.rule_catalog.message_de` haben kein `_en`.
//
// `[read]` **Deshalb steht hier nur, was rettbar ist:** die Spalte
// kann leer sein UND ein gefuelltes `_en` existiert. Das sind die
// Faelle, in denen der Rueckfall echte Arbeit tut.
//
// ── DER ZUSCHNITT ───────────────────────────────────────────────────
//
// `[cmd]` **Der Spaltenname allein taugt nicht als Merkmal** — er
// ergibt 141 Treffer, weil `name_de` in beiden Welten vorkommt.
// **Der Block ab `.from()` taugt auch nicht** — er laeuft in die
// naechste Abfrage hinein und hielt `food_categories.name_de`
// faelschlich fuer `exclusion_presets.caveat_de`.
//
// **Geprueft wird die `.select(...)`-Zeichenkette einer Abfrage auf
// eine riskante Tabelle.** Steht dort ein rettbares `_de` ohne sein
// `_en`, ist es ein Fund.
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = path.join(process.cwd(), 'apps', 'web', 'src')

// `[cmd]` Tabelle -> Spalten, die leer sein koennen UND ein gefuelltes
// `_en` haben. Gemessen 2026-08-23; wer eine Spalte ergaenzt, misst sie
// vorher: leer allein genuegt nicht, sie muss rettbar sein.
const RETTBAR = new Map([
  ['supplements', ['name_de', 'description_de']],
  ['supplement_categories', ['name_de']],
  ['supplement_dosing', ['usage_hint_de']],
  ['supplement_evidence', ['summary_de']],
  ['supplement_interactions', ['description_de', 'recommendation_de']],
  ['supplement_lab_effects', ['analyte_de', 'clinical_consequence_de', 'mechanism_de']],
  ['supplement_monitoring', ['frequency_de', 'rationale_de']],
  ['supplement_organ_risks', ['mechanism_de', 'note_de']],
  ['supplement_pharmacology', ['elimination_de', 'metabolism_de']],
  ['supplement_quality', ['purity_considerations_de', 'stability_de', 'storage_de']],
  ['supplement_regulatory', ['note_de']],
  ['supplement_safety', ['pregnancy_note_de']],
  ['supplement_wada', ['note_de']],
  ['supplement_warnings', ['no_ceiling_reason_de', 'warning_de']],
])

const ABFRAGE = new RegExp(
  String.raw`\.from\(\s*['"]([a-z_]+)['"]\s*\)`
  + String.raw`(?:\s*\.[a-zA-Z]+\([^()]*\))*?`
  + String.raw`\s*\.select\(\s*((?:[^()]|\([^()]*\))*?)\)`,
  'gs')
const SPALTE = /\b([a-z_]+_de)\b/g

/** Kommentare weg — sonst zaehlt die eigene Begruendung mit (G-166). */
function ohneKommentare(quelle) {
  return quelle
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
}

function* dateien(verzeichnis) {
  for (const e of fs.readdirSync(verzeichnis, { withFileTypes: true })) {
    const p = path.join(verzeichnis, e.name)
    if (e.isDirectory()) {
      if (e.name === '__tests__' || e.name === 'node_modules') continue
      yield* dateien(p)
    } else if (/\.tsx?$/.test(e.name)) {
      yield p
    }
  }
}

const funde = []
let geprueft = 0

for (const datei of dateien(WURZEL)) {
  const quelle = ohneKommentare(fs.readFileSync(datei, 'utf8'))
  for (const m of quelle.matchAll(ABFRAGE)) {
    const [, tabelle, auswahl] = m
    const rettbar = RETTBAR.get(tabelle)
    if (!rettbar) continue
    geprueft += 1
    for (const s of auswahl.matchAll(SPALTE)) {
      const spalte = s[1]
      if (!rettbar.includes(spalte)) continue
      const en = `${spalte.slice(0, -3)}_en`
      // ── G-201: mit Wortgrenze, nicht mit `includes` ──────────────
      //
      // `[cmd]` **`auswahl` ist eine Zeichenkette**, kein Feld — ein
      // `includes('note_en')` traefe auch `note_en_alt` und meldete
      // einen Rueckfall, den es nicht gibt.
      //
      // `[read]` **Derselbe Fehler ist zweimal teuer geworden:** in
      // G-187 traf `/daten\?\.wechselwirkungen/` auch
      // `…wechselwirkungenX`, in G-197 traf `includes('community_-
      // anzeige')` den Namen `community_anzeigeX` — **im Waechter
      // gegen genau diesen Fehler.** Die Regel steht in `CLAUDE.md`.
      if (new RegExp(`(?<![a-z0-9_])${en}(?![a-z0-9_])`).test(auswahl)) continue
      funde.push({
        datei: path.relative(process.cwd(), datei),
        zeile: quelle.slice(0, m.index).split('\n').length,
        tabelle, spalte, en,
      })
    }
  }
}

if (funde.length > 0) {
  console.error(`[sprachrueckfall] ${funde.length} Lesestelle(n) ohne Rueckfall:`)
  for (const f of funde) {
    console.error(`  ${f.datei}:${f.zeile}  ${f.tabelle}.${f.spalte}`)
    console.error(`    ${f.spalte} ist bei allen Zeilen leer. Ohne ${f.en} in`)
    console.error('    derselben Auswahl zeigt die Oberflaeche eine Leerstelle.')
  }
  process.exit(1)
}

// `[read]` Die Gegenprobe gehoert in die Meldung: eine Pruefung, die
// nichts findet, weil sie nichts ansieht, sieht genauso aus wie eine,
// die nichts zu beanstanden hat.
console.log(`[sprachrueckfall] ${geprueft} Abfragen auf ${RETTBAR.size} riskante `
  + 'Tabellen geprueft, 0 ohne Rueckfall.')
