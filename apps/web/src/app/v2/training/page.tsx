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

import { heute } from '../../../lib/datum'
import {
  getUebungen, getGeraeteGruppen, getDisziplinen, getMuskelBaum,
} from '../../../lib/training/uebungen-read'
import type {
  Uebung, GeraeteGruppe, MuskelWurzel,
} from '../../../lib/training/uebungen-read'
import {
  angemeldeteNutzerin, ladeGewichtAm, ladeMuskelWurzeln, ladeSaetze,
  ladeSitzungen, ladeSitzungsUebungen,
} from '../../../lib/training/sitzungen-read'
import {
  kennzahlen, kraftverlauf, serie, volumenJeMuskel, woche,
} from '../../../lib/training/auswertung'
// G-86: die Bereitschaft kommt aus `recovery.scores`, nicht aus Training.
import { ladeReadiness } from '../../../lib/training/readiness-read'
import type { ReadinessStand } from '../../../lib/training/readiness-read'
import { TrainingAnsicht } from './ansicht'
import type { VerlaufDaten } from './tab-verlauf'

export const metadata: Metadata = {
  title: 'Training · LumeOS',
}

export const dynamic = 'force-dynamic'

export default async function V2TrainingPage({
  searchParams,
}: {
  searchParams?: { datum?: string }
}) {
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

  // G-69: Sitzungen, Uebungen, Saetze — und die Rechnungen darauf.
  //
  // `[read]` **Der Stichtag ist das echte Heute** (`lib/datum.ts`,
  // ueber Mittag gerechnet). Er trennt absolviert von geplant: Tom zu
  // G-69: *„Volumen, Streak, 1RM und Fortschritt zaehlen nur bis heute
  // — Kalender und Plan zeigen alle."*
  //
  // Ein eigener `try`, wie bei den vier darueber: faellt der
  // Sitzungspfad aus, bleibt der Katalog gueltig und die
  // Entwurfskacheln stehen mit ihrer Marke.
  // ══ G-375: der Tag kommt aus der Adresse ════════════════
  //
  // `[cmd]` **Hier stand `heute()`, fest.** **Der Tageswechsler
  // der Schale haette darueber gestanden und nichts bewirkt**
  // (C-426: kein Regler ohne Wirkung).
  //
  // `[read]` **Der Stichtag war schon durchgereicht** — er
  // wurde nur nicht entgegengenommen.
  const stichtag = /^\d{4}-\d{2}-\d{2}$/.test(searchParams?.datum ?? '')
    ? searchParams!.datum!
    : heute()
  let verlauf: VerlaufDaten | null = null

  try {
    const userId = await angemeldeteNutzerin()
    const [sitzungen, uebungen, saetze] = await Promise.all([
      ladeSitzungen(userId, stichtag),
      ladeSitzungsUebungen(userId),
      ladeSaetze(userId),
    ])

    if (sitzungen.length > 0) {
      const exerciseIds = Array.from(new Set(
        uebungen.map(u => u.exercise_id).filter((v): v is string => !!v),
      ))
      const [muskeln, gewicht] = await Promise.all([
        ladeMuskelWurzeln(exerciseIds),
        ladeGewichtAm(userId, stichtag),
      ])

      verlauf = {
        stichtag,
        sitzungen,
        kennzahlen: kennzahlen(sitzungen, uebungen, saetze),
        muskelVolumen: volumenJeMuskel(sitzungen, uebungen, muskeln),
        kraft: kraftverlauf(sitzungen, uebungen, saetze),
        serie: serie(sitzungen, stichtag),
        gewicht,
        // G-86: die sieben Tage um den Stichtag, fuer „This week".
        woche: woche(sitzungen, stichtag),
        // G-366: die Uebungen waren geladen und wurden nur fuer die
        // Auswertung benutzt — die Today-Karte kam nicht an sie heran.
        uebungen,
      }
    }
  } catch {
    verlauf = null
  }

  // G-86: eigener `try` — faellt Recovery aus, bleibt Training gueltig.
  // `[read]` Die Kachel steht in Training, die Zahlen stehen in
  // Recovery; ein Fehler dort darf den Katalog nicht mitreissen.
  let readiness: ReadinessStand | null = null
  try { readiness = await ladeReadiness() } catch { readiness = null }

  return (
    <>
    <TrainingAnsicht
      uebungenStart={start}
      uebungenGesamt={gesamt}
      geraeteGruppen={geraeteGruppen}
      disziplinen={disziplinen}
      muskelBaum={muskelBaum}
      verlauf={verlauf}
      readiness={readiness}
    />
    </>
  )
}
