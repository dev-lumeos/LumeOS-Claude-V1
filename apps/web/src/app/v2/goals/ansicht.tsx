'use client'

// Das Goals-Modul der Vorlage, uebernommen.
//
// QUELLE: theme-v1/module-goals.jsx (903 Zeilen) — der Rahmen.
//
// **EIN RAHMEN, KEINE WEICHE.** `[cmd]` `app.jsx:125` lautet schlicht
// `case "goals": return <GoalsModule />;` — anders als bei Recovery,
// wo `RecoveryModuleV2 ? … : …` steht. `window.GoalsModule` wird genau
// einmal gesetzt (module-goals.jsx:903); `-pro.jsx` und `-editor.jsx`
// ueberschreiben es NICHT, sondern liefern zu.
//
// Damit sind die drei Dateien ein System wie bei Training:
//   module-goals.jsx      ruft 5× `window.Goals*View`  → -pro.jsx
//   module-goals-pro.jsx  ruft 2× `window.Phase*`      → -editor.jsx
// Ausfuehrlich im Bericht.
//
// GEAENDERT IST NUR DAS TECHNISCHE:
//   1. JSX ohne Typen -> TypeScript.
//   2. Klassen auf `v2-`-Praefix.
//   3. `window.Goals*View` -> Import.
//   4. Knoepfe ohne Ziel oeffnen `InEntwicklung`.
//   5. `Math.random()` in den Verlaufsdaten -> feste Pseudofolge
//      (Begruendung in `daten.ts`).
//   6. `@media`-Haltepunkte, weil die Vorlage keine hat.
//
// NICHT geaendert: keine Kachel weggelassen, keine Zahl ersetzt, keine
// Anordnung angepasst. Die Texte bleiben englisch wie in der Vorlage.
//
// `[cmd]` ALLES IST ATTRAPPE — auch die Composition-Kachel, die
// Mifflin-St Jeor rechnet. `goals.zielwerte_am` liefert seit GO-03/04
// echte Werte; angebunden wird im Folgeauftrag (siehe Bericht,
// „Welche Kachel auf vorhandene Daten passt").
import * as React from 'react'
import {
  Card, Pill, Icon, Ring, Row, Sparkline, LineChart, Tabs,
  InEntwicklungKnopf, type TabItem,
} from '@lumeos/ui'

import {
  ACTIVE_GOALS, COMPLETED_GOALS, BODY_METRICS, MEASUREMENTS, PHOTO_PROGRESSION,
  COMP_PROFIL, compWerte, daysToDeadline, fmtTime, type Ziel,
} from './daten'
import { GoalsKontext, useGoals, type ModalZustand } from './kontext'
import { GoalsModale } from './modale'
import { GoalsPhaseView, GoalsTDEEView, GoalsCrossModuleView } from './tab-phase'
import { GoalsPhysiqueView, GoalsPosesView } from './tab-physique'

/** Die Marke an jeder Kachel. Ein Satz, damit er nicht driftet. */
export const ATTRAPPE =
  'Aus dem Entwurf uebernommen. Die Zahlen sind erfunden — es gibt weder '
  + 'Ziele noch Koerpermasse in der Datenbank.'

// [cmd] module-goals.jsx:172-183, in dieser Reihenfolge.
const TABS: TabItem[] = [
  { id: 'goals', label: 'Goals', count: ACTIVE_GOALS.length },
  { id: 'phase', label: 'Phase engine' },
  { id: 'tdee', label: 'Adaptive TDEE' },
  { id: 'cross', label: 'Cross-module' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'metrics', label: 'Body metrics' },
  { id: 'measure', label: 'Measurements' },
  { id: 'comp', label: 'Composition' },
  { id: 'physique', label: 'Physique ratios' },
  { id: 'poses', label: 'Pose sessions' },
]

