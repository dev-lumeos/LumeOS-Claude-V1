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
