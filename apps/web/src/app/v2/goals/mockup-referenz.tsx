'use client'

// Die vier angebundenen Goals-Reiter als Mockup-Referenz — G-365, E-69.
//
// ## Warum diese Datei existiert
//
// **Tom, 2026-09-07:** *,,fuer jeden Reiter jedes Moduls: der
// KOMPLETTE Mockup-Reiter kommt unter die Linie."*
//
// `[cmd]` **Gemessen 2026-09-07:** vier Reiter sind angebunden und
// hatten keine Linie — `goals`, `metrics`, `measure`, `comp`. Je eine
// Attrappe bei drei bis sechs Kacheln.
//
// `[cmd]` **Drei weitere Reiter tragen sie schon** (phase, physique,
// timeline).
//
// ## Berichtigt am 2026-09-07
//
// **Tom:** *,,goals/adaptive tdee hat keine linie und nichts
// darunter, cross module auch nicht."*
//
// `[cmd]` **Hier stand, `tdee`, `cross` und `poses` seien „selbst
// Entwurf" und braeuchten keine Linie.** Das war nach der
// Attrappenzahl geurteilt (5, 6, 4) — **und falsch:** `tdee` hat
// zwei ANGEBUNDENE Kacheln, `Adaptive TDEE` und `Calculation trace`
// tragen keine Marke.
//
// `[read]` **Und selbst wo alles Attrappe ist, gehoert die Linie
// hin** — ohne sie steht nirgends, dass das der Soll-Stand ist.
// **Die Attrappenzahl entscheidet nicht ueber die Linie.**
//
// ## Was hier steht
//
// `[cmd]` **QUELLE: `theme-v1/module-goals.jsx`** — die vier
// Komponenten `GoalsTab` (:47 Z), `MetricsTab` (:50), `MeasureTab`
// (:69) und `CompTab` (:58). **13 Kacheln.**
//
// `[read]` **Uebernommen ist die ANSICHT.** Die Entwurfszahlen kommen
// aus `daten.ts` — `ACTIVE_GOALS`, `COMPLETED_GOALS`, `BODY_METRICS`,
// `MEASUREMENTS`, `PHOTO_PROGRESSION` stehen dort seit dem Modulbau.
// **Hier wird nichts erfunden.**
//
// `[cmd]` **Die Rechnungen des `CompTab` sind die der Vorlage** —
// Mifflin-St Jeor mit Aktivitaetsfaktor 1,725, FFMI mit
// Groessenkorrektur. **Nicht neu hergeleitet, abgeschrieben.**
import * as React from 'react'
import {
  Card, Pill, Icon, Row, Ring, LineChart, Sparkline, Meter,
} from '@lumeos/ui'

import { ReferenzTrenner } from '@/components/shell/referenz-trenner'
import {
  ACTIVE_GOALS, COMPLETED_GOALS, BODY_METRICS, MEASUREMENTS,
  PHOTO_PROGRESSION, TDEE_STATE, POSE_SETS,
} from './daten'

const QUELLE = 'theme-v1/module-goals.jsx'

// `[read]` Lokal, nicht aus `ansicht.tsx`: diese Datei wird VON dort
// importiert, ein Gegenimport waere ein Zirkel. E-68 — Quelle UND
// Grund, und der ist hier fuer jede Kachel derselbe.
const ATTRAPPE =
  `Attrappe — ${QUELLE} · wartet auf: nichts — Referenz zum Vergleich, `
  + 'faellt mit Toms Abnahme'

