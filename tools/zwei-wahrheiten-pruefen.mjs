#!/usr/bin/env node
// Zwei Wahrheiten je Naehrstoff - Waechter statt Anbindung.
//
// G-250/G-261, 2026-08-29: goals.nutrition_targets traegt sieben
// Naehrstoffspalten (bis G-439: sechs). Drei davon haben zusaetzlich eine
// wissenschaftliche Referenz, und genau eine geht auseinander: F18:3CN3 ist
// gegen das persoenliche Ziel gedeckt und gegen EFSA zu wenig.
//
// Nach dem G-218-Massstab ist das "selten" - eine Achse mit Vermerk genuegt.
// Die Vergleichsfunktionen sind gebaut und an nichts gehaengt.
//
// Dieser Waechter zaehlt bei jedem Gate-Lauf nach. Steigt die Zahl, wird
// G-261 von selbst wieder zur Frage - ohne dass jemand hinsieht.
//
// Er misst die Wirkung, nicht das Wort: er zaehlt Spalten in der Datenbank,
// nicht Vorkommen im Quelltext.

import { execFileSync } from 'node:child_process';

// `[cmd]` **G-439: 6 -> 7.** **`fiber_g` kam mit C-464** (abgenommen,
// `c5efd107`) — **30 g Ziel, 5 von 5 Zeilen gefuellt, 5 Nutzer.**
//
// `[cmd]` **Gemessen, nicht geschaetzt** — die sieben, die diese
// Abfrage heute zaehlt:
//
//     kcal · protein_g · carbs_g · fat_g
//     linoleic_acid_g · alpha_linolenic_acid_g · fiber_g
//
// `[read]` **Die beiden Fettsaeuren waren SCHON in der alten Sechs**
// — sie sind aelter als C-464 und keine Abweichung. **Genau eine
// Spalte ist neu, und die Zahl steigt um genau eins.**
//
// `[read]` **Und die Frage, die der Waechter stellt, bleibt offen:**
// `fiber_g` **traegt ein persoenliches Ziel. Ob es eine
// wissenschaftliche Referenz danebenstellt, entscheidet G-261** —
// **das Anheben hier beantwortet sie nicht, es haelt nur fest, dass
// die Zunahme bekannt ist.**
const SOLL_NAEHRSTOFFSPALTEN = 7;

// Die Ausschlussliste, und warum sie eine Ausschlussliste ist:
//
// `[read]` **Die Richtung ist Absicht.** Wer eine Spalte hinzufuegt und
// sie nirgends einordnet, faellt hier ROT auf. Eine Einschlussliste
// waere bequemer und wuerde einen achten Naehrstoff stillschweigend
// durchlassen — genau das, was dieser Waechter verhindern soll.
//
// `[cmd]` **2026-09-29, C-554 A2:** G-511 hat fuenf Metadatenfelder
// eingespielt, die keine Naehrstoffziele sind. Sie standen nicht in
// dieser Liste und wurden als Naehrstoffe gezaehlt — 12 statt 7, das
// Gate war rot. Selbst gemessen gegen die laufende Datenbank:
//
//     phase_id               uuid      welche Phase die Zeile erklaert
//     zielrate_pct_kg_woche  numeric   die gespeicherte Groesse nach E1
//     body_weight_kg         numeric   das Gewicht, mit dem gerechnet wurde
//     tdee_herkunft          text      formula oder adaptive
//     tdee_history_id        uuid      welcher Reihenwert benutzt wurde
//
// `[read]` **Keines davon traegt ein persoenliches Naehrstoffziel**, und
// keines kann gegen eine wissenschaftliche Referenz gehalten werden.
// Es sind Angaben DARUEBER, wie die Zielzeile entstand — ein
// Rechenprotokoll, keine Zielmenge. **`body_weight_kg` endet auf eine
// Einheit und ist trotzdem kein Naehrstoff**: deshalb entscheidet hier
// eine benannte Liste und keine Namensregel.
const KEINE_NAEHRSTOFFSPALTEN = [
  // Schluessel und Zeitachse
  'user_id', 'gueltig_ab', 'created_at', 'updated_at',
  // Herkunft und Notiz der Zielzeile
  'herkunft', 'tdee', 'nutrition_goal', 'notiz',
  // G-511, eingespielt 2026-09-29: das Rechenprotokoll der Zielzeile
  'phase_id', 'zielrate_pct_kg_woche', 'body_weight_kg',
  'tdee_herkunft', 'tdee_history_id',
];

const SQL = `
select column_name
from information_schema.columns
where table_schema = 'goals'
  and table_name = 'nutrition_targets'
  and column_name not in (${KEINE_NAEHRSTOFFSPALTEN.map((s) => `'${s}'`).join(',')})
order by column_name;
`;

// Erlaubt eine Gegenprobe gegen eine WEGWERF-Datenbank, ohne die
// laufende anzufassen: node zwei-wahrheiten-pruefen.mjs --db <name>
const dbIndex = process.argv.indexOf('--db');
const DATENBANK = dbIndex !== -1 ? process.argv[dbIndex + 1] : 'postgres';

let ausgabe;
try {
  ausgabe = execFileSync('docker', [
    'exec', 'supabase_db_LumeOS-Claude-V1',
    'psql', '-U', 'postgres', '-d', DATENBANK, '-t', '-A', '-c', SQL,
  ], { encoding: 'utf8', windowsHide: true });
} catch (e) {
  console.log('[zwei-wahrheiten] uebersprungen: Datenbank nicht erreichbar.');
  process.exit(0);
}

const spalten = ausgabe.split('\n').map((z) => z.trim()).filter(Boolean);
const zahl = spalten.length;

if (zahl === 0) {
  console.log('[zwei-wahrheiten] uebersprungen: keine Spalten gefunden.');
  process.exit(0);
}

if (zahl > SOLL_NAEHRSTOFFSPALTEN) {
  console.error(`[zwei-wahrheiten] ROT: ${zahl} Naehrstoffspalten in ` +
                `goals.nutrition_targets, Soll ${SOLL_NAEHRSTOFFSPALTEN}.`);
  console.error('');
  console.error('  Gezaehlt werden diese Spalten:');
  for (const s of spalten) console.error(`      ${s}`);
  console.error('');
  console.error('  ERST PRUEFEN, WELCHER FALL VORLIEGT:');
  console.error('');
  console.error('  (a) Eine neue Spalte traegt ein persoenliches');
  console.error('      Naehrstoffziel. Dann ist es der Fall, fuer den');
  console.error('      dieser Waechter da ist: G-261 pruefen, denn die');
  console.error('      Vergleichsfunktionen sind gebaut und an nichts');
  console.error('      gehaengt. Wenn die Abweichungen zunehmen, ist eine');
  console.error('      Achse mit Vermerk nicht mehr genug (Massstab');
  console.error('      G-218). DANACH das SOLL hier anheben.');
  console.error('');
  console.error('  (b) Eine neue Spalte ist KEIN Naehrstoffziel, sondern');
  console.error('      Herkunft, Schluessel oder Rechenprotokoll. Dann');
  console.error('      gehoert sie in KEINE_NAEHRSTOFFSPALTEN, mit einem');
  console.error('      Satz dazu, warum. Das SOLL bleibt.');
  console.error('');
  console.error('  Das SOLL anzuheben, weil die Zahl gestiegen ist, ist');
  console.error('  in beiden Faellen falsch.');
  process.exit(1);
}

console.log(`[zwei-wahrheiten] gruen: ${zahl} Naehrstoffspalten, Soll ` +
            `${SOLL_NAEHRSTOFFSPALTEN}. G-261 bleibt zurueckgestellt.`);
