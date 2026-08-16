// Tagebuch der Oberflaeche v2 (G-03).
//
// Vorlage: module-nutrition.jsx.
//
// DIESE SEITE LIEST. [read] Der Auftrag: "Keine Schreibpfade ins
// Tagebuch. meals und meal_items haben 0 Zeilen; das Erfassen ist C-03
// und ein eigener Auftrag."
//
// Serverkomponente: die Tagessumme und die Referenzbewertung kommen aus
// der geteilten Datenschicht, beide mit der Identitaet der Sitzung
// (security_invoker bzw. SECURITY INVOKER). Kein Service-Client.
import type { Metadata } from 'next'

import { getDailySummary } from '../../../lib/nutrition/diary-summary-read'
import { getReferenceAssessment } from '../../../lib/nutrition/reference-assessment-read'
import type { DailySummaryRow } from '../../../lib/nutrition/diary-summary'
import type { ReferenceAssessmentRow } from '../../../lib/nutrition/reference-assessment-read'
import { getZielwerteAm, getZielwertVorschlag } from '../../../lib/profile/zielwerte-read'
import type { Zielvorschlag, Zielwerte } from '../../../lib/profile/zielwerte-read'
import { TagebuchAnsicht } from './ansicht'

export const metadata: Metadata = {
  title: 'Tagebuch · LumeOS',
}

export const dynamic = 'force-dynamic'

/** Heute in lokaler Zeit als YYYY-MM-DD. */
function heute(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const t = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${t}`
}

export default async function V2NutritionPage({
  searchParams,
}: {
  searchParams?: { datum?: string }
}) {
  const datum = /^\d{4}-\d{2}-\d{2}$/.test(searchParams?.datum ?? '')
    ? searchParams!.datum!
    : heute()

  let summe: DailySummaryRow | null = null
  let bewertung: ReferenceAssessmentRow[] = []
  let fehler: string | null = null
  let bewertungFehler: string | null = null

  // Getrennt abgefangen: die Tagessumme und die Referenzbewertung sind
  // zwei Aussagen. Faellt die zweite aus, ist die erste trotzdem
  // gueltig — sie beide hinter einem Fehler verschwinden zu lassen
  // waere mehr Verlust als noetig.
  try {
    summe = await getDailySummary(datum)
  } catch (e) {
    fehler = e instanceof Error ? e.message : String(e)
  }

  try {
    bewertung = await getReferenceAssessment(datum)
  } catch (e) {
    bewertungFehler = e instanceof Error ? e.message : String(e)
  }

  // GO-03/GO-04: Was gilt, und was gelten koennte. Getrennt gelesen —
  // ein Fehler der einen Frage macht die andere nicht ungueltig.
  let ziele: Zielwerte | null = null
  let vorschlag: Zielvorschlag | null = null
  let zielFehler: string | null = null
  try {
    ziele = await getZielwerteAm(datum)
    if (!ziele) vorschlag = await getZielwertVorschlag(datum)
  } catch (e) {
    // [cmd] Solange `goals` nicht in supabase/config.toml als
    // exponiertes Schema steht, antwortet PostgREST mit PGRST106
    // ("Invalid schema: goals"). Die Zeile ist ergaenzt, greift aber
    // erst nach einem Neustart des lokalen Stacks — siehe Bericht.
    // Bis dahin bleibt `vorschlag` null, und die Seite zeigt denselben
    // Hinweis wie ohne Profil. Kein eigener Fehlerkasten: die Nutzerin
    // kann daran nichts aendern.
    zielFehler = e instanceof Error ? e.message : String(e)
  }

  return (
    <TagebuchAnsicht
      datum={datum}
      summe={summe}
      bewertung={bewertung}
      fehler={fehler}
      bewertungFehler={bewertungFehler}
      ziele={ziele}
      vorschlag={vorschlag}
      zielFehler={zielFehler}
    />
  )
}
