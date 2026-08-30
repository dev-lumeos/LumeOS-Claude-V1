'use client'

// ════════════════════════════════════════════════════════════════════
// DIE SUPPLEMENT-TAGESBILANZ — G-275
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **Sie ersetzt die Attrappe „Gap analysis"**, nicht sie zu
// ergaenzen — Doppelungspruefung vor dem Bau (G-253).
//
// `[read]` **Die Attrappe hatte die richtige Form und die falsche
// Rechnung:** Spalten `FOOD`, `SUPPS`, `TOTAL`, verglichen mit der
// RDA. `[cmd]` **Genau das verbietet E-35** — jedes Modul rechnet
// seine eigene Bilanz, die Summierung gehoert ins Dashboard.
//
// `[read]` **Was bleibt, ist der Supplement-Anteil** — und die
// Auskunft, wie belastbar er ist.
//
// ══ DIE TRENNUNG, UM DIE ES GEHT ════════════════════════════════════
//
// `[cmd]` **Gemessen am 2026-08-30, `dev`, Nachweistag 19.08.:**
// FAPUN3 = 2,000 g bei **4 Einnahmen — 1 belegt, 3 unbekannt.**
//
// `[read]` **Ohne die Trennung sieht „2 g" aus wie das Ergebnis von
// vier Einnahmen.** **Es ist eine Untergrenze.**

import * as React from 'react'
import { Card, Pill } from '@lumeos/ui'

import {
  lageVon, LAGE_TEXT, LAGE_FARBE, zeigtMenge, herkunftSatz,
  ueberblickVon, datenlageSatz, KEINE_EINNAHMEN_SATZ,
  type BilanzZeile,
} from '../../../lib/supplements/bilanz-lage'

/** Eine Zahl in deutscher Schreibweise. */
function zahl(n: number, einheit: string): string {
  const g = n >= 100 ? 0 : n >= 10 ? 1 : 2
  return `${n.toLocaleString('de-DE', {
    minimumFractionDigits: 0, maximumFractionDigits: g,
  })} ${einheit}`.trim()
}

export function SuppTagesbilanz({
  zeilen, datum, belegteSubstanzen,
}: {
  zeilen: readonly BilanzZeile[]
  datum: string
  /** Wie viele Substanzen ueberhaupt eine Menge tragen (gemessen: 17). */
  belegteSubstanzen: number
}) {
  const u = ueberblickVon(zeilen)
  const satz = datenlageSatz(belegteSubstanzen, u.offeneEinnahmen)

  return (
    <Card
      title="Nährstoffe aus Präparaten"
      sub={zeilen.length === 0
        ? datum
        : `${u.naehrstoffe} Nährstoffe · ${datum}`}
    >
      {/* E-35 steht als Satz da, nicht nur im Quelltext — sonst
          erwartet der naechste Leser hier die Gesamtzufuhr. */}
      <div className="v2-dim" style={{ fontSize: 11, marginBottom: 8 }}>
        Nur der Anteil aus Präparaten. Was über das Essen dazukommt,
        steht in Nutrition.
      </div>

      {zeilen.length === 0 ? (
        <div className="v2-hinweis">{KEINE_EINNAHMEN_SATZ}</div>
      ) : (
        <>
          <div className="v2-supp-tbl-wrap">
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th>Nährstoff</th>
                  <th style={{ width: 110, textAlign: 'right' }}>Menge</th>
                  <th style={{ width: 90, textAlign: 'right' }}>Einnahmen</th>
                  <th style={{ width: 150 }}>Beleglage</th>
                </tr>
              </thead>
              <tbody>
                {zeilen.map(z => {
                  const l = lageVon(z)
                  return (
                    <tr key={z.nutrient_code}>
                      <td>
                        <span className="v2-mono" style={{ fontSize: 11.5 }}>
                          {z.nutrient_code}
                        </span>
                      </td>
                      <td className="v2-num" style={{ textAlign: 'right' }}>
                        {/* `[read]` **Bei `unbekannt` steht ein
                            Strich, keine 0** — eine 0 hiesse „nichts
                            eingenommen", obwohl genommen wurde. */}
                        {zeigtMenge(l)
                          ? (l === 'untergrenze' ? '≥ ' : '') + zahl(z.total_amount, z.nutrient_unit)
                          : '—'}
                      </td>
                      <td className="v2-num v2-dim" style={{ textAlign: 'right' }}>
                        {z.taken_log_count}
                      </td>
                      <td>
                        <Pill style={{ color: LAGE_FARBE[l], fontSize: 9.5 }}>
                          {LAGE_TEXT[l]}
                        </Pill>
                        <div className="v2-dim" style={{ fontSize: 10, marginTop: 2 }}>
                          {herkunftSatz(z)}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="v2-dim" style={{ fontSize: 11, marginTop: 8 }}>
            {u.belegt} belegt · {u.untergrenze} Untergrenze
            {u.unbekannt > 0 && <> · {u.unbekannt} ohne Menge</>}
          </div>
        </>
      )}

      {satz && <div className="v2-hinweis" style={{ marginTop: 8 }}>{satz}</div>}
    </Card>
  )
}
