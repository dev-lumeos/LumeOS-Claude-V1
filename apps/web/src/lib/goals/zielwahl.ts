// G-610 — „Ziel setzen" in zwei Ebenen. **Reine Rechnung, kein I/O.**
//
// **Tom, 2026-10-07:** *„reiter Goals mit den simplen zielen die schon
// drin anlegbar sind, da muss es nur noch zusaetzlich in das modal zum
// anlegen verbaut werden"* — Ebene 1: Richtung (Abnehmen · Halten ·
// Aufbauen) mit vorgewaehlter Standardvariante; Ebene 2 „Vorgehen
// anpassen": die Varianten der Richtung, gesperrte sichtbar.
//
// `[cmd]` **Keine Liste im Code:** Richtung, Grad und Standard kommen aus
// `goals.goal_strategies` (G-614: `auswahl_gruppe`, `min_erfahrung`,
// `standard`), die Rangfolge der Grade aus `EXPERIENCE_LEVELS`.
//
// `[read]` **`uebergang` (reverse_diet) ist keine Wahl**, sondern der
// empfohlene naechste Schritt nach einem Abnehmziel; **`plan`** gehoert in
// den Planer (Reiter Phase engine, G-615).
import { EXPERIENCE_LEVELS } from '../profile/profile-model'
import { phasenName } from './phase-regeln'
import type { Strategie } from './strategie-read'

/** Die Richtungen von Ebene 1 — gruppen mit einer Standardvariante. */
export type Richtung = { gruppe: string; standard: Strategie }

/**
 * Je Gruppe mit Standard eine Richtung. `[read]` **Die CHECK-Regel
 * erlaubt `standard` nur in abnehmen/halten/aufbauen** — deshalb ergeben
 * sich genau diese drei, ohne sie hier zu nennen. Reihenfolge: nach der
 * Rate des Standards, Abnehmen (−) vor Halten (keine) vor Aufbauen (+).
 */
export function richtungen(alle: Strategie[]): Richtung[] {
  return alle
    .filter(s => s.standard && s.auswahl_gruppe)
    .map(s => ({ gruppe: s.auswahl_gruppe!, standard: s }))
    .sort((a, b) => (a.standard.weight_change_target_percent ?? 0)
      - (b.standard.weight_change_target_percent ?? 0))
}

/** Rang eines Grades in `EXPERIENCE_LEVELS`; unbekannt = −1. */
export function gradRang(g: string | null | undefined): number {
  return (EXPERIENCE_LEVELS as readonly string[]).indexOf(g ?? '')
}

/**
 * Gesperrt, wenn die Variante einen hoeheren Grad verlangt als der
 * Nutzer hat. `[read]` **Kein Grad im Profil zaehlt wie der niedrigste**
 * — sonst saehe ein leeres Profil mehr als ein Anfaenger.
 */
export function gesperrt(s: Strategie, grad: string | null): boolean {
  const eigen = Math.max(gradRang(grad), 0)
  return gradRang(s.min_erfahrung) > eigen
}

/** Die Varianten einer Richtung: Standard zuerst, dann nach Grad, dann nach Name. */
export function varianten(alle: Strategie[], gruppe: string): Strategie[] {
  return alle
    .filter(s => s.auswahl_gruppe === gruppe)
    .sort((a, b) => Number(b.standard) - Number(a.standard)
      || gradRang(a.min_erfahrung) - gradRang(b.min_erfahrung)
      || a.label.localeCompare(b.label))
}

/** Die Strategien, die in den Planer gehoeren (`plan`) — fuer den Hinweis. */
export function planStrategien(alle: Strategie[]): Strategie[] {
  return alle.filter(s => s.auswahl_gruppe === 'plan')
}

/**
 * Die Namen aus `next_codes` — teils Strategien, teils Phasenarten; beides
 * wird benannt, nichts geraten. G-628: eine Stelle fuer Planer und „Ziel
 * setzen" (A3 „Danach empfohlen").
 */
export function naechsteNamen(s: Strategie, alle: Strategie[]): string[] {
  return s.next_codes.map(c => alle.find(x => x.code === c)?.label ?? phasenName(c))
}

/**
 * Der empfohlene naechste Schritt nach einem Ziel dieser Variante:
 * die Uebergaenge aus `next_codes`. `[cmd]` **`reverse_diet` steht in
 * `next_codes` aller Abnehmvarianten ausser `mini_cut`.**
 */
export function empfohlenDanach(s: Strategie, alle: Strategie[]): Strategie[] {
  return s.next_codes
    .map(c => alle.find(x => x.code === c))
    .filter((x): x is Strategie => !!x && x.auswahl_gruppe === 'uebergang')
}
