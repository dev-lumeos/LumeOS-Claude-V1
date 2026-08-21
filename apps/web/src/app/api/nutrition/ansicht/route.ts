// Schreibpfad der gespeicherten Naehrstoffbaum-Ansicht (G-122).
// Session-basiert, RLS-konform; Fehlerformat nach Hausregel
// { error, code }. Die Logik liegt in lib/nutrition/
// ansicht-speichern.ts — diese Datei uebersetzt nur HTTP.
import { NextRequest, NextResponse } from 'next/server'

import { pruefeAnsicht } from '../../../../lib/nutrition/naehrstoff-anzeige'
import { AnsichtWriteError, speichereAnsicht } from '../../../../lib/nutrition/ansicht-speichern'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function PUT(request: NextRequest) {
  let roh: unknown
  try {
    roh = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Kein gueltiges JSON.', code: 'VALIDATION_FAILED' },
      { status: 400 },
    )
  }
  const ansicht = pruefeAnsicht(roh)
  if (!ansicht) {
    return NextResponse.json(
      { error: 'Erwartet { offen: string[], fenster, scope }.', code: 'VALIDATION_FAILED' },
      { status: 400 },
    )
  }
  try {
    await speichereAnsicht(ansicht)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof AnsichtWriteError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.code === 'UNAUTHENTICATED' ? 401 : 500 },
      )
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error), code: 'WRITE_FAILED' },
      { status: 500 },
    )
  }
}
