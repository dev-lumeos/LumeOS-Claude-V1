// Der Anpassungsalgorithmus und die Uebergangswaechter — G-520.
//
// `[cmd]` **`docs/specs/Goals/PHASE_MODELS.md:184-223` fuehrt beides.**
// **Die Betraege stehen da, die Bedingungen stehen da — der Aufrufer
// fehlte.**
//
// **REINE FUNKTIONEN. KEIN I/O, KEIN SCHREIBEN.** Der Grund steht
// unten unter A3.
//
// ══ A3: VORSCHLAGEN, NICHT HANDELN ═════════════════════════════════
//
// `[cmd]` **C-108 und F-02, zitiert in E-56:51 und E-57:224:**
// *,,nennen ja, bewerten nein"*.
//
// `[read]` **Jede Funktion hier gibt einen VORSCHLAG zurueck.** Keine
// schreibt. **Der Nutzer entscheidet, die Oberflaeche ruft dann den
// Schreibweg.**
//
// `[cmd]` **Und es gibt einen zweiten, technischen Grund:** seit
// G-519 hat `phase-write.ts` einen zweigeteilten Weg — mit Rate ein
// `INSERT` mit vorheriger Sperrpruefung, weil `goal_phase_start`
// keinen Rate-Parameter hat (G-531). `[read]` **Diese Pruefung ist
// KEIN gleichwertiger Ersatz fuer die `23505`-Sperre der Funktion.**
// **Ein Waechter, der selbsttaetig schreibt, macht aus einem
// hinnehmbaren Augenblick einen Dauerzustand.**
//
// ══ DER WIDERSPRUCH, UMGERECHNET ═══════════════════════════════════
//
// `[cmd]` **Die Spec gibt alle Betraege in KALORIEN.** `[cmd]` **Nach
// E1 ist die gespeicherte Groesse die RATE** —
// `goal_phases.zielrate_pct_kg_woche`, und auf `goal_phases` gibt es
// null Kalorienspalten.
//
// `[read]` **Also wird jede Anpassung als RATE gerechnet**, und der
// Spec-Betrag ueber das Gewicht umgerechnet. **Derselbe kcal-Betrag
// ist bei 45 kg eine andere Rate als bei 120 kg** — genau der Befund,
// der zu E1 gefuehrt hat.
// ══ G-569: die Schwellen sind relativ ══════════════════
//
// `[read]` **Der Katalog prueft seit G-561 in Prozent** — die
// Anwendung zog nach. **Die Umrechnung steht in
// `waechter-schwellen.ts` und rundet durch `rundeWieDb`.**
import {
  SCHWELLE_PCT, schwelleGreift, schwelleUnterschritten,
} from './waechter-schwellen'
import {
  RATE_MIN, RATE_MAX, RATENPFLICHT, kcalDeltaAusRate,
  type Phasenart,
} from './phase-regeln'

