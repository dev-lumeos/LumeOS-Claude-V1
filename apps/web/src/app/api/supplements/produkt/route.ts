// Der Einzelsatz eines Lieferantenprodukts (G-452).
//
// `[read]` **Die Liste kommt aus `api/supplements/produkte`, das Detail
// laedt die aufgeklappte Zeile hier nach** — dasselbe Muster wie
// `api/supplements/substanz`.
//
// `[cmd]` **Nachgeladen, nicht mitgeliefert:** ein Produkt traegt bis
// zu 54 Etikettzeilen (gemessen an `21cfe048`), und 50 Produkte je
// Seite waeren im schlechtesten Fall 2.700 Zeilen fuer eine Liste, in
// der man eine davon aufklappt.
import { NextRequest, NextResponse } from 'next/server'

import { ladeProdukt } from '../../../../lib/supplements/produkte-read'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id') ?? ''
  if (!id) {
    return NextResponse.json(
      { error: 'id ist Pflicht.', code: 'VALIDATION_FAILED' }, { status: 400 })
  }
  try {
    const satz = await ladeProdukt(id)
    if (!satz) {
      return NextResponse.json(
        { error: 'Kein Produkt mit dieser id.', code: 'NOT_FOUND' }, { status: 404 })
    }
    return NextResponse.json({ satz })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e), code: 'READ_FAILED' },
      { status: 500 },
    )
  }
}
