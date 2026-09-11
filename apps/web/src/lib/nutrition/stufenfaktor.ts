// Der Stufenfaktor des Nutrition score — G-412.
//
// ══ WARUM DIESE DATEI ENTSTANDEN IST ═══════════════════════════════
//
// `[cmd]` **Die Tabelle stand in `diary-entwurf.tsx`, und die traegt
// `'use client'`.** `[cmd]` **Die angebundene Kachel ist eine
// SERVER-Komponente** — ein WERT-Import ueber diese Grenze zieht den
// Client-Baum in den Server und faellt zur Laufzeit um:
//
//     TypeError: stufenFaktor is not a function
//
// `[cmd]` **Am Schirm gemessen: 0 Karten, zweimal dieselbe Ausnahme.**
// `[read]` **`tsc` blieb dabei gruen** — der Typ stimmt ja.
// (Dieselbe Klasse wie G-402 und G-388.)
//
// `[read]` **Deshalb liegt die Tabelle jetzt in `lib/`** — ohne
// `'use client'`, von beiden Seiten benutzbar. **Die Entscheidungen
// darin sind unveraendert aus G-283 uebernommen.**
//
// ══ DIE ENTSCHEIDUNG AUS G-283, UNVERAENDERT ═══════════════════════
//
// `[cmd]` **Die Datenbank kennt `beginner | advanced | pro | elite`**
// (CHECK auf `public.profiles.experience_level`).
//
// `[read]` **Der alte Rueckfall `?? 0.90` gab einem `pro`-Nutzer den
// Faktor von `intermediate`** — kein Absturz, keine Meldung, nur ein
// falscher Wert.
//
// `[cmd]` **`pro` hat keinen belegten Faktor** (G-228, gehoert Tom) —
// deshalb `null` und nicht geraten.
export const LEVEL_MULT: Record<string, number | null> = {
  beginner: 0.75,
  advanced: 1.00,
  elite: 1.10,
  // `[read]` **Offen bis G-228.** `null` heisst: der Name gilt, der
  // Faktor ist nicht entschieden.
  pro: null,
}

/**
 * Der Stufenfaktor, oder `null`.
 *
 * `[read]` **Drei Faelle, nicht zwei:**
 *
 *     Zahl    der Name gilt und sein Faktor ist belegt
 *     null    der Name gilt, der Faktor ist offen (`pro`, G-228)
 *     null    der Name ist unbekannt — und dann sagt es die Anzeige
 */
export function stufenFaktor(level: string): number | null {
  return LEVEL_MULT[level] ?? null
}

/** Kennt die Tabelle den Namen ueberhaupt? */
export function stufeGilt(level: string): boolean {
  return Object.prototype.hasOwnProperty.call(LEVEL_MULT, level)
}

export const STUFE_OFFEN_SATZ =
  'Für diese Erfahrungsstufe ist kein Faktor hinterlegt — der Score '
  + 'bleibt offen, bis er entschieden ist (G-228).'

export const STUFE_UNBEKANNT_SATZ =
  'Unbekannte Erfahrungsstufe — der Score wird nicht berechnet, '
  + 'statt einen Faktor zu raten.'

/**
 * Der Score, oder `null`.
 *
 * `[read]` **Kein stiller Ersatzwert** — wer keinen Faktor hat,
 * bekommt keinen Score, und die Anzeige sagt warum.
 */
export function nutritionScore(
  c: { protein: number; calorie: number; carbs: number; fat: number; fiber: number },
  level: string,
): number | null {
  const f = stufenFaktor(level)
  if (f === null) return null
  const raw = c.protein * 0.30 + c.calorie * 0.25 + c.carbs * 0.15
    + c.fat * 0.15 + c.fiber * 0.15
  return Math.round(raw * f * 100) / 100
}
