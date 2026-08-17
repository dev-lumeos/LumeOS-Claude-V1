'use client'

// Der Tab „Compliance" — vollstaendig, mit allen drei Unterkomponenten.
//
// QUELLE: theme-v1/module-supplements.jsx — `SuppCompliance` (710),
// `ComplianceHeatmap` (791), `ComplianceStrip` (838); dazu
// `CalendarView` aus `module-supplements-modals.jsx` (372).
//
// `[cmd]` G-29 hatte die drei weggelassen und den Kalender sowie die
// Heatmap durch eigene Rechtecke ersetzt. Die Tabelle „Compliance ·
// key supplements" mit acht Zeilen fehlte ganz.
//
// `[cmd]` `CalendarView` steht in der MODALDATEI, wird aber vom Rahmen
// aufgerufen. Wer nur `module-supplements.jsx` liest, haelt sie fuer
// undefiniert — mein erstes Abgleichskript tat genau das.
import * as React from 'react'
import { Card, Icon, InEntwicklungKnopf } from '@lumeos/ui'

import { STACK } from './daten'

const ATTRAPPE = 'Aus dem Entwurf uebernommen. Es gibt kein `supplements`-Schema — die Zahlen sind erfunden.'

/** Die acht Zeilen der Vorlage (module-supplements.jsx:760-768). */
const COMPLIANCE = [
  { id: 'creatine', taken: 30, planned: 30, lastSkip: '—', rate: 100 },
  { id: 'd3k2', taken: 30, planned: 30, lastSkip: '—', rate: 100 },
  { id: 'omega3', taken: 28, planned: 30, lastSkip: 'May 11 · ran out (re-ordered)', rate: 93 },
  { id: 'whey', taken: 16, planned: 18, lastSkip: 'May 9 · cheat-day, skipped', rate: 89 },
  { id: 'betaala', taken: 14, planned: 16, lastSkip: 'May 5 · pre-workout meal skipped', rate: 88 },
  { id: 'caffeine', taken: 14, planned: 16, lastSkip: 'May 5 · late workout, no caffeine after 17:00', rate: 88 },
  { id: 'magnesium', taken: 30, planned: 30, lastSkip: '—', rate: 100 },
  { id: 'ashwagandha', taken: 27, planned: 30, lastSkip: 'May 12–14 · cycle-off interpretation error', rate: 90 },
]

