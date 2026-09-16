// Der Daumenstand fuer die gezeigten Produkte — G-455.
//
// `[read]` **Eine eigene Route, nicht Teil der Produktsuche** — der
// Stand aendert sich bei jedem Klick, die Trefferliste nicht. **Zwei
// Fragen, zwei Wege.**
//
// ══ WARUM POST UND NICHT GET ════════════════════════════════════════
//
// `[cmd]` **Die erste Fassung nahm die Ids als `?ids=a,b,c` — und die
// Seite bekam HTTP 431** (*„Request Header Fields Too Large"*),
// gemessen 2026-09-15.
//
// `[cmd]` **Die Rechnung dazu:** die Liste zeigt seit G-453 bis zu
// **500 Zeilen**, eine UUID mit Komma ist **37 Zeichen** — macht
// **18.500 Zeichen Adresse** gegen Nodes Vorgabe von **16.384**.
//
// `[read]` **Die Wirkung war schlimmer als ein Fehler:** die Anfrage
// starb, und die NEBENSTEHENDE Produktsuche starb mit — sie lief ueber
// dieselbe Verbindung. **Der Markenfilter sah aus, als griffe er
// nicht**, obwohl die Adresse richtig gebaut war und die Datenbank
// richtig antwortete.
//
// `[read]` **Dieselbe Familie wie G-64** (`.in()` kippt um 200 Ids mit
// *„URI too long"*) — **nur eine Ebene hoeher: nicht PostgREST,
// sondern der eigene Weg.** `[read]` **Eine Liste im Rumpf hat keine
// Laengengrenze dieser Art.**
import { NextRequest, NextResponse } from 'next/server'

import { produktDaumenStand } from '../../../../lib/supplements/produkt-daumen'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const roh = await request.json() as { ids?: unknown }
    const ids = Array.isArray(roh.ids)
      ? roh.ids.filter((i): i is string => typeof i === 'string' && !!i.trim())
      : []
    return NextResponse.json({ stand: await produktDaumenStand(ids) })
  } catch (e) {
    // `[read]` **Ein Fehler darf NICHT als „nichts bewertet"
    // durchgehen** — sonst saehe der Nutzer seine Daumen verschwinden.
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e), code: 'READ_FAILED' },
      { status: 500 },
    )
  }
}
