// Supplements der Oberflaeche v2.
//
// G-29 war reines Mockup. `[cmd]` **G-37 bindet drei Tabs an:** Today,
// Stack und Database lesen aus dem `supplements`-Schema (C-68). Der
// Rest bleibt Attrappe und traegt die Marke weiter.
//
// DIESE SEITE LIEST. Keine Schreibpfade: das Erfassen einer Einnahme
// ist ein eigener Auftrag. Die Knoepfe „Mark taken"/"Skip" bleiben
// deshalb Zustand in der Oberflaeche.
//
// Serverkomponente mit der Identitaet der Sitzung — kein
// Service-Client, wie bei Nutrition.
import type { Metadata } from 'next'

import './supplements.css'
import { getStackDaten, getKatalog } from '../../../lib/supplements/stack-read'
import type { StackDaten, KatalogEintrag } from '../../../lib/supplements/stack-read'
import { SupplementsAnsicht } from './ansicht'

export const metadata: Metadata = {
  title: 'Supplements · LumeOS',
}

export const dynamic = 'force-dynamic'

export default async function V2SupplementsPage() {
  // Getrennt abgefangen: der Stack und der Katalog sind zwei Aussagen.
  // Faellt der Katalog aus, bleibt der Stack gueltig — dieselbe Linie
  // wie im Tagebuch.
  let daten: StackDaten | null = null
  let katalog: KatalogEintrag[] = []

  try {
    daten = await getStackDaten()
  } catch {
    daten = null
  }

  try {
    katalog = await getKatalog()
  } catch {
    katalog = []
  }

  return <SupplementsAnsicht daten={daten} katalog={katalog} />
}
