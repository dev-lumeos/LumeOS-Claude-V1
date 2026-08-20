// Recovery der Oberflaeche v2.
//
// `[cmd]` Die Seitenleiste fuehrt seit G-02 einen Eintrag `Recovery`
// mit `href: /v2/recovery` (packages/ui/src/shell/nav.ts:72).
//
// **G-55: Diese Seite liest jetzt.** Bis hierher stand hier, es gebe
// „gar kein Schema" und der Begriff `recovery` komme in
// `supabase/_pipeline/` in keiner SQL-Datei vor. `[cmd]` Das stimmt
// seit Kettenschritt 120 nicht mehr:
// `supabase/_pipeline/12_recovery/120_recovery_checkins.sql` legt
// `recovery.checkins` an — Schlaf, Stimmung, Muskelkater, Stress,
// Ruhepuls, HRV.
//
// **G-82: Der Erholungswert kommt aus `recovery.scores`.** Bis
// hierher stand hier, er bleibe Attrappe, weil die Gewichtung offen
// sei. `[cmd]` C-125 hat sie entschieden und 170 Zeilen je Konto
// gerechnet — mit allen Einzeltermen, sodass nachvollziehbar ist,
// woraus die Zahl entstand. G-76 rechnete sie im Browser; **die
// beiden Rechnungen wichen um −7,0 bis +2,6 voneinander ab**
// (Bericht 132). Gezeigt wird jetzt die Tabelle.
import type { Metadata } from 'next'

import { ladeCheckins } from '../../../lib/recovery/checkin-read'
import { ladeScores, ladeModalitaeten } from '../../../lib/recovery/scores-read'
import { RecoveryAnsicht } from './ansicht'
import './recovery.css'

export const metadata: Metadata = {
  title: 'Recovery · LumeOS',
}

export default async function V2RecoveryPage() {
  // Drei getrennte Abfragen, drei getrennte Ergebnisse: faellt eine
  // aus, bleiben die uebrigen gueltig. Dieselbe Linie wie im
  // Tagebuch.
  const [checkins, scores, modalitaeten] = await Promise.all([
    ladeCheckins(),
    ladeScores(),
    ladeModalitaeten(),
  ])
  return (
    <RecoveryAnsicht
      checkins={checkins}
      scores={scores}
      modalitaeten={modalitaeten}
    />
  )
}
