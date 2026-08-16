'use client'

// Die sieben Tabs des Nutrition-Moduls.
//
// `[cmd]` Die Vorlage (`module-nutrition.jsx`) fuehrt sie als
// Modul-Tabs: Diary, Insights, Nutrients, Food DB, Meal plans,
// Preferences, Planner. G-03 hatte daraus zwei Seiten mit
// Sidebar-Untereintraegen gemacht — eine erfundene Struktur, die es in
// der Vorlage nicht gibt. Sie ist entfallen.
//
// ABWEICHUNG MIT GRUND: die Vorlage haelt den aktiven Tab in
// `useState`. Hier steht er in der Adresse (`?tab=`), weil die
// Tagesdaten serverseitig geladen werden — mit lokalem Zustand muesste
// entweder alles in den Browser wandern (dann liest die Seite mit der
// Identitaet des Browsers statt der Sitzung) oder jeder Tab seine
// eigene Route bekommen (dann waeren wir wieder bei G-03). Nebenwirkung,
// die dafuer spricht: ein Tab ist verlinkbar und ueberlebt das Neuladen.
import * as React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { Route } from 'next'
import { Tabs, type TabItem } from '@lumeos/ui'

export function Tableiste({ items, aktiv }: { items: TabItem[]; aktiv: string }) {
  const router = useRouter()
  const pfad = usePathname()
  const suche = useSearchParams()

  return (
    <Tabs
      items={items}
      active={aktiv}
      onChange={id => {
        const p = new URLSearchParams(suche?.toString() ?? '')
        // `diary` ist der Standard und braucht keinen Parameter.
        if (id === 'diary') p.delete('tab')
        else p.set('tab', id)
        const rest = p.toString()
        // `typedRoutes` kennt nur feste Pfade; ein aus Parametern
        // zusammengesetzter ist zur Bauzeit nicht pruefbar. Die
        // erlaubten Werte prueft die Seite (`ERLAUBT` in page.tsx).
        router.push((rest ? `${pfad}?${rest}` : pfad) as Route)
      }}
    />
  )
}
