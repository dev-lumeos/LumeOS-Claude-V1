'use client'

// Vier Tabs des Training-Moduls: Progression, Volume landmarks,
// Standards, Calendar.
//
// QUELLE: theme-v1/module-training-spec.jsx (713 Zeilen). Die Datei ist
// KEINE zweite Fassung des Moduls — sie ist die Fortsetzung. Sie
// definiert `window.TrainingProgressionView`,
// `window.TrainingLandmarksView`, `window.TrainingStandardsView` und
// `window.TrainingCalendarView`; `module-training.jsx` zeigt genau
// diese vier in den Tabs 5-8 an. Die drei Rechner-Modale derselben
// Datei stehen in `modale.tsx`.
//
// `[read]` DIE FORMELN BLEIBEN STEHEN — mit EINER beauftragten
// Ausnahme: **C-105 hat MAV entfernt** (DO_NOT_IMPLEMENT, kein
// Ersatzwert); `landmarkStatus` und `feedbackVerdict` sind darum
// nicht mehr vorlagengleich, Begruendung am Block C. Unveraendert:
// die Kategorie-Schwellen der Kraftstandards und `trainingScore`
// (0.40/0.30/0.20/0.10).
//
// GEAENDERT IST NUR DAS TECHNISCHE: TypeScript, `v2-`-Praefix,
// `color-mix(in srgb, …)` -> `in oklch` wie im Rest von v2,
// Knoepfe ohne Ziel oeffnen `InEntwicklung`.
//
// `[cmd]` ALLES IST ATTRAPPE.
import * as React from 'react'
import { Card, Pill, Icon, Ring, Row, InEntwicklungKnopf } from '@lumeos/ui'

import { holeEvidenz } from '../../../lib/evidenz/registry'
import { ATTRAPPE } from './ansicht'

// ── Block A: classification + set types ─────────────────────────
// [cmd] module-training-spec.jsx:5-17.
const SET_TYPES = [
  { id: 'working', label: 'Working', desc: 'Normaler Arbeitssatz', volume: true },
  { id: 'warmup', label: 'Warm-up', desc: 'Aufwärmsatz', volume: false },
  { id: 'dropset', label: 'Drop set', desc: 'Reduziertes Gewicht ohne Pause', volume: true },
  { id: 'failure', label: 'Failure', desc: 'Bis zum Versagen', volume: true },
]

// ── Block B: 5 progression models ───────────────────────────────
// [cmd] module-training-spec.jsx:20-56. Die deutschen Regeltexte
// stehen SO in der Vorlage — nicht uebersetzt, nicht angeglichen.
const PROGRESSION_MODELS = [
  {
    id: 'linear', name: 'Linear Progression', level: 'Beginner', color: 'var(--acc-recov)',
    rule: 'Alle Sets in Rep-Range oder besser → next_weight += weight_increment',
    formula: 'next_weight = current_weight + 2.5 kg',
    use: 'Beginner · konsistente Progression',
    active: false,
  },
  {
    id: 'double', name: 'Double Progression', level: 'Intermediate', color: 'var(--acc-train)',
    rule: 'Phase 1 Reps hoch bis max · Phase 2 Gewicht hoch, Reps zurücksetzen',
    formula: 'reps < max_reps ? reps += 1 : (weight += inc, reps = min_reps)',
    use: 'Hypertrophie · Intermediate · Standard-Modell',
    active: true,
  },
  {
    id: 'wave', name: 'Wave Loading', level: 'Intermediate+', color: 'var(--acc-goals)',
    rule: 'Welle [75%, 85%, 95%, Deload 65%] des Trainingsgewichts',
    formula: 'intensity = wave[currentWeek % 4]',
    use: 'Periodisiertes Krafttraining',
    active: false,
  },
  {
    id: 'rpe', name: 'RPE-Autoregulation', level: 'Advanced', color: 'var(--acc-buddy)',
    rule: 'session_rpe über/unter Ziel → Gewicht ×(1 ∓ adjustmentFactor)',
    formula: 'rpe > 8 + range ? w × 0.95 : rpe < 8 − range ? w × 1.025 : w',
    use: 'Advanced · tagesabhängige Anpassung',
    active: false,
  },
  {
    id: 'dup', name: 'DUP', level: 'Advanced', color: 'var(--neg)',
    rule: 'Rotation Kraft (3-5 @ 87-93%) → Hypertrophie (8-12 @ 70-80%) → Power (2-4 @ 85-90%)',
    formula: 'block = rotation[sessionIndex % 3]',
    use: 'Abwechslungsreiche Stimuli · Advanced',
    active: false,
  },
]

