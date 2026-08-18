'use client'

// Das Training-Modul der Vorlage, uebernommen.
//
// QUELLE: theme-v1/module-training.jsx (646 Zeilen) — die Hauptdatei.
// Sie ist der Rahmen: Kopfzeile, zehn Tabs, vier eigene Ansichten
// (Today, Plan, History, Exercises) und das Live-Workout-Modal. Die
// sechs uebrigen Tabs zeigt sie ueber `window.Training*View` aus den
// drei Begleitdateien an; die stehen in `tabs-spec.tsx`,
// `tabs-offline-hr.tsx` und `modale.tsx`.
//
// `[read]` Der Auftrag: „Die Vorlage ist die Vorgabe. Struktur,
// Reihenfolge, Benennung, Anordnung kommen aus der Datei."
//
// GEAENDERT IST NUR DAS TECHNISCHE:
//   1. JSX ohne Typen -> TypeScript.
//   2. Klassen auf `v2-`-Praefix.
//   3. `window.Training*View` -> Import; `window.dispatchEvent` ->
//      React-Zustand. Ein globales Ereignis fuer ein Modal zwei
//      Komponenten weiter ist der Ersatz fuer Kontext, den die Vorlage
//      nicht hatte — hier gibt es Kontext.
//   4. Knoepfe ohne Ziel oeffnen `InEntwicklung` statt nichts zu tun.
//   5. `@media`-Haltepunkte, weil die Vorlage keine hat.
//
// NICHT geaendert: keine Kachel weggelassen, keine Zahl ersetzt, keine
// Anordnung angepasst. Die Texte bleiben englisch wie in der Vorlage —
// eingedeutscht liesse sie sich nicht mehr danebenlegen.
//
// `[cmd]` ALLES IST ATTRAPPE. `training.exercises` hat 1.416 Zeilen
// Stammdaten, aber es gibt weder `sessions` noch `sets` — es ist
// nichts anzubinden. Welche Kachel als erste echte Daten bekommen
// koennte, steht in docs/ssot/91-training-mockup.md.
import * as React from 'react'
import {
  Card, Pill, Icon, Ring, Meter, LineChart, Row, Tabs,
  InEntwicklungKnopf, type TabItem,
} from '@lumeos/ui'

import { TrainingKontext, type ModalTyp } from './kontext'
import { TrainingModale } from './modale'
import {
  TrainingProgressionView, TrainingLandmarksView,
  TrainingStandardsView, TrainingCalendarView,
} from './tabs-spec'
import { TrainingOfflineView, TrainingHRAnalysis } from './tabs-offline-hr'
import { TrainingBodyStatsCorrelation } from './tabs-extras'
// G-64: der einzige Tab mit echten Daten.
import { TrainingUebungen } from './tab-uebungen'
import type {
  Uebung, GeraeteGruppe, MuskelWurzel,
} from '../../../lib/training/uebungen-read'

/** Die Marke an jeder Kachel. Ein Satz, damit er nicht driftet. */
export const ATTRAPPE =
  'Aus dem Entwurf uebernommen. Die Zahlen sind erfunden — training.sessions ' +
  'und training.sets gibt es noch nicht.'

