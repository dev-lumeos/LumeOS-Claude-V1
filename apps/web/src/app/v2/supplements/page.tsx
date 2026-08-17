// Supplements der Oberflaeche v2 (G-29) — Mockup.
//
// `[cmd]` Es gibt kein `supplements`-Schema. Die Seite liest nichts und
// schreibt nichts; jede Zahl stammt aus der Vorlage. Deshalb keine
// Serverkomponente mit Datenzugriff — nur die Ansicht.
import type { Metadata } from 'next'

import './supplements.css'
import { SupplementsAnsicht } from './ansicht'

export const metadata: Metadata = {
  title: 'Supplements · LumeOS',
}

export default function V2SupplementsPage() {
  return <SupplementsAnsicht />
}
