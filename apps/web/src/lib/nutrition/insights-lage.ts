// ════════════════════════════════════════════════════════════════════
// DIE VIER INSIGHTS-KACHELN — G-291/292/293/295
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **Serverfrei.** Kein Import aus dem Leseweg — A-30.
//
// `[cmd]` **`SPEC_10`, *Insights Components (6)*.** Vier davon sind
// dieser Auftrag; `DeficitSuggestions` ist gemeldet statt gebaut
// (siehe unten), `CrossModuleInsights` wartet auf C-324.

// ══ DER ZEITRAUM ════════════════════════════════════════════════════
//
// `[cmd]` **SPEC_10 nennt 7/14/30, der Nutrients-Reiter fuehrt
// 1/7/30/90.** `[read]` **Der Auftrag sagt: eine Auswahl, nicht
// zwei.** Genommen ist die der Spec — sie gilt fuer diesen Reiter,
// und der Nutrients-Reiter bleibt unberuehrt.
//
// `[cmd]` **Der Altbestand zeigt sie NEBENEINANDER**, nicht als
// Umschalter: `TrendAnalysis.tsx:` drei `TrendCard` fuer 7d/14d/30d.
// `[read]` **Hier ist es eine Wahl** — drei Diagramme nebeneinander
// waeren auf 375 px unlesbar, und der Reiter traegt schon zwei
// Kacheln.
export const FENSTER = [7, 14, 30] as const
export type Fenster = (typeof FENSTER)[number]

// ══ DER ZUKUNFTSFEHLER ══════════════════════════════════════════════
//
// `[cmd]` **Gemessen am 2026-08-31: `daily_summary` traegt fuer `dev`
// 104 vergangene und 77 KUENFTIGE Tage**, bis 2026-11-16 — die Seeds
// reichen bewusst in die Zukunft.
//
// `[read]` **Ein Zeitfenster ohne obere Grenze faengt sie mit.**
// `entry_date > current_date - 7` lieferte in der Messung **55 Tage
// statt 7.** **Ein Trend, der morgen mitzeichnet, ist keiner.**

/** Ein Tag der Reihe — was das Diagramm braucht. */
export type TrendTag = {
  datum: string
  kcal: number | null
  protein: number | null
  carbs: number | null
  fett: number | null
}

/**
 * Die Tage eines Fensters, beidseitig begrenzt.
 *
 * `[read]` **`heute` kommt als Argument, nie aus `new Date()`** —
 * sonst rechnet der Server eine andere Grenze als der Browser.
 */
export function imFenster(
  tage: readonly TrendTag[], fenster: Fenster, heute: string,
): TrendTag[] {
  const von = new Date(`${heute}T00:00:00`)
  von.setDate(von.getDate() - (fenster - 1))
  const vonStr = von.toISOString().slice(0, 10)
  return tage
    .filter(t => t.datum >= vonStr && t.datum <= heute)
    .sort((a, b) => a.datum.localeCompare(b.datum))
}

/** Mittelwert ueber die belegten Tage, oder `null`. */
export function schnitt(
  tage: readonly TrendTag[], feld: 'kcal' | 'protein' | 'carbs' | 'fett',
): number | null {
  const werte = tage.map(t => t[feld]).filter((w): w is number => w !== null)
  if (werte.length === 0) return null
  return Math.round(werte.reduce((s, w) => s + w, 0) / werte.length)
}

/**
 * Der Pfad, mit Unterbrechung an jeder Luecke.
 *
 * `[read]` **`M` nach jedem `null`** — sonst verbindet der Pfad zwei
 * Punkte ueber einen Tag hinweg, den es nicht gibt.
 */
export function pfadMitLuecken(
  werte: Array<number | null>, zuX: (i: number) => number, zuY: (v: number) => number,
): string {
  let d = ''
  let neu = true
  werte.forEach((w, i) => {
    if (w === null) { neu = true; return }
    d += `${neu ? 'M' : 'L'}${zuX(i).toFixed(1)} ${zuY(w).toFixed(1)} `
    neu = false
  })
  return d.trim()
}

// ══ G-295: DIE HEATMAP ══════════════════════════════════════════════
//
// `[cmd]` **`HeatmapView.js` (68 Zeilen): 7x5-Kalendergitter,
// Farbintensitaet je Tag, Legende in fuenf Stufen.**
//
// `[read]` **Warum sie NICHT dasselbe zeigt wie die Sparkline:** die
// Sparkline zeigt EINEN Naehrstoff ueber die Zeit; die Heatmap zeigt
// EINEN TAG je Feld, ueber alles zusammengefasst. **Nicht „wie lief
// Vitamin C", sondern „welche Tage waren gut".**
//
// `[cmd]` **Meine Abnahme vom 30.08. war darin falsch** — sie stand
// im G-264-Bericht und ist mit G-295 berichtigt.

/**
 * Die Deckung eines Tages in Prozent, oder `null`.
 *
 * `[read]` **Ohne Ziel keine Deckung.** `[cmd]` Die Vorlage rechnet
 * gegen ein festes `calTarget = 2100`; **hier kommt das Ziel aus
 * `goals.nutrition_targets`** — und fehlt es, ist die Antwort `null`
 * und nicht 100 %.
 */
