// Der Einzelsatz der Substanzdatenbank (C-224).
//
// Die Liste kommt serverseitig mit der Seite; das Detail laedt das
// Modal hier nach — dasselbe Muster wie `api/nutrition/naehrstoff`.
// Session-Client, kein Service-Client; der Katalog ist nicht
// nutzergebunden, die Zeilenrechte entscheiden trotzdem.
import { NextRequest, NextResponse } from 'next/server'

import { ladeSubstanz } from '../../../../lib/supplements/substanz-read'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id') ?? ''
  if (!id) {
    return NextResponse.json(
      { error: 'id ist Pflicht.', code: 'VALIDATION_FAILED' }, { status: 400 })
  }
  try {
    const satz = await ladeSubstanz(id)
    if (!satz) {
      return NextResponse.json(
        { error: 'Keine Substanz mit dieser id.', code: 'NOT_FOUND' }, { status: 404 })
    }
    return NextResponse.json({ satz })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e), code: 'READ_FAILED' },
      { status: 500 },
    )
  }
}
