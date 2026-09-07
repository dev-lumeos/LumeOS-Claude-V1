'use client'

// Die Mockup-Kacheln, die OBERHALB der Linie fehlen — G-365, E-68.
//
// **Tom, 2026-09-07:** *,,oben wird alles angezeigt das angebunden ist
// plus attrappen aus dem mockup welche oben noch fehlen, und unter dem
// strich wird das ganze mockup angezeigt."*
//
// ## Berichtigt am 2026-09-07
//
// **Tom nennt sie einzeln:** *,,training/history Bench Press · e1RM
// progression & Body stats × strength fake, training/progression
// Progression models & Next-session prescription & Fatigue detection
// & Set types fake, training/standards Training score fake und mockup
// nicht vollstaendig, training/calendar Streak & Cross-module gating
// & Pending actions fake."*
//
// `[read]` **Alle zehn waren Rahmen mit einem Satz darin.** Diese
// Fassung baut die Ansicht — aus `tabs-spec.tsx`
// (`PROGRESSION_MODELS`, `DELOAD_TRIGGERS`, `SET_TYPES`) und aus den
// Zahlen der Vorlage.
//
// ## Warum sie zweimal erscheinen
//
// `[read]` **Diese Kacheln gibt es bereits** — in `tabs-spec.tsx` und
// `tabs-extras.tsx`, **aber nur UNTER der Linie**, als Teil des
// Mockup-Reiters. Oben fehlten sie, und dort gehoeren sie hin: als
// Vermerk, dass dieser Reiter sie haben soll.
import * as React from 'react'
import { Card, Pill, Row, Ring, LineChart } from '@lumeos/ui'

import {
  PROGRESSION_MODELS, DELOAD_TRIGGERS, SET_TYPES,
} from './tabs-spec'

const QUELLE_SPEC = 'theme-v1/module-training-spec.jsx'
const QUELLE_EXTRA = 'theme-v1/module-training-extras.jsx'
const QUELLE_MAIN = 'theme-v1/module-training.jsx'

/** E-68: Quelle UND Grund. */
function marke(quelle: string, wartet: string): string {
  return `Attrappe — ${quelle} · wartet auf: ${wartet}`
}

// `[read]` Listen ausserhalb des JSX: ein mehrzeiliger `as Array<…>`
// im Rumpf bricht die JSX-Analyse (TS1005).
const VORGABEN: Array<[string, string, string, string]> = [
  ['Bench Press', '5,5,5,5,4 @ 117.5', 'reps', '5×5 @ 117.5 kg'],
  ['Incline DB Press', '8,8,7,7 @ 38', 'reps', '4×8 @ 38 kg'],
  ['OHP · seated', '6,6,6,6 @ 65', 'weight', '4×6 @ 67.5 kg ↑'],
  ['Cable Fly', '12,12,12 @ 22', 'weight', '3×12 @ 24 kg ↑'],
  ['Lateral Raise', '15,14,12 @ 9', 'stalled', '3×15 @ 9 kg · deload flag'],
  ['Triceps Pushdown', '12,12,10 @ 38', 'reps', '3×12 @ 38 kg'],
]

const GATING: Array<[string, string, string]> = [
  ['Recovery', 'readiness 84', 'Full volume — no restriction'],
  ['Recovery', 'chest 88 · shoulders 70', 'All target muscles above 50'],
  ['Goals', 'phase recomp', 'Volume at lower MAV'],
  ['Medical', 'CRP 0.6 · normal', 'No inflammation flag'],
  ['Medical', 'no injury flags', 'Nothing blocking'],
]

const OFFENE_PUNKTE: Array<[string, string]> = [
  ['2 Saetze ohne RPE', 'Push B · 14. Mai'],
  ['Sitzung nicht bestaetigt', 'Pull A · 12. Mai'],
  ['Koerpergewicht seit 6 Tagen offen', 'fuer e1RM-Verhaeltnis noetig'],
]

const KORRELATION: Array<[string, string]> = [
  ['Bench × weight', '+20 kg / −1.0 kg'],
  ['Bench × body fat', '+20 kg / −1.2 %'],
  ['Rekomposition', 'Kraft hoch, Masse stabil'],
]

const E1RM_WOCHEN = ['wk1', 'wk2', 'wk3', 'wk4', 'wk5', 'wk6',
                     'wk7', 'wk8', 'wk9', 'wk10', 'wk11', 'wk12']
const E1RM_BENCH = [102, 105, 105, 107.5, 110, 112.5,
                    110, 115, 117.5, 117.5, 120, 122.5]
