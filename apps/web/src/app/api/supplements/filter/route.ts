// Die gespeicherten Produktfilter — G-467.
//
// **Tom:** *„meine filtereinstellungen werden nicht gespeichert"*
//
// `[read]` **Eine Route, kein Server-Action** — der Reiter ist ein
// Client-Baustein unter `ansicht.tsx` (`'use client'`), und er liest
// beim Aufbau. **Eine Serveraktion koennte hier nur schreiben, nicht
// lesen.**
//
// `[read]` **Kein `id`-Parameter und keine Kennung in der Adresse** —
// wessen Filter gemeint sind, sagt die SITZUNG. `[cmd]` **Dieselbe
// Regel wie beim Allergiefilter in `produkte/route.ts`:** wer eine
// Kennung durchreichen liesse, koennte fremde Einstellungen lesen.
import { NextRequest, NextResponse } from 'next/server'

import {
  ladeProduktFilter, speichereProduktFilter,
} from '../../../../lib/supplements/produkt-filter-read'
import { ausJson } from '../../../../lib/supplements/produkt-filter-lage'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const stand = await ladeProduktFilter()
  return NextResponse.json(stand)
}

export async function PUT(request: NextRequest) {
  try {
    const roh = await request.json() as unknown
    // ══ GEPRUEFT, NICHT DURCHGEREICHT ═══════════════════════════════
    //
    // `[read]` **`ausJson` ist dieselbe Pruefung wie beim Lesen** —
    // `[cmd]` **was der Browser schickt, ist nicht vertrauenswuerdiger
    // als eine alte Zeile in der Datenbank.** **Unbekannte Felder
    // fallen weg, falsche Typen bekommen die Vorgabe.**
    //
    // `[read]` **Damit kann auch kein `frage`-Feld hineinrutschen** —
    // die Zusage aus A3 haengt nicht am Wohlverhalten des Browsers.
    const a = await speichereProduktFilter(ausJson(roh))
    if (!a.ok) {
      return NextResponse.json(
        { error: a.fehler, code: 'WRITE_FAILED' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e), code: 'BAD_REQUEST' },
      { status: 400 },
    )
  }
}