export function deckung(kcal: number | null, ziel: number | null): number | null {
  if (kcal === null || ziel === null || ziel <= 0) return null
  return Math.round((kcal / ziel) * 100)
}

// `[cmd]` **`tagNummer()` ist in G-297 entfernt.** Sie schrieb die
// Tageszahl ins Feld; `[cmd]` **Tom am 2026-08-31: *,,tagesdeckung
// geht kleiner"*** — und der Auftrag sagt, die Zahl sei
// verzichtbar. **Ohne Ziffer darf das Feld 26 px klein sein.**
//
// `[read]` **A-59: nicht aufgerufen heisst entfernt**, nicht
// stehengelassen. Der Waechter dazu faellt mit ihr weg; die Zahl
// steht jetzt im `title` und wird dort nicht gerechnet.

export type Stufe = 'optimal' | 'gut' | 'knapp' | 'gering' | 'leer'

/**
 * Die fuenf Stufen der Vorlage, unveraendert uebernommen.
 *
 * `[cmd]` `HeatmapView.js:16-21` — >=95 / >=85 / >=75 / darunter /
 * kein Eintrag.
 */
export function stufeVon(pct: number | null): Stufe {
  if (pct === null) return 'leer'
  if (pct >= 95) return 'optimal'
  if (pct >= 85) return 'gut'
  if (pct >= 75) return 'knapp'
  return 'gering'
}

export const STUFE_FARBE: Record<Stufe, string> = {
  optimal: 'var(--pos)',
  gut: 'color-mix(in oklch, var(--pos) 60%, var(--surface))',
  knapp: 'var(--warn)',
  gering: 'var(--neg)',
  leer: 'var(--surface-2)',
}

export const STUFE_TEXT: Record<Stufe, string> = {
  optimal: '≥ 95 % des Ziels',
  gut: '85–94 %',
  knapp: '75–84 %',
  gering: '< 75 %',
  leer: 'kein Eintrag',
}

// ══ G-293: DIE FETTHIERARCHIE ═══════════════════════════════════════
//
// `[cmd]` **Gemessen am 2026-08-31, 30 Tage:** `FAT` 65,40 g im
// Schnitt, darunter `FASAT` 14,07 · `FAMS` 29,95 · `FAPU` 11,29, und
// unter `FAPU` wiederum `FAPUN3` 4,44 · `FAPUN6` 6,84.
//
// `[read]` **Die Summe der Teile ist kleiner als das Ganze** —
// 14,07 + 29,95 + 11,29 = 55,31 gegen 65,40. **Das ist kein Fehler:**
// der BLS fuehrt weitere Fettbestandteile, die keine der drei Gruppen
// traegt. **Wer die Differenz verschweigt, behauptet eine
// vollstaendige Aufteilung.**
//
// `[cmd]` **Bei den Kohlenhydraten war die Differenz dagegen ein
// eigener Fehler, gefunden am 2026-08-31 auf dem Bildschirmfoto:**
// dort standen **197,98 g „nicht aufgeschluesselt"**, weil `STARCH`
// (234,54) und `POLYL` (2,36) im Baum fehlten. **Beide gibt es, beide
// sind an allen 30 Tagen gefuellt.** Mit ihnen bleibt ein Rest von
// **0,50 g.**
//
// `[read]` **Eine grosse Differenz ist deshalb ein Verdacht, keine
// Aussage** — erst nachsehen, ob der Teil einen Code hat.

export type MakroKnoten = {
  code: string
  name: string
  wert: number | null
  einheit: string
  /** Wie viele der Tage den Wert vollstaendig tragen. */
  vollstaendig: number
  tage: number
  kinder: MakroKnoten[]
}

/**
 * Traegt der Knoten eine vollstaendige Aussage?
 *
 * `[cmd]` **`FAMS` ist an 25 von 30 Tagen vollstaendig, `FIBT` an
 * 24.** `[read]` **Das gehoert an die Zeile**, sonst liest sich ein
 * Schnitt aus 25 Tagen wie einer aus 30.
 */
export function istVollstaendig(k: MakroKnoten): boolean {
  return k.tage > 0 && k.vollstaendig === k.tage
}

export function luekenSatz(k: MakroKnoten): string {
  if (istVollstaendig(k)) return ''
  return `aus ${k.vollstaendig} von ${k.tage} Tagen`
}

/**
 * Was die Kinder nicht erklaeren.
 *
 * `[read]` **`null`, wenn eines der Kinder keinen Wert hat** — eine
 * Differenz aus unvollstaendigen Teilen ist keine Differenz.
 *
 * `[read]` **Und `null`, wenn die Teile das Ganze uebersteigen.** Ein
 * negativer „Rest" ist keine unaufgeschluesselte Menge, sondern ein
 * Hinweis darauf, dass ein Kind nicht in den Elternwert gehoert.
 *
 * `[cmd]` **Genau das ist am 2026-08-31 passiert:** `FIBT` stand
 * unter `CHO`, und die Teile ergaben 320,78 gegen 281,86.
 * **`CHO` ist *Kohlenhydrate, VERFUEGBAR*** — Ballaststoffe zaehlen
 * nicht hinein. **Richtig zugeordnet bleibt ein Rest von 0,50 g.**
 */
