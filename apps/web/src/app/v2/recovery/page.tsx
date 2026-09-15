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
// ══ G-430: die Muskelhierarchie aus `public.koerperflaechen` ══════
//
// `[cmd]` **C-468 hat die Tabelle gebaut — und NIEMAND hat sie
// gelesen** (gemessen 2026-09-11). **Das hier ist der erste
// Leseweg.**
import { ladeHierarchie } from '../../../lib/koerper/hierarchie-read'
// G-432/A6: der ganze Muskelbaum — fuer die vollstaendige Hierarchie
// im Per-muscle-Detail, Luecken eingeschlossen.
import { ladeMuskelbaum } from '../../../lib/koerper/muskelbaum-read'
// ══ G-440: der Trainingszustand je Muskel ════════════════════════
//
// `[cmd]` **`MUSCLE_STATE` waren 18 FESTE Zeilen aus dem Mockup**
// (`module-recovery-engine.jsx:135-154`). **Jetzt gerechnet aus
// `workout_sets` x `exercise_muscles`.**
import { ladeMuskelzustand } from '../../../lib/training/muskelzustand-read'
// ══ G-450: der gewaehlte Tag als Bezugszeitpunkt ══════════════════
//
// `[read]` **Aus `muskelzustand.ts`, nicht aus `-read.ts`** — die
// Datei ist serverfrei (reine Rechnung, keine Importe), und die
// Ansicht darunter ist `'use client'`. **Ein Wert-Import aus dem
// Leseweg zoege `next/headers` ins Browserbuendel** (A-30).
import { bezugszeitpunkt, istZukunft } from '../../../lib/training/muskelzustand'
import './recovery.css'

export const metadata: Metadata = {
  title: 'Recovery · LumeOS',
}

export default async function V2RecoveryPage({
  searchParams,
}: {
  searchParams?: { datum?: string }
}) {
  // ══ G-378: recovery fuehrt jetzt einen Tag ════════════════
  //
  // `[cmd]` **In G-375 war es nicht anschliessbar:** die drei
  // Lesewege nahmen kein Datum, sie luden die juengsten Zeilen.
  // **Deshalb bekam recovery keinen Wechsler** (C-426).
  //
  // `[cmd]` **Jetzt nehmen alle drei ein `bis`** — ohne Angabe
  // verhalten sie sich wie vorher.
  const stichtag = /^\d{4}-\d{2}-\d{2}$/.test(searchParams?.datum ?? '')
    ? searchParams!.datum!
    : undefined
  // Drei getrennte Abfragen, drei getrennte Ergebnisse: faellt eine
  // aus, bleiben die uebrigen gueltig. Dieselbe Linie wie im
  // Tagebuch.
  const [checkins, scores, modalitaeten, hierarchie, muskelbaum,
    muskelzustand] = await Promise.all([
    ladeCheckins(30, stichtag),
    ladeScores(180, stichtag),
    ladeModalitaeten(120, stichtag),
    // `[read]` **Stammdaten, kein Nutzerbezug** — aber derselbe
    // Weg: faellt sie aus, bleiben die drei uebrigen gueltig.
    ladeHierarchie(),
    ladeMuskelbaum(),
    // ══ G-450: DER GEWAEHLTE TAG GEHT IN DIE RECHNUNG ═══════════
    //
    // **Codex, C-493:** *„Der Tageswechsler aendert das Datum, aber
    // nicht die Kartenberechnung; die Bizepsfarbe bleibt gleich."*
    //
    // `[cmd]` **Hier stand `ladeMuskelzustand(105)`** — mit EINEM
    // Argument. **Das zweite hat einen Vorgabewert:**
    // `jetzt: Date = new Date()` (`muskelzustand-read.ts:93`).
    //
    // `[read]` **Damit rechnete die Karte immer gegen JETZT**,
    // waehrend `stichtag` drei Zeilen darueber schon dastand und von
    // `ladeCheckins`, `ladeScores` und `ladeModalitaeten` benutzt
    // wurde. **Die Kopfzeile wechselte, die Muskelwerte nicht.**
    //
    // `[read]` **Die Rechnung selbst war nie falsch** —
    // `muskelzustaende(…, jetzt)` nimmt den Zeitpunkt seit G-440 als
    // Parameter, ausdruecklich damit sie pruefbar ist. **Der Fehler
    // war ein nicht uebergebenes Argument**, und ein Vorgabewert hat
    // ihn zugedeckt: kein Typfehler, keine Meldung, nur eine Zahl,
    // die sich nie ruehrte.
    ladeMuskelzustand(105, bezugszeitpunkt(stichtag)),
  ])
  return (
    <RecoveryAnsicht
      checkins={checkins}
      scores={scores}
      modalitaeten={modalitaeten}
      hierarchie={hierarchie}
      muskelbaum={muskelbaum}
      muskelzustand={muskelzustand}
      // G-450: gegen welchen Tag gerechnet wurde — und ob er in der
      // Zukunft liegt (A6).
      stichtag={stichtag}
      zukunft={istZukunft(stichtag)}
    />
  )
}