export function SuppCompliance() {
  const [view, setView] = React.useState<'heatmap' | 'calendar'>('heatmap')
  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex', background: 'var(--surface)',
          border: '1px solid var(--border)', borderRadius: 6, padding: 2,
        }}>
          {([['heatmap', 'Heatmap · 90d'], ['calendar', 'Calendar · month']] as const).map(([k, l]) => (
            <button key={k} type="button"
                    className={view === k ? 'v2-btn v2-btn-primary' : 'v2-btn v2-btn-ghost'}
                    style={{ height: 26, fontSize: 11, padding: '0 12px', borderRadius: 4 }}
                    onClick={() => setView(k)}>{l}</button>
          ))}
        </div>
      </div>

      {view === 'calendar' && <CalendarView />}

      {view === 'heatmap' && (
        <div className="v2-grid-14">
          <Card title="Compliance heatmap" sub="last 90 days · all supplements" attrappe={ATTRAPPE}>
            <ComplianceHeatmap />
            <div style={{ display: 'flex', gap: 16, marginTop: 14, fontSize: 11, color: 'var(--fg-muted)', flexWrap: 'wrap' }}>
              <div className="v2-row-gap"><span className="v2-dot" style={{ background: 'var(--pos)' }} />100%</div>
              <div className="v2-row-gap"><span className="v2-dot" style={{ background: 'color-mix(in oklch, var(--pos) 60%, var(--surface-2))' }} />80–99%</div>
              <div className="v2-row-gap"><span className="v2-dot" style={{ background: 'var(--warn)' }} />50–79%</div>
              <div className="v2-row-gap"><span className="v2-dot" style={{ background: 'var(--surface-2)' }} />below / off</div>
            </div>
          </Card>

          <Card title="Streaks · per supplement" sub="current" attrappe={ATTRAPPE}>
            <div className="v2-col-gap">
              {STACK.slice().sort((a, b) => b.streakDays - a.streakDays).map(s => (
                <div key={s.id} className="v2-row">
                  <span className="v2-row-l">
                    <span className="v2-dot" style={{
                      background: s.streakDays > 200 ? 'var(--pos)'
                        : s.streakDays > 60 ? 'var(--acc-suppl)' : 'var(--warn)',
                    }} />
                    <span style={{ fontSize: 12 }}>{s.name}</span>
                  </span>
                  <span className="v2-row-r">{s.streakDays} <span className="v2-dim" style={{ fontSize: 10 }}>days</span></span>
                </div>
              ))}
            </div>
          </Card>

          {/* [cmd] `gridColumn: "span 2"` in der Vorlage (Zeile 745). */}
          <Card title="Compliance · key supplements" sub="30 days"
                attrappe={ATTRAPPE} className="v2-span-2">
            <div className="v2-supp-tbl-wrap">
              <table className="v2-tbl">
                <thead>
                  <tr>
                    <th>Supplement</th>
                    <th style={{ width: 80 }}>Taken</th>
                    <th style={{ width: 80 }}>Planned</th>
                    <th style={{ width: 90, textAlign: 'right' }}>Rate</th>
                    <th style={{ width: 280 }}>Last 30d</th>
                    <th>Last skip · reason</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPLIANCE.map(c => {
                    const s = STACK.find(x => x.id === c.id)
                    return (
                      <tr key={c.id}>
                        <td style={{ fontSize: 12 }}>{s?.name ?? c.id}</td>
                        <td className="v2-num">{c.taken}</td>
                        <td className="v2-num v2-muted">{c.planned}</td>
                        <td className="v2-num" style={{
                          textAlign: 'right',
                          color: c.rate === 100 ? 'var(--pos)' : c.rate >= 90 ? 'var(--fg)' : 'var(--warn)',
                        }}>{c.rate}%</td>
                        <td><ComplianceStrip rate={c.rate} /></td>
                        <td className="v2-muted" style={{ fontSize: 11 }}>{c.lastSkip}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}

// ── Heatmap ────────────────────────────────────────────────────
/**
 * 13 Wochen × 7 Tage im Stil der Beitragsgrafik.
 *
 * `[cmd]` Der Zufallsgeber der Vorlage ist ein linearer Kongruenz-
 * generator mit festem Startwert — dasselbe Bild bei jedem Laden.
 * Uebernommen, nicht durch `Math.random()` ersetzt.
 */
function ComplianceHeatmap() {
  const weeks = 13
  const days = 7
  let seed = 1
  const cells: number[][] = []
  for (let w = 0; w < weeks; w++) {
    const col: number[] = []
    for (let d = 0; d < days; d++) {
      seed = (seed * 9301 + 49297) % 233280
      const r = seed / 233280
      col.push(r > 0.06 ? (r > 0.18 ? 1 : 0.6) : 0.2)
    }
    cells.push(col)
  }
  const monthLabels = ['Feb', '', '', 'Mar', '', '', '', 'Apr', '', '', '', 'May', '']

  return (
    <div className="v2-supp-heat">
      <div className="v2-supp-heat-tage">
        <span>M</span><span>W</span><span>F</span><span>S</span>
      </div>
      <div>
        <div className="v2-supp-heat-monate">
          {monthLabels.map((m, i) => <span key={i} style={{ textAlign: 'left' }}>{m}</span>)}
        </div>
        <div className="v2-supp-heat-gitter">
          {cells.map((col, ci) => (
            <div key={ci} style={{ display: 'grid', gridTemplateRows: `repeat(${days}, 1fr)`, gap: 3 }}>
              {col.map((v, di) => (
                <div key={di} style={{
                  aspectRatio: '1',
                  background: v === 1 ? 'var(--pos)'
                    : v === 0.6 ? 'color-mix(in oklch, var(--pos) 50%, var(--surface-2))'
                      : v === 0.2 ? 'var(--warn)' : 'var(--surface-2)',
                  opacity: v === 1 ? 0.55 + ((ci * 7 + di) % 40) / 100 : 0.7,
                  borderRadius: 2.5,
                }} title={`Week ${ci + 1}, day ${di + 1}`} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Streifen je Praeparat ──────────────────────────────────────
function ComplianceStrip({ rate }: { rate: number }) {
  const seed = rate * 31
  return (
    <div style={{ display: 'flex', gap: 1.5 }}>
      {Array.from({ length: 30 }).map((_, i) => {
        const r = ((seed + i * 17) % 100) / 100
        const taken = r < rate / 100
        return (
          <div key={i} style={{
            flex: 1, height: 14,
            background: taken ? 'var(--pos)' : 'var(--surface-2)',
            opacity: taken ? 0.5 + (i / 60) : 1,
            borderRadius: 1.5,
          }} />
        )
      })}
    </div>
  )
}

// ── Monatskalender ─────────────────────────────────────────────
/**
 * `[cmd]` Die Vorlage rechnet mit `new Date(2026, 4, 1)` — festes
 * Datum, kein `Date.now()`. Der Kalender zeigt immer Mai 2026 mit dem
 * 16. als „heute". Uebernommen.
 */
function CalendarView() {
  const month = 4
  const year = 2026
  const today = 16
  const ersterTag = new Date(year, month, 1).getDay() === 0 ? 6 : new Date(year, month, 1).getDay() - 1
  const tageImMonat = new Date(year, month + 1, 0).getDate()

  type Tag = { day: number; status: 'past' | 'today' | 'future'; taken: number; planned: number }
  const dayData: Tag[] = []
  let seed = 11
  for (let d = 1; d <= tageImMonat; d++) {
    seed = (seed * 9301 + 49297) % 233280
    const r = seed / 233280
    if (d > today) {
      dayData.push({ day: d, status: 'future', taken: 0, planned: 0 })
    } else if (d === today) {
      dayData.push({ day: d, status: 'today', taken: 3, planned: 8 })
    } else {
      seed = (seed * 9301 + 49297) % 233280
      const r2 = seed / 233280
      const planned = 7 + Math.floor(r2 * 3)
      const taken = r > 0.08 ? planned - Math.floor(r2 * 2) : Math.floor(planned * 0.5)
      dayData.push({ day: d, status: 'past', taken, planned })
    }
  }
  const cells: Array<Tag | null> = Array<Tag | null>(ersterTag).fill(null).concat(dayData)
  while (cells.length % 7 !== 0) cells.push(null)

  const perfekt = dayData.filter(d => d.status === 'past' && d.taken === d.planned).length
  const mitLuecken = dayData.filter(d => d.status === 'past' && d.taken < d.planned).length

  return (
    <Card
      title="Compliance · May 2026"
      sub={`${perfekt} perfect days · ${mitLuecken} with skips`}
      attrappe={ATTRAPPE}
      actions={
        <>
          <InEntwicklungKnopf titel="Vorheriger Monat" className="v2-btn v2-btn-ghost v2-btn-sm">
            <Icon name="chevron_left" className="v2-ic v2-ic-sm" />
          </InEntwicklungKnopf>
          <InEntwicklungKnopf titel="Monat waehlen" className="v2-btn v2-btn-ghost v2-btn-sm">
            May 2026
          </InEntwicklungKnopf>
          <InEntwicklungKnopf titel="Naechster Monat" className="v2-btn v2-btn-ghost v2-btn-sm">
            <Icon name="chevron_right" className="v2-ic v2-ic-sm" />
          </InEntwicklungKnopf>
        </>
      }
    >
      <div className="v2-supp-kalender" style={{ marginBottom: 6 }}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <div key={d} style={{
            textAlign: 'center', fontSize: 10, color: 'var(--fg-dim)',
            fontFamily: 'var(--font-mono)', padding: 6,
          }}>{d}</div>
        ))}
      </div>
      <div className="v2-supp-kalender">
        {cells.map((c, i) => {
          if (!c) return <div key={i} style={{ aspectRatio: '1.2', background: 'transparent' }} />
          const pct = c.planned > 0 ? c.taken / c.planned : 0
          const isToday = c.status === 'today'
          const isFuture = c.status === 'future'
          return (
            <div key={i} style={{
              aspectRatio: '1.2',
              background: isFuture ? 'var(--surface)'
                : isToday ? 'color-mix(in oklch, var(--acc-suppl) 8%, var(--surface))'
                  : pct === 1 ? 'color-mix(in oklch, var(--pos) 8%, var(--surface))'
                    : pct >= 0.8 ? 'color-mix(in oklch, var(--pos) 4%, var(--surface))'
                      : pct >= 0.5 ? 'color-mix(in oklch, var(--warn) 6%, var(--surface))'
                        : 'color-mix(in oklch, var(--neg) 6%, var(--surface))',
              border: isToday ? '1px solid var(--acc-suppl)' : '1px solid var(--border)',
              borderRadius: 5, padding: 6,
              display: 'flex', flexDirection: 'column',
              cursor: isFuture ? 'default' : 'pointer',
              opacity: isFuture ? 0.55 : 1,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span className="v2-num" style={{
                  fontSize: 11, fontWeight: isToday ? 600 : 500,
                  color: isToday ? 'var(--acc-suppl)' : isFuture ? 'var(--fg-dim)' : 'var(--fg)',
                }}>{c.day}</span>
                {!isFuture && c.planned > 0 && (
                  <span className="v2-num" style={{
                    fontSize: 9,
                    color: pct === 1 ? 'var(--pos)' : pct >= 0.8 ? 'var(--fg-muted)'
                      : pct >= 0.5 ? 'var(--warn)' : 'var(--neg)',
                  }}>{c.taken}/{c.planned}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
