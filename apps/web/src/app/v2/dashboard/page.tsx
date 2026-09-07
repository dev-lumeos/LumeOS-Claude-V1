// Dashboard der Oberflaeche v2 — angebunden (G-100).
//
// `[read]` Bis G-100 war das Dashboard das **einzige Modul, das nie
// angebunden wurde** — und die erste Seite, die ein Nutzer sieht. Alle
// sieben Fachmodule tragen inzwischen echte Daten; das Dashboard holt
// sie hier zusammen.
//
// **DIE SEITE ZERFAELLT IN ZWEI TEILE:**
//
//   1. `dashboard-echt.tsx` — was eine Quelle hat. Ohne Marke.
//   2. `entwurf.tsx` — was der Entwurf zeigt, ohne dass es eine
//      Groesse dafuer gibt. **Mit Marke, unveraendert.**
//
// `[read]` Der Entwurf bleibt stehen und wird nicht geloescht: Er ist
// die Vorlage, an der sich der naechste Schritt misst. Was daran heute
// nicht baubar ist, steht im Bericht 149 mit Begruendung.
import type { Metadata } from 'next'

import { ladeDashboard, type DashboardDaten } from '../../../lib/dashboard/lesen'
import { ReferenzTrenner } from '../../../components/shell/referenz-trenner'
import { DashboardEcht } from './dashboard-echt'
import { DashboardEntwurfRest } from './entwurf-rest'

export const metadata: Metadata = {
  title: 'Dashboard · LumeOS',
}

export const dynamic = 'force-dynamic'

/** Heute in lokaler Zeit als YYYY-MM-DD. */
function heute(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const t = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${t}`
}

export default async function V2DashboardPage({
  searchParams,
}: {
  searchParams?: { datum?: string }
}) {
  const datum = /^\d{4}-\d{2}-\d{2}$/.test(searchParams?.datum ?? '')
    ? searchParams!.datum!
    : heute()

  // `[read]` Faellt das Lesen ganz aus, zeigt die Seite leere Kacheln
  // mit Grund — nicht die Entwurfszahlen. Eine erfundene Zahl ohne
  // Marke waere schlechter als ein Strich.
  let daten: DashboardDaten | null = null
  let fehler: string | null = null
  try {
    daten = await ladeDashboard(datum)
  } catch (e) {
    fehler = e instanceof Error ? e.message : String(e)
  }

  return (
    <>
      {fehler !== null && (
        <div className="v2-insight v2-neg" style={{ marginBottom: 16 }}>
          <div className="v2-insight-mark" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="v2-insight-title">Dashboard nicht gelesen</div>
            <div className="v2-insight-body">{fehler}</div>
          </div>
        </div>
      )}
      {daten && <DashboardEcht d={daten} />}
      {/* `[cmd]` G-365: Echt und Entwurf standen untereinander,
          OHNE Linie — niemand konnte sehen, wo das eine aufhoert.
          Die Linie steht unbedingt, weil der Entwurf darunter
          unbedingt steht. */}
      <ReferenzTrenner reiter="Dashboard"
                       quelle="theme-v1/module-dashboard.jsx" />
      <DashboardEntwurfRest />
    </>
  )
}
