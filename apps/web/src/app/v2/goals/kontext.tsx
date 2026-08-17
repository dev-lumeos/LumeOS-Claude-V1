'use client'

// Der Modalkontext des Goals-Moduls.
//
// QUELLE: theme-v1/module-goals.jsx:4 (`GoalsCtx`) und :147-206.
//
// `[cmd]` Anders als bei Recovery gibt es hier NUR EINEN Kontext —
// `module-goals-pro.jsx` spannt keinen eigenen auf, sondern haelt
// seinen Zustand lokal je Ansicht. Das passt zum Befund: die drei
// Dateien sind ein System, keine konkurrierenden Fassungen.
import * as React from 'react'

import type { Ziel } from './daten'

/** Die sechs Modale des Rahmens. [cmd] module-goals.jsx:198-203. */
export type ModalZustand =
  | { typ: 'newGoal' }
  | { typ: 'goalDet'; ziel: Ziel }
  | { typ: 'logWeight' }
  | { typ: 'logMeasure' }
  | { typ: 'logPhoto' }
  | { typ: 'measureDet'; mass: typeof import('./daten').MEASUREMENTS[number] }

export type GoalsKontextWert = {
  open: (m: ModalZustand) => void
  close: () => void
}

export const GoalsKontext = React.createContext<GoalsKontextWert | null>(null)

export function useGoals(): GoalsKontextWert {
  const v = React.useContext(GoalsKontext)
  if (!v) throw new Error('GoalsKontext fehlt — Tab ausserhalb des Providers gerendert.')
  return v
}
