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
import { getHydrationDay } from '../../../lib/nutrition/hydration-day-read'
import type { HydrationDay } from '../../../lib/nutrition/hydration-day-read'
import { getLocalFoodSearch } from '../../../lib/nutrition/food-search'
import type { NutritionFoodSearchPayload } from '../../../lib/nutrition/food-search'
import { createSessionClient } from '@lumeos/shared/session'
import { isAdminFromAppMetadata } from '@lumeos/shared/auth/role'

import { datumOderHeute } from '../../../lib/datum'
import { TagebuchAnsicht } from './ansicht'

export const metadata: Metadata = {
  title: 'Tagebuch · LumeOS',
}

export const dynamic = 'force-dynamic'

export default async function V2NutritionPage({
  searchParams,
}: {
  searchParams?: { datum?: string; tab?: string }
}) {
  const datum = datumOderHeute(searchParams?.datum)

  // G-14: die Rolle kommt aus `app_metadata` — NICHT aus
  // `user_metadata`. `[read]` Letzteres kann die Nutzerin selbst
  // setzen (belegt am 2026-08-06); ersteres nicht. Die Pruefung ist
  // dieselbe wie im Admin-Bereich, damit es nur eine Regel gibt.
  let istAdmin = false
  try {
    const supabase = createSessionClient()
    const { data: { user } } = await supabase.auth.getUser()
    istAdmin = isAdminFromAppMetadata(
      user?.app_metadata as Record<string, unknown> | null | undefined)
  } catch {
    istAdmin = false
  }

  // Der aktive Tab steht in der Adresse, damit die Tagesdaten
  // serverseitig geladen bleiben (Begruendung in tableiste.tsx).
  // Unbekannte Werte fallen auf `diary` zurueck statt eine leere Seite
  // zu zeigen.
  const ERLAUBT = ['diary', 'insights', 'nutrients', 'foods', 'plans', 'prefs', 'planner']
  const tab = ERLAUBT.includes(searchParams?.tab ?? '') ? searchParams!.tab! : 'diary'

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

  // Der Wasserhaushalt. Eigener try: faellt er aus, bleibt der Rest
  // des Tagebuchs gueltig.
  let wasser: HydrationDay | null = null
  try {
    wasser = await getHydrationDay(datum)
  } catch {
    wasser = null
  }

  // G-66: die erste Trefferseite des Food-DB-Tabs. Nur laden, wenn der
  // Tab auch gezeigt wird — 7.140 Lebensmittel sind kein Beiwerk fuer
  // das Tagebuch. `[cmd]` Die RPC braucht ohne Filter rund 250 ms.
  let foodsStart: NutritionFoodSearchPayload | null = null
  if (tab === 'foods') {
    try {
      foodsStart = await getLocalFoodSearch('', undefined, { limit: 50 })
    } catch {
      // Faellt sie aus, laedt der Tab im Browser nach und zeigt dort
      // seinen Fehler — die uebrige Seite bleibt gueltig.
      foodsStart = null
    }
  }

  return (
    <TagebuchAnsicht
      datum={datum}
      tab={tab}
      istAdmin={istAdmin}
      wasser={wasser}
      summe={summe}
      bewertung={bewertung}
      fehler={fehler}
      bewertungFehler={bewertungFehler}
      ziele={ziele}
      vorschlag={vorschlag}
      zielFehler={zielFehler}
      foodsStart={foodsStart}
    />
  )
}