// [cmd] module-training.jsx:28-39, in dieser Reihenfolge.
const TABS: TabItem[] = [
  { id: 'today', label: 'Today', icon: 'zap' },
  { id: 'plan', label: 'Plan', icon: 'calendar' },
  { id: 'history', label: 'History', icon: 'trend_up' },
  // G-64: Die Zahl kommt aus dem Katalog, nicht mehr fest aus dem
  // Entwurf. `[cmd]` Der Entwurf sagte 1.200, der Katalog fuehrt 1.416.
  { id: 'library', label: 'Exercises', icon: 'layers' },
  { id: 'progress', label: 'Progression', icon: 'trend_up' },
  { id: 'landmarks', label: 'Volume landmarks', icon: 'layers' },
  { id: 'standards', label: 'Standards', icon: 'goals' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar' },
  { id: 'hrzones', label: 'HR zones', icon: 'recovery' },
  { id: 'offline', label: 'Offline sync', icon: 'wifi_off' },
]

/**
 * Die Tab-Leiste mit der echten Katalogzahl.
 *
 * `[cmd]` Der Entwurf schreibt `count: 1200` fest; der Katalog fuehrt
 * 1.416. Steht keine Zahl zur Verfuegung (kein Katalog gelesen),
 * bleibt der Tab ohne Zaehler — eine erfundene Zahl waere schlechter
 * als keine.
 */
function tabs(uebungen: number): TabItem[] {
  return TABS.map(t =>
    t.id === 'library' && uebungen > 0 ? { ...t, count: uebungen } : t)
}

export function TrainingAnsicht({
  uebungenStart = [], uebungenGesamt = 0,
  geraeteGruppen = [], disziplinen = [], muskelBaum = [],
}: {
  uebungenStart?: Uebung[]
  uebungenGesamt?: number
  geraeteGruppen?: GeraeteGruppe[]
  disziplinen?: Array<{ name: string; anzahl: number }>
  muskelBaum?: MuskelWurzel[]
} = {}) {
  const [tab, setTab] = React.useState('today')
  const [liveOpen, setLiveOpen] = React.useState(false)
  const [modal, setModal] = React.useState<{ typ: ModalTyp; nutzlast?: unknown } | null>(null)

  const kontext = React.useMemo(() => ({
    open: (typ: ModalTyp, nutzlast?: unknown) => setModal({ typ, nutzlast }),
    close: () => setModal(null),
  }), [])

  return (
    <TrainingKontext.Provider value={kontext}>
      <div className="v2-module-header v2-module-hero-lite">
        <div className="v2-module-title-block">
          <div className="v2-module-title-row">
            <span className="v2-module-title">Training</span>
            <Pill variant="acc">Block 3 · Week 2 of 5</Pill>
            {/* Die Vorlage zeigt hier `window.OfflineStatusWidget`, sonst
                diese Pille. Das Widget gibt es nicht — also die Pille. */}
            <Pill><span className="v2-dot" style={{ background: 'var(--pos)' }} /> Offline-first</Pill>
          </div>
          <div className="v2-module-sub">PPL · Hypertrophy → Strength · Coach: Anders Lindqvist</div>
        </div>
        <div className="v2-module-actions">
          <button type="button" className="v2-btn" onClick={() => kontext.open('aigen')}>
            <Icon name="zap" className="v2-ic v2-ic-sm" /> Generate
          </button>
          <button type="button" className="v2-btn" onClick={() => kontext.open('plates')}>
            <Icon name="training" className="v2-ic v2-ic-sm" /> Plates
          </button>
          <InEntwicklungKnopf titel="Library" className="v2-btn">
            <Icon name="layers" className="v2-ic v2-ic-sm" /> Library
          </InEntwicklungKnopf>
          <InEntwicklungKnopf titel="Progress" className="v2-btn">
            <Icon name="trend_up" className="v2-ic v2-ic-sm" /> Progress
          </InEntwicklungKnopf>
          <button type="button" className="v2-btn v2-btn-primary" onClick={() => setLiveOpen(true)}>
            <Icon name="play" className="v2-ic v2-ic-sm" /> Start Push B
          </button>
        </div>
      </div>

      <Tabs items={tabs(uebungenGesamt)} active={tab} onChange={setTab} />

      {tab === 'today' && <TrainingToday onStart={() => setLiveOpen(true)} />}
      {tab === 'plan' && <TrainingPlan />}
      {tab === 'history' && <TrainingHistory />}
      {tab === 'library' && (
        uebungenGesamt > 0
          ? (
            <TrainingUebungen
              start={uebungenStart}
              gesamtKatalog={uebungenGesamt}
              geraeteGruppen={geraeteGruppen}
              disziplinen={disziplinen}
              muskelBaum={muskelBaum}
            />
          )
          // Ohne Katalog bleibt der Entwurf stehen — mit seiner Marke.
          : <TrainingLibrary />
      )}
      {tab === 'progress' && <TrainingProgressionView />}
      {tab === 'landmarks' && <TrainingLandmarksView />}
      {tab === 'standards' && <TrainingStandardsView />}
      {tab === 'calendar' && <TrainingCalendarView />}
      {tab === 'hrzones' && <TrainingHRAnalysis />}
      {tab === 'offline' && <TrainingOfflineView />}

      {liveOpen && <LiveWorkout onClose={() => setLiveOpen(false)} />}
      <TrainingModale modal={modal} onClose={kontext.close} />
    </TrainingKontext.Provider>
  )
}

// --- TODAY -------------------------------------------------------
// [cmd] module-training.jsx:62-203.
function TrainingToday({ onStart }: { onStart: () => void }) {
  const session = {
    name: 'Push B',
    sub: 'Chest, Shoulders, Triceps',
    block: 'Block 3 · Wk 2',
    date: 'Tonight · 18:00',
    sets: 18,
    volume: '6.2 t',
    duration: '~74m',
    exercises: [
      { name: 'Bench Press', target: '5×5 @ 117.5kg', rir: 'RIR 2', lastSession: '5,5,5,5,4 @ 115kg', pr: true, equip: 'Barbell' },
      { name: 'Incline DB Press', target: '4×8 @ 38kg', rir: 'RIR 2', lastSession: '8,8,7,7 @ 36kg', equip: 'Dumbbell' },
      { name: 'Cable Fly', target: '3×12 @ 22kg', rir: 'RIR 1', lastSession: '12,12,11 @ 22kg', equip: 'Cable' },
      { name: 'OHP · seated', target: '4×6 @ 65kg', rir: 'RIR 2', lastSession: '6,6,5,5 @ 62.5kg', equip: 'Barbell' },
      { name: 'Lateral Raise', target: '3×15 @ 9kg', rir: 'RIR 0', lastSession: '15,14,12 @ 9kg', equip: 'Dumbbell' },
      { name: 'Triceps Pushdown', target: '3×12 @ 38kg', rir: 'RIR 1', lastSession: '12,12,10 @ 36kg', equip: 'Cable' },
      { name: 'Overhead Triceps', target: '3×10 @ 24kg', rir: 'RIR 1', lastSession: '10,10,9 @ 24kg', equip: 'Dumbbell' },
    ],
  }

  return (
    <div className="v2-grid-14">
      <div className="v2-col-gap" style={{ gap: 16 }}>
        <Card attrappe={ATTRAPPE}>
          <div className="v2-train-session-kopf">
            <div className="v2-train-medallion">
              <Icon name="training" className="v2-ic" style={{ width: 24, height: 24 }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 2 }}>{session.name}</div>
              <div className="v2-muted" style={{ fontSize: 12, marginBottom: 8 }}>{session.sub} · {session.block}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <Pill variant="acc"><Icon name="calendar" className="v2-ic v2-ic-sm" />{session.date}</Pill>
                <Pill>{session.sets} sets</Pill>
                <Pill>{session.duration}</Pill>
                <Pill>Volume {session.volume}</Pill>
              </div>
            </div>
            <button type="button" className="v2-btn v2-btn-primary" onClick={onStart}
                    style={{ height: 34, fontSize: 13 }}>
              <Icon name="play" className="v2-ic v2-ic-sm" /> Start session
            </button>
          </div>

          <div className="v2-tbl-wrap">
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th style={{ width: 28 }}>#</th>
                  <th>Exercise</th>
                  <th style={{ width: 130 }}>Target</th>
                  <th style={{ width: 60 }}>RIR</th>
                  <th>Last session</th>
                  <th style={{ width: 28 }} />
                </tr>
              </thead>
              <tbody>
                {session.exercises.map((ex, i) => (
                  <tr key={ex.name}>
                    <td className="v2-num v2-muted">{(i + 1).toString().padStart(2, '0')}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {ex.name}
                        {ex.pr && <Pill variant="pos"><Icon name="trend_up" className="v2-ic v2-ic-sm" />PR attempt</Pill>}
                      </div>
                      <div className="v2-muted" style={{ fontSize: 10, marginTop: 2 }}>{ex.equip}</div>
                    </td>
                    <td className="v2-num">{ex.target}</td>
                    <td className="v2-num v2-muted">{ex.rir}</td>
                    <td className="v2-num v2-muted" style={{ fontSize: 11 }}>{ex.lastSession}</td>
                    <td>
                      <InEntwicklungKnopf titel={`${ex.name} — Aktionen`} className="v2-icon-btn">
                        <Icon name="more" className="v2-ic v2-ic-sm" />
                      </InEntwicklungKnopf>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="This week" sub="Coach plan · 5 of 6 sessions" attrappe={ATTRAPPE}>
          <WeekStrip />
        </Card>
      </div>

      <div className="v2-col-gap" style={{ gap: 16 }}>
        <Card title="Training readiness" sub="Composite" attrappe={ATTRAPPE}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <Ring value={84} max={100} color="var(--acc-train)" label="ready" size={92} stroke={7} />
            <div style={{ flex: 1 }}>
              <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Good to go</div>
              <div style={{ fontSize: 11, color: 'var(--fg-muted)', lineHeight: 1.45 }}>
                Normal training. Focus on progressive overload — consider attempting 120kg ×3 on bench.
              </div>
            </div>
          </div>
          {([
            ['Recovery', 82, 'var(--acc-recov)'],
            ['Sleep quality', 84, 'var(--acc-recov)'],
            ['Soreness — chest', 78, 'var(--acc-train)'],
            ['Nutrition', 88, 'var(--acc-nutri)'],
            ['Mood', 90, 'var(--acc-buddy)'],
          ] as Array<[string, number, string]>).map(([k, v, c]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, marginBottom: 6 }}>
              <span style={{ width: 110, color: 'var(--fg-muted)' }}>{k}</span>
              <div style={{ flex: 1 }}><Meter value={v} color={c} /></div>
              <span className="v2-num" style={{ width: 28, textAlign: 'right' }}>{v}</span>
            </div>
          ))}
        </Card>

        <Card title="Weekly volume" sub="Sets per muscle · target band" attrappe={ATTRAPPE}>
          <div className="v2-col-gap" style={{ gap: 8 }}>
            {[
              { m: 'Chest', done: 14, target: 16, color: 'var(--acc-train)' },
              { m: 'Back', done: 18, target: 18, color: 'var(--acc-train)' },
              { m: 'Shoulders', done: 10, target: 14, color: 'var(--acc-train)' },
              { m: 'Quads', done: 18, target: 16, color: 'var(--pos)' },
              { m: 'Hamstrings', done: 9, target: 12, color: 'var(--acc-train)' },
              { m: 'Arms', done: 14, target: 14, color: 'var(--acc-train)' },
            ].map(v => (
              <div key={v.m} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 64px', gap: 10, alignItems: 'center', fontSize: 11 }}>
                <span style={{ color: 'var(--fg-muted)' }}>{v.m}</span>
                <div style={{ position: 'relative', height: 14, background: 'var(--surface-2)', borderRadius: 3 }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.min((v.done / 24) * 100, 100)}%`, background: v.color, opacity: 0.85, borderRadius: 3 }} />
                  <div style={{ position: 'absolute', left: `${(v.target / 24) * 100}%`, top: -2, bottom: -2, width: 1, background: 'var(--fg)' }} />
                </div>
                <span className="v2-num" style={{ textAlign: 'right', fontSize: 11 }}>
                  {v.done}<span className="v2-dim"> / {v.target}</span>
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Streak" sub="last 12 weeks" attrappe={ATTRAPPE}>
          <StreakHeatmap />
        </Card>
      </div>
    </div>
  )
}

// [cmd] module-training.jsx:205-246.
function WeekStrip() {
  const week = [
    { day: 'Mon', date: 12, session: 'Pull A', state: 'done', volume: '5.4t', pr: 0 },
    { day: 'Tue', date: 13, session: 'Push A', state: 'done', volume: '4.9t', pr: 1 },
    { day: 'Wed', date: 14, session: 'Legs A', state: 'done', volume: '7.2t', pr: 0 },
    { day: 'Thu', date: 15, session: 'Rest', state: 'rest' },
    { day: 'Fri', date: 16, session: 'Push B', state: 'today', volume: '6.2t plan' },
    { day: 'Sat', date: 17, session: 'Pull B', state: 'planned' },
    { day: 'Sun', date: 18, session: 'Legs B', state: 'planned' },
  ] as Array<{ day: string; date: number; session: string; state: string; volume?: string; pr?: number }>
  return (
    <div className="v2-train-week">
      {week.map(d => (
        <div key={d.date} style={{
          padding: 10,
          background: d.state === 'today'
            ? 'color-mix(in oklch, var(--acc-train) 10%, var(--surface))'
            : 'var(--surface)',
          border: `1px solid ${d.state === 'today' ? 'color-mix(in oklch, var(--acc-train) 40%, var(--border))' : 'var(--border)'}`,
          borderRadius: 6,
          fontSize: 11,
          minHeight: 80,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: 'var(--fg-muted)' }}>{d.day}</span>
            <span className="v2-num" style={{ color: 'var(--fg-dim)' }}>{d.date}</span>
          </div>
          <div style={{
            fontSize: 12, fontWeight: 500, marginBottom: 4,
            color: d.state === 'today' ? 'var(--acc-train)' : d.state === 'rest' ? 'var(--fg-dim)' : 'var(--fg)',
          }}>{d.session}</div>
          {d.state === 'done' && (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: 10 }}>
              <Icon name="check" className="v2-ic v2-ic-sm" style={{ color: 'var(--pos)', width: 10, height: 10 }} />
              <span className="v2-num v2-dim">{d.volume}</span>
              {(d.pr ?? 0) > 0 && <Pill variant="pos" style={{ padding: '0 4px' }}>PR</Pill>}
            </div>
          )}
          {d.state === 'today' && <div className="v2-num v2-dim" style={{ fontSize: 10 }}>{d.volume}</div>}
          {d.state === 'rest' && <div className="v2-dim" style={{ fontSize: 10 }}>—</div>}
        </div>
      ))}
    </div>
  )
}

// [cmd] module-training.jsx:248-282. Die Pseudodaten-Formel bleibt.
function StreakHeatmap() {
  const weeks = 12
  const days = 7
  const data = Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: days }, (_, d) => {
      if (d === 3) return 0
      const r = ((w * 7 + d) * 17) % 100 / 100
      return r > 0.35 ? Math.min(1, r + 0.2) : 0
    }))
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${weeks}, 1fr)`, gap: 3 }}>
        {data.map((week, wi) => (
          <div key={wi} style={{ display: 'grid', gridTemplateRows: `repeat(${days}, 1fr)`, gap: 3 }}>
            {week.map((v, di) => (
              <div key={di} style={{
                height: 10,
                background: v > 0 ? 'var(--acc-train)' : 'var(--surface-2)',
                opacity: v > 0 ? 0.3 + v * 0.7 : 1,
                borderRadius: 2,
              }} title={`Week ${wi + 1}, day ${di + 1}`} />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: 'var(--fg-dim)' }}>
        <span className="v2-num">12 wks ago</span>
        <span className="v2-num">this week</span>
      </div>
    </div>
  )
}

// --- PLAN --------------------------------------------------------
// [cmd] module-training.jsx:285-350. Die Vorlage schiebt hier zuerst
// `window.PeriodizationFullView` ein — die Komponente gibt es in
// keiner der vier Dateien; sie faellt darum aus (Bericht, Abschnitt
// „Was die vier Vorlagendateien enthalten").
function TrainingPlan() {
  const t = React.useContext(TrainingKontext)
  return (
    <div className="v2-grid v2-g-cols-2">
      <Card
        title="Mesocycle · Block 3" sub="May 5 — Jun 8 · 5 weeks"
        attrappe={ATTRAPPE}
        actions={
          <button type="button" className="v2-btn v2-btn-ghost"
                  style={{ height: 22, fontSize: 11, padding: '0 8px' }}
                  onClick={() => t?.open('blockEditor', { name: 'Block 3' })}>
            <Icon name="edit" className="v2-ic v2-ic-sm" />Edit block
          </button>
        }
      >
        <div className="v2-col-gap">
          {[
            { wk: 'Week 1', focus: 'Volume accumulation', state: 'Complete', load: '84%' },
            { wk: 'Week 2', focus: 'Volume accumulation', state: 'Current', load: '92%' },
            { wk: 'Week 3', focus: 'Intensification', state: 'Planned', load: '96%' },
            { wk: 'Week 4', focus: 'Peak intensity', state: 'Planned', load: '100%' },
            { wk: 'Week 5', focus: 'Deload', state: 'Planned', load: '55%' },
          ].map(w => (
            <div key={w.wk} style={{
              padding: 12, borderRadius: 6,
              background: w.state === 'Current' ? 'color-mix(in oklch, var(--acc-train) 8%, var(--surface))' : 'var(--surface)',
              border: `1px solid ${w.state === 'Current' ? 'color-mix(in oklch, var(--acc-train) 30%, var(--border))' : 'var(--border)'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{w.wk}</span>
                {w.state === 'Current' && <Pill variant="acc">Now</Pill>}
                <span className="v2-muted" style={{ fontSize: 11, marginLeft: 'auto' }}>
                  load <span className="v2-num">{w.load}</span>
                </span>
              </div>
              <div className="v2-muted" style={{ fontSize: 11, marginBottom: 6 }}>{w.focus}</div>
              <Meter value={parseInt(w.load, 10)}
                     color={w.state === 'Current' ? 'var(--acc-train)' : w.state === 'Complete' ? 'var(--pos)' : 'var(--fg-dim)'} />
            </div>
          ))}
        </div>
      </Card>

      <Card
        title="Routines" sub="6 total"
        attrappe={ATTRAPPE}
        actions={
          <>
            <button type="button" className="v2-btn v2-btn-ghost"
                    style={{ height: 22, fontSize: 11, padding: '0 8px' }}
                    onClick={() => t?.open('assignWeek')}>
              <Icon name="calendar" className="v2-ic v2-ic-sm" />Assign week
            </button>
            <button type="button" className="v2-btn v2-btn-primary"
                    style={{ height: 22, fontSize: 11, padding: '0 8px' }}
                    onClick={() => t?.open('routineEditor', null)}>
              <Icon name="plus" className="v2-ic v2-ic-sm" />New
            </button>
          </>
        }
      >
        <div className="v2-col-gap">
          {[
            { name: 'Push A — Heavy', ex: 7, sets: 22, vol: '≈ 6.8 t', origin: 'coach' },
            { name: 'Push B — Volume', ex: 7, sets: 24, vol: '≈ 6.2 t', origin: 'coach', active: true },
            { name: 'Pull A — Heavy', ex: 7, sets: 22, vol: '≈ 7.4 t', origin: 'coach' },
            { name: 'Pull B — Volume', ex: 7, sets: 24, vol: '≈ 6.9 t', origin: 'coach' },
            { name: 'Legs A — Squat focus', ex: 8, sets: 24, vol: '≈ 9.8 t', origin: 'coach' },
            { name: 'Mobility & Core', ex: 6, sets: 18, vol: '≈ 0', origin: 'self' },
          ].map(r => (
            <div key={r.name} style={{
              padding: 12, borderRadius: 6,
              border: '1px solid var(--border)',
              background: r.active ? 'color-mix(in oklch, var(--acc-train) 5%, var(--surface))' : 'var(--surface)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</span>
                  {r.active && <Pill variant="acc">Today</Pill>}
                  {r.origin === 'coach'
                    ? <Pill><Icon name="coach" className="v2-ic v2-ic-sm" />Coach</Pill>
                    : <Pill>Self</Pill>}
                </div>
                <div className="v2-muted v2-num" style={{ fontSize: 11, marginTop: 3 }}>
                  {r.ex} exercises · {r.sets} sets · {r.vol}
                </div>
              </div>
              <button type="button" className="v2-icon-btn" aria-label={`${r.name} bearbeiten`}
                      onClick={() => t?.open('routineEditor', r)}>
                <Icon name="edit" className="v2-ic v2-ic-sm" />
              </button>
              <InEntwicklungKnopf titel={`${r.name} duplizieren`} className="v2-icon-btn">
                <Icon name="copy" className="v2-ic v2-ic-sm" />
              </InEntwicklungKnopf>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// --- HISTORY -----------------------------------------------------
// [cmd] module-training.jsx:353-436.
function TrainingHistory() {
  const lifts = ['Bench Press', 'Squat', 'Deadlift', 'OHP']
  const [active, setActive] = React.useState(lifts[0])
  return (
    <div className="v2-grid-21">
      <Card
        title={`${active} · e1RM progression`}
        sub="last 12 weeks"
        attrappe={ATTRAPPE}
        actions={
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {lifts.map(l => (
              <button key={l} type="button"
                      className={`v2-btn ${l === active ? 'v2-btn-accent' : 'v2-btn-ghost'}`}
                      style={{ height: 22, fontSize: 11, padding: '0 8px' }}
                      onClick={() => setActive(l)}>{l}</button>
            ))}
          </div>
        }
      >
        <LineChart
          h={220}
          series={[{ data: [102, 105, 105, 107.5, 110, 112.5, 110, 115, 117.5, 117.5, 120, 122.5], color: 'var(--acc-train)' }]}
          xLabels={['', '', '', 'Mar', '', '', '', 'Apr', '', '', '', 'May']}
          range={[95, 130]}
        />
        <div style={{ display: 'flex', gap: 24, marginTop: 10, fontSize: 11, color: 'var(--fg-muted)', flexWrap: 'wrap' }}>
          <div>Current e1RM <span className="v2-num" style={{ color: 'var(--fg)', fontSize: 14, marginLeft: 4 }}>122.5kg</span></div>
          <div>12wk gain <span className="v2-num" style={{ color: 'var(--pos)', fontSize: 14, marginLeft: 4 }}>+20kg</span></div>
          <div>Avg per session <span className="v2-num" style={{ color: 'var(--fg)', fontSize: 14, marginLeft: 4 }}>5,840kg</span></div>
        </div>
      </Card>

      <Card title="Recent sessions" attrappe={ATTRAPPE}>
        <div className="v2-col-gap">
          {[
            { date: 'Wed May 14', name: 'Legs A', vol: '7.2 t', dur: '82m', pr: 0 },
            { date: 'Tue May 13', name: 'Push A', vol: '4.9 t', dur: '68m', pr: 1 },
            { date: 'Mon May 12', name: 'Pull A', vol: '5.4 t', dur: '71m', pr: 0 },
            { date: 'Sat May 10', name: 'Push B', vol: '6.1 t', dur: '74m', pr: 0 },
            { date: 'Fri May 9', name: 'Pull B', vol: '6.7 t', dur: '76m', pr: 1 },
          ].map((s, i) => (
            <div key={s.date} style={{ padding: '10px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 12, fontWeight: 500 }}>{s.name}</span>
                {s.pr > 0 && <Pill variant="pos">PR</Pill>}
                <span className="v2-num v2-dim" style={{ fontSize: 10, marginLeft: 'auto' }}>{s.date}</span>
              </div>
              <div className="v2-num v2-muted" style={{ fontSize: 11 }}>{s.vol} volume · {s.dur}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Volume by muscle · 4 wks" attrappe={ATTRAPPE} className="v2-span-2">
        <div className="v2-train-vol-tbl">
          <div className="v2-eyebrow">Muscle</div>
          <div className="v2-eyebrow">Distribution</div>
          <div className="v2-eyebrow" style={{ textAlign: 'right' }}>Sets</div>
          <div className="v2-eyebrow" style={{ textAlign: 'right' }}>Volume</div>
          <div className="v2-eyebrow" style={{ textAlign: 'right' }}>Δ vs prev</div>
          {[
            { m: 'Chest', sets: 56, vol: '22.8 t', delta: '+8%', deltaPos: true },
            { m: 'Back', sets: 72, vol: '28.4 t', delta: '+12%', deltaPos: true },
            { m: 'Shoulders', sets: 40, vol: '8.6 t', delta: '-4%', deltaPos: false },
            { m: 'Biceps', sets: 32, vol: '5.2 t', delta: '+2%', deltaPos: true },
            { m: 'Triceps', sets: 36, vol: '7.1 t', delta: '+6%', deltaPos: true },
            { m: 'Quads', sets: 64, vol: '32.4 t', delta: '+18%', deltaPos: true },
            { m: 'Hamstrings', sets: 36, vol: '14.2 t', delta: '+4%', deltaPos: true },
            { m: 'Glutes', sets: 40, vol: '18.8 t', delta: '+9%', deltaPos: true },
          ].map(v => (
            <React.Fragment key={v.m}>
              <div style={{ fontSize: 12 }}>{v.m}</div>
              <div><Meter value={parseFloat(v.vol)} max={35} color="var(--acc-train)" /></div>
              <div className="v2-num" style={{ textAlign: 'right', fontSize: 12 }}>{v.sets}</div>
              <div className="v2-num" style={{ textAlign: 'right', fontSize: 12 }}>{v.vol}</div>
              <div className="v2-num" style={{ textAlign: 'right', fontSize: 12, color: v.deltaPos ? 'var(--pos)' : 'var(--neg)' }}>{v.delta}</div>
            </React.Fragment>
          ))}
        </div>
      </Card>

      <div className="v2-span-2"><TrainingBodyStatsCorrelation /></div>
    </div>
  )
}

// --- LIBRARY -----------------------------------------------------
// [cmd] module-training.jsx:439-508.
function TrainingLibrary() {
  const t = React.useContext(TrainingKontext)
  const exercises = [
    { n: 'Bench Press · Barbell', eq: 'Barbell', musc: ['Chest', 'Triceps', 'Front Delt'], type: 'Compound', e1rm: '122.5kg', best: '120kg ×3' },
    { n: 'Squat · Back', eq: 'Barbell', musc: ['Quads', 'Glutes', 'Hamstrings'], type: 'Compound', e1rm: '165kg', best: '160kg ×3' },
    { n: 'Deadlift · Conventional', eq: 'Barbell', musc: ['Hamstrings', 'Glutes', 'Back'], type: 'Compound', e1rm: '192kg', best: '185kg ×1' },
    { n: 'Overhead Press', eq: 'Barbell', musc: ['Front Delt', 'Triceps'], type: 'Compound', e1rm: '72.5kg', best: '70kg ×2' },
    { n: 'Pull-up · Weighted', eq: 'Bodyweight', musc: ['Lats', 'Biceps'], type: 'Compound', e1rm: 'BW+34kg', best: '+30kg ×5' },
    { n: 'Incline DB Press', eq: 'Dumbbell', musc: ['Chest', 'Front Delt'], type: 'Compound', e1rm: '44kg', best: '42kg ×6' },
    { n: 'Romanian DL', eq: 'Barbell', musc: ['Hamstrings', 'Glutes'], type: 'Compound', e1rm: '150kg', best: '140kg ×5' },
    { n: 'Lateral Raise', eq: 'Dumbbell', musc: ['Side Delt'], type: 'Isolation', e1rm: '—', best: '12kg ×12' },
    { n: 'Cable Fly · Mid', eq: 'Cable', musc: ['Chest'], type: 'Isolation', e1rm: '—', best: '24kg ×12' },
    { n: 'Triceps Pushdown', eq: 'Cable', musc: ['Triceps'], type: 'Isolation', e1rm: '—', best: '42kg ×10' },
  ]
  return (
    <div>
      <div className="v2-train-lib-filter">
        <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
          <Icon name="search" className="v2-ic v2-ic-sm"
                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-subtle)' }} />
          <input
            aria-label="Search exercises"
            placeholder="Search 1,200 exercises · barbell, dumbbell, machine, bodyweight, cable…"
            style={{
              width: '100%', height: 32, background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '0 12px 0 30px', fontSize: 12, outline: 'none', color: 'var(--fg)',
            }}
          />
        </div>
        <select className="v2-btn" aria-label="Equipment" style={{ padding: '0 10px' }}>
          <option>All equipment</option><option>Barbell</option><option>Dumbbell</option><option>Cable</option>
        </select>
        <select className="v2-btn" aria-label="Muscles" style={{ padding: '0 10px' }}>
          <option>All muscles</option>
        </select>
        <button type="button" className="v2-btn v2-btn-primary" onClick={() => t?.open('customExercise')}>
          <Icon name="plus" className="v2-ic v2-ic-sm" /> Custom
        </button>
      </div>
      <Card attrappe={ATTRAPPE}>
        <div className="v2-tbl-wrap">
          <table className="v2-tbl">
            <thead>
              <tr>
                <th>Exercise</th>
                <th style={{ width: 90 }}>Equipment</th>
                <th>Muscles</th>
                <th style={{ width: 80 }}>Type</th>
                <th style={{ width: 80, textAlign: 'right' }}>e1RM</th>
                <th style={{ width: 100, textAlign: 'right' }}>Best set</th>
                <th style={{ width: 28 }} />
              </tr>
            </thead>
            <tbody>
              {exercises.map(ex => (
                <tr key={ex.n} style={{ cursor: 'pointer' }} onClick={() => t?.open('exerciseDetail', ex)}>
                  <td style={{ fontWeight: 500 }}>{ex.n}</td>
                  <td className="v2-muted">{ex.eq}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {ex.musc.map(m => <Pill key={m}>{m}</Pill>)}
                    </div>
                  </td>
                  <td className="v2-muted">{ex.type}</td>
                  <td className="v2-num" style={{ textAlign: 'right' }}>{ex.e1rm}</td>
                  <td className="v2-num v2-muted" style={{ textAlign: 'right', fontSize: 11 }}>{ex.best}</td>
                  <td>
                    <button type="button" className="v2-icon-btn" aria-label={`${ex.n} oeffnen`}
                            onClick={e => { e.stopPropagation(); t?.open('exerciseDetail', ex) }}>
                      <Icon name="more" className="v2-ic v2-ic-sm" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// --- LIVE WORKOUT MODAL ------------------------------------------
// [cmd] module-training.jsx:511-627.
function LiveWorkout({ onClose }: { onClose: () => void }) {
  const t = React.useContext(TrainingKontext)
  const [restTime, setRestTime] = React.useState(0)
  const [running, setRunning] = React.useState(false)
  const [sets, setSets] = React.useState([
    { weight: 115, reps: 5, rir: 2, done: true },
    { weight: 117.5, reps: 5, rir: 2, done: true },
    { weight: 117.5, reps: 5, rir: 1, done: true },
    { weight: 117.5, reps: 0, rir: 0, done: false },
    { weight: 117.5, reps: 0, rir: 0, done: false },
  ])

  React.useEffect(() => {
    if (!running) return
    const id = setInterval(() => setRestTime(x => x + 1), 1000)
    return () => clearInterval(id)
  }, [running])

  // Escape schliesst — wie in `InEntwicklung`, sonst ist das Modal per
  // Tastatur eine Sackgasse. Die Vorlage hat das nicht.
  React.useEffect(() => {
    const auf = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', auf)
    return () => window.removeEventListener('keydown', auf)
  }, [onClose])

  const ex = {
    name: 'Bench Press · Barbell',
    target: '5×5 @ 117.5kg · RIR 2',
    last: 'Tue May 13 — 5,5,5,5,4 @ 115kg',
  }
  const fmt = (x: number) => `${Math.floor(x / 60)}:${(x % 60).toString().padStart(2, '0')}`
  const naechster = sets.findIndex(x => !x.done)

  return (
    <div className="v2-modal-veil" onClick={onClose} role="presentation">
      <div className="v2-modal" style={{ width: 640, maxWidth: '92vw' }}
           role="dialog" aria-modal="true" aria-label="Live · Push B"
           onClick={e => e.stopPropagation()}>
        <div className="v2-modal-h" style={{ background: 'color-mix(in oklch, var(--acc-train) 12%, var(--bg-elev))' }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: 'color-mix(in oklch, var(--acc-train) 22%, transparent)',
            display: 'grid', placeItems: 'center', color: 'var(--acc-train)', flexShrink: 0,
          }}>
            <Icon name="training" className="v2-ic" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Live · Push B</div>
            <div className="v2-dim" style={{ fontSize: 11 }}>
              <Icon name="wifi_off" className="v2-ic v2-ic-sm"
                    style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
              Offline · synced when online · 04:18 elapsed
            </div>
          </div>
          <Pill variant="acc">Exercise 1 of 7</Pill>
          <button type="button" className="v2-icon-btn" onClick={onClose} aria-label="Schliessen">
            <Icon name="x" className="v2-ic" />
          </button>
        </div>
        <div className="v2-modal-body" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 16, fontWeight: 600 }}>{ex.name}</span>
              <Pill variant="pos"><Icon name="trend_up" className="v2-ic v2-ic-sm" />PR attempt</Pill>
            </div>
            <div className="v2-num v2-muted" style={{ fontSize: 11, marginBottom: 12 }}>
              Target: <span style={{ color: 'var(--fg)' }}>{ex.target}</span> · Last: {ex.last}
            </div>
            <div className="v2-tbl-wrap">
              <table className="v2-tbl">
                <thead>
                  <tr>
                    <th style={{ width: 30 }}>Set</th>
                    <th style={{ textAlign: 'right' }}>Weight</th>
                    <th style={{ textAlign: 'right' }}>Reps</th>
                    <th style={{ textAlign: 'right' }}>RIR</th>
                    <th style={{ width: 40 }} />
                  </tr>
                </thead>
                <tbody>
                  {sets.map((s, i) => (
                    <tr key={i} style={{ opacity: s.done || i === naechster ? 1 : 0.5 }}>
                      <td className="v2-num">{i + 1}</td>
                      <td className="v2-num" style={{ textAlign: 'right' }}>
                        {s.weight}<span className="v2-dim" style={{ fontSize: 10 }}> kg</span>
                      </td>
                      <td className="v2-num" style={{ textAlign: 'right' }}>{s.reps || '—'}</td>
                      <td className="v2-num v2-muted" style={{ textAlign: 'right' }}>{s.done ? s.rir : '—'}</td>
                      <td>
                        {s.done ? (
                          <Icon name="check" className="v2-ic v2-ic-sm" style={{ color: 'var(--pos)' }} />
                        ) : i === naechster ? (
                          <button
                            type="button" className="v2-btn v2-btn-accent"
                            style={{ height: 22, fontSize: 10, padding: '0 6px' }}
                            onClick={() => {
                              setSets(prev => prev.map((x, j) => j === i ? { ...x, reps: 5, rir: 1, done: true } : x))
                              setRestTime(0)
                              setRunning(true)
                            }}
                          >Log</button>
                        ) : (
                          <span className="v2-dim">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="v2-train-rest">
            <div style={{ flex: 1 }}>
              <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Rest timer</div>
              <div className="v2-num" style={{ fontSize: 36, lineHeight: 1, fontWeight: 500 }}>{fmt(restTime)}</div>
              <div className="v2-dim" style={{ fontSize: 11, marginTop: 4 }}>target 3:00 · auto-start after log</div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button type="button" className="v2-btn" onClick={() => setRunning(r => !r)}>
                <Icon name={running ? 'pause' : 'play'} className="v2-ic v2-ic-sm" /> {running ? 'Pause' : 'Start'}
              </button>
              <button type="button" className="v2-btn v2-btn-ghost" onClick={() => setRestTime(0)}>Reset</button>
              <button type="button" className="v2-btn v2-btn-ghost" onClick={() => t?.open('warmup')}>
                <Icon name="flame" className="v2-ic v2-ic-sm" />Warm-up
              </button>
            </div>
          </div>
          {/* Die Vorlage zeigt hier `window.HeartRateWidget`. Die
              Komponente gibt es in keiner der vier Dateien — der HR-Teil
              steht als eigener Tab („HR zones"). */}
        </div>
        <div className="v2-modal-f">
          <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Save &amp; exit</button>
          <div className="v2-spacer" />
          <InEntwicklungKnopf titel="Previous" className="v2-btn">Previous</InEntwicklungKnopf>
          <InEntwicklungKnopf titel="Next exercise" className="v2-btn v2-btn-primary">
            Next exercise <Icon name="arrow_right" className="v2-ic v2-ic-sm" />
          </InEntwicklungKnopf>
        </div>
      </div>
    </div>
  )
}
