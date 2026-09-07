'use client'

// Die Trennlinie zwischen Ist und Soll — E-69, C-418/3.
//
// **Tom, 2026-09-07:** *,,so habe ich ist und soll fuer mich immer
// bereit und ich kann arbeiten."*
//
// **Die Anordnung, von Tom abgenommen:**
//
//     OBEN     das Angebundene
//              + Mockups dessen, was noch nicht angebunden ist
//     ------   Trennlinie
//     UNTEN    die Mockups des Angebundenen, als Vergleich
//
// `[read]` **Ohne die Linie stehen zwei Fassungen derselben Kachel
// untereinander und niemand weiss, welche gilt.**
//
// `[cmd]` **Sie stand bisher nur in `v2/recovery`** — **Tom hat es
// am 2026-09-07 in supplements bemerkt:** *,,es hat 4 kacheln
// angebunden aber keine originale nach der linie respektive es hat
// gar keine linie"*.
//
// `[read]` **Deshalb steht sie jetzt hier, einmal fuer alle Module.**
import * as React from 'react'
import { Pill } from '@lumeos/ui'

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
      // Am Text ,,Mockup-Referenz" zu haengen waere ein Wortwaechter.
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
