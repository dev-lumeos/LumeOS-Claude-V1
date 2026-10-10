// Die Hindernisse der Zielwertformel — **ohne Server-I/O** (A-30).
//
// `[cmd]` **WARUM DIESE DATEI GETRENNT IST.** `hindernisSatz` stand
// in `zielwerte-read.ts`. **Die Datei importiert
// `createSessionClient`, und das braucht `next/headers`** — ein
// **Wert**-Import von dort in eine `'use client'`-Datei zieht den
// ganzen Baum ins Browserbuendel und beantwortet die Seite mit
// **HTTP 500**.
//
// `[cmd]` **Dieselbe Klasse Fehler wie in G-74, G-412 und G-537**
// (dort mit `ziel-regeln.ts`). **Der Typecheck sieht sie nicht** —
// nur der Browser.
//
// `[read]` **Deshalb hier:** die Namen und die Saetze, die beide
// Seiten brauchen. `zielwerte-read.ts` macht das I/O und bleibt
// serverseitig.

// ── G-527: vier Hindernisse, vier Texte ──────────────────────────
//
// `[cmd]` **Zuerst standen zwei** — `profil_unvollstaendig` und
// `zielrichtung_ohne_faktor`. `[cmd]` **G-511 brachte zwei weitere:**
// `keine_aktive_phase` und `phasenparameter_fehlt`.
//
// `[read]` **Ohne sie wird jede Ursache, die nicht die erste ist, zu
// einem Satz** — und der eine sagt nicht, was zu tun ist.

/**
 * Was `berechne_zielwerte` als `hindernis` zurueckgeben kann.
 *
 * `[read]` **Die ersten vier Namen kommen aus der Datenbank, nicht
 * von hier** — sie muessen zeichengleich zu dem sein, was die
 * Funktion in die Spalte schreibt.
 */
export type Hindernis =
  | 'profil_unvollstaendig'
  | 'zielrichtung_ohne_faktor'
  | 'keine_aktive_phase'
  | 'phasenparameter_fehlt'
  // ══ G-568/A4: dieses kommt NICHT aus der Spalte ═══════════════
  //
  // `[cmd]` **Es ist eine AUSNAHME:** `23514` mit dem Satz
  // *,,nutrition_targets: mehrere aktive Phasen am Gueltigkeitstag;
  // Zielbezug fehlt"* — geworfen von der alten Zweiparameter-Fassung
  // aus G-563 (`563_target_scoped_calculation.sql:284`).
  //
  // `[read]` **Es steht trotzdem hier, weil die Oberflaeche es wie
  // ein Hindernis behandelt** — ein Zustand mit einem Satz, kein
  // HTTP 500 und kein leeres Feld (A4).
  | 'mehrere_phasen'
  // ══ G-630: G-622 rechnet ohne aktives Ziel auf Erhaltung ═══════
  //
  // `[cmd]` **`622_goal_free_maintenance.sql`:** `berechne_zielwerte`
  // schreibt dann `kein_aktives_ziel` (Erhaltung steht) oder
  // `erhaltung_nicht_berechenbar` (keine TDEE-Basis) in `hindernis`,
  // und `zielwerte_am` reicht dasselbe Wort als `herkunft` weiter.
  | 'kein_aktives_ziel'
  | 'erhaltung_nicht_berechenbar'
  // `[cmd]` **G-637 (`637_active_goal_phase_gap.sql`):** das Steuerziel ist
  // aktiv, aber keine Phase laeuft — Erhaltung bleibt die Rechnung.
  | 'ziel_ohne_laufende_phase'
  // `[cmd]` **G-611 (`611_goal_freeze_archive_delete.sql`):** das Steuerziel ist
  // eingefroren (erreicht, Frist abgelaufen, beendet) — Erhaltung mit Warnung.
  | 'ziel_eingefroren'

/**
 * Woher die geltenden Zielwerte kommen — G-630.
 *
 * `[cmd]` **Gespeicherte Zeilen tragen `formel` oder `manuell`, der
 * Rueckfall aus G-622 traegt das Hindernis** (`zielwerte_am`, zweiter
 * Teil des `UNION ALL`). `[read]` **Hier stand bis G-630 eine Glaettung
 * auf `formel`** — damit sah Erhaltung ohne Ziel aus wie ein Plan.
 */
export type Herkunft = 'formel' | 'manuell' | 'kein_aktives_ziel' | 'erhaltung_nicht_berechenbar'
  | 'ziel_ohne_laufende_phase' | 'ziel_eingefroren'

