'use client'

// Der Phasen-Editor und die Vorlagensammlung.
//
// QUELLE: theme-v1/module-goals-editor.jsx (569 Zeilen) —
// `PhaseEditorModal` (zwoelf Reiter) und `PhaseTemplateLibrary`.
//
// `[cmd]` Die dritte Ebene der Kette: `module-goals.jsx` ruft
// `window.GoalsPhaseView` (in `-pro.jsx`), und die ruft
// `window.PhaseEditorModal` und `window.PhaseTemplateLibrary` — die
// stehen hier. Ohne diese Datei tun in der Phase-Ansicht fuenf
// Knoepfe nichts.
//
// GEAENDERT IST NUR DAS TECHNISCHE: TypeScript, `v2-`-Praefix,
// `color-mix(in srgb, …)` -> `in oklch`, Escape schliesst,
// `<div onClick>` -> `<button>` beim Umschalter, Felder bekommen
// `aria-label`.
//
// `[read]` **Der Editor bearbeitet einen Entwurf im Speicher.** Das
// steht so in der Vorlage: `useState` mit tiefer Kopie, `dirty`-Marke,
// und der Knopf „Apply to my plan" schliesst nur. Uebernommen — nur
// dass „Apply" hier `InEntwicklung` oeffnet statt stillschweigend zu
// verwerfen.
//
// `[cmd]` ALLES IST ATTRAPPE.
import * as React from 'react'
import { Card, Pill, Icon, InEntwicklungKnopf } from '@lumeos/ui'

import { GOAL_PHASES, TDEE_STATE, type Phase } from './daten'

// [cmd] module-goals-editor.jsx:3-11.
const PE_MODES: Record<string, string[]> = {
  fat_loss: ['variants', 'guards', 'duration'],
  lean_bulk: ['params', 'guards', 'duration'],
  maintenance: ['params'],
  recomp: ['params', 'cycling'],
  contest_prep: ['subphases', 'refeeds', 'peakweek', 'guards', 'anchor'],
  reverse_diet: ['params', 'exits', 'guards'],
  expert_bb_annual: ['annual', 'anchor', 'overrides'],
}

const TAB_LABELS: Record<string, string> = {
  variants: 'Variants', params: 'Parameters', guards: 'Guards', duration: 'Duration',
  subphases: 'Sub-phases', refeeds: 'Refeeds', peakweek: 'Peak week', anchor: 'Date anchor',
  annual: 'Annual cycle', overrides: 'Per-phase overrides', cycling: 'Calorie cycling',
  exits: 'Exit conditions',
}

// ── Bausteine (module-goals-editor.jsx:13-52) ───────────────────
function PEField({ label, sub, children }: {
  label: React.ReactNode; sub?: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 5, gap: 8 }}>
        <label className="v2-eyebrow">{label}</label>
        {sub && <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>{sub}</span>}
      </div>
      {children}
    </div>
  )
}

function PENum({ value, onChange, suffix, label }: {
  value: number; onChange: (n: number) => void; suffix?: string; label?: string
}) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input type="number" value={value} aria-label={label}
             onChange={e => onChange(Number(e.target.value))}
             style={{
               width: '100%', height: 30, background: 'var(--surface)',
               border: '1px solid var(--border)', borderRadius: 6,
               padding: '0 34px 0 10px', fontSize: 12,
               fontFamily: 'var(--font-mono)', outline: 'none', color: 'var(--fg)',
             }} />
      {suffix && (
        <span className="v2-dim v2-mono" style={{
          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 10,
        }}>{suffix}</span>
      )}
    </div>
  )
}

function PERange({ min, max, onMin, onMax, suffix }: {
  min: number; max: number; onMin: (n: number) => void; onMax: (n: number) => void; suffix?: string
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <PENum value={min} onChange={onMin} suffix={suffix} label="von" />
      <span className="v2-dim v2-mono" style={{ fontSize: 11 }}>→</span>
      <PENum value={max} onChange={onMax} suffix={suffix} label="bis" />
    </div>
  )
}

