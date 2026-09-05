'use client'

// Die drei Kopfknoepfe, die ein Fenster oeffnen.
//
// WARUM EIGENE DATEI: `[cmd]` `TagebuchAnsicht` ist eine async
// Server-Komponente (ansicht.tsx:87) — sie kann keinen Zustand halten
// und damit kein Fenster oeffnen. Die Knoepfe brauchen `useState`,
// also stehen sie in einer eigenen Client-Insel. Dasselbe Muster wie
// bei `Datumsnavigation` (G-14).
//
// QUELLE: theme-v1/module-nutrition.jsx:20-31 — die Kopfzeile fuehrt
// Quick-add, Recalc macros, Find food und MealCam in dieser Reihenfolge.
//
// `[cmd]` „Recalc macros" bleibt ein `InEntwicklungKnopf`: die Vorlage
// hat dafuer kein Fenster, und die Zielwerte werden im Profil gesetzt.
// Ein Fenster zu erfinden, das die Vorlage nicht kennt, waere kein
// Nachbau.
import * as React from 'react'
import { Icon, InEntwicklungKnopf } from '@lumeos/ui'

import { NutritionModale, type NutritionModalTyp } from './modale'

/**
 * `kinder` steht zwischen „Recalc macros" und „MealCam".
 *
 * `[cmd]` Die Vorlage ordnet Quick-add · Recalc macros · Find food ·
 * MealCam (module-nutrition.jsx:20-31). „Find food" ist ein `<Link>`
 * und gehoert in die Server-Komponente; damit die Reihenfolge trotzdem
 * stimmt, reicht die Ansicht ihn hier durch, statt ihn hinten
 * anzuhaengen.
 */
export function Kopfknoepfe({ datum, kinder }: {
  /** G-340: Quick-Add schreibt in eine Mahlzeit DIESES Tages. */
  datum: string
  kinder?: React.ReactNode
}) {
  const [modal, setModal] = React.useState<NutritionModalTyp | null>(null)

  return (
    <>
      <button type="button" className="v2-btn" onClick={() => setModal('quickadd')}>
        <Icon name="zap" className="v2-ic v2-ic-sm" /> Quick-add
      </button>

      <InEntwicklungKnopf
        titel="Recalc macros"
        grund="Die Zielwerte werden im Profil berechnet und gesetzt — ein Weg von hier aus fehlt."
        className="v2-btn"
      >
        <Icon name="trend_up" className="v2-ic v2-ic-sm" /> Recalc macros
      </InEntwicklungKnopf>

      {kinder}

      <button type="button" className="v2-btn v2-btn-primary" onClick={() => setModal('mealcam')}>
        <Icon name="camera" className="v2-ic v2-ic-sm" /> MealCam
      </button>

      <NutritionModale modal={modal} datum={datum} onClose={() => setModal(null)} />
    </>
  )
}
