'use client'

// Zwei Tabs des Training-Moduls: Offline sync und HR zones.
//
// QUELLE: theme-v1/module-training-offline-hr.jsx (285 Zeilen). Auch
// diese Datei ist eine Fortsetzung, keine zweite Fassung: sie definiert
// `window.TrainingOfflineView` (Tab 10) und `window.TrainingHRAnalysis`
// (Tab 9), die `module-training.jsx` in genau diesen Tabs anzeigt.
//
// GEAENDERT IST NUR DAS TECHNISCHE: TypeScript, `v2-`-Praefix,
// `color-mix(in srgb, …)` -> `in oklch`, `setTimeout` mit Aufraeumen.
//
// `[cmd]` ALLES IST ATTRAPPE. Die „IndexedDB" ist eine Tabelle mit
// erfundenen Zahlen — es gibt keinen Offline-Speicher; der Knopf
// „Flush outbox" leert ein `useState`, sonst nichts. Genau so steht es
// in der Vorlage.
import * as React from 'react'
import { Card, Pill, Icon, Row, LineChart } from '@lumeos/ui'

import { ATTRAPPE } from './ansicht'

// [cmd] module-training-offline-hr.jsx:3-9.
const IDB_STORES = [
  { name: 'sessions', rows: 142, size: '1.8 MB', desc: 'Completed workout sessions with all sets' },
  { name: 'sets', rows: 4820, size: '6.2 MB', desc: 'Individual set records, indexed by session_id + exercise_id' },
  { name: 'exercises', rows: 1850, size: '12.4 MB', desc: 'Full exercise library cached for offline search' },
  { name: 'routines', rows: 8, size: '180 KB', desc: "User's own routines plus assigned coach plans" },
  { name: 'outbox', rows: 4, size: '12 KB', desc: 'Pending writes waiting for connectivity' },
]

// [cmd] module-training-offline-hr.jsx:11-16.
export const OUTBOX = [
  { id: 'op-4821', op: 'PUT', store: 'sets', payload: 'set_id=s_9821 · Bench Press · 117.5kg × 5 · RPE 8', queued: '2 min ago', tries: 0, status: 'pending' },
  { id: 'op-4822', op: 'PUT', store: 'sets', payload: 'set_id=s_9822 · Bench Press · 117.5kg × 5 · RPE 8.5', queued: '1 min ago', tries: 0, status: 'pending' },
  { id: 'op-4823', op: 'PATCH', store: 'sessions', payload: 'session_id=w_412 · duration=+320s', queued: '1 min ago', tries: 0, status: 'pending' },
  { id: 'op-4819', op: 'POST', store: 'sessions', payload: 'session_id=w_411 · Pull B completed', queued: '18 min ago', tries: 2, status: 'retrying' },
]

// [cmd] module-training-offline-hr.jsx:18-25.
export const SYNC_LOG = [
  { at: '14:22:08', ev: 'connection lost', detail: 'navigator.onLine → false · switching to local writes', kind: 'warn' },
  { at: '14:20:41', ev: 'flush complete', detail: '6 operations pushed · 0 conflicts · 412 ms', kind: 'ok' },
  { at: '14:20:40', ev: 'connection restored', detail: 'navigator.onLine → true · draining outbox', kind: 'ok' },
  { at: '14:04:12', ev: 'conflict resolved', detail: 'session w_409 · server timestamp newer · kept local set data, took server duration', kind: 'warn' },
  { at: '13:58:03', ev: 'connection lost', detail: 'navigator.onLine → false', kind: 'warn' },
  { at: '09:14:22', ev: 'cache refreshed', detail: 'exercises store · 1,850 rows · 12.4 MB', kind: 'ok' },
]

