// Die sieben Uebergangswaechter — G-520/A2.
//
// `[cmd]` **`docs/specs/Goals/PHASE_MODELS.md:219-223`**, die
// Guard-Tabelle, sieben Zeilen:
//
//     Gewichtsverlust zu schnell   >1,194 % KG/Wo bei FAT_LOSS +150 kcal
//     Gewichtsverlust zu langsam   <0,119 % KG/Wo + >85%      -100 kcal
//     Kraft schwindet              >10% Rueckgang            +20g Protein
//     Uebertraining                HRV <85% Baseline, 5+ Tage  Deload
//     Max. Phasendauer             max_duration_weeks erreicht  Transition
//     Contest Prep kritisch        BF% <5% (M) / <10% (F)    Gesundheitswarnung
//     Zu schnelle Masse            >0,896 % KG/Wo bei LEAN_BULK -100 kcal
//
// `[cmd]` **G-569: die drei Schwellen sind seit G-561 RELATIV.**
// **Bei 83,74 kg dieselben Zahlen wie vorher** (1,0 / 0,1 / 0,75 kg),
// **bei 60 kg nicht** — dort greift die erste schon bei 0,717 kg.
//
// **REINE FUNKTIONEN. KEINE SCHREIBT.** `[cmd]` **C-108/F-02, in
// E-56:51 zitiert:** *,,nennen ja, bewerten nein"*.
import {
  wochenAnpassung, type Wochendaten, type Anpassungsvorschlag,
} from './anpassung'
import type { Phasenart } from './phase-regeln'
// ══ G-569: die Schwellen sind relativ ══════════════════
//
// `[cmd]` **G-561 hat den Katalog auf Prozent umgestellt**, hier
// standen weiter Kilogramm. **Die Umrechnung und die Texte liegen in
// `waechter-schwellen.ts`.**
import {
  SCHWELLE_PCT, schwelleGreift, schwelleUnterschritten, schwellenText,
} from './waechter-schwellen'

export type Waechterkennung =
  | 'verlust_zu_schnell' | 'verlust_zu_langsam'
  | 'kraft_schwindet' | 'uebertraining'
  | 'phasendauer' | 'koerperfett_niedrig'
  | 'masse_zu_schnell'

export type Waechterbefund = {
  kennung: Waechterkennung
  /** Die Zeile in der Spec. */
  regel: string
  /** `true`, wenn die Bedingung zutrifft. */
  greift: boolean
  /**
   * Was der Waechter VORSCHLAEGT. Nie eine Handlung.
   *
   * `[read]` **Ein Satz, der nennt und nicht bewertet** (C-108/F-02).
   */
  satz: string
  /**
   * Warum er nicht pruefbar war. `undefined` heisst: geprueft.
   *
   * `[read]` **Nicht pruefbar ist NICHT dasselbe wie greift nicht.**
   */
  hindernis?: string
}

/** Was die Waechter ausser den Wochendaten brauchen. */
export type Waechterlage = {
  art: Phasenart
  /**
   * Wie lange die Phase laeuft, in Wochen. Aus `gueltig_ab`
   * gerechnet.
   */
  wochen: number | null
  /**
   * `[cmd]` **GIBT ES NIRGENDS ALS DATEN** — gemessen 2026-09-29.
   * Das ist G-529/A3 und liegt hinter G-531 bei Codex.
   */
  maxDauerWochen: number | null
  /** Aus `goals.body_measurements.body_fat_pct`. */
  koerperfettPct: number | null
  /** Aus `public.profiles.biological_sex`. */
  biologischesGeschlecht: string | null
  /** Wie viele Tage die HRV schon unter der Grenze liegt. */
  hrvTageUnterGrenze: number | null
}

/**
 * Die Schwelle je Geschlecht, aus `PHASE_MODELS.md:133` und `:224`.
 *
 * `[cmd]` **`< 5 %` maennlich, `< 10 %` weiblich** — aus der Spec
 * gelesen, nicht gesetzt.
 */
