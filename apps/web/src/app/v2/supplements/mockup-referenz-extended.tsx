'use client'

// Die Extended-Entwurfsreferenz — G-499, E-88.
//
// ══ WARUM SIE EINE EIGENE DATEI IST ════════════════════════════════
//
// `[read]` **Sie stand in `mockup-referenz.tsx` neben vier anderen
// Referenzen.** `[cmd]` **Ein Modul ist die kleinste Einheit, die
// `dynamic` trennen kann:** haette sie dort bleiben sollen, waeren
// entweder alle fuenf nachgeladen worden — oder die vier statisch
// importierten haetten diese hier wieder ins Buendel gezogen.
//
// `[read]` **Deshalb der Schnitt. Nur DIESE Referenz wandert**; die
// vier uebrigen (`Interactions`, `Stacks`, `Intelligence`,
// `Injection`) bleiben, wo sie waren, und bleiben fuer jeden
// sichtbar.
//
// ══ WARUM SIE HINTER DIE GRADPRUEFUNG GEHOERT ══════════════════════
//
// **Tom, E-88:** *,,Die Referenz zeigt Extended-INHALT, also folgt
// sie Extendeds Regel."*
//
// `[cmd]` **G-117 hat den Reiter aus dem Buendel geholt und diese
// Datei als vierten Weg gemessen:** sie zeigt dieselben Wirkstoffe
// mit **Dosis und Anwendungsschema** — `physician-supervised` stand
// dadurch weiter im Seitenmanifest, fuer jeden.
//
// `[read]` **E-68 und E-70 sagen, die Entwurfsreferenz bleibt
// stehen, bis ein Modul fertig ist** — **sie sagen NICHT, dass jeder
// sie sehen muss.** `[read]` **Als Massstab taugt sie weiter: wer
// Extended baut, hat den Grad.**
//
// `[cmd]` **Nicht der Weg b** (nur aus dem Buendel nehmen): der
// Chunk laedt beim Oeffnen nach, die Dosis stuende dann trotzdem im
// Browser.
//
// `[read]` **Keine Anbindung.** Diese Ansicht liest ausschliesslich
// die Entwurfskonstanten aus `daten-extended.ts`.
//
// `[cmd]` **Auch die Konstanten mussten wandern** (G-499): solange
// sie in `daten.ts` standen, zogen die vier Dateien, die dort
// `STACK` holen, die Wirkstoffliste weiter ins Seitenbuendel —
// **ein Modul ist unteilbar.**
import * as React from 'react'
import { Card, Pill, Row } from '@lumeos/ui'

import { ReferenzTrenner } from '../../../components/shell/referenz-trenner'
import { EXTENDED_STACK, EXTENDED_LABS } from './daten-extended'

const QUELLE_MAIN = 'theme-v1/module-supplements.jsx'

/** Dieselbe Marke wie in `mockup-referenz.tsx` — bewusst doppelt
 *  gehalten, damit diese Datei nichts aus der anderen importiert
 *  (ein Import zurueck wuerde beide Buendel wieder verbinden). */
function marke(quelle: string): string {
  return `Attrappe — ${quelle} · wartet auf: nichts — Referenz zum `
    + 'Vergleich, faellt mit Toms Abnahme'
}