export function GoalsAnsicht() {
  const [tab, setTab] = React.useState('goals')
  const [modal, setModal] = React.useState<ModalZustand | null>(null)

  const kontext = React.useMemo(() => ({
    open: (m: ModalZustand) => setModal(m),
    close: () => setModal(null),
  }), [])

  return (
    <GoalsKontext.Provider value={kontext}>
      <div className="v2-module-header v2-module-hero-lite">
        <div className="v2-module-title-block">
          <div className="v2-module-title-row">
            <span className="v2-module-title">Goals &amp; Body</span>
            <Pill variant="acc">{ACTIVE_GOALS.length} active goals</Pill>
            <Pill><span className="v2-dot" style={{ background: 'var(--pos)' }} />3 closed in 90d</Pill>
          </div>
          <div className="v2-module-sub">
            Body composition · strength · performance · habits — cross-module linked
          </div>
        </div>
        <div className="v2-module-actions">
          <button type="button" className="v2-btn" onClick={() => kontext.open({ typ: 'logWeight' })}>
            <Icon name="plus" className="v2-ic v2-ic-sm" /> Log weight
          </button>
          <button type="button" className="v2-btn" onClick={() => kontext.open({ typ: 'logMeasure' })}>
            <Icon name="edit" className="v2-ic v2-ic-sm" /> Measurements
          </button>
          <button type="button" className="v2-btn v2-btn-primary" onClick={() => kontext.open({ typ: 'newGoal' })}>
            <Icon name="plus" className="v2-ic v2-ic-sm" /> New goal
          </button>
        </div>
      </div>

      <Tabs items={TABS} active={tab} onChange={setTab} />

      {tab === 'goals' && <GoalsTab />}
      {tab === 'phase' && <GoalsPhaseView />}
      {tab === 'tdee' && <GoalsTDEEView />}
      {tab === 'cross' && <GoalsCrossModuleView />}
      {tab === 'timeline' && <TimelineTab />}
      {tab === 'metrics' && <MetricsTab />}
      {tab === 'measure' && <MeasureTab />}
      {tab === 'comp' && <CompTab />}
      {tab === 'physique' && <GoalsPhysiqueView />}
      {tab === 'poses' && <GoalsPosesView />}

      <GoalsModale modal={modal} onClose={kontext.close} />
    </GoalsKontext.Provider>
  )
}