/** [cmd] module-training-offline-hr.jsx:27-156. */
export function TrainingOfflineView() {
  const [online, setOnline] = React.useState(false)
  const [flushing, setFlushing] = React.useState(false)
  const [queue, setQueue] = React.useState(OUTBOX)

  // Gegenueber der Vorlage: der Timer wird aufgeraeumt. Ohne das setzt
  // er den Zustand einer Komponente, die es nicht mehr gibt, wenn man
  // waehrend der 1,4 s den Tab wechselt.
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  React.useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  const flush = () => {
    setFlushing(true)
    timer.current = setTimeout(() => {
      setQueue([])
      setFlushing(false)
      setOnline(true)
    }, 1400)
  }

  const totalSize = '20.6 MB'
  return (
    <div className="v2-grid-14">
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card attrappe={ATTRAPPE}>
          <div className="v2-train-offline-kopf">
            <div style={{
              width: 42, height: 42, borderRadius: 10, flexShrink: 0,
              background: online ? 'color-mix(in oklch, var(--pos) 15%, transparent)' : 'color-mix(in oklch, var(--warn) 15%, transparent)',
              border: `1px solid color-mix(in oklch, ${online ? 'var(--pos)' : 'var(--warn)'} 32%, var(--border))`,
              color: online ? 'var(--pos)' : 'var(--warn)',
              display: 'grid', placeItems: 'center',
            }}>
              <Icon name={online ? 'check' : 'wifi_off'} className="v2-ic" style={{ width: 19, height: 19 }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14.5, fontWeight: 600 }}>{online ? 'Online · synced' : 'Offline · writing locally'}</span>
                {queue.length > 0 && <Pill variant="warn">{queue.length} queued</Pill>}
              </div>
              <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.45 }}>
                {online
                  ? 'All local writes have been pushed. IndexedDB stays warm as the read cache.'
                  : 'Sets are written to IndexedDB immediately. Nothing is lost — the outbox drains as soon as connectivity returns.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button type="button" className="v2-btn v2-btn-sm" onClick={() => setOnline(o => !o)}>
                {online ? 'Simulate offline' : 'Simulate online'}
              </button>
              {!online && queue.length > 0 && (
                <button type="button" className="v2-btn v2-btn-primary v2-btn-sm" onClick={flush} disabled={flushing}>
                  {flushing ? 'Flushing…' : 'Flush outbox'}
                </button>
              )}
            </div>
          </div>
        </Card>

        <Card title="Outbox"
              sub={queue.length ? `${queue.length} operations pending` : 'empty · all writes acknowledged'}
              attrappe={ATTRAPPE}>
          {queue.length === 0 ? (
            <div style={{ padding: '26px 16px', textAlign: 'center' }}>
              <Icon name="check" className="v2-ic" style={{ width: 24, height: 24, color: 'var(--pos)', marginBottom: 8 }} />
              <div style={{ fontSize: 12.5, fontWeight: 500, marginBottom: 3 }}>Outbox drained</div>
              <div className="v2-dim" style={{ fontSize: 11 }}>4 operations pushed · 0 conflicts</div>
            </div>
          ) : (
            <div className="v2-tbl-wrap">
              <table className="v2-tbl">
                <thead>
                  <tr>
                    <th style={{ width: 90 }}>Op ID</th>
                    <th style={{ width: 60 }}>Verb</th>
                    <th style={{ width: 90 }}>Store</th>
                    <th>Payload</th>
                    <th style={{ width: 90 }}>Queued</th>
                    <th style={{ width: 90 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map(o => (
                    <tr key={o.id}>
                      <td className="v2-mono v2-dim" style={{ fontSize: 10.5 }}>{o.id}</td>
                      <td><Pill style={{ fontSize: 9.5 }}>{o.op}</Pill></td>
                      <td className="v2-mono" style={{ fontSize: 11 }}>{o.store}</td>
                      <td className="v2-muted v2-mono" style={{ fontSize: 10.5 }}>{o.payload}</td>
                      <td className="v2-num v2-muted" style={{ fontSize: 10.5 }}>{o.queued}</td>
                      <td>{o.status === 'retrying' ? <Pill variant="warn">retry {o.tries}/5</Pill> : <Pill>pending</Pill>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Sync log" sub="last 6 events" attrappe={ATTRAPPE}>
          <div className="v2-col-gap" style={{ gap: 0 }}>
            {SYNC_LOG.map((l, i) => (
              <div key={l.at} style={{ display: 'flex', gap: 10, padding: '9px 0', borderBottom: i < SYNC_LOG.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span className="v2-num v2-dim" style={{ fontSize: 10.5, width: 62, flexShrink: 0 }}>{l.at}</span>
                <span style={{ width: 6, height: 6, borderRadius: 999, marginTop: 5, flexShrink: 0, background: l.kind === 'ok' ? 'var(--pos)' : 'var(--warn)' }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 500 }}>{l.ev}</div>
                  <div className="v2-dim v2-mono" style={{ fontSize: 10.5, lineHeight: 1.4 }}>{l.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="IndexedDB" sub={`lumeos_training · v4 · ${totalSize}`} attrappe={ATTRAPPE}>
          <div className="v2-tbl-wrap">
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th>Store</th>
                  <th style={{ width: 70, textAlign: 'right' }}>Rows</th>
                  <th style={{ width: 70, textAlign: 'right' }}>Size</th>
                </tr>
              </thead>
              <tbody>
                {IDB_STORES.map(s => (
                  <tr key={s.name}>
                    <td>
                      <div className="v2-mono" style={{ fontSize: 11.5, fontWeight: 500 }}>{s.name}</div>
                      <div className="v2-dim" style={{ fontSize: 10, lineHeight: 1.35, marginTop: 2 }}>{s.desc}</div>
                    </td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>{s.rows.toLocaleString('en-US')}</td>
                    <td className="v2-num v2-muted" style={{ textAlign: 'right' }}>{s.size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="v2-divider" />
          <Row label="Storage quota used" value="20.6 MB of 2 GB" />
          <Row label="Eviction policy" value="persistent · granted" />
          <Row label="Last cache refresh" value="today 09:14" />
        </Card>

        <Card title="Conflict resolution" sub="last-write-wins with field-level merge" attrappe={ATTRAPPE}>
          <div className="v2-col-gap" style={{ gap: 8, fontSize: 11.5, color: 'var(--fg-muted)', lineHeight: 1.5 }}>
            {([
              ['Set data', 'Local always wins. The phone was there, the server was not.'],
              ['Session duration', 'Server wins if newer — it may have received a later close event.'],
              ['Routine edits', 'Coach changes win over local reordering.'],
              ['Deletions', 'Tombstones sync both ways, never resurrect.'],
            ] as Array<[string, string]>).map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg)', marginBottom: 2 }}>{k}</div>
                <div>{v}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

// ── HR zone analysis ────────────────────────────────────────────
// [cmd] module-training-offline-hr.jsx:159-179.
export const HR_MAX = 193
export const HR_ZONES = [
  { z: 1, name: 'Recovery', lo: 0.50, hi: 0.60, color: 'var(--fg-dim)', min: 6, desc: 'Warm-up, between-set rest' },
  { z: 2, name: 'Aerobic', lo: 0.60, hi: 0.70, color: 'var(--acc-recov)', min: 18, desc: 'Base endurance, active recovery' },
  { z: 3, name: 'Tempo', lo: 0.70, hi: 0.80, color: 'var(--acc-mkt)', min: 24, desc: 'Sustained effort, most of a lifting session' },
  { z: 4, name: 'Threshold', lo: 0.80, hi: 0.90, color: 'var(--warn)', min: 21, desc: 'Hard sets, short rest, conditioning finishers' },
  { z: 5, name: 'Maximum', lo: 0.90, hi: 1.00, color: 'var(--neg)', min: 5, desc: 'All-out effort, near failure' },
]

export const HR_SETS = [
  { set: 'Bench 1', peak: 148, avg: 132, drop60: 32, zone: 4 },
  { set: 'Bench 2', peak: 154, avg: 138, drop60: 28, zone: 4 },
  { set: 'Bench 3', peak: 158, avg: 141, drop60: 24, zone: 4 },
  { set: 'Bench 4', peak: 162, avg: 145, drop60: 19, zone: 5 },
  { set: 'Bench 5', peak: 168, avg: 149, drop60: 16, zone: 5 },
  { set: 'Incline 1', peak: 152, avg: 136, drop60: 26, zone: 4 },
  { set: 'Incline 2', peak: 156, avg: 139, drop60: 23, zone: 4 },
  { set: 'Cable fly 1', peak: 141, avg: 128, drop60: 31, zone: 3 },
  { set: 'Cable fly 2', peak: 144, avg: 130, drop60: 29, zone: 4 },
]

/** [cmd] module-training-offline-hr.jsx:181-284. */
export function TrainingHRAnalysis() {
  const total = HR_ZONES.reduce((s, z) => s + z.min, 0)
  const avgHR = Math.round(HR_SETS.reduce((s, x) => s + x.avg, 0) / HR_SETS.length)
  const peakHR = Math.max(...HR_SETS.map(x => x.peak))
  const avgDrop = Math.round(HR_SETS.reduce((s, x) => s + x.drop60, 0) / HR_SETS.length)

  return (
    <div>
      <div className="v2-grid v2-g-cols-4" style={{ gap: 10, marginBottom: 14 }}>
        {([
          ['Session duration', `${total} min`, 'Push B · 16 May'],
          ['Average HR', `${avgHR} bpm`, `${Math.round(avgHR / HR_MAX * 100)}% of max`],
          ['Peak HR', `${peakHR} bpm`, `${Math.round(peakHR / HR_MAX * 100)}% · set 5`],
          ['60s recovery', `−${avgDrop} bpm`, avgDrop >= 25 ? 'good autonomic recovery' : 'declining across session'],
        ] as Array<[string, string, string]>).map(([l, v, s]) => (
          // Marke ohne Begruendungstext — wie bei den Landmarks-Kacheln:
          // der Satz waere laenger als die Kachel selbst.
          <Card key={l} className="v2-card-tight" style={{ padding: 13 }} attrappe>
            <div className="v2-eyebrow" style={{ marginBottom: 4 }}>{l}</div>
            <div className="v2-num" style={{ fontSize: 19, fontWeight: 500, marginBottom: 3 }}>{v}</div>
            <div className="v2-dim" style={{ fontSize: 10.5 }}>{s}</div>
          </Card>
        ))}
      </div>

      <div className="v2-grid-14">
        <Card title="Time in zone" sub={`${total} minutes total · Polar H10`} attrappe={ATTRAPPE}>
          <div style={{ display: 'flex', height: 30, borderRadius: 7, overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 14 }}>
            {HR_ZONES.map(z => (
              <div key={z.z} title={`Z${z.z} ${z.name} · ${z.min} min`} style={{
                flex: z.min, background: z.color, opacity: 0.6,
                display: 'grid', placeItems: 'center',
                fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--fg)',
                borderRight: z.z < 5 ? '1px solid var(--bg)' : 'none',
              }}>{z.min > 8 ? `Z${z.z}` : ''}</div>
            ))}
          </div>
          <div className="v2-col-gap" style={{ gap: 9 }}>
            {HR_ZONES.map(z => (
              <div key={z.z} className="v2-train-hr-row">
                <span style={{ width: 18, height: 18, borderRadius: 5, background: z.color, opacity: 0.65, display: 'grid', placeItems: 'center', fontSize: 9.5, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--fg)' }}>{z.z}</span>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 500 }}>{z.name}</div>
                  <div className="v2-dim v2-mono" style={{ fontSize: 9.5 }}>{Math.round(z.lo * HR_MAX)}–{Math.round(z.hi * HR_MAX)} bpm</div>
                </div>
                <div style={{ height: 5, background: 'var(--surface-2)', borderRadius: 999 }}>
                  <div style={{ height: '100%', width: `${(z.min / total) * 100}%`, background: z.color, borderRadius: 999 }} />
                </div>
                <span className="v2-num" style={{ textAlign: 'right', fontSize: 11.5 }}>{z.min} min</span>
                <span className="v2-num v2-dim" style={{ textAlign: 'right', fontSize: 10.5 }}>{Math.round(z.min / total * 100)}%</span>
              </div>
            ))}
          </div>
          <div className="v2-divider" />
          <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
            Z3 and Z4 carry the session, which is what a hypertrophy push day should look like. The five minutes in Z5 came from the last two bench sets — sustainable at this frequency, worth watching if it becomes every session.
          </div>
        </Card>

        <Card title="Per-set response" sub="peak, average, and 60-second recovery" attrappe={ATTRAPPE}>
          <div className="v2-tbl-wrap">
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th>Set</th>
                  <th style={{ width: 58, textAlign: 'right' }}>Peak</th>
                  <th style={{ width: 58, textAlign: 'right' }}>Avg</th>
                  <th style={{ width: 74, textAlign: 'right' }}>60s drop</th>
                  <th style={{ width: 40 }}>Zone</th>
                </tr>
              </thead>
              <tbody>
                {HR_SETS.map(s => {
                  const z = HR_ZONES.find(x => x.z === s.zone)
                  const fading = s.drop60 < 20
                  return (
                    <tr key={s.set}>
                      <td style={{ fontSize: 11.5 }}>{s.set}</td>
                      <td className="v2-num" style={{ textAlign: 'right', color: s.peak > 160 ? 'var(--warn)' : 'var(--fg)' }}>{s.peak}</td>
                      <td className="v2-num v2-muted" style={{ textAlign: 'right' }}>{s.avg}</td>
                      <td className="v2-num" style={{ textAlign: 'right', color: fading ? 'var(--warn)' : 'var(--pos)' }}>−{s.drop60}</td>
                      <td>
                        <span style={{ width: 16, height: 16, borderRadius: 4, background: z?.color, opacity: 0.65, display: 'grid', placeItems: 'center', fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{s.zone}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="v2-divider" />
          <div style={{ padding: 11, background: 'color-mix(in oklch, var(--warn) 6%, var(--surface))', border: '1px solid color-mix(in oklch, var(--warn) 24%, var(--border))', borderRadius: 6 }}>
            <div className="v2-eyebrow" style={{ marginBottom: 5, color: 'var(--warn)' }}>Recovery trend</div>
            <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
              The 60-second drop fell from 32 to 16 bpm across the five bench sets. That is normal fatigue accumulation, but if set 5 recovers under 15 bpm next week, the rest period is too short for the load.
            </div>
          </div>
        </Card>

        <Card title="HR trace · full session" sub="60-second resolution"
              attrappe={ATTRAPPE} className="v2-span-2">
          <LineChart h={170} range={[70, 180]}
            xLabels={['0', '10', '20', '30', '40', '50', '60', '74 min']}
            series={[
              { data: [82, 96, 124, 148, 132, 154, 138, 158, 141, 162, 145, 168, 149, 152, 136, 156, 139, 141, 128, 144, 130, 118, 104, 92], color: 'var(--neg)' },
              { data: Array(24).fill(HR_MAX * 0.8), color: 'var(--warn)' },
              { data: Array(24).fill(HR_MAX * 0.7), color: 'var(--fg-dim)' },
            ]} />
          <div style={{ display: 'flex', gap: 16, marginTop: 9, fontSize: 11, color: 'var(--fg-muted)', flexWrap: 'wrap' }}>
            <span className="v2-row-gap"><span className="v2-dot" style={{ background: 'var(--neg)' }} />Heart rate</span>
            <span className="v2-row-gap"><span className="v2-dot" style={{ background: 'var(--warn)' }} />Z4 floor · 154 bpm</span>
            <span className="v2-row-gap"><span className="v2-dot" style={{ background: 'var(--fg-dim)' }} />Z3 floor · 135 bpm</span>
            <span className="v2-dim" style={{ marginLeft: 'auto' }}>HRmax 193 · measured, not estimated</span>
          </div>
        </Card>
      </div>
    </div>
  )
}
