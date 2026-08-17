'use client'

// Drei Tabs: „Muscle map", „HRV" und „Sleep".
//
// QUELLE: theme-v1/module-recovery-v2.jsx:378-443 (`RecMuscleMap`),
// :446-537 (`RecHRV`), :540-645 (`RecSleep`).
//
// `[read]` Die drei gehoeren zusammen, weil sie dasselbe zeigen: eine
// Messgroesse, ihre Herleitung und ihren Verlauf. Jede von ihnen legt
// die Rechnung offen — die Vorlage druckt die Formel als Text unter
// das Ergebnis. **Das ist uebernommen**, nicht als Zierrat: es ist der
// Beleg, dass die Zahl nicht geraten ist.
//
// GEAENDERT IST NUR DAS TECHNISCHE: TypeScript, `v2-`-Praefix,
// `color-mix(in srgb, …)` -> `in oklch`, Tabellen in `v2-tbl-wrap`.
//
// `[cmd]` ALLES IST ATTRAPPE.
import * as React from 'react'
import { Card, Pill, Icon, Ring, Meter, Row, LineChart } from '@lumeos/ui'

import {
  CHECKIN, MUSCLE_GROUPS_BODYMAP, MUSCLE_LABEL, MUSCLE_STATE, NUTRITION_INPUT,
  HRV_BASELINE, HRV_LOG, SLEEP_DATA,
  calcMuscleRecovery, calcHRVScore, calcSleepScore,
} from './motor'
import { Koerperkarte } from './koerperkarte'
import { useRecovery } from './kontext'
import { ATTRAPPE } from './ansicht'