export const BF_SCHWELLE: Readonly<Record<string, number>> = {
  male: 5, female: 10,
}

/**
 * Der Satz zur Gesundheitswarnung — A4, unter E-74.
 *
 * ══ WARUM DIESE FORM ═══════════════════════════════════════════════
 *
 * `[cmd]` **E-74 verbietet dreierlei:** *,,aus diesen Daten eine
 * eigene Diagnose ableiten"*, *,,eine Therapie empfehlen"*,
 * *,,einen Wert als krankhaft bewerten"* (`E-74:54-56`).
 *
 * `[read]` **Ein Satz wie *,,dein Koerperfett ist gefaehrlich
 * niedrig"* waere alle drei.** `[read]` **Erlaubt ist, die eigene
 * Quelle zu ZITIEREN** — E-74: *,,damit ist die Wiedergabe ein
 * Zitat, keine Aussage"*.
 *
 * `[cmd]` **Deshalb nennt der Satz die SPEC als Urheber**, den
 * gemessenen Wert und die Schwelle — **und ueberlaesst die
 * Einordnung dem Nutzer und seinem Arzt.**
 */
export function koerperfettSatz(
  wert: number, schwelle: number, geschlecht: string,
): string {
  const g = geschlecht === 'male' ? 'maennlich' : 'weiblich'
  return `Gemessen ${wert} % Koerperfett. Die Phasenspec setzt fuer `
    + `${g} eine Aufmerksamkeitsgrenze bei ${schwelle} % `
    + '(PHASE_MODELS.md:133). Was das fuer dich bedeutet, gehoert '
    + 'in aerztliche Haende — LumeOS bewertet es nicht.'
}

/**
 * Alle sieben Waechter, je ein Befund.
 *
 * `[read]` **Auch die nicht greifenden kommen zurueck** — sonst
 * laesst sich *,,geprueft und in Ordnung"* nicht von *,,gar nicht
 * geprueft"* unterscheiden.
 */
