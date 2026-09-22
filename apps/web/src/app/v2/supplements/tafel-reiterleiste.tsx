'use client'

// Die Reiterleiste EINER aufgeklappten Tafel — G-492/A14.
//
// ══ WARUM DIESE DATEI ENTSTANDEN IST ════════════════════════════════
//
// **Tom, 2026-09-08, mit Bildschirmfoto des Substanzen-Reiters:**
// *„oder wir gehen nochmal logisch ueber die darstellung, wenn details
// geoeffnet sind, und bauen das wie bei supplements mit subnav, dann
// muss man nicht mehr soviel runternavigieren"*
//
// `[cmd]` **A14 verlangt: beide Tafeln nutzen DIESELBE Bauform** —
// nicht zweimal gebaut.
//
// `[cmd]` **Gemessen 2026-09-22: die Leiste stand dreimal im Code**,
// als reine Abschrift:
//
//     substanz-tafel.tsx:853      `.v2-supp-reiter`
//     medical/wirkstoff-tafel.tsx:416  `.v2-med-wirk-reiter`
//     produkt-tafel.tsx           gar nicht (G-453 liess sie weg)
//
// `[read]` **Die medizinische Abschrift bleibt, wo sie ist.** Sie
// traegt ein eigenes Klassenpraefix (`v2-med-wirk-*`) und gehoert
// einem anderen Modul — **sie hier mitzuziehen waere eine Aenderung
// an `medical`, die dieser Auftrag nicht deckt.** `[cmd]` **Gemeldet,
// nicht angefasst.**
//
// ══ WAS DIESE FASSUNG ANDERS MACHT ══════════════════════════════════
//
// `[cmd]` **Sie traegt rechts einen Platz fuer die AKTION.**
//
// **Tom:** *„kann drin bleiben, aber auch da sehe ich es nicht am
// ende, denn soweit runter scrollt einer nur, wenn er anweisungen
// lesen will"*
//
// `[cmd]` **Gemessen 2026-09-22, vor dem Umbau** (`_g492-vorher.mjs`):
//
//     Substanz  Leiste y=560   „Zum Stack hinzufügen" y=1228
//               -> 668 px darunter, ausserhalb des Schirms
//     Produkt   keine Leiste   Aktionsblock y=1625
//               -> ebenfalls ausserhalb des Schirms
//
// `[read]` **Beide Male musste man scrollen, um etwas hinzuzufuegen.**
//
// `[cmd]` **Deshalb faellt hier die Regel `reiter.length <= 1 -> null`
// weg**, die die Abschriften tragen: **eine Leiste mit EINEM Reiter
// ist trotzdem noetig, wenn sie die Aktion traegt.** `[read]` Ohne
// diese Aenderung waere die Aktion bei einem einzigen Reiter wieder
// unsichtbar — genau der Fehler, den der Auftrag behebt.
import * as React from 'react'

export type TafelReiter<Id extends string> = {
  id: Id
  titel: string
  /** `null`, wo eine Zahl bedeutungslos waere (G-180: „Ueberblick"). */
  zahl: number | null
}

/**
 * Reiter links, Aktion rechts.
 *
 * `[read]` **Die Aktion ist ein `ReactNode`, kein Knopf-Prop** —
 * die Substanzen geben einen Knopf hinein, die Produkte einen
 * Knopf plus einen Hinweis. **Die Leiste entscheidet ueber den ORT,
 * nicht ueber den Inhalt.**
 */
export function TafelReiterleiste<Id extends string>(
  { reiter, offen, onWaehlen, aktion }: {
    reiter: Array<TafelReiter<Id>>
    offen: Id | null
    onWaehlen: (id: Id) => void
    aktion?: React.ReactNode
  },
) {
  // `[read]` **Nichts zu zeigen heisst: nichts zeigen.** Ohne Reiter
  // UND ohne Aktion waere die Leiste eine leere Linie.
  if (reiter.length === 0 && !aktion) return null
  // `[read]` **`role="tablist"` sitzt auf der Leiste selbst**, nicht
  // auf einem Zwischen-`div`. `[cmd]` **Ein Zwischen-`div` mit
  // `display: contents` waere die Falle aus G-445:** es verschwindet
  // zwar aus dem Layout, aber die Unterkante der Leiste
  // (`border-bottom`) und `align-items` wirken dann auf ein Element,
  // das die Knoepfe gar nicht mehr enthaelt.
  return (
    <div className="v2-supp-reiter" role="tablist"
         data-probe="tafel-reiterleiste">
      {reiter.map(r => (
        <button
          key={r.id} type="button" role="tab"
          aria-selected={r.id === offen}
          className={`v2-supp-reiter-knopf${r.id === offen ? ' ist-offen' : ''}`}
          onClick={e => { e.stopPropagation(); onWaehlen(r.id) }}
        >
          {r.titel}
          {r.zahl !== null && <span className="v2-supp-reiter-zahl">{r.zahl}</span>}
        </button>
      ))}
      {/* `[read]` **`marginLeft: auto` schiebt die Aktion nach
          rechts** — und sie bleibt stehen, egal welcher Reiter offen
          ist (A12). */}
      {aktion && (
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 8,
                       alignItems: 'center' }}
              data-probe="tafel-aktion">
          {aktion}
        </span>
      )}
    </div>
  )
}
