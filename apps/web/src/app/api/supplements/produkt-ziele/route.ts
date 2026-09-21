// Wohin ein Produkt kann — G-484.
//
// **Tom:** *„das muss natuerlich so gebaut werden, dass man waehlen
// kann, in welchen stack / in welches heutige meal"*
//
// `[read]` **Eine Route fuer beide Listen** — die Tafel braucht sie
// gemeinsam, und zwei Rundreisen fuer eine Wahl waeren eine zu viel.
import { NextRequest, NextResponse } from 'next/server'

import { ladeProduktZiele } from '../../../../lib/supplements/stack-read'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const roh = request.nextUrl.searchParams.get('datum') ?? ''
  // `[read]` **Ein ungueltiges Datum ist kein Fehler, sondern heute** —
  // dieselbe Regel wie `datumOderHeute` (G-487).
  const datum = /^\d{4}-\d{2}-\d{2}$/.test(roh) ? roh : null
  try {
    return NextResponse.json(await ladeProduktZiele(datum))
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error),
        code: 'READ_FAILED' },
      { status: 500 },
    )
  }
}
