'use client'

// Der Modal- und Zustandskontext des Recovery-Moduls.
//
// QUELLE: theme-v1/module-recovery-v2.jsx:3 (`RecCtx2`) und :5-64
// (`RecoveryModuleV2`).
//
// `[cmd]` Die Vorlage fuehrt ZWEI Kontexte: `RecCtx` in
// `module-recovery.jsx:3` fuer den alten Rahmen und `RecCtx2` fuer den
// neuen. Uebernommen ist `RecCtx2` — `app.jsx:122` mountet
// `RecoveryModuleV2`, wenn es da ist, und das ist es. Begruendung im
// Bericht, Abschnitt „Was die fuenf Vorlagendateien enthalten".
//
// Anders als bei Training traegt der Kontext hier nicht nur `open`/
// `close`, sondern auch den berechneten Zustand (`sc`, `rd`, `ot`,
// `pending`) und den Score-Modus. Das steht so in der Vorlage: der
// Rahmen rechnet einmal und reicht das Ergebnis an alle Tabs weiter,
// statt es je Tab neu zu rechnen.
import * as React from 'react'

import type {
  RecoveryScore, OvertrainingResult, PendingAction, Protocol,
} from './motor'

/**
 * Die vier Modale des v2-Rahmens.
 *
 * `[cmd]` module-recovery-v2.jsx:59-62. Der ALTE Rahmen kennt sechs
 * andere (sleep, readiness, protocol, wearables, protoDetail, muscle)
 * aus `-modals.jsx` — die entfallen mit ihm.
 */
export type ModalTyp = 'hrvMeasure' | 'logModality' | 'muscle' | 'protocol'

export type ModalZustand =
  | { typ: 'hrvMeasure' }
  | { typ: 'logModality' }
  | { typ: 'muscle'; slug: string }
  | { typ: 'protocol'; protokoll: Protocol }

export type ScoreModus = 'manual' | 'hrv'

export type RecoveryKontextWert = {
  open: (m: ModalZustand) => void
  close: () => void
  modus: ScoreModus
  setModus: (m: ScoreModus) => void
  sc: RecoveryScore
  rd: typeof import('./motor').READINESS_LEVELS[number]
  ot: OvertrainingResult
  pending: PendingAction[]
  /** Tabwechsel aus einer Kachel heraus („Full map →"). */
  zeigeTab: (id: string) => void
}

export const RecoveryKontext = React.createContext<RecoveryKontextWert | null>(null)

/** Kurzform. Wirft nicht — die Tabs laufen nur innerhalb des Providers. */
export function useRecovery(): RecoveryKontextWert {
  const v = React.useContext(RecoveryKontext)
  if (!v) throw new Error('RecoveryKontext fehlt — Tab ausserhalb des Providers gerendert.')
  return v
}
