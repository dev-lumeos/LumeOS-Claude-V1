'use client'

// Die Trennlinie zwischen Ist und Soll — E-69, jetzt EINMAL im Haus.
//
// **Tom, 2026-09-07:** *„so habe ich ist und soll fuer mich immer
// bereit und ich kann arbeiten."*
//
// **Die Anordnung, von Tom abgenommen:**
//
//     OBEN     das Angebundene
//              + Mockups dessen, was noch nicht angebunden ist
//     ------   Trennlinie
//     UNTEN    die Mockup-Fassung JEDER angebundenen Kachel
//
// ══ WARUM SIE HIER STEHT UND NICHT ZWEIMAL DANEBEN ══════════════════
//
// `[cmd]` **G-399 hat es gemeldet, G-402 loest es auf:** die Linie
// stand in `apps/web/src/components/shell/referenz-trenner.tsx` UND
// in `apps/coach/src/components/referenz-trenner.tsx`.
//
// `[cmd]` **Gemessen: gleiche Struktur, andere Klassen** — `apps/web`
// setzte `v2-row-gap` und `v2-dim` mit Inline-Abstaenden, `apps/coach`
// eigene `cp-trenner-*`. **Derselbe Baustein, zwei Vokabulare.**
//
// `[read]` **Diese Fassung nimmt die aus `apps/web`** — sie ist die
// aeltere und die, an der die Messungen haengen. `[cmd]` **Dieselbe
// Marke `data-referenz-trenner`**: sie ist der Messpunkt, nicht das
// Wort „Mockup-Referenz". **Am Text zu haengen waere ein
// Wortwaechter.**
import * as React from 'react'

import { Pill } from './primitives'

/**
 * Die Trennlinie ueber einem Referenzblock.
 *
 * @param reiter  Der Reitername, damit die Linie sagt, wozu sie gehoert.
 * @param quelle  Die Mockup-Datei, aus der der Block darunter stammt.
 */
export function ReferenzTrenner({
  reiter, quelle,
}: {
  reiter: string
  quelle: string
}) {
  return (
    <div
      // `[cmd]` Die Marke ist der Messpunkt: sie trennt oben von unten.
      // Am Text „Mockup-Referenz" zu haengen waere ein Wortwaechter.
      data-referenz-trenner={reiter}
      className="v2-row-gap"
      style={{ gap: 10, alignItems: 'center', margin: '22px 0 14px' }}
    >
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      <Pill variant="warn">Mockup-Referenz</Pill>
      <span className="v2-dim" style={{ fontSize: 10.5 }}>
        {reiter} · {quelle} · fällt mit der Abnahme
      </span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  )
}
