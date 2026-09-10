// Der Abgleich auf FELDEBENE — G-400/A1.
//
// **Tom, 2026-09-08:** *„das hat nicht mal 1% etwas mit meiner
// coaching plattform zu tun. weder grafisch noch inhaltlich."*
//
// ══ WARUM FELDER UND NICHT KARTEN ═══════════════════════════════════
//
// `[read]` **G-391 und G-398 haben Karten GEZAEHLT.** **Eine Karte mit
// richtigem Titel und falscher Form galt in beiden als
// „angebunden".**
//
// `[cmd]` **Beispiel `Athletes needing attention`, vom Orchestrator
// gemessen:** Vorlage sieben Felder (Avatar, Name, Plan, letzte
// Sitzung, Alertzahl, Compliance farbig, Klick), Bau zwei (Name,
// Datum) — **fuenf fehlen.** `[read]` **Beide Auftraege meldeten die
// Karte als vorhanden.**
//
// ══ WAS ALS FELD ZAEHLT ═════════════════════════════════════════════
//
// `[read]` **Eine sichtbare Angabe** — ein Wert, eine Pill, ein
// Zaehler, eine Farbe MIT BEDEUTUNG, ein Klickziel, eine Sparkline,
// ein Avatar. **Nicht: Abstaende, Rahmen, Schriftgroessen.**
//
// `[cmd]` **Gemessen 2026-09-09 durch Lesen der Vorlage**, nicht durch
// ein Muster: eine Regex ueber JSX zaehlt `<Pill>` in einer Schleife
// als eins und verfehlt die Spalten einer Tabelle. **Je Karte
// nachgesehen, Zeile fuer Zeile.**

/** Ein Feld der Vorlage und sein Zustand im Bau. */
export type Feld = {
  name: string
  /** Steht es im Bau? */
  da: boolean
  /**
   * Wenn nicht: woran es haengt.
   *
   * `rechenbar` — die Daten sind da, nur nicht gezeigt.
   * `keine-daten` — es fehlt eine Spalte oder Tabelle.
   * `form` — reine Darstellung, jederzeit baubar.
   */
  grund?: 'rechenbar' | 'keine-daten' | 'form'
  /** Bei `keine-daten`: WAS fehlt. */
  fehlt?: string
}

export type KartenAbgleich = {
  reiter: string
  titel: string
  quelle: string
  felder: Feld[]
}

