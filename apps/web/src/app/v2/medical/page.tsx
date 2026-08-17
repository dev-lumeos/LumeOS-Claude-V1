// Medical der Oberflaeche v2 — der uebernommene Entwurf, ganz Attrappe.
//
// `[cmd]` Die Seitenleiste fuehrt seit G-02 einen Eintrag `Medical`
// mit `href: /v2/medical`. Er zeigte bis hierher ins Leere.
//
// DIESE SEITE LIEST NICHTS. `[cmd]` Ein `medical`-Schema gibt es
// nicht — der Begriff kommt in `supabase/_pipeline/` in keiner
// SQL-Datei vor. Es ist nichts anzubinden, also wird nichts geladen.
//
// `[read]` Was fuer den Schemaauftrag danebenliegt — 121 KB
// Biomarker-Details und 15 KB Synonyme im Vorgaengerrepo — steht in
// docs/ssot/99-medical-mockup.md.
import type { Metadata } from 'next'

import { MedicalAnsicht } from './ansicht'
import './medical.css'

export const metadata: Metadata = {
  title: 'Medical · LumeOS',
}

export default function V2MedicalPage() {
  return <MedicalAnsicht />
}
