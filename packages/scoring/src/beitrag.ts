// Der Vertrag fuer einen Modulbeitrag — G-522/A3.
//
// ══ WARUM ES IHN GIBT ══════════════════════════════════════════════
//
// `[cmd]` **G-522 hat zwei Bauarten gemessen, ohne Vertrag
// dazwischen:**
//
//     nutrition   TypeScript, packages/scoring/src/nutrition.ts
//     recovery    SQL, recovery.scores mit sieben Teilscores
//
// `[read]` **Wer den naechsten Beitrag schreibt, ohne dass die Form
// feststeht, erzeugt die dritte Bauart.** **Deshalb kommt die Form
// zuerst.**
//
// `[read]` **Diese Datei legt NICHTS fest, was die Spec nicht sagt.**
// Jede Festlegung traegt ihre Stelle.
//
// ══ DREI FRAGEN, UND NUR DIESE DREI ════════════════════════════════
//
//   WAS   liefert ein Modul (Wert, Einheit, Wertebereich)
//   WANN  gilt er (welcher Tag, welche Zeitzone, was bei Luecken)
//   WAS   heisst „kein Wert"
//
// `[read]` **Die dritte ist die, an der es schiefgeht.** `[cmd]`
// **G-524 belegt den Unterschied:** `test-user` hat KEINE TDEE-Reihe
// — nicht eine mit Nullen. **Eine 0 ist ein Ergebnis, ein `null` ist
// keins.**
//
// Reine Typen und reine Funktionen. Kein I/O.

/**
 * Die fuenf Module, die einen Beitrag liefern.
 *
 * `[cmd]` **`docs/specs/Goals/DATABASE.md:149-150`** — der CHECK auf
 * `goal_contributions.module`:
 *
 *     CHECK (module IN ('nutrition','training','recovery',
 *                       'supplements','medical'))
 */
export const BEITRAGSMODULE = [
  'nutrition', 'training', 'recovery', 'supplements', 'medical',
] as const

export type Beitragsmodul = typeof BEITRAGSMODULE[number]

/**
 * WAS ein Modul liefert.
 *
 * `[cmd]` **`DATABASE.md:152`:** `contribution_score NUMERIC(5,2)`
 * mit dem Kommentar `-- 0–100`.
 *
 * `[cmd]` **`DATABASE.md:155-160`:** dazu ein `details`-Objekt, je
 * Modul verschieden belegt.
 *
 * `[read]` **`score: null` heisst NICHT 0.** **Es heisst: fuer
 * diesen Tag laesst sich kein Beitrag rechnen** — und `grund` sagt
 * warum. `[cmd]` **`nutrition.ts:129` fuehrt es seit jeher so**
 * (`score: number | null`), **der Vertrag schreibt es nur fest.**
 */
export type Modulbeitrag = {
  modul: Beitragsmodul
  /** Der Tag, fuer den er gilt. ISO, lokale Zeit. */
  tag: string
  /**
   * 0 bis 100, oder `null`.
   *
   * `[read]` **Gerundet wird erst hier**, nicht im Modul — sonst
   * runden fuenf Module fuenfmal verschieden.
   */
  score: number | null
  /** Warum kein Score. Nur gesetzt, wenn `score === null`. */
  grund?: string
  /**
   * Was das Modul sonst beitraegt — je Modul andere Schluessel.
   *
   * `[cmd]` **`DATABASE.md:156-160` nennt sie je Modul**, z. B.
   * Nutrition: `{compliance_score, protein_g, calories,
   * protein_adherence_pct}`.
   */
  details: Record<string, unknown>
}

