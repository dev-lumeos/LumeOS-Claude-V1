// Schreibpfad fuer Rezepte und Einkaufslisten — G-289 / G-288.
//
// **`SPEC_03` Flow 7 (Schritt 1-5) und Flow 8 (1-5).** Entscheidung
// `E-39`.
//
// Die Logik liegt vollstaendig in `lib/nutrition/rezept-write.ts` —
// diese Datei uebersetzt nur HTTP, wie `api/nutrition/plan`.
import { NextRequest, NextResponse } from 'next/server'

import {
  DiaryWriteError,
  httpStatusForDiaryError,
} from '../../../../lib/nutrition/diary-model'
import {
  rezeptAnlegen, rezeptAnlegenSchema,
  rezeptAendern, rezeptAendernSchema,
  rezeptLoggen, rezeptLoggenSchema,
  listeAusRezept, listeAusRezeptSchema,
  postenHaken, postenHakenSchema,
} from '../../../../lib/nutrition/rezept-write'

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
 * Eine Route, fuenf Vorgaenge, unterschieden ueber `art` — dieselbe
 * Form wie im Tagebuch und beim Plan.
 */
export async function POST(request: NextRequest) {
  let roh: unknown
  try {
    roh = await request.json()
  } catch {
    return ungueltig('Ungueltiger Anfragekoerper.')
  }

  const art = (roh as Record<string, unknown>)?.art

  // Flow 7, Schritt 4 — speichern.
  if (art === 'rezept') {
    const g = rezeptAnlegenSchema.safeParse(roh)
    if (!g.success) {
      return ungueltig(g.error.issues[0]?.message ?? 'Eingabe ungueltig.',
        g.error.issues.map(i => ({ feld: i.path.join('.'), meldung: i.message })))
    }
    try {
      return NextResponse.json(await rezeptAnlegen(g.data))
    } catch (error) {
      return errorResponse(error)
    }
  }

  if (art === 'rezept_aendern') {
    const g = rezeptAendernSchema.safeParse(roh)
    if (!g.success) {
      return ungueltig(g.error.issues[0]?.message ?? 'Eingabe ungueltig.',
        g.error.issues.map(i => ({ feld: i.path.join('.'), meldung: i.message })))
    }
    try {
      return NextResponse.json(await rezeptAendern(g.data))
    } catch (error) {
      return errorResponse(error)
    }
  }

  // Flow 7, Schritt 5 — als Mahlzeit loggen.
  if (art === 'rezept_loggen') {
    const g = rezeptLoggenSchema.safeParse(roh)
    if (!g.success) {
      return ungueltig(g.error.issues[0]?.message ?? 'Eingabe ungueltig.',
        g.error.issues.map(i => ({ feld: i.path.join('.'), meldung: i.message })))
    }
    try {
      return NextResponse.json(await rezeptLoggen(g.data))
    } catch (error) {
      return errorResponse(error)
    }
  }

  // Flow 8, Schritte 1-3 — Liste aus Rezept.
  if (art === 'einkaufsliste') {
    const g = listeAusRezeptSchema.safeParse(roh)
    if (!g.success) {
      return ungueltig(g.error.issues[0]?.message ?? 'Eingabe ungueltig.',
        g.error.issues.map(i => ({ feld: i.path.join('.'), meldung: i.message })))
    }
    try {
      return NextResponse.json(await listeAusRezept(g.data))
    } catch (error) {
      return errorResponse(error)
    }
  }

  // Flow 8, Schritt 5 — abhaken.
  if (art === 'posten_haken') {
    const g = postenHakenSchema.safeParse(roh)
    if (!g.success) {
      return ungueltig(g.error.issues[0]?.message ?? 'Eingabe ungueltig.',
        g.error.issues.map(i => ({ feld: i.path.join('.'), meldung: i.message })))
    }
    try {
      return NextResponse.json(await postenHaken(g.data))
    } catch (error) {
      return errorResponse(error)
    }
  }

  return ungueltig(
    'Unbekannte Art. Erlaubt: rezept, rezept_aendern, rezept_loggen, '
    + 'einkaufsliste, posten_haken.')
}
