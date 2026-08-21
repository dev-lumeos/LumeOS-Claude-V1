'use client'

// Die neun Modale des Training-Moduls.
//
// QUELLEN:
//   theme-v1/module-training-extras.jsx:53-438 — TModal, TField,
//     TInput und sechs Modale (Routine editor, Exercise detail,
//     Custom exercise, Block editor, Assign week, Superset editor).
//   theme-v1/module-training-spec.jsx:399-606 — drei Rechner-Modale
//     (Plate calculator, Warm-up calculator, AI workout generator).
//
// GEAENDERT IST NUR DAS TECHNISCHE: TypeScript, `v2-`-Praefix,
// `color-mix(in srgb, …)` -> `in oklch`, Escape schliesst, und die
// Eingabefelder der Vorlage bekommen `onChange` bzw. `defaultValue` —
// React warnt sonst bei jedem gesteuerten Feld ohne Handler.
//
// `[read]` Die Rechner sind KEINE Attrappen im engeren Sinn: Plate und
// Warm-up rechnen wirklich, mit den Formeln der Vorlage. Sie rechnen
// nur nicht mit echten Trainingsdaten — das Zielgewicht gibt man
// selbst ein. Deshalb tragen sie keine Marke: es gibt nichts
// anzubinden, was sie zeigen wuerden.
import * as React from 'react'
import { Card, Pill, Icon, Row, LineChart, InEntwicklungKnopf } from '@lumeos/ui'

import type { ModalTyp } from './kontext'

// ── Der Rahmen ──────────────────────────────────────────────────
// [cmd] module-training-extras.jsx:53-86.
function TModal({
  title, subtitle, eyebrow, accent, onClose, footer, children, width = 640,
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
           role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : undefined}
           onClick={e => e.stopPropagation()}>
        <div className="v2-modal-h">
          {eyebrow && (
            <div style={{
              width: 26, height: 26, borderRadius: 6, flexShrink: 0,
              background: `color-mix(in oklch, ${accent ?? 'var(--acc-train)'} 18%, transparent)`,
              border: `1px solid color-mix(in oklch, ${accent ?? 'var(--acc-train)'} 35%, transparent)`,
              color: accent ?? 'var(--acc-train)', display: 'grid', placeItems: 'center',
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

// [cmd] module-training-extras.jsx:77-86.
function TField({ label, sub, children }: {
  label: React.ReactNode; sub?: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
        <label className="v2-eyebrow">{label}</label>
        {sub && <span className="v2-dim" style={{ fontSize: 10 }}>{sub}</span>}
      </div>
      {children}
    </div>
  )
}

const FELD: React.CSSProperties = {
  width: '100%', height: 28, background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 5, padding: '0 8px', fontSize: 11.5, outline: 'none', color: 'var(--fg)',
}

function TInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...FELD, ...(props.style ?? {}) }} />
}

function TSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} style={{ ...FELD, ...(props.style ?? {}) }} />
}

// ── Die Verteilung ──────────────────────────────────────────────
export function TrainingModale({ modal, onClose }: {
  modal: { typ: ModalTyp; nutzlast?: unknown } | null
  onClose: () => void
}) {
  if (!modal) return null
  switch (modal.typ) {
    case 'routineEditor': return <RoutineEditorModal routine={modal.nutzlast as Routine | null} onClose={onClose} />
    case 'exerciseDetail': return <ExerciseDetailModal exercise={modal.nutzlast as ExerciseDetail | null} onClose={onClose} />
    case 'customExercise': return <CustomExerciseModal onClose={onClose} />
    case 'blockEditor': return <BlockEditorModal onClose={onClose} />
    case 'assignWeek': return <AssignWeekModal onClose={onClose} />
    case 'supersetEdit': return <SupersetEditorModal onClose={onClose} />
    case 'plates': return <PlateCalculatorModal onClose={onClose} />
    case 'warmup': return <WarmupCalculatorModal onClose={onClose} />
    case 'aigen': return <AIWorkoutGenModal onClose={onClose} />
    default: return null
  }
}

// ── ROUTINE EDITOR ──────────────────────────────────────────────
// [cmd] module-training-extras.jsx:89-181.
type UebungZeile = {
  name: string; target: string; rir: string; restSec: number
  group: string | null; equip: string
}
type Routine = { name: string; origin: string; exercises?: UebungZeile[] }

/**
 * [cmd] module-training-extras.jsx:7-30 (`ROUTINE_TEMPLATES`). Die
 * Vorlage fuehrt zwei Vorlagen mit Supersaetzen; „Push A" traegt die
 * Gruppen A und B. Der Editor oeffnet ohne Nutzlast eine leere Routine.
 */
const PUSH_A_UEBUNGEN: UebungZeile[] = [
  { name: 'Bench Press · Barbell', target: '5×5 @ 117.5kg', rir: 'RIR 2', restSec: 180, group: null, equip: 'Barbell' },
  { name: 'Incline DB Press', target: '4×8 @ 38kg', rir: 'RIR 2', restSec: 120, group: null, equip: 'Dumbbell' },
  { name: 'OHP · seated', target: '4×6 @ 65kg', rir: 'RIR 2', restSec: 180, group: null, equip: 'Barbell' },
  { name: 'Cable Fly', target: '3×12 @ 22kg', rir: 'RIR 1', restSec: 90, group: 'A', equip: 'Cable' },
  { name: 'Triceps Pushdown', target: '3×12 @ 38kg', rir: 'RIR 1', restSec: 90, group: 'A', equip: 'Cable' },
  { name: 'Lateral Raise', target: '3×15 @ 9kg', rir: 'RIR 0', restSec: 60, group: 'B', equip: 'Dumbbell' },
  { name: 'Overhead Triceps Ext.', target: '3×10 @ 24kg', rir: 'RIR 1', restSec: 60, group: 'B', equip: 'Dumbbell' },
]

