'use client'

// Der Entwurfsstand des Injektionsreiters — G-500, E-88.
//
// ══ WOZU DIESE DATEI ═══════════════════════════════════════════════
//
// `[read]` **Sie ist die Naht zwischen Reiter und Entwurfsdaten.**
// `SuppInjections` nimmt das Protokoll seit G-500 als Prop; diese
// Datei ist der einzige Ort, der es einsetzt — **und sie wird
// dynamisch geholt.**
//
// `[cmd]` **Warum nicht direkt in `ansicht.tsx`:** ein
// `dynamic(() => import(...))` liefert eine Komponente, keinen Wert.
// **Ein Prop laesst sich damit nicht fuellen** — also wandert die
// Stelle, die das Prop setzt, mit in den nachgeladenen Chunk.
//
// `[read]` **Damit liegt das Protokoll in genau einem Chunk**, der
// nur geholt wird, wenn der Grad reicht.
//
// ══ WAS OHNE GRAD PASSIERT ═════════════════════════════════════════
//
// `[read]` **Der Reiter laeuft weiter** — `ansicht.tsx` rendert
// `<SuppInjections/>` dann ohne diese Datei, mit leerem Protokoll.
// **Alle 16 Orte stehen auf `fresh`**, die Mengenbalken auf null.
//
// `[read]` **Das ist die richtige Aussage**, nicht ein Fehler: wer
// keine Einnahmen erfasst hat, hat keine benutzten Stellen.
// **Es gibt Injektionen ohne PED** (B12, Vitamin D) — der Reiter
// gehoert deshalb nicht hinter das Gate, seine Attrappendaten
// schon.
import * as React from 'react'

import { SuppInjections } from './tab-injektionen'
import { INJ_PROTOKOLL, INJ_PLAN } from './injektion-protokoll'
import type { InjektionsStand } from '../../../lib/medical/injektion-read'

export function SuppInjectionsEntwurf({ stand, stichtag }: {
  stand: InjektionsStand | null
  stichtag: string
}) {
  return (
    <SuppInjections
      stand={stand}
      stichtag={stichtag}
      entwurfProtokoll={INJ_PROTOKOLL}
      entwurfPlan={INJ_PLAN}
    />
  )
}