/**
 * WANN ein Beitrag gilt — und was mit Zukunft geschieht.
 *
 * ══ DIE DATENAUFFAELLIGKEIT, DIE DEN VERTRAG BRAUCHT ═══════════════
 *
 * `[cmd]` **Gemessen 2026-09-28: `recovery.scores` reicht bis
 * 2026-11-06** — **78 von 370 Zeilen liegen in der Zukunft.**
 * Testdaten.
 *
 * `[read]` **Zwei Lesarten, beide vertretbar, nur nicht beide
 * zugleich:** wer ueber `CURRENT_DATE` filtert, sieht sie nicht; wer
 * ohne Filter mittelt, mittelt Zukunft ein.
 *
 * `[cmd]` **DER VERTRAG WAEHLT DIE ERSTE.** `[read]` **Begruendung:
 * ein Beitrag ist eine Aussage ueber einen VERGANGENEN Tag.** Ein
 * Wert fuer morgen kann nicht erfasst worden sein — er ist Seed oder
 * Vorhersage, und beides gehoert nicht in eine Bilanz.
 *
 * `[cmd]` **Auf `test-user@lumeos.local` faellt dabei nichts weg:**
 * 30 Zeilen, davon 0 in der Zukunft. **Auf `dev@lumeos.app` schon.**
 *
 * `[read]` **Die Spec sagt dazu nichts** — `DATABASE.md` kennt nur
 * `contribution_date DATE NOT NULL`. **Das ist eine Festlegung
 * dieses Vertrags, kein Spec-Zitat, und darum hier begruendet.**
 */
export function giltFuerBilanz(tag: string, stichtag: string): boolean {
  return tag <= stichtag
}

// ── A3.3: nutrition hinter den Vertrag ───────────────────────────
//
// `[read]` **`nutritionScore()` bleibt unberuehrt.** `[cmd]` **Es
// rechnet seit jeher auf 0..100 und unterscheidet schon zwischen
// *kein Wert* und *null*** (`nutrition.ts:129`, `score: number |
// null`, dazu `grund` je Anteil).
//
// `[read]` **Deshalb braucht es keine Aenderung, nur eine
// Uebersetzung** — der bestehende Test bleibt gruen, und das ist
// der Beleg.

/** Was `nutritionScore()` zurueckgibt, so weit der Vertrag es braucht. */
type NutritionErgebnis = {
  score: number | null
  gewichtGerechnet: number
  stufe: string | null
  faktor: number | null
  anteile: ReadonlyArray<{ makro: string; erfuellung: number | null; grund?: string }>
}

/**
 * Macht aus einem `nutritionScore()`-Ergebnis einen Modulbeitrag.
 *
 * `[read]` **Kein Rechnen** — die Zahl wird durchgereicht, nicht
 * neu gebildet. **Zwei Kopien derselben Rechenregel driften.**
 *
 * `[cmd]` **`details` folgt `DATABASE.md:156`** (Nutrition:
 * `compliance_score` …), soweit die Werte vorliegen.
 */
export function alsModulbeitrag(
  e: NutritionErgebnis, tag: string,
): Modulbeitrag {
  // `[read]` **Der Grund kommt aus den Anteilen**, nicht aus einem
  // eigenen Satz — dort steht er schon, je Makro.
  const gruende = e.anteile
    .filter(a => a.erfuellung === null && a.grund)
    .map(a => `${a.makro}: ${a.grund}`)

  return {
    modul: 'nutrition',
    tag,
    score: e.score,
    ...(e.score === null
      ? {
        grund: gruende.length
          ? gruende.join(' · ')
          : 'kein Anteil rechenbar',
      }
      : {}),
    details: {
      compliance_score: e.score,
      gewicht_gerechnet: e.gewichtGerechnet,
      stufe: e.stufe,
      faktor: e.faktor,
    },
  }
}

/**
 * Die Gewichtungen je Zieltyp.
 *
 * `[cmd]` **`docs/specs/Goals/SCORING.md:51-56`, unveraendert
 * uebernommen.** Vier Reihen, je fuenf Module.
 *
 * `[read]` **Jede Reihe summiert auf 1,00** — nachgerechnet, und ein
 * Test haelt es fest. **Die Spec sagt es nicht, aber sie rechnet
 * damit** (`calcGoalProgress` teilt durch `totalWeight`).
 */
