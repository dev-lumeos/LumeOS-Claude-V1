// Recovery-Kuerzel -> Muskel-ID der Koerperkarte.
//
// `[cmd]` DIE BEIDEN LISTEN SIND NICHT DECKUNGSGLEICH. Recovery fuehrt
// 18 Kuerzel (motor.ts:28-34), die uebernommene Karte 21 Gruppen
// (koerperkarte-pfade.ts) — davon fuenf, die keine Muskeln sind
// (Kopf, Haare, Haende, Knoechel, Fuesse) und die Figur zeichnen.
//
// **Jede Zeile ist geprueft, keine geraten.** Wo die Karte gruenlicher
// zeichnet als Recovery unterscheidet, steht der Grund daneben.
import { MUSKELN } from '@lumeos/ui'

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