/** `extended`, wie er im Mockup steht — `SuppExtended`. */
export function SuppExtendedReferenz() {
  return (
    <>
      <ReferenzTrenner reiter="Extended" quelle={QUELLE_MAIN} />
      <div className="v2-grid" style={{ gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        <div className="v2-col-gap" style={{ gap: 14 }}>
          <Card title="Active protocols"
                sub={`${EXTENDED_STACK.length} compounds · physician-supervised`}
                attrappe={marke(QUELLE_MAIN)}>
            <div className="v2-col-gap" style={{ gap: 8 }}>
              {EXTENDED_STACK.map(c => (
                <div key={c.id} style={{
                  padding: 12, background: 'var(--surface)',
                  border: '1px solid var(--border)', borderRadius: 7,
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    marginBottom: 5, flexWrap: 'wrap',
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                    <Pill>{c.category}</Pill>
                    <Pill>{c.cycleType}</Pill>
                    <span className="v2-num v2-dim" style={{ marginLeft: 'auto', fontSize: 10.5 }}>
                      {c.dose}
                    </span>
                  </div>
                  <div className="v2-muted" style={{ fontSize: 11.5, marginBottom: 6 }}>
                    {c.protocol} · {c.schedule}
                  </div>
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 8, fontSize: 10.5,
                  }}>
                    <div>
                      <div className="v2-eyebrow">Halbwertszeit</div>
                      <div className="v2-mono">{c.halfLife}</div>
                    </div>
                    <div>
                      <div className="v2-eyebrow">Naechste Gabe</div>
                      <div className="v2-mono">{c.nextDose}</div>
                    </div>
                    <div>
                      <div className="v2-eyebrow">Labor</div>
                      <div className="v2-mono">{c.nextLab}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Cycle timeline · 16 weeks" sub="Verlauf je Wirkstoff"
                attrappe={marke(QUELLE_MAIN)}>
            <div className="v2-col-gap" style={{ gap: 7 }}>
              {EXTENDED_STACK.map(c => (
                <div key={c.id} style={{
                  display: 'grid', gridTemplateColumns: '150px 1fr',
                  gap: 10, alignItems: 'center', fontSize: 11,
                }}>
                  <span className="v2-dim">{c.name}</span>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {Array.from({ length: 16 }).map((_, w) => {
                      const laeuft = c.cycleType === 'continuous'
                        || (c.cycleWeek != null && w < Number(c.cycleWeek))
                      return (
                        <div key={w} style={{
                          flex: 1, height: 14, borderRadius: 2,
                          background: laeuft ? 'var(--acc-suppl)' : 'var(--surface-2)',
                          opacity: laeuft ? 0.75 : 1,
                        }} />
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Side effect log" sub="last 7 days"
                attrappe={marke(QUELLE_MAIN)}>
            <div className="v2-col-gap" style={{ gap: 5 }}>
              {EXTENDED_STACK.map(c => (
                <div key={c.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', background: 'var(--surface)',
                  border: '1px solid var(--border)', borderRadius: 5,
                  fontSize: 11.5,
                }}>
                  <span style={{ flex: 1 }}>{c.name}</span>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {[0, 1, 2, 3].map(s => (
                      <span key={s} style={{
                        width: 12, height: 12, borderRadius: 3,
                        background: s <= Number(c.sideEffectScore)
                          ? (Number(c.sideEffectScore) >= 2
                            ? 'var(--warn)' : 'var(--acc-recov)')
                          : 'var(--surface-2)',
                      }} />
                    ))}
                  </div>
                  <span className="v2-num v2-dim" style={{ width: 30, textAlign: 'right' }}>
                    {c.sideEffectScore}/3
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="v2-col-gap" style={{ gap: 14 }}>
          <Card title="Bloodwork · linked from Medical"
                sub={`${EXTENDED_LABS.length} Marker`} attrappe={marke(QUELLE_MAIN)}>
            <div style={{ overflowX: 'auto' }}>
              <table className="v2-tbl">
                <thead>
                  <tr>
                    <th>Marker</th>
                    <th style={{ width: 90, textAlign: 'right' }}>Wert</th>
                    <th style={{ width: 90 }}>Stand</th>
                  </tr>
                </thead>
                <tbody>
                  {EXTENDED_LABS.map((l: Record<string, unknown>) => (
                    <tr key={String(l.name ?? l.marker)}>
                      <td>{String(l.name ?? l.marker)}</td>
                      <td className="v2-num" style={{ textAlign: 'right' }}>
                        {String(l.value ?? '—')} {String(l.unit ?? '')}
                      </td>
                      <td>
                        <Pill variant={l.status === 'in_range' ? 'pos' : undefined}>
                          {String(l.status ?? '—')}
                        </Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Visibility · who sees what" sub="permissions per coach"
                attrappe={marke(QUELLE_MAIN)}>
            <Row label="Medical coach (Dr. Kessler)" value="full" />
            <Row label="Nutrition coach (J. Bauer)" value="MK-677 only" />
            <Row label="Training coach (Anders)" value="hidden" />
            <Row label="Buddy (AI)" value="aggregate" />
            <div className="v2-divider" />
            <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.5 }}>
              Der Entwurf bietet darunter „Edit permissions&ldquo; und einen
              Pruefpfad.
            </div>
          </Card>

          <Card title="Half-life · this week" sub="Wirkspiegel je Wirkstoff"
                attrappe={marke(QUELLE_MAIN)}>
            <div className="v2-col-gap" style={{ gap: 8 }}>
              {EXTENDED_STACK.map(c => (
                <div key={c.id}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: 11, marginBottom: 3,
                  }}>
                    <span className="v2-dim">{c.name}</span>
                    <span className="v2-mono">{c.halfLife}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {Array.from({ length: 7 }).map((_, d) => (
                      <div key={d} style={{
                        flex: 1, height: 18, borderRadius: 2,
                        background: 'var(--acc-suppl)',
                        opacity: 0.9 - d * 0.1,
                      }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
