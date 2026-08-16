// Dashboard der Oberflaeche v2 (G-05).
//
// Vorlage: theme-v1/module-dashboard.jsx.
//
// DIE ENTSCHEIDUNG DIESES AUFTRAGS steht in der Ansicht — hier nur die
// Daten. Serverkomponente, damit Tagessumme, Ziele und Bewertung aus
// derselben Sitzung kommen wie im Tagebuch.
import type { Metadata } from 'next'

import { getDailySummary, listDailySummaries } from '../../lib/nutrition/diary-summary-read'
import { getReferenceAssessment } from '../../lib/nutrition/reference-assessment-read'
import { getZielwerteAm, getZielwertVorschlag } from '../../lib/profile/zielwerte-read'
import type { DailySummaryRow } from '../../lib/nutrition/diary-summary'
import type { ReferenceAssessmentRow } from '../../lib/nutrition/reference-assessment-read'
import type { Zielvorschlag, Zielwerte } from '../../lib/profile/zielwerte-read'
import { DashboardAnsicht } from './dashboard'

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

/** N Tage vor dem Stichtag, als YYYY-MM-DD. */
function minusTage(datum: string, n: number): string {
  const d = new Date(`${datum}T00:00:00`)
  d.setDate(d.getDate() - n)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const t = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${t}`
}

export default async function V2Dashboard({
  searchParams,
}: {
  searchParams?: { datum?: string }
}) {
  // `?datum=` ist dasselbe Muster wie im Tagebuch — und der Weg, die
  // elf Szenariotage anzusehen.
  const datum = /^\d{4}-\d{2}-\d{2}$/.test(searchParams?.datum ?? '')
    ? searchParams!.datum!
    : heute()

  let summe: DailySummaryRow | null = null
  let verlauf: DailySummaryRow[] = []
  let bewertung: ReferenceAssessmentRow[] = []
  let ziele: Zielwerte | null = null
  let vorschlag: Zielvorschlag | null = null
  let fehler: string | null = null

  // Jede Frage einzeln abgefangen: faellt eine aus, bleiben die
  // uebrigen Kacheln gueltig. Ein Dashboard, das komplett verschwindet,
  // weil eine Abfrage klemmt, ist schlechter als eines mit einer
  // leeren Kachel.
  try {
    summe = await getDailySummary(datum)
  } catch (e) {
    fehler = e instanceof Error ? e.message : String(e)
  }
  try {
    verlauf = await listDailySummaries(minusTage(datum, 6), datum)
  } catch { /* Der Verlauf ist Beiwerk; ohne ihn fehlt nur die Kurve. */ }
  try {
    bewertung = await getReferenceAssessment(datum)
  } catch { /* siehe oben */ }
  try {
    ziele = await getZielwerteAm(datum)
    if (!ziele) vorschlag = await getZielwertVorschlag(datum)
  } catch { /* Ohne Ziele zeigt die Ansicht denselben Hinweis wie das Tagebuch. */ }

  return (
    <DashboardAnsicht
      datum={datum}
      summe={summe}
      verlauf={verlauf}
      bewertung={bewertung}
      ziele={ziele}
      vorschlag={vorschlag}
      fehler={fehler}
    />
  )
}