// ═══ MUSCLE MAP ══════════════════════════════════════════════════
// [cmd] module-recovery-v2.jsx:378-443.
export function RecMuscleMap() {
  const { open } = useRecovery()

  const rows = React.useMemo(() => MUSCLE_GROUPS_BODYMAP.map(slug => {
    const st = MUSCLE_STATE[slug]
    if (!st) return { slug, value: null as number | null }
    const calc = calcMuscleRecovery({
      hours: st.hours, sets: st.sets, sleepQuality: CHECKIN.sleep_quality,
      proteinPct: NUTRITION_INPUT.proteinPct, caloriePct: NUTRITION_INPUT.caloriePct,
      soreness: st.soreness,
    })
    return { slug, ...st, ...calc }
  }).sort((a, b) => (a.value ?? 999) - (b.value ?? 999)), [])

  const values = Object.fromEntries(rows.map(r => [r.slug, r.value]))

  return (
    <div className="v2-rec-grid-1135">
      <Card title="Muscle recovery" sub="18 groups · click for the breakdown" attrappe={ATTRAPPE}>
        <Koerperkarte values={values} mode="recovery"
                      onPick={s => open({ typ: 'muscle', slug: s })} size={200} />
        <div className="v2-rec-legende">
          <span className="v2-row-gap"><span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--pos)', opacity: 0.68 }} />ready</span>
          <span className="v2-row-gap"><span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--warn)', opacity: 0.68 }} />recovering</span>
          <span className="v2-row-gap"><span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--neg)', opacity: 0.68 }} />not ready</span>
        </div>
        <div className="v2-divider" />
        <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Base recovery curve</div>
        <LineChart h={110} range={[0, 105]} xLabels={['0h', '12h', '24h', '48h', '72h', '96h']}
                   series={[{ data: [10, 30, 50, 75, 90, 100], color: 'var(--acc-recov)' }]} />
        <div className="v2-dim v2-mono" style={{ fontSize: 10, marginTop: 8, lineHeight: 1.7 }}>
          recovery = base(hours) × volume_mod × sleep_mod × nutrition_mod × soreness_mod
        </div>
      </Card>

      <Card title="Per-muscle detail" sub="sorted by readiness · lowest first" attrappe={ATTRAPPE}>
        <div className="v2-tbl-wrap">
          <table className="v2-tbl">
            <thead>
              <tr>
                <th>Muscle</th>
                <th style={{ width: 60, textAlign: 'right' }}>Hours</th>
                <th style={{ width: 50, textAlign: 'right' }}>Sets</th>
                <th style={{ width: 56, textAlign: 'right' }}>Sore</th>
                <th style={{ width: 130 }}>Recovery</th>
                <th style={{ width: 56, textAlign: 'right' }}>%</th>
                <th style={{ width: 24 }} />
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                if (r.value == null) return null
                const c = r.value >= 80 ? 'var(--pos)' : r.value >= 50 ? 'var(--warn)' : 'var(--neg)'
                return (
                  <tr key={r.slug} style={{ cursor: 'pointer' }}
                      onClick={() => open({ typ: 'muscle', slug: r.slug })}>
                    <td>
                      <div style={{ fontSize: 12 }}>{MUSCLE_LABEL[r.slug]}</div>
                      <div className="v2-dim v2-mono" style={{ fontSize: 9 }}>{'lastSession' in r ? r.lastSession : ''}</div>
                    </td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>{'hours' in r ? r.hours : ''}</td>
                    <td className="v2-num v2-muted" style={{ textAlign: 'right' }}>{'sets' in r ? r.sets : ''}</td>
                    <td className="v2-num" style={{
                      textAlign: 'right',
                      color: ('soreness' in r && r.soreness >= 2) ? 'var(--warn)' : 'var(--fg-muted)',
                    }}>{'soreness' in r ? `${r.soreness}/3` : ''}</td>
                    <td><Meter value={r.value} color={c} tall /></td>
                    <td className="v2-num" style={{ textAlign: 'right', color: c, fontWeight: 600 }}>{r.value}</td>
                    <td><Icon name="chevron_right" className="v2-ic v2-ic-sm" style={{ color: 'var(--fg-dim)' }} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ═══ HRV ═════════════════════════════════════════════════════════
// [cmd] module-recovery-v2.jsx:446-537.
export function RecHRV() {
  const { open } = useRecovery()
  const today = calcHRVScore(CHECKIN.hrv_rmssd)
  return (
    <div className="v2-grid-14">
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="HRV score" sub="z-score against your rolling 30-day baseline" attrappe={ATTRAPPE}>
          <div className="v2-rec-ring-zeile">
            <Ring value={today.score} max={100}
                  color={today.score >= 70 ? 'var(--pos)' : today.score >= 50 ? 'var(--warn)' : 'var(--neg)'}
                  label="hrv" size={112} stroke={8} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="v2-grid v2-g-cols-2" style={{ gap: 10 }}>
                {([
                  ['Today RMSSD', `${CHECKIN.hrv_rmssd} ms`],
                  ['Baseline', `${HRV_BASELINE.avg_rmssd} ms`],
                  ['Std deviation', `± ${HRV_BASELINE.stddev_rmssd}`],
                  ['Z-score', `${today.z > 0 ? '+' : ''}${today.z}`],
                ] as Array<[string, string]>).map(([l, v]) => (
                  <div key={l} style={{ padding: 9, background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 5 }}>
                    <div className="v2-eyebrow" style={{ marginBottom: 2 }}>{l}</div>
                    <div className="v2-num" style={{ fontSize: 15 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="v2-dim v2-mono v2-rec-formel">
            deviation = (rmssd − baseline) / stddev = ({CHECKIN.hrv_rmssd} − {HRV_BASELINE.avg_rmssd}) / {HRV_BASELINE.stddev_rmssd} = {today.z}<br />
            score = 70 + deviation × 15 = 70 + {today.z} × 15 = {today.score}<br />
            anchors: z +2 → 100 · z 0 → 70 · z −2 → 30 · z ≤ −3 → 0
          </div>
        </Card>

        <Card
          title="Measurement log"
          sub={`${HRV_LOG.length} readings · baseline from ${HRV_BASELINE.samples} of last ${HRV_BASELINE.window_days} days`}
          attrappe={ATTRAPPE}
          actions={
            <button type="button" className="v2-btn v2-btn-sm" onClick={() => open({ typ: 'hrvMeasure' })}>
              <Icon name="camera" className="v2-ic v2-ic-sm" />Measure now
            </button>
          }
        >
          <div className="v2-tbl-wrap">
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
                      <td className="v2-num v2-muted">{h.date.slice(5)}</td>
                      <td className="v2-num" style={{ textAlign: 'right' }}>
                        {h.rmssd} <span className="v2-dim" style={{ fontSize: 9 }}>ms</span>
                      </td>
                      <td className="v2-num" style={{ textAlign: 'right', color: s.z >= 0 ? 'var(--pos)' : 'var(--warn)' }}>
                        {s.z > 0 ? '+' : ''}{s.z}
                      </td>
                      <td className="v2-num" style={{ textAlign: 'right' }}>{s.score}</td>
                      <td><Pill style={{ fontSize: 9 }}>{h.method.replace(/_/g, ' ')}</Pill></td>
                      <td className="v2-num" style={{
                        textAlign: 'right',
                        color: h.quality >= 0.9 ? 'var(--pos)' : h.quality >= 0.8 ? 'var(--warn)' : 'var(--neg)',
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
        <Card title="Phone camera HRV" sub="no wearable required" attrappe={ATTRAPPE}>
          <div style={{
            padding: 14, background: 'color-mix(in oklch, var(--acc-recov) 6%, var(--surface))',
            border: '1px solid color-mix(in oklch, var(--acc-recov) 24%, var(--border))',
            borderRadius: 7, marginBottom: 12,
          }}>
            <div style={{ fontSize: 12.5, lineHeight: 1.6, color: 'var(--fg-muted)' }}>
              Index finger on the camera lens with the flash on. 60 seconds of PPG signal gives R-R intervals, which give RMSSD. Validated at r = 0.98 against a chest strap.
            </div>
          </div>
          <Row label="Duration" value="60 seconds" />
          <Row label="Accuracy vs. strap" value="r = 0.98" />
          <Row label="Limitations" value="motion, poor lighting" />
          <Row label="Best time" value="on waking, before standing" />
          <div style={{ marginTop: 12 }}>
            <button type="button" className="v2-btn v2-btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => open({ typ: 'hrvMeasure' })}>
              <Icon name="camera" className="v2-ic v2-ic-sm" />Start 60-second measurement
            </button>
          </div>
        </Card>

        <Card title="30-day trend" sub="RMSSD vs. baseline band" attrappe={ATTRAPPE}>
          <LineChart h={150} range={[44, 72]}
                     xLabels={['30d', '', '', '20d', '', '', '10d', '', 'today']}
                     series={[
                       { data: [52, 54, 53, 56, 55, 58, 57, 59, 58, 60, 59, 61, 58, 62, 64], color: 'var(--acc-recov)' },
                       { data: Array(15).fill(HRV_BASELINE.avg_rmssd), color: 'var(--fg-dim)' },
                       { data: Array(15).fill(HRV_BASELINE.avg_rmssd - HRV_BASELINE.stddev_rmssd), color: 'var(--surface-2)' },
                     ]} />
          <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 10.5, color: 'var(--fg-muted)', flexWrap: 'wrap' }}>
            <span className="v2-row-gap"><span className="v2-dot" style={{ background: 'var(--acc-recov)' }} />RMSSD</span>
            <span className="v2-row-gap"><span className="v2-dot" style={{ background: 'var(--fg-dim)' }} />baseline</span>
            <span className="v2-row-gap"><span className="v2-dot" style={{ background: 'var(--surface-2)' }} />−1 SD</span>
          </div>
        </Card>
      </div>
    </div>
  )
}

// ═══ SLEEP ═══════════════════════════════════════════════════════
// [cmd] module-recovery-v2.jsx:540-645.
export function RecSleep() {
  const w = calcSleepScore(SLEEP_DATA, CHECKIN)
  const s = calcSleepScore(null, CHECKIN)
  const d = SLEEP_DATA
  const pct = (m: number) => Math.round((m / d.total_sleep_minutes) * 100)

  return (
    <div className="v2-grid-14">
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="Last night" sub={`${d.bedtime} → ${d.wake} · source: ${d.source}`} attrappe={ATTRAPPE}>
          <div className="v2-rec-ring-zeile">
            <Ring value={w.score} max={100}
                  color={w.score >= 85 ? 'var(--pos)' : w.score >= 70 ? 'var(--acc-recov)' : 'var(--warn)'}
                  label="sleep" size={112} stroke={8} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="v2-num" style={{ fontSize: 26, lineHeight: 1, marginBottom: 4 }}>
                {Math.floor(d.total_sleep_minutes / 60)}:{String(d.total_sleep_minutes % 60).padStart(2, '0')}
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
                  <div key={l} className="v2-rec-phase">
                    <span>{l}</span>
                    <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 999 }}>
                      <div style={{ height: '100%', width: `${pct(m)}%`, background: c, borderRadius: 999 }} />
                    </div>
                    <span className="v2-num" style={{ textAlign: 'right' }}>{Math.floor(m / 60)}h {m % 60}m</span>
                    <span className="v2-num v2-dim" style={{ textAlign: 'right', fontSize: 10 }}>{pct(m)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="v2-divider" />
          <div className="v2-eyebrow" style={{ marginBottom: 8 }}>Score formula · wearable path</div>
          <div className="v2-dim v2-mono v2-rec-formel" style={{ lineHeight: 1.8 }}>
            efficiency {d.sleep_efficiency}% → {w.eff?.toFixed(2)} × 0.40 = {((w.eff ?? 0) * 0.4).toFixed(3)}<br />
            duration {d.total_sleep_minutes}/480 min → {w.dur?.toFixed(2)} × 0.40 = {((w.dur ?? 0) * 0.4).toFixed(3)}<br />
            deep {d.deep_sleep_minutes}/90 min → {w.deep?.toFixed(2)} × 0.20 = {((w.deep ?? 0) * 0.2).toFixed(3)}<br />
            <span style={{ color: 'var(--fg)' }}>total × 100 = {w.score}</span>
          </div>
        </Card>

        <Card title="14 nights" sub="duration + stage composition" attrappe={ATTRAPPE}>
          {/* [cmd] module-recovery-v2.jsx:587-603. Die Pseudodaten-Formel
              (Sinus/Kosinus je Index) bleibt — sie erzeugt genau diese
              Balken. */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(14, 1fr)', gap: 3, height: 96 }}>
            {Array.from({ length: 14 }).map((_, i) => {
              const dur = 6.2 + Math.sin(i * 1.1) * 0.9 + (i === 13 ? 0.4 : 0)
              const h = (dur / 9.5) * 100
              const deep = 0.17 + Math.sin(i * 0.7) * 0.03
              const rem = 0.21 + Math.cos(i * 0.5) * 0.03
              const awake = 0.05
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
                  <div style={{
                    width: '100%', height: `${h}%`, display: 'flex', flexDirection: 'column',
                    borderRadius: '2px 2px 0 0', overflow: 'hidden',
                  }} title={`${dur.toFixed(1)}h`}>
                    <div style={{ flex: awake, background: 'var(--neg)', opacity: 0.7 }} />
                    <div style={{ flex: rem, background: 'var(--acc-buddy)', opacity: 0.8 }} />
                    <div style={{ flex: 1 - deep - rem - awake, background: 'var(--acc-recov)', opacity: 0.75 }} />
                    <div style={{ flex: deep, background: 'var(--acc-coach)', opacity: 0.9 }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 9.5, color: 'var(--fg-dim)', fontFamily: 'var(--font-mono)' }}>
            <span>14 nights ago</span><span>last night</span>
          </div>
        </Card>
      </div>

      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="Score paths" sub="wearable vs. subjective" attrappe={ATTRAPPE}>
          <div className="v2-col-gap" style={{ gap: 8 }}>
            <div style={{
              padding: 11, background: 'color-mix(in oklch, var(--pos) 6%, var(--surface))',
              border: '1px solid color-mix(in oklch, var(--pos) 26%, var(--border))', borderRadius: 6,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Wearable path</span>
                <Pill variant="pos" style={{ marginLeft: 'auto' }}>active</Pill>
              </div>
              <div className="v2-num" style={{ fontSize: 20, color: 'var(--pos)' }}>{w.score}</div>
              <div className="v2-dim v2-mono" style={{ fontSize: 10, marginTop: 3 }}>efficiency 0.4 + duration 0.4 + deep 0.2</div>
            </div>
            <div style={{ padding: 11, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Subjective fallback</div>
              <div className="v2-num" style={{ fontSize: 20, color: 'var(--fg-muted)' }}>{s.score}</div>
              <div className="v2-dim v2-mono" style={{ fontSize: 10, marginTop: 3 }}>quality 0.6 + duration 0.4</div>
            </div>
          </div>
          <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 10, lineHeight: 1.5 }}>
            The subjective path is what most users get. It never blocks a score — the engine degrades gracefully rather than refusing to compute.
          </div>
        </Card>

        <Card title="Sleep hygiene inputs" sub="from check-in" attrappe={ATTRAPPE}>
          <Row label="Caffeine today" value={`${CHECKIN.caffeine_mg} mg`} />
          <Row label="Alcohol" value={`${CHECKIN.alcohol_units} units`} />
          <Row label="Screen before bed" value={`${CHECKIN.screen_time_before_bed} min`} />
          <Row label="Stress level" value={`${CHECKIN.stress_level}/10`} />
          <div className="v2-divider" />
          <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.5 }}>
            Caffeine at 280 mg with a 17:30 pre-workout dose sits close to the edge — bedtime has drifted 22 min later across the last 14 days.
          </div>
        </Card>
      </div>
    </div>
  )
}
