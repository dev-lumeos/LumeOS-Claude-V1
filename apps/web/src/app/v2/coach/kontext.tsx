'use client'

// Der Modalkontext des Coach-Moduls.
//
// QUELLE: theme-v1/module-coach.jsx:134 (`CoachCtx`) und :209-215.
//
// `[cmd]` Der Rahmen fuehrt sieben Modaltypen. Zwei davon
// (`athleteDet`, `newPlan`) gehoeren zur Portalseite und werden vom
// Athletenbereich nie geoeffnet — sie stehen in der Vorlage in
// derselben Datei, weil `module-coach.jsx` beide Seiten der Beziehung
// traegt. Hier stehen nur die fuenf, die der Athletenbereich oeffnet.
import * as React from 'react'

import type { Coach, CoachNote } from './daten'

/** Die fuenf Modale des Athletenbereichs. [cmd] module-coach.jsx:209-214. */
export type ModalZustand =
  | { typ: 'coachDetail'; c: Coach }
  | { typ: 'invite' }
  | { typ: 'scan' }
  | { typ: 'thread'; c: Coach }
  | { typ: 'noteDet'; n: CoachNote }

export type CoachKontextWert = {
  open: (m: ModalZustand) => void
  close: () => void
}

export const CoachKontext = React.createContext<CoachKontextWert | null>(null)

export function useCoach(): CoachKontextWert {
  const v = React.useContext(CoachKontext)
  if (!v) throw new Error('CoachKontext fehlt — Tab ausserhalb des Providers gerendert.')
  return v
}
