// Das Verzeichnis der gebauten Draft-Ansichten — G-407.
//
// `[read]` **Ein Verzeichnis, kein `if`-Turm.** `[cmd]` **Der
// Waechter zaehlt hier, welche der 35 Unterpunkte eine Ansicht
// haben** — ein `if`-Turm liesse sich nur mit einem Muster zaehlen,
// und ein Muster altert (die Lehre aus dem Zaehlwaechter, der nur
// eine Schreibform kannte).
import * as React from 'react'

import { ASSISTENT_ANSICHTEN } from './ansichten-assistent'
import { PORTAL_ANSICHTEN } from './ansichten-portal'
import { AUSWERTUNG_ANSICHTEN } from './ansichten-auswertung'

export const DRAFT_ANSICHTEN: Record<string, () => React.JSX.Element> = {
  ...ASSISTENT_ANSICHTEN,
  ...PORTAL_ANSICHTEN,
  ...AUSWERTUNG_ANSICHTEN,
}

/** Wie viele der Unterpunkte eine gebaute Ansicht haben. */
export function gebauteAnsichten(): string[] {
  return Object.keys(DRAFT_ANSICHTEN).sort()
}
