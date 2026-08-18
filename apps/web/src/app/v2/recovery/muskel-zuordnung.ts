// Recovery-Kuerzel -> Muskel-ID der Koerperkarte.
//
// `[cmd]` DIE BEIDEN LISTEN SIND NICHT DECKUNGSGLEICH. Recovery fuehrt
// 18 Kuerzel (motor.ts:28-34), die Karte 39 IDs: **17 einfaerbbare
// Gruppen**, 6 Nicht-Muskeln (Kniescheibe, Kopf, Haare, Haende,
// Knoechel, Fuesse) und 16 Injektionsorte. Vollstaendig aufgeschluesselt
// in `EINORDNUNG` unten — G-44 hat die Zahlen zur Laufzeit gezaehlt und
// die frueheren „21 Gruppen, fuenf Nicht-Muskeln" berichtigt.
//
// **Jede Zeile ist geprueft, keine geraten.** Wo die Karte gruenlicher
// zeichnet als Recovery unterscheidet, steht der Grund daneben.
import { MUSKELN } from '@lumeos/ui'

// ---------------------------------------------------------------------
// EINORDNUNG — was jede ID der Karte ist (G-44)
// ---------------------------------------------------------------------
//
// `[read]` Tom, 2026-08-18: „Recheck, ob alle Muskeln in der Grafik auch
// in der Liste auftauchen."
//
// `[cmd]` DIE KARTE FUEHRT 39 IDs: 23 in `MUSKELN`, 16 in
// `INJEKTIONS_ORTE`. Zur Laufzeit gezaehlt (`Object.keys`), nicht per
// grep — an einem `[a-z_]+`-Muster ist in G-26 schon `upper-back`
// durchgefallen und waere dauerhaft grau geblieben.
//
// **Jede der 39 bekommt hier eine Einordnung.** Der Test
// `karten-ids.test.ts` macht eine fehlende zum Fehler; sonst waechst
// die Liste still weiter.
//
// `[annahme]` ZU TOMS ZAEHLUNG VON 41: die beiden zusaetzlichen sind
// `label` und `side` — das sind **Eigenschaften** der
// Injektionsort-Objekte, keine IDs. Aus demselben Grund taucht `both`
// als vermeintliche ID auf: es ist der WERT von `side` bei
// beidseitigen Muskeln. In der Zuordnung stand `both` nie; es kommt
// nur in einem Kommentar vor.

export type Einordnung =
  /** Eine Muskelgruppe, die eingefaerbt werden kann. */
  | { art: 'gruppe'; name: string }
  /** Teilstueck einer Gruppe — ein Injektionsort, keine Flaeche. */
  | { art: 'teilstueck'; von: string; name: string }
  /** Zeichnet die Figur, traegt keinen Zustand. */
  | { art: 'nicht-muskel'; name: string }

