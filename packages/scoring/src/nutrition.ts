// Der Nutrition-Score — G-417/A2, E-80.
//
// ══ WARUM DIESES PAKET ENTSTEHT ════════════════════════════════════
//
// `[cmd]` **`SPEC_09_SCORING.md:11` nennt den Ort:**
// *„Implementierungsort: `packages/scoring/src/nutrition.ts`"*.
//
// `[cmd]` **Codex hat in C-464 gemessen, dass es das Paket nicht
// gibt** — und ausdruecklich NICHT gebaut: *„Die Faktoren sind reine
// Score-Regeln … Eine Modultabelle waere falsch; C-464 baut die
// Faktoren nicht."*
//
// `[read]` **Also hier.** `[read]` **Und nicht in der Datenbank:**
// die Faktoren sind eine Regel, kein Zustand — sie haengen an keinem
// Nutzer und aendern sich nicht je Zeile.
//
// ══ DIE VIER FAKTOREN: E-80 GEGEN DIE SPEC ═════════════════════════
//
// `[cmd]` **Die Spec (`:441-445`) nennt:**
//
//     beginner 0,75 · intermediate 0,90 · advanced 1,00 · elite 1,10
//
// `[cmd]` **E-80 (2026-09-11) nennt:**
//
//     beginner 0,75 · advanced 0,90 · pro 1,00 · elite 1,10
//
// `[cmd]` **Und die Datenbank entscheidet die Frage:** der CHECK auf
// `public.profiles.experience_level` erlaubt
// `beginner | advanced | pro | elite`. **`intermediate` gibt es
// nicht.**
//
// `[read]` **E-80 ist juenger UND passt zum Schema** — die Spec-Liste
// stammt aus einer Zeit mit anderen Stufennamen. `[read]` **Ein
// `intermediate` hier waere ein Faktor fuer einen Wert, den niemand
// haben kann.**
//
// ══ WAS SICH GEGENUEBER DER ALTEN RECHNUNG AENDERT ═════════════════
//
// `[cmd]` **Die Spec skaliert die ZIELE, nicht den Score**
// (`:33-40`) — `adj = ziel * faktor`. `[cmd]` **Die alte Fassung in
// `lib/nutrition/stufenfaktor.ts` multiplizierte den fertigen Score.**
//
// `[read]` **Das ist nicht dasselbe:** ein `beginner` bekommt ein
// leichteres Ziel und kann es voll erfuellen — bei der alten
// Rechnung war sein Hoechstwert 0,75. **Die Spec belohnt Erfuellung,
// die alte Fassung bestrafte die Stufe.**
//
// `[cmd]` **Und die Kalorien zaehlen BEIDSEITIG** (`:48-51`):
// zu viel ist genauso eine Abweichung wie zu wenig. `[read]` **Bei
// den anderen vier ist mehr kein Fehler** — deshalb dort `min(…, 1)`.

/** Die vier Stufen, die `public.profiles.experience_level` erlaubt. */
export type Stufe = 'beginner' | 'advanced' | 'pro' | 'elite'

/**
 * Die Faktoren aus E-80.
 *
 * `[read]` **Vier Werte, vier Faktoren** — kein `intermediate`, und
 * kein Rueckfall fuer unbekannte Namen.
 */
export const STUFEN_FAKTOR: Record<Stufe, number> = {
  beginner: 0.75,
  advanced: 0.90,
  pro: 1.00,
  elite: 1.10,
}

/** Kennt E-80 diesen Namen? */
export function istStufe(wert: string | null | undefined): wert is Stufe {
  return wert !== null && wert !== undefined
    && Object.prototype.hasOwnProperty.call(STUFEN_FAKTOR, wert)
}

/**
 * Der Faktor, oder `null` bei unbekanntem Namen.
 *
 * `[read]` **Kein stiller Ersatzwert** — ein geratener Faktor saehe
 * aus wie eine Antwort (die Lehre aus G-283).
 */
export function stufenFaktor(wert: string | null | undefined): number | null {
  return istStufe(wert) ? STUFEN_FAKTOR[wert] : null
}

/** Die Gewichte aus `SPEC_09_SCORING.md:53-59`. Summe 1,00. */
export const GEWICHT = {
  protein: 0.30,
  calorie: 0.25,
  carbs: 0.15,
  fat: 0.15,
  fiber: 0.15,
} as const

export type Makro = keyof typeof GEWICHT

/** Die Tageswerte aus `nutrition.daily_summary`. */
export type Tageswerte = {
  enercc: number | null
  prot625: number | null
  cho: number | null
  fat: number | null
  fibt: number | null
}