/** Die vier Eingangsgroessen aus `PHASE_MODELS.md:185`. */
export type Wochendaten = {
  /**
   * kg je Woche. `null`, wenn die Reihe nicht traegt.
   *
   * `[cmd]` **Quelle `goals.body_measurements`** — 181 Zeilen auf
   * `dev@lumeos.app`, davon 62 in den letzten 14 Tagen
   * (2026-09-29).
   */
  weightTrend: number | null
  /**
   * `[cmd]` **G-569: das letzte gueltige Gewicht AM PRUEFSTICHTAG**
   * — nicht das am Phasenbeginn und nicht das aus dem Profil.
   *
   * `[cmd]` **G-561/A2, von Codex gegen die Vorgabe des
   * Orchestrators entschieden:** die Zielrate beschreibt die
   * unveraenderliche Absicht der Phase, **der Waechter bewertet
   * einen gegenwaertigen Vorgang.**
   *
   * `[read]` **Fehlt es, ist das ein Hindernis** — kein Rueckfall
   * auf ein anderes Gewicht, keine stille Null.
   */
  gewichtAmStichtagKg: number | null
  /**
   * Prozent 0..100+.
   *
   * `[cmd]` **`nutrition.daily_summary.enercc` gegen
   * `goals.nutrition_targets.kcal`** — 181 Zeilen.
   */
  calorieAdherence: number | null
  /**
   * Prozent, Veraenderung auf den Grunduebungen.
   *
   * `[cmd]` **`training.workout_sets.estimated_1rm`** — 222 von 233
   * Saetzen tragen ihn, ueber 23 Uebungen.
   */
  strengthTrend: number | null
  /** `recovery.checkins.hrv_rmssd`, Schnitt der letzten sieben Tage. */
  hrv7d: number | null
  /**
   * `[cmd]` **GIBT ES NICHT ALS SPALTE.** Gemessen 2026-09-29: im
   * ganzen Schema keine `%baseline%`-Spalte.
   *
   * `[read]` **Sie laesst sich aus derselben Reihe ABLEITEN** (ein
   * laengerer Schnitt) — **das ist eine Festlegung, keine
   * gespeicherte Groesse.** Wer sie uebergibt, sagt damit, worauf
   * er sich bezieht.
   */
  hrvBaseline: number | null
}

/** Was eine Regel vorschlaegt. Nie eine Handlung. */
export type Anpassungsart =
  | 'rate_senken' | 'rate_heben'
  | 'protein_heben'
  | 'erholung_pruefen'
  | 'keine_aenderung'

export type Anpassungsvorschlag = {
  art: Anpassungsart
  /**
   * Der Betrag als RATE in % KG/Woche. `null` bei Vorschlaegen ohne
   * Rate (Protein, Erholung).
   */
  rate_delta: number | null
  /** Derselbe Betrag in kcal/Tag — nur zur Anzeige. */
  kcal_delta: number | null
  /** Die Regel aus der Spec, mit Zeile. */
  regel: string
  /** Woraus sie folgt — in Worten, ohne Bewertung. */
  grund: string
  /**
   * Was der Vorschlag NICHT konnte.
   *
   * `[read]` **`null` heisst: er gilt.** Sonst steht hier, welche
   * Eingangsgroesse fehlte.
   */
  hindernis?: string
}

/**
 * Rechnet einen Spec-Kalorienbetrag in eine Rate um.
 *
 * `[cmd]` **Umkehrung von `kcal/Tag = 11 x Rate x Gewicht`**, also
 * `Rate = kcal / (11 x Gewicht)`.
 *
 * `[cmd]` **Gegen die Auftragswerte geprueft:** `-100 kcal` bei 80 kg
 * ergibt `-0,114 %/Woche`, `+150 kcal` bei 80 kg ergibt
 * `+0,170 %/Woche`.
 *
 * @returns `null` ohne Gewicht — **eine Rate ohne Gewicht waere
 *   erfunden.**
 */
export function rateAusKcal(
  kcal: number, gewichtKg: number | null | undefined,
): number | null {
  if (gewichtKg === null || gewichtKg === undefined || gewichtKg <= 0) return null
  return Math.round((kcal / (11 * gewichtKg)) * 1000) / 1000
}

/**
 * Haelt eine vorgeschlagene Rate innerhalb beider CHECKs.
 *
 * `[cmd]` **`goal_phases_zielrate_aussengrenze`** (`-2,5 … 1,5`) und
 * **`goal_phases_zielrate_passt_zur_art`** (Vorzeichen je Art).
 *
 * `[read]` **Ein Vorschlag, der dagegen liefe, wird GEKAPPT und
 * sagt es** — er wird nicht stillschweigend fallengelassen und
 * nicht gegen den CHECK geschickt.
 */
