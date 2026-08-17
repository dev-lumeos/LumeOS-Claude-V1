'use client'

// Zwei Tabs: „Physique ratios" und „Pose sessions".
//
// QUELLE: theme-v1/module-goals-pro.jsx:691-806 (`GoalsPhysiqueView`),
// :808-905 (`GoalsPosesView`).
//
// `[read]` Der Umsetzungsplan fuehrt beide unter „Was nicht gebaut
// wird": *„13 Umfangmessungen, FFMI, V-Taper, Goldener Schnitt —
// schoene Zahlen ohne Eingabemoeglichkeit"* und *„Fotosessions,
// IFBB-Posen, Bildanalyse — braucht Dateiablage, Posenkatalog und ein
// Bildmodell."* **Als Attrappe stehen sie trotzdem**, weil der Auftrag
// die Vorlage vollstaendig verlangt; gebaut wird davon nichts.
//
// GEAENDERT IST NUR DAS TECHNISCHE: TypeScript, `v2-`-Praefix,
// `color-mix(in srgb, …)` -> `in oklch`, Knoepfe ohne Ziel oeffnen
// `InEntwicklung`.
//
// `[cmd]` ALLES IST ATTRAPPE.
import * as React from 'react'
import { Card, Pill, Icon, Ring, Meter, Row, InEntwicklungKnopf } from '@lumeos/ui'

import { CIRCUMFERENCES, POSE_SETS, calcRatios } from './daten'
import { ATTRAPPE } from './ansicht'

