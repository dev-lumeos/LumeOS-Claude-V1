// Der Einzelsatz des Wirkstoffkatalogs — G-208.
//
// `[read]` **Dasselbe Muster wie `api/supplements/substanz`** (C-224):
// die Liste kommt serverseitig mit der Seite, das Detail laedt die
// aufgeklappte Zeile hier nach.
//
// `[cmd]` **Und der Grund ist hier groesser als dort:** die deutschen
// Nutzertexte wiegen zusammen 1.145 kB, die FAQ-Antworten 700 kB — die
// Listenzeilen nur 83 kB (gemessen 2026-08-27). **Alles mitzuschicken
// hiesse 1,8 MB fuer eine Seite, auf der man einen Wirkstoff
// aufklappt.**
//
// Session-Client, kein Service-Client. `[cmd]` Der Katalog ist nicht
// nutzergebunden; `authenticated` hat SELECT auf alle zehn
// `medication_*`-Tabellen, und jede fuehrt eine SELECT-Policy
// (gemessen 2026-08-27). Kein zweiter Rechteweg.
import { NextRequest, NextResponse } from 'next/server'

import { ladeWirkstoff } from '../../../../lib/medical/wirkstoff-read'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id') ?? ''
  if (!id) {
    return NextResponse.json(
      { error: 'id ist Pflicht.', code: 'VALIDATION_FAILED' }, { status: 400 })
  }
  try {
    const satz = await ladeWirkstoff(id)
    if (!satz) {
      return NextResponse.json(
        { error: 'Kein Wirkstoff mit dieser id.', code: 'NOT_FOUND' },
        { status: 404 })
    }
    return NextResponse.json({ satz })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e), code: 'READ_FAILED' },
      { status: 500 },
    )
  }
}