export const EINORDNUNG: Record<string, Einordnung> = {
  // ── 17 Muskelgruppen (einfaerbbar) ────────────────────────────────
  chest: { art: 'gruppe', name: 'Brust' },
  abs: { art: 'gruppe', name: 'Bauch' },
  obliques: { art: 'gruppe', name: 'Seitliche Bauchmuskeln' },
  biceps: { art: 'gruppe', name: 'Bizeps' },
  triceps: { art: 'gruppe', name: 'Trizeps' },
  deltoids: { art: 'gruppe', name: 'Schultern' },
  trapezius: { art: 'gruppe', name: 'Trapezmuskel' },
  neck: { art: 'gruppe', name: 'Nacken' },
  forearm: { art: 'gruppe', name: 'Unterarm' },
  adductors: { art: 'gruppe', name: 'Adduktoren (Innenseite)' },
  quadriceps: { art: 'gruppe', name: 'Quadrizeps' },
  calves: { art: 'gruppe', name: 'Waden' },
  'upper-back': { art: 'gruppe', name: 'Oberer Ruecken (mit Latissimus)' },
  'lower-back': { art: 'gruppe', name: 'Unterer Ruecken' },
  gluteal: { art: 'gruppe', name: 'Gesaess' },
  hamstring: { art: 'gruppe', name: 'Beinbeuger' },
  // `[cmd]` DIE EINZIGE GRUPPE OHNE RECOVERY-KUERZEL. Die Karte
  // zeichnet den Schienbeinmuskel, `MUSCLE_GROUPS_BODYMAP` (motor.ts:28)
  // fuehrt ihn nicht — deshalb bleibt er grau. **Kein Zuordnungsfehler,
  // sondern eine Luecke auf der Datenseite.** Ein Kuerzel zu erfinden
  // hiesse, eine Muskelgruppe zu erfinden, die das Modul nicht misst.
  tibialis: { art: 'gruppe', name: 'Schienbeinmuskel — ohne Recovery-Kuerzel' },
  // `knees` zeichnet die Kniescheibe. Sie liegt in `MUSKELN`, ist aber
  // Knochen, kein Muskel — deshalb `nicht-muskel`, siehe unten.

  // ── Nicht-Muskeln: sie zeichnen die Figur ─────────────────────────
  // `[cmd]` Sie tragen keinen Zustand und bleiben in der Grundfarbe.
  // Am Bildschirm gemessen: `var(--surface-2)` bzw. der feste
  // Hautton. Das ist beabsichtigt — die Gestaltungsfrage dazu steht
  // im Bericht.
  knees: { art: 'nicht-muskel', name: 'Kniescheibe' },
  head: { art: 'nicht-muskel', name: 'Kopf (fester Hautton)' },
  hair: { art: 'nicht-muskel', name: 'Haare (fester Ton)' },
  hands: { art: 'nicht-muskel', name: 'Haende' },
  ankles: { art: 'nicht-muskel', name: 'Knoechel' },
  feet: { art: 'nicht-muskel', name: 'Fuesse' },

  // ── 16 Injektionsorte: Punkte, keine Flaechen ─────────────────────
  // `[cmd]` Sie liegen in `INJEKTIONS_ORTE` und werden als Kreis ueber
  // die Figur gelegt (`InjektionsKarte`), nicht als Flaeche
  // eingefaerbt. Ein Teilstueck einzufaerben ergaebe einen halben
  // Muskel — `karten-ids.test.ts` verbietet das.
  delt_l: { art: 'teilstueck', von: 'deltoids', name: 'Schulter links' },
  delt_r: { art: 'teilstueck', von: 'deltoids', name: 'Schulter rechts' },
  pec_l: { art: 'teilstueck', von: 'chest', name: 'Brust links' },
  pec_r: { art: 'teilstueck', von: 'chest', name: 'Brust rechts' },
  bicep_l: { art: 'teilstueck', von: 'biceps', name: 'Bizeps links' },
  bicep_r: { art: 'teilstueck', von: 'biceps', name: 'Bizeps rechts' },
  quad_l: { art: 'teilstueck', von: 'quadriceps', name: 'Oberschenkel links' },
  quad_r: { art: 'teilstueck', von: 'quadriceps', name: 'Oberschenkel rechts' },
  glute_l: { art: 'teilstueck', von: 'gluteal', name: 'Gesaess links' },
  glute_r: { art: 'teilstueck', von: 'gluteal', name: 'Gesaess rechts' },
  // `[cmd]` „Ventrogluteal" ist eine anerkannte Injektionsstelle in der
  // Gesaessregion (vorderer oberer Anteil), **kein Vastus und keine
  // Wade** — die Vermutung im Auftrag traf nicht zu. Die Vorlage
  // beschriftet sie selbst so (koerperkarte-pfade.ts:256).
  vg_l: { art: 'teilstueck', von: 'gluteal', name: 'Ventrogluteal links' },
  vg_r: { art: 'teilstueck', von: 'gluteal', name: 'Ventrogluteal rechts' },
  // `[cmd]` Der Latissimus hat KEINE eigene Flaeche — er steckt in
  // `upper-back` (6 Pfade ueber den ganzen oberen Ruecken). Die beiden
  // Punkte liegen darueber.
  lat_l: { art: 'teilstueck', von: 'upper-back', name: 'Latissimus links' },
  lat_r: { art: 'teilstueck', von: 'upper-back', name: 'Latissimus rechts' },
  tricep_l: { art: 'teilstueck', von: 'triceps', name: 'Trizeps links' },
  tricep_r: { art: 'teilstueck', von: 'triceps', name: 'Trizeps rechts' },
}