function PEToggle({ on, onChange, label, sub }: {
  on: boolean; onChange: (v: boolean) => void; label: string; sub?: string
}) {
  return (
    <button type="button" onClick={() => onChange(!on)} aria-pressed={on}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
              cursor: 'pointer', width: '100%', textAlign: 'left', font: 'inherit',
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6,
            }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', color: on ? 'var(--fg)' : 'var(--fg-dim)' }}>
          {label}
        </div>
        {sub && <div className="v2-dim" style={{ fontSize: 10, marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{
        width: 30, height: 17, borderRadius: 999,
        background: on ? 'var(--pos)' : 'var(--surface-2)',
        padding: 2, flexShrink: 0, transition: 'background .15s',
      }}>
        <div style={{
          width: 13, height: 13, borderRadius: 999, background: 'var(--bg)',
          marginLeft: on ? 13 : 0, transition: 'margin .15s',
        }} />
      </div>
    </button>
  )
}

const FELD_KLEIN: React.CSSProperties = {
  width: '100%', height: 26, background: 'var(--bg-elev)', border: '1px solid var(--border)',
  borderRadius: 5, padding: '0 8px', fontSize: 11.5, color: 'var(--fg)',
}

// ── Der Editor ──────────────────────────────────────────────────
// [cmd] module-goals-editor.jsx:55-503.
export function PhaseEditorModal({ phaseId, onClose }: { phaseId: string; onClose: () => void }) {
  const base = GOAL_PHASES[phaseId]
  const modes = PE_MODES[phaseId] ?? ['params']
  const [tab, setTab] = React.useState(modes[0])
  const [draft, setDraft] = React.useState<Phase>(() => JSON.parse(JSON.stringify(base)))
  const [dirty, setDirty] = React.useState(false)
  const [anchorDate, setAnchorDate] = React.useState('2026-11-14')

  React.useEffect(() => {
    const auf = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', auf)
    return () => window.removeEventListener('keydown', auf)
  }, [onClose])

  const upd = (fn: (d: Phase) => void) => {
    setDraft(d => {
      const n: Phase = JSON.parse(JSON.stringify(d))
      fn(n)
      return n
    })
    setDirty(true)
  }

  return (
    <div className="v2-modal-veil" onClick={onClose} role="presentation">
      <div className="v2-modal" style={{ width: 860, maxWidth: '94vw', maxHeight: '92vh' }}
           role="dialog" aria-modal="true" aria-label={`Edit · ${base.name}`}
           onClick={e => e.stopPropagation()}>
        <div className="v2-modal-h">
          <div style={{
            width: 30, height: 30, borderRadius: 7, flexShrink: 0,
            background: `color-mix(in oklch, ${base.color} 18%, transparent)`,
            border: `1px solid color-mix(in oklch, ${base.color} 38%, var(--border))`,
            color: base.color, display: 'grid', placeItems: 'center',
          }}><Icon name="edit" className="v2-ic" /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Edit · {base.name}</span>
              {dirty && <Pill variant="warn" style={{ fontSize: 9 }}>unsaved</Pill>}
            </div>
            <div className="v2-dim" style={{ fontSize: 11 }}>
              Personal override — the shipped defaults stay intact
            </div>
          </div>
          <button type="button" className="v2-icon-btn" onClick={onClose} aria-label="Schliessen">
            <Icon name="x" className="v2-ic" />
          </button>
        </div>

        <div style={{ padding: '10px 16px 0' }}>
          <div className="v2-tabs v2-tabs-rail" style={{ marginBottom: 0 }} role="tablist">
            {modes.map(m => (
              <button key={m} type="button" role="tab" aria-selected={tab === m}
                      className={`v2-tab ${tab === m ? 'v2-active' : ''}`.trim()}
                      onClick={() => setTab(m)}>{TAB_LABELS[m]}</button>
            ))}
          </div>
        </div>

        <div className="v2-modal-body" style={{ overflowY: 'auto', padding: 16 }}>
          {tab === 'variants' && draft.variants && (
            <div className="v2-grid v2-g-cols-2" style={{ gap: 12 }}>
              {Object.entries(draft.variants).map(([vk, v]) => (
                <Card key={vk} className="v2-card-tight" style={{ padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>{vk}</span>
                    <Pill style={{ fontSize: 9 }}>{v.maxWeeks} wk cap</Pill>
                  </div>
                  <PEField label="Calorie deficit" sub="kcal/day">
                    <PERange min={v.deficit[0]} max={v.deficit[1]} suffix="kcal"
                             onMin={n => upd(d => { d.variants![vk].deficit[0] = n })}
                             onMax={n => upd(d => { d.variants![vk].deficit[1] = n })} />
                  </PEField>
                  <PEField label="Protein" sub="g per kg bodyweight">
                    <PERange min={v.protein[0]} max={v.protein[1]} suffix="g/kg"
                             onMin={n => upd(d => { d.variants![vk].protein[0] = n })}
                             onMax={n => upd(d => { d.variants![vk].protein[1] = n })} />
                  </PEField>
                  <PEField label="Max duration">
                    <PENum value={v.maxWeeks} suffix="wk" label="Max duration"
                           onChange={n => upd(d => { d.variants![vk].maxWeeks = n })} />
                  </PEField>
                  <PEField label="Rate of loss" sub="informational">
                    <input value={v.rate} aria-label="Rate of loss"
                           onChange={e => upd(d => { d.variants![vk].rate = e.target.value })}
                           style={{ ...FELD_KLEIN, height: 30, background: 'var(--surface)', borderRadius: 6, padding: '0 10px', fontSize: 12 }} />
                  </PEField>
                  <PEField label="Diet break">
                    <input value={v.dietBreak} aria-label="Diet break"
                           onChange={e => upd(d => { d.variants![vk].dietBreak = e.target.value })}
                           style={{ ...FELD_KLEIN, height: 30, background: 'var(--surface)', borderRadius: 6, padding: '0 10px', fontSize: 12 }} />
                  </PEField>
                </Card>
              ))}
            </div>
          )}

          {tab === 'params' && draft.params && (
            <div className="v2-grid v2-g-cols-2" style={{ gap: 12 }}>
              {Object.entries(draft.params).map(([k, v]) => (
                <PEField key={k} label={k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}>
                  {Array.isArray(v)
                    ? (
                      <PERange min={v[0]} max={v[1]}
                               onMin={n => upd(d => { (d.params![k] as number[])[0] = n })}
                               onMax={n => upd(d => { (d.params![k] as number[])[1] = n })} />
                    )
                    : (
                      <input value={String(v)} aria-label={k}
                             onChange={e => upd(d => { d.params![k] = e.target.value })}
                             style={{ ...FELD_KLEIN, height: 30, background: 'var(--surface)', borderRadius: 6, padding: '0 10px', fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                    )}
                </PEField>
              ))}
            </div>
          )}

          {tab === 'cycling' && (
            <>
              <div className="v2-dim" style={{ fontSize: 12, marginBottom: 14, lineHeight: 1.55 }}>
                Set the per-day delta from TDEE. The weekly average is computed from your actual training-day count.
              </div>
              <div className="v2-grid v2-g-cols-3" style={{ gap: 12, marginBottom: 14 }}>
                <PEField label="Training days" sub="delta from TDEE">
                  <PENum value={200} suffix="kcal" label="Training days" onChange={() => setDirty(true)} />
                </PEField>
                <PEField label="Rest days" sub="delta from TDEE">
                  <PENum value={-300} suffix="kcal" label="Rest days" onChange={() => setDirty(true)} />
                </PEField>
                <PEField label="Training days / week">
                  <PENum value={5} suffix="d" label="Training days per week" onChange={() => setDirty(true)} />
                </PEField>
              </div>
              <Card className="v2-card-tight" style={{ padding: 12, background: 'color-mix(in oklch, var(--acc-goals) 6%, var(--surface))' }}>
                <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Computed weekly average</div>
                <div className="v2-num" style={{ fontSize: 18, fontWeight: 600 }}>
                  +{Math.round((5 * 200 + 2 * -300) / 7)} kcal/day
                </div>
                <div className="v2-dim" style={{ fontSize: 11, marginTop: 4 }}>
                  vs. TDEE {TDEE_STATE.current.toLocaleString('en-US')} → effective{' '}
                  {(TDEE_STATE.current + Math.round((5 * 200 + 2 * -300) / 7)).toLocaleString('en-US')} kcal/day
                </div>
              </Card>
              <div className="v2-divider" />
              <PEField label="Protein floor">
                <PERange min={2.0} max={2.4} suffix="g/kg"
                         onMin={() => setDirty(true)} onMax={() => setDirty(true)} />
              </PEField>
            </>
          )}

          {tab === 'duration' && (
            <>
              <div className="v2-grid v2-g-cols-2" style={{ gap: 12 }}>
                <PEField label="Max duration" sub="force transition after">
                  <PENum label="Max duration" suffix="wk" onChange={() => setDirty(true)}
                         value={(draft.params?.maxWeeks as number) || draft.variants?.moderate?.maxWeeks || 20} />
                </PEField>
                <PEField label="Minimum before transition allowed">
                  <PENum value={4} suffix="wk" label="Minimum" onChange={() => setDirty(true)} />
                </PEField>
              </div>
              <PEField label="Auto-transition behaviour">
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['Suggest only', 'Auto with 7d notice', 'Fully automatic'].map((o, i) => (
                    <InEntwicklungKnopf key={o} titel={o}
                                        className={i === 0 ? 'v2-btn v2-btn-primary v2-btn-sm' : 'v2-btn v2-btn-sm'}
                                        style={{ flex: 1 }}>{o}</InEntwicklungKnopf>
                  ))}
                </div>
              </PEField>
              <div className="v2-divider" />
              <div className="v2-eyebrow" style={{ marginBottom: 8 }}>Scheduled diet breaks</div>
              <div className="v2-grid v2-g-cols-2" style={{ gap: 12 }}>
                <PEField label="Every"><PENum value={8} suffix="wk" label="Every" onChange={() => setDirty(true)} /></PEField>
                <PEField label="Duration"><PENum value={1} suffix="wk" label="Duration" onChange={() => setDirty(true)} /></PEField>
              </div>
            </>
          )}

          {tab === 'subphases' && draft.subPhases && (
            <>
              <div className="v2-dim" style={{ fontSize: 12, marginBottom: 14, lineHeight: 1.55 }}>
                Weeks-out are anchored to your show date. Change the anchor in the{' '}
                <span className="v2-mono" style={{ color: 'var(--fg)' }}>Date anchor</span> tab and these recompute.
              </div>
              <Card className="v2-card-tight" style={{ padding: 0 }}>
                <div className="v2-tbl-wrap">
                  <table className="v2-tbl" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th style={{ paddingLeft: 12 }}>Stage</th>
                        <th style={{ width: 110 }}>Weeks out</th>
                        <th style={{ width: 120 }}>Deficit</th>
                        <th style={{ width: 130 }}>Cardio</th>
                        <th style={{ width: 40 }} />
                      </tr>
                    </thead>
                    <tbody>
                      {draft.subPhases.map((sp, i) => (
                        <tr key={sp.name}>
                          <td style={{ paddingLeft: 12 }}>
                            <input value={sp.name} aria-label="Stage"
                                   onChange={e => upd(d => { d.subPhases![i].name = e.target.value })}
                                   style={FELD_KLEIN} />
                          </td>
                          <td>
                            <input value={sp.weeks} aria-label="Weeks out"
                                   onChange={e => upd(d => { d.subPhases![i].weeks = e.target.value })}
                                   style={{ ...FELD_KLEIN, fontFamily: 'var(--font-mono)' }} />
                          </td>
                          <td>
                            {sp.deficit != null
                              ? <PENum value={sp.deficit} suffix="kcal" label="Deficit"
                                       onChange={n => upd(d => { d.subPhases![i].deficit = n })} />
                              : <span className="v2-dim v2-mono" style={{ fontSize: 11 }}>protocol</span>}
                          </td>
                          <td>
                            {sp.cardio
                              ? (
                                <select value={sp.cardio} aria-label="Cardio"
                                        onChange={e => upd(d => { d.subPhases![i].cardio = e.target.value })}
                                        style={{ ...FELD_KLEIN, padding: '0 6px' }}>
                                  <option>none</option><option>low</option><option>moderate</option>
                                  <option>high</option><option>very high</option>
                                </select>
                              )
                              : <span className="v2-dim v2-mono" style={{ fontSize: 11 }}>—</span>}
                          </td>
                          <td>
                            <InEntwicklungKnopf titel={`${sp.name} entfernen`} className="v2-icon-btn">
                              <Icon name="trash" className="v2-ic v2-ic-sm" />
                            </InEntwicklungKnopf>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                <InEntwicklungKnopf titel="Add sub-phase" className="v2-btn v2-btn-sm">
                  <Icon name="plus" className="v2-ic v2-ic-sm" />Add sub-phase
                </InEntwicklungKnopf>
                <InEntwicklungKnopf titel="Reset to IFBB default" className="v2-btn v2-btn-ghost v2-btn-sm">
                  Reset to IFBB default
                </InEntwicklungKnopf>
              </div>
            </>
          )}

          {tab === 'refeeds' && (
            <>
              <div className="v2-grid v2-g-cols-3" style={{ gap: 12 }}>
                <PEField label="Start after week"><PENum value={8} suffix="wk" label="Start after week" onChange={() => setDirty(true)} /></PEField>
                <PEField label="Frequency"><PENum value={2} suffix="×/wk" label="Frequency" onChange={() => setDirty(true)} /></PEField>
                <PEField label="Carb multiplier"><PENum value={1.8} suffix="×" label="Carb multiplier" onChange={() => setDirty(true)} /></PEField>
              </div>
              <PEField label="Refeed day placement">
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d, i) => (
                    <InEntwicklungKnopf key={d} titel={`Refeed ${d}`}
                                        className={[3, 6].includes(i) ? 'v2-btn v2-btn-primary v2-btn-sm' : 'v2-btn v2-btn-sm'}
                                        style={{ flex: 1 }}>{d}</InEntwicklungKnopf>
                  ))}
                </div>
              </PEField>
              <PEField label="Refeed type">
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['High carb · moderate kcal', 'Full maintenance', 'Above maintenance'].map((o, i) => (
                    <InEntwicklungKnopf key={o} titel={o}
                                        className={i === 0 ? 'v2-btn v2-btn-primary v2-btn-sm' : 'v2-btn v2-btn-sm'}
                                        style={{ flex: 1 }}>{o}</InEntwicklungKnopf>
                  ))}
                </div>
              </PEField>
              <div className="v2-divider" />
              <PEToggle on onChange={() => setDirty(true)}
                        label="Auto-schedule refeeds after low-adherence weeks"
                        sub="triggers when adherence < 80% for 2 consecutive weeks" />
            </>
          )}

          {tab === 'peakweek' && (
            <>
              <div className="v2-grid v2-g-cols-2" style={{ gap: 12 }}>
                <PEField label="Carb depletion days"><PENum value={3} suffix="d" label="Carb depletion days" onChange={() => setDirty(true)} /></PEField>
                <PEField label="Carb load days"><PENum value={2} suffix="d" label="Carb load days" onChange={() => setDirty(true)} /></PEField>
              </div>
              <div className="v2-grid v2-g-cols-2" style={{ gap: 12 }}>
                <PEField label="Depletion carbs" sub="g/kg on depletion days">
                  <PENum value={0.5} suffix="g/kg" label="Depletion carbs" onChange={() => setDirty(true)} />
                </PEField>
                <PEField label="Load carbs" sub="g/kg on load days">
                  <PENum value={8} suffix="g/kg" label="Load carbs" onChange={() => setDirty(true)} />
                </PEField>
              </div>
              <div className="v2-divider" />
              <div className="v2-eyebrow" style={{ marginBottom: 8 }}>Protocols</div>
              <div className="v2-col-gap" style={{ gap: 6 }}>
                <PEToggle on onChange={() => setDirty(true)} label="Sodium manipulation" sub="load then taper 48h out" />
                <PEToggle on onChange={() => setDirty(true)} label="Water manipulation" sub="high intake → cut 12h out" />
                <PEToggle on={false} onChange={() => setDirty(true)} label="Diuretics" sub="off · requires medical sign-off" />
                <PEToggle on onChange={() => setDirty(true)} label="Training taper" sub="last heavy session 5d out" />
                <PEToggle on onChange={() => setDirty(true)} label="Posing practice schedule" sub="2×/day final week" />
              </div>
            </>
          )}

          {tab === 'anchor' && (
            <>
              <div className="v2-dim" style={{ fontSize: 12, marginBottom: 14, lineHeight: 1.55 }}>
                Set your show or target date. Everything upstream — sub-phases, refeed start, peak week, taper — recomputes backwards from here.
              </div>
              <div className="v2-grid v2-g-cols-2" style={{ gap: 12 }}>
                <PEField label="Show / target date">
                  <input type="date" value={anchorDate} aria-label="Show / target date"
                         onChange={e => { setAnchorDate(e.target.value); setDirty(true) }}
                         style={{ ...FELD_KLEIN, height: 30, background: 'var(--surface)', borderRadius: 6, padding: '0 10px', fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                </PEField>
                <PEField label="Total prep length">
                  <PENum value={24} suffix="wk" label="Total prep length" onChange={() => setDirty(true)} />
                </PEField>
              </div>
              <Card className="v2-card-tight" style={{ padding: 14, background: 'color-mix(in oklch, var(--acc-goals) 6%, var(--surface))' }}>
                <div className="v2-eyebrow" style={{ marginBottom: 8 }}>Computed backwards schedule</div>
                <div className="v2-tbl-wrap">
                  <table className="v2-tbl" style={{ margin: 0 }}>
                    <tbody>
                      {([
                        ['Prep start', '2026-05-30', '24 wk out'],
                        ['Mid phase start', '2026-07-25', '16 wk out'],
                        ['Late phase start', '2026-09-19', '8 wk out'],
                        ['Refeeds begin', '2026-07-25', '16 wk out'],
                        ['Peak week start', '2026-11-07', '1 wk out'],
                        ['Show day', anchorDate, '0'],
                      ] as Array<[string, string, string]>).map(r => (
                        <tr key={r[0]}>
                          <td style={{ fontSize: 11.5 }}>{r[0]}</td>
                          <td className="v2-num" style={{ textAlign: 'right', width: 110 }}>{r[1]}</td>
                          <td className="v2-num v2-dim" style={{ textAlign: 'right', width: 80, fontSize: 10 }}>{r[2]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}

          {tab === 'annual' && draft.annual && (
            <>
              <div className="v2-dim" style={{ fontSize: 12, marginBottom: 14, lineHeight: 1.55 }}>
                Drag the month boundaries or type directly. Total must sum to 12 months.
              </div>
              <div style={{ display: 'flex', height: 32, borderRadius: 7, overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 6 }}>
                {([
                  { l: 'LEAN BULK', m: 4, c: 'var(--acc-train)' },
                  { l: 'MAINT', m: 2, c: 'var(--acc-recov)' },
                  { l: 'CONTEST PREP', m: 4, c: 'var(--neg)' },
                  { l: 'PEAK', m: 1, c: 'var(--acc-goals)' },
                  { l: 'REVERSE', m: 1, c: 'var(--acc-coach)' },
                ]).map(seg => (
                  <div key={seg.l} style={{
                    flex: seg.m, background: `color-mix(in oklch, ${seg.c} 28%, var(--surface))`,
                    borderRight: '1px solid var(--border)', display: 'grid', placeItems: 'center',
                    fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 600,
                    color: seg.c, letterSpacing: '0.04em',
                  }}>{seg.l}</div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2, marginBottom: 16 }}>
                {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].map((m, i) => (
                  <span key={`${m}-${i}`} className="v2-dim v2-mono" style={{ fontSize: 9, textAlign: 'center' }}>{m}</span>
                ))}
              </div>
              <Card className="v2-card-tight" style={{ padding: 0 }}>
                <div className="v2-tbl-wrap">
                  <table className="v2-tbl" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th style={{ paddingLeft: 12, width: 100 }}>Months</th>
                        <th>Phase</th>
                        <th>Focus</th>
                        <th style={{ width: 40 }} />
                      </tr>
                    </thead>
                    <tbody>
                      {draft.annual.map((a, i) => (
                        <tr key={a.months}>
                          <td style={{ paddingLeft: 12 }}>
                            <input value={a.months} aria-label="Months"
                                   onChange={e => upd(d => { d.annual![i].months = e.target.value })}
                                   style={{ ...FELD_KLEIN, fontFamily: 'var(--font-mono)' }} />
                          </td>
                          <td>
                            <select value={a.phase} aria-label="Phase"
                                    onChange={e => upd(d => { d.annual![i].phase = e.target.value })}
                                    style={{ ...FELD_KLEIN, padding: '0 6px', fontFamily: 'var(--font-mono)' }}>
                              {['LEAN_BULK', 'MAINTENANCE', 'CONTEST_PREP', 'PEAK WEEK + SHOW', 'REVERSE_DIET', 'FAT_LOSS', 'RECOMP', 'MINI_CUT'].map(o => (
                                <option key={o}>{o}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input value={a.focus} aria-label="Focus"
                                   onChange={e => upd(d => { d.annual![i].focus = e.target.value })}
                                   style={FELD_KLEIN} />
                          </td>
                          <td>
                            <InEntwicklungKnopf titel={`Block ${a.months} entfernen`} className="v2-icon-btn">
                              <Icon name="trash" className="v2-ic v2-ic-sm" />
                            </InEntwicklungKnopf>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
              <div style={{ display: 'flex', gap: 6, marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <InEntwicklungKnopf titel="Add block" className="v2-btn v2-btn-sm">
                  <Icon name="plus" className="v2-ic v2-ic-sm" />Add block
                </InEntwicklungKnopf>
                <InEntwicklungKnopf titel="Reset to default cycle" className="v2-btn v2-btn-ghost v2-btn-sm">
                  Reset to default cycle
                </InEntwicklungKnopf>
                <div className="v2-spacer" />
                <span className="v2-dim v2-mono" style={{ fontSize: 10.5 }}>12 of 12 months allocated</span>
              </div>
              <div className="v2-divider" />
              <div className="v2-col-gap" style={{ gap: 6 }}>
                <PEToggle on={Boolean(draft.autoTransitions)}
                          onChange={v => upd(d => { d.autoTransitions = v })}
                          label="Auto-transition between blocks"
                          sub="no confirmation needed at month boundaries" />
                <PEToggle on={Boolean(draft.coachOverride)}
                          onChange={v => upd(d => { d.coachOverride = v })}
                          label="Coach can override transitions"
                          sub="Anders Lindqvist has write access to this cycle" />
              </div>
            </>
          )}

          {tab === 'overrides' && (
            <>
              <div className="v2-dim" style={{ fontSize: 12, marginBottom: 14, lineHeight: 1.55 }}>
                Each block in your annual cycle inherits that phase&apos;s defaults. Override them here — changes apply only inside this cycle.
              </div>
              <div className="v2-col-gap" style={{ gap: 10 }}>
                {([
                  { phase: 'LEAN_BULK', color: 'var(--acc-train)', fields: [['Surplus', '250', 'kcal'], ['Protein', '1.9', 'g/kg'], ['Rate cap', '0.4', '% BW/mo']] },
                  { phase: 'MAINTENANCE', color: 'var(--acc-recov)', fields: [['Target', 'TDEE', '±100'], ['Protein', '1.8', 'g/kg']] },
                  { phase: 'CONTEST_PREP', color: 'var(--neg)', fields: [['Start deficit', '-350', 'kcal'], ['Peak deficit', '-800', 'kcal'], ['Protein', '2.8', 'g/kg']] },
                  { phase: 'REVERSE_DIET', color: 'var(--acc-coach)', fields: [['Weekly increase', '120', 'kcal'], ['Max weeks', '14', 'wk']] },
                ] as Array<{ phase: string; color: string; fields: Array<[string, string, string]> }>).map(b => (
                  <Card key={b.phase} className="v2-card-tight" style={{ padding: 12, borderLeft: `2px solid ${b.color}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                      <span className="v2-mono" style={{ fontSize: 11.5, fontWeight: 600 }}>{b.phase}</span>
                      <Pill style={{ fontSize: 9 }}>overridden</Pill>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${b.fields.length}, 1fr)`, gap: 10 }}>
                      {b.fields.map(([l, v, u]) => (
                        <div key={l}>
                          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>{l}</div>
                          <div style={{ position: 'relative' }}>
                            <input defaultValue={v} aria-label={`${b.phase} ${l}`} onChange={() => setDirty(true)}
                                   style={{
                                     width: '100%', height: 28, background: 'var(--surface)',
                                     border: '1px solid var(--border)', borderRadius: 5,
                                     padding: '0 32px 0 8px', fontSize: 11.5,
                                     fontFamily: 'var(--font-mono)', color: 'var(--fg)',
                                   }} />
                            <span className="v2-dim v2-mono" style={{
                              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 9.5,
                            }}>{u}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}

          {tab === 'guards' && (
            <>
              <div className="v2-dim" style={{ fontSize: 12, marginBottom: 14, lineHeight: 1.55 }}>
                Guards are the deterministic rules that trigger auto-adjustments. Toggle off any you want to manage yourself, or shift the thresholds.
              </div>
              <div className="v2-col-gap" style={{ gap: 8 }}>
                {(draft.guards ?? []).map(g => {
                  const m = g.match(/([\d.]+)/)
                  return (
                    <Card key={g} className="v2-card-tight" style={{ padding: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: m ? 10 : 0 }}>
                        <span className="v2-mono" style={{ fontSize: 11.5, flex: 1, color: 'var(--fg-muted)' }}>{g}</span>
                        <div style={{ width: 30, height: 17, borderRadius: 999, background: 'var(--pos)', padding: 2, flexShrink: 0 }}>
                          <div style={{ width: 13, height: 13, borderRadius: 999, background: 'var(--bg)', marginLeft: 13 }} />
                        </div>
                      </div>
                      {m && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span className="v2-eyebrow" style={{ width: 70 }}>Threshold</span>
                          <input type="range" min="0" max={Number(m[1]) * 3 || 30} step="0.1"
                                 defaultValue={m[1]} aria-label={`Threshold ${g}`}
                                 onChange={() => setDirty(true)}
                                 style={{ flex: 1, accentColor: base.color }} />
                          <span className="v2-num" style={{ width: 48, textAlign: 'right', fontSize: 12 }}>{m[1]}</span>
                        </div>
                      )}
                    </Card>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                <InEntwicklungKnopf titel="Add custom guard" className="v2-btn v2-btn-sm">
                  <Icon name="plus" className="v2-ic v2-ic-sm" />Add custom guard
                </InEntwicklungKnopf>
                <InEntwicklungKnopf titel="Restore defaults" className="v2-btn v2-btn-ghost v2-btn-sm">
                  Restore defaults
                </InEntwicklungKnopf>
              </div>
            </>
          )}

          {tab === 'exits' && (
            <>
              <div className="v2-dim" style={{ fontSize: 12, marginBottom: 14, lineHeight: 1.55 }}>
                Conditions that end this phase. All are OR-combined — the first one met triggers a transition prompt.
              </div>
              <div className="v2-col-gap" style={{ gap: 6 }}>
                {(draft.exits ?? []).map(e => (
                  <div key={e} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                    background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6,
                  }}>
                    <Icon name="arrow_right" className="v2-ic v2-ic-sm" style={{ color: base.color }} />
                    <input defaultValue={e} aria-label="Exit condition" onChange={() => setDirty(true)}
                           style={{ ...FELD_KLEIN, flex: 1, fontFamily: 'var(--font-mono)' }} />
                    <InEntwicklungKnopf titel="Bedingung entfernen" className="v2-icon-btn">
                      <Icon name="trash" className="v2-ic v2-ic-sm" />
                    </InEntwicklungKnopf>
                  </div>
                ))}
              </div>
              <InEntwicklungKnopf titel="Add exit condition" className="v2-btn v2-btn-sm" style={{ marginTop: 10 }}>
                <Icon name="plus" className="v2-ic v2-ic-sm" />Add exit condition
              </InEntwicklungKnopf>
            </>
          )}
        </div>

        <div className="v2-modal-f">
          <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Cancel</button>
          <div className="v2-spacer" />
          <InEntwicklungKnopf titel="Save as my template" className="v2-btn">
            <Icon name="copy" className="v2-ic v2-ic-sm" />Save as my template
          </InEntwicklungKnopf>
          <InEntwicklungKnopf titel="Apply to my plan" className="v2-btn v2-btn-primary"
                              grund="Eigene Phasenparameter brauchen goals.goal_phases — die Tabelle gibt es noch nicht (GO-07).">
            <Icon name="check" className="v2-ic v2-ic-sm" />Apply to my plan
          </InEntwicklungKnopf>
        </div>
      </div>
    </div>
  )
}

// ── Vorlagensammlung ────────────────────────────────────────────
// [cmd] module-goals-editor.jsx:506-569.
export function PhaseTemplateLibrary({ onClose }: { onClose: () => void }) {
  React.useEffect(() => {
    const auf = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', auf)
    return () => window.removeEventListener('keydown', auf)
  }, [onClose])

  const mine = [
    { id: 't1', name: 'My 2026 contest cycle', base: 'Expert BB Annual', edited: 'May 12', uses: 1, note: 'Show Nov 14 · 5mo bulk · earlier reverse' },
    { id: 't2', name: 'Aggressive mini-cut', base: 'Fat Loss', edited: 'Apr 2', uses: 3, note: '-900 kcal · 6wk cap · 3.0 g/kg protein' },
    { id: 't3', name: 'Off-season lean bulk', base: 'Lean Bulk', edited: 'Jan 18', uses: 2, note: '+250 kcal · BF guard at 1.5%' },
  ]
  const shared = [
    { id: 's1', name: 'Anders · Powerbuilding block', author: 'Anders Lindqvist', rating: 4.9, uses: 42 },
    { id: 's2', name: 'Jana · Recomp for lifters', author: 'Jana Bauer', rating: 4.8, uses: 88 },
    { id: 's3', name: 'IFBB standard 24wk prep', author: 'LumeOS', rating: 4.7, uses: 310 },
  ]

  return (
    <div className="v2-modal-veil" onClick={onClose} role="presentation">
      <div className="v2-modal" style={{ width: 720, maxWidth: '92vw', maxHeight: '88vh' }}
           role="dialog" aria-modal="true" aria-label="Phase templates"
           onClick={e => e.stopPropagation()}>
        <div className="v2-modal-h">
          <div style={{
            width: 26, height: 26, borderRadius: 6, flexShrink: 0,
            background: 'color-mix(in oklch, var(--acc-goals) 18%, transparent)',
            border: '1px solid color-mix(in oklch, var(--acc-goals) 38%, var(--border))',
            color: 'var(--acc-goals)', display: 'grid', placeItems: 'center',
          }}><Icon name="layers" className="v2-ic" /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Phase templates</div>
            <div className="v2-dim" style={{ fontSize: 11 }}>Your saved configurations and shared plans</div>
          </div>
          <button type="button" className="v2-icon-btn" onClick={onClose} aria-label="Schliessen">
            <Icon name="x" className="v2-ic" />
          </button>
        </div>
        <div className="v2-modal-body" style={{ padding: 16, overflowY: 'auto' }}>
          <div className="v2-eyebrow" style={{ marginBottom: 8 }}>My templates</div>
          <div className="v2-col-gap" style={{ gap: 6, marginBottom: 18 }}>
            {mine.map(t => (
              <Card key={t.id} className="v2-card-tight" style={{ padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</span>
                  <Pill style={{ fontSize: 9 }}>from {t.base}</Pill>
                  <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>
                    edited {t.edited} · used {t.uses}×
                  </span>
                </div>
                <div className="v2-muted v2-mono" style={{ fontSize: 11 }}>{t.note}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  <InEntwicklungKnopf titel={`${t.name} anwenden`} className="v2-btn v2-btn-primary v2-btn-sm">Apply</InEntwicklungKnopf>
                  <InEntwicklungKnopf titel={`${t.name} bearbeiten`} className="v2-btn v2-btn-ghost v2-btn-sm">Edit</InEntwicklungKnopf>
                  <InEntwicklungKnopf titel={`${t.name} duplizieren`} className="v2-btn v2-btn-ghost v2-btn-sm">Duplicate</InEntwicklungKnopf>
                  <InEntwicklungKnopf titel={`${t.name} teilen`} className="v2-btn v2-btn-ghost v2-btn-sm">Share with coach</InEntwicklungKnopf>
                </div>
              </Card>
            ))}
          </div>
          <div className="v2-eyebrow" style={{ marginBottom: 8 }}>Shared with you</div>
          <div className="v2-col-gap" style={{ gap: 6 }}>
            {shared.map(t => (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, flexWrap: 'wrap',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>{t.name}</div>
                  <div className="v2-dim v2-mono" style={{ fontSize: 10 }}>
                    {t.author} · {t.rating} ★ · {t.uses} uses
                  </div>
                </div>
                <InEntwicklungKnopf titel={`${t.name} ansehen`} className="v2-btn v2-btn-sm">Preview</InEntwicklungKnopf>
                <InEntwicklungKnopf titel={`${t.name} importieren`} className="v2-btn v2-btn-sm">Import</InEntwicklungKnopf>
              </div>
            ))}
          </div>
        </div>
        <div className="v2-modal-f">
          <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Close</button>
          <InEntwicklungKnopf titel="New template from scratch" className="v2-btn v2-btn-primary">
            <Icon name="plus" className="v2-ic v2-ic-sm" />New template from scratch
          </InEntwicklungKnopf>
        </div>
      </div>
    </div>
  )
}
