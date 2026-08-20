'use client'

// Die sechs Modale des Rahmens.
//
// QUELLE: theme-v1/module-goals.jsx:659-901 — `GModal`, `GField`,
// `GInput` und sechs Modale (New goal, Goal detail, Log weight, Log
// measurements, Log photo, Measurement detail).
//
// GEAENDERT IST NUR DAS TECHNISCHE: TypeScript, `v2-`-Praefix,
// `color-mix(in srgb, …)` -> `in oklch`, Escape schliesst, Felder
// bekommen `aria-label`, Knoepfe ohne Ziel oeffnen `InEntwicklung`.
//
// `[cmd]` ALLES IST ATTRAPPE. Kein Modal schreibt — es gibt weder
// `goals.user_goals` noch `goals.body_measurements` (GO-07, GO-10).
import * as React from 'react'
import { Card, Pill, Icon, LineChart, InEntwicklungKnopf } from '@lumeos/ui'

import { MEASUREMENTS, daysToDeadline, type Ziel } from './daten'
import type { ModalZustand } from './kontext'

// ── Der Rahmen ──────────────────────────────────────────────────
// [cmd] module-goals.jsx:659-681.
function GModal({
  title, subtitle, eyebrow, accent, onClose, footer, children, width = 580,
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  eyebrow?: React.ComponentProps<typeof Icon>['name']
  accent?: string
  onClose: () => void
  footer?: React.ReactNode
  children: React.ReactNode
  width?: number
}) {
  // Wie in `InEntwicklung`: ohne Escape ist das Modal per Tastatur eine
  // Sackgasse. Die Vorlage hat das nicht.
  React.useEffect(() => {
    const auf = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', auf)
    return () => window.removeEventListener('keydown', auf)
  }, [onClose])

  return (
    <div className="v2-modal-veil" onClick={onClose} role="presentation">
      <div className="v2-modal" style={{ width, maxWidth: '92vw', maxHeight: '92vh' }}
           role="dialog" aria-modal="true"
           aria-label={typeof title === 'string' ? title : undefined}
           onClick={e => e.stopPropagation()}>
        <div className="v2-modal-h">
          {eyebrow && (
            <div style={{
              width: 26, height: 26, borderRadius: 6, flexShrink: 0,
              background: `color-mix(in oklch, ${accent ?? 'var(--acc-goals)'} 18%, transparent)`,
              border: `1px solid color-mix(in oklch, ${accent ?? 'var(--acc-goals)'} 35%, transparent)`,
              color: accent ?? 'var(--acc-goals)', display: 'grid', placeItems: 'center',
            }}><Icon name={eyebrow} className="v2-ic" /></div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
            {subtitle && <div className="v2-dim" style={{ fontSize: 11 }}>{subtitle}</div>}
          </div>
          <button type="button" className="v2-icon-btn" onClick={onClose} aria-label="Schliessen">
            <Icon name="x" className="v2-ic" />
          </button>
        </div>
        <div className="v2-modal-body" style={{ overflowY: 'auto' }}>{children}</div>
        {footer && <div className="v2-modal-f">{footer}</div>}
      </div>
    </div>
  )
}

// [cmd] module-goals.jsx:683-692.
function GField({ label, sub, children }: {
  label: React.ReactNode; sub?: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 5, gap: 8 }}>
        <label className="v2-eyebrow">{label}</label>
        {sub && <span className="v2-dim" style={{ fontSize: 10 }}>{sub}</span>}
      </div>
      {children}
    </div>
  )
}

const FELD: React.CSSProperties = {
  width: '100%', height: 30, background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 6, padding: '0 10px', fontSize: 12, outline: 'none', color: 'var(--fg)',
}

function GInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...FELD, ...(props.style ?? {}) }} />
}

// ── Die Verteilung ──────────────────────────────────────────────
export function GoalsModale({ modal, onClose }: {
  modal: ModalZustand | null; onClose: () => void
}) {
  if (!modal) return null
  switch (modal.typ) {
    case 'newGoal': return <NewGoalModal onClose={onClose} />
    case 'goalDet': return <GoalDetailModal g={modal.ziel} onClose={onClose} />
    case 'logWeight': return <LogWeightModal onClose={onClose} />
    case 'logMeasure': return <LogMeasureModal onClose={onClose} />
    case 'logPhoto': return <LogPhotoModal onClose={onClose} />
    case 'measureDet': return <MeasureDetailModal m={modal.mass} onClose={onClose} />
    default: return null
  }
}

