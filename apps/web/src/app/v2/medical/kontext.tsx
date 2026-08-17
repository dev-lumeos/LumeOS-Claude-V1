'use client'

// Der Modalkontext des Medical-Moduls.
//
// QUELLE: theme-v1/module-medical-v2.jsx:3 (`MedCtx2`) und :5-59.
//
// `[cmd]` Der Name `MedCtx2` sagt es: es gibt auch `MedCtx` im alten
// Rahmen (`module-medical.jsx`). Uebernommen ist der zweite — Beleg im
// Bericht.
import * as React from 'react'

import type { Biomarker, Symptom, Medikament } from './daten'

/** Die acht Modale. [cmd] module-medical-v2.jsx:49-56. */
export type ModalZustand =
  | { typ: 'biomarker'; b: Biomarker }
  | { typ: 'symptom'; s: Symptom }
  | { typ: 'logSymptom' }
  | { typ: 'med'; m: Medikament }
  | { typ: 'export' }
  | { typ: 'privacy' }
  | { typ: 'ocrReview' }
  | { typ: 'manualEntry' }

export type MedicalKontextWert = {
  open: (m: ModalZustand) => void
  close: () => void
}

export const MedicalKontext = React.createContext<MedicalKontextWert | null>(null)

export function useMedical(): MedicalKontextWert {
  const v = React.useContext(MedicalKontext)
  if (!v) throw new Error('MedicalKontext fehlt — Tab ausserhalb des Providers gerendert.')
  return v
}
