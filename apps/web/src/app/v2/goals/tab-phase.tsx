'use client'

// Drei Tabs: „Phase engine", „Adaptive TDEE" und „Cross-module".
//
// QUELLE: theme-v1/module-goals-pro.jsx:198-489 (`GoalsPhaseView`),
// :491-574 (`GoalsTDEEView`), :576-689 (`GoalsCrossModuleView`).
//
// `[cmd]` Die Datei heisst „-pro", ist aber KEINE Profi-Fassung des
// Moduls: sie definiert fuenf `window.Goals*View`, die der Rahmen in
// den Tabs 2, 3, 4, 9 und 10 anzeigt. Ohne sie waeren fuenf von zehn
// Tabs leer. Beleg im Bericht.
//
// GEAENDERT IST NUR DAS TECHNISCHE: TypeScript, `v2-`-Praefix,
// `color-mix(in srgb, …)` -> `in oklch`, `<div onClick>` -> `<button>`,
// Knoepfe ohne Ziel oeffnen `InEntwicklung`.
//
// `[cmd]` ALLES IST ATTRAPPE.
import * as React from 'react'
import {
  Card, Pill, Icon, Ring, Meter, Row, LineChart, Sparkline, InEntwicklungKnopf,
} from '@lumeos/ui'

import {
  GOAL_PHASES, PHASE_STATE, TDEE_STATE, CONTRIBUTIONS, CONTRIB_WEIGHTS,
  calcGoalProgress, findBottleneck, type Phase,
} from './daten'
import { PhaseEditorModal, PhaseTemplateLibrary } from './phase-editor'
import { ATTRAPPE, attrappeAus } from './ansicht'
import { TdeeKopf } from './tdee-kopf'

/** `weeklyIncrease` -> „Weekly increase". [cmd] module-goals-pro.jsx:334. */
function feldName(k: string): string {
  return k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())
}

function feldWert(v: string | number | number[]): string {
  return Array.isArray(v) ? v.join(' – ') : String(v)
}