// ── NEW GOAL ────────────────────────────────────────────────────
// [cmd] module-goals.jsx:694-744.
function NewGoalModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = React.useState('body_comp')
  const types = [
    { id: 'body_comp', label: 'Body composition', icon: 'goals' },
    { id: 'weight', label: 'Weight', icon: 'trend_up' },
    { id: 'strength', label: 'Strength PR', icon: 'training' },
    { id: 'performance', label: 'Performance', icon: 'training' },
    { id: 'habit', label: 'Habit', icon: 'brain' },
    { id: 'custom', label: 'Custom', icon: 'edit' },
  ]
  return (
    <GModal title="New goal" subtitle="Choose type · set target · link modules"
            eyebrow="plus" onClose={onClose}
            footer={
              <>
                <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Cancel</button>
                <InEntwicklungKnopf titel="Create goal" className="v2-btn v2-btn-primary"
                                    grund="`goals.user_goals` gibt es (23 Spalten, 11 Zeilen live), und geschrieben wird sie bereits — `lib/goals/schreiben.ts` setzt Prioritaet und Status. Was fehlt, ist nur das ANLEGEN: es gibt genau drei aktive Plaetze (`user_goals_check1` 1–3 und `uq_user_goals_active_slot`), und welcher beim Anlegen frei wird, ist eine Produktentscheidung.">
                  <Icon name="check" className="v2-ic v2-ic-sm" />Create goal
                </InEntwicklungKnopf>
              </>
            }>
      <GField label="Goal type">
        <div className="v2-goals-typen">
          {types.map(t => (
            <button key={t.id} type="button" onClick={() => setType(t.id)} aria-pressed={type === t.id}
                    style={{
                      padding: '10px 8px', borderRadius: 6,
                      background: type === t.id ? 'color-mix(in oklch, var(--acc-goals) 12%, var(--surface))' : 'var(--surface)',
                      border: `1px solid ${type === t.id ? 'color-mix(in oklch, var(--acc-goals) 35%, var(--border))' : 'var(--border)'}`,
                      color: type === t.id ? 'var(--acc-goals)' : 'var(--fg-muted)',
                      cursor: 'pointer', fontSize: 11.5,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    }}>
              <Icon name={t.icon as never} className="v2-ic" />
              {t.label}
            </button>
          ))}
        </div>
      </GField>
      <GField label="Title">
        <GInput aria-label="Title" placeholder={
          type === 'strength' ? 'e.g. Bench Press 1RM · 130 kg'
            : type === 'performance' ? 'e.g. 10k under 45:00' : 'e.g. Drop to 12% BF'
        } />
      </GField>
      <div className="v2-grid v2-g-cols-2" style={{ gap: 10 }}>
        <GField label="Current value">
          <GInput aria-label="Current value" placeholder={type === 'strength' ? '122.5' : '79.4'} />
        </GField>
        <GField label="Target value">
          <GInput aria-label="Target value" placeholder={type === 'strength' ? '130' : '78'} />
        </GField>
      </div>
      <div className="v2-grid v2-g-cols-2" style={{ gap: 10 }}>
        <GField label="Start date"><GInput type="date" aria-label="Start date" defaultValue="2026-05-16" /></GField>
        <GField label="Deadline"><GInput type="date" aria-label="Deadline" defaultValue="2026-08-01" /></GField>
      </div>
      <GField label="Linked modules · auto-pull data">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['nutrition', 'training', 'recovery', 'supplements', 'medical'].map(m => (
            <InEntwicklungKnopf key={m} titel={`Modul ${m} verknuepfen`} className="v2-pill"
                                style={{ cursor: 'pointer', padding: '4px 10px', fontSize: 11 }}>
              {m}
            </InEntwicklungKnopf>
          ))}
        </div>
      </GField>
      <GField label="Notes (optional)">
        <GInput aria-label="Notes" placeholder="Context, sub-goals, reminders…" />
      </GField>
    </GModal>
  )
}