// ── GOALS TAB ───────────────────────────────────────────────────
// [cmd] module-goals.jsx:209-255.
function GoalsTab() {
  const { open } = useGoals()
  return (
    <div className="v2-grid-15">
      <div className="v2-col-gap" style={{ gap: 14 }}>
        {ACTIVE_GOALS.map(g => (
          <GoalCard key={g.id} g={g} onClick={() => open({ typ: 'goalDet', ziel: g })} />
        ))}
      </div>
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="This week" sub="movement toward all goals" attrappe={ATTRAPPE}>
          <div className="v2-col-gap" style={{ gap: 8 }}>
            <Row label="Bench Press" value="+0 kg (next session Mon)" />
            <Row label="Weight" value="−0.2 kg" />
            <Row label="Body fat" value="−0.1 %" />
            <Row label="10k pace" value="−5 s/km avg (3 runs)" />
            <Row label="Meditation" value="3 of 5 sessions" />
          </div>
        </Card>

        <Card title="Recently closed" sub="3 in last 90 days" attrappe={ATTRAPPE}>
          <div className="v2-col-gap" style={{ gap: 6 }}>
            {COMPLETED_GOALS.map(g => (
              <div key={g.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 5,
              }}>
                <Icon name={g.icon as never} className="v2-ic" style={{ color: g.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{g.title}</div>
                  <div className="v2-dim v2-mono" style={{ fontSize: 10 }}>
                    completed {g.completedOn} · deadline was {g.deadline}
                  </div>
                </div>
                <Pill variant="pos"><Icon name="check" className="v2-ic v2-ic-sm" />done</Pill>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Cross-module health" sub="how goals are doing in linked modules" attrappe={ATTRAPPE}>
          <Row label="Nutrition adherence" value="94% · 30d" />
          <Row label="Training compliance" value="22 / 24 sessions" />
          <Row label="Sleep quality avg" value="84 / 100" />
          <Row label="Recovery avg" value="78 / 100" />
          <div className="v2-divider" />
          <div className="v2-dim" style={{ fontSize: 11, lineHeight: 1.45 }}>
            Buddy: All four inputs trend supportive. Body-comp goal pace is sustainable if compliance holds.
          </div>
        </Card>
      </div>
    </div>
  )
}

// [cmd] module-goals.jsx:257-313.
function GoalCard({ g, onClick }: { g: Ziel; onClick: () => void }) {
  const paceColor = g.pace === 'ahead' ? 'var(--pos)'
    : g.pace === 'on-track' ? 'var(--acc-recov)' : 'var(--warn)'
  return (
    <Card onClick={onClick} style={{ cursor: 'pointer' }} attrappe={ATTRAPPE}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 8,
          background: `color-mix(in oklch, ${g.color} 16%, transparent)`,
          border: `1px solid color-mix(in oklch, ${g.color} 32%, var(--border))`,
          color: g.color, display: 'grid', placeItems: 'center', flexShrink: 0,
        }}><Icon name={g.icon as never} className="v2-ic v2-ic-lg" /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 11, color: 'var(--fg-dim)', fontFamily: 'var(--font-mono)',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>{g.type}</span>
            <Pill style={{
              borderColor: `color-mix(in oklch, ${paceColor} 35%, var(--border))`,
              color: paceColor,
              background: `color-mix(in oklch, ${paceColor} 8%, transparent)`,
            }}>{g.pace}</Pill>
            <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>
              deadline {g.deadline} · {daysToDeadline(g.deadline)}
            </span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 8 }}>{g.title}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8, fontSize: 12, flexWrap: 'wrap' }}>
            {g.target.weight != null && (
              <>
                <span>
                  <span className="v2-dim">current </span>
                  <span className="v2-num" style={{ color: 'var(--fg)', fontWeight: 500 }}>
                    {g.current.weight} kg{g.current.bf != null ? ` · ${g.current.bf}%` : ''}
                  </span>
                </span>
                <span className="v2-dim">→</span>
                <span>
                  <span className="v2-dim">target </span>
                  <span className="v2-num" style={{ color: g.color, fontWeight: 500 }}>
                    {g.target.weight} kg{g.target.bf != null ? ` · ${g.target.bf}%` : ''}
                  </span>
                </span>
              </>
            )}
            {g.target.time != null && (
              <>
                <span>
                  <span className="v2-dim">current </span>
                  <span className="v2-num" style={{ color: 'var(--fg)', fontWeight: 500 }}>{fmtTime(g.current.time!)}</span>
                </span>
                <span className="v2-dim">→</span>
                <span>
                  <span className="v2-dim">target </span>
                  <span className="v2-num" style={{ color: g.color, fontWeight: 500 }}>{fmtTime(g.target.time)}</span>
                </span>
              </>
            )}
            {g.target.count != null && (
              <>
                <span>
                  <span className="v2-dim">current </span>
                  <span className="v2-num" style={{ color: 'var(--fg)', fontWeight: 500 }}>{g.current.count}</span>
                </span>
                <span className="v2-dim">→</span>
                <span>
                  <span className="v2-dim">target </span>
                  <span className="v2-num" style={{ color: g.color, fontWeight: 500 }}>{g.target.count} sessions</span>
                </span>
              </>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ flex: 1 }}>
              <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 999, overflow: 'hidden', position: 'relative' }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, bottom: 0,
                  width: `${g.progress * 100}%`, background: g.color, borderRadius: 999,
                }} />
              </div>
            </div>
            <span className="v2-num" style={{ fontSize: 13, fontWeight: 500, color: g.color, width: 44, textAlign: 'right' }}>
              {(g.progress * 100).toFixed(0)}%
            </span>
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {g.linkedModules.map(m => (
              <Pill key={m}><Icon name={m as never} className="v2-ic v2-ic-sm" />{m}</Pill>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

// ── TIMELINE TAB ────────────────────────────────────────────────
// [cmd] module-goals.jsx:332-407.
function TimelineTab() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const all = [
    ...ACTIVE_GOALS.map(g => ({ ...g, status: 'active' as const })),
    ...COMPLETED_GOALS.map(g => ({ ...g, status: 'done' as const })),
  ]
  return (
    <Card title="Goal timeline · 2026"
          sub={`${ACTIVE_GOALS.length} active · ${COMPLETED_GOALS.length} closed`}
          attrappe={ATTRAPPE}>
      <div className="v2-goals-gantt" style={{ marginBottom: 8 }}>
        <div />
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2,
          fontSize: 9.5, color: 'var(--fg-dim)', fontFamily: 'var(--font-mono)',
        }}>
          {months.map(m => <span key={m} style={{ textAlign: 'left' }}>{m}</span>)}
        </div>
      </div>
      <div className="v2-col-gap" style={{ gap: 6 }}>
        {all.map(g => <GanttRow key={g.id} g={g} />)}
      </div>
      <div className="v2-divider" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div className="v2-dim" style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>Today · May 16, 2026</div>
        <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'var(--fg-muted)', flexWrap: 'wrap' }}>
          <span className="v2-row-gap"><span style={{ width: 10, height: 10, background: 'var(--acc-goals)', borderRadius: 2, opacity: 0.5 }} />elapsed</span>
          <span className="v2-row-gap"><span style={{ width: 10, height: 10, background: 'var(--acc-goals)', borderRadius: 2 }} />remaining</span>
          <span className="v2-row-gap"><span style={{ width: 10, height: 10, background: 'var(--pos)', borderRadius: 2 }} />completed</span>
        </div>
      </div>
    </Card>
  )
}

