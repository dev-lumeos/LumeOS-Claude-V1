'use client'

// Die Zuordnung importierter Befundzeilen — **echte Werte.**
//
// **WARUM DIESE KACHEL HIER STEHT UND NICHT IN DER LISTE.**
// `[cmd]` Tom, zu G-60: *„`match_status` gehört nicht in die Liste,
// sondern in den Import-Tab. Beim Hochladen ist er nützlich — „138 von
// 140 zugeordnet, 2 unklar". In der Liste ist er Testmaterial: die
// zwei Fälle wurden erzeugt, damit der Importpfad prüfbar ist."*
//
// **Die zwei Fälle bleiben in der Datenbank und verschwinden aus der
// Anzeige** — aus der Markerliste, nicht aus der Welt. Hier sind sie
// die Aussage: der Importpfad ordnet zu, und wo er es nicht kann, sagt
// er es.
//
// `[cmd]` Quelle ist `medical.lab_result_values.match_status`, gehalten
// von der Pruefbedingung `lab_result_values_match_integrity_check`
// (`142_laborimport_matching.sql`): `exact`/`manual_verified` haben
// einen Code, `ambiguous`/`unknown` haben keinen und brauchen Pruefung.
// **Die Datenbank sagt es selbst — nicht geraten.**
import * as React from 'react'
import { Card, Pill } from '@lumeos/ui'

import { zuordnung } from '../../../lib/medical/befund'
import type { BefundWert } from '../../../lib/medical/lesen'

const ZUSTAND_TEXT = {
  zugeordnet: 'Einem Katalogeintrag zugeordnet',
  mehrdeutig: 'Mehrdeutig — mehrere Kandidaten',
  unbekannt: 'Im Katalog nicht gefunden',
} as const

export function ImportZuordnung({ werte }: { werte: BefundWert[] }) {
  const gezaehlt = React.useMemo(() => {
    const z = { zugeordnet: 0, mehrdeutig: 0, unbekannt: 0 }
    for (const w of werte) z[zuordnung(w)] += 1
    return z
  }, [werte])

  const offen = werte.filter(w => zuordnung(w) !== 'zugeordnet')

  return (
    <Card
      title="Zuordnung"
      sub={`${gezaehlt.zugeordnet} von ${werte.length} Werten zugeordnet`}
    >
      {werte.length === 0 ? (
        <div className="v2-dim" style={{ fontSize: 11.5, padding: '14px 0' }}>
          Noch keine importierten Werte.
        </div>
      ) : (
        <>
          <div className="v2-col-gap" style={{ gap: 6, marginBottom: offen.length ? 14 : 0 }}>
            {([
              ['zugeordnet', 'var(--pos)'],
              ['mehrdeutig', 'var(--warn)'],
              ['unbekannt', 'var(--fg-dim)'],
            ] as const).map(([k, c]) => (
              <div key={k} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: 10,
                background: `color-mix(in oklch, ${c} 5%, var(--surface))`,
                border: `1px solid color-mix(in oklch, ${c} 26%, var(--border))`,
                borderRadius: 6,
              }}>
                <span className="v2-num" style={{ fontSize: 13, color: c, width: 40, flexShrink: 0 }}>
                  {gezaehlt[k]}
                </span>
                <span style={{ fontSize: 12, flex: 1, minWidth: 0 }}>{ZUSTAND_TEXT[k]}</span>
              </div>
            ))}
          </div>

          {/* Die offenen Faelle einzeln — mit den Kandidaten, die die
              Datenbank fuehrt. `[read]` Welcher gilt, entscheidet ein
              Mensch, nicht die Anzeige. */}
          {offen.length > 0 && (
            <div className="v2-tbl-wrap">
              <table className="v2-tbl">
                <thead>
                  <tr>
                    <th>Rohtext des Befunds</th>
                    <th style={{ width: 110 }}>Zustand</th>
                    <th style={{ width: 240 }}>Kandidaten</th>
                  </tr>
                </thead>
                <tbody>
                  {offen.map(w => (
                    <tr key={w.id}>
                      <td style={{ fontSize: 12 }}>
                        {w.raw_marker_name ?? w.marker_name}
                        <div className="v2-dim v2-mono" style={{ fontSize: 10, marginTop: 2 }}>
                          {w.report_date}
                          {w.entry_confidence != null
                            && ` · Konfidenz ${w.entry_confidence.toFixed(2)}`}
                        </div>
                      </td>
                      <td>
                        <Pill variant={zuordnung(w) === 'mehrdeutig' ? 'warn' : undefined}>
                          {w.match_status ?? zuordnung(w)}
                        </Pill>
                      </td>
                      <td>
                        {(w.match_candidates?.length ?? 0) > 0 ? (
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {w.match_candidates!.map(k => (
                              <Pill key={k.loinc_code}>
                                {`${k.loinc_code} · ${k.confidence.toFixed(2)}`}
                              </Pill>
                            ))}
                          </div>
                        ) : (
                          <span className="v2-dim" style={{ fontSize: 11 }}>keine</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </Card>
  )
}
