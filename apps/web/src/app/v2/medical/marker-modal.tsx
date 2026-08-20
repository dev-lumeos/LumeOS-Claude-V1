'use client'

// Das Marker-Detail — **echte Werte.**
//
// `[read]` Der Auftrag G-60: *„Popups — was das Mockup öffnet,
// bleibt."* Die Attrappe öffnet beim Klick auf eine Tabellenzeile das
// Biomarker-Detail; die echte Liste tut dasselbe.
//
// FORM: `theme-v1/module-medical-modals.jsx:21-129` — vier Kopfkacheln
// (Wert · Laborbereich · Optimalband · Verlauf), der Bereichsbalken mit
// Legende, die Verlaufskurve mit Optimalband als Linie.
// INHALT: `medical.lab_result_values`, gefaltet in `lib/medical/reihe.ts`.
//
// **WAS DIE ATTRAPPE ZEIGT UND HIER FEHLT** — jeder Punkt steht im
// Bericht, keiner ist ersetzt:
//   `Clinical significance` `[cmd]` freier Erklaertext je Marker; die
//                           Datenbank fuehrt kein solches Feld.
//   `Recommended frequency` `[cmd]` nicht in der Datenbank.
//   `Fasting required`      `[cmd]` `lab_result_values.fasting_status`
//                           gibt es — aber je Messung, nicht als
//                           Empfehlung je Marker. Gemeldet, nicht
//                           umgedeutet.
//   `Evidence level`        `[cmd]` Tom: *„Wir haben die Daten fuer
//                           diese Evidence nicht, also weg."*
//   `Linked across modules` `[cmd]` die Verknuepfung Supplement →
//                           Biomarker gibt es als Schema nicht.
//
// **KEINE BEWERTUNG**, wie in der Liste: `In range` / `Above range` /
// `Below range` sagen, WO der Wert liegt. `Optimal` und `Critical`
// der Attrappe sind Urteile und kommen hier nicht vor.
import * as React from 'react'
import { Card, Icon, LineChart, Pill, InEntwicklungKnopf } from '@lumeos/ui'

import type { Lage } from '../../../lib/medical/befund'
import { balkenSkala, type MarkerReihe } from '../../../lib/medical/reihe'
import { MMod } from './modale'

const LAGE_TEXT: Record<Lage, string> = {
  im_bereich: 'In range',
  darueber: 'Above range',
  darunter: 'Below range',
  unbekannt: 'No range',
}

const LAGE_FARBE: Record<Lage, string> = {
  im_bereich: 'var(--pos)',
  darueber: 'var(--warn)',
  darunter: 'var(--warn)',
  unbekannt: 'var(--fg-dim)',
}

function zahl(n: number | null): string {
  if (n == null) return '—'
  return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(4)))
}

function spanneText(low: number | null, high: number | null, text: string | null): string {
  if (low != null && high != null) return `${zahl(low)} – ${zahl(high)}`
  if (high != null) return `< ${zahl(high)}`
  if (low != null) return `> ${zahl(low)}`
  return text ?? '—'
}

