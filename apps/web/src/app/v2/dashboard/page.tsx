// Dashboard der Oberflaeche v2 — der uebernommene Entwurf, teilweise
// angebunden.
//
// `[read]` Der Auftrag: das ganze Template als Mockup hereinholen und
// dann anbinden. Angebunden ist bisher **eine** Kachel — „Macros ·
// today" aus `daily_summary` und `goals.zielwerte_am`. Sie traegt
// deshalb als einzige keine Attrappenmarke mehr.
//
// Die uebrigen elf Kacheln zeigen die Entwurfszahlen und behalten die
// Marke, bis ihre Quelle da ist (Recovery, Training, Schlaf).
import type { Metadata } from 'next'

import { getDailySummary } from '../../../lib/nutrition/diary-summary-read'
import { getZielwerteAm } from '../../../lib/profile/zielwerte-read'
import { DashboardEntwurf, type EchteMakros } from './entwurf'

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

  // Faellt das Lesen aus, bleibt der Entwurf stehen — mit Marke. Eine
  // halb gefuellte Kachel ohne Marke waere schlechter als der Entwurf.
  let echteMakros: EchteMakros | null = null
  try {
    const summe = await getDailySummary(datum)
    const ziele = await getZielwerteAm(datum)
    if (summe) {
      echteMakros = {
        kcal: { cur: summe.macros.enercc.value, tgt: ziele?.kcal ?? null },
        protein: { cur: summe.macros.prot625.value, tgt: ziele?.protein_g ?? null },
        carbs: { cur: summe.macros.cho.value, tgt: ziele?.carbs_g ?? null },
        fat: { cur: summe.macros.fat.value, tgt: ziele?.fat_g ?? null },
      }
    }
  } catch {
    echteMakros = null
  }

  return <DashboardEntwurf echteMakros={echteMakros} />
}
