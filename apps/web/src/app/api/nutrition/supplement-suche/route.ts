// Produktsuche fuer den Supplementposten — G-478.
//
// `[read]` **Eine eigene Route, kein Anbau an `diary`** — hier wird
// GELESEN, dort GESCHRIEBEN. `[cmd]` **Und sie liefert die
// Portionsgroessen mit**, weil die Oberflaeche ohne sie weder die
// Wahl anbieten (A4) noch den Satz fuer Produkte ohne Naehrwerte
// zeigen kann (A5).
//
// `[read]` **Kein `user_id` in der Anfrage** — der Katalog ist nicht
// nutzergebunden, und die Sitzung entscheidet ueber die Rechte.
import { NextRequest, NextResponse } from 'next/server'

import { sucheSupplemente } from '../../../../lib/nutrition/supplement-posten-read'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const frage = request.nextUrl.searchParams.get('q') ?? ''
  if (!frage.trim()) return NextResponse.json({ treffer: [], fehler: null })
  const stand = await sucheSupplemente(frage)
  if (stand.fehler) {
    return NextResponse.json(
      { error: stand.fehler, code: 'READ_FAILED' }, { status: 500 })
  }
  return NextResponse.json(stand)
}
