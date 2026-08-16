// Lese- und Schreibpfad fuer das Nutzerprofil (GO-01).
// Session-basiert, RLS-konform. Fehlerformat nach Hausregel:
// { error, code } mit stabilem Code.
import { NextRequest, NextResponse } from 'next/server'

import {
  ProfileWriteError,
  httpStatusForProfileError,
  profileWriteSchema,
} from '../../../lib/profile/profile-model'
import { getOwnProfile, saveOwnProfile } from '../../../lib/profile/profile-write'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function errorResponse(error: unknown) {
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

export async function GET() {
  try {
    return NextResponse.json(await getOwnProfile())
  } catch (error) {
    return errorResponse(error)
  }
}

export async function PUT(request: NextRequest) {
  let roh: unknown
  try {
    roh = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Ungueltiger Anfragekoerper.', code: 'INVALID_INPUT' },
      { status: 400 },
    )
  }

  const geprueft = profileWriteSchema.safeParse(roh)
  if (!geprueft.success) {
    // Die erste Meldung reicht der Oberflaeche; das ganze Feld-Feedback
    // steht in `details`, damit die Seite es am Feld anzeigen kann.
    const erste = geprueft.error.issues[0]
    return NextResponse.json(
      {
        error: erste?.message ?? 'Eingabe ungueltig.',
        code: 'INVALID_INPUT',
        details: geprueft.error.issues.map(i => ({
          feld: i.path.join('.'),
          meldung: i.message,
        })),
      },
      { status: 400 },
    )
  }

  try {
    return NextResponse.json(await saveOwnProfile(geprueft.data))
  } catch (error) {
    return errorResponse(error)
  }
}