/** Die Ziele aus `goals.nutrition_targets`. */
export type Ziele = {
  kcal: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  /** `[cmd]` **Seit C-464 vorhanden** — vorher die fuenfte Sperre. */
  fiber_g: number | null
}

/** Ein Anteil der Formel, mit seiner Herkunft. */
export type Anteil = {
  makro: Makro
  gewicht: number
  ist: number | null
  /** Das Ziel NACH dem Stufenfaktor. */
  ziel: number | null
  /** 0 bis 1. `null`, wenn Ist oder Ziel fehlt. */
  erfuellung: number | null
  /** Warum keine Erfuellung — nur wenn `erfuellung === null`. */
  grund?: string
}

export type ScoreErgebnis = {
  /** 0 bis 100. `null`, wenn kein Faktor oder gar kein Anteil taugt. */
  score: number | null
  status: 'ok' | 'warn' | 'block' | 'offen'
  anteile: Anteil[]
  /** Summe der Gewichte, die gerechnet werden konnten. */
  gewichtGerechnet: number
  /** Die Stufe aus dem Profil, unveraendert. */
  stufe: string | null
  faktor: number | null
}

const FELD: Record<Makro, { ist: keyof Tageswerte, ziel: keyof Ziele }> = {
  protein: { ist: 'prot625', ziel: 'protein_g' },
  calorie: { ist: 'enercc', ziel: 'kcal' },
  carbs: { ist: 'cho', ziel: 'carbs_g' },
  fat: { ist: 'fat', ziel: 'fat_g' },
  fiber: { ist: 'fibt', ziel: 'fiber_g' },
}

/**
 * Der Score eines Tages.
 *
 * `[read]` **Eine reine Funktion** — gleiche Eingaben, gleiches
 * Ergebnis, kein I/O (`SPEC_09:7-11`).
 *
 * `[read]` **Der Score wird auf das GERECHNETE Gewicht normiert** —
 * fehlt ein Ziel, zieht der fehlende Anteil den Wert nicht nach
 * unten. **Sonst saehe eine Datenluecke aus wie schlechtes Essen.**
 */
export function nutritionScore(
  ist: Tageswerte, ziele: Ziele, stufe: string | null | undefined,
): ScoreErgebnis {
  const faktor = stufenFaktor(stufe)

  const anteile: Anteil[] = (Object.keys(GEWICHT) as Makro[]).map(makro => {
    const gewicht = GEWICHT[makro]
    const istWert = ist[FELD[makro].ist]
    const zielRoh = ziele[FELD[makro].ziel]

    // `[cmd]` **Die Spec skaliert das ZIEL** (`:33-40`).
    const ziel = zielRoh !== null && faktor !== null ? zielRoh * faktor : null

    let grund: string | undefined
    if (faktor === null) grund = 'kein Stufenfaktor'
    else if (istWert === null) grund = 'kein Tageswert'
    else if (zielRoh === null) grund = 'kein Ziel hinterlegt'

    let erfuellung: number | null = null
    if (istWert !== null && ziel !== null && ziel > 0) {
      erfuellung = makro === 'calorie'
        // `[cmd]` **Beidseitig** (`:48-51`): zu viel zaehlt wie zu
        // wenig. `[read]` **Bei Kalorien ist Ueberschreiten eine
        // Abweichung**, bei Protein nicht.
        ? Math.max(0, 1 - Math.abs(istWert - ziel) / ziel)
        // `[read]` **Gedeckelt bei 1** — 120 % Protein ist erfuellt,
        // nicht uebererfuellt.
        : Math.min(istWert / ziel, 1)
    }

    return {
      makro, gewicht, ist: istWert, ziel, erfuellung,
      ...(grund ? { grund } : {}),
    }
  })

  const gewichtGerechnet = anteile
    .filter(a => a.erfuellung !== null)
    .reduce((s, a) => s + a.gewicht, 0)

  const score = gewichtGerechnet > 0
    ? Math.max(0, Math.min(100, Math.round(
      anteile.reduce((s, a) => s + (a.erfuellung ?? 0) * a.gewicht, 0)
        / gewichtGerechnet * 100)))
    : null

  // `[cmd]` **Die Schwellen aus `:66`:** ok >= 80, warn 50-79,
  // block < 50.
  const status: ScoreErgebnis['status'] = score === null
    ? 'offen'
    : score >= 80 ? 'ok' : score >= 50 ? 'warn' : 'block'

  return { score, status, anteile, gewichtGerechnet, stufe: stufe ?? null, faktor }
}
