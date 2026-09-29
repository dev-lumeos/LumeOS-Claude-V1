// Das Scoring-Paket — reine Funktionen, kein I/O.
//
// `[cmd]` **`SPEC_09_SCORING.md:7-11`:** *„Alle Scores sind Pure
// Functions … Implementierungsort: `packages/scoring/src/nutrition.ts`"*.
export {
  STUFEN_FAKTOR, GEWICHT,
  istStufe, stufenFaktor, nutritionScore,
} from './nutrition'
export type {
  Stufe, Makro, Tageswerte, Ziele, Anteil, ScoreErgebnis,
} from './nutrition'

// ── G-522/A3: die Form eines Modulbeitrags ───────────────────────
//
// `[cmd]` **G-522 hat zwei Bauarten ohne Vertrag gemessen** —
// nutrition in TypeScript, recovery in SQL. `[read]` **Der Vertrag
// liegt hier, damit der dritte Beitrag keine dritte Bauart wird.**
export {
  BEITRAGSMODULE, CONTRIBUTION_WEIGHTS, ZIELTYP_RUECKFALL,
  berechneZielfortschritt, giltFuerBilanz, alsModulbeitrag,
} from './beitrag'
export type {
  Beitragsmodul, Modulbeitrag, Zielfortschritt, Fortschrittsstatus,
} from './beitrag'
