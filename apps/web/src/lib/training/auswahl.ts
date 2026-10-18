// G-674/2 — History mit Auswahl: `?einheit=<id>` oder `?woche=<Montag>` (Link aus den Datenpunkten
// eines Messziels in Goals). Rein, laeuft in `page.tsx` auf den ohnehin geladenen Einheiten,
// Uebungen und Saetzen — so geht nur die Auswahl an den Browser, nicht alle Saetze.
import { utcTagIso } from '@lumeos/shared/datum'

import type { Satz, Sitzung, SitzungsUebung } from './sitzungen-read'

export interface Auswahl {
  art: 'einheit' | 'woche'
  /** Leer: die Adresse traf keine Einheit (geloescht oder fremd) bzw. die Woche hat keine. */
  einheiten: Array<{ id: string; name: string | null; datum: string; minuten: number | null; uebungen: Array<{ name: string; saetze: string[] }> }>
  woche: string | null
}

const kg = (n: number) => n.toLocaleString('de-DE', { maximumFractionDigits: 2 })

export function historyAuswahl(
  sitzungen: Sitzung[], uebungen: SitzungsUebung[], saetze: Satz[],
  p: { einheit?: string; woche?: string },
): Auswahl | null {
  const woche = /^\d{4}-\d{2}-\d{2}$/.test(p.woche ?? '') ? p.woche! : null
  if (!p.einheit && !woche) return null
  let gewaehlt: Sitzung[]
  if (p.einheit) gewaehlt = sitzungen.filter(s => s.id === p.einheit)
  else {
    const ende = new Date(`${woche}T12:00:00Z`); ende.setUTCDate(ende.getUTCDate() + 6)
    const bis = utcTagIso(ende)
    gewaehlt = sitzungen.filter(s => s.status === 'completed' && s.session_date >= woche! && s.session_date <= bis)
  }
  return {
    art: p.einheit ? 'einheit' : 'woche',
    woche,
    einheiten: gewaehlt.map(s => ({
      id: s.id, name: s.name, datum: s.session_date, minuten: s.duration_minutes,
      uebungen: uebungen.filter(u => u.workout_session_id === s.id)
        .sort((a, b) => (a.exercise_order ?? 0) - (b.exercise_order ?? 0))
        .map(u => ({
          name: u.exercise_name,
          saetze: saetze.filter(x => x.workout_exercise_id === u.id)
            .sort((a, b) => (a.set_number ?? 0) - (b.set_number ?? 0))
            .map(x => x.weight_kg !== null && x.reps !== null ? `${kg(x.weight_kg)}×${x.reps}` : x.reps !== null ? `${x.reps} Wdh.` : '—'),
        })),
    })),
  }
}