// ═══ PHASE ENGINE ════════════════════════════════════════════════
// [cmd] module-goals-pro.jsx:198-489.
export function GoalsPhaseView() {
  const [preview, setPreview] = React.useState<string | null>(null)
  const [editing, setEditing] = React.useState<string | null>(null)
  const [library, setLibrary] = React.useState(false)
  const p = GOAL_PHASES[PHASE_STATE.current]

  return (
    <div className="v2-grid-15">
      <div className="v2-col-gap" style={{ gap: 14 }}>
        {/* Kachel 1: die laufende Phase */}
        <Card attrappe={ATTRAPPE}>
          <div className="v2-goals-phase-kopf">
            <div style={{
              width: 52, height: 52, borderRadius: 12,
              background: `color-mix(in oklch, ${p.color} 18%, transparent)`,
              border: `1px solid color-mix(in oklch, ${p.color} 38%, var(--border))`,
              color: p.color, display: 'grid', placeItems: 'center', flexShrink: 0,
            }}><Icon name="goals" className="v2-ic" style={{ width: 22, height: 22 }} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.015em' }}>{p.name}</span>
                <Pill variant="acc">week {PHASE_STATE.week} of {PHASE_STATE.maxWeeks}</Pill>
                <Pill variant="pos"><span className="v2-dot" style={{ background: 'var(--pos)' }} />on track</Pill>
              </div>
              <div className="v2-muted" style={{ fontSize: 11.5, marginBottom: 8 }}>
                Started {PHASE_STATE.startedOn} · adherence {PHASE_STATE.adherence}%
              </div>
              <Meter value={PHASE_STATE.week} max={PHASE_STATE.maxWeeks} color={p.color} tall />
            </div>
          </div>
          <div className="v2-grid v2-g-cols-4" style={{ gap: 8 }}>
            {([
              ['Weight trend', `${PHASE_STATE.weightTrend} kg/wk`, 'var(--pos)'],
              ['Strength', `+${PHASE_STATE.strengthTrend}%`, 'var(--pos)'],
              ['Body fat', `${PHASE_STATE.bfTrend} %/wk`, 'var(--pos)'],
              ['Adherence', `${PHASE_STATE.adherence}%`, undefined],
            ] as Array<[string, string, string | undefined]>).map(([l, v, c]) => (
              <Card key={l} className="v2-card-tight" style={{ padding: 10 }}>
                <div className="v2-eyebrow">{l}</div>
                <div className="v2-num" style={{ fontSize: 15, color: c }}>{v}</div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Kachel 2: woechentliche Anpassung */}
        <Card title="Weekly auto-adjustment" sub="deterministic rules · no AI" attrappe={ATTRAPPE}>
          <div style={{
            padding: 12, borderRadius: 7,
            background: 'color-mix(in oklch, var(--pos) 6%, var(--surface))',
            border: '1px solid color-mix(in oklch, var(--pos) 25%, var(--border))',
            marginBottom: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <Icon name="check" className="v2-ic v2-ic-sm" style={{ color: 'var(--pos)' }} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>No change this week</span>
              <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>
                confidence {Math.round(PHASE_STATE.recommendation.confidence * 100)}%
              </span>
            </div>
            <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
              {PHASE_STATE.recommendation.reason}
            </div>
          </div>
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Active guards</div>
          <div className="v2-col-gap" style={{ gap: 4 }}>
            {(p.guards || [
              'Calorie cycling per training/rest day',
              'Protein floor 2.0 g/kg',
              'Weekly average ≈ maintenance',
            ]).map(g => (
              <div key={g} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 5,
                fontSize: 11.5, fontFamily: 'var(--font-mono)',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--pos)', flexShrink: 0 }} />
                {g}
              </div>
            ))}
          </div>
        </Card>

        {/* Kachel 3: der Zustandsautomat */}
        <Card title="Phase state machine" sub="9 Phasenarten · aus dem CHECK"
              attrappe={attrappeAus('theme-v1/module-goals-pro.jsx',
                'goal_phases-Schreibweg (G-357) — die neun Arten stehen im CHECK, '
                + 'gelesen wird ueber goals.phase_am, geschrieben nirgends')}>
          <div className="v2-goals-phasen">
            {Object.values(GOAL_PHASES).map(ph => {
              const active = ph.id === PHASE_STATE.current
              const recommended = p.next?.includes(ph.id)
              const gated = Boolean(ph.requires) && PHASE_STATE.experience !== 'advanced'
              return (
                <button
                  key={ph.id} type="button"
                  onClick={() => { if (!gated) setPreview(ph.id) }}
                  disabled={gated}
                  style={{
                    padding: 10, borderRadius: 7, textAlign: 'left', font: 'inherit', color: 'inherit',
                    cursor: gated ? 'not-allowed' : 'pointer',
                    background: active ? `color-mix(in oklch, ${ph.color} 12%, var(--surface))`
                      : preview === ph.id ? `color-mix(in oklch, ${ph.color} 7%, var(--surface))` : 'var(--surface)',
                    border: `1px solid ${active ? `color-mix(in oklch, ${ph.color} 40%, var(--border))`
                      : preview === ph.id ? `color-mix(in oklch, ${ph.color} 30%, var(--border))`
                        : recommended ? 'var(--border-strong)' : 'var(--border)'}`,
                    opacity: gated ? 0.45 : 1,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ width: 7, height: 7, borderRadius: 999, background: ph.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11.5, fontWeight: 600 }}>{ph.name}</span>
                  </div>
                  {active && <Pill variant="acc" style={{ fontSize: 9 }}>current</Pill>}
                  {!active && recommended && (
                    <span className="v2-mono" style={{ fontSize: 9.5, color: 'var(--pos)' }}>→ recommended next</span>
                  )}
                  {!active && !recommended && !gated && (
                    <span className="v2-dim v2-mono" style={{ fontSize: 9.5 }}>switchable</span>
                  )}
                  {gated && <span className="v2-dim v2-mono" style={{ fontSize: 9.5 }}>needs advanced</span>}
                </button>
              )
            })}
          </div>

          {preview && preview !== PHASE_STATE.current && (
            <>
              <div className="v2-divider" />
              <PhasenVorschau ph={GOAL_PHASES[preview]} aktuell={p}
                              onClose={() => setPreview(null)}
                              onEdit={() => setEditing(preview)} />
            </>
          )}

          <div className="v2-divider" />
          <div style={{
            padding: 12, borderRadius: 7,
            background: 'color-mix(in oklch, var(--acc-train) 6%, var(--surface))',
            border: '1px solid color-mix(in oklch, var(--acc-train) 25%, var(--border))',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <Icon name="arrow_right" className="v2-ic v2-ic-sm" style={{ color: 'var(--acc-train)' }} />
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>
                Suggested transition in {PHASE_STATE.suggestedTransition.inWeeks} weeks → {GOAL_PHASES[PHASE_STATE.suggestedTransition.to].name}
              </span>
            </div>
            <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.5, marginBottom: 8 }}>
              {PHASE_STATE.suggestedTransition.why}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <InEntwicklungKnopf titel="Accept &amp; schedule" className="v2-btn v2-btn-primary v2-btn-sm">
                Accept &amp; schedule
              </InEntwicklungKnopf>
              <InEntwicklungKnopf titel="Stay in recomp" className="v2-btn v2-btn-ghost v2-btn-sm">
                Stay in recomp
              </InEntwicklungKnopf>
            </div>
          </div>
        </Card>
      </div>

      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card
          title="Phase parameters" sub={p.name}
          attrappe={attrappeAus('theme-v1/module-goals-pro.jsx',
            'goal_phases.parameters ist ein jsonb und wird gelesen — '
            + 'es fehlt der Schreibweg (G-357)')}
          actions={
            <>
              <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm" onClick={() => setLibrary(true)}>
                <Icon name="layers" className="v2-ic v2-ic-sm" />Templates
              </button>
              <button type="button" className="v2-btn v2-btn-sm" onClick={() => setEditing(PHASE_STATE.current)}>
                <Icon name="edit" className="v2-ic v2-ic-sm" />Edit
              </button>
            </>
          }
        >
          {p.params && Object.entries(p.params).map(([k, v]) => (
            <Row key={k} label={feldName(k)} value={feldWert(v)} />
          ))}
          {p.success && (
            <>
              <div className="v2-divider" />
              <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Success metrics</div>
              {p.success.map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, marginBottom: 4 }}>
                  <Icon name="check" className="v2-ic v2-ic-sm" style={{ color: 'var(--pos)' }} />{s}
                </div>
              ))}
            </>
          )}
        </Card>

        <Card
          title="Expert BB annual" sub="12-month cycle · advanced only"
          attrappe={attrappeAus('theme-v1/module-goals-pro.jsx',
            'expert_bb_annual steht im phase_type-CHECK — '
            + 'es fehlt der Schreibweg (G-357)')}
          actions={
            <button type="button" className="v2-btn v2-btn-sm" onClick={() => setEditing('expert_bb_annual')}>
              <Icon name="edit" className="v2-ic v2-ic-sm" />Customize
            </button>
          }
        >
          <div className="v2-col-gap" style={{ gap: 4 }}>
            {GOAL_PHASES.expert_bb_annual.annual?.map(a => (
              <div key={a.months} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 5, fontSize: 11.5,
              }}>
                <span className="v2-num v2-dim" style={{ width: 40, fontSize: 10, flexShrink: 0 }}>M{a.months}</span>
                <span style={{ fontWeight: 500 }}>{a.phase}</span>
                <span className="v2-dim" style={{ marginLeft: 'auto', fontSize: 10.5 }}>{a.focus}</span>
              </div>
            ))}
          </div>
          <div className="v2-divider" />
          <button type="button" className="v2-btn v2-btn-ghost" style={{ width: '100%' }}
                  onClick={() => setEditing('expert_bb_annual')}>
            Open annual cycle editor
          </button>
        </Card>
      </div>

      {editing && <PhaseEditorModal phaseId={editing} onClose={() => setEditing(null)} />}
      {library && <PhaseTemplateLibrary onClose={() => setLibrary(false)} />}
    </div>
  )
}

