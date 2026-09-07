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
import {
  Card, Pill, Icon, Ring, Row, LineChart, ErmuedungsKarte,
} from '@lumeos/ui'

import {
  ReferenzTrenner as GeteilterTrenner,
} from '@/components/shell/referenz-trenner'
import { alsErmuedung, KARTE_ZU_RECOVERY } from './muskel-zuordnung'
import {
  CHECKIN, HRV_BASELINE, HRV_LOG, calcHRVScore,
  SLEEP_DATA, calcSleepScore, TODAY_MODALITIES,
  MUSCLE_GROUPS_BODYMAP, MUSCLE_STATE, NUTRITION_INPUT,
  calcMuscleRecovery, MUSCLE_LABEL, MODALITY_LOG,
  STRESS_TODAY, STRESS_BANDS, STRESS_SOURCES,
  RECOVERY_PROTOCOLS, ACTIVE_PROTOCOL, READINESS_LEVELS,
} from './motor'
import { useRecovery } from './kontext'
import { attrappeAus } from './ansicht'

/** Die vier Stufen der Muskelkater-Skala — module-recovery-v2.jsx. */
const SORENESS_SKALA: Array<[string, string]> = [
  ['0 none', 'var(--surface-2)'],
  ['1 mild', 'var(--acc-recov)'],
  ['2 moderate', 'var(--warn)'],
  ['3 severe', 'var(--neg)'],
]

/** Der Grund an jeder Referenzkachel — E-68, aber kein „wartet auf". */
const REFERENZ = attrappeAus(
  'theme-v1/module-recovery-v2.jsx',
  'nichts — Referenz zum Vergleich, faellt mit Toms Abnahme',
)

/**
 * Die Referenz NENNT ihre Kachel — A1, Tom 2026-09-07.
 *
 * **Tom:** *„Tom muss sehen koennen, welche Referenz zu welcher
 * Kachel gehoert — nicht suchen."*
 *
 * `[read]` **Ohne die Zuordnung stehen unten Titel, die es oben
 * nicht gibt** (`HRV score` gegen `HRV`, `Measurement log` gegen
 * `Messprotokoll`) — **die Uebersetzung ist genau das, was C-418
 * gemessen hat.**
 *
 * @param oben  Der Titel der angebundenen Kachel darueber.
 */
function fuer(oben: string): string {
  return `${REFERENZ} · Soll zu „${oben}"`
}

/**
 * Die Trennlinie zwischen Ist und Soll.
 *
 * `[read]` **Ohne sie stehen zwei Fassungen derselben Kachel
 * untereinander und niemand weiss, welche gilt.**
 */
