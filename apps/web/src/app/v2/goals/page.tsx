// Goals der Oberflaeche v2 — der uebernommene Entwurf, ganz Attrappe.
//
// `[cmd]` Die Seitenleiste fuehrt seit G-02 einen Eintrag `Goals & Body`
// mit `href: /v2/goals`. Er zeigte bis hierher ins Leere.
//
// DIESE SEITE LIEST NICHTS — und das ist diesmal eine Entscheidung,
// keine Zwangslage:
//
// `[cmd]` Anders als bei Training (nur Stammdaten) und Recovery (gar
// kein Schema) gibt es hier **echte Daten**: `goals.zielwerte_am`
// liefert seit GO-03/GO-04 kcal, Protein, Kohlenhydrate, Fett, TDEE
// und Zielrichtung; `getZielwerteAm` in
// `apps/web/src/lib/profile/zielwerte-read.ts` liest sie bereits.
//
// `[read]` **Der Auftrag verlangt trotzdem erst das Mockup:** „Die
// Reihenfolge ist Vorgabe — Mockup mit Marken, dann Realdaten, dann
// faellt die Marke." Angebunden wird im Folgeauftrag; welche Kachel
// auf welche Spalte passt, steht in docs/ssot/94-goals-mockup.md,
// Abschnitt „Welche Kachel auf vorhandene Daten passt".
import type { Metadata } from 'next'

import { GoalsAnsicht } from './ansicht'
import './goals.css'

export const metadata: Metadata = {
  title: 'Goals & Body · LumeOS',
}

export default function V2GoalsPage() {
  return <GoalsAnsicht />
}
