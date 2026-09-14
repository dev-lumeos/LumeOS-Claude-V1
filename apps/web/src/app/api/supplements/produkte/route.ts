// Die Produktsuche (G-452).
//
// `[read]` **Dasselbe Muster wie `api/supplements/substanz`** —
// Session-Client, kein Service-Client. Der Katalog ist nicht
// nutzergebunden, die Zeilenrechte entscheiden trotzdem.
//
// `[read]` **Warum eine Route und nicht nur die Seite:** bei 214.780
// Zeilen sucht die Datenbank, nicht der Browser. Jeder Tastendruck
// braucht deshalb einen Weg zum Server, und der Reiter blaettert
// serverseitig weiter.
import { NextRequest, NextResponse } from 'next/server'

import { sucheProdukte, SEITE } from '../../../../lib/supplements/produkte-read'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams
  const frage = p.get('q') ?? ''
  const marke = p.get('marke')?.trim() || null
  // `[read]` **`status=alle` schaltet den Filter ab, alles andere ist
  // ein Wert.** Toms Vorgabe ist „On Market" als Standard — die Route
  // setzt ihn deshalb, wenn nichts kommt, statt ungefiltert zu suchen.
  const rohStatus = p.get('status')
  const status = rohStatus === 'alle' ? null : (rohStatus?.trim() || 'On Market')
  const seiteRoh = Number(p.get('seite') ?? '0')
  const seite = Number.isFinite(seiteRoh) && seiteRoh > 0 ? Math.trunc(seiteRoh) : 0

  try {
    const liste = await sucheProdukte(frage, marke, status, seite)
    return NextResponse.json({ ...liste, seite, seiteGroesse: SEITE })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e), code: 'READ_FAILED' },
      { status: 500 },
    )
  }
}