type GanttZiel = {
  id: string; title: string; icon: string; color: string; status: 'active' | 'done'
  started?: string; deadline?: string; completedOn?: string
}

// [cmd] module-goals.jsx:360-407.
function GanttRow({ g }: { g: GanttZiel }) {
  const monthFraction = (dateStr: string) => {
    const d = new Date(`${dateStr}T12:00:00`)
    return d.getMonth() + d.getDate() / 30
  }
  const start = monthFraction(g.started || g.completedOn || '2026-01-01')
  const end = monthFraction(g.deadline || g.completedOn || '2026-12-31')
  const today = monthFraction('2026-05-16')
  const left = (start / 12) * 100
  const right = (end / 12) * 100
  const width = right - left
  const todayInRange = today > start && today < end
  return (
    <div className="v2-goals-gantt">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        <Icon name={g.icon as never} className="v2-ic" style={{ color: g.color, flexShrink: 0 }} />
        <span style={{ fontSize: 11.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.title}</span>
      </div>
      <div style={{ position: 'relative', height: 22, background: 'var(--surface-2)', borderRadius: 4 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} style={{ position: 'absolute', left: `${(i / 12) * 100}%`, top: 0, bottom: 0, width: 1, background: 'var(--border)' }} />
        ))}
        {g.status === 'done' ? (
          <div style={{ position: 'absolute', top: 3, left: `${left}%`, height: 16, width: `${width}%`, background: 'var(--pos)', borderRadius: 3, opacity: 0.7 }}>
            <div style={{ position: 'absolute', right: -2, top: -1, bottom: -1, width: 4, background: 'var(--pos)' }} />
          </div>
        ) : (
          <>
            {todayInRange && (
              <>
                <div style={{ position: 'absolute', top: 3, left: `${left}%`, height: 16, width: `${((today - start) / (end - start)) * width}%`, background: g.color, borderRadius: '3px 0 0 3px', opacity: 0.45 }} />
                <div style={{ position: 'absolute', top: 3, left: `${left + ((today - start) / (end - start)) * width}%`, height: 16, width: `${((end - today) / (end - start)) * width}%`, background: g.color, borderRadius: '0 3px 3px 0' }} />
              </>
            )}
            {!todayInRange && (
              <div style={{ position: 'absolute', top: 3, left: `${left}%`, height: 16, width: `${width}%`, background: g.color, borderRadius: 3 }} />
            )}
          </>
        )}
        <div style={{ position: 'absolute', left: `${(today / 12) * 100}%`, top: -3, bottom: -3, width: 1, background: 'var(--fg)' }} />
      </div>
    </div>
  )
}

