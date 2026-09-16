// Die Katalogvorschlaege — G-459, live beim Tippen.
//
// `[read]` **Eine Route, weil live getippt wird** — eine Serveraktion
// je Tastendruck waere ein Formularabsenden je Buchstabe.
//
// `[read]` **Die Kennung kommt NICHT aus der Anfrage** — die Funktion
// braucht keine: sie liest Kataloge, keine Nutzerdaten. `[cmd]`
// **Gemessen: `allergy_catalog_suggestions(p_art, p_query, p_limit)`
// nimmt keinen Nutzer.**
import { NextRequest, NextResponse } from 'next/server'

import { ladeVorschlaege } from '../../../../lib/allergien/vorschlaege-read'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams
  const art = p.get('art')?.trim() ?? ''
  const frage = p.get('q') ?? ''
  if (!art) {
    return NextResponse.json(
      { error: 'art ist Pflicht.', code: 'VALIDATION_FAILED' }, { status: 400 })
  }
  try {
    return NextResponse.json(await ladeVorschlaege(art, frage))
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e), code: 'READ_FAILED' },
      { status: 500 },
    )
  }
}
