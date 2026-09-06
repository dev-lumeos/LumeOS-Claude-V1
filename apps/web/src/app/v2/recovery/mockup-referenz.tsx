'use client'

// Das Recovery-Mockup als Referenz unter der gebauten Ansicht —
// C-418/2, E-69.
//
// ## Warum diese Datei existiert
//
// **Tom, 2026-09-07:** *,,so habe ich ist und soll fuer mich immer
// bereit und ich kann arbeiten."*
//
// **E-69, der vollstaendige Ablauf:**
//
//     1  die Attrappe wird kopiert
//     2  die Kopie wird angebunden und oben eingehaengt
//     3  die Attrappe bleibt DARUNTER stehen
//     4  Tom vergleicht Ist gegen Soll auf einem Schirm
//     5  nimmt er ab, faellt die Attrappe
//
// `[read]` **Schritt 3 galt bisher nur fuer FEHLENDE Elemente**
// (C-418, `fehlende-kacheln.tsx`). **Er gilt fuer jedes** — auch fuer
// die 28 vorhandenen, sonst kann niemand vergleichen.
//
// ## Was hier steht und was nicht
//
// `[cmd]` **QUELLE: `theme-v1/module-recovery-v2.jsx`**, die Reiter
// `RecHRV` (Z446-539) und `RecSleep` (Z540-647).
//
// `[read]` **Uebernommen ist die ANSICHT, nicht die Rechnung.** Die
// Konstanten und Formeln stehen seit dem Modulbau in `motor.ts`
// (`CHECKIN`, `HRV_BASELINE`, `HRV_LOG`, `calcHRVScore`) — **hier
// wird nichts neu erfunden und nichts neu gerechnet.**
//
// `[read]` **Keine Anbindung.** Diese Ansichten lesen ausschliesslich
// die Entwurfskonstanten. **Sie sind der Soll-Stand zum Vergleich,
// nicht ein zweiter Ist-Stand.**
import * as React from 'react'
import { Card, Pill, Icon, Ring, Row, LineChart } from '@lumeos/ui'

import {
  CHECKIN, HRV_BASELINE, HRV_LOG, calcHRVScore,
  SLEEP_DATA, calcSleepScore, TODAY_MODALITIES,
} from './motor'
import { useRecovery } from './kontext'
import { attrappeAus } from './ansicht'

/** Der Grund an jeder Referenzkachel — E-68, aber kein „wartet auf". */
const REFERENZ = attrappeAus(
  'theme-v1/module-recovery-v2.jsx',
  'nichts — Referenz zum Vergleich, faellt mit Toms Abnahme',
)

/**
 * Die Trennlinie zwischen Ist und Soll.
 *
 * `[read]` **Ohne sie stehen zwei Fassungen derselben Kachel
 * untereinander und niemand weiss, welche gilt.**
 */
export function ReferenzTrenner({ reiter }: { reiter: string }) {
  return (
    <div
      className="v2-row-gap"
      style={{ gap: 10, alignItems: 'center', margin: '22px 0 14px' }}
    >
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      <Pill variant="warn">Mockup-Referenz</Pill>
      <span className="v2-dim" style={{ fontSize: 10.5 }}>
        {reiter} · theme-v1/module-recovery-v2.jsx · faellt mit der Abnahme
      </span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  )
}

// ══ HRV ════════════════════════════════════════════════════════════
// [cmd] module-recovery-v2.jsx:446-539.

