// Training der Oberflaeche v2.
//
// `[cmd]` Die Seitenleiste fuehrt seit G-02 einen Eintrag `Training`
// mit `href: /v2/training` (packages/ui/src/shell/nav.ts:71).
//
// G-64: **Der Exercises-Tab liest echt** — 1.416 Uebungen, 58 Geraete
// in vier Gruppen, fuenf Disziplinen, 7 Muskelwurzeln. Alles andere
// im Modul bleibt Attrappe und traegt die Marke weiter: Volumen,
// Streak, Herzfrequenz und die Verlaufskacheln brauchen Sitzungen,
// und die anzubinden ist der naechste Schritt.
//
// DIESE SEITE LIEST. Keine Schreibpfade — `+ Custom` oeffnet
// weiterhin nur das Modal des Entwurfs.
import type { Metadata } from 'next'

import {
  getUebungen, getGeraeteGruppen, getDisziplinen, getMuskelBaum,
} from '../../../lib/training/uebungen-read'
import type {
  Uebung, GeraeteGruppe, MuskelWurzel,
} from '../../../lib/training/uebungen-read'
import { TrainingAnsicht } from './ansicht'

export const metadata: Metadata = {
  title: 'Training · LumeOS',
}

export const dynamic = 'force-dynamic'

export default async function V2TrainingPage() {
  // Vier getrennte Abfragen, vier getrennte `try` — faellt die
  // Muskelauswahl aus, bleibt die Tabelle gueltig. Dieselbe Linie wie
  // im Tagebuch.
  let start: Uebung[] = []
  let gesamt = 0
  let geraeteGruppen: GeraeteGruppe[] = []
  let disziplinen: Array<{ name: string; anzahl: number }> = []
  let muskelBaum: MuskelWurzel[] = []

  try {
    const r = await getUebungen({ limit: 100 })
    start = r.zeilen
    gesamt = r.gesamt
  } catch {
    start = []
    gesamt = 0
  }

  try { geraeteGruppen = await getGeraeteGruppen() } catch { geraeteGruppen = [] }
  try { disziplinen = await getDisziplinen() } catch { disziplinen = [] }
  try { muskelBaum = await getMuskelBaum() } catch { muskelBaum = [] }

  return (
    <TrainingAnsicht
      uebungenStart={start}
      uebungenGesamt={gesamt}
      geraeteGruppen={geraeteGruppen}
      disziplinen={disziplinen}
      muskelBaum={muskelBaum}
    />
  )
}