export const CONTRIBUTION_WEIGHTS: Readonly<
  Record<string, Readonly<Record<Beitragsmodul, number>>>
> = {
  body_composition_loss: {
    nutrition: 0.40, training: 0.25, recovery: 0.20,
    supplements: 0.10, medical: 0.05,
  },
  body_composition_gain: {
    nutrition: 0.30, training: 0.35, recovery: 0.20,
    supplements: 0.10, medical: 0.05,
  },
  performance_strength: {
    nutrition: 0.25, training: 0.40, recovery: 0.20,
    supplements: 0.10, medical: 0.05,
  },
  health: {
    nutrition: 0.25, training: 0.20, recovery: 0.20,
    supplements: 0.15, medical: 0.20,
  },
} as const

/**
 * Der Rueckfall, wenn der Zieltyp unbekannt ist.
 *
 * `[cmd]` **`SCORING.md:62`:** `CONTRIBUTION_WEIGHTS[goalType] ??
 * CONTRIBUTION_WEIGHTS['body_composition_gain']`.
 */
export const ZIELTYP_RUECKFALL = 'body_composition_gain'

export type Fortschrittsstatus =
  | 'excellent' | 'on_track' | 'needs_attention' | 'at_risk'

export type Zielfortschritt = {
  /** 0 bis 100. */
  overall_score: number
  status: Fortschrittsstatus
  /** Je Modul der gewichtete Anteil. */
  breakdown: Record<string, number>
  /**
   * Module, die KEINEN Wert geliefert haben.
   *
   * `[read]` **Die Spec setzt sie still auf 0** (`SCORING.md:66`:
   * `contributions[module] ?? 0`). `[cmd]` **Der Vertrag rechnet
   * genauso — aber er SAGT es**, statt ein fehlendes Modul wie ein
   * schlechtes aussehen zu lassen.
   */
  ohne_wert: Beitragsmodul[]
}

/**
 * Der Gesamtfortschritt aus den Modulbeitraegen.
 *
 * `[cmd]` **`SCORING.md:58-81`, Rechenweg unveraendert:** je Modul
 * `score * gewicht`, Summe geteilt durch die Gewichtssumme.
 *
 * `[cmd]` **Die Schwellen aus `:76`:** >= 80 `excellent`, >= 65
 * `on_track`, >= 50 `needs_attention`, sonst `at_risk`.
 *
 * @param beitraege Je Modul ein Score 0..100, oder `null`.
 * @param zieltyp   Einer der vier Schluessel, sonst Rueckfall.
 */
export function berechneZielfortschritt(
  beitraege: Partial<Record<Beitragsmodul, number | null>>,
  zieltyp: string,
): Zielfortschritt {
  const gewichte = CONTRIBUTION_WEIGHTS[zieltyp]
    ?? CONTRIBUTION_WEIGHTS[ZIELTYP_RUECKFALL]

  let summe = 0
  let gewichtSumme = 0
  const breakdown: Record<string, number> = {}
  const ohneWert: Beitragsmodul[] = []

  for (const [modul, gewicht] of Object.entries(gewichte) as
    Array<[Beitragsmodul, number]>) {
    const roh = beitraege[modul]
    // `[cmd]` **`SCORING.md:66`: `?? 0`** — ein fehlendes Modul
    // zaehlt als 0. `[read]` **Der Vertrag merkt sich, WELCHE das
    // waren.**
    if (roh === null || roh === undefined) ohneWert.push(modul)
    const score = roh ?? 0
    breakdown[modul] = Math.round(score * gewicht)
    summe += score * gewicht
    gewichtSumme += gewicht
  }

  const overall = gewichtSumme > 0 ? Math.round(summe / gewichtSumme) : 0

  return {
    overall_score: overall,
    status: overall >= 80 ? 'excellent'
      : overall >= 65 ? 'on_track'
        : overall >= 50 ? 'needs_attention' : 'at_risk',
    breakdown,
    ohne_wert: ohneWert,
  }
}