// ── METRICS TAB ─────────────────────────────────────────────────
// [cmd] module-goals.jsx:410-459.
function MetricsTab() {
  return (
    <div>
      <div className="v2-grid v2-g-cols-3" style={{ gap: 12, marginBottom: 14 }}>
        <MetricKPI label="Weight" value={BODY_METRICS.weight.current} unit="kg"
                   delta="-1.1 kg / 30d" deltaVariant="pos" color="var(--acc-goals)"
                   history={BODY_METRICS.weight.history.slice(-30)} />
        <MetricKPI label="Body fat" value={BODY_METRICS.bodyfat.current} unit="%"
                   delta="-1.6 % / 60d" deltaVariant="pos" color="var(--acc-suppl)"
                   history={BODY_METRICS.bodyfat.history} />
        <MetricKPI label="Lean mass" value={BODY_METRICS.leanMass.current} unit="kg"
                   delta="+0.5 kg / 30d" deltaVariant="pos" color="var(--acc-train)"
                   history={BODY_METRICS.leanMass.history} />
      </div>
      <div className="v2-grid-14">
        <Card title="Weight · 6 months" sub="daily entries · 7d moving avg overlaid" attrappe={ATTRAPPE}>
          <LineChart h={220} range={[78, 82]}
                     xLabels={['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May']}
                     series={[
                       { data: BODY_METRICS.weight.history, color: 'color-mix(in oklch, var(--acc-goals) 40%, transparent)' },
                       {
                         data: BODY_METRICS.weight.history.map((_, i, arr) => {
                           const w = arr.slice(Math.max(0, i - 6), i + 1)
                           return w.reduce((s, x) => s + x, 0) / w.length
                         }),
                         color: 'var(--acc-goals)',
                       },
                     ]} />
          <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11, color: 'var(--fg-muted)', flexWrap: 'wrap' }}>
            <span className="v2-row-gap"><span className="v2-dot" style={{ background: 'color-mix(in oklch, var(--acc-goals) 40%, transparent)' }} />daily</span>
            <span className="v2-row-gap"><span className="v2-dot" style={{ background: 'var(--acc-goals)' }} />7d MA</span>
            <span style={{ marginLeft: 'auto' }}>180 entries · 0 missed</span>
          </div>
        </Card>
        <Card title="Body fat trend" sub="bi-weekly · DXA + smart scale" attrappe={ATTRAPPE}>
          <LineChart h={220} range={[12, 16]}
                     xLabels={['Mar 15', '', '', 'Apr', '', '', 'May 16']}
                     series={[
                       { data: BODY_METRICS.bodyfat.history, color: 'var(--acc-suppl)' },
                       { data: Array(BODY_METRICS.bodyfat.history.length).fill(12), color: 'var(--fg-dim)' },
                     ]} />
          <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 11, color: 'var(--fg-muted)', flexWrap: 'wrap' }}>
            <span>Current <span className="v2-num" style={{ color: 'var(--fg)' }}>13.8 %</span></span>
            <span>Target <span className="v2-num" style={{ color: 'var(--acc-suppl)' }}>12.0 %</span></span>
            <span className="v2-dim">−1.6 over 60d · on pace</span>
          </div>
        </Card>
        <Card title="Lean mass · 30 days" sub="estimated from weight × (1 − BF%)"
              attrappe={ATTRAPPE} className="v2-span-2">
          <LineChart h={160} range={[67, 69]}
                     xLabels={['Apr 16', '', '', '', '', 'May 1', '', '', '', '', 'May 16']}
                     series={[{ data: BODY_METRICS.leanMass.history, color: 'var(--acc-train)' }]} />
          <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11, color: 'var(--fg-muted)', flexWrap: 'wrap' }}>
            <span>Current <span className="v2-num" style={{ color: 'var(--fg)' }}>68.4 kg</span></span>
            <span>Δ 30d <span className="v2-num" style={{ color: 'var(--pos)' }}>+0.5 kg</span></span>
            <span className="v2-dim">Recomposition working — gaining muscle while losing fat.</span>
          </div>
        </Card>
      </div>
    </div>
  )
}

// [cmd] module-goals.jsx:461-474.
function MetricKPI({ label, value, unit, delta, deltaVariant, color, history }: {
  label: string; value: number; unit: string; delta: string
  deltaVariant: 'pos' | 'neg'; color: string; history: number[]
}) {
  return (
    <Card className="v2-card-tight" style={{ padding: 14, position: 'relative', overflow: 'hidden' }} attrappe>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: color, opacity: 0.6 }} />
      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>{label}</div>
      <div className="v2-num" style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 4 }}>
        {value}<span style={{ fontSize: 11, color: 'var(--fg-dim)', fontWeight: 400, marginLeft: 3 }}>{unit}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Icon name={deltaVariant === 'pos' ? 'trend_down' : 'trend_up'} className="v2-ic v2-ic-sm"
              style={{ color: deltaVariant === 'pos' ? 'var(--pos)' : 'var(--neg)' }} />
        <span className="v2-num" style={{ fontSize: 11, color: deltaVariant === 'pos' ? 'var(--pos)' : 'var(--neg)' }}>{delta}</span>
      </div>
      <Sparkline data={history} color={color} h={32} />
    </Card>
  )
}

