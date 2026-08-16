// Lebensmittelsuche der Oberflaeche v2 (G-03).
//
// Vorlage: module-nutrition-nutrients.jsx, module-nutrition-spec.jsx.
//
// [cmd] `apps/web/src/app/nutrition/foods/page.tsx` bleibt unberuehrt —
// 208 harte Farbwerte, abgeloest wird sie in G-07. Diese Seite entsteht
// DANEBEN und teilt sich mit ihr die Datenschicht.
import type { Metadata } from 'next'
import { SucheAnsicht } from './ansicht'

export const metadata: Metadata = {
  title: 'Lebensmittelsuche · LumeOS',
}

export default function V2SuchePage() {
  return <SucheAnsicht />
}
