// Die Supplement-Vorlieben, lesend — G-468 / A4.
//
// **Tom:** *„die vorlieben wirken auf die produktsuche."*
//
// `[read]` **Eine Route, keine Serveraktion** — dieselbe Lage wie bei
// `filter/route.ts` (G-467): der Produkte-Reiter ist ein
// Client-Baustein und liest beim Aufbau. **Eine Serveraktion koennte
// hier nur schreiben.**
//
// `[read]` **Nur GET** — geschrieben wird ueber
// `vorlieben-aktionen.ts`, die Serveraktion des Reiters. `[cmd]` **Ein
// zweiter Schreibweg zu denselben Daten waere genau die zweite
// Wahrheit, die E-84 verbietet.**
//
// `[read]` **Keine Kennung in der Adresse** — wessen Vorlieben gemeint
// sind, sagt die Sitzung. `[cmd]` **Die drei C-511-Funktionen sperren
// ohnehin auf `auth.uid()`**, gemessen im Rumpf: sie geben in `psql`
// NICHTS zurueck, und das ist RLS, kein Mangel.
import { NextResponse } from 'next/server'

import { ladeVorlieben } from '../../../../lib/supplements/vorlieben-read'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const { stand, fehler } = await ladeVorlieben()
    // `[read]` **Nur die Felder, die die Suche braucht** — die Notiz
    // und die Einnahmezeiten wirken dort nicht, also gehen sie auch
    // nicht ueber die Leitung.
    return NextResponse.json({
      preferred_brands: stand.preferred_brands,
      preferred_forms: stand.preferred_forms,
      only_on_market: stand.only_on_market,
      fehler,
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e), code: 'READ_FAILED' },
      { status: 500 },
    )
  }
}