// ── GOAL DETAIL ─────────────────────────────────────────────────
// [cmd] module-goals.jsx:746-779.
function GoalDetailModal({ g, onClose }: { g: Ziel; onClose: () => void }) {
  const paceColor = g.pace === 'ahead' ? 'var(--pos)'
    : g.pace === 'on-track' ? 'var(--acc-recov)' : 'var(--warn)'
  return (
    <GModal title={g.title} subtitle={`${g.type} · started ${g.started}`}
            eyebrow={g.icon as never} accent={g.color} onClose={onClose} width={680}
            footer={
              <>
                <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Close</button>
                <InEntwicklungKnopf titel="Edit" className="v2-btn">
                  <Icon name="edit" className="v2-ic v2-ic-sm" />Edit
                </InEntwicklungKnopf>
                <InEntwicklungKnopf titel="Mark complete" className="v2-btn v2-btn-primary">
                  Mark complete
                </InEntwicklungKnopf>
              </>
            }>
      <div className="v2-goals-detail-kopf">
        <Card className="v2-card-tight" style={{ padding: 12 }}>
          <div className="v2-eyebrow">Progress</div>
          <div className="v2-num" style={{ fontSize: 18, color: g.color }}>{(g.progress * 100).toFixed(0)}%</div>
        </Card>
        <Card className="v2-card-tight" style={{ padding: 12 }}>
          <div className="v2-eyebrow">Pace</div>
          <Pill style={{ borderColor: `color-mix(in oklch, ${paceColor} 35%, var(--border))`, color: paceColor }}>
            {g.pace}
          </Pill>
        </Card>
        <Card className="v2-card-tight" style={{ padding: 12 }}>
          <div className="v2-eyebrow">Deadline</div>
          <div className="v2-num" style={{ fontSize: 13 }}>{g.deadline}</div>
          <div className="v2-dim" style={{ fontSize: 10 }}>{daysToDeadline(g.deadline)}</div>
        </Card>
        <Card className="v2-card-tight" style={{ padding: 12 }}>
          <div className="v2-eyebrow">Linked</div>
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 4 }}>
            {g.linkedModules.map(m => <Pill key={m}>{m}</Pill>)}
          </div>
        </Card>
      </div>

      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Plan vs actual</div>
      <Card className="v2-card-tight" style={{ padding: 12, marginBottom: 14 }}>
        {g.history && g.history.length > 0
          ? <GoalProgressChart g={g} />
          : <div className="v2-dim" style={{ fontSize: 12, textAlign: 'center', padding: 20 }}>No data points logged yet.</div>}
      </Card>

      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Connected data sources</div>
      <div className="v2-col-gap" style={{ gap: 6, marginBottom: 14 }}>
        {g.linkedModules.includes('training') && <ContextRow icon="training" label="Training compliance" value="22 / 24 sessions · last 30d" />}
        {g.linkedModules.includes('nutrition') && <ContextRow icon="nutrition" label="Calorie balance" value="−420 kcal/day avg · 30d" />}
        {g.linkedModules.includes('recovery') && <ContextRow icon="recovery" label="Recovery score avg" value="78 / 100" />}
        {g.linkedModules.includes('supplements') && <ContextRow icon="supplements" label="Adherence" value="94% · 30d" />}
      </div>

      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Notes</div>
      <div style={{ padding: 12, background: 'var(--surface)', borderRadius: 6, fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.55 }}>
        {g.note}
      </div>
    </GModal>
  )
}

// [cmd] module-goals.jsx:781-787.
function ContextRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 5,
    }}>
      <Icon name={icon as never} className="v2-ic" style={{ color: 'var(--fg-muted)' }} />
      <span style={{ fontSize: 12, flex: 1, minWidth: 0 }}>{label}</span>
      <span className="v2-num" style={{ fontSize: 11.5 }}>{value}</span>
    </div>
  )
}