const HERKUENFTE: readonly Herkunft[] = [
  'formel', 'manuell', 'kein_aktives_ziel', 'erhaltung_nicht_berechenbar', 'ziel_ohne_laufende_phase',
  'ziel_eingefroren',
]

/** Unbekanntes faellt auf `formel` — nur so lange, bis eine fuenfte Herkunft auftaucht; der Test liest die Kette. */
export function alsHerkunft(v: unknown): Herkunft {
  return HERKUENFTE.includes(v as Herkunft) ? v as Herkunft : 'formel'
}

/** Laeuft der Tag ohne aktives Ziel? */
export const ohneZiel = (h: Herkunft | null | undefined): boolean =>
  h === 'kein_aktives_ziel' || h === 'erhaltung_nicht_berechenbar' || h === 'ziel_ohne_laufende_phase'
  || h === 'ziel_eingefroren'

/**
 * Der Warnsatz ohne Ziel — Tom 2026-10-08: *„der user muss wissen dass
 * er planlos laeuft"*. Entwurf `Main.dc.html`, Zustand „kein Ziel".
 */
export function ohneZielSatz(h: Herkunft | null | undefined): string | null {
  if (h === 'kein_aktives_ziel') return 'Kein aktives Ziel – du läufst auf Erhaltung.'
  if (h === 'ziel_ohne_laufende_phase') return 'Dein Ziel ist aktiv, hat aber keine laufende Phase – du läufst auf Erhaltung.'
  if (h === 'ziel_eingefroren') return 'Dein Ziel ist abgeschlossen und eingefroren – du läufst auf Erhaltung.'
  if (h === 'erhaltung_nicht_berechenbar') {
    return 'Kein aktives Ziel – und die Erhaltung lässt sich nicht berechnen, deshalb gibt es heute kein Tagesziel.'
  }
  return null
}

/**
 * Der Satz zu einem Hindernis.
 *
 * `[read]` **Er sagt, was zu tun ist** — eine Aussage ueber den
 * eigenen Datenbestand und eine Aufforderung zum Ergaenzen, **keine
 * Bewertung und keine Empfehlung.** Er faellt nicht unter E-74.
 *
 * `[read]` **Eine Quelle fuer beide Seiten** — Lese- und Schreibweg
 * nutzen denselben Text, sonst driften zwei Kopien.
 *
 * @param fehlende Nur fuer `profil_unvollstaendig` — die Feldnamen.
 */
export function hindernisSatz(h: Hindernis, fehlende: string[] = []): string {
  switch (h) {
    case 'profil_unvollstaendig':
      return fehlende.length
        ? `Ergaenze dein Profil: ${fehlende.join(', ')} fehlt noch.`
        : 'Ergaenze dein Profil — es fehlen noch Angaben.'
    case 'keine_aktive_phase':
      return 'Waehle eine Phase. Ohne sie gibt es kein Kalorienziel, '
        + 'weil die Phase das Tempo bestimmt.'
    case 'phasenparameter_fehlt':
      return 'Fuer diese Phase fehlt der Kalorienwert. Trag ihn an der '
        + 'Phase nach, dann rechnet das Ziel.'
    case 'zielrichtung_ohne_faktor':
      // `[read]` **Der einzige Fall, den der Nutzer NICHT aufloesen
      // kann** — der Katalog kennt die Zielrichtung nicht. **Das
      // sagt der Satz, statt eine Handlung vorzutaeuschen.**
      return 'Fuer diese Zielrichtung ist noch kein Kalorienzuschlag '
        + 'hinterlegt. Das liegt nicht an deinen Angaben.'
    case 'mehrere_phasen':
      // `[cmd]` **Die Ausnahme aus G-563** — die alte Fassung wirft,
      // statt still eine Phase zu waehlen. `[read]` **Der Satz sagt,
      // was zu tun ist:** das Ziel nennen, nicht raten.
      return 'Es laufen mehrere Phasen. Waehle das Ziel, fuer das '
        + 'gerechnet werden soll — ohne Zielbezug waere jede Zahl '
        + 'eine von zweien.'
    case 'kein_aktives_ziel':
    case 'erhaltung_nicht_berechenbar':
    case 'ziel_ohne_laufende_phase':
    case 'ziel_eingefroren':
      return ohneZielSatz(h)!
  }
}