export function MarkerReihenModal({ r, onClose }: { r: MarkerReihe; onClose: () => void }) {
  const punkte = r.messungen.map(m => m.wert).filter((w): w is number => w != null)
  const skala = balkenSkala(r)
  const farbe = LAGE_FARBE[r.lage]

  // Die Kurve spannt ueber Messwerte UND Optimalband, damit das Band
  // nicht aus dem Bild faellt. `[cmd]` `LineChart` (primitives.tsx:231)
  // zeichnet erst ab zwei Punkten — bei einer einzigen Messung bleibt
  // die Kachel weg, statt leer dazustehen.
  const kurvenWerte = punkte.slice()
  if (r.optimal?.low != null) kurvenWerte.push(r.optimal.low)
  if (r.optimal?.high != null) kurvenWerte.push(r.optimal.high)
  const kurvenBereich: [number, number] = [
    Math.min(...kurvenWerte) * 0.94,
    Math.max(...kurvenWerte) * 1.06,
  ]

  const anteil = (v: number) =>
    skala ? ((v - skala.von) / (skala.bis - skala.von)) * 100 : 0

  return (
    <MMod
      title={r.name}
      subtitle={[
        r.kurz,
        r.loinc_code ? `LOINC ${r.loinc_code}` : 'ohne LOINC-Zuordnung',
        r.klasse?.toLowerCase(),
      ].filter(Boolean).join(' · ')}
      eyebrow="trend_up"
      onClose={onClose}
      width={760}
      footer={
        <>
          <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Close</button>
          <InEntwicklungKnopf
            titel="Add value"
            className="v2-btn"
            grund="Eigene Messwerte brauchen einen Schreibpfad in medical.lab_result_values — den gibt es noch nicht."
          >
            <Icon name="plus" className="v2-ic v2-ic-sm" />Add value
          </InEntwicklungKnopf>
        </>
      }
    >
      <div className="v2-grid v2-g-cols-4 v2-med-vier" style={{ gap: 10, marginBottom: 14 }}>
        <Card className="v2-card-tight" style={{ padding: 12 }}>
          <div className="v2-eyebrow" style={{ marginBottom: 3 }}>Current</div>
          <div className="v2-num" style={{ fontSize: 20, fontWeight: 600, color: farbe }}>
            {r.aktuell.wert != null ? zahl(r.aktuell.wert) : (r.aktuell.wertText ?? '—')}
            <span className="v2-dim" style={{ fontSize: 10, marginLeft: 3 }}>{r.einheit}</span>
          </div>
          <div className="v2-dim" style={{ fontSize: 9.5, marginTop: 4 }}>{r.aktuell.datum}</div>
        </Card>

        <Card className="v2-card-tight" style={{ padding: 12 }}>
          <div className="v2-eyebrow" style={{ marginBottom: 3 }}>Lab range</div>
          <div className="v2-num" style={{ fontSize: 14, color: 'var(--acc-recov)' }}>
            {r.bereich ? spanneText(r.bereich.low, r.bereich.high, r.bereich.text) : '—'}
          </div>
          <div className="v2-dim" style={{ fontSize: 9.5, marginTop: 3 }}>vom Befund</div>
        </Card>

        <Card
          className="v2-card-tight"
          style={{
            padding: 12,
            background: 'color-mix(in oklch, var(--pos) 6%, var(--surface))',
            border: '1px solid color-mix(in oklch, var(--pos) 26%, var(--border))',
          }}
        >
          <div className="v2-eyebrow" style={{ marginBottom: 3, color: 'var(--pos)' }}>
            Optimal range
          </div>
          <div className="v2-num" style={{ fontSize: 14, color: 'var(--pos)' }}>
            {r.optimal
              ? spanneText(r.optimal.low, r.optimal.high, r.optimalText)
              : (r.optimalText ?? '—')}
          </div>
          <div className="v2-dim" style={{ fontSize: 9.5, marginTop: 3 }}>aus dem Katalog</div>
        </Card>

        <Card className="v2-card-tight" style={{ padding: 12 }}>
          <div className="v2-eyebrow" style={{ marginBottom: 3 }}>
            {`Trend · ${punkte.length} Messungen`}
          </div>
          <div className="v2-num" style={{ fontSize: 14 }}>
            {r.trendProzent == null
              ? 'n<2'
              : `${r.trendProzent > 0 ? '↑ +' : r.trendProzent < 0 ? '↓ ' : '→ '}${r.trendProzent}%`}
          </div>
          <div className="v2-dim" style={{ fontSize: 9.5, marginTop: 3 }}>
            {`${r.messungen[0].datum} → ${r.aktuell.datum}`}
          </div>
        </Card>
      </div>

      {skala && (
        <>
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Where you sit</div>
          <Card className="v2-card-tight" style={{ padding: 14, marginBottom: 14 }}>
            {/* `[cmd]` Ein Unterschied zur Attrappe mit Grund: sie faerbt
                den Balkengrund rot („outside lab range"), weil sie
                `critical_low`/`critical_high` fuehrt.
                `medical.lab_result_values` hat diese Spalten nicht —
                geprueft gegen `information_schema.columns`. Der Grund
                bleibt neutral, sonst behauptete die Farbe eine
                Schwelle, die niemand gemessen hat. */}
            <div style={{
              position: 'relative', height: 30, borderRadius: 5, overflow: 'hidden',
              background: 'var(--surface-2)', border: '1px solid var(--border)',
            }}>
              {skala.lab && (
                <div style={{
                  position: 'absolute', left: `${anteil(skala.lab[0])}%`,
                  width: `${anteil(skala.lab[1]) - anteil(skala.lab[0])}%`, top: 0, bottom: 0,
                  background: 'color-mix(in oklch, var(--acc-recov) 26%, transparent)',
                }} />
              )}
              {skala.opt && (
                <div style={{
                  position: 'absolute', left: `${anteil(skala.opt[0])}%`,
                  width: `${anteil(skala.opt[1]) - anteil(skala.opt[0])}%`, top: 0, bottom: 0,
                  background: 'color-mix(in oklch, var(--pos) 34%, transparent)',
                }} />
              )}
              <div style={{
                position: 'absolute', left: `${anteil(skala.wert)}%`, top: -2, bottom: -2,
                width: 2.5, background: farbe,
                boxShadow: '0 0 0 1.5px var(--bg)', borderRadius: 2,
              }} />
            </div>
            <div style={{
              display: 'flex', gap: 14, marginTop: 12, fontSize: 10,
              color: 'var(--fg-muted)', flexWrap: 'wrap',
            }}>
              <span className="v2-row-gap">
                <span style={{
                  width: 12, height: 10, borderRadius: 2,
                  background: 'color-mix(in oklch, var(--acc-recov) 26%, transparent)',
                }} />lab range
              </span>
              <span className="v2-row-gap">
                <span style={{
                  width: 12, height: 10, borderRadius: 2,
                  background: 'color-mix(in oklch, var(--pos) 34%, transparent)',
                }} />optimal
              </span>
              <span className="v2-row-gap">
                <span style={{ width: 2.5, height: 11, background: farbe }} />your value
              </span>
              <span style={{ marginLeft: 'auto', color: farbe }}>{LAGE_TEXT[r.lage]}</span>
            </div>
          </Card>
        </>
      )}

      {punkte.length >= 2 && (
        <>
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>
            {`History · ${r.messungen.length} Befunde`}
          </div>
          <Card className="v2-card-tight" style={{ padding: 12, marginBottom: 14 }}>
            {/* `[cmd]` Die Attrappe beschriftet sechs erfundene Quartale
                (`Q1 25`…`Q2 26`). Hier stehen die echten Befunddaten,
                auf Monat und Tag gekuerzt — vier bis fuenf Termine
                zwischen 2026-02-18 und 2026-08-19. */}
            <LineChart
              h={150}
              range={kurvenBereich}
              xLabels={r.messungen.map(m => m.datum.slice(5))}
              series={[
                { data: punkte, color: farbe },
                ...(r.optimal?.low != null
                  ? [{ data: Array(punkte.length).fill(r.optimal.low) as number[], color: 'var(--pos)' }]
                  : []),
                ...(r.optimal?.high != null
                  ? [{ data: Array(punkte.length).fill(r.optimal.high) as number[], color: 'var(--pos)' }]
                  : []),
              ]}
            />
            <div style={{
              display: 'flex', gap: 14, marginTop: 8, fontSize: 10.5,
              color: 'var(--fg-muted)', flexWrap: 'wrap',
            }}>
              <span className="v2-row-gap">
                <span className="v2-dot" style={{ background: farbe }} />your values
              </span>
              {(r.optimal?.low != null || r.optimal?.high != null) && (
                <span className="v2-row-gap">
                  <span className="v2-dot" style={{ background: 'var(--pos)' }} />optimal band
                </span>
              )}
            </div>
          </Card>
        </>
      )}

      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Measurements</div>
      <Card className="v2-card-tight" style={{ padding: 0 }}>
        <div className="v2-tbl-wrap">
          <table className="v2-tbl">
            <thead>
              {/* G-80: **Labor und Uhrzeit stehen jetzt da.** `[read]`
                  Der Befund aus G-63: *„Wer mehrere Befunde hat, sieht
                  heute nicht, von welchem Labor sie stammen."* `[cmd]`
                  Zwei Labore im Bestand ueber fuenf Befunde, und
                  Labore messen verschieden. Die Popup-Tabelle ist die
                  Stelle dafuer — die Liste zeigt je Marker eine Zeile,
                  hier steht jede Messung einzeln. */}
              <tr>
                <th style={{ width: 110 }}>Date</th>
                <th style={{ textAlign: 'right', width: 110 }}>Value</th>
                <th>Labor</th>
                <th style={{ width: 90 }}>Bereich</th>
              </tr>
            </thead>
            <tbody>
              {r.messungen.slice().reverse().map(m => (
                <tr key={m.id}>
                  <td className="v2-num v2-muted">
                    {m.datum}
                    {/* Die Uhrzeit als Unterzeile: sie gehoert zum
                        Datum, nicht in eine eigene Spalte. */}
                    {m.report_time && (
                      <div className="v2-dim v2-mono" style={{ fontSize: 9.5 }}>
                        {m.report_time.slice(0, 5)}
                      </div>
                    )}
                  </td>
                  <td className="v2-num" style={{ textAlign: 'right' }}>
                    {m.wert != null
                      ? `${m.operator !== '=' ? m.operator : ''}${zahl(m.wert)} ${r.einheit}`
                      : (m.wertText ?? '—')}
                    {/* `[cmd]` NUR wenn er etwas sagt: auf allen 140
                        Zeilen steht heute `unknown`, und das ist keine
                        Angabe, sondern deren Fehlen. Sobald ein Import
                        `fasting`/`non_fasting` liefert, steht es hier. */}
                    {m.fasting_status === 'fasting' && (
                      <div className="v2-dim" style={{ fontSize: 9.5 }}>nüchtern</div>
                    )}
                    {m.fasting_status === 'non_fasting' && (
                      <div className="v2-dim" style={{ fontSize: 9.5 }}>nicht nüchtern</div>
                    )}
                  </td>
                  <td className="v2-muted" style={{ fontSize: 11 }}>
                    {m.lab_name ?? <span className="v2-dim">—</span>}
                  </td>
                  <td>
                    {m.reference_source === 'catalog_fallback'
                      ? <Pill>Katalog</Pill>
                      : m.reference_source === 'lab_report'
                        ? <span className="v2-dim" style={{ fontSize: 10.5 }}>Befund</span>
                        : <span className="v2-dim" style={{ fontSize: 10.5 }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Was die Herkunftsspalte bedeutet — einmal, statt an jeder
            Zeile. `[read]` G-46: „dass er ein Rueckfall ist, muss
            sichtbar sein." */}
        {r.messungen.some(m => m.reference_source === 'catalog_fallback') && (
          <>
            <div className="v2-divider" />
            <div className="v2-muted" style={{ fontSize: 11, lineHeight: 1.5, padding: '0 14px 12px' }}>
              <strong>Katalog</strong>
              {' heisst: der Befund hat keinen eigenen Bereich mitgeliefert, '}
              {'und der Bereich stammt aus dem Biomarker-Katalog. Jedes Labor '}
              {'fuehrt eigene Bereiche — der des Befunds gilt, wo es einen gibt.'}
            </div>
          </>
        )}
      </Card>
    </MMod>
  )
}