export function haltInGrenzen(
  art: Phasenart, neueRate: number,
): { rate: number; gekappt: string | null } {
  let r = neueRate
  let grund: string | null = null

  if (r < RATE_MIN) { r = RATE_MIN; grund = `auf ${RATE_MIN} begrenzt (Aussengrenze)` }
  if (r > RATE_MAX) { r = RATE_MAX; grund = `auf ${RATE_MAX} begrenzt (Aussengrenze)` }

  const pflicht = RATENPFLICHT[art]
  // `[read]` **Das Vorzeichen darf nicht kippen** — sonst liefe der
  // Vorschlag gegen `goal_phases_zielrate_passt_zur_art`.
  if (pflicht === 'negativ' && r >= 0) {
    return { rate: neueRate, gekappt: 'nicht anwendbar — die Rate wuerde ihr Vorzeichen verlieren' }
  }
  if (pflicht === 'positiv' && r <= 0) {
    return { rate: neueRate, gekappt: 'nicht anwendbar — die Rate wuerde ihr Vorzeichen verlieren' }
  }
  if (pflicht === 'nahe_null' && Math.abs(r) > 0.1) {
    return { rate: neueRate, gekappt: 'nicht anwendbar — beim Halten bleibt die Rate zwischen -0,1 und +0,1' }
  }
  return { rate: r, gekappt: grund }
}

/**
 * Die woechentliche Anpassung — sechs Regeln aus `:188-207`.
 *
 * `[read]` **Die Reihenfolge ist die der Spec.** Die erste
 * zutreffende Regel gewinnt; `hrv` prueft die Spec zuletzt und
 * phasenunabhaengig.
 *
 * @param art        Die laufende Phasenart.
 * @param rateJetzt  Die gespeicherte Rate, oder `null`.
 * @param gewichtKg  Aus dem Profil — **nicht geraten.**
 */
