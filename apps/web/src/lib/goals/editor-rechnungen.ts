// Die drei Rechnungen des Phasen-Editors — G-539. **Server-frei.**
//
// `[read]` **Der Auftrag: „Die gehoeren server-frei in `lib/goals/`,
// nicht in die Komponente — wie `ziel-regeln.ts`, damit beide Seiten
// dieselbe Rechnung nutzen."**
//
// `[cmd]` **Die vierte Rechnung, `anchor`, steht schon in
// `anker.ts`** (G-544) — **sie wird hier BENUTZT, nicht nachgebaut.**
// `[read]` **Zwei Rechnungen fuer dasselbe gehen auseinander.**

// ══ 1 · CYCLING ════════════════════════════════════════════════════
//
// `[cmd]` **`module-goals-editor.jsx:152-169`:**
//
//     „Set the per-day delta from TDEE. The weekly average is
//      computed from your actual training-day count."
//
// `[cmd]` **Der Entwurf rechnet `(5 × 200 + 2 × -300) / 7`**
// (`:164`) **und zeigt `+57 kcal/day`:**
//
//     (5 × 200) + (2 × -300)  =  1000 - 600  =  400
//     400 / 7                 =  57,142…     -> 57
//
// `[read]` **Die Ruhetage sind `7 − Trainingstage`**, keine eigene
// Eingabe — sonst koennten beide auseinandergehen.

export type Zyklus = {
  /** Delta vom TDEE an Trainingstagen, kcal. */
  training: number
  /** Delta vom TDEE an Ruhetagen, kcal. */
  ruhe: number
  /** Trainingstage je Woche, 0..7. */
  trainingstage: number
}

export type Zyklusergebnis = {
  /** Das gerundete Wochenmittel, kcal/Tag. */
  wochenmittel: number
  ruhetage: number
  /** `TDEE + Wochenmittel`, oder `null` ohne TDEE. */
  effektiv: number | null
  /** Warum kein Ergebnis — `null`, wenn eines vorliegt. */
  grund: string | null
}

/**
 * Das Wochenmittel aus Trainings- und Ruhetagsdelta.
 *
 * `[read]` **Ohne TDEE bleibt `effektiv` leer** — eine Zahl ohne
 * Bezugsgroesse waere eine Behauptung (E-72).
 */
export function zyklusmittel(z: Zyklus, tdee: number | null): Zyklusergebnis {
  const leer = (grund: string): Zyklusergebnis => ({
    wochenmittel: 0, ruhetage: 0, effektiv: null, grund,
  })

  if (!Number.isInteger(z.trainingstage) || z.trainingstage < 0
      || z.trainingstage > 7) {
    return leer('Trainingstage liegen zwischen 0 und 7.')
  }
  if (!Number.isFinite(z.training) || !Number.isFinite(z.ruhe)) {
    return leer('Die Tagesdeltas muessen Zahlen sein.')
  }

  const ruhetage = 7 - z.trainingstage
  const summe = z.trainingstage * z.training + ruhetage * z.ruhe
  const wochenmittel = Math.round(summe / 7)

  return {
    wochenmittel,
    ruhetage,
    effektiv: tdee !== null && Number.isFinite(tdee)
      ? Math.round(tdee) + wochenmittel
      : null,
    grund: null,
  }
}

// ══ 2 · ANNUAL ═════════════════════════════════════════════════════
//
// `[cmd]` **`module-goals-editor.jsx:336`:** *„Total must sum to 12
// months."*
//
// `[cmd]` **Der Balken des Entwurfs** (`:339-345`): LEAN BULK 4 ·
// MAINT 2 · CONTEST PREP 4 · PEAK 1 · REVERSE 1 — **Summe 12.**
//
// `[read]` **Ein Plan, dessen Monate nicht 12 ergeben, ist kaputt** —
// und das muss dastehen, nicht stillschweigend gerundet werden.

export const JAHRESMONATE = 12

export type Jahresblock = {
  phase: string
  monate: number
}

export type Jahresbefund = {
  summe: number
  stimmt: boolean
  /** Wie viele Monate fehlen (negativ: zu viele). */
  differenz: number
  /** Ein Satz, wenn die Summe nicht stimmt. */
  satz: string | null
}

/**
 * Prueft die Monatssumme eines Jahresplans.
 *
 * `[read]` **Der Satz sagt, was zu tun ist**, nicht was falsch ist:
 * *„zwei Monate fehlen"* statt *„Summe ungueltig"*.
 */
export function pruefeJahresplan(bloecke: Jahresblock[]): Jahresbefund {
  const summe = bloecke.reduce(
    (s, b) => s + (Number.isFinite(b.monate) ? b.monate : 0), 0)
  const differenz = JAHRESMONATE - summe
  if (differenz === 0) {
    return { summe, stimmt: true, differenz: 0, satz: null }
  }
  return {
    summe, stimmt: false, differenz,
    satz: differenz > 0
      ? `Noch ${differenz} ${differenz === 1 ? 'Monat' : 'Monate'} zu verteilen.`
      : `${-differenz} ${-differenz === 1 ? 'Monat' : 'Monate'} zu viel.`,
  }
}