/** Die IDs je Art — fuer den Bericht und die Pruefung. */
export function nachArt(art: Einordnung['art']): string[] {
  return Object.entries(EINORDNUNG).filter(([, e]) => e.art === art).map(([k]) => k)
}

/**
 * `null` heisst: die Karte kennt diesen Muskel nicht getrennt.
 * Der Wert wird dann nicht dargestellt — **nicht** auf einen
 * benachbarten Muskel gelegt. Eine erfundene Zuordnung waere eine
 * Falschaussage ueber den Koerper.
 */
export const RECOVERY_ZU_KARTE: Record<string, string | null> = {
  // Deckungsgleich — gleicher Name, gleiche Gruppe.
  chest: 'chest',
  abs: 'abs',
  obliques: 'obliques',
  biceps: 'biceps',
  triceps: 'triceps',
  forearm: 'forearm',
  quadriceps: 'quadriceps',
  hamstring: 'hamstring',
  gluteal: 'gluteal',
  calves: 'calves',
  neck: 'neck',
  trapezius: 'trapezius',

  // Recovery trennt vorne/hinten, die Karte fuehrt `deltoids` mit
  // `side:'both'` — ein Eintrag, zwei Pfadsaetze. Beide Kuerzel zeigen
  // deshalb auf dieselbe Gruppe; die Karte zeichnet den vorderen Teil
  // in der Vorderansicht, den hinteren in der Rueckansicht.
  front_deltoids: 'deltoids',
  back_deltoids: 'deltoids',

  // `adductor` (Recovery, Einzahl) und `adductors` (Karte, Mehrzahl).
  // Dieselbe Gruppe, anderer Numerus.
  adductor: 'adductors',

  // `[cmd]` UNTERSTRICH GEGEN BINDESTRICH. Die Karte schreibt diese
  // beiden mit Bindestrich (`upper-back`), Recovery mit Unterstrich.
  //
  // **Beinahe falsch eingestuft:** Der erste Durchgang hat sie als
  // „keine Entsprechung" gefuehrt, weil die Suche nach `[a-z_]+` den
  // Bindestrich nicht traf. Am Bildschirm waeren zwei Muskelgruppen
  // dauerhaft grau geblieben, ohne Fehlermeldung. Aufgefallen ist es
  // erst, als die gerenderten Gruppen im Browser gezaehlt wurden.
  upper_back: 'upper-back',
  lower_back: 'lower-back',

  // `abductors` — die Karte fuehrt nur `adductors` (Innenseite). Die
  // Aussenseite fehlt ihr. Nicht auf `gluteal` legen: das ist ein
  // anderer Muskel.
  abductors: null,
}

/** Die Kuerzel, die die Karte nicht darstellen kann. */
export const OHNE_ENTSPRECHUNG = Object.entries(RECOVERY_ZU_KARTE)
  .filter(([, v]) => v === null)
  .map(([k]) => k)

/**
 * Zurueck: Muskel-ID der Karte -> Recovery-Kuerzel.
 *
 * `[cmd]` GEBRAUCHT BEIM KLICK. Die Karte meldet ihre eigene ID
 * (`chest`, `deltoids`); das Muskeldetail-Fenster schlaegt aber in
 * `MUSCLE_STATE` und `MUSCLE_LABEL` nach, und die sind auf
 * Recovery-Kuerzel gebaut (modale.tsx:340, 354). Ohne diese Richtung
 * oeffnet ein Klick auf die Schulter ein leeres Fenster.
 *
 * `deltoids` hat zwei Urbilder — vorne und hinten. Genommen wird
 * `front_deltoids`: die Karte kann beim Klick nicht sagen, welche
 * Ansicht gemeint war, und vorne ist die haeufigere Auswahl. `[read]`
 * Das ist eine Entscheidung, keine Messung — wenn es stoert, trennt
 * man den Klick nach Ansicht.
 */