export function wochenAnpassung(
  art: Phasenart,
  rateJetzt: number | null,
  gewichtKg: number | null,
  d: Wochendaten,
): Anpassungsvorschlag {
  /** Baut einen Ratenvorschlag aus einem Spec-Kalorienbetrag. */
  const ausKcal = (
    kcal: number, regel: string, grund: string,
    artVorschlag: 'rate_senken' | 'rate_heben',
  ): Anpassungsvorschlag => {
    const delta = rateAusKcal(kcal, gewichtKg)
    if (delta === null) {
      return {
        art: artVorschlag, rate_delta: null, kcal_delta: kcal, regel, grund,
        hindernis: 'Ohne Koerpergewicht im Profil laesst sich der '
          + 'Kalorienbetrag nicht in eine Rate umrechnen.',
      }
    }
    if (rateJetzt === null) {
      return {
        art: artVorschlag, rate_delta: delta, kcal_delta: kcal, regel, grund,
        hindernis: 'Diese Phase traegt keine Rate — es gibt nichts zu '
          + 'verstellen.',
      }
    }
    const { rate, gekappt } = haltInGrenzen(art, rateJetzt + delta)
    return {
      art: artVorschlag,
      rate_delta: Math.round((rate - rateJetzt) * 1000) / 1000,
      kcal_delta: kcalDeltaAusRate(rate - rateJetzt, gewichtKg),
      regel, grund,
      ...(gekappt ? { hindernis: gekappt } : {}),
    }
  }

  const keine = (grund: string): Anpassungsvorschlag => ({
    art: 'keine_aenderung', rate_delta: null, kcal_delta: null,
    regel: 'PHASE_MODELS.md:207', grund,
  })

  // ── fat_loss, drei Regeln (:188-195) ────────────────────────────
  if (art === 'fat_loss') {
    // `[cmd]` **G-569: relativ statt `> -0.1` kg/Woche.**
    // `[read]` **`0,119 %` sind bei 83,74 kg genau 0,1 kg** —
    // dieselbe Strenge, anderer Bezug.
    if (d.calorieAdherence !== null && d.calorieAdherence > 85
      && schwelleUnterschritten('verlustZuLangsam',
        d.weightTrend, d.gewichtAmStichtagKg) === true) {
      return ausKcal(-100, 'PHASE_MODELS.md:189-190',
        'Das Gewicht steht trotz eingehaltener Kalorien.', 'rate_senken')
    }
    // `[cmd]` **G-569: `1,194 %` statt `-1.0` kg/Woche** — bei
    // 83,74 kg dieselbe Grenze, bei 60 kg greift sie schon bei
    // 0,717 kg.
    if (d.weightTrend !== null && d.weightTrend < 0
      && schwelleGreift('verlustZuSchnell',
        d.weightTrend, d.gewichtAmStichtagKg) === true) {
      return ausKcal(+150, 'PHASE_MODELS.md:191-192',
        'Der Verlust laeuft schneller als vorgesehen.', 'rate_heben')
    }
    if (d.strengthTrend !== null && d.strengthTrend < -10) {
      return {
        art: 'protein_heben', rate_delta: null, kcal_delta: null,
        regel: 'PHASE_MODELS.md:193-194',
        grund: 'Die Kraft auf den Grunduebungen geht zurueck.',
        // `[read]` **Die Spec nennt +20 g Protein** — das ist KEINE
        // Rate. `[cmd]` **`goal_phases` hat keine Proteinspalte**,
        // und `nutrition_targets.protein_g` rechnet
        // `berechne_zielwerte` aus dem Gewicht. **Der Vorschlag
        // steht, der Schreibweg dafuer fehlt.**
        hindernis: '+20 g Protein liesse sich nirgends hinterlegen — '
          + '`goal_phases` hat keine Proteinspalte, und '
          + '`nutrition_targets.protein_g` wird gerechnet.',
      }
    }
  }

  // ── lean_bulk, zwei Regeln (:197-202) ───────────────────────────
  if (art === 'lean_bulk') {
    // `[cmd]` **G-569: `0,896 %` statt `0.75` kg/Woche.**
    if (d.weightTrend !== null && d.weightTrend > 0
      && schwelleGreift('zunahmeZuSchnell',
        d.weightTrend, d.gewichtAmStichtagKg) === true) {
      return ausKcal(-100, 'PHASE_MODELS.md:198-199',
        'Die Zunahme laeuft schneller als vorgesehen.', 'rate_senken')
    }
    // `[cmd]` **G-569: `0,119 %` statt `0.1` kg/Woche.**
    if (d.calorieAdherence !== null && d.calorieAdherence > 85
      && schwelleUnterschritten('zunahmeZuLangsam',
        d.weightTrend, d.gewichtAmStichtagKg) === true) {
      return ausKcal(+100, 'PHASE_MODELS.md:200-201',
        'Das Gewicht steht trotz eingehaltener Kalorien.', 'rate_heben')
    }
  }

  // ── alle Phasen: HRV (:204-205) ─────────────────────────────────
  //
  // `[cmd]` **`hrv_baseline` ist KEINE Spalte** — gemessen
  // 2026-09-29. `[read]` **Ohne sie ist die Regel nicht rechenbar,
  // und das sagt der Vorschlag.**
  if (d.hrv7d !== null && d.hrvBaseline !== null
    && d.hrv7d < d.hrvBaseline * 0.85) {
    return {
      art: 'erholung_pruefen', rate_delta: null, kcal_delta: null,
      regel: 'PHASE_MODELS.md:204-205',
      grund: 'Die HRV der letzten sieben Tage liegt unter 85 % der '
        + 'Vergleichsgroesse.',
    }
  }
  if (d.hrv7d !== null && d.hrvBaseline === null) {
    return keine('Die HRV-Regel liesse sich nicht pruefen — eine '
      + 'Vergleichsgroesse ist nirgends gespeichert.')
  }

  return keine('Alles im vorgesehenen Rahmen.')
}