/** Der HRV-Reiter, wie er im Mockup steht. */
export function RecHRVReferenz() {
  const { open } = useRecovery()
  const heute = calcHRVScore(CHECKIN.hrv_rmssd)
  const farbe = heute.score >= 70 ? 'var(--pos)'
    : heute.score >= 50 ? 'var(--warn)' : 'var(--neg)'

  return (
    <>
      <ReferenzTrenner reiter="HRV" />
      <div className="v2-grid" style={{ gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
        <div className="v2-col-gap" style={{ gap: 14 }}>
          <Card title="HRV score" sub="z-score against your rolling 30-day baseline"
                attrappe={REFERENZ}>
            <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 14 }}>
              <Ring value={heute.score} max={100} color={farbe} label="hrv"
                    size={112} stroke={8} />
              <div style={{ flex: 1 }}>
                <div className="v2-grid v2-g-cols-2" style={{ gap: 10 }}>
                  {([
                    ['Today RMSSD', `${CHECKIN.hrv_rmssd} ms`],
                    ['Baseline', `${HRV_BASELINE.avg_rmssd} ms`],
                    ['Std deviation', `± ${HRV_BASELINE.stddev_rmssd}`],
                    ['Z-score', `${heute.z > 0 ? '+' : ''}${heute.z}`],
                  ] as Array<[string, string]>).map(([l, v]) => (
                    <div key={l} style={{
                      padding: 9, background: 'var(--bg-elev)',
                      border: '1px solid var(--border)', borderRadius: 5,
                    }}>
                      <div className="v2-eyebrow" style={{ marginBottom: 2 }}>{l}</div>
                      <div className="v2-mono" style={{ fontSize: 15 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="v2-dim v2-mono" style={{
              fontSize: 10, lineHeight: 1.7, padding: 10,
              background: 'var(--surface-2)', borderRadius: 6,
            }}>
              deviation = (rmssd − baseline) / stddev = ({CHECKIN.hrv_rmssd} − {HRV_BASELINE.avg_rmssd})
              {' '}/ {HRV_BASELINE.stddev_rmssd} = {heute.z}<br />
              score = 70 + deviation × 15 = 70 + {heute.z} × 15 = {heute.score}<br />
              anchors: z +2 → 100 · z 0 → 70 · z −2 → 30 · z ≤ −3 → 0
            </div>
          </Card>

          <Card
            title="Measurement log"
            sub={`${HRV_LOG.length} readings · baseline from ${HRV_BASELINE.samples} of last ${HRV_BASELINE.window_days} days`}
            attrappe={REFERENZ}
            actions={(
              <button type="button" className="v2-btn v2-btn-sm"
                      onClick={() => open({ typ: 'hrvMeasure' })}>
                <Icon name="camera" className="v2-ic v2-ic-sm" />Measure now
              </button>
            )}
          >
            <div style={{ overflowX: 'auto' }}>
              <table className="v2-tbl">
                <thead>
                  <tr>
                    <th style={{ width: 100 }}>Date</th>
                    <th style={{ width: 80, textAlign: 'right' }}>RMSSD</th>
                    <th style={{ width: 70, textAlign: 'right' }}>Z</th>
                    <th style={{ width: 70, textAlign: 'right' }}>Score</th>
                    <th style={{ width: 110 }}>Method</th>
                    <th style={{ width: 80, textAlign: 'right' }}>Quality</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {HRV_LOG.map(h => {
                    const s = calcHRVScore(h.rmssd)
                    return (
                      <tr key={h.date}>
                        <td className="v2-mono v2-muted">{h.date.slice(5)}</td>
                        <td className="v2-mono" style={{ textAlign: 'right' }}>
                          {h.rmssd} <span className="v2-dim" style={{ fontSize: 9 }}>ms</span>
                        </td>
                        <td className="v2-mono" style={{
                          textAlign: 'right',
                          color: s.z >= 0 ? 'var(--pos)' : 'var(--warn)',
                        }}>{s.z > 0 ? '+' : ''}{s.z}</td>
                        <td className="v2-mono" style={{ textAlign: 'right' }}>{s.score}</td>
                        <td><Pill style={{ fontSize: 9 }}>{h.method.replace(/_/g, ' ')}</Pill></td>
                        <td className="v2-mono" style={{
                          textAlign: 'right',
                          color: h.quality >= 0.9 ? 'var(--pos)'
                            : h.quality >= 0.8 ? 'var(--warn)' : 'var(--neg)',
                        }}>{h.quality.toFixed(2)}</td>
                        <td className="v2-dim" style={{ fontSize: 10.5 }}>{h.note || '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="v2-col-gap" style={{ gap: 14 }}>

          <Card title="30-day trend" sub="RMSSD vs. baseline band" attrappe={REFERENZ}>
            <LineChart
              h={150} range={[44, 72]}
              xLabels={['30d', '', '', '20d', '', '', '10d', '', 'today']}
              series={[
                { data: [52, 54, 53, 56, 55, 58, 57, 59, 58, 60, 59, 61, 58, 62, 64], color: 'var(--acc-recov)' },
                { data: Array(15).fill(HRV_BASELINE.avg_rmssd), color: 'var(--fg-dim)' },
                { data: Array(15).fill(HRV_BASELINE.avg_rmssd - HRV_BASELINE.stddev_rmssd), color: 'var(--surface-2)' },
              ]}
            />
            <div style={{
              display: 'flex', gap: 14, marginTop: 8,
              fontSize: 10.5, color: 'var(--fg-muted)',
            }}>
              <span className="v2-row-gap">
                <span className="v2-dot" style={{ background: 'var(--acc-recov)' }} />RMSSD
              </span>
              <span className="v2-row-gap">
                <span className="v2-dot" style={{ background: 'var(--fg-dim)' }} />baseline
              </span>
              <span className="v2-row-gap">
                <span className="v2-dot" style={{ background: 'var(--surface-2)' }} />−1 SD
              </span>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

// ══ SLEEP ══════════════════════════════════════════════════════════
// [cmd] module-recovery-v2.jsx:540-647.

/** Der Sleep-Reiter, wie er im Mockup steht. */
export function RecSleepReferenz() {
  const w = calcSleepScore(SLEEP_DATA, CHECKIN)
  const s = calcSleepScore(null, CHECKIN)
  const d = SLEEP_DATA
  const anteil = (m: number) => Math.round((m / d.total_sleep_minutes) * 100)

  return (
    <>
      <ReferenzTrenner reiter="Sleep" />
      <div className="v2-grid" style={{ gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
        <div className="v2-col-gap" style={{ gap: 14 }}>
          <Card title="Last night" sub={`${d.bedtime} → ${d.wake} · source: ${d.source}`}
                attrappe={REFERENZ}>
            <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 14 }}>
              <Ring value={w.score} max={100} label="sleep" size={112} stroke={8}
                    color={w.score >= 85 ? 'var(--pos)'
                      : w.score >= 70 ? 'var(--acc-recov)' : 'var(--warn)'} />
              <div style={{ flex: 1 }}>
                <div className="v2-mono" style={{ fontSize: 26, lineHeight: 1, marginBottom: 4 }}>
                  {Math.floor(d.total_sleep_minutes / 60)}:
                  {String(d.total_sleep_minutes % 60).padStart(2, '0')}
                  <span className="v2-dim" style={{ fontSize: 12, marginLeft: 5 }}>hrs asleep</span>
                </div>
                <div className="v2-muted" style={{ fontSize: 11.5, marginBottom: 10 }}>
                  {d.time_in_bed_minutes} min in bed · {d.sleep_efficiency}% efficiency
                </div>
                <div className="v2-col-gap" style={{ gap: 4 }}>
                  {([
                    ['Deep', d.deep_sleep_minutes, 'var(--acc-coach)'],
                    ['REM', d.rem_sleep_minutes, 'var(--acc-buddy)'],
                    ['Light', d.light_sleep_minutes, 'var(--acc-recov)'],
                    ['Awake', d.awake_minutes, 'var(--neg)'],
                  ] as Array<[string, number, string]>).map(([l, m, c]) => (
                    <div key={l} style={{
                      display: 'grid', gridTemplateColumns: '52px 1fr 64px 40px',
                      gap: 8, alignItems: 'center', fontSize: 11,
                    }}>
                      <span>{l}</span>
                      <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 999 }}>
                        <div style={{
                          height: '100%', width: `${anteil(m)}%`,
                          background: c, borderRadius: 999,
                        }} />
                      </div>
                      <span className="v2-mono" style={{ textAlign: 'right' }}>
                        {Math.floor(m / 60)}h {m % 60}m
                      </span>
                      <span className="v2-mono v2-dim" style={{ textAlign: 'right', fontSize: 10 }}>
                        {anteil(m)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="v2-divider" />
            {/* `[cmd]` **`eff`, `dur` und `deep` sind optional** — sie
                stehen nur auf dem Wearable-Weg (`motor.ts:387`).
                `[read]` **Hier liegt `SLEEP_DATA` vor, also sind sie
                gesetzt** — der Typecheck weiss das nicht, und ein
                `!` waere eine Behauptung. **Also gepruefte
                Anzeige.** */}
            <div className="v2-eyebrow" style={{ marginBottom: 8 }}>Score formula · wearable path</div>
            <div className="v2-dim v2-mono" style={{
              fontSize: 10, lineHeight: 1.8, padding: 10,
              background: 'var(--surface-2)', borderRadius: 6,
            }}>
              efficiency {d.sleep_efficiency}% → {(w.eff ?? 0).toFixed(2)} × 0.40 = {((w.eff ?? 0) * 0.4).toFixed(3)}<br />
              duration {d.total_sleep_minutes}/480 min → {(w.dur ?? 0).toFixed(2)} × 0.40 = {((w.dur ?? 0) * 0.4).toFixed(3)}<br />
              deep {d.deep_sleep_minutes}/90 min → {(w.deep ?? 0).toFixed(2)} × 0.20 = {((w.deep ?? 0) * 0.2).toFixed(3)}<br />
              <span style={{ color: 'var(--fg)' }}>total × 100 = {w.score}</span>
            </div>
          </Card>

          <Card title="14 nights" sub="duration + stage composition" attrappe={REFERENZ}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(14, 1fr)', gap: 3, height: 96,
            }}>
              {Array.from({ length: 14 }).map((_, i) => {
                const dauer = 6.2 + Math.sin(i * 1.1) * 0.9 + (i === 13 ? 0.4 : 0)
                const h = (dauer / 9.5) * 100
                const tief = 0.17 + Math.sin(i * 0.7) * 0.03
                const rem = 0.21 + Math.cos(i * 0.5) * 0.03
                const wach = 0.05
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
                    <div title={`${dauer.toFixed(1)}h`} style={{
                      width: '100%', height: `${h}%`, display: 'flex',
                      flexDirection: 'column', borderRadius: '2px 2px 0 0', overflow: 'hidden',
                    }}>
                      <div style={{ flex: wach, background: 'var(--neg)', opacity: 0.7 }} />
                      <div style={{ flex: rem, background: 'var(--acc-buddy)', opacity: 0.8 }} />
                      <div style={{ flex: 1 - tief - rem - wach, background: 'var(--acc-recov)', opacity: 0.75 }} />
                      <div style={{ flex: tief, background: 'var(--acc-coach)', opacity: 0.9 }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="v2-mono" style={{
              display: 'flex', justifyContent: 'space-between', marginTop: 6,
              fontSize: 9.5, color: 'var(--fg-dim)',
            }}>
              <span>14 nights ago</span><span>last night</span>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

// ══ TODAY ══════════════════════════════════════════════════════════
// [cmd] module-recovery-v2.jsx:99-244.
//
// `[read]` **Nur die angebundenen Kacheln bekommen eine Referenz.**
// `[cmd]` **Im Today-Reiter sind das drei:** `ScoreKachel`
// (`recovery.scores`), `ModalitaetenKachel` (`recovery.modality_log`)
// und `ScoreVerlauf`.
//
// `[cmd]` **`Pending actions`, `Muscle readiness` und `Contributors`
// tragen oben selbst `attrappe=`** — **sie stehen hier nicht noch
// einmal.**

/** Der Today-Reiter, soweit er oben angebunden ist. */
export function RecTodayReferenz() {
  const { modus, setModus, sc, rd } = useRecovery()

  return (
    <>
      <ReferenzTrenner reiter="Today" />
      <div className="v2-grid" style={{ gridTemplateColumns: '1.5fr 1fr', gap: 14 }}>
        <div className="v2-col-gap" style={{ gap: 14 }}>
          <Card attrappe={REFERENZ}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 14 }}>
              <Ring value={sc.score} max={100} color={rd.c} label={rd.level}
                    size={140} stroke={10} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span className="v2-eyebrow">Readiness</span>
                  <div style={{
                    display: 'flex', background: 'var(--surface-2)',
                    borderRadius: 6, padding: 2, gap: 1, marginLeft: 'auto',
                  }}>
                    {(['manual', 'hrv'] as const).map(m => (
                      <button key={m} type="button" onClick={() => setModus(m)}
                              className={modus === m ? 'v2-btn v2-btn-primary' : 'v2-btn v2-btn-ghost'}
                              style={{ height: 20, fontSize: 10, padding: '0 9px', borderRadius: 4 }}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: 19, fontWeight: 600, marginBottom: 5, color: rd.c }}>
                  {rd.label}
                </div>
                <div style={{
                  fontSize: 12.5, color: 'var(--fg-muted)',
                  lineHeight: 1.5, marginBottom: 10,
                }}>{rd.advice}</div>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  {([
                    ['HRV', `${CHECKIN.hrv_rmssd} ms`, `z ${sc.hrv.z}`],
                    ['Sleep', `${CHECKIN.sleep_hours} h`, `q ${CHECKIN.sleep_quality}/10`],
                    // `[cmd]` **Der Bonus-Term ist seit C-181 weg**
                    // (Evidenzregister). `[read]` **Also zeigt die
                    // Referenz die Gewichtssumme, die es GIBT** —
                    // eine erfundene Zahl waere schlechter als keine.
                    ['Summe', `${sc.subtotal.toFixed(1)}`,
                      `von ${sc.gewichtsumme}`],
                  ] as Array<[string, string, string]>).map(([l, v, s]) => (
                    <div key={l}>
                      <div className="v2-eyebrow" style={{ marginBottom: 2 }}>{l}</div>
                      <div className="v2-mono" style={{ fontSize: 16, lineHeight: 1 }}>{v}</div>
                      <div className="v2-dim v2-mono" style={{ fontSize: 9.5, marginTop: 2 }}>{s}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="v2-divider" />
            <div className="v2-eyebrow" style={{ marginBottom: 8 }}>
              Score composition · {modus} mode
            </div>
            <div className="v2-col-gap" style={{ gap: 5 }}>
              {sc.terms.map(t => (
                <div key={t.key} style={{
                  display: 'grid', gridTemplateColumns: '130px 90px 1fr 52px',
                  gap: 10, alignItems: 'center', fontSize: 11,
                }}>
                  <span style={{ color: 'var(--fg-muted)' }}>{t.label}</span>
                  <span className="v2-mono v2-dim" style={{ fontSize: 10 }}>{t.raw}</span>
                  <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 999 }}>
                    <div style={{
                      height: '100%', width: `${(t.val / t.w) * 100}%`,
                      background: 'var(--acc-recov)', borderRadius: 999,
                    }} />
                  </div>
                  <span className="v2-mono" style={{ textAlign: 'right' }}>
                    {t.val.toFixed(1)}
                    <span className="v2-dim" style={{ fontSize: 9 }}>/{t.w}</span>
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="v2-col-gap" style={{ gap: 14 }}>
          <Card title="Today's modalities" sub="what you logged" attrappe={REFERENZ}>
            <div className="v2-col-gap" style={{ gap: 6 }}>
              {TODAY_MODALITIES.map(m => (
                <div key={m.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: 9,
                  background: 'var(--bg-elev)', border: '1px solid var(--border)',
                  borderRadius: 5, fontSize: 11.5,
                }}>
                  <span style={{ flex: 1 }}>{m.type.replace(/_/g, ' ')}</span>
                  <span className="v2-mono v2-dim">{m.duration} min</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
