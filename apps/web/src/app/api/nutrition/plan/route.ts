// Schreibpfad fuer Essensplaene (G-267 / G-268). Session-basiert,
// RLS-konform. Fehlerformat nach Hausregel: { error, code }.
//
// Die Logik liegt vollstaendig in `lib/nutrition/plan-write.ts` —
// diese Datei uebersetzt nur HTTP, wie `api/nutrition/diary`.
import { NextRequest, NextResponse } from 'next/server'

import {
  DiaryWriteError,
  httpStatusForDiaryError,
} from '../../../../lib/nutrition/diary-model'
import {
  planAendern,
  planAendernSchema,
  planAnlegen,
  planAnlegenSchema,
} from '../../../../lib/nutrition/plan-write'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function errorResponse(error: unknown) {
  if (error instanceof DiaryWriteError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: httpStatusForDiaryError(error.code) },
    )
  }
  return NextResponse.json(
    { error: error instanceof Error ? error.message : String(error), code: 'WRITE_FAILED' },
    { status: 500 },
  )
}

function ungueltig(meldung: string, details?: unknown) {
  return NextResponse.json(
    { error: meldung, code: 'VALIDATION_FAILED', details },
    { status: 400 },
  )
}

/**
 * Plan anlegen oder aendern.
 *
 * Eine Route, zwei Vorgaenge, unterschieden ueber `art` — dieselbe
 * Form wie im Tagebuch.
 */
export async function POST(request: NextRequest) {
  let roh: unknown
  try {
    roh = await request.json()
  } catch {
    return ungueltig('Ungueltiger Anfragekoerper.')
  }

  const art = (roh as Record<string, unknown>)?.art

  if (art === 'plan') {
    const geprueft = planAnlegenSchema.safeParse(roh)
    if (!geprueft.success) {
      return ungueltig(geprueft.error.issues[0]?.message ?? 'Eingabe ungueltig.',
        geprueft.error.issues.map(i => ({ feld: i.path.join('.'), meldung: i.message })))
    }
    try {
      return NextResponse.json(await planAnlegen(geprueft.data))
    } catch (error) {
      return errorResponse(error)
    }
  }

  if (art === 'plan_aendern') {
    const geprueft = planAendernSchema.safeParse(roh)
    if (!geprueft.success) {
      return ungueltig(geprueft.error.issues[0]?.message ?? 'Eingabe ungueltig.',
        geprueft.error.issues.map(i => ({ feld: i.path.join('.'), meldung: i.message })))
    }
    try {
      return NextResponse.json(await planAendern(geprueft.data))
    } catch (error) {
      return errorResponse(error)
    }
  }

  return ungueltig('Unbekannte Art. Erlaubt: plan, plan_aendern.')
}
