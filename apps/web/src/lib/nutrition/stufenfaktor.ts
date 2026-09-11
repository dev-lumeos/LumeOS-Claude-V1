// Der Stufenfaktor des Nutrition score — G-412, G-417.
//
// ══ DIESE DATEI ENTSCHEIDET NICHTS MEHR ════════════════════════════
//
// `[cmd]` **Die Faktoren stehen in `@lumeos/scoring`** — dem Ort, den
// `SPEC_09_SCORING.md:11` nennt. `[read]` **Hier haengt nur noch der
// Entwurf dran**, der dieselbe Tabelle fuer seine Attrappenzahlen
// benutzt.
//
// `[cmd]` **Bis G-417 stand hier eine ZWEITE Tabelle** — mit
// `advanced 1.00` und `pro: null`. **E-80 sagt `advanced 0.90` und
// `pro 1.00`.**
//
// `[read]` **Zwei Tabellen, die sich widersprechen, und eine davon
// ohne Aufrufer** — genau die Sorte toter Code, die eine alte Regel
// konserviert, bis sie jemand fuer die geltende haelt.
//
// `[read]` **Deshalb wird hier nur noch WEITERGEREICHT.** Wer die
// Faktoren aendern will, aendert sie im Paket, und beide Seiten
// folgen.
//
// ══ WARUM DIE DATEI TROTZDEM BLEIBT ════════════════════════════════
//
// `[cmd]` **`diary-entwurf.tsx` traegt `'use client'`.** `[cmd]` **Ein
// WERT-Import ueber diese Grenze zieht den Client-Baum in den Server
// und faellt zur Laufzeit um:**
//
//     TypeError: stufenFaktor is not a function
//
// `[cmd]` **Am Schirm gemessen: 0 Karten, zweimal dieselbe Ausnahme.**
// `[read]` **`tsc` blieb dabei gruen** — der Typ stimmt ja.
import { STUFEN_FAKTOR, stufenFaktor as faktorAusPaket, istStufe } from '@lumeos/scoring'

/**
 * Die Faktoren — **weitergereicht, nicht entschieden.**
 *
 * `[cmd]` **E-80:** `beginner 0,75 · advanced 0,90 · pro 1,00 ·
 * elite 1,10`.
 */
export const LEVEL_MULT: Record<string, number | null> = { ...STUFEN_FAKTOR }

/**
 * Der Stufenfaktor, oder `null` bei unbekanntem Namen.
 *
 * `[read]` **Kein geratener Ersatzwert** — der alte Rueckfall
 * `?? 0.90` gab einem `pro`-Nutzer den Faktor von `intermediate`
 * (G-283). **Kein Absturz, keine Meldung, nur ein falscher Wert.**
 */
export function stufenFaktor(level: string): number | null {
  return faktorAusPaket(level)
}

/** Kennt die Tabelle den Namen ueberhaupt? */
export function stufeGilt(level: string): boolean {
  return istStufe(level)
}

// `[cmd]` **G-417: `STUFE_OFFEN_SATZ` ist entfallen.** `[read]` **Er
// sagte, fuer eine gueltige Stufe sei kein Faktor entschieden** — seit
// E-80 gibt es fuer alle vier einen. **Ein Satz fuer einen Fall, den
// es nicht mehr gibt, wird irgendwann auf einen anderen angewendet.**

export const STUFE_UNBEKANNT_SATZ =
  'Unbekannte Erfahrungsstufe — der Score wird nicht berechnet, '
  + 'statt einen Faktor zu raten.'

/**
 * Der Score des Entwurfs, oder `null`.
 *
 * `[read]` **Dies ist die Rechnung der ATTRAPPE** — sie bekommt fertige
 * Deckungen und multipliziert den Score. `[cmd]` **Der angebundene Weg
 * rechnet anders** (`nutritionScore()` im Paket skaliert die ZIELE,
 * wie `SPEC_09:33-40` es verlangt) — **und er ist der, der zaehlt.**
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