// [cmd] module-training-spec.jsx:58-63.
const DELOAD_TRIGGERS = [
  { t: 'Reps fallen 3 Sätze hintereinander ab', hit: false, detail: 'Bench: 5,5,5,4 → kein Abfall über 3 Sätze' },
  { t: 'RPE > 9 in 2+ Sessions in Folge', hit: false, detail: 'Letzte 2 Sessions: RPE 8.0 / 8.5' },
  { t: 'Keine Progression für 3 Sessions (Übung)', hit: true, detail: 'Lateral Raise: 9 kg seit 4 Sessions' },
  { t: 'User-Feedback Performance 😩 in 2+ Sessions', hit: false, detail: 'Letzte Bewertungen: 🙂 / 😐' },
]

/** [cmd] module-training-spec.jsx:65-171. */
export function TrainingProgressionView() {
  const [sel, setSel] = React.useState('double')
  const m = PROGRESSION_MODELS.find(x => x.id === sel) ?? PROGRESSION_MODELS[1]
  const triggered = DELOAD_TRIGGERS.filter(t => t.hit).length
  return (
    <div className="v2-grid-15">
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="Progression models" sub="5 models · one per routine · deterministic" attrappe={ATTRAPPE}>
          <div className="v2-col-gap" style={{ gap: 6 }}>
            {PROGRESSION_MODELS.map(p => {
              const on = p.id === sel
              return (
                <button
                  key={p.id} type="button" onClick={() => setSel(p.id)}
                  aria-pressed={on}
                  style={{
                    padding: 12, borderRadius: 7, cursor: 'pointer', textAlign: 'left',
                    font: 'inherit', color: 'inherit', width: '100%',
                    background: on ? `color-mix(in oklch, ${p.color} 9%, var(--surface))` : 'var(--surface)',
                    border: `1px solid ${on ? `color-mix(in oklch, ${p.color} 35%, var(--border))` : 'var(--border)'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                    <span style={{ width: 7, height: 7, borderRadius: 999, background: p.color }} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                    <Pill style={{ fontSize: 9.5 }}>{p.level}</Pill>
                    {p.active && <Pill variant="acc" style={{ fontSize: 9.5 }}>active on Push B</Pill>}
                  </div>
                  <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.5, marginBottom: on ? 8 : 0 }}>{p.rule}</div>
                  {on && (
                    <>
                      <div style={{
                        padding: '8px 10px', background: 'var(--bg-elev)', border: '1px solid var(--border)',
                        borderRadius: 5, fontFamily: 'var(--font-mono)', fontSize: 11,
                        color: 'var(--fg-muted)', marginBottom: 8, overflowX: 'auto',
                      }}>{p.formula}</div>
                      <div className="v2-dim" style={{ fontSize: 10.5 }}>{p.use}</div>
                    </>
                  )}
                </button>
              )
            })}
          </div>
          <div className="v2-divider" />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <InEntwicklungKnopf titel={`Apply ${m.name} to Push B`} className="v2-btn v2-btn-primary v2-btn-sm">
              Apply {m.name} to Push B
            </InEntwicklungKnopf>
            <InEntwicklungKnopf titel="Apply to all routines" className="v2-btn v2-btn-ghost v2-btn-sm">
              Apply to all routines
            </InEntwicklungKnopf>
          </div>
        </Card>

        <Card title="Next-session prescription" sub={`computed by ${m.name}`} attrappe={ATTRAPPE}>
          <div className="v2-tbl-wrap">
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th>Exercise</th>
                  <th style={{ width: 130 }}>Last session</th>
                  <th style={{ width: 90 }}>Phase</th>
                  <th style={{ width: 140 }}>Prescription</th>
                </tr>
              </thead>
              <tbody>
                {([
                  ['Bench Press', '5,5,5,5,4 @ 117.5', 'reps', '5×5 @ 117.5 kg'],
                  ['Incline DB Press', '8,8,7,7 @ 38', 'reps', '4×8 @ 38 kg'],
                  ['OHP · seated', '6,6,6,6 @ 65', 'weight', '4×6 @ 67.5 kg ↑'],
                  ['Cable Fly', '12,12,12 @ 22', 'weight', '3×12 @ 24 kg ↑'],
                  ['Lateral Raise', '15,14,12 @ 9', 'stalled', '3×15 @ 9 kg · deload flag'],
                  ['Triceps Pushdown', '12,12,10 @ 38', 'reps', '3×12 @ 38 kg'],
                ] as Array<[string, string, string, string]>).map(r => (
                  <tr key={r[0]}>
                    <td>{r[0]}</td>
                    <td className="v2-num v2-muted" style={{ fontSize: 11 }}>{r[1]}</td>
                    <td>
                      <Pill style={{
                        fontSize: 9.5,
                        color: r[2] === 'weight' ? 'var(--pos)' : r[2] === 'stalled' ? 'var(--warn)' : 'var(--fg-muted)',
                      }}>{r[2]}</Pill>
                    </td>
                    <td className="v2-num" style={{
                      fontSize: 11.5,
                      color: r[3].includes('↑') ? 'var(--pos)' : r[3].includes('deload') ? 'var(--warn)' : 'var(--fg)',
                    }}>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card
          title="Fatigue detection" sub={`${triggered} of 4 triggers active`}
          attrappe={ATTRAPPE}
          actions={triggered > 0 ? <Pill variant="warn">deload suggested</Pill> : <Pill variant="pos">clear</Pill>}
        >
          <div className="v2-col-gap" style={{ gap: 6 }}>
            {DELOAD_TRIGGERS.map(t => (
              <div key={t.t} style={{
                padding: 10, borderRadius: 6,
                background: t.hit ? 'color-mix(in oklch, var(--warn) 7%, var(--surface))' : 'var(--surface)',
                border: `1px solid ${t.hit ? 'color-mix(in oklch, var(--warn) 28%, var(--border))' : 'var(--border)'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: t.hit ? 'var(--warn)' : 'var(--fg-dim)', flexShrink: 0 }} />
                  <span style={{ fontSize: 11.5, fontWeight: t.hit ? 600 : 400, color: t.hit ? 'var(--fg)' : 'var(--fg-muted)' }}>{t.t}</span>
                </div>
                <div className="v2-dim v2-mono" style={{ fontSize: 10, paddingLeft: 14 }}>{t.detail}</div>
              </div>
            ))}
          </div>
          <div className="v2-divider" />
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Deload protocol</div>
          <Row label="Weight reduction" value="−10%" />
          <Row label="Set reduction" value="2/3 of normal" />
          <Row label="Duration" value="1 week" />
          <Row label="Threshold" value="3 sessions without progression" />
          <InEntwicklungKnopf titel="Schedule deload week" className="v2-btn v2-btn-sm"
                              style={{ width: '100%', marginTop: 10 }}>
            Schedule deload week
          </InEntwicklungKnopf>
        </Card>

        <Card title="Set types" sub="volume counting" attrappe={ATTRAPPE}>
          {SET_TYPES.map(s => (
            <div key={s.id} className="v2-row">
              <span className="v2-row-l">
                <span className="v2-mono" style={{ fontSize: 11 }}>{s.label}</span>
                <span className="v2-dim" style={{ fontSize: 10 }}>{s.desc}</span>
              </span>
              <span className="v2-row-r" style={{ color: s.volume ? 'var(--pos)' : 'var(--fg-dim)' }}>
                {s.volume ? 'counts' : 'excluded'}
              </span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

// ── Block C: Volume landmarks ───────────────────────────────────
// [cmd] module-training-spec.jsx:174-185. **C-105 (crawl_025,
// RP_VOLUME_LANDMARKS_FRAMEWORK: HEURISTIC, LABEL_HEURISTIC):**
//
//   MAV ist ENTFERNT — DO_NOT_IMPLEMENT, ohne Ersatzwert. Die
//   „approaching MRV"-Zone und der „MAV +1"-Spruch hingen daran.
//   MEV bleibt als RICHTUNGSHINWEIS (USE_DIRECTIONAL_GUIDANCE):
//   „darunter ist ein Wachstumsreiz unwahrscheinlich" — die Zahl je
//   Muskelgruppe ist Orientierung, kein Messwert.
//   MRV und das RP-Rahmenwerk sind als HEURISTIK beschriftet —
//   Coaching-Tradition (Israetel/RP), kein wissenschaftlicher
//   Konsens; die Meta-Regressionen (Sports Medicine 2017) stuetzen
//   nur „mehr Volumen -> mehr Hypertrophie, abflachend".
type Landmark = {
  m: string; mev: number; mrv: number
  cur: number; pump: number; sore: number; points: number
}

const LANDMARKS: Landmark[] = [
  { m: 'Chest', mev: 10, mrv: 22, cur: 14, pump: 2.6, sore: 1.4, points: 7 },
  { m: 'Back', mev: 12, mrv: 25, cur: 18, pump: 2.4, sore: 1.8, points: 9 },
  { m: 'Shoulders', mev: 8, mrv: 20, cur: 10, pump: 1.8, sore: 1.2, points: 6 },
  { m: 'Biceps', mev: 8, mrv: 20, cur: 14, pump: 2.8, sore: 1.3, points: 8 },
  { m: 'Triceps', mev: 6, mrv: 18, cur: 14, pump: 2.2, sore: 1.6, points: 8 },
  { m: 'Quads', mev: 8, mrv: 20, cur: 18, pump: 2.0, sore: 2.6, points: 11 },
  { m: 'Hamstrings', mev: 6, mrv: 16, cur: 9, pump: 1.6, sore: 1.4, points: 5 },
  { m: 'Glutes', mev: 4, mrv: 16, cur: 10, pump: 2.2, sore: 1.5, points: 6 },
  { m: 'Calves', mev: 8, mrv: 20, cur: 6, pump: 1.4, sore: 1.1, points: 4 },
  { m: 'Abs', mev: 6, mrv: 20, cur: 8, pump: 2.0, sore: 1.2, points: 5 },
]

/**
 * Drei Lagen statt vier: unter MEV (Richtungshinweis), im Band
 * MEV–MRV, ueber MRV (Heuristik). Exportiert, damit die Pruefung sie
 * danebenlegen kann.
 */
export function landmarkStatus(l: Landmark) {
  if (l.cur < l.mev) return { k: 'below_mev', c: 'var(--warn)', l: 'below MEV (guide)' }
  if (l.cur > l.mrv) return { k: 'over_mrv', c: 'var(--neg)', l: 'over MRV (heuristic)' }
  return { k: 'in_band', c: 'var(--pos)', l: 'in MEV–MRV band' }
}

/** [cmd] module-training-spec.jsx:193-198 — ohne den „MAV +1"-Zweig:
 *  die Richtung bleibt, der Zahlwert ist entfernt (C-105). */
export function feedbackVerdict(l: Landmark) {
  if (l.points < 5) return { t: 'collecting', c: 'var(--fg-dim)', d: `${l.points} of 5 data points` }
  if (l.pump >= 2.5 && l.sore <= 1.5) return { t: 'can handle more', c: 'var(--pos)', d: 'pump high, soreness low' }
  if (l.sore >= 2.5 && l.pump <= 1.5) return { t: 'reduce volume', c: 'var(--warn)', d: 'soreness high, pump low' }
  return { t: 'no change', c: 'var(--fg-muted)', d: 'data point logged' }
}

/** [cmd] module-training-spec.jsx:200-326. */
export function TrainingLandmarksView() {
  const push = LANDMARKS.filter(l => ['Chest', 'Shoulders', 'Triceps'].includes(l.m)).reduce((s, l) => s + l.cur, 0)
  const pull = LANDMARKS.filter(l => ['Back', 'Biceps'].includes(l.m)).reduce((s, l) => s + l.cur, 0)
  const ratio = +(push / pull).toFixed(2)
  return (
    <div>
      {/* Die vier Zahlenkacheln tragen die Marke OHNE Begruendungstext:
          `attrappe` als `true` statt als Satz. `[cmd]` Mit dem Satz ist
          die Begruendung dreimal so lang wie die Kachel und schiebt die
          Zahl aus dem Blick — am Bildschirm nachgesehen. Die Marke
          bleibt, der Grund steht an der grossen Kachel darunter. */}
      <div className="v2-grid v2-g-cols-4" style={{ gap: 10, marginBottom: 14 }}>
        <Card className="v2-card-tight" style={{ padding: 14 }} attrappe>
          <div className="v2-eyebrow">In MEV–MRV band</div>
          <div className="v2-num" style={{ fontSize: 22, color: 'var(--pos)' }}>
            {LANDMARKS.filter(l => landmarkStatus(l).k === 'in_band').length}
          </div>
          <div className="v2-dim" style={{ fontSize: 11 }}>of {LANDMARKS.length} muscle groups</div>
        </Card>
        <Card className="v2-card-tight" style={{ padding: 14 }} attrappe>
          <div className="v2-eyebrow">Below MEV</div>
          <div className="v2-num" style={{ fontSize: 22, color: 'var(--warn)' }}>
            {LANDMARKS.filter(l => landmarkStatus(l).k === 'below_mev').length}
          </div>
          <div className="v2-dim" style={{ fontSize: 11 }}>growth stimulus unlikely (guide)</div>
        </Card>
        <Card className="v2-card-tight" style={{ padding: 14 }} attrappe>
          <div className="v2-eyebrow">Over MRV</div>
          <div className="v2-num" style={{ fontSize: 22, color: 'var(--neg)' }}>
            {LANDMARKS.filter(l => landmarkStatus(l).k === 'over_mrv').length}
          </div>
          <div className="v2-dim" style={{ fontSize: 11 }}>heuristic ceiling · consider deload</div>
        </Card>
        <Card className="v2-card-tight" style={{ padding: 14 }} attrappe>
          <div className="v2-eyebrow">Push : Pull ratio</div>
          <div className="v2-num" style={{ fontSize: 22, color: Math.abs(ratio - 1) <= 0.15 ? 'var(--pos)' : 'var(--warn)' }}>{ratio}</div>
          <div className="v2-dim" style={{ fontSize: 11 }}>{push} push / {pull} pull sets · target ~1.0</div>
        </Card>
      </div>

      <Card title="Volume landmarks · sets per week"
            sub={`RP-Rahmenwerk — Heuristik (Grad ${holeEvidenz('RP_VOLUME_LANDMARKS_FRAMEWORK').grad}) · Orientierung, kein Messwert`}
            attrappe={ATTRAPPE}>
        <div className="v2-col-gap" style={{ gap: 4 }}>
          {LANDMARKS.map(l => {
            const st = landmarkStatus(l)
            const fb = feedbackVerdict(l)
            const scale = 28
            return (
              <div key={l.m} className="v2-train-landmark-row">
                <span style={{ fontSize: 12 }}>{l.m}</span>
                <div style={{ position: 'relative', height: 16, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden' }}>
                  {/* C-105: drei Zonen statt vier — die MAV-Grenze ist
                      entfernt (DO_NOT_IMPLEMENT, kein Ersatzwert). */}
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(l.mev / scale) * 100}%`, background: 'color-mix(in oklch, var(--warn) 14%, transparent)' }} />
                  <div style={{ position: 'absolute', left: `${(l.mev / scale) * 100}%`, top: 0, bottom: 0, width: `${((l.mrv - l.mev) / scale) * 100}%`, background: 'color-mix(in oklch, var(--pos) 16%, transparent)' }} />
                  <div style={{ position: 'absolute', left: `${(l.mrv / scale) * 100}%`, top: 0, right: 0, bottom: 0, background: 'color-mix(in oklch, var(--neg) 14%, transparent)' }} />
                  <div style={{ position: 'absolute', left: 0, top: 3, height: 10, width: `${(l.cur / scale) * 100}%`, background: st.c, opacity: 0.85, borderRadius: 3 }} />
                  {([['mev', l.mev], ['mrv', l.mrv]] as Array<[string, number]>).map(([k, v]) => (
                    <div key={k} style={{ position: 'absolute', left: `${(v / scale) * 100}%`, top: 0, bottom: 0, width: 1, background: 'var(--fg-dim)', opacity: 0.55 }} />
                  ))}
                </div>
                <span className="v2-num" style={{ fontSize: 11.5, textAlign: 'right', color: st.c, fontWeight: 500 }}>{l.cur} sets</span>
                <Pill style={{ borderColor: `color-mix(in oklch, ${st.c} 32%, var(--border))`, color: st.c, fontSize: 9.5 }}>{st.l}</Pill>
                <div style={{ textAlign: 'right' }}>
                  <div className="v2-num" style={{ fontSize: 10.5, color: fb.c }}>{fb.t}</div>
                  <div className="v2-dim" style={{ fontSize: 9.5 }}>{fb.d}</div>
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 12, fontSize: 10, color: 'var(--fg-muted)', flexWrap: 'wrap' }}>
          <span className="v2-row-gap"><span style={{ width: 12, height: 10, background: 'color-mix(in oklch, var(--warn) 14%, transparent)', borderRadius: 2 }} />below MEV (guide)</span>
          <span className="v2-row-gap"><span style={{ width: 12, height: 10, background: 'color-mix(in oklch, var(--pos) 16%, transparent)', borderRadius: 2 }} />MEV → MRV</span>
          <span className="v2-row-gap"><span style={{ width: 12, height: 10, background: 'color-mix(in oklch, var(--neg) 14%, transparent)', borderRadius: 2 }} />over MRV (heuristic)</span>
        </div>
        <div className="v2-divider" />
        <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.5 }}>
          C-105: MEV ist ein Richtungshinweis, MRV eine Heuristik aus
          der Coaching-Praxis (Renaissance Periodization, Israetel) —
          die Zahlen je Muskelgruppe sind Orientierung, keine
          Messwerte. Die fruehere MAV-Zone ist entfernt: fuer sie gibt
          es keinen Beleg und keinen Ersatzwert. Wissenschaftlich
          gestuetzt ist nur die Richtung „mehr Wochenvolumen → mehr
          Hypertrophie, abflachend" (Meta-Regression, Sports Medicine
          2017).
        </div>
      </Card>

      <div style={{ height: 14 }} />
      <div className="v2-grid v2-g-cols-2">
        <Card title="Feedback loop" sub="pump + soreness → Richtung, kein Punktwert" attrappe={ATTRAPPE}>
          <div className="v2-dim" style={{ fontSize: 11.5, marginBottom: 12, lineHeight: 1.55 }}>
            After each session you rate pump (1–3) and soreness (1–3)
            per muscle group. After 5 data points the loop suggests a
            DIRECTION — C-105: die frühere „personal_mav += 1"-Regel
            ist entfernt, MAV gibt es nicht mehr.
          </div>
          <pre style={{
            margin: 0, padding: 12, background: 'var(--bg-elev)', border: '1px solid var(--border)',
            borderRadius: 6, fontSize: 11, lineHeight: 1.7, color: 'var(--fg-muted)',
            whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)',
          }}>{`IF pump ≥ 2.5 AND soreness ≤ 1.5
   → suggest: more volume possible (direction only)

IF soreness ≥ 2.5 AND pump ≤ 1.5
   → personal_mrv = MIN(mrv, current_sets)   // heuristic cap

ELSE
   → no change · data point logged

min 5 entries per muscle group`}</pre>
        </Card>
        <Card title="Post-workout feedback" sub="Push B · logged 2 min ago" attrappe={ATTRAPPE}>
          <div className="v2-col-gap" style={{ gap: 8 }}>
            {['Chest', 'Shoulders', 'Triceps'].map(mg => (
              <div key={mg}>
                <div className="v2-train-feedback-row">
                  <span style={{ fontSize: 12, width: 78 }}>{mg}</span>
                  <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>pump</span>
                  <div style={{ display: 'flex', gap: 3, flex: 1 }}>
                    {[1, 2, 3].map(v => (
                      <InEntwicklungKnopf key={v} titel={`${mg} · pump ${v}`} className="v2-train-score-btn"
                        style={{
                          flex: 1, height: 22, borderRadius: 4, cursor: 'pointer', border: 0,
                          background: v <= 2 ? 'var(--pos)' : 'var(--surface-2)', opacity: v <= 2 ? 0.5 + v * 0.2 : 1,
                          color: v <= 2 ? 'var(--bg)' : 'var(--fg-dim)', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
                        }}>{v}</InEntwicklungKnopf>
                    ))}
                  </div>
                  <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>sore</span>
                  <div style={{ display: 'flex', gap: 3, flex: 1 }}>
                    {[1, 2, 3].map(v => (
                      <InEntwicklungKnopf key={v} titel={`${mg} · soreness ${v}`} className="v2-train-score-btn"
                        style={{
                          flex: 1, height: 22, borderRadius: 4, cursor: 'pointer', border: 0,
                          background: v <= 1 ? 'var(--warn)' : 'var(--surface-2)', opacity: v <= 1 ? 0.7 : 1,
                          color: v <= 1 ? 'var(--bg)' : 'var(--fg-dim)', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
                        }}>{v}</InEntwicklungKnopf>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="v2-divider" />
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Session rating</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['😩', '😐', '🙂', '💪'].map((e, i) => (
              <InEntwicklungKnopf key={e} titel={`Session rating ${e}`}
                                  className={i === 2 ? 'v2-btn v2-btn-primary v2-btn-sm' : 'v2-btn v2-btn-sm'}
                                  style={{ flex: 1, fontSize: 15 }}>{e}</InEntwicklungKnopf>
            ))}
          </div>
          <InEntwicklungKnopf titel="Submit feedback" className="v2-btn v2-btn-primary"
                              style={{ width: '100%', marginTop: 10 }}>
            <Icon name="check" className="v2-ic v2-ic-sm" />Submit feedback
          </InEntwicklungKnopf>
        </Card>
      </div>
    </div>
  )
}

// ── Strength standards + training score ─────────────────────────
/** [cmd] module-training-spec.jsx:329-396. Die Gewichtung bleibt. */
export function TrainingStandardsView() {
  const bw = 79.4
  const lifts = [
    { n: 'Bench Press', e1rm: 122.5, std: { beginner: 0.75, novice: 1.0, intermediate: 1.25, advanced: 1.6, elite: 2.0 } },
    { n: 'Squat', e1rm: 165, std: { beginner: 1.0, novice: 1.35, intermediate: 1.75, advanced: 2.2, elite: 2.75 } },
    { n: 'Deadlift', e1rm: 192, std: { beginner: 1.25, novice: 1.65, intermediate: 2.1, advanced: 2.6, elite: 3.2 } },
    { n: 'OHP', e1rm: 72.5, std: { beginner: 0.45, novice: 0.65, intermediate: 0.85, advanced: 1.1, elite: 1.4 } },
  ]
  const cat = (ratio: number, std: typeof lifts[number]['std']) => {
    if (ratio >= std.elite) return { l: 'Elite', c: 'var(--acc-buddy)' }
    if (ratio >= std.advanced) return { l: 'Advanced', c: 'var(--pos)' }
    if (ratio >= std.intermediate) return { l: 'Intermediate', c: 'var(--acc-train)' }
    if (ratio >= std.novice) return { l: 'Novice', c: 'var(--warn)' }
    return { l: 'Beginner', c: 'var(--fg-dim)' }
  }
  const scoreParts = { adherence: 0.92, landmarks: 0.60, strength: 0.88, balance: 0.94 }
  const trainingScore = Math.round(
    (scoreParts.adherence * 0.40 + scoreParts.landmarks * 0.30
     + scoreParts.strength * 0.20 + scoreParts.balance * 0.10) * 100)
  return (
    <div className="v2-grid-15">
      <Card title="Strength standards"
            sub={`Brzycki e1RM ÷ bodyweight ${bw} kg · population comparison`}
            attrappe={ATTRAPPE}>
        <div className="v2-col-gap" style={{ gap: 12 }}>
          {lifts.map(l => {
            const ratio = +(l.e1rm / bw).toFixed(2)
            const c = cat(ratio, l.std)
            const max = l.std.elite * 1.1
            return (
              <div key={l.n}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12.5, fontWeight: 500, width: 110 }}>{l.n}</span>
                  <span className="v2-num" style={{ fontSize: 13 }}>{l.e1rm} kg</span>
                  <span className="v2-dim v2-mono" style={{ fontSize: 10.5 }}>{ratio}× BW</span>
                  <Pill style={{ marginLeft: 'auto', borderColor: `color-mix(in oklch, ${c.c} 35%, var(--border))`, color: c.c, fontSize: 9.5 }}>{c.l}</Pill>
                </div>
                <div style={{ position: 'relative', height: 18, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden' }}>
                  {Object.entries(l.std).map(([k, v]) => (
                    <div key={k} style={{ position: 'absolute', left: `${(v / max) * 100}%`, top: 0, bottom: 0, width: 1, background: 'var(--border-strong)' }}>
                      <span className="v2-dim v2-mono" style={{ position: 'absolute', top: 3, left: 3, fontSize: 8, whiteSpace: 'nowrap' }}>{k.slice(0, 3)}</span>
                    </div>
                  ))}
                  <div style={{ position: 'absolute', left: 0, top: 4, height: 10, width: `${(ratio / max) * 100}%`, background: c.c, opacity: 0.8, borderRadius: 3 }} />
                </div>
              </div>
            )
          })}
        </div>
      </Card>
      <Card title="Training score" sub="exported to Goals" attrappe={ATTRAPPE}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <Ring value={trainingScore} max={100} color="var(--acc-train)" label="score" size={88} stroke={7} />
          <div className="v2-dim v2-mono" style={{ fontSize: 10.5, lineHeight: 1.7 }}>
            adherence&nbsp; 0.92 × 0.40<br />
            landmarks&nbsp; 0.60 × 0.30<br />
            strength&nbsp;&nbsp; 0.88 × 0.20<br />
            balance&nbsp;&nbsp;&nbsp; 0.94 × 0.10
          </div>
        </div>
        <Row label="Session adherence" value="22 of 24" />
        <Row label="Volume in landmarks" value="6 of 10 groups" />
        <Row label="Strength trend" value="+4.2% · 12 wk" />
        <Row label="Muscle balance" value="Push:Pull 1.05" />
        <div className="v2-divider" />
        <div className="v2-dim" style={{ fontSize: 11, lineHeight: 1.5 }}>
          Landmarks is the weak component — 3 groups below MEV. Bringing calves and hamstrings into the MEV–MRV band lifts the score by ~9 points.
        </div>
      </Card>
    </div>
  )
}

// ── Calendar ────────────────────────────────────────────────────
/** [cmd] module-training-spec.jsx:608-711. */
export function TrainingCalendarView() {
  const firstDay = 4 // May 2026 starts Friday
  const days = 31
  const done = [1, 2, 3, 5, 6, 8, 9, 10, 12, 13, 14, 16]
  const planned = [17, 18, 19, 21, 22, 23, 25, 26, 27, 29, 30]
  const cells: Array<number | null> = Array<number | null>(firstDay).fill(null)
    .concat(Array.from({ length: days }, (_, i) => i + 1))
  while (cells.length % 7) cells.push(null)
  return (
    <div className="v2-grid-14">
      <Card
        title="May 2026" sub={`${done.length} sessions logged · ${planned.length} planned`}
        attrappe={ATTRAPPE}
        actions={
          <>
            <InEntwicklungKnopf titel="Vorheriger Monat" className="v2-btn v2-btn-ghost v2-btn-sm">
              <Icon name="chevron_left" className="v2-ic v2-ic-sm" />
            </InEntwicklungKnopf>
            <InEntwicklungKnopf titel="Monat waehlen" className="v2-btn v2-btn-ghost v2-btn-sm">May</InEntwicklungKnopf>
            <InEntwicklungKnopf titel="Naechster Monat" className="v2-btn v2-btn-ghost v2-btn-sm">
              <Icon name="chevron_right" className="v2-ic v2-ic-sm" />
            </InEntwicklungKnopf>
          </>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} className="v2-dim v2-mono" style={{ fontSize: 9.5, textAlign: 'center', padding: 4 }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {cells.map((d, i) => {
            if (!d) return <div key={`leer-${i}`} style={{ aspectRatio: '1' }} />
            const isDone = done.includes(d)
            const isPlanned = planned.includes(d)
            const isToday = d === 16
            return (
              <div key={d} style={{
                aspectRatio: '1', borderRadius: 6, padding: 6,
                background: isToday ? 'color-mix(in oklch, var(--acc-train) 10%, var(--surface))' : 'var(--surface)',
                border: `1px solid ${isToday ? 'var(--acc-train)' : 'var(--border)'}`,
                borderStyle: isPlanned ? 'dashed' : 'solid',
                display: 'flex', flexDirection: 'column',
              }}>
                <span className="v2-num" style={{ fontSize: 10.5, color: isToday ? 'var(--acc-train)' : 'var(--fg-muted)', fontWeight: isToday ? 600 : 400 }}>{d}</span>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center' }}>
                  {isDone && <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--pos)' }} />}
                  {isPlanned && <span style={{ width: 7, height: 7, borderRadius: 999, border: '1px solid var(--acc-train)' }} />}
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 12, fontSize: 10, color: 'var(--fg-muted)', flexWrap: 'wrap' }}>
          <span className="v2-row-gap"><span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--pos)' }} />completed</span>
          <span className="v2-row-gap"><span style={{ width: 7, height: 7, borderRadius: 999, border: '1px solid var(--acc-train)' }} />planned</span>
          <span className="v2-row-gap"><span style={{ width: 10, height: 10, borderRadius: 3, border: '1px solid var(--acc-train)' }} />today</span>
        </div>
      </Card>
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="Streak" attrappe={ATTRAPPE}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
            <span className="v2-num" style={{ fontSize: 32, fontWeight: 600 }}>12</span>
            <span className="v2-dim" style={{ fontSize: 12 }}>consecutive active weeks</span>
          </div>
          <Row label="Longest streak" value="18 weeks" />
          <Row label="This month" value="12 of 13 planned" />
          <Row label="Adherence" value="92%" />
        </Card>
        <Card title="Cross-module gating" sub="today's checks" attrappe={ATTRAPPE}>
          <div className="v2-col-gap" style={{ gap: 6 }}>
            {[
              { src: 'Recovery', v: 'readiness 84', ok: true, msg: 'Full volume — no restriction' },
              { src: 'Recovery', v: 'chest 88 · shoulders 70', ok: true, msg: 'All target muscles above 50' },
              { src: 'Goals', v: 'phase recomp', ok: true, msg: 'Volume near MEV (guide)' },
              { src: 'Medical', v: 'CRP 0.6 · normal', ok: true, msg: 'No inflammation flag' },
              { src: 'Medical', v: 'no injury flags', ok: true, msg: 'All exercises available' },
            ].map(c => (
              <div key={c.msg} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 5 }}>
                <Icon name={c.ok ? 'check' : 'alert'} className="v2-ic v2-ic-sm"
                      style={{ color: c.ok ? 'var(--pos)' : 'var(--warn)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11.5 }}>{c.msg}</div>
                  <div className="v2-dim v2-mono" style={{ fontSize: 9.5, marginTop: 1 }}>{c.src} · {c.v}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="v2-divider" />
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Gate rules</div>
          <div className="v2-dim v2-mono" style={{ fontSize: 10, lineHeight: 1.7 }}>
            readiness &lt; 60 → volume −20-30%<br />
            readiness &lt; 40 → rest day<br />
            muscle_readiness &lt; 50 → skip muscle<br />
            crp_elevated → reduce volume<br />
            injury_flag → hide exercises
          </div>
        </Card>
        <Card title="Pending actions" attrappe={ATTRAPPE}>
          <div className="v2-col-gap" style={{ gap: 6 }}>
            {[
              { t: 'Post-workout feedback open', s: 'Push B · 2 min ago', act: 'Rate' },
              { t: 'Deload flag · Lateral Raise', s: 'no progression 4 sessions', act: 'Review' },
              { t: 'Calves below MEV', s: '6 of 8 sets · 4 days', act: 'Add sets' },
            ].map(a => (
              <div key={a.t} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 5 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11.5 }}>{a.t}</div>
                  <div className="v2-dim v2-mono" style={{ fontSize: 9.5 }}>{a.s}</div>
                </div>
                <InEntwicklungKnopf titel={`${a.t} — ${a.act}`} className="v2-btn v2-btn-sm">{a.act}</InEntwicklungKnopf>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