// [cmd] module-goals.jsx:789-825.
function GoalProgressChart({ g }: { g: Ziel }) {
  const isWeight = g.target.weight != null
  const isTime = g.target.time != null
  let data: number[]
  let target: number
  let start: number
  if (isWeight) {
    data = g.history.map(h => h.weight!)
    target = g.target.weight!
    start = g.start.weight!
  } else if (isTime) {
    data = g.history.map(h => h.time! / 60)
    target = g.target.time! / 60
    start = g.start.time! / 60
  } else {
    data = g.history.map(h => h.count!)
    target = g.target.count!
    start = g.start.count!
  }
  const ideal = Array.from({ length: data.length }, (_, i) =>
    start + (target - start) * (i / (data.length - 1)))
  return (
    <>
      <LineChart h={180}
                 range={[Math.min(target, ...data) * 0.97, Math.max(start, ...data) * 1.03]}
                 series={[
                   { data: ideal, color: 'var(--fg-dim)' },
                   { data, color: g.color },
                 ]}
                 xLabels={g.history.map(h => h.d)} />
      <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11, color: 'var(--fg-muted)', flexWrap: 'wrap' }}>
        <span className="v2-row-gap"><span className="v2-dot" style={{ background: 'var(--fg-dim)' }} />ideal path</span>
        <span className="v2-row-gap"><span className="v2-dot" style={{ background: g.color }} />actual</span>
      </div>
    </>
  )
}

// ── LOG WEIGHT ──────────────────────────────────────────────────
// [cmd] module-goals.jsx:827-847.
function LogWeightModal({ onClose }: { onClose: () => void }) {
  return (
    <GModal title="Log weight" subtitle="Daily — morning fasted preferred"
            eyebrow="plus" onClose={onClose} width={520}
            footer={
              <>
                <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Cancel</button>
                <InEntwicklungKnopf titel="Log" className="v2-btn v2-btn-primary"
                                    grund="`goals.body_measurements` gibt es (17 Spalten, 362 Zeilen live) und wird gelesen. Was fehlt, ist der Schreibweg — eine eigene Messung eintragen kann die Oberflaeche noch nicht.">
                  <Icon name="check" className="v2-ic v2-ic-sm" />Log
                </InEntwicklungKnopf>
              </>
            }>
      <div className="v2-grid v2-g-cols-2" style={{ gap: 10 }}>
        <GField label="Date"><GInput type="date" aria-label="Date" defaultValue="2026-05-16" /></GField>
        <GField label="Time"><GInput type="time" aria-label="Time" defaultValue="07:15" /></GField>
      </div>
      <div className="v2-grid v2-g-cols-2" style={{ gap: 10 }}>
        <GField label="Weight"><GInput type="number" aria-label="Weight" defaultValue="79.4" /></GField>
        <GField label="Body fat (optional)"><GInput type="number" aria-label="Body fat" defaultValue="13.8" /></GField>
      </div>
      <GField label="Source">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['Manual', 'Smart scale', 'DXA'].map(s => (
            <InEntwicklungKnopf key={s} titel={`Quelle ${s}`} className="v2-btn">{s}</InEntwicklungKnopf>
          ))}
        </div>
      </GField>
      <GField label="Note (optional)">
        <GInput aria-label="Note" placeholder="Hydration, cycle phase, salt the night before…" />
      </GField>
    </GModal>
  )
}

// ── LOG MEASUREMENTS ────────────────────────────────────────────
// [cmd] module-goals.jsx:849-862.
function LogMeasureModal({ onClose }: { onClose: () => void }) {
  return (
    <GModal title="Update measurements" subtitle="All in cm · fill what you have"
            eyebrow="edit" onClose={onClose} width={620}
            footer={
              <>
                <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Cancel</button>
                <InEntwicklungKnopf titel="Save measurements" className="v2-btn v2-btn-primary"
                                    grund="`goals.body_measurements` gibt es (17 Spalten, 362 Zeilen live) und traegt auch die Umfaenge. Was fehlt, ist der Schreibweg.">
                  <Icon name="check" className="v2-ic v2-ic-sm" />Save measurements
                </InEntwicklungKnopf>
              </>
            }>
      <GField label="Date"><GInput type="date" aria-label="Date" defaultValue="2026-05-16" /></GField>
      <div className="v2-grid v2-g-cols-3" style={{ gap: 10 }}>
        {MEASUREMENTS.map(m => (
          <GField key={m.id} label={m.label} sub={`last ${m.current}`}>
            <GInput type="number" aria-label={m.label} defaultValue={m.current} />
          </GField>
        ))}
      </div>
      <GField label="Note (optional)">
        <GInput aria-label="Note" placeholder="Time of day, pump state, etc." />
      </GField>
    </GModal>
  )
}

