'use client'

// Der Modal-Kontext des Training-Moduls.
//
// QUELLE: theme-v1/module-training-extras.jsx:4 (`TrainCtx`) und
// :33-50 (`TrainingModuleEnhanced`). Die Vorlage umhuellt dort das
// bereits definierte `window.TrainingModule` nachtraeglich mit einem
// Provider — eine Notloesung, weil die vier Dateien nacheinander in
// denselben globalen Namensraum geladen werden.
//
// GEAENDERT IST NUR DAS TECHNISCHE: ein Kontext, den `ansicht.tsx`
// selbst aufspannt. Kein `window`-Ueberschreiben, keine zweite
// Modul-Komponente. Die Modaltypen sind dieselben.
//
// Die Vorlage benutzt daneben `window.dispatchEvent("training-modal")`
// fuer `plates`, `warmup` und `aigen` (module-training.jsx:632-645) —
// hier laufen sie ueber denselben Kontext. Ein globales Ereignis war
// dort der Ersatz fuer Kontext; hier gibt es Kontext.
import * as React from 'react'

/**
 * Die neun Modale des Moduls.
 *
 * `[cmd]` Sechs aus module-training-extras.jsx (routineEditor,
 * exerciseDetail, customExercise, blockEditor, assignWeek,
 * supersetEdit), drei aus module-training-spec.jsx (plates, warmup,
 * aigen).
 */
export type ModalTyp =
  | 'routineEditor'
  | 'exerciseDetail'
  | 'customExercise'
  | 'blockEditor'
  | 'assignWeek'
  | 'supersetEdit'
  | 'plates'
  | 'warmup'
  | 'aigen'

export type TrainingKontextWert = {
  open: (typ: ModalTyp, nutzlast?: unknown) => void
  close: () => void
}

export const TrainingKontext = React.createContext<TrainingKontextWert | null>(null)
