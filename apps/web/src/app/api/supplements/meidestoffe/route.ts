// Die Meidestoffe — G-455, der WEICHE Filter.
//
// **Tom:** *„MEIDESTOFFE aus food_preference_items, WEICH: Produkt
// wird markiert."*
//
// `[read]` **Eigene Route, einmal geholt** — sie aendern sich nicht je
// Suchlauf, anders als die Trefferliste.
import { NextResponse } from 'next/server'

import { ladeMeidestoffe } from '../../../../lib/supplements/produkt-daumen'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    return NextResponse.json({ codes: await ladeMeidestoffe() })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e), code: 'READ_FAILED' },
      { status: 500 },
    )
  }
}