/** Die Vorschau einer anderen Phase. [cmd] module-goals-pro.jsx:295-429. */
function PhasenVorschau({ ph, aktuell, onClose, onEdit }: {
  ph: Phase; aktuell: Phase; onClose: () => void; onEdit: () => void
}) {
  return (
    <div style={{
      padding: 14, borderRadius: 8,
      background: `color-mix(in oklch, ${ph.color} 6%, var(--surface))`,
      border: `1px solid color-mix(in oklch, ${ph.color} 28%, var(--border))`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: ph.color, flexShrink: 0 }} />
        <span style={{ fontSize: 14, fontWeight: 600 }}>{ph.name}</span>
        {aktuell.next?.includes(ph.id)
          ? <Pill variant="pos">recommended transition</Pill>
          : <Pill variant="warn">manual switch · not in recommended path</Pill>}
        <button type="button" className="v2-icon-btn" style={{ marginLeft: 'auto' }}
                onClick={onClose} aria-label="Vorschau schliessen">
          <Icon name="x" className="v2-ic v2-ic-sm" />
        </button>
      </div>

      {ph.variants && (
        <div className="v2-grid v2-g-cols-2" style={{ gap: 8, marginBottom: 10 }}>
          {Object.entries(ph.variants).map(([vk, v]) => (
            <Card key={vk} className="v2-card-tight" style={{ padding: 10 }}>
              <div className="v2-eyebrow" style={{ textTransform: 'capitalize', marginBottom: 4 }}>{vk}</div>
              <Row label="Deficit" value={`${v.deficit[0]} … ${v.deficit[1]} kcal`} />
              <Row label="Rate" value={v.rate} />
              <Row label="Protein" value={`${v.protein[0]}–${v.protein[1]} g/kg`} />
              <Row label="Max duration" value={`${v.maxWeeks} wk`} />
              <Row label="Diet break" value={v.dietBreak} />
            </Card>
          ))}
        </div>
      )}

      {ph.params && (
        <>
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Parameters</div>
          {Object.entries(ph.params).map(([k, v]) => (
            <Row key={k} label={feldName(k)} value={feldWert(v)} />
          ))}
        </>
      )}

      {ph.subPhases && (
        <>
          <div className="v2-eyebrow" style={{ marginTop: 10, marginBottom: 6 }}>Sub-phases</div>
          <div className="v2-tbl-wrap">
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th>Stage</th>
                  <th style={{ width: 90 }}>Weeks out</th>
                  <th style={{ width: 90, textAlign: 'right' }}>Deficit</th>
                  <th style={{ width: 100 }}>Cardio</th>
                </tr>
              </thead>
              <tbody>
                {ph.subPhases.map(sp => (
                  <tr key={sp.name}>
                    <td style={{ textTransform: 'capitalize' }}>{sp.name.replace('_', ' ')}</td>
                    <td className="v2-num v2-muted">{sp.weeks}</td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>{sp.deficit ? `${sp.deficit} kcal` : '—'}</td>
                    <td>{sp.cardio || (sp.special ? 'protocol' : '—')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {ph.refeeds && <Row label="Refeeds" value={ph.refeeds} />}
          {ph.peakWeek && <Row label="Peak week" value={ph.peakWeek} />}
        </>
      )}

      {ph.annual && (
        <>
          <div className="v2-eyebrow" style={{ marginTop: 10, marginBottom: 6 }}>12-month cycle</div>
          <div className="v2-col-gap" style={{ gap: 3 }}>
            {ph.annual.map(a => (
              <div key={a.months} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
                background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 5, fontSize: 11.5,
              }}>
                <span className="v2-num v2-dim" style={{ width: 42, fontSize: 10, flexShrink: 0 }}>M{a.months}</span>
                <span style={{ fontWeight: 500, fontSize: 11 }}>{a.phase}</span>
                <span className="v2-dim" style={{ marginLeft: 'auto', fontSize: 10.5 }}>{a.focus}</span>
              </div>
            ))}
          </div>
          <Row label="Auto-transitions" value={ph.autoTransitions ? 'enabled' : 'manual'} />
          <Row label="Coach override" value={ph.coachOverride ? 'allowed' : 'no'} />
        </>
      )}

      {ph.exits && (
        <>
          <div className="v2-eyebrow" style={{ marginTop: 10, marginBottom: 6 }}>Exit conditions</div>
          {ph.exits.map(e => (
            <div key={e} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, marginBottom: 4 }}>
              <Icon name="arrow_right" className="v2-ic v2-ic-sm" style={{ color: ph.color }} />{e}
            </div>
          ))}
        </>
      )}

      {ph.success && (
        <>
          <div className="v2-eyebrow" style={{ marginTop: 10, marginBottom: 6 }}>Success metrics</div>
          {ph.success.map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, marginBottom: 4 }}>
              <Icon name="check" className="v2-ic v2-ic-sm" style={{ color: 'var(--pos)' }} />{s}
            </div>
          ))}
        </>
      )}

      {ph.bestFor && (
        <>
          <div className="v2-eyebrow" style={{ marginTop: 10, marginBottom: 6 }}>Best for</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {ph.bestFor.map(b => <Pill key={b}>{b}</Pill>)}
          </div>
        </>
      )}

      {ph.purpose && (
        <>
          <div className="v2-eyebrow" style={{ marginTop: 10, marginBottom: 6 }}>Purpose</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {ph.purpose.map(b => <Pill key={b}>{b}</Pill>)}
          </div>
        </>
      )}

      {ph.guards && (
        <>
          <div className="v2-eyebrow" style={{ marginTop: 10, marginBottom: 6 }}>Guards that would apply</div>
          <div className="v2-col-gap" style={{ gap: 4 }}>
            {ph.guards.map(g => (
              <div key={g} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 5,
                fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)',
              }}>
                <span style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--warn)', flexShrink: 0 }} />
                {g}
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
        <InEntwicklungKnopf titel={`Switch to ${ph.name}`} className="v2-btn v2-btn-primary v2-btn-sm"
                            grund="`goals.goal_phases` gibt es seit GO-07 und traegt alles fuer einen Wechsel: `transitioned_from`, `recommended_next`, `transition_reason`, `actual_end_date`. Was fehlt, ist der Schreibweg — die Tabelle wird bisher nur gelesen.">
          Switch to {ph.name}
        </InEntwicklungKnopf>
        <button type="button" className="v2-btn v2-btn-sm" onClick={onEdit}>
          <Icon name="edit" className="v2-ic v2-ic-sm" />Customize
        </button>
        <InEntwicklungKnopf titel="Schedule for later" className="v2-btn v2-btn-sm">
          Schedule for later
        </InEntwicklungKnopf>
        <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

// ═══ ADAPTIVE TDEE ═══════════════════════════════════════════════
// [cmd] module-goals-pro.jsx:491-574.
//
// `[read]` **Dieser Tab beschreibt, was GO-13 baut** — die adaptive
// TDEE aus echter Zufuhr und Gewichtsverlauf. Der Umsetzungsplan
// nennt sie „nicht terminierbar": sie braucht zwei volle Wochen
// Daten, und `meals` hat 0 Zeilen. Die Formelbaseline dagegen
// (Mifflin × 1.725) liegt seit GO-04 vor.
// `[cmd]` **DIE KOPFKACHEL IST SEIT GO-16 ECHT** (`tdee-kopf.tsx`) —
// `goals.adaptive_tdee` liefert Formelgrundlage, Status und den
// Glaettungsfaktor. Der Rest des Tabs bleibt Attrappe: die
// Neun-Wochen-Kurve, die Herleitung und die Wochenanpassung brauchen
// eine Historie, die die Funktion nicht fuehrt.
export function GoalsTDEEView({ tdee }: { tdee?: import('../../../lib/goals/lesen').AdaptiverTdee | null }) {
  const t = TDEE_STATE
  const wochenZufuhr = t.weeklyIntakeAvg * 7
  const kalorienDelta = Math.round(t.weightDeltaKg * 7700)
  const rohTDEE = Math.round((wochenZufuhr - t.weightDeltaKg * 7700) / 7)

  return (
    <div className="v2-grid-15">
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <TdeeKopf t={tdee ?? null} />

        <Card title="TDEE evolution" sub="9 weeks · adaptive from real intake + weight data" attrappe={ATTRAPPE}>
          <LineChart h={180} range={[2600, 2900]}
                     xLabels={['wk1', 'wk2', 'wk3', 'wk4', 'wk5', 'wk6', 'wk7', 'wk8', 'wk9']}
                     series={[
                       { data: t.history, color: 'var(--acc-goals)' },
                       { data: Array(9).fill(t.formulaBaseline), color: 'var(--fg-dim)' },
                     ]} />
          <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 11, color: 'var(--fg-muted)', flexWrap: 'wrap' }}>
            <span className="v2-row-gap"><span className="v2-dot" style={{ background: 'var(--acc-goals)' }} />Adaptive TDEE</span>
            <span className="v2-row-gap"><span className="v2-dot" style={{ background: 'var(--fg-dim)' }} />Formula baseline</span>
          </div>
        </Card>

        <Card title="Calculation trace" sub="how this week's number was derived" attrappe={ATTRAPPE}>
          {/* Die Herleitung als Text — wie bei Recovery der Beleg, dass
              die Zahl nicht geraten ist. Einrueckung unveraendert. */}
          <pre className="v2-goals-trace">{`weeklyIntake     = ${wochenZufuhr.toLocaleString('en-US')} kcal
Δweight          = ${t.weightDeltaKg} kg
caloricDelta     = ${t.weightDeltaKg} × 7700 = ${kalorienDelta} kcal
rawTDEE          = (${wochenZufuhr.toLocaleString('en-US')} − (${kalorienDelta})) / 7
                 = ${rohTDEE.toLocaleString('en-US')} kcal/day

EMA (α = ${t.alpha})
  = ${t.alpha} × ${rohTDEE.toLocaleString('en-US')} + ${1 - t.alpha} × ${t.history[t.history.length - 2].toLocaleString('en-US')}
  = ${t.current.toLocaleString('en-US')} kcal/day

cross-module corrections
  training load    ${t.crossModule.trainingLoad > 0 ? '+' : ''}${t.crossModule.trainingLoad} kcal
  recovery penalty ${t.crossModule.recoveryPenalty} kcal`}</pre>
        </Card>
      </div>

      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="Weight · trend vs raw" sub="7-day moving average smooths daily noise" attrappe={ATTRAPPE}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
            <div>
              <div className="v2-eyebrow">7d MA</div>
              <span className="v2-num" style={{ fontSize: 22, fontWeight: 600 }}>{t.weightMA7}</span>
              <span className="v2-dim" style={{ fontSize: 11 }}> kg</span>
            </div>
            <div>
              <div className="v2-eyebrow">Today raw</div>
              <span className="v2-num" style={{ fontSize: 16, color: 'var(--fg-dim)' }}>{t.weightRaw}</span>
              <span className="v2-dim" style={{ fontSize: 10 }}> kg</span>
            </div>
          </div>
          <Sparkline data={[80.1, 79.9, 80.2, 79.7, 79.8, 79.5, 79.6, 79.4, 79.42]} color="var(--acc-goals)" h={44} />
          <div className="v2-dim" style={{ fontSize: 11, marginTop: 8, lineHeight: 1.45 }}>
            Daily swings up to ±0.5 kg are water/glycogen. Only the MA drives adjustments.
          </div>
        </Card>

        <Card title="Last adjustment" attrappe={ATTRAPPE}>
          <Row label="Week" value={`wk ${t.lastAdjustment.week}`} />
          <Row label="Action" value={`${t.lastAdjustment.delta > 0 ? '+' : ''}${t.lastAdjustment.delta} kcal`} />
          <div className="v2-divider" />
          <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>{t.lastAdjustment.reason}</div>
        </Card>

        <Card title="Method" attrappe={ATTRAPPE}>
          <Row label="Weeks 1–2" value="Mifflin-St Jeor" />
          <Row label="Week 2+" value="Adaptive (real data)" />
          <Row label="Smoothing" value={`EMA α = ${t.alpha}`} />
          <Row label="Energy density" value="7,700 kcal / kg" />
          <Row label="Auto-adjust range" value="±100–200 kcal" />
        </Card>
      </div>
    </div>
  )
}