// ── MEASUREMENTS TAB ────────────────────────────────────────────
// [cmd] module-goals.jsx:477-544.
function MeasureTab() {
  const { open } = useGoals()
  return (
    <div className="v2-grid-14">
      <Card
        title="Circumferences" sub="last update May 14 · cm"
        attrappe={ATTRAPPE}
        actions={
          <button type="button" className="v2-btn v2-btn-ghost"
                  style={{ height: 22, fontSize: 11, padding: '0 8px' }}
                  onClick={() => open({ typ: 'logMeasure' })}>
            Update <Icon name="edit" className="v2-ic v2-ic-sm" />
          </button>
        }
      >
        <div className="v2-tbl-wrap">
          <table className="v2-tbl">
            <thead>
              <tr>
                <th>Site</th>
                <th style={{ width: 80, textAlign: 'right' }}>Current</th>
                <th style={{ width: 70, textAlign: 'right' }}>Δ 30d</th>
                <th style={{ width: 160 }}>Trend · 6 entries</th>
                <th style={{ width: 30 }} />
              </tr>
            </thead>
            <tbody>
              {MEASUREMENTS.map(m => {
                const delta = (m.current - m.history[0]).toFixed(1)
                const positive = parseFloat(delta) > 0
                const isWaist = ['waist', 'hip'].includes(m.id)
                const goodDir = isWaist ? !positive : positive
                return (
                  <tr key={m.id} style={{ cursor: 'pointer' }} onClick={() => open({ typ: 'measureDet', mass: m })}>
                    <td>{m.label}</td>
                    <td className="v2-num" style={{ textAlign: 'right', fontWeight: 500 }}>{m.current.toFixed(1)}</td>
                    <td className="v2-num" style={{
                      textAlign: 'right',
                      color: parseFloat(delta) === 0 ? 'var(--fg-dim)' : goodDir ? 'var(--pos)' : 'var(--warn)',
                    }}>
                      {parseFloat(delta) > 0 ? '+' : ''}{delta}
                    </td>
                    <td style={{ padding: '4px 8px 4px 0' }}>
                      <Sparkline data={m.history}
                                 color={goodDir ? 'var(--pos)' : parseFloat(delta) === 0 ? 'var(--fg-dim)' : 'var(--warn)'}
                                 h={22} />
                    </td>
                    <td><Icon name="chevron_right" className="v2-ic v2-ic-sm" style={{ color: 'var(--fg-dim)' }} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="v2-col-gap" style={{ gap: 14 }}>
        {/* `[cmd]` Die Vorlage schiebt hier `window.PhotoUploadPanel` ein
            (module-goals.jsx:515). Definiert ist es in
            `module-crossmodule-rest.jsx:120` — einer Sammeldatei
            ausserhalb der drei Goals-Dateien, aus der schon der
            Stress-Tab von Recovery kam. Es laedt Dateien hoch; ohne
            Ablage waere das eine Attrappe, die etwas verspricht, was
            sie nicht kann. Deshalb steht hier die Karte „Photo
            progression" allein — im Bericht vermerkt. */}
        <Card
          title="Photo progression"
          sub={`${PHOTO_PROGRESSION.length} sessions · front · side · back`}
          attrappe={ATTRAPPE}
          actions={
            <button type="button" className="v2-btn v2-btn-ghost"
                    style={{ height: 22, fontSize: 11, padding: '0 8px' }}
                    onClick={() => open({ typ: 'logPhoto' })}>
              <Icon name="camera" className="v2-ic v2-ic-sm" />New session
            </button>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
            {PHOTO_PROGRESSION.map(p => (
              <div key={p.date} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div className="v2-placeholder-img" style={{ aspectRatio: '9/16', border: '1px solid var(--border)', borderRadius: 4 }}>
                  <div style={{ fontSize: 9, padding: 4, textAlign: 'center', lineHeight: 1.4, color: 'var(--fg-dim)' }}>
                    front<br />side<br />back
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className="v2-num" style={{ fontSize: 10, color: 'var(--fg-dim)' }}>{p.date.slice(5)}</div>
                  <div className="v2-num" style={{ fontSize: 11, color: 'var(--fg)' }}>{p.weight}</div>
                  <div className="v2-num" style={{ fontSize: 9.5, color: 'var(--fg-dim)' }}>{p.bf}%</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Symmetry · left vs right" sub="watch list" attrappe={ATTRAPPE}>
          <Row label="Arms · R / L" value={`39.5 / 39.0 cm · ${(0.5).toFixed(1)} cm`} />
          <Row label="Thighs · R / L" value={`60.0 / 59.5 cm · ${(0.5).toFixed(1)} cm`} />
          <Row label="Calves · R / L" value={`39.5 / 39.0 cm · ${(0.5).toFixed(1)} cm`} />
          <div className="v2-divider" />
          <div className="v2-dim" style={{ fontSize: 11, lineHeight: 1.45 }}>
            All within 1 cm. Right-side dominance is consistent and small — within normal range for a right-handed athlete.
          </div>
        </Card>
      </div>
    </div>
  )
}

// ── COMPOSITION TAB ─────────────────────────────────────────────
// [cmd] module-goals.jsx:547-604.
//
// `[read]` **Diese Kachel rechnet echte Physiologie.** Mifflin-St Jeor
// mal Aktivitaetsfaktor — dieselbe Kette wie `goals.berechne_zielwerte`
// (GO-04). Die Eingaben stammen aus der Vorlage, nicht aus dem Profil;
// deshalb traegt sie die Marke.
function CompTab() {
  const p = COMP_PROFIL
  const { bmi, leanMass, ffmi, ffmiAdj, bmr, tdee } = compWerte(p)

  return (
    <div className="v2-grid v2-g-cols-2 v2-goals-comp">
      <Card title="Body composition calculators" sub="inputs from profile + most recent metrics" attrappe={ATTRAPPE}>
        <div className="v2-col-gap" style={{ gap: 10 }}>
          <CalcRow label="BMI" value={bmi.toFixed(1)} unit=""
                   range="Normal 18.5–24.9" status={bmi >= 18.5 && bmi <= 24.9 ? 'in' : 'watch'}
                   note="Height-adjusted weight indicator. Not useful for trained athletes — use FFMI." />
          <CalcRow label="FFMI" value={ffmi.toFixed(1)} unit="kg/m²"
                   range="18–22 natural · 22–25 advanced" status={ffmi < 25 ? 'in' : 'watch'}
                   note={`Adjusted: ${ffmiAdj.toFixed(1)} · puts you at the high end of intermediate trained.`} />
          <CalcRow label="BMR" value={bmr.toFixed(0)} unit="kcal/day"
                   range="Mifflin-St Jeor" status="info"
                   note="Basal metabolic rate. Energy used at complete rest." />
          <CalcRow label="TDEE" value={tdee.toFixed(0)} unit="kcal/day"
                   range="× 1.725 (very active)" status="info"
                   note="Total daily expenditure. Cut target ≈ 2600 kcal · maintenance 3100." />
          <CalcRow label="Lean mass" value={leanMass.toFixed(1)} unit="kg"
                   range="" status="info" note="Weight × (1 − BF%). Tracks muscle mass changes." />
          <CalcRow label="Fat mass" value={(p.weight - leanMass).toFixed(1)} unit="kg"
                   range="" status="info" note="" />
        </div>
      </Card>

      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="Body fat estimate · visual" sub="for orientation only · DXA is the ground truth" attrappe={ATTRAPPE}>
          <BodyFatScale current={p.bf} />
        </Card>
        <Card title="Energy balance · today" sub={`TDEE ${tdee.toFixed(0)} kcal`} attrappe={ATTRAPPE}>
          <div className="v2-goals-energie">
            <Ring value={1847} max={tdee} color="var(--acc-nutri)" label="kcal in" size={108} stroke={7} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Row label="Intake (so far)" value="1,847 kcal" />
              <Row label="Estimated burn" value={`${tdee.toFixed(0)} kcal`} />
              <Row label="Balance" value={`-${(tdee - 1847).toFixed(0)} kcal`} />
              <Row label="Goal context" value="cut · target -500 kcal/day" />
            </div>
          </div>
          <div className="v2-dim" style={{ fontSize: 11, lineHeight: 1.45 }}>
            On track for ~0.5 kg/wk fat loss while preserving lean mass — assuming the remaining intake stays at 850 kcal (dinner + evening snack).
          </div>
        </Card>
        <Card title="Profile · inputs" attrappe={ATTRAPPE}>
          <Row label="Sex" value={p.sex} />
          <Row label="Age" value={`${p.age} years`} />
          <Row label="Height" value={`${p.height} cm`} />
          <Row label="Weight (latest)" value={`${p.weight} kg`} />
          <Row label="Body fat (latest)" value={`${p.bf} %`} />
          <Row label="Activity factor" value={`${p.activityFactor} · very active`} />
        </Card>
      </div>
    </div>
  )
}

// [cmd] module-goals.jsx:606-621.
function CalcRow({ label, value, unit, range, status, note }: {
  label: string; value: string; unit: string; range: string
  status: 'in' | 'watch' | 'out' | 'info'; note: string
}) {
  const color = status === 'in' ? 'var(--pos)' : status === 'watch' ? 'var(--warn)'
    : status === 'out' ? 'var(--neg)' : 'var(--fg)'
  return (
    <div style={{ padding: 10, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 3, gap: 8 }}>
        <span className="v2-eyebrow">{label}</span>
        <div>
          <span className="v2-num" style={{ fontSize: 18, fontWeight: 500, color }}>{value}</span>
          <span className="v2-dim v2-mono" style={{ fontSize: 10, marginLeft: 4 }}>{unit}</span>
        </div>
      </div>
      {range && <div className="v2-dim v2-mono" style={{ fontSize: 10, marginBottom: 4 }}>{range}</div>}
      {note && <div className="v2-muted" style={{ fontSize: 11, lineHeight: 1.45 }}>{note}</div>}
    </div>
  )
}

// [cmd] module-goals.jsx:623-656.
function BodyFatScale({ current }: { current: number }) {
  const stops = [
    { label: 'Essential', from: 2, to: 5, color: 'var(--neg)' },
    { label: 'Athletic', from: 5, to: 13, color: 'var(--pos)' },
    { label: 'Fitness', from: 13, to: 17, color: 'var(--acc-recov)' },
    { label: 'Average', from: 17, to: 25, color: 'var(--warn)' },
    { label: 'High', from: 25, to: 35, color: 'var(--neg)' },
  ]
  const min = 2
  const max = 35
  const pos = ((current - min) / (max - min)) * 100
  return (
    <div>
      <div style={{ position: 'relative', height: 28, borderRadius: 4, overflow: 'hidden', display: 'flex', border: '1px solid var(--border)' }}>
        {stops.map(s => (
          <div key={s.label} style={{
            flex: s.to - s.from, background: s.color, opacity: 0.55,
            display: 'grid', placeItems: 'center', fontSize: 9.5,
            color: 'var(--bg)', fontWeight: 600, letterSpacing: '0.02em',
            fontFamily: 'var(--font-mono)',
          }}>{s.label.toUpperCase()}</div>
        ))}
        <div style={{ position: 'absolute', left: `${pos}%`, top: -4, bottom: -4, width: 2, background: 'var(--fg)', boxShadow: '0 0 0 2px var(--bg)' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 9.5, color: 'var(--fg-dim)', fontFamily: 'var(--font-mono)' }}>
        <span>2%</span><span>5%</span><span>13%</span><span>17%</span><span>25%</span><span>35%</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
        <span className="v2-num" style={{ fontSize: 22, fontWeight: 500 }}>
          {current}<span className="v2-dim" style={{ fontSize: 11, marginLeft: 2 }}>%</span>
        </span>
        <span className="v2-dim" style={{ fontSize: 11 }}>· Fitness range · 0.8% above Athletic boundary</span>
      </div>
    </div>
  )
}