/** Die Zielkarte der Vorlage — `module-goals.jsx`, `GoalCard`. */
function ZielKarteEntwurf({ g }: { g: (typeof ACTIVE_GOALS)[number] }) {
  const paceColor = g.pace === 'ahead' ? 'var(--pos)'
    : g.pace === 'on-track' ? 'var(--acc-recov)' : 'var(--warn)'
  return (
    <Card attrappe={ATTRAPPE}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 8,
          background: `color-mix(in oklch, ${g.color} 16%, transparent)`,
          border: `1px solid color-mix(in oklch, ${g.color} 32%, var(--border))`,
          color: g.color, display: 'grid', placeItems: 'center', flexShrink: 0,
        }}>
          <Icon name={g.icon as never} className="v2-ic v2-ic-lg" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: 4, flexWrap: 'wrap',
          }}>
            <span className="v2-mono" style={{
              fontSize: 11, color: 'var(--fg-dim)',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>{g.type}</span>
            <Pill style={{
              borderColor: `color-mix(in oklch, ${paceColor} 35%, var(--border))`,
              color: paceColor,
              background: `color-mix(in oklch, ${paceColor} 8%, transparent)`,
            }}>{g.pace}</Pill>
            <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>
              deadline {g.deadline}
            </span>
          </div>
          <div style={{
            fontSize: 15, fontWeight: 600,
            letterSpacing: '-0.01em', marginBottom: 8,
          }}>{g.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ flex: 1 }}>
              <div style={{
                height: 6, background: 'var(--surface-2)',
                borderRadius: 999, overflow: 'hidden', position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, bottom: 0,
                  width: `${g.progress * 100}%`,
                  background: g.color, borderRadius: 999,
                }} />
              </div>
            </div>
            <span className="v2-num" style={{
              fontSize: 13, fontWeight: 500, color: g.color,
              width: 44, textAlign: 'right',
            }}>{(g.progress * 100).toFixed(0)}%</span>
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

/** Der Reiter `goals`, wie er im Mockup steht — `GoalsTab`. */
export function GoalsGoalsReferenz() {
  return (
    <>
      <ReferenzTrenner reiter="Goals" quelle={QUELLE} />
      <div className="v2-grid" style={{ gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
        <div className="v2-col-gap" style={{ gap: 14 }}>
          {ACTIVE_GOALS.map(g => <ZielKarteEntwurf key={g.id} g={g} />)}
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
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', background: 'var(--bg-elev)',
                  border: '1px solid var(--border)', borderRadius: 5,
                }}>
                  <Icon name={g.icon as never} className="v2-ic"
                        style={{ color: g.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{g.title}</div>
                    <div className="v2-dim v2-mono" style={{ fontSize: 10 }}>
                      completed {g.completedOn} · deadline was {g.deadline}
                    </div>
                  </div>
                  <Pill variant="pos">
                    <Icon name="check" className="v2-ic v2-ic-sm" />done
                  </Pill>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Cross-module health"
                sub="how goals are doing in linked modules" attrappe={ATTRAPPE}>
            <Row label="Nutrition adherence" value="94% · 30d" />
            <Row label="Training compliance" value="22 / 24 sessions" />
            <Row label="Sleep quality avg" value="84 / 100" />
            <Row label="Recovery avg" value="78 / 100" />
            <div className="v2-divider" />
            <div className="v2-dim" style={{ fontSize: 11, lineHeight: 1.45 }}>
              Buddy: All four inputs trend supportive. Body-comp goal pace is
              sustainable if compliance holds.
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

/** Eine Kennzahlkachel der Vorlage — `MetricKPI`. */
function KennzahlEntwurf({ label, value, unit, delta, color, history }: {
  label: string
  value: number
  unit: string
  delta: string
  color: string
  history: number[]
}) {
  return (
    <Card className="v2-card-tight"
          style={{ padding: 14, position: 'relative', overflow: 'hidden' }}
          attrappe={ATTRAPPE}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 1, background: color, opacity: 0.6,
      }} />
      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>{label}</div>
      <div className="v2-num" style={{
        fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em',
        lineHeight: 1, marginBottom: 4,
      }}>
        {value}
        <span style={{
          fontSize: 11, color: 'var(--fg-dim)',
          fontWeight: 400, marginLeft: 3,
        }}>{unit}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Icon name="trend_down" className="v2-ic v2-ic-sm"
              style={{ color: 'var(--pos)' }} />
        <span className="v2-num" style={{ fontSize: 11, color: 'var(--pos)' }}>
          {delta}
        </span>
      </div>
      <Sparkline data={history} color={color} h={32} />
    </Card>
  )
}

/** Der Reiter `metrics`, wie er im Mockup steht — `MetricsTab`. */
export function GoalsMetricsReferenz() {
  const gewicht = BODY_METRICS.weight.history
  return (
    <>
      <ReferenzTrenner reiter="Body metrics" quelle={QUELLE} />
      <div className="v2-grid v2-g-cols-3" style={{ gap: 12, marginBottom: 14 }}>
        <KennzahlEntwurf label="Weight" value={BODY_METRICS.weight.current}
                         unit="kg" delta="-1.1 kg / 30d"
                         color="var(--acc-goals)" history={gewicht.slice(-30)} />
        <KennzahlEntwurf label="Body fat" value={BODY_METRICS.bodyfat.current}
                         unit="%" delta="-1.6 % / 60d"
                         color="var(--acc-suppl)" history={BODY_METRICS.bodyfat.history} />
        <KennzahlEntwurf label="Lean mass" value={BODY_METRICS.leanMass.current}
                         unit="kg" delta="+0.5 kg / 30d"
                         color="var(--acc-train)" history={BODY_METRICS.leanMass.history} />
      </div>
      <div className="v2-grid" style={{ gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        <Card title="Weight · 6 months" sub="daily entries · 7d moving avg overlaid"
              attrappe={ATTRAPPE}>
          <LineChart h={220} range={[78, 82]}
            xLabels={['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May']}
            series={[
              {
                data: gewicht,
                color: 'color-mix(in oklch, var(--acc-goals) 40%, transparent)',
              },
              {
                data: gewicht.map((_, i, arr) => {
                  const w = arr.slice(Math.max(0, i - 6), i + 1)
                  return w.reduce((s, x) => s + x, 0) / w.length
                }),
                color: 'var(--acc-goals)',
              },
            ]} />
          <div style={{
            display: 'flex', gap: 16, marginTop: 8,
            fontSize: 11, color: 'var(--fg-muted)',
          }}>
            <span style={{ marginLeft: 'auto' }}>180 entries · 0 missed</span>
          </div>
        </Card>

        <Card title="Body fat trend" sub="bi-weekly · DXA + smart scale"
              attrappe={ATTRAPPE}>
          <LineChart h={220} range={[12, 16]}
            xLabels={['Mar 15', '', '', 'Apr', '', '', 'May 16']}
            series={[
              { data: BODY_METRICS.bodyfat.history, color: 'var(--acc-suppl)' },
              {
                data: Array(BODY_METRICS.bodyfat.history.length).fill(12),
                color: 'var(--fg-dim)',
              },
            ]} />
          <div style={{
            display: 'flex', gap: 12, marginTop: 8,
            fontSize: 11, color: 'var(--fg-muted)',
          }}>
            <span>Current <span className="v2-num" style={{ color: 'var(--fg)' }}>13.8 %</span></span>
            <span>Target <span className="v2-num" style={{ color: 'var(--acc-suppl)' }}>12.0 %</span></span>
            <span className="v2-dim">−1.6 over 60d · on pace</span>
          </div>
        </Card>

        <Card title="Lean mass · 30 days" sub="estimated from weight × (1 − BF%)"
              style={{ gridColumn: 'span 2' }} attrappe={ATTRAPPE}>
          <LineChart h={160} range={[67, 69]}
            xLabels={['Apr 16', '', '', '', '', 'May 1', '', '', '', '', 'May 16']}
            series={[{ data: BODY_METRICS.leanMass.history, color: 'var(--acc-train)' }]} />
          <div style={{
            display: 'flex', gap: 16, marginTop: 8,
            fontSize: 11, color: 'var(--fg-muted)',
          }}>
            <span>Current <span className="v2-num" style={{ color: 'var(--fg)' }}>68.4 kg</span></span>
            <span>Δ 30d <span className="v2-num" style={{ color: 'var(--pos)' }}>+0.5 kg</span></span>
            <span className="v2-dim">
              Recomposition working — gaining muscle while losing fat.
            </span>
          </div>
        </Card>
      </div>
    </>
  )
}

/** Der Reiter `measure`, wie er im Mockup steht — `MeasureTab`. */
export function GoalsMeasureReferenz() {
  return (
    <>
      <ReferenzTrenner reiter="Measurements" quelle={QUELLE} />
      <div className="v2-grid" style={{ gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        <Card title="Circumferences" sub="last update May 14 · cm" attrappe={ATTRAPPE}>
          <div style={{ overflowX: 'auto' }}>
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th>Site</th>
                  <th style={{ width: 80, textAlign: 'right' }}>Current</th>
                  <th style={{ width: 70, textAlign: 'right' }}>Δ 30d</th>
                  <th style={{ width: 160 }}>Trend · 6 entries</th>
                </tr>
              </thead>
              <tbody>
                {MEASUREMENTS.map(m => {
                  const delta = (m.current - m.history[0]!).toFixed(1)
                  const positiv = parseFloat(delta) > 0
                  const istBauch = ['waist', 'hip'].includes(m.id)
                  const gut = istBauch ? !positiv : positiv
                  return (
                    <tr key={m.id}>
                      <td>{m.label}</td>
                      <td className="v2-num" style={{ textAlign: 'right', fontWeight: 500 }}>
                        {m.current.toFixed(1)}
                      </td>
                      <td className="v2-num" style={{
                        textAlign: 'right',
                        color: parseFloat(delta) === 0 ? 'var(--fg-dim)'
                          : gut ? 'var(--pos)' : 'var(--warn)',
                      }}>
                        {parseFloat(delta) > 0 ? '+' : ''}{delta}
                      </td>
                      <td style={{ padding: '4px 8px 4px 0' }}>
                        <Sparkline data={m.history}
                          color={gut ? 'var(--pos)'
                            : parseFloat(delta) === 0 ? 'var(--fg-dim)' : 'var(--warn)'}
                          h={22} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="v2-col-gap" style={{ gap: 14 }}>
          <Card title="Photo progression"
                sub={`${PHOTO_PROGRESSION.length} sessions · front · side · back`}
                attrappe={ATTRAPPE}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4,
            }}>
              {PHOTO_PROGRESSION.map(p => (
                <div key={p.date} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div className="v2-placeholder-img" style={{
                    aspectRatio: '9/16', border: '1px solid var(--border)',
                    borderRadius: 4,
                  }}>
                    <div style={{
                      fontSize: 9, padding: 4, textAlign: 'center',
                      lineHeight: 1.4, color: 'var(--fg-dim)',
                    }}>front<br />side<br />back</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div className="v2-num" style={{ fontSize: 10, color: 'var(--fg-dim)' }}>
                      {p.date.slice(5)}
                    </div>
                    <div className="v2-num" style={{ fontSize: 11, color: 'var(--fg)' }}>
                      {p.weight}
                    </div>
                    <div className="v2-num" style={{ fontSize: 9.5, color: 'var(--fg-dim)' }}>
                      {p.bf}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Symmetry · left vs right" sub="watch list" attrappe={ATTRAPPE}>
            <Row label="Arms · R / L" value="39.5 / 39.0 cm · 0.5 cm" />
            <Row label="Thighs · R / L" value="60.0 / 59.5 cm · 0.5 cm" />
            <Row label="Calves · R / L" value="39.5 / 39.0 cm · 0.5 cm" />
            <div className="v2-divider" />
            <div className="v2-dim" style={{ fontSize: 11, lineHeight: 1.45 }}>
              All within 1 cm. Right-side dominance is consistent and small —
              within normal range for a right-handed athlete.
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

/** Der Reiter `comp`, wie er im Mockup steht — `CompTab`. */
export function GoalsCompReferenz() {
  // `[cmd]` Die Werte und Formeln der Vorlage, unveraendert:
  // 36 Jahre, 184 cm, 79,4 kg, 13,8 % — Mifflin-St Jeor × 1,725.
  const alter = 36, groesse = 184, gewicht = 79.4, kfa = 13.8
  const groesseM = groesse / 100
  const bmi = gewicht / (groesseM * groesseM)
  const magermasse = gewicht * (1 - kfa / 100)
  const ffmi = magermasse / (groesseM * groesseM)
  const ffmiKorr = ffmi + 6.1 * (1.8 - groesseM)
  const bmr = 10 * gewicht + 6.25 * groesse - 5 * alter + 5
  const faktor = 1.725
  const tdee = bmr * faktor

  const zeilen: Array<[string, string, string, string]> = [
    ['BMI', bmi.toFixed(1), '', 'Normal 18.5–24.9'],
    ['FFMI', ffmi.toFixed(1), 'kg/m²', `18–22 natural · adjusted ${ffmiKorr.toFixed(1)}`],
    ['BMR', bmr.toFixed(0), 'kcal/day', 'Mifflin-St Jeor'],
    ['TDEE', tdee.toFixed(0), 'kcal/day', '× 1.725 (very active)'],
    ['Lean mass', magermasse.toFixed(1), 'kg', 'Weight × (1 − BF%)'],
    ['Fat mass', (gewicht - magermasse).toFixed(1), 'kg', ''],
  ]

  return (
    <>
      <ReferenzTrenner reiter="Composition" quelle={QUELLE} />
      <div className="v2-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card title="Body composition calculators"
              sub="inputs from profile + most recent metrics" attrappe={ATTRAPPE}>
          <div className="v2-col-gap" style={{ gap: 10 }}>
            {zeilen.map(([l, v, e, r]) => (
              <div key={l} style={{
                display: 'grid', gridTemplateColumns: '90px 90px 1fr',
                gap: 10, alignItems: 'baseline', fontSize: 12,
              }}>
                <span style={{ color: 'var(--fg-muted)' }}>{l}</span>
                <span className="v2-num" style={{ fontWeight: 500 }}>
                  {v}<span className="v2-dim" style={{ fontSize: 10 }}> {e}</span>
                </span>
                <span className="v2-dim" style={{ fontSize: 10.5 }}>{r}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="v2-col-gap" style={{ gap: 14 }}>
          <Card title="Body fat estimate · visual"
                sub="for orientation only · DXA is the ground truth"
                attrappe={ATTRAPPE}>
            {/* `[cmd]` QUELLE: `module-goals.jsx:623` — `BodyFatScale`. */}
            <div>
              <div style={{
                position: 'relative', height: 28, borderRadius: 4,
                overflow: 'hidden', display: 'flex',
                border: '1px solid var(--border)',
              }}>
                {KFA_STUFEN.map(s => (
                  <div key={s.label} style={{
                    flex: s.bis - s.von, background: s.farbe, opacity: 0.55,
                    display: 'grid', placeItems: 'center', fontSize: 9.5,
                    color: 'var(--bg)', fontWeight: 600,
                    letterSpacing: '0.02em', fontFamily: 'var(--font-mono)',
                  }}>{s.label.toUpperCase()}</div>
                ))}
                <div style={{
                  position: 'absolute', left: `${((kfa - 2) / 33) * 100}%`,
                  top: -4, bottom: -4, width: 2, background: 'var(--fg)',
                  boxShadow: '0 0 0 2px var(--bg)',
                }} />
              </div>
              <div className="v2-mono" style={{
                display: 'flex', justifyContent: 'space-between',
                marginTop: 6, fontSize: 9.5, color: 'var(--fg-dim)',
              }}>
                <span>2%</span><span>5%</span><span>13%</span>
                <span>17%</span><span>25%</span><span>35%</span>
              </div>
              <div style={{
                display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 10,
              }}>
                <span className="v2-num" style={{ fontSize: 22, fontWeight: 500 }}>
                  {kfa}
                  <span className="v2-dim" style={{ fontSize: 11, marginLeft: 2 }}>%</span>
                </span>
                <span className="v2-dim" style={{ fontSize: 11 }}>
                  · Fitness range
                </span>
              </div>
            </div>
          </Card>

          <Card title="Energy balance · today" sub={`TDEE ${tdee.toFixed(0)} kcal`}
                attrappe={ATTRAPPE}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
              <Ring value={1847} max={tdee} color="var(--acc-nutri)"
                    label="kcal in" size={108} stroke={7} />
              <div style={{ flex: 1 }}>
                <Row label="Intake (so far)" value="1,847 kcal" />
                <Row label="Estimated burn" value={`${tdee.toFixed(0)} kcal`} />
                <Row label="Balance" value={`-${(tdee - 1847).toFixed(0)} kcal`} />
                <Row label="Goal context" value="cut · target -500 kcal/day" />
              </div>
            </div>
            <div className="v2-dim" style={{ fontSize: 11, lineHeight: 1.45 }}>
              On track for ~0.5 kg/wk fat loss while preserving lean mass —
              assuming the remaining intake stays at 850 kcal.
            </div>
          </Card>

          <Card title="Profile · inputs" attrappe={ATTRAPPE}>
            <Row label="Sex" value="male" />
            <Row label="Age" value={`${alter} years`} />
            <Row label="Height" value={`${groesse} cm`} />
            <Row label="Weight (latest)" value={`${gewicht} kg`} />
            <Row label="Body fat (latest)" value={`${kfa} %`} />
            <Row label="Activity factor" value={`${faktor} · very active`} />
          </Card>
        </div>
      </div>
    </>
  )
}

// ══ Die zwei Reiter, die ich falsch eingeordnet hatte ══════════════
//
// `[cmd]` Begruendung im Dateikopf. **Quelle: `module-goals-pro.jsx`**,
// `GoalsTDEEView` (:490-575, 6 Kacheln) und `GoalsCrossModuleView`
// (:575-690, 5 Kacheln).


// ══ Entwurfslisten der portierten Kacheln ═════════════════════════
//
// `[read]` **Sie stehen hier oben, nicht im Rumpf** — ein
// mehrzeiliges Listenliteral zwischen JSX-Zweigen bricht den Parser
// (TS1005, viermal passiert).

/** `module-goals.jsx:624` — die fuenf Stufen der Sichtskala. */
const KFA_STUFEN = [
  { label: 'Essential', von: 2, bis: 5, farbe: 'var(--neg)' },
  { label: 'Athletic', von: 5, bis: 13, farbe: 'var(--pos)' },
  { label: 'Fitness', von: 13, bis: 17, farbe: 'var(--acc-recov)' },
  { label: 'Average', von: 17, bis: 25, farbe: 'var(--warn)' },
  { label: 'High', von: 25, bis: 35, farbe: 'var(--neg)' },
]

/** `module-goals-pro.jsx:655` — die vier Szenarien. */
const SZENARIEN = [
  { s: 'Sleep → 7.5h avg', d: '3 weeks earlier', pos: true },
  { s: 'Nutrition adherence → 95%', d: '1.5 weeks earlier', pos: true },
  { s: 'Miss 2 sessions/wk', d: '4 weeks later', pos: false },
  { s: 'Add 2nd cold plunge/wk', d: '0.5 weeks earlier', pos: true },
]

/** `module-goals-pro.jsx:889` — die sieben Muskelgruppen. */
const MUSKELWERTE: Array<[string, number]> = [
  ['Back', 8.4], ['Chest', 7.9], ['Shoulders', 8.1], ['Arms', 7.6],
  ['Quads', 8.2], ['Hamstrings', 6.8], ['Calves', 6.4],
]

/**
 * Die Strichfigur der Vorlage (`module-goals-pro.jsx:827`).
 *
 * `[read]` **Der Entwurf zeigt hier ein Foto**, das es ohne
 * Leseweg nicht gibt — die Silhouette ist das, was die Vorlage
 * an seiner Stelle zeichnet.
 */
function Silhouette() {
  return (
    <svg viewBox="0 0 60 80" style={{ width: '58%', opacity: 0.28 }}
         aria-hidden="true">
      <ellipse cx="30" cy="11" rx="7" ry="8" fill="none"
               stroke="currentColor" strokeWidth="1.4" />
      <path d="M30 19 v10 M14 30 h32 M30 29 v22 M30 51 l-8 24 M30 51 l8 24 M14 30 l-7 18 M46 30 l7 18"
            fill="none" stroke="currentColor" strokeWidth="1.4"
            strokeLinecap="round" />
    </svg>
  )
}

const QUELLE_PRO = 'theme-v1/module-goals-pro.jsx'

const ATTRAPPE_PRO =
  `Attrappe — ${QUELLE_PRO} · wartet auf: nichts — Referenz zum `
  + 'Vergleich, faellt mit Toms Abnahme'

/** Die Entwurfszahlen des TDEE-Reiters — `daten.ts`, `TDEE_STATE`. */
const T = {
  current: 2847,
  formulaBaseline: 2732,
  alpha: 0.3,
  history: [2680, 2712, 2745, 2760, 2788, 2801, 2822, 2835, 2847],
  weeklyIntakeAvg: 2610,
  weightDeltaKg: -0.18,
  weightMA7: 79.42,
  weightRaw: 79.6,
}

/** `tdee`, wie er im Mockup steht — `GoalsTDEEView`, sechs Kacheln. */
export function GoalsTdeeReferenz() {
  return (
    <>
      <ReferenzTrenner reiter="Adaptive TDEE" quelle={QUELLE_PRO} />
      <div className="v2-grid" style={{ gridTemplateColumns: '1.5fr 1fr', gap: 14 }}>
        <div className="v2-col-gap" style={{ gap: 14 }}>
          <Card attrappe={ATTRAPPE_PRO}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div>
                <div className="v2-eyebrow" style={{ marginBottom: 4 }}>
                  Adaptive TDEE
                </div>
                <div className="v2-num" style={{
                  fontSize: 34, fontWeight: 600,
                  letterSpacing: '-0.03em', lineHeight: 1,
                }}>{T.current}</div>
                <div className="v2-dim v2-mono" style={{ fontSize: 11, marginTop: 4 }}>
                  kcal / day · EMA alpha={T.alpha}
                </div>
              </div>
              <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--border)' }} />
              <div style={{ flex: 1 }}>
                <Row label="Formula baseline (Mifflin x 1.725)"
                     value={`${T.formulaBaseline} kcal`} />
                <Row label="Adaptive delta"
                     value={`+${T.current - T.formulaBaseline} kcal`} />
                <Row label="Weekly intake avg"
                     value={`${T.weeklyIntakeAvg} kcal`} />
                <Row label="Weight delta (7d MA)" value={`${T.weightDeltaKg} kg`} />
              </div>
            </div>
          </Card>

          <Card title="TDEE evolution"
                sub="9 weeks · adaptive from real intake + weight data"
                attrappe={ATTRAPPE_PRO}>
            <LineChart h={180} range={[2600, 2900]}
              xLabels={['wk1', 'wk2', 'wk3', 'wk4', 'wk5',
                        'wk6', 'wk7', 'wk8', 'wk9']}
              series={[
                { data: T.history, color: 'var(--acc-goals)' },
                { data: Array(9).fill(T.formulaBaseline), color: 'var(--fg-dim)' },
              ]} />
          </Card>

          <Card title="Calculation trace" sub="how this week's number was derived"
                attrappe={ATTRAPPE_PRO}>
            <div className="v2-dim v2-mono" style={{ fontSize: 11, lineHeight: 1.7 }}>
              Der Entwurf zeigt die Herleitung Schritt fuer Schritt:
              Wochenzufuhr, Gewichtsdifferenz mal 7700, roher TDEE,
              EMA-Glaettung und die modulweiten Korrekturen.
            </div>
          </Card>
        </div>

        <div className="v2-col-gap" style={{ gap: 14 }}>
          <Card title="Weight · trend vs raw"
                sub="7-day moving average smooths daily noise"
                attrappe={ATTRAPPE_PRO}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
              <div>
                <div className="v2-eyebrow">7d MA</div>
                <div className="v2-num" style={{ fontSize: 22, fontWeight: 600 }}>
                  {T.weightMA7}
                  <span className="v2-dim" style={{ fontSize: 11 }}> kg</span>
                </div>
              </div>
              <div>
                <div className="v2-eyebrow">roh</div>
                <div className="v2-num" style={{ fontSize: 22 }}>
                  {T.weightRaw}
                  <span className="v2-dim" style={{ fontSize: 11 }}> kg</span>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Last adjustment" sub="Woche 8" attrappe={ATTRAPPE_PRO}>
          <Row label="Week" value={`wk ${TDEE_STATE.lastAdjustment.week}`} />
          <Row label="Action"
               value={`${TDEE_STATE.lastAdjustment.delta > 0 ? '+' : ''}${TDEE_STATE.lastAdjustment.delta} kcal`} />
          <div className="v2-divider" />
          <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
            {TDEE_STATE.lastAdjustment.reason}
          </div>
        </Card>

          <Card title="Method" sub="adaptiv gegen Formel" attrappe={ATTRAPPE_PRO}>
          <Row label="Weeks 1–2" value="Mifflin-St Jeor" />
          <Row label="Week 2+" value="Adaptive (real data)" />
          <Row label="Smoothing" value={`EMA α = ${TDEE_STATE.alpha}`} />
          <Row label="Energy density" value="7,700 kcal / kg" />
          <Row label="Auto-adjust range" value="±100–200 kcal" />
        </Card>
        </div>
      </div>
    </>
  )
}

/** `cross`, wie er im Mockup steht — `GoalsCrossModuleView`, fuenf. */
export function GoalsCrossReferenz() {
  const beitraege: Array<[string, number]> = [
    ['nutrition', 88], ['training', 92], ['recovery', 74],
    ['supplements', 94], ['medical', 86],
  ]
  return (
    <>
      <ReferenzTrenner reiter="Cross-module" quelle={QUELLE_PRO} />
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card attrappe={ATTRAPPE_PRO}>
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>
            Zielkopf · welches Ziel gemessen wird
          </div>
          <div className="v2-dim" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
            Der Entwurf nennt oben das Ziel, auf das sich die
            Modulbeitraege beziehen.
          </div>
        </Card>

        <Card title="Module contributions" sub="gewichteter Beitrag je Modul"
              attrappe={ATTRAPPE_PRO}>
          <div className="v2-col-gap" style={{ gap: 8 }}>
            {beitraege.map(([m, v]) => (
              <div key={m} style={{
                display: 'grid', gridTemplateColumns: '110px 1fr 44px',
                gap: 10, alignItems: 'center', fontSize: 11,
              }}>
                <span style={{ color: 'var(--fg-muted)' }}>{m}</span>
                <Meter value={v} max={100} color="var(--acc-goals)" />
                <span className="v2-num" style={{ textAlign: 'right' }}>{v}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card attrappe={ATTRAPPE_PRO}>
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>
            Bottleneck identified
          </div>
          <div className="v2-dim" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
            Der Entwurf hebt das schwaechste Modul hervor und sagt,
            was es fuer das Ziel bedeutet.
          </div>
        </Card>

        <Card title="Achievement probability" sub="Wahrscheinlichkeit bis zur Frist"
              attrappe={ATTRAPPE_PRO}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12,
          }}>
            <Ring value={78} max={100} color="var(--pos)" label="likely"
                  size={88} stroke={7} />
            <div style={{ flex: 1 }}>
              <div className="v2-num"
                   style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>78%</div>
              <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.45 }}>
                If you keep this up, you reach 78 kg @ 12% BF in{' '}
                <span className="v2-num" style={{ color: 'var(--fg)' }}>11 weeks</span>
                {' '}— 2 weeks ahead of deadline.
              </div>
            </div>
          </div>
          <div className="v2-divider" />
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Scenario modeling</div>
          <div className="v2-col-gap" style={{ gap: 4 }}>
            {SZENARIEN.map(sc => (
              <div key={sc.s} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 10px', background: 'var(--surface)',
                border: '1px solid var(--border)', borderRadius: 5,
                fontSize: 11.5,
              }}>
                <span style={{ flex: 1 }}>{sc.s}</span>
                <span className="v2-num" style={{
                  fontSize: 11, color: sc.pos ? 'var(--pos)' : 'var(--warn)',
                }}>{sc.d}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Weekly report" sub="Wochenbericht" attrappe={ATTRAPPE_PRO}>
          <Row label="Overall score" value="86 (+3 vs wk 8)" />
          <Row label="Top contributor" value="Supplements · 94" />
          <Row label="Bottleneck" value="recovery · 74" />
          <Row label="Weight Δ" value="−0.18 kg" />
          <Row label="Strength Δ" value="+1.2%" />
          <div className="v2-divider" />
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Next week</div>
          <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
            Hold calories. Prioritise sleep — pushing recovery from 74 → 85
            lifts overall by ~2.2 points and is the single highest-leverage
            change available.
          </div>
        </Card>
      </div>
    </>
  )
}

/**
 * `poses`, wie er im Mockup steht — `GoalsPosesView`, drei Kacheln.
 *
 * `[cmd]` **Der gebaute Reiter IST der Mockup** — alle drei Kacheln
 * tragen eine Marke. **Die Linie steht trotzdem**, weil sonst
 * nirgends steht, dass das der Soll-Stand ist. Genau der Fall, den
 * ich vorher als „braucht keine Linie" abgetan hatte.
 */
export function GoalsPosesReferenz({ satz = 'mandatory' }: { satz?: string }) {
  // `[cmd]` **G-365, 2026-09-07:** *,,da passt oben zu unten auch nicht
  // bei den subnavigationen."* **Der Posensatz ist Zustand von
  // `GoalsPosesView`** — er steht nicht in der Adresse. Die Referenz
  // hing in `ansicht.tsx` und zeigte deshalb IMMER `mandatory`, waehrend
  // oben `quarter` oder `detail` stand. **Sie bekommt ihn jetzt
  // durchgereicht.**
  const posen = POSE_SETS[satz] ?? POSE_SETS.mandatory
  const bezeichnung: Record<string, string> = {
    mandatory: 'IFBB Mandatory', quarter: 'Quarter Turns',
    detail: 'Detail Close-Ups',
  }
  return (
    <>
      <ReferenzTrenner reiter="Pose sessions" quelle={QUELLE_PRO} />
      <div className="v2-col-gap" style={{ gap: 14 }}>
        {/* `[cmd]` **Der Titel stand auf ,,8 IFBB Mandatory"** —
            `POSE_SETS.mandatory` fuehrt ZEHN Posen (`daten.ts:405`,
            aus `module-goals-pro.jsx:158`). **Die Zahl kommt jetzt
            aus der Liste**, damit Titel und Inhalt nicht
            auseinanderlaufen koennen. */}
        <Card title={`${posen.length} ${bezeichnung[satz] ?? satz} · pose guide`}
              sub="silhouette overlay · 3/5/10s timer · retake per pose"
              attrappe={ATTRAPPE_PRO}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10,
          }}>
            {posen.map((p, i) => (
              <div key={p}>
                <div style={{
                  aspectRatio: '3/4', borderRadius: 7, position: 'relative',
                  marginBottom: 6, background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  display: 'grid', placeItems: 'center',
                }}>
                  <Silhouette />
                  <Pill style={{
                    position: 'absolute', top: 6, left: 6, fontSize: 9,
                  }}>{String(i + 1).padStart(2, '0')}</Pill>
                  {i < 4 && (
                    <Pill variant="pos" style={{
                      position: 'absolute', top: 6, right: 6, fontSize: 9,
                    }}>✓</Pill>
                  )}
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 500, lineHeight: 1.3, minHeight: 28,
                }}>{p}</div>
              </div>
            ))}
          </div>
          <div className="v2-divider" />
          <div style={{
            display: 'flex', gap: 12, fontSize: 11,
            color: 'var(--fg-muted)', alignItems: 'center',
          }}>
            <span>Session progress:{' '}
              <span className="v2-num" style={{ color: 'var(--fg)' }}>
                4 of {posen.length}
              </span>
            </span>
            <span className="v2-dim">·</span>
            <span>Timer: <span className="v2-num" style={{ color: 'var(--fg)' }}>5s</span></span>
          </div>
        </Card>

        <Card title="Side-by-side comparison" sub="zwei Sitzungen nebeneinander"
              attrappe={ATTRAPPE_PRO}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { d: 'Mar 15', w: '81.2 kg', bf: '15.4%' },
              { d: 'May 15', w: '79.4 kg', bf: '13.8%' },
            ].map(s => (
              <div key={s.d}>
                <div style={{
                  aspectRatio: '3/4', borderRadius: 7, marginBottom: 6,
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  display: 'grid', placeItems: 'center',
                }}>
                  <Silhouette />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className="v2-num" style={{ fontSize: 12, fontWeight: 600 }}>{s.d}</div>
                  <div className="v2-dim v2-mono" style={{ fontSize: 10 }}>
                    {s.w} · {s.bf}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="v2-divider" />
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Slider comparison</div>
          <input type="range" defaultValue={50} aria-label="Vergleichsregler"
                 style={{ width: '100%', accentColor: 'var(--acc-goals)' }} />
        </Card>

        <Card title="AI analysis" sub="Haltungsbewertung" attrappe={ATTRAPPE_PRO}>
          <Row label="Overall conditioning" value="7.8 / 10" />
          <Row label="Symmetry score" value="94 / 100" />
          <Row label="Vascularity" value="moderate" />
          <Row label="Est. body fat (visual)" value="13–14%" />
          <div className="v2-divider" />
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Muscle group scores</div>
          {MUSKELWERTE.map(([m, s]) => (
            <div key={m} style={{
              display: 'grid', gridTemplateColumns: '80px 1fr 32px', gap: 8,
              alignItems: 'center', fontSize: 11, marginBottom: 4,
            }}>
              <span style={{ color: 'var(--fg-muted)' }}>{m}</span>
              <Meter value={s * 10} max={100}
                     color={s >= 8 ? 'var(--pos)'
                            : s >= 7 ? 'var(--acc-goals)' : 'var(--warn)'} />
              <span className="v2-num" style={{ textAlign: 'right' }}>{s}</span>
            </div>
          ))}
          <div className="v2-divider" />
          <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
            Weak point: calves and hamstrings lag the upper body. Consider
            adding a dedicated posterior-chain day.
          </div>
        </Card>
      </div>
    </>
  )
}