// ═══ CROSS-MODULE ════════════════════════════════════════════════
// [cmd] module-goals-pro.jsx:576-689.
export function GoalsCrossModuleView() {
  const weights = CONTRIB_WEIGHTS.body_composition_gain
  const progress = calcGoalProgress(CONTRIBUTIONS, weights)
  const bottleneck = findBottleneck(CONTRIBUTIONS, weights)
  const statusColor = ({
    excellent: 'var(--pos)', on_track: 'var(--acc-recov)',
    needs_attention: 'var(--warn)', at_risk: 'var(--neg)',
  } as Record<string, string>)[progress.status]

  return (
    <div className="v2-grid-15">
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card attrappe={ATTRAPPE}>
          <div className="v2-goals-cross-kopf">
            <Ring value={progress.overall} max={100} color={statusColor} label="overall" size={104} stroke={8} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>Cross-module goal progress</span>
                <Pill style={{
                  borderColor: `color-mix(in oklch, ${statusColor} 35%, var(--border))`,
                  color: statusColor,
                }}>{progress.status.replace('_', ' ')}</Pill>
              </div>
              <div className="v2-muted" style={{ fontSize: 12, lineHeight: 1.5, marginBottom: 10 }}>
                Goals is the single source of truth. Every module posts a daily contribution score; this is the weighted aggregate for a{' '}
                <span className="v2-mono" style={{ color: 'var(--fg)' }}>body_composition_gain</span> goal.
              </div>
              <div className="v2-dim v2-mono" style={{ fontSize: 10.5 }}>updated 12 min ago · 5 modules reporting</div>
            </div>
          </div>
        </Card>

        <Card title="Module contributions" sub="score × weight = contribution" attrappe={ATTRAPPE}>
          <div className="v2-tbl-wrap">
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th>Module</th>
                  <th style={{ width: 70, textAlign: 'right' }}>Score</th>
                  <th style={{ width: 70, textAlign: 'right' }}>Weight</th>
                  <th style={{ width: 150 }}>Contribution</th>
                  <th style={{ width: 60, textAlign: 'right' }}>Points</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(weights).map(([m, w]) => {
                  const s = CONTRIBUTIONS[m] ?? 0
                  const isBottleneck = bottleneck?.module === m
                  return (
                    <tr key={m} style={isBottleneck ? { background: 'color-mix(in oklch, var(--warn) 6%, transparent)' } : undefined}>
                      <td style={{ textTransform: 'capitalize' }}>
                        {m}
                        {isBottleneck && <Pill variant="warn" style={{ marginLeft: 8, fontSize: 9 }}>bottleneck</Pill>}
                      </td>
                      <td className="v2-num" style={{
                        textAlign: 'right',
                        color: s >= 85 ? 'var(--pos)' : s >= 70 ? 'var(--fg)' : 'var(--warn)',
                      }}>{s}</td>
                      <td className="v2-num v2-muted" style={{ textAlign: 'right' }}>{Math.round(w * 100)}%</td>
                      <td><Meter value={s} max={100} color={isBottleneck ? 'var(--warn)' : 'var(--acc-goals)'} tall /></td>
                      <td className="v2-num" style={{ textAlign: 'right' }}>{progress.breakdown[m]}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {bottleneck && (
          <Card attrappe={ATTRAPPE} style={{
            border: '1px solid color-mix(in oklch, var(--warn) 30%, var(--border))',
            background: 'color-mix(in oklch, var(--warn) 5%, var(--surface))',
          }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 3, alignSelf: 'stretch', background: 'var(--warn)', borderRadius: 2, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="v2-eyebrow" style={{ color: 'var(--warn)', marginBottom: 4 }}>Bottleneck identified</div>
                <div style={{ fontSize: 15, fontWeight: 600, textTransform: 'capitalize', marginBottom: 6 }}>
                  {bottleneck.module} is limiting your progress
                </div>
                <div className="v2-muted" style={{ fontSize: 12, lineHeight: 1.55, marginBottom: 10 }}>
                  Score {bottleneck.current} vs. {bottleneck.avg} average across modules — a weighted gap of {bottleneck.gap} points. {bottleneck.rec}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <a href="/v2/recovery" className="v2-btn v2-btn-primary v2-btn-sm" style={{ textTransform: 'capitalize' }}>
                    Open {bottleneck.module}
                  </a>
                  <InEntwicklungKnopf titel="Ask Buddy for a plan" className="v2-btn v2-btn-ghost v2-btn-sm">
                    Ask Buddy for a plan
                  </InEntwicklungKnopf>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="Achievement probability" sub="based on current trajectory" attrappe={ATTRAPPE}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12, flexWrap: 'wrap' }}>
            <Ring value={78} max={100} color="var(--pos)" label="likely" size={88} stroke={7} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="v2-num" style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>78%</div>
              <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.45 }}>
                If you keep this up, you reach 78 kg @ 12% BF in{' '}
                <span className="v2-num" style={{ color: 'var(--fg)' }}>11 weeks</span> — 2 weeks ahead of deadline.
              </div>
            </div>
          </div>
          <div className="v2-divider" />
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Scenario modeling</div>
          <div className="v2-col-gap" style={{ gap: 4 }}>
            {([
              { s: 'Sleep → 7.5h avg', d: '3 weeks earlier', pos: true },
              { s: 'Nutrition adherence → 95%', d: '1.5 weeks earlier', pos: true },
              { s: 'Miss 2 sessions/wk', d: '4 weeks later', pos: false },
              { s: 'Add 2nd cold plunge/wk', d: '0.5 weeks earlier', pos: true },
            ]).map(sc => (
              <div key={sc.s} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 5, fontSize: 11.5,
              }}>
                <span style={{ flex: 1, minWidth: 0 }}>{sc.s}</span>
                <span className="v2-num" style={{ fontSize: 11, color: sc.pos ? 'var(--pos)' : 'var(--warn)' }}>{sc.d}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Weekly report" sub="week 9 · generated Sun 07:00" attrappe={ATTRAPPE}>
          <Row label="Overall score" value={`${progress.overall} (+3 vs wk 8)`} />
          <Row label="Top contributor" value="Supplements · 94" />
          <Row label="Bottleneck" value={bottleneck ? `${bottleneck.module} · ${bottleneck.current}` : '—'} />
          <Row label="Weight Δ" value="−0.18 kg" />
          <Row label="Strength Δ" value="+1.2%" />
          <div className="v2-divider" />
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Next week</div>
          <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
            Hold calories. Prioritise sleep — pushing recovery from 74 → 85 lifts overall by ~2.2 points and is the single highest-leverage change available.
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            <InEntwicklungKnopf titel="Export PDF" className="v2-btn v2-btn-sm">
              <Icon name="download" className="v2-ic v2-ic-sm" />Export PDF
            </InEntwicklungKnopf>
            <InEntwicklungKnopf titel="Share with coach" className="v2-btn v2-btn-ghost v2-btn-sm">
              Share with coach
            </InEntwicklungKnopf>
          </div>
        </Card>
      </div>
    </div>
  )
}
