#!/usr/bin/env node
// Zwei Wahrheiten je Naehrstoff - Waechter statt Anbindung.
//
// G-250/G-261, 2026-08-29: goals.nutrition_targets traegt sechs
// Naehrstoffspalten. Drei davon haben zusaetzlich eine wissenschaftliche
// Referenz, und genau eine geht auseinander: F18:3CN3 ist gegen das
// persoenliche Ziel gedeckt und gegen EFSA zu wenig.
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

const SOLL_NAEHRSTOFFSPALTEN = 6;

const SQL = `
select count(*)
from information_schema.columns
where table_schema = 'goals'
  and table_name = 'nutrition_targets'
  and column_name not in ('user_id','gueltig_ab','herkunft','tdee',
                          'nutrition_goal','notiz','created_at','updated_at');
`;

let ausgabe;
try {
  ausgabe = execFileSync('docker', [
    'exec', 'supabase_db_LumeOS-Claude-V1',
    'psql', '-U', 'postgres', '-d', 'postgres', '-t', '-A', '-c', SQL,
  ], { encoding: 'utf8', windowsHide: true });
} catch (e) {
  console.log('[zwei-wahrheiten] uebersprungen: Datenbank nicht erreichbar.');
  process.exit(0);
}

const zahl = Number.parseInt(ausgabe.trim(), 10);
if (!Number.isFinite(zahl)) {
  console.log('[zwei-wahrheiten] uebersprungen: keine Zahl aus der Abfrage.');
  process.exit(0);
}

if (zahl > SOLL_NAEHRSTOFFSPALTEN) {
  console.error(`[zwei-wahrheiten] ROT: ${zahl} Naehrstoffspalten in ` +
                `goals.nutrition_targets, Soll ${SOLL_NAEHRSTOFFSPALTEN}.`);
  console.error('');
  console.error('  Mehr persoenliche Ziele heisst mehr Naehrstoffe, die');
  console.error('  gleichzeitig ein Goal und eine wissenschaftliche Referenz');
  console.error('  tragen - und damit mehr Faelle, in denen beide Achsen');
  console.error('  auseinandergehen koennen.');
  console.error('');
  console.error('  G-261 pruefen: die Vergleichsfunktionen sind gebaut und');
  console.error('  an nichts gehaengt. Wenn die Abweichungen zunehmen, ist');
  console.error('  eine Achse mit Vermerk nicht mehr genug (Massstab G-218).');
  console.error('');
  console.error('  Danach SOLL hier anheben.');
  process.exit(1);
}

console.log(`[zwei-wahrheiten] gruen: ${zahl} Naehrstoffspalten, Soll ` +
            `${SOLL_NAEHRSTOFFSPALTEN}. G-261 bleibt zurueckgestellt.`);
