// Zielwerte setzen (GO-05, Vorarbeit in C-03).
//
// `[read]` Rechnen und Speichern sind getrennt — das war die
// Entscheidung aus GO-04, und sie steht: eine Berechnung, die bei jedem
// Abruf schreibt, legte bei jeder Profilaenderung eine neue Zeile an.
// Diese Route ist die bewusste Handlung, die aus dem Vorschlag ein Ziel
// macht.
//
// Sie schreibt genau das, was `goals.berechne_zielwerte` liefert —
// keine eigene Rechnung. `[read]` Zwei Kopien derselben Rechenregel
// driften; die Regel steht in der Datenbank.
import { NextResponse } from 'next/server'

import { ProfileWriteError, httpStatusForProfileError } from '../../../../lib/profile/profile-model'
import { setzeZielwerteAusFormel } from '../../../../lib/profile/zielwerte-write'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST() {
  try {
    return NextResponse.json(await setzeZielwerteAusFormel())
  } catch (error) {
    if (error instanceof ProfileWriteError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: httpStatusForProfileError(error.code) },
      )
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error), code: 'WRITE_FAILED' },
      { status: 500 },
    )
  }
}