const E1RM_GEWICHT = [80.4, 80.5, 80.3, 80.1, 80.0, 79.9,
                      79.8, 79.7, 79.5, 79.5, 79.5, 79.4]
const E1RM_KFA = [15.0, 14.9, 14.8, 14.6, 14.5, 14.3,
                  14.2, 14.0, 13.9, 13.8, 13.8, 13.8]

/** `history`: die zwei Kacheln, die oben fehlen. */
export function FehlendeHistoryKacheln() {
  const max = Math.max(...E1RM_BENCH)
  const min = Math.min(...E1RM_BENCH)
  return (
    <>
      <Card title="Bench Press · e1RM progression"
            sub="geschaetztes Einermaximum ueber 12 Wochen"
            attrappe={marke(QUELLE_MAIN,
              'eine e1RM-Rechnung je Uebung — `training.sets` haelt '
              + 'Gewicht und Wiederholungen, die Brzycki-Ableitung fehlt')}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 92 }}>
          {E1RM_BENCH.map((v, i) => (
            <div key={E1RM_WOCHEN[i]} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                height: `${((v - min + 4) / (max - min + 8)) * 74}px`,
                background: v === max ? 'var(--pos)' : 'var(--acc-train)',
                borderRadius: 2,
              }} />
              <div className="v2-num v2-dim" style={{ fontSize: 8, marginTop: 3 }}>
                {v}
              </div>
            </div>
          ))}
        </div>
        <div className="v2-divider" />
        <div style={{ display: 'flex', gap: 16, fontSize: 11 }}>
          <span>Start <span className="v2-num">{E1RM_BENCH[0]} kg</span></span>
          <span>Jetzt <span className="v2-num" style={{ color: 'var(--pos)' }}>
            {E1RM_BENCH[E1RM_BENCH.length - 1]} kg
          </span></span>
          <span className="v2-dim">
            +{(E1RM_BENCH[E1RM_BENCH.length - 1]! - E1RM_BENCH[0]!).toFixed(1)} kg
            {' '}in 12 Wochen
          </span>
        </div>
      </Card>

      <Card title="Body stats × strength" sub="12 weeks · correlation overlay"
            attrappe={marke(QUELLE_EXTRA,
              'eine gemeinsame Sicht ueber training und goals — '
              + 'Koerpermasse liegt in `goals.body_measurements` (E-52)')}>
        <LineChart h={180} range={[60, 130]} xLabels={E1RM_WOCHEN}
          series={[
            { data: E1RM_BENCH, color: 'var(--acc-train)' },
            { data: E1RM_GEWICHT.map(w => w * 1.4), color: 'var(--acc-goals)' },
            { data: E1RM_KFA.map(b => b * 6), color: 'var(--acc-suppl)' },
          ]} />
        <div style={{
          display: 'flex', gap: 16, marginTop: 8,
          fontSize: 11, color: 'var(--fg-muted)', flexWrap: 'wrap',
        }}>
          <span>Bench e1RM (kg)</span>
          <span>Bodyweight (skaliert)</span>
          <span>Body fat % (skaliert)</span>
        </div>
        <div className="v2-divider" />
        <div className="v2-grid v2-g-cols-3" style={{ gap: 10 }}>
          {KORRELATION.map(([l, v]) => (
            <div key={l} style={{
              padding: 10, background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: 6,
            }}>
              <div className="v2-eyebrow">{l}</div>
              <div className="v2-num" style={{ fontSize: 13, color: 'var(--pos)' }}>
                {v}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}

/** `progress`: die vier Kacheln, die oben fehlen. */
export function FehlendeProgressKacheln() {
  const ausgeloest = DELOAD_TRIGGERS.filter(t => t.hit).length
  return (
    <>
      <Card title="Progression models" sub="5 models · one per routine · deterministic"
            attrappe={marke(QUELLE_SPEC,
              'eine Zuordnung Modell zu Routine — weder Spalte noch '
              + 'Tabelle im Repo')}>
        <div className="v2-col-gap" style={{ gap: 6 }}>
          {PROGRESSION_MODELS.map(p => (
            <div key={p.id} style={{
              padding: 12, borderRadius: 7,
              background: p.active
                ? `color-mix(in oklch, ${p.color} 9%, var(--surface))`
                : 'var(--surface)',
              border: `1px solid ${p.active
                ? `color-mix(in oklch, ${p.color} 35%, var(--border))`
                : 'var(--border)'}`,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                marginBottom: 5, flexWrap: 'wrap',
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: 999, background: p.color,
                }} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                <Pill style={{ fontSize: 9.5 }}>{p.level}</Pill>
                {p.active && (
                  <Pill variant="acc" style={{ fontSize: 9.5 }}>active on Push B</Pill>
                )}
              </div>
              <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
                {p.rule}
              </div>
              {p.active && (
                <div className="v2-mono" style={{
                  padding: '8px 10px', marginTop: 8, fontSize: 11,
                  background: 'var(--bg-elev)', border: '1px solid var(--border)',
                  borderRadius: 5, color: 'var(--fg-muted)',
                }}>{p.formula}</div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card title="Next-session prescription" sub="computed by the assigned model"
            attrappe={marke(QUELLE_SPEC,
              'das Modell darueber — ohne Zuordnung keine Vorgabe')}>
        <div style={{ overflowX: 'auto' }}>
          <table className="v2-tbl">
            <thead>
              <tr>
                <th>Exercise</th>
                <th style={{ width: 140 }}>Last session</th>
                <th style={{ width: 90 }}>Phase</th>
                <th style={{ width: 150 }}>Prescription</th>
              </tr>
            </thead>
            <tbody>
              {VORGABEN.map(([ex, letzte, phase, vorgabe]) => (
                <tr key={ex}>
                  <td>{ex}</td>
                  <td className="v2-num v2-muted" style={{ fontSize: 11 }}>{letzte}</td>
                  <td>
                    <Pill style={{
                      fontSize: 9.5,
                      color: phase === 'weight' ? 'var(--pos)'
                        : phase === 'stalled' ? 'var(--warn)' : 'var(--fg-muted)',
                    }}>{phase}</Pill>
                  </td>
                  <td className="v2-num" style={{
                    fontSize: 11.5,
                    color: vorgabe.includes('↑') ? 'var(--pos)'
                      : vorgabe.includes('deload') ? 'var(--warn)' : 'var(--fg)',
                  }}>{vorgabe}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Fatigue detection" sub={`${ausgeloest} of 4 triggers active`}
            attrappe={marke(QUELLE_SPEC,
              'vier Ausloeser ueber training und recovery zugleich — '
              + 'gemeinsame Sicht fehlt (E-52)')}>
        <div className="v2-col-gap" style={{ gap: 6 }}>
          {DELOAD_TRIGGERS.map(tr => (
            <div key={tr.t} style={{
              padding: 10, borderRadius: 6,
              background: tr.hit
                ? 'color-mix(in oklch, var(--warn) 7%, var(--surface))'
                : 'var(--surface)',
              border: `1px solid ${tr.hit
                ? 'color-mix(in oklch, var(--warn) 28%, var(--border))'
                : 'var(--border)'}`,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3,
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: 999, flexShrink: 0,
                  background: tr.hit ? 'var(--warn)' : 'var(--fg-dim)',
                }} />
                <span style={{
                  fontSize: 11.5, fontWeight: tr.hit ? 600 : 400,
                  color: tr.hit ? 'var(--fg)' : 'var(--fg-muted)',
                }}>{tr.t}</span>
              </div>
              <div className="v2-dim v2-mono" style={{ fontSize: 10, paddingLeft: 14 }}>
                {tr.detail}
              </div>
            </div>
          ))}
        </div>
        <div className="v2-divider" />
        <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Deload protocol</div>
        <Row label="Weight reduction" value="−10%" />
        <Row label="Set reduction" value="2/3 of normal" />
        <Row label="Duration" value="1 week" />
        <Row label="Threshold" value="3 sessions without progression" />
      </Card>

      <Card title="Set types" sub="volume counting"
            attrappe={marke(QUELLE_SPEC,
              'eine Satzart je Satz — `training.sets` kennt kein Feld '
              + 'dafuer')}>
        <div style={{ overflowX: 'auto' }}>
          <table className="v2-tbl">
            <thead>
              <tr>
                <th style={{ width: 120 }}>Art</th>
                <th>Beschreibung</th>
                <th style={{ width: 100 }}>Volumen</th>
              </tr>
            </thead>
            <tbody>
              {SET_TYPES.map(s => (
                <tr key={s.id}>
                  <td className="v2-mono" style={{ fontSize: 11 }}>{s.label}</td>
                  <td className="v2-muted">{s.desc}</td>
                  <td>
                    <Pill variant={s.volume ? 'pos' : undefined}>
                      {s.volume ? 'counts' : 'excluded'}
                    </Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}

/** `standards`: die eine Kachel, die oben fehlt. */
export function FehlendeStandardsKacheln() {
  const anteile: Array<[string, number, number]> = [
    ['adherence', 0.92, 0.40],
    ['landmarks', 0.60, 0.30],
    ['strength', 0.88, 0.20],
    ['balance', 0.94, 0.10],
  ]
  const wert = Math.round(
    anteile.reduce((s, [, v, g]) => s + v * g, 0) * 100)
  return (
    <Card title="Training score" sub="exported to Goals"
          attrappe={marke(QUELLE_SPEC,
            'einen Ausspielweg nach goals — die Kennzahl wird nirgends '
            + 'gespeichert und von goals nicht gelesen')}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
        <Ring value={wert} max={100} color="var(--acc-train)"
              label="score" size={88} stroke={7} />
        <div className="v2-dim v2-mono" style={{ fontSize: 10.5, lineHeight: 1.7 }}>
          {anteile.map(([l, v, g]) => (
            <div key={l}>{l.padEnd(11, ' ')} {v.toFixed(2)} × {g.toFixed(2)}</div>
          ))}
        </div>
      </div>
      <Row label="Session adherence" value="22 of 24" />
      <Row label="Volume in landmarks" value="6 of 10 groups" />
      <Row label="Strength trend" value="+4.2% · 12 wk" />
      <Row label="Muscle balance" value="Push:Pull 1.05" />
      <div className="v2-divider" />
      <div className="v2-dim" style={{ fontSize: 11, lineHeight: 1.5 }}>
        Landmarks ist der schwache Anteil — vier Gruppen ausserhalb des
        Bands. Waden und Beinbeuger hineinzubringen hebt den Wert um
        etwa neun Punkte.
      </div>
    </Card>
  )
}

/** `calendar`: die drei Kacheln, die oben fehlen. */
export function FehlendeCalendarKacheln() {
  return (
    <>
      <Card title="Streak" sub="Wochen in Folge"
            attrappe={marke(QUELLE_SPEC,
              'nichts — die Serie ist gebaut und steht auf `today`; '
              + 'auf diesem Reiter fehlt sie nur')}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
          <span className="v2-num" style={{ fontSize: 32, fontWeight: 600 }}>12</span>
          <span className="v2-dim" style={{ fontSize: 12 }}>
            consecutive active weeks
          </span>
        </div>
        <Row label="Longest streak" value="18 weeks" />
        <Row label="This month" value="12 of 13 planned" />
        <Row label="Adherence" value="92%" />
      </Card>

      <Card title="Cross-module gating" sub="today's checks"
            attrappe={marke(QUELLE_SPEC,
              'Regeln, die Recovery gegen Training halten — gemeinsame '
              + 'Sicht fehlt (E-52)')}>
        <div className="v2-col-gap" style={{ gap: 6 }}>
          {GATING.map(([quelle, wert, satz]) => (
            <div key={quelle + wert} style={{
              padding: 10, borderRadius: 6,
              background: 'color-mix(in oklch, var(--pos) 5%, var(--surface))',
              border: '1px solid color-mix(in oklch, var(--pos) 22%, var(--border))',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3,
                flexWrap: 'wrap',
              }}>
                <Pill>{quelle}</Pill>
                <span className="v2-num" style={{ fontSize: 11 }}>{wert}</span>
                <Pill variant="pos" style={{ marginLeft: 'auto', fontSize: 9 }}>ok</Pill>
              </div>
              <div className="v2-dim" style={{ fontSize: 10.5, paddingLeft: 2 }}>
                {satz}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Pending actions" sub={`${OFFENE_PUNKTE.length} open`}
            attrappe={marke(QUELLE_SPEC,
              'eine Aufgabenliste je Nutzer — es gibt sie in recovery, '
              + 'nicht in training')}>
        <div className="v2-col-gap" style={{ gap: 5 }}>
          {OFFENE_PUNKTE.map(([was, wo]) => (
            <div key={was} style={{
              display: 'flex', gap: 9, padding: 9,
              background: 'color-mix(in oklch, var(--warn) 5%, var(--surface))',
              border: '1px solid color-mix(in oklch, var(--warn) 22%, var(--border))',
              borderRadius: 5,
            }}>
              <div style={{
                width: 3, alignSelf: 'stretch',
                background: 'var(--warn)', borderRadius: 2,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11.5 }}>{was}</div>
                <div className="v2-dim v2-mono" style={{ fontSize: 10, marginTop: 2 }}>
                  {wo}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}
