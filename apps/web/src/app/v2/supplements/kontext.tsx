'use client'

// Der geteilte Zustand des Supplements-Moduls.
//
// `[cmd]` Die Vorlage haelt ihn in `SuppCtx` (module-supplements.jsx:
// `const SuppCtx = React.createContext({})`) und reicht `takenToday`,
// `toggleTaken` und `open` an die Tabs. Uebernommen, nur mit Typen.
//
// `[read]` Die Modalarten sind die zwoelf der Vorlage (Zeile 273-285).
// Sie stehen hier als Union, damit ein Tippfehler ein Uebersetzungs-
// fehler wird und kein stilles Nichts — dieselbe Linie wie bei
// `IconName` seit G-02.
import * as React from 'react'

import type { StackDaten, KatalogEintrag } from '../../../lib/supplements/stack-read'
import type { SubstanzListenEintrag, EigenerStack } from '../../../lib/supplements/substanz-read'

export type ModalTyp =
  | 'add' | 'catalogAdd' | 'catalogAddEnh' | 'skip' | 'product'
  | 'interaction' | 'reorder' | 'addLab' | 'addSideEffect'
  | 'addCompound' | 'planCycle' | 'permissions' | 'logDose'
  // G-45: das Fenster des Injections-Tabs
  // (module-supplements-injection.jsx:389).
  | 'logInjection'

export type ModalZustand = { type: ModalTyp; payload?: unknown } | null

export type SuppKontext = {
  /** Welche Einnahmen heute abgehakt sind. */
  takenToday: Record<string, boolean>
  toggleTaken: (id: string) => void
  open: (type: ModalTyp, payload?: unknown) => void
  /**
   * G-37: die echten Daten aus `supplements`, oder `null`.
   *
   * `[read]` `null` heisst NICHT „leer", sondern „nicht gelesen" —
   * keine Sitzung oder ein Lesefehler. Die betroffenen Tabs zeigen
   * dann weiter die Attrappe. Ein leerer Stack ist etwas anderes:
   * `daten` steht, `positionen` ist leer, und das gehoert angezeigt.
   */
  daten: StackDaten | null
  katalog: KatalogEintrag[]
  // ── C-229: der EINE Katalog aus `substance_catalog` ─────────────
  /** Die 566er-Liste; leer heisst „nicht gelesen", dann Attrappe. */
  substanzen: SubstanzListenEintrag[]
  /** Die eigenen Stacks — fuer die Stackwahl im Add-Dialog. */
  stacks: EigenerStack[]
  /** G-167: ob Peptide/Enhanced sichtbar sind (experience_level). */
  gateOffen: boolean
  // ── G-148: die Schreibwege ──────────────────────────────────────
  /**
   * Der Tag, auf den geschrieben wird.
   *
   * `[read]` **Nie `new Date()` im Browser** (G-74) — das zerlegte die
   * Hydration und rechnete anders als beim Rendern.
   */
  stichtag: string
  /** Ein Schreibzugriff laeuft — die Knoepfe sperren solange. */
  laeuft: boolean
  /** Den frisch gelesenen Stand uebernehmen, den die Route mitliefert. */
  setFrisch: (d: StackDaten) => void
  /** Die Meldung des letzten Fehlversuchs, oder `null`. */
  schreibfehler: string | null
  setSchreibfehler: (m: string | null) => void
}

export const SuppCtx = React.createContext<SuppKontext>({
  takenToday: {},
  toggleTaken: () => {},
  open: () => {},
  daten: null,
  katalog: [],
  substanzen: [],
  stacks: [],
  gateOffen: false,
  stichtag: '1970-01-01',
  laeuft: false,
  setFrisch: () => {},
  schreibfehler: null,
  setSchreibfehler: () => {},
})

export function useSupp() {
  return React.useContext(SuppCtx)
}