// `[cmd]` Der Trenner stand hier zweimal — einmal lokal, einmal in
// `components/shell/referenz-trenner.tsx` fuer die uebrigen Module.
// Zwei Fassungen derselben Linie heissen zwei Orte, an denen eine
// Marke fehlen kann; recovery benutzt jetzt die geteilte.
export function ReferenzTrenner({ reiter }: { reiter: string }) {
  return (
    <GeteilterTrenner
      reiter={reiter}
      quelle="theme-v1/module-recovery-v2.jsx"
    />
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
                attrappe={fuer('HRV')}>
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
            attrappe={fuer('Messprotokoll')}
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

          {/* [cmd] module-recovery-v2.jsx:569-585 */}
          <Card title="Phone camera HRV" sub="no wearable required"
                attrappe={REFERENZ}>
            <div style={{
              padding: 14,
              background: 'color-mix(in oklch, var(--acc-recov) 6%, var(--surface))',
              border: '1px solid color-mix(in oklch, var(--acc-recov) 24%, var(--border))',
              borderRadius: 7, marginBottom: 12,
            }}>
              <div style={{ fontSize: 12.5, lineHeight: 1.6, color: 'var(--fg-muted)' }}>
                Index finger on the camera lens with the flash on. 60 seconds of PPG
                signal gives R-R intervals, which give RMSSD. Validated at r = 0.98
                against a chest strap.
              </div>
            </div>
            <Row label="Duration" value="60 seconds" />
            <Row label="Accuracy vs. strap" value="r = 0.98" />
            <Row label="Limitations" value="motion, poor lighting" />
            <Row label="Best time" value="on waking, before standing" />
          </Card>

          <Card title="30-day trend" sub="RMSSD vs. baseline band" attrappe={fuer('Verlauf')}>
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
                attrappe={fuer('Letzte Nacht')}>
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

          {/* `[cmd]` **C-418/3 zurueckgenommen:** diese Kachel war als
              Selbstreferenz entfernt worden. `[cmd]` **Die gebaute
              `Schlafhygiene` ist aber ANGEBUNDEN** (liest den
              Check-in) — **also braucht sie ihr Mockup-Gegenstueck.** */}
          {/* [cmd] module-recovery-v2.jsx:610-630 */}
          <Card title="Score paths" sub="wearable vs. subjective"
                attrappe={REFERENZ}>
            <div className="v2-col-gap" style={{ gap: 8 }}>
              <div style={{
                padding: 11,
                background: 'color-mix(in oklch, var(--pos) 6%, var(--surface))',
                border: '1px solid color-mix(in oklch, var(--pos) 26%, var(--border))',
                borderRadius: 6,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>Wearable path</span>
                  <Pill variant="pos" style={{ marginLeft: 'auto' }}>active</Pill>
                </div>
                <div className="v2-dim v2-mono" style={{ fontSize: 10, marginTop: 3 }}>
                  efficiency 0.4 + duration 0.4 + deep 0.2
                </div>
              </div>
              <div style={{
                padding: 11, background: 'var(--surface)',
                border: '1px solid var(--border)', borderRadius: 6,
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                  Subjective fallback
                </div>
                <div className="v2-dim v2-mono" style={{ fontSize: 10, marginTop: 3 }}>
                  quality 0.6 + duration 0.4
                </div>
              </div>
            </div>
          </Card>

          <Card title="Sleep hygiene inputs" sub="from check-in"
                attrappe={fuer('Schlafhygiene')}>
            <Row label="Caffeine today" value={`${CHECKIN.caffeine_mg} mg`} />
            <Row label="Alcohol" value={`${CHECKIN.alcohol_units} units`} />
            <Row label="Screen before bed" value={`${CHECKIN.screen_time_before_bed} min`} />
            <Row label="Stress level" value={`${CHECKIN.stress_level}/10`} />
            <div className="v2-divider" />
            <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.5 }}>
              Caffeine at 280 mg with a 17:30 pre-workout dose sits close to the
              edge — bedtime has drifted 22 min later across the last 14 days.
            </div>
          </Card>

          <Card title="14 nights" sub="duration + stage composition" attrappe={fuer('14 Nächte')}>
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
  const { modus, setModus, sc, rd, ot, pending } = useRecovery()

  return (
    <>
      <ReferenzTrenner reiter="Today" />
      <div className="v2-grid" style={{ gridTemplateColumns: '1.5fr 1fr', gap: 14 }}>
        <div className="v2-col-gap" style={{ gap: 14 }}>
          <Card attrappe={fuer('Erholungswert')}>
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
          {/* [cmd] module-recovery-v2.jsx:182-198 */}
          <Card title="Pending actions" sub={`${pending.length} open`}
                attrappe={REFERENZ}>
            <div className="v2-col-gap" style={{ gap: 5 }}>
              {pending.map(p => {
                const c = p.priority === 'high' ? 'var(--warn)'
                  : p.priority === 'normal' ? 'var(--acc-recov)' : 'var(--fg-dim)'
                return (
                  <div key={p.text} style={{
                    display: 'flex', gap: 9, padding: 9,
                    background: `color-mix(in oklch, ${c} 5%, var(--surface))`,
                    border: `1px solid color-mix(in oklch, ${c} 24%, var(--border))`,
                    borderRadius: 5,
                  }}>
                    <div style={{ width: 3, alignSelf: 'stretch', background: c, borderRadius: 2 }} />
                    <div style={{ flex: 1 }}>
                      <div className="v2-mono" style={{ fontSize: 10, color: c, marginBottom: 2 }}>
                        {p.type.replace(/_/g, ' ')}
                      </div>
                      <div style={{ fontSize: 11.5, lineHeight: 1.4 }}>{p.text}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* [cmd] module-recovery-v2.jsx:225-239 */}
          <Card title="Overtraining watch"
                sub={`${ot.count} of 8 signals · ${ot.severity}`}
                attrappe={REFERENZ}>
            <div style={{ display: 'flex', gap: 3, marginBottom: 10 }}>
              {ot.results.map(r => (
                <div key={r.id} title={`${r.label} · ${r.detailText}`} style={{
                  flex: 1, height: 22, borderRadius: 3,
                  background: r.fired ? 'var(--warn)' : 'var(--surface-2)',
                  opacity: r.fired ? 0.85 : 1,
                }} />
              ))}
            </div>
            <Row label="Severity" value={ot.severity} />
            <Row label="Threshold" value="3+ moderate · 5+ high · 7+ critical" />
            <div className="v2-divider" />
            <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.5 }}>
              Single signals are normal day-to-day noise. The combination is what
              matters — that is why severity keys off count, not any one threshold.
            </div>
          </Card>

          <Card title="Today's modalities" sub="what you logged" attrappe={fuer('Modalitäten')}>
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

// ══ MUSCLE READINESS (Today) ═══════════════════════════════════════
// [cmd] module-recovery-v2.jsx:170-181.

/** Die Muskelkarte des Today-Reiters, wie sie im Mockup steht. */
export function MuscleReadinessReferenz() {
  const { zeigeTab, open } = useRecovery()
  const werte = React.useMemo(() => {
    const aus: Record<string, number | null> = {}
    for (const slug of MUSCLE_GROUPS_BODYMAP) {
      const st = MUSCLE_STATE[slug]
      aus[slug] = st
        ? calcMuscleRecovery({
          hours: st.hours, sets: st.sets, sleepQuality: CHECKIN.sleep_quality,
          proteinPct: NUTRITION_INPUT.proteinPct,
          caloriePct: NUTRITION_INPUT.caloriePct, soreness: st.soreness,
        }).value
        : null
    }
    return aus
  }, [])

  return (
    <Card
      title="Muscle readiness" sub="18 groups · click for the calculation"
      attrappe={fuer('Muscle readiness')}
      actions={(
        <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                onClick={() => zeigeTab('muscles')}>
          Full map →
        </button>
      )}
    >
      <ErmuedungsKarte
        daten={alsErmuedung(werte)}
        breite={150}
        onPick={(id, typ) => {
          const slug = KARTE_ZU_RECOVERY[id]
          if (typ === 'muscle' && slug) open({ typ: 'muscle', slug })
        }}
      />
    </Card>
  )
}

// ══ MUSCLE MAP ═════════════════════════════════════════════════════
// [cmd] module-recovery-v2.jsx:378-443.

/** Der Muscle-map-Reiter, wie er im Mockup steht. */
export function RecMuscleMapReferenz() {
  const { open } = useRecovery()
  const reihen = React.useMemo(() => MUSCLE_GROUPS_BODYMAP.map(slug => {
    const st = MUSCLE_STATE[slug]
    if (!st) {
      return {
        slug, value: null as number | null,
        hours: 0, sets: 0, soreness: 0, lastSession: '',
      }
    }
    const calc = calcMuscleRecovery({
      hours: st.hours, sets: st.sets, sleepQuality: CHECKIN.sleep_quality,
      proteinPct: NUTRITION_INPUT.proteinPct,
      caloriePct: NUTRITION_INPUT.caloriePct, soreness: st.soreness,
    })
    return { slug, ...st, ...calc }
  }).sort((a, b) => (a.value ?? 999) - (b.value ?? 999)), [])
  const werte = Object.fromEntries(reihen.map(r => [r.slug, r.value]))

  return (
    <>
      <ReferenzTrenner reiter="Muscle map" />
      <div className="v2-rec-grid-1135">
        <Card title="Muscle recovery" sub="18 groups · click for the breakdown"
              attrappe={fuer('Muscle recovery')}>
          <ErmuedungsKarte
            daten={alsErmuedung(werte)}
            breite={180}
            onPick={(id, typ) => {
              const slug = KARTE_ZU_RECOVERY[id]
              if (typ === 'muscle' && slug) open({ typ: 'muscle', slug })
            }}
          />
          <div className="v2-divider" />
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Base recovery curve</div>
          <LineChart h={110} range={[0, 105]}
                     xLabels={['0h', '12h', '24h', '48h', '72h', '96h']}
                     series={[{ data: [10, 30, 50, 75, 90, 100], color: 'var(--acc-recov)' }]} />
        </Card>

        <Card title="Per-muscle detail" sub="sorted by readiness · lowest first"
              attrappe={fuer('Per-muscle detail')}>
          <div className="v2-tbl-wrap">
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th>Muscle</th>
                  <th style={{ textAlign: 'right' }}>Hours</th>
                  <th style={{ textAlign: 'right' }}>Sets</th>
                  <th style={{ textAlign: 'right' }}>Sore</th>
                  <th style={{ textAlign: 'right' }}>Recovery</th>
                </tr>
              </thead>
              <tbody>
                {reihen.filter(r => r.value != null).map(r => (
                  <tr key={r.slug}>
                    <td>{MUSCLE_LABEL[r.slug] ?? r.slug}</td>
                    <td className="v2-mono" style={{ textAlign: 'right' }}>{r.hours}</td>
                    <td className="v2-mono" style={{ textAlign: 'right' }}>{r.sets}</td>
                    <td className="v2-mono" style={{ textAlign: 'right' }}>{r.soreness}/3</td>
                    <td className="v2-mono" style={{ textAlign: 'right' }}>{r.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  )
}

// ══ MODALITIES ═════════════════════════════════════════════════════
// [cmd] module-recovery-v2.jsx:648-747.

/**
 * Der Modalitaeten-Reiter, wie er im Mockup steht.
 *
 * `[cmd]` **A1-AUSNAHME, von Tom benannt (2026-09-07):** oben stehen
 * VIER angebundene Zahlkacheln (`Logged today`, `Best next-day
 * rating`, `Belegte Modalitaeten`, `Awaiting rating`), **im Mockup
 * ist das EINE Zeile** (`module-recovery-v2.jsx:200`).
 *
 * `[read]` **Das Mockup ist der Massstab, nicht der Schnitt im
 * Code** — also eine Referenz fuer alle vier, mit dem Grund an der
 * Kachel.
 */
export function RecModalitiesReferenz() {
  return (
    <>
      <ReferenzTrenner reiter="Modalities" />
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card
          title="Today's modalities"
          sub="eine Zeile im Mockup — oben vier Zahlkacheln"
          attrappe={fuer('Logged today · Best next-day · Belegte · Awaiting')}
        >
          <div className="v2-col-gap" style={{ gap: 5 }}>
            {TODAY_MODALITIES.map(m => (
              <div key={m.id} style={{
                display: 'flex', alignItems: 'center', gap: 9, padding: 9,
                background: 'var(--bg-elev)', border: '1px solid var(--border)',
                borderRadius: 5,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 500 }}>
                    {m.type.replace(/_/g, ' ')}
                  </div>
                  <div className="v2-dim v2-mono" style={{ fontSize: 9.5 }}>
                    {m.time} · {m.duration} min · {m.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* [cmd] module-recovery-v2.jsx:650-680 — die vier Zahlkacheln. */}
        <div className="v2-grid v2-g-cols-4" style={{ gap: 10 }}>
          {([
            ['Logged today', String(TODAY_MODALITIES.length), 'heute erfasst'],
            ['Best next-day rating', '9/10', 'massage · 12 Aug'],
            ['Belegte Modalitaeten', '6', 'von 11 im Register'],
            ['Awaiting rating',
              String(MODALITY_LOG.filter(m => m.nextDay == null).length),
              'next-day feedback'],
          ] as Array<[string, string, string]>).map(([l, v, s]) => (
            <Card key={l} className="v2-card-tight" style={{ padding: 14 }}
                  attrappe={REFERENZ}>
              <div className="v2-eyebrow">{l}</div>
              <div className="v2-mono" style={{ fontSize: 22 }}>{v}</div>
              <div className="v2-dim" style={{ fontSize: 11 }}>{s}</div>
            </Card>
          ))}
        </div>

        <Card title="Modality catalog" sub="11 types · Wirkung laut Evidenzregister"
              attrappe={REFERENZ}>
          <div style={{ overflowX: 'auto' }}>
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th>Art</th>
                  <th style={{ width: 90, textAlign: 'right' }}>erfasst</th>
                  <th style={{ width: 110, textAlign: 'right' }}>Dauer im Mittel</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(new Set(MODALITY_LOG.map(m => m.type)))
                  .map(art => {
                    const zeilen = MODALITY_LOG.filter(m => m.type === art)
                    const mittel = Math.round(
                      zeilen.reduce((s, z) => s + (z.duration ?? 0), 0) / zeilen.length)
                    return (
                      <tr key={art}>
                        <td>{art.replace(/_/g, ' ')}</td>
                        <td className="v2-num" style={{ textAlign: 'right' }}>
                          {zeilen.length}
                        </td>
                        <td className="v2-num v2-muted" style={{ textAlign: 'right' }}>
                          {mittel} min
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
          <div className="v2-divider" />
          <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.5 }}>
            Der Entwurf fuehrt elf Arten mit Wirkung und Evidenzgrad.
            `[cmd]` C-124: Punktboni sind entfernt — das Register belegt
            Richtungen, keine Punktwerte.
          </div>
        </Card>

        <Card title="Effectiveness log" sub="immediate rating + next-day follow-up"
              attrappe={fuer('Effectiveness log')}>
          <div className="v2-col-gap" style={{ gap: 6 }}>
            {MODALITY_LOG.slice(0, 6).map(m => (
              <div key={m.id} style={{
                padding: 11, background: 'var(--bg-elev)',
                border: '1px solid var(--border)', borderRadius: 6,
              }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>
                    {m.type.replace(/_/g, ' ')}
                  </span>
                  <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>
                    {m.duration} min · {m.detail}
                  </span>
                  <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>
                    {m.date.slice(5)} {m.time}
                  </span>
                </div>
                <div className="v2-dim v2-mono" style={{ fontSize: 10 }}>
                  sofort {m.immediate}/10 · Folgetag {m.nextDay ?? 'offen'}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}

// ══ CHECK-IN ═══════════════════════════════════════════════════════
// [cmd] module-recovery-v2.jsx:335-352.

/**
 * Die Vorschau des Check-in-Reiters, wie sie im Mockup steht.
 *
 * `[read]` **Nur diese eine Kachel** — `Morning check-in`,
 * `Readiness levels` und `Why check in daily` sind oben selbst
 * Attrappen und brauchen keine Referenz auf sich.
 */
export function RecCheckinReferenz() {
  const { sc, rd } = useRecovery()
  return (
    <>
      <ReferenzTrenner reiter="Check-in" />
      {/* [cmd] module-recovery-v2.jsx:258 — das Formular selbst. */}
      <Card title="Morning check-in"
            sub="target: under 30 seconds · overwrite any time today"
            attrappe={REFERENZ}>
        {/* [cmd] module-recovery-v2.jsx: die Erfassungsfelder mit den
            Werten aus `CHECKIN`. */}
        <div className="v2-eyebrow" style={{ marginBottom: 6 }}>
          Sleep duration · {CHECKIN.sleep_hours} h
        </div>
        <div style={{
          height: 6, background: 'var(--surface-2)', borderRadius: 999,
          marginBottom: 4, position: 'relative',
        }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${(CHECKIN.sleep_hours / 12) * 100}%`,
            background: 'var(--acc-recov)', borderRadius: 999,
          }} />
        </div>
        <div className="v2-dim v2-mono" style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 9.5, marginBottom: 14,
        }}>
          <span>0</span><span>4</span><span>8</span><span>12 h</span>
        </div>

        <div className="v2-eyebrow" style={{ marginBottom: 6 }}>
          Sleep quality · {CHECKIN.sleep_quality}/10
        </div>
        <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 22, borderRadius: 4,
              background: i < CHECKIN.sleep_quality
                ? 'var(--acc-recov)' : 'var(--surface-2)',
              opacity: i < CHECKIN.sleep_quality ? 0.35 + (i / 10) * 0.65 : 1,
            }} />
          ))}
        </div>

        <div className="v2-eyebrow" style={{ marginBottom: 6 }}>
          How do you feel · {CHECKIN.subjective_feeling}/10
        </div>
        <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 28, borderRadius: 4,
              display: 'grid', placeItems: 'center',
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
              background: i < CHECKIN.subjective_feeling
                ? 'var(--acc-recov)' : 'var(--surface-2)',
              opacity: i < CHECKIN.subjective_feeling ? 0.35 + (i / 10) * 0.65 : 1,
              color: i + 1 === CHECKIN.subjective_feeling
                ? 'var(--bg)' : 'var(--fg-dim)',
            }}>{i + 1}</div>
          ))}
        </div>

        <div className="v2-eyebrow" style={{ marginBottom: 6 }}>
          Soreness · tap a muscle to cycle 0 -&gt; 3
        </div>
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 14,
          fontSize: 10, color: 'var(--fg-muted)', marginBottom: 12,
        }}>
          {SORENESS_SKALA.map(([l, c]) => (
            <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{
                width: 10, height: 10, borderRadius: 2,
                background: c, opacity: 0.68,
              }} />{l}
            </span>
          ))}
        </div>
        <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.5 }}>
          Dazu klappbar: Stress, Alkohol, Koffein, Bildschirmzeit —
          und der Knopf „Save check-in · recalculates score&ldquo;.
        </div>
      </Card>

      {/* [cmd] module-recovery-v2.jsx — die Muskelkater-Karte. */}
      <Card className="v2-card-tight" style={{ padding: 12 }} attrappe={REFERENZ}>
        <div className="v2-eyebrow" style={{ marginBottom: 6 }}>
          Soreness · tap a muscle to cycle 0 → 3
        </div>
        <div className="v2-dim" style={{ fontSize: 11, lineHeight: 1.5 }}>
          Der Entwurf zeigt hier die anatomische Karte in Stufen 0-3.
          Die gebaute Fassung darueber traegt dieselbe Karte, mit
          Schreibweg in `recovery.checkins.soreness`.
        </div>
      </Card>

      <Card title="Live score preview" sub="updates as you edit"
            attrappe={fuer('Vorschau')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Ring value={sc.score} max={100} color={rd.c} label={rd.level}
                size={96} stroke={7} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: rd.c, marginBottom: 3 }}>
              {rd.label}
            </div>
            <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.45 }}>
              {rd.advice}
            </div>
            <div className="v2-dim v2-mono" style={{ fontSize: 10, marginTop: 6 }}>
              aus den Entwurfswerten — die gebaute Vorschau rechnet mit
              den Eingaben des Formulars
            </div>
          </div>
        </div>
      </Card>

      {/* [cmd] module-recovery-v2.jsx — die zwei Erklaerkacheln. */}
      <Card title="Readiness levels" sub="score -> training recommendation"
            attrappe={REFERENZ}>
        <div className="v2-col-gap" style={{ gap: 5 }}>
          {READINESS_LEVELS.map(l => (
            <div key={l.label} style={{
              display: 'grid', gridTemplateColumns: '52px 108px 1fr',
              gap: 10, alignItems: 'center', fontSize: 11.5,
              padding: '8px 10px', borderRadius: 5,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderLeft: `3px solid ${l.c}`,
            }}>
              <span className="v2-num v2-dim">&gt;= {l.min}</span>
              <span style={{ fontWeight: 600, color: l.c }}>{l.label}</span>
              <span className="v2-dim">{l.advice}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Why check in daily" sub="the one required interaction"
            attrappe={REFERENZ}>
        <div className="v2-col-gap" style={{ gap: 7 }}>
          {([
            ['Der Erholungswert braucht ihn',
             'Schlaf, Gefuehl und Muskelkater sind vier der sieben Anteile.'],
            ['Ohne ihn faellt die Reihe',
             'Ein fehlender Tag unterbricht die Grundlinie, gegen die gerechnet wird.'],
            ['Dreissig Sekunden',
             'Vier Regler und eine Koerperkarte — mehr verlangt der Entwurf nicht.'],
          ] as Array<[string, string]>).map(([titel, satz]) => (
            <div key={titel} style={{
              padding: 10, background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: 6,
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 3 }}>
                {titel}
              </div>
              <div className="v2-dim" style={{ fontSize: 11, lineHeight: 1.45 }}>
                {satz}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}

// ══ OVERTRAINING ═══════════════════════════════════════════════════
// [cmd] module-recovery-v2.jsx:748-824, eins zu eins.

/** Der Overtraining-Reiter, wie er im Mockup steht. */
export function RecOvertrainingReferenz() {
  const { ot } = useRecovery()
  const sevFarbe = ({
    normal: 'var(--pos)', moderate: 'var(--warn)',
    high: 'var(--neg)', critical: 'var(--neg)',
  } as Record<string, string>)[ot.severity] ?? 'var(--fg)'

  return (
    <>
      <ReferenzTrenner reiter="Overtraining" />
      <div className="v2-grid" style={{ gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
        <Card title="Signal panel"
              sub={`${ot.count} of 8 firing · severity ${ot.severity}`}
              attrappe={REFERENZ}>
          <div className="v2-col-gap" style={{ gap: 6 }}>
            {ot.results.map(r => (
              <div key={r.id} style={{
                display: 'flex', gap: 11, padding: 11,
                background: r.fired
                  ? 'color-mix(in oklch, var(--warn) 6%, var(--surface))'
                  : 'var(--surface)',
                border: `1px solid ${r.fired
                  ? 'color-mix(in oklch, var(--warn) 26%, var(--border))'
                  : 'var(--border)'}`,
                borderRadius: 6,
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
                  display: 'grid', placeItems: 'center',
                  background: r.fired ? 'var(--warn)' : 'var(--surface-2)',
                  color: r.fired ? 'var(--bg)' : 'var(--fg-dim)',
                }}>
                  <Icon name={r.fired ? 'alert' : 'check'} className="v2-ic"
                        style={{ width: 10, height: 10, strokeWidth: 2.5 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{
                      fontSize: 12.5, fontWeight: r.fired ? 600 : 500,
                      color: r.fired ? 'var(--fg)' : 'var(--fg-muted)',
                    }}>{r.label}</span>
                    <span className="v2-mono v2-dim" style={{ marginLeft: 'auto', fontSize: 9.5 }}>
                      {r.id}
                    </span>
                  </div>
                  <div className="v2-dim v2-mono" style={{ fontSize: 10.5 }}>{r.detailText}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="v2-col-gap" style={{ gap: 14 }}>
          <Card title="Severity" sub="based on signal count, not any single threshold"
                attrappe={REFERENZ}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 14,
                background: `color-mix(in oklch, ${sevFarbe} 14%, var(--surface))`,
                border: `1px solid color-mix(in oklch, ${sevFarbe} 35%, var(--border))`,
                display: 'grid', placeItems: 'center',
              }}>
                <span className="v2-mono" style={{ fontSize: 26, fontWeight: 600, color: sevFarbe }}>
                  {ot.count}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 15, fontWeight: 600, color: sevFarbe,
                  textTransform: 'capitalize', marginBottom: 3,
                }}>{ot.severity}</div>
                <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.45 }}>
                  {ot.severity === 'normal' ? 'No action needed. Keep training as planned.'
                    : ot.severity === 'moderate' ? 'Warning. A deload is worth considering.'
                      : ot.severity === 'high' ? 'Deload week strongly recommended.'
                        : 'Mandatory break. See a doctor if this persists.'}
                </div>
              </div>
            </div>
            {([
              ['0–2 signals', 'Normal', 'var(--pos)'],
              ['3–4 signals', 'Moderate · warning + deload suggestion', 'var(--warn)'],
              ['5–6 signals', 'High · deload week urgently recommended', 'var(--neg)'],
              ['7–8 signals', 'Critical · mandatory break + doctor', 'var(--neg)'],
            ] as Array<[string, string, string]>).map(([r, l, c], i) => (
              <div key={r} style={{
                display: 'flex', alignItems: 'center', gap: 9, padding: '7px 0',
                borderBottom: i < 3 ? '1px solid var(--border)' : 'none',
                opacity: (i === 0 && ot.count <= 2)
                  || (i === 1 && ot.count >= 3 && ot.count <= 4)
                  || (i === 2 && ot.count >= 5 && ot.count <= 6)
                  || (i === 3 && ot.count >= 7) ? 1 : 0.42,
              }}>
                <span className="v2-mono" style={{ fontSize: 11, width: 76, color: c }}>{r}</span>
                <span style={{ fontSize: 11, flex: 1 }}>{l}</span>
              </div>
            ))}
          </Card>

          <Card title="Alert lifecycle" attrappe={REFERENZ}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              {['active', 'acknowledged', 'resolved'].map((s, i) => (
                <React.Fragment key={s}>
                  <div style={{
                    flex: 1, padding: '8px 6px', textAlign: 'center',
                    borderRadius: 5, fontSize: 10.5,
                    background: i === 0
                      ? 'color-mix(in oklch, var(--warn) 10%, var(--surface))'
                      : 'var(--surface)',
                    border: `1px solid ${i === 0
                      ? 'color-mix(in oklch, var(--warn) 30%, var(--border))'
                      : 'var(--border)'}`,
                    color: i === 0 ? 'var(--warn)' : 'var(--fg-muted)',
                  }}>{s}</div>
                  {/* `[cmd]` **Das Mockup nutzt `arr_r`** — den Namen
                      kennt die Icon-Liste nicht. `[read]` **Gleiche
                      Bedeutung, vorhandener Name.** */}
                  {i < 2 && (
                    <Icon name="arrow_right" className="v2-ic v2-ic-sm"
                          style={{ color: 'var(--fg-dim)' }} />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.55 }}>
              No new alert is raised while one is active. That keeps a bad week from
              generating seven separate warnings.
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

// ══ PROTOCOLS ══════════════════════════════════════════════════════
// [cmd] module-recovery-v2.jsx:825-898, eins zu eins.

/**
 * `protocols`, wie er im Mockup steht — `RecProtocols`, 3 Kacheln.
 *
 * `[cmd]` Aktives Protokoll mit Tagesbalken und Aufgabenliste, die
 * Bibliothek mit vier Vorlagen, die Ausloeserbedingungen.
 */
export function RecProtocolsReferenz() {
  const aktiv = RECOVERY_PROTOCOLS.find(p => p.id === ACTIVE_PROTOCOL.id)
  const ausloeser: Array<[string, string, string]> = [
    ['Active Recovery Week', 'Score 60-70 for 3+ days, no acute problem',
     'var(--acc-recov)'],
    ['Passive Deload', '5+ overtraining signals, or score below 55 for 3 days',
     'var(--warn)'],
    ['Sleep Optimization', 'Sleep score below 70 across 7 days',
     'var(--acc-coach)'],
    ['Injury Protocol', 'Acute injury logged in Medical, or soreness 3/3 for 5 days',
     'var(--neg)'],
  ]
  return (
    <>
      <ReferenzTrenner reiter="Protocols" />
      <div className="v2-grid" style={{ gridTemplateColumns: '1.3fr 1fr', gap: 14 }}>
        <div className="v2-col-gap" style={{ gap: 14 }}>
          <Card title={`Active · ${aktiv?.name ?? ''}`}
                sub={`day ${ACTIVE_PROTOCOL.day} of ${ACTIVE_PROTOCOL.of} · started ${ACTIVE_PROTOCOL.started}`}
                attrappe={REFERENZ}>
            <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
              {Array.from({ length: Number(aktiv?.days ?? 7) }).map((_, d) => (
                <div key={d} style={{
                  flex: 1, height: 8, borderRadius: 2,
                  background: d < ACTIVE_PROTOCOL.day
                    ? 'var(--acc-recov)' : 'var(--surface-2)',
                }} />
              ))}
            </div>
            <div className="v2-eyebrow" style={{ marginBottom: 6 }}>
              Today&apos;s tasks
            </div>
            <div className="v2-col-gap" style={{ gap: 5 }}>
              {(aktiv?.tasks ?? []).map(a => (
                <div key={a.t} style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: '9px 11px', borderRadius: 5,
                  background: a.done
                    ? 'color-mix(in oklch, var(--pos) 5%, var(--surface))'
                    : 'var(--surface)',
                  border: `1px solid ${a.done
                    ? 'color-mix(in oklch, var(--pos) 24%, var(--border))'
                    : 'var(--border)'}`,
                }}>
                  <span style={{
                    width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                    background: a.done ? 'var(--pos)' : 'var(--surface-2)',
                    border: '1px solid var(--border)',
                  }} />
                  <span style={{
                    fontSize: 12,
                    textDecoration: a.done ? 'line-through' : 'none',
                    color: a.done ? 'var(--fg-muted)' : 'var(--fg)',
                  }}>{a.t}</span>
                  {a.done && (
                    <Pill variant="pos" style={{ marginLeft: 'auto', fontSize: 9 }}>
                      done
                    </Pill>
                  )}
                </div>
              ))}
            </div>
            <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 10, lineHeight: 1.5 }}>
              Protocol tasks appear in your Today view the same way
              meal-plan ghost entries do — pre-filled, confirmable, skippable.
            </div>
          </Card>

          <Card title="Protocol library"
                sub={`${RECOVERY_PROTOCOLS.length} system templates`}
                attrappe={REFERENZ}>
            <div className="v2-col-gap" style={{ gap: 8 }}>
              {RECOVERY_PROTOCOLS.map(p => {
                const istAktiv = p.id === ACTIVE_PROTOCOL.id
                return (
                  <div key={p.id} style={{
                    padding: 12, borderRadius: 6,
                    background: istAktiv
                      ? 'color-mix(in oklch, var(--acc-recov) 6%, var(--surface))'
                      : 'var(--surface)',
                    border: `1px solid ${istAktiv
                      ? 'color-mix(in oklch, var(--acc-recov) 28%, var(--border))'
                      : 'var(--border)'}`,
                  }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                      {istAktiv && <Pill variant="acc">active</Pill>}
                      <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>
                        {p.days} days
                      </span>
                    </div>
                    <div className="v2-muted" style={{ fontSize: 11.5, marginBottom: 6 }}>
                      {p.goal}
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {p.activities.slice(0, 3).map(a => (
                        <Pill key={a} style={{ fontSize: 9.5 }}>{a}</Pill>
                      ))}
                      {p.activities.length > 3 && (
                        <Pill style={{ fontSize: 9.5 }}>
                          +{p.activities.length - 3}
                        </Pill>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        <Card title="When to run which" sub="trigger conditions"
              attrappe={REFERENZ}>
          <div className="v2-col-gap" style={{ gap: 8 }}>
            {ausloeser.map(([n, bed, farbe]) => (
              <div key={n} style={{
                padding: 11, background: 'var(--surface)',
                border: '1px solid var(--border)', borderRadius: 6,
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4,
                }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: 999, background: farbe,
                  }} />
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{n}</span>
                </div>
                <div className="v2-dim" style={{
                  fontSize: 10.5, lineHeight: 1.45, paddingLeft: 14,
                }}>{bed}</div>
              </div>
            ))}
          </div>
          <div className="v2-divider" />
          <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.55 }}>
            Buddy proposes a protocol when a trigger fires — it never
            activates one on its own. Activation is always your call.
          </div>
        </Card>
      </div>
    </>
  )
}



export function RecStressReferenz() {
  return (
    <>
      <ReferenzTrenner reiter="Stress" />
      <div className="v2-grid" style={{ gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        <div className="v2-col-gap" style={{ gap: 14 }}>
          <Card attrappe={REFERENZ}>
            <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 14 }}>
              <Ring value={STRESS_TODAY.score} max={100} color="var(--acc-recov)"
                    label="stress" size={112} stroke={8} />
              <div style={{ flex: 1 }}>
                <div className="v2-eyebrow" style={{ marginBottom: 5 }}>
                  Today · {STRESS_TODAY.band}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
                  Inside the working range
                </div>
                <div className="v2-muted" style={{ fontSize: 12, lineHeight: 1.55 }}>
                  Work pressure is the main contributor this week. It costs about
                  {' '}{Math.abs(STRESS_TODAY.hrvImpact)} ms of overnight HRV, which is
                  enough to notice but not enough to change the plan.
                </div>
              </div>
            </div>
            <div style={{
              position: 'relative', height: 26, borderRadius: 5,
              overflow: 'hidden', display: 'flex', border: '1px solid var(--border)',
            }}>
              {STRESS_BANDS.map((b, i) => {
                const von = i === 0 ? 0 : STRESS_BANDS[i - 1].to
                return (
                  <div key={b.label} style={{
                    flex: b.to - von, background: b.color, opacity: 0.4,
                    display: 'grid', placeItems: 'center', fontSize: 9.5,
                    fontFamily: 'var(--font-mono)', color: 'var(--bg)', fontWeight: 600,
                  }}>
                    {b.label.toUpperCase()}
                  </div>
                )
              })}
              <div style={{
                position: 'absolute', left: `${STRESS_TODAY.score}%`, top: -3,
                bottom: -3, width: 2, background: 'var(--fg)',
                boxShadow: '0 0 0 2px var(--bg)',
              }} />
            </div>
            <div className="v2-mono" style={{
              display: 'flex', justifyContent: 'space-between', marginTop: 6,
              fontSize: 9.5, color: 'var(--fg-dim)',
            }}>
              <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
            </div>
          </Card>

          <Card title="Contributors" sub="what the score is made of"
                attrappe={REFERENZ}>
            <div className="v2-col-gap" style={{ gap: 9 }}>
              {STRESS_SOURCES.map(s => (
                <div key={s.k} style={{
                  display: 'grid', gridTemplateColumns: '130px 1fr 40px',
                  gap: 10, alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: 12 }}>{s.k}</div>
                    <div className="v2-dim" style={{ fontSize: 10 }}>{s.note}</div>
                  </div>
                  <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 999 }}>
                    <div style={{
                      height: '100%', width: `${s.v}%`,
                      background: 'var(--acc-recov)', borderRadius: 999,
                    }} />
                  </div>
                  <span className="v2-mono" style={{ textAlign: 'right', fontSize: 11 }}>
                    {s.v}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