export const KARTE_ZU_RECOVERY: Record<string, string> = (() => {
  const k: Record<string, string> = {}
  for (const [slug, id] of Object.entries(RECOVERY_ZU_KARTE)) {
    if (!id) continue
    if (k[id]) continue // erster gewinnt — front_deltoids vor back_deltoids
    k[id] = slug
  }
  return k
})()

/**
 * Rechnet Recovery-Werte auf die Karte um.
 *
 * `werte`: Prozent je Recovery-Kuerzel. Rueckgabe: was
 * `ErmuedungsKarte` erwartet.
 *
 * `[cmd]` ACHTUNG, UMGEKEHRTE RICHTUNG: Recovery fuehrt
 * BEREITSCHAFT (100 = erholt), die Karte ERMUEDUNG (100 = platt).
 * `module-recovery-v2.jsx:68` faerbt `>= 80` gruen, die Karte faerbt
 * `<= 25` gruen. Ohne diese Umrechnung stuende der Koerper auf Rot,
 * wenn er erholt ist.
 */
export function alsErmuedung(
  werte: Record<string, number | null | undefined>,
): Array<{ id: string; fatigue: number }> {
  const raus: Array<{ id: string; fatigue: number }> = []
  const gesehen = new Set<string>()
  for (const [slug, wert] of Object.entries(werte)) {
    if (wert == null) continue
    const id = RECOVERY_ZU_KARTE[slug]
    if (!id || !MUSKELN[id]) continue
    // Beide Deltoid-Kuerfel zeigen auf dieselbe Gruppe. Der schlechtere
    // Wert gewinnt — eine Karte, die den besseren zeigt, beruhigt
    // faelschlich.
    const ermuedung = 100 - wert
    const schon = raus.find(r => r.id === id)
    if (schon) {
      schon.fatigue = Math.max(schon.fatigue, ermuedung)
      continue
    }
    gesehen.add(id)
    raus.push({ id, fatigue: ermuedung })
  }
  return raus
}

/**
 * Der Check-in misst Muskelkater in Stufen 0-3.
 *
 * `[cmd]` `module-recovery-v2.jsx:302` — dort ist 0 = kein Kater, also
 * bereits die Ermuedungsrichtung; keine Umkehr noetig. Die vier Farben
 * sind die des Entwurfs (tab-checkin.tsx), nicht die Ermuedungsampel —
 * die Stufe 1 „mild" ist dort gruenlich (`--acc-recov`), nicht gelb.
 */
const KATER_FARBE = [
  'var(--surface-2)',   // 0 none
  'var(--acc-recov)',   // 1 mild
  'var(--warn)',        // 2 moderate
  'var(--neg)',         // 3 severe
]

export function katerAlsMuskeln(
  werte: Record<string, number | null | undefined>,
): Array<{ id: string; color: string; opacity: number }> {
  const raus: Array<{ id: string; color: string; opacity: number; stufe: number }> = []
  for (const [slug, wert] of Object.entries(werte)) {
    if (wert == null) continue
    const id = RECOVERY_ZU_KARTE[slug]
    if (!id || !MUSKELN[id]) continue
    const stufe = Math.min(Math.max(Math.round(wert), 0), 3)
    const schon = raus.find(r => r.id === id)
    // Deltoids: der schlechtere Wert gewinnt, wie oben.
    if (schon) {
      if (stufe > schon.stufe) {
        schon.stufe = stufe
        schon.color = KATER_FARBE[stufe]
      }
      continue
    }
    raus.push({ id, color: KATER_FARBE[stufe], opacity: 0.85, stufe })
  }
  return raus.map(({ id, color, opacity }) => ({ id, color, opacity }))
}