// ── Die Karten der Portalreiter, je Feld ────────────────────────────
//
// `[read]` **Nur die Reiter, die heute etwas zeigen** — fuer die acht
// begruendeten Leerzustaende gibt es keinen Bau, gegen den sich
// messen liesse. **Sie stehen in der Zusammenfassung als „0 von n".**
export const ABGLEICH: KartenAbgleich[] = [
  {
    reiter: 'overview',
    titel: 'Active athletes (Kennzahl)',
    quelle: 'module-coach.jsx:507',
    felder: [
      { name: 'Beschriftung', da: true },
      { name: 'Zahl', da: true },
      // `[cmd]` **G-400: die dritte Zeile ist gebaut**, traegt aber
      // eine ANDERE Groesse — „n eingeladen" statt „+2 last 30d".
      // `[read]` **Der Vergleich ueber 30 Tage bleibt offen**, und
      // das steht hier, statt die Zeile als erfuellt zu melden.
      { name: 'Trend „+2 last 30d"', da: false, grund: 'keine-daten',
        fehlt: 'coach.relationship_change_log traegt Wechsel, aber der '
          + 'Vergleich „letzte 30 Tage" ist nirgends gerechnet — gebaut '
          + 'ist statt dessen „n eingeladen"' },
    ],
  },
  {
    reiter: 'overview',
    titel: 'Median compliance (Kennzahl)',
    quelle: 'module-coach.jsx:508',
    felder: [
      { name: 'Beschriftung', da: false, grund: 'keine-daten',
        fehlt: 'keine Compliance je Klient — coach.checkins traegt '
          + 'status, aber keinen Erfuellungsgrad' },
      { name: 'Zahl', da: false, grund: 'keine-daten',
        fehlt: 'keine Compliance je Klient in coach.checkins' },
      { name: 'Farbe nach Schwelle', da: false, grund: 'keine-daten',
        fehlt: 'ohne Erfuellungsgrad gibt es keine Schwelle' },
      { name: 'Untertitel „30-day rolling"', da: false, grund: 'keine-daten',
        fehlt: 'keine Compliance je Klient, also auch kein Mittel' },
    ],
  },
  {
    reiter: 'overview',
    titel: 'Alerts open (Kennzahl)',
    quelle: 'module-coach.jsx:509',
    felder: [
      { name: 'Beschriftung', da: true },
      { name: 'Zahl', da: true },
      { name: 'Farbe (warn)', da: false, grund: 'form',
        fehlt: 'KPI.deltaVariant kennt nur pos und neg '
          + '(primitives.tsx:397) — eine Aenderung in packages/ui' },
      // G-400 gebaut: „n Athleten betroffen", je Klient einmal.
      { name: 'Untertitel „n athletes affected"', da: true },
    ],
  },
  {
    reiter: 'overview',
    titel: 'MRR · 30d (Kennzahl)',
    quelle: 'module-coach.jsx:510',
    felder: [
      { name: 'Beschriftung', da: false, grund: 'keine-daten',
        fehlt: 'keine Tabelle fuer Umsatz — Geld gehoert zum '
          + 'Marketplace (F-06 T8)' },
      { name: 'Zahl', da: false, grund: 'keine-daten',
        fehlt: 'keine Tabelle fuer Umsatz' },
      { name: 'Trend „+€420"', da: false, grund: 'keine-daten',
        fehlt: 'keine Tabelle fuer Umsatz — und kein Vergleichszeitraum' },
    ],
  },
  {
    reiter: 'overview',
    titel: 'Athletes needing attention',
    quelle: 'module-coach.jsx:502',
    felder: [
      // G-400 gebaut: Initialen wie in der Vorlage (`avatar: "LB"`).
      { name: 'Avatar (Initialen)', da: true },
      { name: 'Name', da: true },
      { name: 'Plan', da: false, grund: 'keine-daten',
        fehlt: 'keine Tabelle fuer Plaene' },
      { name: 'letzte Sitzung', da: false, grund: 'rechenbar',
        fehlt: 'training.workout_sessions.session_date — das Portal liest '
          + 'sie je Athlet, aber nicht fuer diese Liste' },
      // G-400 gebaut: aus `coach.alerts`, je Klient gezaehlt.
      { name: 'Pill „n alerts"', da: true },
      { name: 'Compliance farbig', da: false, grund: 'keine-daten',
        fehlt: 'keine Compliance je Klient' },
      { name: 'Klick -> Athletendetail', da: true },
    ],
  },
  {
    reiter: 'overview',
    titel: "Today's sessions logged",
    quelle: 'module-coach.jsx:518',
    felder: [
      { name: 'Untertitel „6 of 14"', da: false, grund: 'rechenbar' },
      { name: 'Sparkline 14 Tage', da: false, grund: 'rechenbar',
        fehlt: 'training.workout_sessions je Tag — die Zeilen sind da' },
      { name: 'Erklaerzeile', da: false, grund: 'rechenbar' },
    ],
  },
  {
    reiter: 'overview',
    titel: 'Recent achievements',
    quelle: 'module-coach.jsx:522',
    felder: [
      { name: 'Name', da: false, grund: 'keine-daten',
        fehlt: 'keine Tabelle fuer Erfolge oder Meilensteine' },
      { name: 'Leistung', da: false, grund: 'keine-daten',
        fehlt: 'keine Tabelle fuer Erfolge oder Meilensteine' },
      { name: 'Zeitpunkt', da: false, grund: 'keine-daten',
        fehlt: 'keine Tabelle fuer Erfolge oder Meilensteine' },
    ],
  },
  {
    reiter: 'athletes',
    titel: 'Athletenliste',
    quelle: 'module-coach-portal-v2.jsx:70',
    felder: [
      { name: 'Avatar', da: false, grund: 'form' },
      { name: 'Name', da: true },
      { name: 'Status-Pill', da: true },
      { name: 'Plan', da: false, grund: 'keine-daten',
        fehlt: 'keine Tabelle fuer Plaene' },
      { name: 'Compliance', da: false, grund: 'keine-daten',
        fehlt: 'keine Compliance je Klient' },
      { name: 'Alertzahl', da: false, grund: 'rechenbar' },
      { name: 'Klick -> Akte', da: true },
    ],
  },
  {
    reiter: 'alerts',
    titel: 'All open alerts',
    quelle: 'module-coach.jsx:677',
    felder: [
      { name: 'Titel', da: true },
      { name: 'Athlet', da: true },
      { name: 'Zeitpunkt', da: true },
      { name: 'Schweregrad-Pill', da: false, grund: 'keine-daten',
        fehlt: 'coach.alerts hat keine Spalte fuer Schweregrad' },
      { name: 'Status-Pill', da: true },
      { name: 'Prioritaetswert', da: false, grund: 'keine-daten',
        fehlt: 'smartPriorityScore rechnet aus severity und confidence — '
          + 'beide Spalten gibt es nicht' },
    ],
  },
  {
    reiter: 'messages',
    titel: 'Recent messages · all athletes',
    quelle: 'module-coach.jsx:628',
    felder: [
      { name: 'Avatar', da: false, grund: 'form' },
      { name: 'Name', da: true },
      { name: 'Punkt fuer ungelesen', da: false, grund: 'form' },
      { name: 'Zeitpunkt', da: true },
      { name: 'Textanriss', da: true },
      { name: 'Untertitel „n unread"', da: false, grund: 'rechenbar' },
    ],
  },
  {
    reiter: 'consent',
    titel: 'Freigaben je Athlet',
    quelle: 'module-coach-gaps.jsx:405',
    felder: [
      { name: 'Athlet', da: true },
      { name: 'Modul je Spalte', da: true },
      { name: 'Sichtbarkeit', da: true },
      { name: 'Ablauf', da: true },
      { name: 'Verlauf der Widerrufe', da: false, grund: 'keine-daten',
        fehlt: 'coach.client_consent_log ist leer (0 Zeilen)' },
    ],
  },
  {
    reiter: 'autonomy',
    titel: 'Autonomiestufen',
    quelle: 'module-coach-extras.jsx:566',
    felder: [
      { name: 'Athlet', da: true },
      { name: 'Stufe je Modul', da: true },
      { name: 'Verlauf', da: true },
      { name: 'Verteilung ueber die Kohorte', da: false, grund: 'rechenbar' },
    ],
  },
  {
    reiter: 'workflows',
    titel: 'Check-ins',
    quelle: 'module-coach-portal-workflows.jsx:122',
    felder: [
      { name: 'Athlet', da: true },
      { name: 'Faelligkeit', da: true },
      { name: 'Status', da: true },
      { name: 'Antworten des Klienten', da: true },
      { name: 'Schrittfolge (Ablauf)', da: false, grund: 'keine-daten',
        fehlt: 'keine Tabelle fuer Ablaeufe' },
    ],
  },
  {
    reiter: 'onboard',
    titel: 'Client onboarding',
    quelle: 'module-coach-portal-workflows.jsx:239',
    felder: [
      { name: 'Athlet', da: true },
      { name: 'Fortschrittsbalken', da: false, grund: 'keine-daten',
        fehlt: 'keine Tabelle fuer Ablaeufe' },
      { name: 'Schritte mit Zustand', da: false, grund: 'keine-daten',
        fehlt: 'keine Tabelle fuer Ablaeufe' },
      { name: 'Startdatum', da: true },
    ],
  },
]

/** Die Zahlen fuer A1 — gerechnet, nicht geschrieben. */
export function abgleichZahlen() {
  let vorlage = 0
  let gebaut = 0
  const je: Array<{ titel: string, vorlage: number, gebaut: number, fehlt: number }> = []
  for (const k of ABGLEICH) {
    const n = k.felder.length
    const d = k.felder.filter(f => f.da).length
    vorlage += n
    gebaut += d
    je.push({ titel: k.titel, vorlage: n, gebaut: d, fehlt: n - d })
  }
  return { vorlage, gebaut, fehlt: vorlage - gebaut, je }
}