export function restVon(eltern: MakroKnoten): number | null {
  if (eltern.wert === null || eltern.kinder.length === 0) return null
  if (eltern.kinder.some(k => k.wert === null)) return null
  const summe = eltern.kinder.reduce((s, k) => s + (k.wert ?? 0), 0)
  const rest = eltern.wert - summe
  // `[read]` Eine Toleranz waere hier falsch: der Fall ist ein
  // Zuordnungsfehler, kein Rundungsrest.
  if (rest < 0) return null
  return Math.round(rest * 100) / 100
}

// ══ G-292: DIE WARNUNGEN ════════════════════════════════════════════
//
// `[cmd]` **`reference_assessment_window_flags` liefert je Naehrstoff:
// `triggered_day_count`, `assessed_day_count`,
// `incomplete_day_count`.**
//
// `[cmd]` **Gemessen bei 30 Tagen: 11 Flags** — Wasser 30/30,
// Magnesium 30/30 (upper_limit), Linolsaeure 29/30, Natrium und Salz
// je 27/30 … bis Chlorid mit **4 von 8 bewerteten Tagen und 22
// unvollstaendigen.**
//
// `[read]` **Eine Warnung aus 8 bewerteten Tagen wiegt weniger als
// eine aus 30.** **Das gehoert in die Sortierung UND an die Zeile** —
// sonst steht Chlorid neben Wasser, als waere beides gleich belegt.

export type Flag = {
  code: string
  name: string
  richtung: string
  getroffen: number
  bewertet: number
  unvollstaendig: number
}

/**
 * Der Anteil betroffener Tage — die Schwere.
 *
 * `[read]` **Gegen die BEWERTETEN Tage, nicht gegen das Fenster.**
 * Sonst sieht ein Naehrstoff harmlos aus, nur weil er selten
 * messbar war.
 */
export function anteil(f: Flag): number | null {
  if (f.bewertet <= 0) return null
  return Math.round((f.getroffen / f.bewertet) * 100)
}

/** Wie belastbar ist die Aussage? */
export type Belastbarkeit = 'belegt' | 'duenn'

/**
 * `[read]` **Unter der Haelfte des Fensters bewertet heisst duenn.**
 * `[cmd]` Bei 30 Tagen trifft das Chlorid (8) und EPA (12).
 */
export function belastbarkeit(f: Flag, fenster: number): Belastbarkeit {
  return f.bewertet >= Math.ceil(fenster / 2) ? 'belegt' : 'duenn'
}

export const DUENN_SATZ =
  'Nur an wenigen Tagen bewertbar — die Aussage steht auf schmaler Grundlage.'

/**
 * Sortiert nach Schwere, Duennes nach hinten.
 *
 * `[read]` **Zwei Schluessel, nicht einer:** erst die Belastbarkeit,
 * dann der Anteil. **Ein Flag aus 8 Tagen gehoert nicht an die
 * Spitze, auch wenn sein Anteil hoch ist.**
 */
export function sortiere(flags: readonly Flag[], fenster: number): Flag[] {
  return [...flags].sort((a, b) => {
    const ba = belastbarkeit(a, fenster) === 'belegt' ? 0 : 1
    const bb = belastbarkeit(b, fenster) === 'belegt' ? 0 : 1
    if (ba !== bb) return ba - bb
    return (anteil(b) ?? 0) - (anteil(a) ?? 0)
  })
}

// ══ DeficitSuggestions — GEMELDET, NICHT GEBAUT ═════════════════════
//
// `[cmd]` **`SPEC_10` nennt sie: *„Food-Empfehlungen basierend auf
// aktuellen Defiziten"*.**
//
// `[cmd]` **C-108/F-02: nennen ja, bewerten nein** — ausdruecklich in
// C-113: *„Was nicht gebaut wird: Dosierungsempfehlung, Zyklusaufbau,
// PCT-Protokoll, Kombinationsvorschlag."*
//
// `[read]` **Eine Lebensmittelempfehlung aufgrund eines Defizits ist
// beides zugleich** — sie bewertet den Zustand („dir fehlt X") und
// schreibt eine Handlung vor („iss Y"). **Der Widerspruch ist echt
// und nicht durch Formulierung aufzuloesen.**
//
// `[read]` **Was ohne Bewertung ginge:** die Warnung nennt den
// Naehrstoff und seine Deckung — das tut `MicroFlagsList` bereits.
// **Welches Lebensmittel das schliessen soll, ist der Schritt, den
// C-108 verbietet.**
export const DEFIZIT_WIDERSPRUCH =
  'SPEC_10 nennt „Food-Empfehlungen basierend auf aktuellen Defiziten". '
  + 'C-108/F-02 verbietet Empfehlungen: nennen ja, bewerten nein. '
  + 'Beides zusammen geht nicht — die Kachel ist gemeldet, nicht gebaut.'
