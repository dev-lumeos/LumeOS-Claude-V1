// Die Markenliste fuer den Produktfilter (G-452).
//
// `[cmd]` **6.012 Marken**, gemessen 2026-09-14. `[read]` **Eigene
// Route, nicht mit der Seite geliefert** — sie aendert sich nicht je
// Suchlauf und wird deshalb einmal geholt, nicht bei jedem Tastendruck.
import { NextResponse } from 'next/server'

import { ladeMarken } from '../../../../lib/supplements/produkte-read'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    return NextResponse.json(await ladeMarken())
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e), code: 'READ_FAILED' },
      { status: 500 },
    )
  }
}