// ── LOG PHOTO ───────────────────────────────────────────────────
// [cmd] module-goals.jsx:864-884.
function LogPhotoModal({ onClose }: { onClose: () => void }) {
  return (
    <GModal title="New photo session" subtitle="Front · side · back · same lighting"
            eyebrow="camera" onClose={onClose}
            footer={
              <>
                <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Cancel</button>
                <InEntwicklungKnopf titel="Save session" className="v2-btn v2-btn-primary"
                                    grund={'Fotosessions brauchen eine Dateiablage — der Umsetzungsplan fuehrt sie unter „Was nicht gebaut wird".'}>
                  <Icon name="download" className="v2-ic v2-ic-sm" />Save session
                </InEntwicklungKnopf>
              </>
            }>
      <div className="v2-grid v2-g-cols-3" style={{ gap: 8, marginBottom: 14 }}>
        {['Front', 'Side', 'Back'].map(p => (
          <div key={p} className="v2-placeholder-img"
               style={{ aspectRatio: '9/16', borderRadius: 6, border: '1px dashed var(--border)' }}>
            <div style={{ fontSize: 10, textAlign: 'center', color: 'var(--fg-dim)' }}>
              {p}<br />tap to upload
            </div>
          </div>
        ))}
      </div>
      <div className="v2-grid v2-g-cols-3" style={{ gap: 10 }}>
        <GField label="Date"><GInput type="date" aria-label="Date" defaultValue="2026-05-16" /></GField>
        <GField label="Weight"><GInput type="number" aria-label="Weight" defaultValue="79.4" /></GField>
        <GField label="Body fat"><GInput type="number" aria-label="Body fat" defaultValue="13.8" /></GField>
      </div>
      <div style={{ padding: 10, background: 'var(--surface)', borderRadius: 6, fontSize: 11.5, color: 'var(--fg-muted)', lineHeight: 1.55 }}>
        <Icon name="check" className="v2-ic v2-ic-sm" style={{ display: 'inline', color: 'var(--pos)', marginRight: 4 }} />
        Photos are stored encrypted, never shared with coaches unless you explicitly add them to a goal share.
      </div>
    </GModal>
  )
}

// ── MEASUREMENT DETAIL ──────────────────────────────────────────
// [cmd] module-goals.jsx:886-901.
function MeasureDetailModal({ m, onClose }: {
  m: typeof MEASUREMENTS[number]; onClose: () => void
}) {
  return (
    <GModal title={m.label} subtitle={`Current ${m.current} cm · 6 entries`}
            eyebrow="trend_up" onClose={onClose} width={580}
            footer={
              <>
                <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Close</button>
                <InEntwicklungKnopf titel="Update value" className="v2-btn">
                  <Icon name="edit" className="v2-ic v2-ic-sm" />Update value
                </InEntwicklungKnopf>
              </>
            }>
      <div className="v2-grid v2-g-cols-3" style={{ gap: 10, marginBottom: 14 }}>
        <Card className="v2-card-tight" style={{ padding: 12 }}>
          <div className="v2-eyebrow">Current</div>
          <div className="v2-num" style={{ fontSize: 18 }}>{m.current} cm</div>
        </Card>
        <Card className="v2-card-tight" style={{ padding: 12 }}>
          <div className="v2-eyebrow">6 entries ago</div>
          <div className="v2-num" style={{ fontSize: 18 }}>{m.history[0]} cm</div>
        </Card>
        <Card className="v2-card-tight" style={{ padding: 12 }}>
          <div className="v2-eyebrow">Δ</div>
          <div className="v2-num" style={{
            fontSize: 18, color: m.current > m.history[0] ? 'var(--pos)' : 'var(--warn)',
          }}>
            {m.current > m.history[0] ? '+' : ''}{(m.current - m.history[0]).toFixed(1)} cm
          </div>
        </Card>
      </div>
      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Trend</div>
      <Card className="v2-card-tight" style={{ padding: 12 }}>
        <LineChart h={140} range={[Math.min(...m.history) - 0.5, Math.max(...m.history) + 0.5]}
                   series={[{ data: m.history, color: 'var(--acc-goals)' }]}
                   xLabels={['6 ago', '', '', '', '', 'now']} />
      </Card>
    </GModal>
  )
}
