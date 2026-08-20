'use client'

// G-117: Der Tab-Zustand gehoert in die Adresse — EINE Stelle fuer
// alle Module.
//
// `[read]` Warum: ein Tab in `useState` geht bei jeder Navigation
// verloren (Toms Befund: „Tagwechsel springt auf Diary"), ist nicht
// verlinkbar und von aussen nicht messbar (tools/schuss.mjs kann nur
// Adressen ansteuern). Nutrition hatte das Muster schon
// (tableiste.tsx, G-38); dieser Hook macht es fuer die uebrigen
// Module zum Drop-in-Ersatz fuer `React.useState('<standard>')`.
//
// Verhalten:
//   * `?tab=` gelesen; ohne Parameter gilt der Standard.
//   * Der Standard schreibt KEINEN Parameter (saubere Adresse).
//   * Alle uebrigen Parameter (z. B. `datum`) bleiben erhalten.
//   * Ein von Hand getippter unbekannter Wert wird NICHT geklammert —
//     die Ansicht zeigt dann ihren Kopf ohne Inhalt; die Tab-Listen
//     leben in den Modulen, eine zweite Liste hier waere Drift.
import * as React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { Route } from 'next'

export function useTabParam(standard: string): [string, (id: string) => void] {
  const router = useRouter()
  const pfad = usePathname()
  const suche = useSearchParams()

  const tab = suche?.get('tab') ?? standard

  const setTab = React.useCallback((id: string) => {
    const p = new URLSearchParams(suche?.toString() ?? '')
    if (id === standard) p.delete('tab')
    else p.set('tab', id)
    const rest = p.toString()
    // `typedRoutes` kennt nur feste Pfade — dieselbe Begruendung wie
    // in nutrition/tableiste.tsx.
    router.push((rest ? `${pfad}?${rest}` : pfad) as Route)
  }, [router, pfad, suche, standard])

  return [tab, setTab]
}