// ═══ PHYSIQUE RATIOS ═════════════════════════════════════════════
// [cmd] module-goals-pro.jsx:691-806.
export function GoalsPhysiqueView() {
  const r = calcRatios(CIRCUMFERENCES)
  const ffmi = 22.3

  return (
    <div className="v2-grid-14">
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="Physique ratios" sub="classic bodybuilding proportions" attrappe={ATTRAPPE}>
          <div className="v2-grid v2-g-cols-3" style={{ gap: 10, marginBottom: 14 }}>
            <Card className="v2-card-tight" style={{ padding: 12 }}>
              <div className="v2-eyebrow" style={{ marginBottom: 3 }}>Shoulder : Waist</div>
              <div className="v2-num" style={{
                fontSize: 20, fontWeight: 600,
                color: r.shoulderWaist >= 1.618 ? 'var(--pos)' : 'var(--warn)',
              }}>{r.shoulderWaist}</div>
              <div className="v2-dim v2-mono" style={{ fontSize: 10 }}>golden target 1.618</div>
              <div style={{ marginTop: 6 }}>
                <Meter value={r.shoulderWaist} max={1.8}
                       color={r.shoulderWaist >= 1.618 ? 'var(--pos)' : 'var(--warn)'} />
              </div>
            </Card>
            <Card className="v2-card-tight" style={{ padding: 12 }}>
              <div className="v2-eyebrow" style={{ marginBottom: 3 }}>V-Taper score</div>
              <div className="v2-num" style={{ fontSize: 20, fontWeight: 600 }}>{r.vTaper}</div>
              <div className="v2-dim v2-mono" style={{ fontSize: 10 }}>0–100</div>
              <div style={{ marginTop: 6 }}><Meter value={r.vTaper} max={100} color="var(--acc-goals)" /></div>
            </Card>
            <Card className="v2-card-tight" style={{ padding: 12 }}>
              <div className="v2-eyebrow" style={{ marginBottom: 3 }}>Steve Reeves</div>
              <div className="v2-num" style={{ fontSize: 20, fontWeight: 600 }}>{r.reeves}</div>
              <div className="v2-dim v2-mono" style={{ fontSize: 10 }}>proportion score</div>
              <div style={{ marginTop: 6 }}><Meter value={r.reeves} max={100} color="var(--acc-goals)" /></div>
            </Card>
          </div>
          <div className="v2-grid v2-g-cols-2" style={{ gap: 10 }}>
            <Card className="v2-card-tight" style={{ padding: 12 }}>
              <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Arm symmetry</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                <span className="v2-num" style={{
                  fontSize: 18, color: r.armSymmetry >= 97 ? 'var(--pos)' : 'var(--warn)',
                }}>{r.armSymmetry}%</span>
                <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>L 39.0 · R 39.5 cm</span>
              </div>
            </Card>
            <Card className="v2-card-tight" style={{ padding: 12 }}>
              <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Leg symmetry</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                <span className="v2-num" style={{
                  fontSize: 18, color: r.legSymmetry >= 97 ? 'var(--pos)' : 'var(--warn)',
                }}>{r.legSymmetry}%</span>
                <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>L 59.5 · R 60.0 cm</span>
              </div>
            </Card>
          </div>
        </Card>

        <Card title="13 circumferences" sub="last update May 14 · cm" attrappe={ATTRAPPE}>
          <div className="v2-tbl-wrap">
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th>Site</th>
                  <th style={{ width: 80, textAlign: 'right' }}>Current</th>
                  <th style={{ width: 80, textAlign: 'right' }}>Previous</th>
                  <th style={{ width: 70, textAlign: 'right' }}>Δ</th>
                  <th style={{ width: 120 }}>Trend</th>
                </tr>
              </thead>
              <tbody>
                {CIRCUMFERENCES.map(c => {
                  const d = +(c.v - c.prev).toFixed(1)
                  const isWaist = ['waist', 'hips'].includes(c.id)
                  const good = isWaist ? d < 0 : d > 0
                  const farbe = d === 0 ? 'var(--fg-dim)' : good ? 'var(--pos)' : 'var(--warn)'
                  return (
                    <tr key={c.id}>
                      <td>{c.label}</td>
                      <td className="v2-num" style={{ textAlign: 'right', fontWeight: 500 }}>{c.v.toFixed(1)}</td>
                      <td className="v2-num v2-muted" style={{ textAlign: 'right' }}>{c.prev.toFixed(1)}</td>
                      <td className="v2-num" style={{ textAlign: 'right', color: farbe }}>
                        {d > 0 ? '+' : ''}{d}
                      </td>
                      <td><Meter value={Math.abs(d) * 20 + 20} max={100} color={farbe} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="FFMI" sub="fat-free mass index" attrappe={ATTRAPPE}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12, flexWrap: 'wrap' }}>
            <Ring value={ffmi} max={28} color="var(--acc-train)" label="ffmi" size={92} stroke={7} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="v2-num" style={{ fontSize: 20, fontWeight: 600, marginBottom: 3 }}>{ffmi}</div>
              <Pill variant="acc">advanced</Pill>
              <div className="v2-dim v2-mono" style={{ fontSize: 10, marginTop: 6 }}>height-adjusted</div>
            </div>
          </div>
          <div className="v2-col-gap" style={{ gap: 3 }}>
            {([
              { r: '18–20', l: 'Developing', active: false },
              { r: '20–22', l: 'Natural trained', active: false },
              { r: '22–25', l: 'Advanced natural', active: true },
              { r: '25+', l: 'Elite / assisted', active: false },
            ]).map(b => (
              <div key={b.r} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
                borderRadius: 5, fontSize: 11.5,
                background: b.active ? 'color-mix(in oklch, var(--acc-train) 10%, var(--surface))' : 'var(--surface)',
                border: `1px solid ${b.active ? 'color-mix(in oklch, var(--acc-train) 30%, var(--border))' : 'var(--border)'}`,
              }}>
                <span className="v2-num v2-dim" style={{ width: 48, fontSize: 10, flexShrink: 0 }}>{b.r}</span>
                <span style={{ flex: 1, minWidth: 0 }}>{b.l}</span>
                {b.active && <Pill variant="acc" style={{ fontSize: 9 }}>you</Pill>}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Body fat method" sub="track which method produced each reading" attrappe={ATTRAPPE}>
          <Row label="Current" value="13.8% · DEXA" />
          <Row label="Measured" value="Apr 23, 2026" />
          <Row label="Next scan" value="Jul 15 · booked" />
          <div className="v2-divider" />
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Method history</div>
          <div className="v2-tbl-wrap">
            <table className="v2-tbl">
              <tbody>
                {([
                  ['Apr 23', 'DEXA', '13.8%'],
                  ['Mar 15', 'DEXA', '15.4%'],
                  ['Feb 20', 'BIA', '16.2%'],
                  ['Jan 12', 'Caliper (7-site)', '16.8%'],
                ] as Array<[string, string, string]>).map(([d, m, v]) => (
                  <tr key={d}>
                    <td className="v2-num v2-muted">{d}</td>
                    <td>{m}</td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

// ═══ POSE SESSIONS ═══════════════════════════════════════════════
// [cmd] module-goals-pro.jsx:808-905.
export function GoalsPosesView() {
  const [set, setSet] = React.useState('mandatory')
  const sets: Record<string, string> = {
    mandatory: '8 IFBB Mandatory',
    quarter: '4 Quarter Turns',
    detail: '9 Detail Close-Ups',
  }
  const poses = POSE_SETS[set]

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 7, padding: 2, gap: 1, flexWrap: 'wrap',
        }}>
          {Object.entries(sets).map(([k, l]) => (
            <button key={k} type="button" onClick={() => setSet(k)} aria-pressed={set === k}
                    className={set === k ? 'v2-btn v2-btn-primary' : 'v2-btn v2-btn-ghost'}
                    style={{ height: 24, fontSize: 11, padding: '0 12px', borderRadius: 5 }}>{l}</button>
          ))}
        </div>
        <div className="v2-spacer" />
        <InEntwicklungKnopf titel="Compare sessions" className="v2-btn">
          <Icon name="copy" className="v2-ic v2-ic-sm" />Compare sessions
        </InEntwicklungKnopf>
        <InEntwicklungKnopf titel="New photo session" className="v2-btn v2-btn-primary"
                            grund={'Fotosessions brauchen eine Dateiablage — der Umsetzungsplan fuehrt sie unter „Was nicht gebaut wird".'}>
          <Icon name="camera" className="v2-ic v2-ic-sm" />New photo session
        </InEntwicklungKnopf>
      </div>

      <Card title={`${sets[set]} · pose guide`}
            sub="silhouette overlay · 3/5/10s timer · retake per pose"
            attrappe={ATTRAPPE}>
        <div className="v2-goals-posen">
          {poses.map((p, i) => (
            <div key={p}>
              <div className="v2-placeholder-img"
                   style={{ aspectRatio: '3/4', borderRadius: 7, position: 'relative', marginBottom: 6 }}>
                <Strichfigur breite="60%" deckkraft={0.28} />
                <Pill style={{ position: 'absolute', top: 6, left: 6, fontSize: 9 }}>
                  {(i + 1).toString().padStart(2, '0')}
                </Pill>
                {i < 4 && (
                  <Pill variant="pos" style={{ position: 'absolute', top: 6, right: 6, fontSize: 9 }}>✓</Pill>
                )}
              </div>
              <div style={{ fontSize: 11, fontWeight: 500, lineHeight: 1.3, minHeight: 28 }}>{p}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--fg-muted)', alignItems: 'center', flexWrap: 'wrap' }}>
          <span>Session progress: <span className="v2-num" style={{ color: 'var(--fg)' }}>4 of {poses.length}</span></span>
          <span className="v2-dim">·</span>
          <span>Timer: <span className="v2-num" style={{ color: 'var(--fg)' }}>5s</span></span>
          <div className="v2-spacer" />
          <InEntwicklungKnopf titel="Retake last" className="v2-btn v2-btn-sm">Retake last</InEntwicklungKnopf>
          <InEntwicklungKnopf titel="Skip pose" className="v2-btn v2-btn-sm">Skip pose</InEntwicklungKnopf>
        </div>
      </Card>

      <div style={{ height: 14 }} />

      <div className="v2-grid-14">
        <Card title="Side-by-side comparison" sub="Mar 15 vs May 15 · Front Double Biceps" attrappe={ATTRAPPE}>
          <div className="v2-grid v2-g-cols-2" style={{ gap: 10 }}>
            {([
              { d: 'Mar 15', w: '81.2 kg', bf: '15.4%' },
              { d: 'May 15', w: '79.4 kg', bf: '13.8%' },
            ]).map(s => (
              <div key={s.d}>
                <div className="v2-placeholder-img" style={{ aspectRatio: '3/4', borderRadius: 7, marginBottom: 6 }}>
                  <Strichfigur breite="55%" deckkraft={0.25} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className="v2-num" style={{ fontSize: 12, fontWeight: 600 }}>{s.d}</div>
                  <div className="v2-dim v2-mono" style={{ fontSize: 10 }}>{s.w} · {s.bf}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="v2-eyebrow" style={{ marginTop: 10, marginBottom: 6 }}>Slider comparison</div>
          <input type="range" defaultValue="50" aria-label="Slider comparison"
                 style={{ width: '100%', accentColor: 'var(--acc-goals)' }} />
        </Card>

        <Card title="AI analysis" sub="Claude Vision · latest session" attrappe={ATTRAPPE}>
          <Row label="Overall conditioning" value="7.8 / 10" />
          <Row label="Symmetry score" value="94 / 100" />
          <Row label="Vascularity" value="moderate" />
          <Row label="Est. body fat (visual)" value="13–14%" />
          <div className="v2-divider" />
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Muscle group scores</div>
          {([
            ['Back', 8.4], ['Chest', 7.9], ['Shoulders', 8.1],
            ['Arms', 7.6], ['Quads', 8.2], ['Hamstrings', 6.8], ['Calves', 6.4],
          ] as Array<[string, number]>).map(([m, s]) => (
            <div key={m} className="v2-goals-muskelwert">
              <span style={{ color: 'var(--fg-muted)' }}>{m}</span>
              <Meter value={s * 10} max={100}
                     color={s >= 8 ? 'var(--pos)' : s >= 7 ? 'var(--acc-goals)' : 'var(--warn)'} />
              <span className="v2-num" style={{ textAlign: 'right' }}>{s}</span>
            </div>
          ))}
          <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55, marginTop: 8 }}>
            Weak point: calves and hamstrings lag the upper body. Consider adding a dedicated posterior-chain day.
          </div>
        </Card>
      </div>
    </div>
  )
}

/**
 * Die Strichfigur der Vorlage.
 *
 * `[cmd]` module-goals-pro.jsx:830 und :863 — dort zweimal woertlich
 * dasselbe SVG, nur mit anderer Breite und Deckkraft. Hier einmal, mit
 * zwei Requisiten: dieselbe Zeichnung, eine Stelle zum Pflegen.
 */
function Strichfigur({ breite, deckkraft }: { breite: string; deckkraft: number }) {
  return (
    <svg viewBox="0 0 60 80" style={{ width: breite, opacity: deckkraft }} aria-hidden focusable="false">
      <ellipse cx="30" cy="11" rx="7" ry="8" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M30 19 v10 M14 30 h32 M30 29 v22 M30 51 l-8 24 M30 51 l8 24 M14 30 l-7 18 M46 30 l7 18"
            fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}