function RoutineEditorModal({ routine, onClose }: { routine: Routine | null; onClose: () => void }) {
  const [r, setR] = React.useState<Required<Routine>>({
    name: routine?.name ?? 'New routine',
    origin: routine?.origin ?? 'self',
    // Ohne Nutzlast waere die Liste leer und der Editor zeigte nichts.
    // Die Vorlage traf hier auf `ROUTINE_TEMPLATES`; das ist der Satz
    // mit den Supersaetzen, an dem die Gruppierung sichtbar wird.
    exercises: routine?.exercises ?? PUSH_A_UEBUNGEN,
  })

  const upd = (k: 'name', v: string) => setR(s => ({ ...s, [k]: v }))
  const updEx = (i: number, k: keyof UebungZeile, v: string) =>
    setR(s => ({ ...s, exercises: s.exercises.map((e, j) => j === i ? { ...e, [k]: v } : e) }))
  const moveEx = (i: number, dir: number) => {
    const j = i + dir
    if (j < 0 || j >= r.exercises.length) return
    const next = [...r.exercises]
    const a = next[i]
    next[i] = next[j]
    next[j] = a
    setR(s => ({ ...s, exercises: next }))
  }
  const delEx = (i: number) => setR(s => ({ ...s, exercises: s.exercises.filter((_, j) => j !== i) }))
  const addEx = () => setR(s => ({
    ...s,
    exercises: [...s.exercises, { name: 'Bench Press', target: '3×8 @ 80kg', rir: 'RIR 2', restSec: 120, group: null, equip: 'Barbell' }],
  }))

  // [cmd] module-training-extras.jsx:104-113 — nach Superset gruppiert.
  const grouped: Array<{ group: string | null; items: Array<UebungZeile & { _idx: number }> }> = []
  let lastGroup: string | null = null
  r.exercises.forEach((ex, i) => {
    if (ex.group && ex.group === lastGroup) {
      grouped[grouped.length - 1].items.push({ ...ex, _idx: i })
    } else {
      grouped.push({ group: ex.group, items: [{ ...ex, _idx: i }] })
      lastGroup = ex.group
    }
  })

  // [cmd] module-training-extras.jsx:159 — die Schaetzung der Vorlage.
  const saetze = r.exercises.reduce((s, e) => s + (parseInt(e.target.split('×')[0], 10) || 3), 0)

  return (
    <TModal title={`Routine editor · ${r.name}`}
            subtitle="Drag, supersets, rest timers · saves to your plan"
            eyebrow="edit" onClose={onClose} width={780}
            footer={
              <>
                <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Cancel</button>
                <InEntwicklungKnopf titel="Save as template" className="v2-btn">
                  <Icon name="copy" className="v2-ic v2-ic-sm" />Save as template
                </InEntwicklungKnopf>
                <InEntwicklungKnopf titel="Save routine" className="v2-btn v2-btn-primary"
                                    grund="training.routines gibt es noch nicht.">
                  <Icon name="check" className="v2-ic v2-ic-sm" />Save routine
                </InEntwicklungKnopf>
              </>
            }>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
        <TField label="Routine name">
          <TInput value={r.name} onChange={e => upd('name', e.target.value)} />
        </TField>
        <TField label="Block">
          <TSelect defaultValue="Block 3 · current">
            <option>Block 3 · current</option><option>Block 4</option><option>None</option>
          </TSelect>
        </TField>
        <TField label="Origin">
          <TSelect defaultValue="Self"><option>Self</option><option>Coach</option><option>Marketplace</option></TSelect>
        </TField>
      </div>

      <div className="v2-eyebrow" style={{ marginTop: 6, marginBottom: 8 }}>
        Exercises · drag to reorder · group with shift-click for superset
      </div>
      <div className="v2-col-gap" style={{ gap: 4 }}>
        {grouped.map((g, gi) => (
          <div key={g.group ?? `solo-${gi}`} style={{
            padding: g.group ? 8 : 0,
            background: g.group ? 'color-mix(in oklch, var(--acc-train) 6%, var(--surface))' : 'transparent',
            border: g.group ? '1px solid color-mix(in oklch, var(--acc-train) 25%, var(--border))' : 'none',
            borderRadius: 6,
          }}>
            {g.group && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                <Pill variant="acc">Superset {g.group}</Pill>
                <span className="v2-dim" style={{ fontSize: 10.5 }}>back-to-back · single rest after final exercise</span>
              </div>
            )}
            <div className="v2-col-gap" style={{ gap: 4 }}>
              {g.items.map(ex => (
                <ExerciseEditorRow key={ex._idx} ex={ex} idx={ex._idx}
                                   updEx={updEx} moveEx={moveEx} delEx={delEx} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
        <button type="button" className="v2-btn" onClick={addEx}>
          <Icon name="plus" className="v2-ic v2-ic-sm" />Add exercise
        </button>
        <InEntwicklungKnopf titel="Group as superset" className="v2-btn">
          <Icon name="layers" className="v2-ic v2-ic-sm" />Group as superset
        </InEntwicklungKnopf>
        <InEntwicklungKnopf titel="Import from library" className="v2-btn v2-btn-ghost">
          <Icon name="copy" className="v2-ic v2-ic-sm" />Import from library
        </InEntwicklungKnopf>
        <div className="v2-spacer" />
        <span className="v2-dim" style={{ fontSize: 11, alignSelf: 'center' }}>
          Estimated · {r.exercises.length} exercises · {saetze} sets · ~{Math.round(r.exercises.length * 12)}min
        </span>
      </div>

      <div className="v2-divider" />
      <TField label="Notes">
        <TInput placeholder="Block context, deload notes, technique cues…" />
      </TField>
    </TModal>
  )
}

// [cmd] module-training-extras.jsx:168-181.
function ExerciseEditorRow({ ex, idx, updEx, moveEx, delEx }: {
  ex: UebungZeile & { _idx: number }
  idx: number
  updEx: (i: number, k: keyof UebungZeile, v: string) => void
  moveEx: (i: number, dir: number) => void
  delEx: (i: number) => void
}) {
  return (
    <div className="v2-train-ex-row">
      <span className="v2-num v2-dim" style={{ fontSize: 10, textAlign: 'center' }}>
        {(idx + 1).toString().padStart(2, '0')}
      </span>
      <TInput value={ex.name} aria-label="Exercise" onChange={e => updEx(idx, 'name', e.target.value)} />
      <TInput value={ex.target} aria-label="Target" onChange={e => updEx(idx, 'target', e.target.value)} />
      <TInput value={ex.rir} aria-label="RIR" onChange={e => updEx(idx, 'rir', e.target.value)} />
      <TInput value={`${ex.restSec}s rest`} aria-label="Rest" readOnly />
      <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        {/* G-20: zurueck auf die Symbole der Vorlage. `chevron_up`
            fehlte im Symbolsatz und ist jetzt da — der Ersatz durch
            `arrow_up`/`arrow_down` aus G-16 (packages/ui war gesperrt)
            entfaellt damit. */}
        <button type="button" className="v2-icon-btn" onClick={() => moveEx(idx, -1)}
                title="Move up" aria-label="Move up">
          <Icon name="chevron_up" className="v2-ic v2-ic-sm" />
        </button>
        <button type="button" className="v2-icon-btn" onClick={() => moveEx(idx, 1)}
                title="Move down" aria-label="Move down">
          <Icon name="chevron_down" className="v2-ic v2-ic-sm" />
        </button>
        <button type="button" className="v2-icon-btn" onClick={() => delEx(idx)}
                title="Delete" aria-label="Delete">
          <Icon name="trash" className="v2-ic v2-ic-sm" style={{ color: 'var(--neg)' }} />
        </button>
      </div>
    </div>
  )
}

// ── EXERCISE DETAIL ─────────────────────────────────────────────
// [cmd] module-training-extras.jsx:184-280.
type ExerciseDetail = {
  n?: string; name?: string; eq?: string; equip?: string
  musc?: string[]; type?: string; e1rm?: string; best?: string
}

function ExerciseDetailModal({ exercise, onClose }: { exercise: ExerciseDetail | null; onClose: () => void }) {
  const ex = exercise ?? {
    n: 'Bench Press · Barbell', eq: 'Barbell',
    musc: ['Chest', 'Triceps', 'Front Delt'], type: 'Compound',
    e1rm: '122.5kg', best: '120kg ×3',
  }
  return (
    <TModal title={ex.n ?? ex.name ?? 'Exercise'}
            subtitle={`${ex.type ?? 'Compound'} · ${ex.eq ?? ex.equip ?? 'Barbell'}`}
            eyebrow="training" onClose={onClose} width={760}
            footer={
              <>
                <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Close</button>
                <InEntwicklungKnopf titel="Edit exercise" className="v2-btn">
                  <Icon name="edit" className="v2-ic v2-ic-sm" />Edit exercise
                </InEntwicklungKnopf>
                <InEntwicklungKnopf titel="Add to routine" className="v2-btn v2-btn-primary">
                  <Icon name="plus" className="v2-ic v2-ic-sm" />Add to routine
                </InEntwicklungKnopf>
              </>
            }>
      <div className="v2-grid v2-g-cols-2" style={{ gap: 14, marginBottom: 14 }}>
        <div className="v2-placeholder-img" style={{ aspectRatio: '16/9', borderRadius: 6, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
            <Icon name="play" className="v2-ic" style={{ width: 28, height: 28, color: 'var(--acc-train)' }} />
          </div>
          <div style={{ position: 'absolute', bottom: 6, left: 6, right: 6, display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--fg-dim)', fontFamily: 'var(--font-mono)' }}>
            <span>technique demo · 1:34</span>
            <span>upload your own</span>
          </div>
        </div>
        <div className="v2-col-gap" style={{ gap: 6 }}>
          <Card className="v2-card-tight" style={{ padding: 12 }}>
            <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Current e1RM</div>
            <div className="v2-num" style={{ fontSize: 22, fontWeight: 500, color: 'var(--acc-train)' }}>{ex.e1rm ?? '122.5kg'}</div>
            <div className="v2-dim" style={{ fontSize: 10 }}>est. by Epley · best set {ex.best ?? '120kg ×3'}</div>
          </Card>
          <div className="v2-grid v2-g-cols-2" style={{ gap: 6 }}>
            <Card className="v2-card-tight" style={{ padding: 10 }}>
              <div className="v2-eyebrow">Primary</div>
              <div className="v2-num" style={{ fontSize: 12, marginTop: 2 }}>Chest (Pec major)</div>
            </Card>
            <Card className="v2-card-tight" style={{ padding: 10 }}>
              <div className="v2-eyebrow">Synergists</div>
              <div style={{ fontSize: 11, marginTop: 2 }}>Triceps · Front Delt</div>
            </Card>
            <Card className="v2-card-tight" style={{ padding: 10 }}>
              <div className="v2-eyebrow">Lift type</div>
              <div style={{ fontSize: 11, marginTop: 2 }}>Compound</div>
            </Card>
            <Card className="v2-card-tight" style={{ padding: 10 }}>
              <div className="v2-eyebrow">Last session</div>
              <div className="v2-num" style={{ fontSize: 11, marginTop: 2 }}>5,5,5,5,4 @ 115kg</div>
            </Card>
          </div>
        </div>
      </div>

      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>12-week strength progression</div>
      <Card className="v2-card-tight" style={{ padding: 12, marginBottom: 14 }}>
        <LineChart h={120} range={[100, 130]}
          xLabels={['wk1', '', '', 'wk4', '', '', 'wk7', '', '', 'wk10', '', 'wk12']}
          series={[{ data: [102, 105, 105, 107.5, 110, 112.5, 110, 115, 117.5, 117.5, 120, 122.5], color: 'var(--acc-train)' }]} />
      </Card>

      <div className="v2-grid v2-g-cols-2" style={{ gap: 12 }}>
        <Card className="v2-card-tight" style={{ padding: 14 }}>
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Technique cues</div>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11.5, color: 'var(--fg-muted)', lineHeight: 1.55 }}>
            <li>Retract scapula, slight arch</li>
            <li>Bar path angled — touches lower chest, presses back over shoulders</li>
            <li>Drive feet into floor (leg drive)</li>
            <li>Elbows ~60° from torso · not flared</li>
            <li>Lockout without bouncing off chest</li>
          </ul>
        </Card>
        <Card className="v2-card-tight" style={{ padding: 14 }}>
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Common errors</div>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11.5, color: 'var(--fg-muted)', lineHeight: 1.55 }}>
            <li>Flared elbows · shoulder impingement risk</li>
            <li>Bouncing bar off chest · wastes stretch reflex</li>
            <li>No leg drive · loses force transmission</li>
            <li>Asymmetric press · L/R weakness needs DB work</li>
          </ul>
        </Card>
        <Card className="v2-card-tight" style={{ padding: 14 }}>
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Variations</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            <Pill>Close-grip</Pill><Pill>Wide-grip</Pill><Pill>Pause bench</Pill>
            <Pill>Spoto press</Pill><Pill>Floor press</Pill><Pill>Smith machine</Pill>
          </div>
        </Card>
        <Card className="v2-card-tight" style={{ padding: 14 }}>
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Last 5 sessions</div>
          <table className="v2-tbl">
            <tbody>
              <tr><td className="v2-num v2-muted">May 13</td><td className="v2-num">5,5,5,5,4 @ 115kg</td></tr>
              <tr><td className="v2-num v2-muted">May 6</td><td className="v2-num">5,5,5,4,4 @ 115kg</td></tr>
              <tr><td className="v2-num v2-muted">Apr 29</td><td className="v2-num">5,5,5,4 @ 112.5kg</td></tr>
              <tr><td className="v2-num v2-muted">Apr 22</td><td className="v2-num">5,5,4,4 @ 112.5kg</td></tr>
              <tr><td className="v2-num v2-muted">Apr 15</td><td className="v2-num">5,5,5,5 @ 110kg</td></tr>
            </tbody>
          </table>
        </Card>
      </div>
    </TModal>
  )
}

// ── CUSTOM EXERCISE ─────────────────────────────────────────────
// [cmd] module-training-extras.jsx:283-308.
function CustomExerciseModal({ onClose }: { onClose: () => void }) {
  return (
    <TModal title="Custom exercise" subtitle="Add to your library · syncs offline"
            eyebrow="plus" onClose={onClose} width={620}
            footer={
              <>
                <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Cancel</button>
                <InEntwicklungKnopf titel="Save exercise" className="v2-btn v2-btn-primary"
                                    grund="`training.exercises` gibt es (17 Spalten, 1.416 Zeilen) und der Exercises-Tab liest sie. Was fehlt, ist der Schreibweg — und die Abgrenzung: der Katalog ist geteilt, eine eigene Uebung waere es nicht.">
                  <Icon name="check" className="v2-ic v2-ic-sm" />Save exercise
                </InEntwicklungKnopf>
              </>
            }>
      <TField label="Exercise name"><TInput placeholder="e.g. Pause Squat · 3-count" /></TField>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <TField label="Equipment">
          <TSelect defaultValue="Barbell">
            <option>Barbell</option><option>Dumbbell</option><option>Machine</option>
            <option>Cable</option><option>Bodyweight</option><option>Bands</option>
          </TSelect>
        </TField>
        <TField label="Type">
          <TSelect defaultValue="Compound">
            <option>Compound</option><option>Isolation</option><option>Skill</option><option>Cardio</option>
          </TSelect>
        </TField>
      </div>
      <TField label="Primary muscle">
        <TSelect defaultValue="Chest">
          <option>Chest</option><option>Back</option><option>Shoulders</option><option>Biceps</option>
          <option>Triceps</option><option>Quads</option><option>Hamstrings</option><option>Glutes</option>
          <option>Calves</option><option>Core</option>
        </TSelect>
      </TField>
      <TField label="Synergist muscles · comma-separated">
        <TInput placeholder="e.g. Triceps, Front Delt" />
      </TField>
      <TField label="Video / image reference">
        <div className="v2-placeholder-img" style={{ aspectRatio: '16/9', borderRadius: 5 }}>
          <div style={{ fontSize: 11, color: 'var(--fg-dim)', textAlign: 'center' }}>
            tap to upload video or image (optional)
          </div>
        </div>
      </TField>
      <TField label="Technique notes (optional)">
        <TInput placeholder="Cues, weight progression, history…" />
      </TField>
    </TModal>
  )
}

// ── BLOCK EDITOR (Mesocycle) ────────────────────────────────────
// [cmd] module-training-extras.jsx:311-385.
function BlockEditorModal({ onClose }: { onClose: () => void }) {
  const b = {
    name: 'Block 3', weeks: 5, focus: 'Hypertrophy → Strength',
    weekConfig: [
      { week: 1, focus: 'Volume accumulation', load: 84, intent: 'RPE 7' },
      { week: 2, focus: 'Volume accumulation', load: 92, intent: 'RPE 7-8' },
      { week: 3, focus: 'Intensification', load: 96, intent: 'RPE 8' },
      { week: 4, focus: 'Peak intensity', load: 100, intent: 'RPE 9' },
      { week: 5, focus: 'Deload', load: 55, intent: 'RPE 5' },
    ],
  }
  return (
    <TModal title={`Mesocycle editor · ${b.name}`}
            subtitle="Periodization · weekly load · deload schedule"
            eyebrow="calendar" onClose={onClose} width={780}
            footer={
              <>
                <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Cancel</button>
                <InEntwicklungKnopf titel="Save as template" className="v2-btn">
                  <Icon name="copy" className="v2-ic v2-ic-sm" />Save as template
                </InEntwicklungKnopf>
                <InEntwicklungKnopf titel="Save block" className="v2-btn v2-btn-primary"
                                    grund="Mesozyklen brauchen training.blocks; die Tabelle gibt es noch nicht.">
                  <Icon name="check" className="v2-ic v2-ic-sm" />Save block
                </InEntwicklungKnopf>
              </>
            }>
      <div className="v2-train-block-felder">
        <TField label="Block name"><TInput defaultValue={b.name} /></TField>
        <TField label="Duration"><TInput defaultValue={b.weeks} /></TField>
        <TField label="Periodization">
          <TSelect defaultValue="Linear">
            <option>Linear</option><option>Undulating</option>
            <option>Block (Bompa)</option><option>Conjugate</option>
          </TSelect>
        </TField>
        <TField label="Deload">
          <TSelect defaultValue="Last week">
            <option>Last week</option><option>Mid + last</option><option>None</option>
          </TSelect>
        </TField>
      </div>
      <TField label="Focus / goal"><TInput defaultValue={b.focus} /></TField>

      <div className="v2-eyebrow" style={{ marginTop: 6, marginBottom: 8 }}>Week-by-week plan</div>
      <Card className="v2-card-tight" style={{ padding: 0 }}>
        <div className="v2-tbl-wrap">
          <table className="v2-tbl">
            <thead>
              <tr>
                <th style={{ width: 60 }}>Week</th>
                <th>Focus</th>
                <th style={{ width: 130 }}>Intent (RPE)</th>
                <th style={{ width: 150 }}>Load %</th>
                <th style={{ width: 80, textAlign: 'right' }}>Value</th>
              </tr>
            </thead>
            <tbody>
              {b.weekConfig.map(w => (
                <tr key={w.week}>
                  <td className="v2-num">Wk {w.week}</td>
                  <td><TInput defaultValue={w.focus} aria-label={`Woche ${w.week} Fokus`} /></td>
                  <td><TInput defaultValue={w.intent} aria-label={`Woche ${w.week} Intent`} /></td>
                  <td>
                    <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${w.load}%`, background: w.load < 60 ? 'var(--fg-dim)' : w.load < 95 ? 'var(--acc-train)' : 'var(--neg)' }} />
                    </div>
                  </td>
                  <td className="v2-num" style={{ textAlign: 'right' }}>{w.load}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="v2-eyebrow" style={{ marginTop: 14, marginBottom: 6 }}>Routines assigned to block</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        <Pill variant="acc">Push A · Heavy</Pill>
        <Pill variant="acc">Push B · Volume</Pill>
        <Pill variant="acc">Pull A · Heavy</Pill>
        <Pill variant="acc">Pull B · Volume</Pill>
        <Pill variant="acc">Legs A · Squat</Pill>
        <Pill variant="acc">Legs B · DL</Pill>
        <InEntwicklungKnopf titel="Add routine" className="v2-pill"
                            style={{ cursor: 'pointer', border: '1px dashed var(--border)' }}>
          + Add routine
        </InEntwicklungKnopf>
      </div>
    </TModal>
  )
}

// ── ASSIGN WEEK ─────────────────────────────────────────────────
// [cmd] module-training-extras.jsx:388-415.
function AssignWeekModal({ onClose }: { onClose: () => void }) {
  const tage = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const belegung = ['Pull A', 'Push A', 'Legs A', 'Rest', 'Push B', 'Pull B', 'Legs B']
  const zustand = ['done', 'done', 'done', '—', 'planned', 'planned', 'planned']
  return (
    <TModal title="Assign weekly plan" subtitle="Map routines to days · drag-drop in production"
            eyebrow="calendar" onClose={onClose}
            footer={
              <>
                <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Cancel</button>
                <InEntwicklungKnopf titel="Apply" className="v2-btn v2-btn-primary">Apply</InEntwicklungKnopf>
              </>
            }>
      <TField label="Week of">
        <TSelect defaultValue="May 12–18 (current)">
          <option>May 12–18 (current)</option><option>May 19–25</option><option>May 26–Jun 1</option>
        </TSelect>
      </TField>
      <Card className="v2-card-tight" style={{ padding: 0 }}>
        <div className="v2-tbl-wrap">
          <table className="v2-tbl">
            <thead>
              <tr><th style={{ width: 90 }}>Day</th><th>Routine</th><th style={{ width: 80 }}>Status</th></tr>
            </thead>
            <tbody>
              {tage.map((d, i) => (
                <tr key={d}>
                  <td>{d}</td>
                  <td>
                    <TSelect defaultValue={belegung[i]} aria-label={`${d} Routine`} style={{ height: 26, fontSize: 11 }}>
                      <option>Push A · Heavy</option><option>Push B · Volume</option>
                      <option>Pull A · Heavy</option><option>Pull B · Volume</option>
                      <option>Legs A · Squat</option><option>Legs B · DL</option>
                      <option>Mobility &amp; Core</option><option>Rest</option>
                      {/* Die Vorlage setzt `defaultValue` auf Kurznamen
                          („Pull A"), die in der Liste nicht vorkommen.
                          Damit die Auswahl trotzdem den Plan zeigt,
                          stehen die Kurznamen mit dabei. */}
                      <option>{belegung[i]}</option>
                    </TSelect>
                  </td>
                  <td>
                    {zustand[i] === 'done' ? <Pill variant="pos">done</Pill>
                      : zustand[i] === 'planned' ? <Pill>planned</Pill>
                        : <span className="v2-dim">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </TModal>
  )
}

// ── SUPERSET EDITOR ─────────────────────────────────────────────
// [cmd] module-training-extras.jsx:418-438.
function SupersetEditorModal({ onClose }: { onClose: () => void }) {
  const uebungen = [
    { n: 'Cable Fly · 3×12 @ 22kg', an: true },
    { n: 'Triceps Pushdown · 3×12 @ 38kg', an: true },
    { n: 'Lateral Raise · 3×15 @ 9kg', an: false },
    { n: 'Overhead Triceps · 3×10 @ 24kg', an: false },
  ]
  return (
    <TModal title="Group as superset" subtitle="Back-to-back execution · single rest after final lift"
            eyebrow="layers" onClose={onClose}
            footer={
              <>
                <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Cancel</button>
                <InEntwicklungKnopf titel="Create superset" className="v2-btn v2-btn-primary">
                  Create superset
                </InEntwicklungKnopf>
              </>
            }>
      <div className="v2-dim" style={{ fontSize: 12, marginBottom: 14, lineHeight: 1.5 }}>
        Select 2–4 exercises to perform back-to-back without rest. Use for antagonist pairing (push/pull) or time-efficiency (small lifts).
      </div>
      <TField label="Superset label"><TInput defaultValue="A" /></TField>
      <TField label="Rest after final exercise"><TInput defaultValue="90" /></TField>
      <TField label="Exercises in this superset">
        <div className="v2-col-gap" style={{ gap: 4 }}>
          {uebungen.map(u => (
            <label key={u.n} style={{ padding: 8, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 5, display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5 }}>
              <input type="checkbox" defaultChecked={u.an} /> {u.n}
            </label>
          ))}
        </div>
      </TField>
      <div style={{ padding: 10, background: 'var(--surface)', borderRadius: 6, fontSize: 11, color: 'var(--fg-muted)', lineHeight: 1.5 }}>
        Estimated time saved: <span className="v2-num" style={{ color: 'var(--fg)' }}>~8 minutes</span> per workout.
      </div>
    </TModal>
  )
}

// ── PLATE CALCULATOR ────────────────────────────────────────────
// [cmd] module-training-spec.jsx:399-470. Der Rechner rechnet wirklich.
function PlateCalculatorModal({ onClose }: { onClose: () => void }) {
  const [target, setTarget] = React.useState(117.5)
  const [bar, setBar] = React.useState(20)
  const plates = [25, 20, 15, 10, 5, 2.5, 1.25]
  const perSide = (target - bar) / 2
  let rest = perSide
  const load: Array<[number, number]> = []
  for (const p of plates) {
    const n = Math.floor(rest / p)
    if (n > 0) { load.push([p, n]); rest = +(rest - n * p).toFixed(2) }
  }
  const farbe = (p: number) =>
    p >= 20 ? 'var(--neg)' : p >= 15 ? 'var(--acc-goals)'
      : p >= 10 ? 'var(--acc-recov)' : p >= 5 ? 'var(--acc-train)' : 'var(--fg-dim)'

  return (
    <TModal title="Plate calculator" subtitle="Per side loading"
            eyebrow="training" onClose={onClose} width={520}
            footer={<button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Close</button>}>
      <div className="v2-grid v2-g-cols-2" style={{ gap: 10, marginBottom: 14 }}>
        <div>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Target weight</div>
          <input type="number" value={target} step="2.5" aria-label="Target weight"
                 onChange={e => setTarget(Number(e.target.value))}
                 style={{ ...FELD, height: 32, fontSize: 13, fontFamily: 'var(--font-mono)' }} />
        </div>
        <div>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Bar</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {[20, 15, 10].map(b => (
              <button key={b} type="button" onClick={() => setBar(b)} aria-pressed={bar === b}
                      className={bar === b ? 'v2-btn v2-btn-primary v2-btn-sm' : 'v2-btn v2-btn-sm'}
                      style={{ flex: 1 }}>{b} kg</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, padding: '20px 0', marginBottom: 12, flexWrap: 'wrap' }}>
        {load.slice().reverse().flatMap(([p, n]) => Array.from({ length: n }, (_, i) => (
          <div key={`l-${p}-${i}`} style={{ width: 9, height: 20 + p * 2.2, borderRadius: 2, background: farbe(p) }} title={`${p} kg`} />
        )))}
        <div style={{ width: 60, height: 6, background: 'var(--fg-dim)', borderRadius: 2 }} />
        {load.flatMap(([p, n]) => Array.from({ length: n }, (_, i) => (
          <div key={`r-${p}-${i}`} style={{ width: 9, height: 20 + p * 2.2, borderRadius: 2, background: farbe(p) }} title={`${p} kg`} />
        )))}
      </div>
      <Card className="v2-card-tight" style={{ padding: 12 }}>
        <div className="v2-eyebrow" style={{ marginBottom: 8 }}>Per side · {perSide} kg</div>
        {load.length === 0
          ? <div className="v2-dim" style={{ fontSize: 12 }}>Bar only</div>
          : load.map(([p, n]) => (
            <div key={p} className="v2-row" style={{ padding: '5px 0' }}>
              <span className="v2-row-l v2-num">{p} kg</span>
              <span className="v2-row-r">× {n}</span>
            </div>
          ))}
        {rest > 0 && (
          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--warn)', fontFamily: 'var(--font-mono)' }}>
            ⚠ {rest} kg not loadable with available plates
          </div>
        )}
      </Card>
    </TModal>
  )
}

// ── WARM-UP CALCULATOR ──────────────────────────────────────────
// [cmd] module-training-spec.jsx:472-526. Auch dieser rechnet wirklich.
function WarmupCalculatorModal({ onClose }: { onClose: () => void }) {
  const work = 117.5
  const scheme = [
    { pct: 0.40, reps: 8, label: 'Activation' },
    { pct: 0.55, reps: 5, label: 'Light' },
    { pct: 0.70, reps: 3, label: 'Ramp' },
    { pct: 0.85, reps: 2, label: 'Primer' },
    { pct: 0.93, reps: 1, label: 'Neural' },
  ]
  const round = (w: number) => Math.round(w / 2.5) * 2.5
  return (
    <TModal title="Warm-up calculator" subtitle={`Bench Press · working weight ${work} kg`}
            eyebrow="flame" onClose={onClose} width={520}
            footer={
              <>
                <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Close</button>
                <InEntwicklungKnopf titel="Add to session" className="v2-btn v2-btn-primary">
                  <Icon name="plus" className="v2-ic v2-ic-sm" />Add to session
                </InEntwicklungKnopf>
              </>
            }>
      <div className="v2-tbl-wrap">
        <table className="v2-tbl">
          <thead>
            <tr>
              <th style={{ width: 40 }}>Set</th>
              <th>Stage</th>
              <th style={{ width: 70, textAlign: 'right' }}>%</th>
              <th style={{ width: 90, textAlign: 'right' }}>Weight</th>
              <th style={{ width: 60, textAlign: 'right' }}>Reps</th>
            </tr>
          </thead>
          <tbody>
            {scheme.map((s, i) => (
              <tr key={s.label}>
                <td className="v2-num v2-muted">W{i + 1}</td>
                <td>{s.label}</td>
                <td className="v2-num v2-muted" style={{ textAlign: 'right' }}>{Math.round(s.pct * 100)}%</td>
                <td className="v2-num" style={{ textAlign: 'right', fontWeight: 500 }}>{round(work * s.pct)} kg</td>
                <td className="v2-num" style={{ textAlign: 'right' }}>{s.reps}</td>
              </tr>
            ))}
            <tr style={{ borderTop: '1px solid var(--border-strong)' }}>
              <td className="v2-num" style={{ color: 'var(--acc-train)' }}>1</td>
              <td style={{ fontWeight: 600 }}>Working set</td>
              <td className="v2-num v2-muted" style={{ textAlign: 'right' }}>100%</td>
              <td className="v2-num" style={{ textAlign: 'right', fontWeight: 600, color: 'var(--acc-train)' }}>{work} kg</td>
              <td className="v2-num" style={{ textAlign: 'right' }}>5</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 12, padding: 10, background: 'var(--surface)', borderRadius: 6, fontSize: 11, color: 'var(--fg-muted)', lineHeight: 1.5 }}>
        Warm-up sets are logged as <span className="v2-mono">warmup</span> type and excluded from weekly volume.
      </div>
    </TModal>
  )
}

// ── AI WORKOUT GENERATOR ────────────────────────────────────────
// [cmd] module-training-spec.jsx:528-606. Zwei Schritte, wie dort.
function AIWorkoutGenModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = React.useState(1)
  return (
    <TModal title="Generate workout" subtitle="Rules-based · no ML · evaluation-score driven"
            eyebrow="zap" onClose={onClose} width={680}
            footer={
              <>
                {step === 2
                  ? <button type="button" className="v2-btn v2-btn-ghost" onClick={() => setStep(1)}>
                      <Icon name="chevron_left" className="v2-ic v2-ic-sm" />Back
                    </button>
                  : <div />}
                <div className="v2-spacer" />
                {step === 1
                  ? <button type="button" className="v2-btn v2-btn-primary" onClick={() => setStep(2)}>
                      Generate<Icon name="arrow_right" className="v2-ic v2-ic-sm" />
                    </button>
                  : <>
                      <InEntwicklungKnopf titel="Regenerate" className="v2-btn">Regenerate</InEntwicklungKnopf>
                      <button type="button" className="v2-btn v2-btn-primary" onClick={onClose}>
                        <Icon name="check" className="v2-ic v2-ic-sm" />Accept session
                      </button>
                    </>}
              </>
            }>
      {step === 1 && (
        <>
          <div className="v2-eyebrow" style={{ marginBottom: 8 }}>Algorithm steps</div>
          <div className="v2-col-gap" style={{ gap: 4 }}>
            {([
              ['1', 'Determine target muscle groups', 'from plan: Chest, Shoulders, Triceps'],
              ['2', 'Compute volume need', 'Chest 14→18 · Shoulders 10→16 · Triceps 14→14'],
              ['3', 'Filter by equipment + recovery', 'recovery_status < 70% excluded → none blocked'],
              ['4', 'Sort by evaluation_score DESC', 'SFR · mechanical tension · stretch position'],
              ['5', 'Pick top-N until volume met', '7 exercises selected'],
              ['6', 'Sets × reps from progression model', 'Double Progression active'],
              ['7', 'Preview → you confirm', 'nothing is saved until you accept'],
            ] as Array<[string, string, string]>).map(([n, t, d]) => (
              <div key={n} style={{ display: 'flex', gap: 10, padding: '9px 11px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6 }}>
                <span style={{ width: 20, height: 20, borderRadius: 999, background: 'var(--acc-train)', color: 'var(--bg)', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{n}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{t}</div>
                  <div className="v2-dim v2-mono" style={{ fontSize: 10, marginTop: 2 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <div className="v2-eyebrow" style={{ marginBottom: 8 }}>Generated session · Push</div>
          <div className="v2-tbl-wrap">
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th>Exercise</th>
                  <th style={{ width: 70, textAlign: 'right' }}>Score</th>
                  <th style={{ width: 110 }}>Prescription</th>
                  <th style={{ width: 80 }}>Primary</th>
                </tr>
              </thead>
              <tbody>
                {([
                  ['Bench Press · Barbell', 94, '5×5 @ 117.5', 'Chest'],
                  ['Incline DB Press', 89, '4×8 @ 38', 'Chest'],
                  ['OHP · seated', 87, '4×6 @ 67.5', 'Shoulders'],
                  ['Dips · weighted', 85, '3×10 @ +15', 'Chest'],
                  ['Lateral Raise · cable', 78, '3×15 @ 9', 'Shoulders'],
                  ['Overhead Triceps Ext.', 74, '3×10 @ 24', 'Triceps'],
                  ['Triceps Pushdown', 71, '3×12 @ 38', 'Triceps'],
                ] as Array<[string, number, string, string]>).map(r => (
                  <tr key={r[0]}>
                    <td>{r[0]}</td>
                    <td className="v2-num" style={{ textAlign: 'right', color: r[1] >= 85 ? 'var(--pos)' : r[1] >= 75 ? 'var(--acc-train)' : 'var(--fg-muted)', fontWeight: 500 }}>{r[1]}</td>
                    <td className="v2-num" style={{ fontSize: 11.5 }}>{r[2]}</td>
                    <td className="v2-muted" style={{ fontSize: 11 }}>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 14, fontSize: 11, color: 'var(--fg-muted)', flexWrap: 'wrap' }}>
            <span>22 sets</span><span>≈ 6.4 t volume</span><span>~72 min</span><span>Avg score 82.6</span>
          </div>
        </>
      )}
    </TModal>
  )
}