// ══ 3 · DER OVERRIDE ═══════════════════════════════════════════════
//
// `[cmd]` **`module-goals-editor.jsx:56`:** *„Personal override — the
// shipped defaults stay intact."*
//
// `[read]` **Der Editor aendert NICHT den Katalog**, sondern legt eine
// persoenliche Abweichung darueber. `[cmd]` **Die traegt
// `goal_phases.parameters`** — `jsonb NOT NULL DEFAULT '{}'`,
// gemessen 2026-09-30.
//
// ── Warum nur die DIFFERENZ ───────────────────────────────────────
//
// `[read]` **Der Auftrag: „Wer den ganzen Satz hineinschreibt, friert
// den Katalogstand von heute bei jedem Nutzer ein — und eine spaetere
// Korrektur am Katalog erreicht keinen mehr."**
//
// `[cmd]` **Das ist keine Sorge auf Vorrat:** G-545 hat den Katalog
// am 2026-09-30 nachgefuellt — `guards` von 7 auf 17 Zeilen, `exits`
// von 1 auf 7. **Wer vorher den ganzen Satz kopiert haette, saehe
// diese Korrektur nie.**

/** Ein Wert, wie ihn der Editor fuehrt. */
export type Overridewert = string | number | boolean | null

/**
 * Was sich gegenueber der Auslieferung geaendert hat.
 *
 * `[read]` **Gleich heisst: faellt heraus.** **Nicht `undefined`
 * schreiben und nicht `null`** — ein Schluessel mit `null` waere die
 * Aussage *„ausdruecklich leer"*, und die ist etwas anderes als
 * *„unveraendert"*.
 *
 * `[read]` **Ein Wert, den der Katalog GAR NICHT fuehrt, bleibt
 * drin** — er ist per Definition eine Abweichung.
 *
 * @param katalog  Die Auslieferungswerte aus `goal_strategies`.
 * @param entwurf  Was im Editor steht.
 */
export function nurAbweichung(
  katalog: Record<string, Overridewert>,
  entwurf: Record<string, Overridewert>,
): Record<string, Overridewert> {
  const raus: Record<string, Overridewert> = {}
  for (const [k, v] of Object.entries(entwurf)) {
    // `[read]` **Ein leeres Feld ist keine Aenderung.** Der Auftrag:
    // *„Ein Editor, der ein leeres Feld als `0` anzeigt, schreibt
    // beim Speichern eine erfundene Null in den Override."*
    if (v === null || v === '') continue
    if (Object.prototype.hasOwnProperty.call(katalog, k) && katalog[k] === v) {
      continue
    }
    raus[k] = v
  }
  return raus
}

/**
 * Der geltende Wert: Override vor Katalog.
 *
 * `[read]` **Die Rangfolge ist die Aussage** — der Nutzer gewinnt,
 * und wo er nichts gesagt hat, gilt die Auslieferung.
 */
export function geltenderWert(
  katalog: Record<string, Overridewert>,
  override: Record<string, Overridewert>,
  feld: string,
): Overridewert {
  if (Object.prototype.hasOwnProperty.call(override, feld)) {
    return override[feld]
  }
  return Object.prototype.hasOwnProperty.call(katalog, feld)
    ? katalog[feld]
    : null
}

/**
 * Wie viele Felder weichen ab?
 *
 * `[read]` **Der Kopf des Editors zeigt das** — sonst sieht ein
 * Override mit einer Aenderung aus wie einer mit zwanzig.
 */
export function abweichungszahl(
  override: Record<string, Overridewert>,
): number {
  return Object.keys(override).length
}

// ══ 4 · DIE SCHWELLE AUS EINEM WAECHTERTEXT ════════════════════════
//
// `[cmd]` **Der Entwurf liest sie per Regex** (`:444`):
// `g.match(/([\d.]+)/)` — **die erste Zahl im Text.**
//
// `[cmd]` **Die Katalogtexte tragen sie**, gemessen 2026-09-30:
//
//     strength_loss > 10% → reduce deficit           -> 10
//     weekly_loss > 1.0kg → +150 kcal                -> 1.0
//     Gewichtsverlust > 2 %/Woche -> warning         -> 2
//
// `[read]` **Gelesen wird sie, damit sie ANGEZEIGT werden kann** —
// **ob sie sich auch VERSTELLEN laesst, ist eine andere Frage**, und
// die Antwort steht im Bericht: `pruefeWaechter` (G-520) nimmt keine
// Schwelle entgegen, seine Grenzen stehen als Konstanten in der Spec.

/** Die erste Zahl eines Waechtertextes, wie im Entwurf. */
export function schwelleAusText(text: string): number | null {
  const m = /(\d+(?:[.,]\d+)?)/.exec(text)
  if (!m) return null
  const n = Number(m[1].replace(',', '.'))
  return Number.isFinite(n) ? n : null
}
