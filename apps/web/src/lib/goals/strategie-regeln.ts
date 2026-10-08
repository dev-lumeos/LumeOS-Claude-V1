// Die Regeln des Strategiekatalogs — **ohne Server-I/O** (A-30).
//
// `[cmd]` **WARUM DIESE DATEI GETRENNT IST.** `strategie-read.ts`
// importiert `createSessionClient`, das `next/headers` braucht. Ein
// **Wert**-Import von dort in eine `'use client'`-Datei zieht die
// ganze Datei ins Browserbuendel und beantwortet die Seite mit
// **HTTP 500** — dieselbe Klasse Fehler wie in G-74 und G-412.
//
// `[read]` **Hier stehen deshalb die Konstanten und die reinen
// Pruefungen, die BEIDE Seiten benutzen duerfen.** Typen kommen per
// `import type` — das ist folgenlos.

import type { Strategie } from './strategie-read'

// ══ G-615: die Strategie-Reiter sind weg ═══════════════════════════
//
// `[cmd]` **Hier standen `REITER` (fuenf fest codierte Reiter, Hybrid =
// hybrid+recovery), `strategienFuerReiter`, `einfacheStrategien`,
// `istWaehlbar` und `merkmale`** — einziger Leser war `strategie-wahl.tsx`
// im Reiter Phase engine. Tom, G-615: Einzelstrategien waehlt man im
// Anlegemodal (G-610), Plaene im Planer; Richtung und Sperre kommen aus
// dem Katalog (`zielwahl.ts`: `auswahl_gruppe`, `min_erfahrung`).

// ══ G-554/A2: von der Strategie zur Phasenart ══════════════════════
//
// `[cmd]` **`goal_phases.phase_type` hat einen CHECK mit neun
// Werten** (gemessen 2026-09-30): `fat_loss`, `lean_bulk`,
// `maintenance`, `recomp`, `contest_prep`, `reverse_diet`,
// `expert_bb_annual`, `mini_cut`, `peak_week`.
//
// `[cmd]` **Der Strategiecode ist NICHT derselbe Schluessel** — von
// 17 Codes sind nur sechs zugleich Phasenarten. **Die Bruecke ist
// `category`**, und die Zuordnung ist gemessen, nicht geraten:
//
//     fat_loss     -> fat_loss       5 Zeilen
//     muscle_gain  -> lean_bulk      4
//     hybrid       -> maintenance    2  (maintain, body_recomp)
//     contest_prep -> contest_prep   2
//     recovery     -> reverse_diet   1
//     expert       -> expert_bb_annual 3
//
// `[read]` **Zwei Codes sind die Ausnahme:** `mini_cut` und
// `peak_week` liegen unter `fat_loss` bzw. `contest_prep`, **sind
// aber selbst eigene Phasenarten** — fuer sie gewinnt der Code.
//
// `[read]` **`body_recomp` faellt auf `maintenance`, nicht auf
// `recomp`** — die Kategorie sagt `hybrid`, und `recomp` verlangt
// laut CHECK eine NULL-Rate wie `maintenance`. **Waere `recomp`
// gemeint, muesste die Katalogzeile es sagen.**

const KATEGORIE_ZU_PHASE: Record<string, string> = {
  fat_loss: 'fat_loss',
  muscle_gain: 'lean_bulk',
  hybrid: 'maintenance',
  contest_prep: 'contest_prep',
  recovery: 'reverse_diet',
  expert: 'expert_bb_annual',
}

/** Die neun Werte des CHECK `goal_phases.phase_type`. */
export const PHASENARTEN_CHECK = [
  'fat_loss', 'lean_bulk', 'maintenance', 'recomp', 'contest_prep',
  'reverse_diet', 'expert_bb_annual', 'mini_cut', 'peak_week',
] as const

/**
 * Welche Phasenart gehoert zu diesem Strategiecode?
 *
 * `[read]` **Erst der Code selbst** — ist er eine Phasenart, gewinnt
 * er (`mini_cut`, `peak_week`). **Sonst die Kategorie.**
 *
 * @param code       Der Strategiecode.
 * @param kategorie  Die Kategorie derselben Zeile.
 */
export function phasenartFuerStrategie(
  code: string, kategorie: string,
): string | null {
  if ((PHASENARTEN_CHECK as readonly string[]).includes(code)) return code
  return KATEGORIE_ZU_PHASE[kategorie] ?? null
}

export function tdeeProzent(s: Strategie): string | null {
  if (s.tdee_modifier === null) return null
  const p = Math.round(s.tdee_modifier * 100)
  return `${p > 0 ? '+' : ''}${p} %`
}
