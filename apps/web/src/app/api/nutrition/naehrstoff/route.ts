// Lesepfad des Naehrstoff-Detailmodals (G-122). Session-basiert,
// RLS-konform (lange Sicht security_invoker); Fehlerformat
// { error, code }. Die Logik liegt in lib/nutrition/
// naehrstoff-detail-read.ts — diese Datei uebersetzt nur HTTP.
import { NextRequest, NextResponse } from 'next/server'

import { ladeNaehrstoffDetail } from '../../../../lib/nutrition/naehrstoff-detail-read'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// BLS-Codes wie `F18:2CN6`, `VITB12`, `F18:2C9T11`.
const CODE = /^[A-Z0-9:._-]{1,20}$/i

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code') ?? ''
  const datum = request.nextUrl.searchParams.get('datum') ?? ''
  if (!CODE.test(code)) {
    return NextResponse.json(
      { error: 'code fehlt oder ist kein Naehrstoffcode.', code: 'VALIDATION_FAILED' },
      { status: 400 },
    )
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) {
    return NextResponse.json(
      { error: 'datum muss YYYY-MM-DD sein.', code: 'VALIDATION_FAILED' },
      { status: 400 },
    )
  }
  try {
    return NextResponse.json(await ladeNaehrstoffDetail(code.toUpperCase(), datum))
  } catch (error) {
    const nachricht = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: nachricht, code: nachricht === 'Keine Sitzung' ? 'UNAUTHENTICATED' : 'READ_FAILED' },
      { status: nachricht === 'Keine Sitzung' ? 401 : 500 },
    )
  }
}