export function pruefeWaechter(
  lage: Waechterlage, d: Wochendaten,
  // ══ G-569/A4: die Texte in der gewaehlten Einheit ═════════════
  //
  // `[cmd]` **E-83: der Nutzer waehlt die Einheit**, geladen mit
  // `ladeEinheit()` aus `user_display_preferences` (G-565).
  //
  // `[read]` **Die Vorgabe ist Prozent** — das ist die Groesse, in
  // der der Katalog seine Schwellen fuehrt, und sie gilt ohne
  // Gewicht.
  einheit: 'prozent' | 'kcal' = 'prozent',
): Waechterbefund[] {
  const raus: Waechterbefund[] = []

  const fehlt = (
    kennung: Waechterkennung, regel: string, satz: string, warum: string,
  ): Waechterbefund => ({ kennung, regel, greift: false, satz, hindernis: warum })

  // ── 1 · Gewichtsverlust zu schnell ──────────────────────────────
  if (d.weightTrend === null) {
    raus.push(fehlt('verlust_zu_schnell', 'PHASE_MODELS.md:223',
      'Verlusttempo nicht geprueft.',
      'Kein Gewichtstrend — die Messreihe traegt keinen.'))
  } else if (d.gewichtAmStichtagKg === null) {
    // `[cmd]` **G-569/A2: fehlt das Gewicht am Stichtag, ist das ein
    // HINDERNIS** — kein Rueckfall auf Profil- oder Startgewicht
    // (G-561/A2, von Codex begruendet).
    raus.push(fehlt('verlust_zu_schnell', 'PHASE_MODELS.md:223',
      'Verlusttempo nicht geprueft.',
      'Kein Gewicht am Stichtag — die Schwelle ist relativ zum '
      + 'Koerpergewicht und laesst sich ohne es nicht pruefen.'))
  } else {
    const greift = lage.art === 'fat_loss' && d.weightTrend < 0
      && schwelleGreift('verlustZuSchnell',
        d.weightTrend, d.gewichtAmStichtagKg) === true
    raus.push({
      kennung: 'verlust_zu_schnell', regel: 'PHASE_MODELS.md:223', greift,
      satz: greift
        ? `Der Verlust liegt bei ${d.weightTrend} kg/Woche. Die Spec `
          + `sieht ab ${schwellenText('verlustZuSchnell',
            d.gewichtAmStichtagKg, einheit)} eine Anhebung um `
          + '150 kcal vor.'
        : 'Das Verlusttempo liegt im vorgesehenen Rahmen.',
    })
  }

  // ── 2 · Gewichtsverlust zu langsam ──────────────────────────────
  if (d.weightTrend === null || d.calorieAdherence === null
      || d.gewichtAmStichtagKg === null) {
    raus.push(fehlt('verlust_zu_langsam', 'PHASE_MODELS.md:224',
      'Stillstand nicht geprueft.',
      d.weightTrend === null
        ? 'Kein Gewichtstrend.'
        : d.calorieAdherence === null
          ? 'Keine Kalorieneinhaltung.'
          : 'Kein Gewicht am Stichtag — die Schwelle ist relativ '
            + 'zum Koerpergewicht.'))
  } else {
    const greift = lage.art === 'fat_loss' && d.calorieAdherence > 85
      && schwelleUnterschritten('verlustZuLangsam',
        d.weightTrend, d.gewichtAmStichtagKg) === true
    raus.push({
      kennung: 'verlust_zu_langsam', regel: 'PHASE_MODELS.md:224', greift,
      satz: greift
        ? `Das Gewicht steht (${d.weightTrend} kg/Woche) bei `
          + `${d.calorieAdherence} % Einhaltung. Die Spec sieht `
          + '100 kcal weniger vor.'
        : 'Kein Stillstand bei eingehaltenen Kalorien.',
    })
  }

  // ── 3 · Kraft schwindet ─────────────────────────────────────────
  if (d.strengthTrend === null) {
    raus.push(fehlt('kraft_schwindet', 'PHASE_MODELS.md:225',
      'Kraftverlauf nicht geprueft.',
      'Kein Kraftverlauf — zu wenige Saetze mit geschaetztem 1RM.'))
  } else {
    const greift = d.strengthTrend < -10
    raus.push({
      kennung: 'kraft_schwindet', regel: 'PHASE_MODELS.md:225', greift,
      satz: greift
        ? `Die Kraft auf den Grunduebungen liegt ${d.strengthTrend} %. `
          + 'Die Spec sieht 20 g Protein mehr vor.'
        : 'Die Kraft haelt sich.',
    })
  }

  // ── 4 · Uebertraining ───────────────────────────────────────────
  //
  // `[cmd]` **Die Spec verlangt „5+ Tage"** — nicht einen Tag.
  if (d.hrvBaseline === null) {
    raus.push(fehlt('uebertraining', 'PHASE_MODELS.md:226',
      'Erholung nicht geprueft.',
      'Eine HRV-Vergleichsgroesse ist nirgends gespeichert.'))
  } else if (d.hrv7d === null || lage.hrvTageUnterGrenze === null) {
    raus.push(fehlt('uebertraining', 'PHASE_MODELS.md:226',
      'Erholung nicht geprueft.', 'Keine HRV-Reihe.'))
  } else {
    const greift = d.hrv7d < d.hrvBaseline * 0.85
      && lage.hrvTageUnterGrenze >= 5
    raus.push({
      kennung: 'uebertraining', regel: 'PHASE_MODELS.md:226', greift,
      satz: greift
        ? `Die HRV liegt seit ${lage.hrvTageUnterGrenze} Tagen unter `
          + '85 % der Vergleichsgroesse. Die Spec sieht eine '
          + 'Entlastungswoche vor.'
        : 'Die Erholung liegt im vorgesehenen Rahmen.',
    })
  }

  // ── 5 · Maximale Phasendauer ────────────────────────────────────
  //
  // `[cmd]` **`max_duration_weeks` existiert NIRGENDS als Daten** —
  // gemessen 2026-09-29. `[read]` **Nicht mit einer geratenen Dauer
  // gebaut**, sondern als nicht rechenbar gemeldet. **G-529/A3.**
  if (lage.maxDauerWochen === null || lage.wochen === null) {
    raus.push(fehlt('phasendauer', 'PHASE_MODELS.md:227',
      'Phasendauer nicht geprueft.',
      'Eine Hoechstdauer je Phasenart ist nirgends gespeichert '
      + '(G-529/A3).'))
  } else {
    const greift = lage.wochen >= lage.maxDauerWochen
    raus.push({
      kennung: 'phasendauer', regel: 'PHASE_MODELS.md:227', greift,
      satz: greift
        ? `Die Phase laeuft seit ${lage.wochen} Wochen, vorgesehen `
          + `sind ${lage.maxDauerWochen}. Die Spec sieht einen `
          + 'Uebergang vor.'
        : `Woche ${lage.wochen} von ${lage.maxDauerWochen}.`,
    })
  }

  // ── 6 · Koerperfett niedrig (A4, unter E-74) ────────────────────
  const schwelle = lage.biologischesGeschlecht
    ? BF_SCHWELLE[lage.biologischesGeschlecht] : undefined
  if (lage.koerperfettPct === null || schwelle === undefined) {
    raus.push(fehlt('koerperfett_niedrig', 'PHASE_MODELS.md:228',
      'Koerperfett nicht geprueft.',
      lage.koerperfettPct === null
        ? 'Kein Koerperfettwert in der Messreihe.'
        : 'Kein biologisches Geschlecht im Profil — die Spec setzt '
          + 'je Geschlecht eine andere Grenze.'))
  } else {
    const greift = lage.koerperfettPct < schwelle
    raus.push({
      kennung: 'koerperfett_niedrig', regel: 'PHASE_MODELS.md:228', greift,
      satz: greift
        ? koerperfettSatz(lage.koerperfettPct, schwelle,
          lage.biologischesGeschlecht!)
        : `Koerperfett ${lage.koerperfettPct} %, oberhalb der `
          + `Aufmerksamkeitsgrenze von ${schwelle} %.`,
    })
  }

  // ── 7 · Zu schnelle Masse ───────────────────────────────────────
  if (d.weightTrend === null) {
    raus.push(fehlt('masse_zu_schnell', 'PHASE_MODELS.md:229',
      'Zunahmetempo nicht geprueft.', 'Kein Gewichtstrend.'))
  } else if (d.gewichtAmStichtagKg === null) {
    // `[cmd]` **G-569/A2: ein Hindernis, keine stille Null.**
    raus.push(fehlt('masse_zu_schnell', 'PHASE_MODELS.md:229',
      'Zunahmetempo nicht geprueft.',
      'Kein Gewicht am Stichtag — die Schwelle ist relativ zum '
      + 'Koerpergewicht und laesst sich ohne es nicht pruefen.'))
  } else {
    const greift = lage.art === 'lean_bulk' && d.weightTrend > 0
      && schwelleGreift('zunahmeZuSchnell',
        d.weightTrend, d.gewichtAmStichtagKg) === true
    raus.push({
      kennung: 'masse_zu_schnell', regel: 'PHASE_MODELS.md:229', greift,
      satz: greift
        ? `Die Zunahme liegt bei ${d.weightTrend} kg/Woche. Die Spec `
          + `sieht ab ${schwellenText('zunahmeZuSchnell',
            d.gewichtAmStichtagKg, einheit)} 100 kcal weniger vor.`
        : 'Das Zunahmetempo liegt im vorgesehenen Rahmen.',
    })
  }

  return raus
}

/** Beides zusammen: die Wochenregel und die sieben Waechter. */
export function wochenlage(
  lage: Waechterlage, rateJetzt: number | null,
  gewichtKg: number | null, d: Wochendaten,
): { anpassung: Anpassungsvorschlag; waechter: Waechterbefund[] } {
  return {
    anpassung: wochenAnpassung(lage.art, rateJetzt, gewichtKg, d),
    waechter: pruefeWaechter(lage, d),
  }
}
