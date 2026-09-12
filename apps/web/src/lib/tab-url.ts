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
//
// ══ G-428: ein unbekannter Wert faellt auf den Standard ═══════════
//
// `[cmd]` **Hier stand:** *„Ein von Hand getippter unbekannter Wert
// wird NICHT geklammert — die Ansicht zeigt dann ihren Kopf ohne
// Inhalt; die Tab-Listen leben in den Modulen, eine zweite Liste hier
// waere Drift."*
//
// `[cmd]` **Gemessen 2026-09-11, `test-user@lumeos.local` UND
// `dev@lumeos.app`:** `/v2/supplements?tab=injektionen` **gibt 1
// Kachel und 801 Zeichen**, `?tab=injection` **gibt 14 Kacheln und
// 6.605 Zeichen.** `[read]` **Der Reiter war nie kaputt — die Adresse
// traf keinen Zweig.**
//
// `[read]` **Die Begruendung gegen die Klammer war richtig und bleibt
// es:** eine zweite Liste HIER waere Drift. **Deshalb bringt der
// Aufrufer seine eigene mit** — `bekannt` ist genau die Liste, die er
// ohnehin rendert. **Wer keine uebergibt, bekommt das alte
// Verhalten**, also keine stille Aenderung in den sechs anderen
// Modulen.
//
// `[read]` **Ohne Klammer ist ein Tippfehler nicht von einem kaputten
// Reiter zu unterscheiden** — genau diese Verwechslung hat G-428
// ausgeloest.
import * as React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { Route } from 'next'

export function useTabParam(
  standard: string,
  /**
   * G-428: die Reiter, die es in diesem Modul GIBT.
   *
   * `[read]` **Weggelassen heisst: nicht klammern** — dasselbe
   * Verhalten wie vor G-428.
   */
  bekannt?: readonly string[],
): [string, (id: string) => void] {
  const router = useRouter()
  const pfad = usePathname()
  const suche = useSearchParams()

  const roh = suche?.get('tab') ?? standard
  // `[read]` **Die Klammer greift nur, wenn eine Liste da IST** — eine
  // leere Liste (`[]`) wuerde sonst jeden Reiter verschlucken.
  const tab = bekannt && bekannt.length > 0 && !bekannt.includes(roh)
    ? standard
    : roh

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
