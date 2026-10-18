'use client'

// Zwei Tabs: „Adaptive TDEE" und „Cross-module". G-671: die Phase-engine-
// Referenz (`GoalsPhaseView`) ist entfernt — nicht in PhaseEngine.dc.html.
//
// QUELLE: theme-v1/module-goals-pro.jsx:491-574 (`GoalsTDEEView`), :576-689 (`GoalsCrossModuleView`).
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
  TDEE_STATE, CONTRIBUTIONS, CONTRIB_WEIGHTS, calcGoalProgress, findBottleneck,
} from './daten'
import { ATTRAPPE } from './ansicht'
import { TdeeKopf } from './tdee-kopf'

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

  // ══ G-365: der Rechenweg kommt aus `goals.adaptive_tdee` ══════
  //
  // `[cmd]` **Gemessen 2026-09-06 fuer `dev@lumeos.app`:** 14 Tage,
  // Zufuhr 2.379,2 kcal, Gewichtsdelta 0,330 kg, roher TDEE 2.183,7,
  // `alpha` 1,0, `kcal_per_kg` 7.700, Vertrauen **high**.
  //
  // `[cmd]` **Die Prop `tdee` lag an** — `TdeeKopf` benutzt sie seit
  // GO-16 —, **diese Kachel rechnete daneben mit `TDEE_STATE`.**
  //
  // `[read]` **Was die Funktion NICHT liefert, bleibt Entwurf:** die
  // modeluebergreifenden Korrekturen (Trainingslast,
  // Erholungsabschlag) — **sie stehen weiter unten im markierten
  // Block.** **Nicht erfunden** (C-378).
  const echterWeg = tdee && tdee.avg_intake_kcal != null
    && tdee.weight_delta_kg != null && tdee.raw_tdee_kcal != null
    ? tdee : null

  const kcalProKg = echterWeg?.kcal_per_kg ?? 7700
  const wochenZufuhr = echterWeg
    ? Math.round(echterWeg.avg_intake_kcal! * 7)
    : t.weeklyIntakeAvg * 7
  const gewichtsDelta = echterWeg?.weight_delta_kg ?? t.weightDeltaKg
  const kalorienDelta = Math.round(gewichtsDelta * kcalProKg)
  const rohTDEE = echterWeg
    ? Math.round(echterWeg.raw_tdee_kcal!)
    : Math.round((wochenZufuhr - t.weightDeltaKg * 7700) / 7)

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

        <Card
          title="Calculation trace"
          sub={echterWeg
            ? `${echterWeg.window_days ?? 0} Tage · Vertrauen ${echterWeg.confidence ?? '—'}`
            : 'how this week\'s number was derived'}
          attrappe={echterWeg ? undefined : ATTRAPPE}
          actions={echterWeg ? <Pill variant="pos">echte Daten</Pill> : undefined}
        >
          {/* Die Herleitung als Text — wie bei Recovery der Beleg, dass
              die Zahl nicht geraten ist. Einrueckung unveraendert. */}
          <pre className="v2-goals-trace">{`weeklyIntake     = ${wochenZufuhr.toLocaleString('en-US')} kcal
Δweight          = ${gewichtsDelta} kg
caloricDelta     = ${gewichtsDelta} × ${kcalProKg} = ${kalorienDelta} kcal
rawTDEE          = (${wochenZufuhr.toLocaleString('en-US')} − (${kalorienDelta})) / 7
                 = ${rohTDEE.toLocaleString('en-US')} kcal/day

EMA (α = ${echterWeg?.alpha ?? t.alpha})
  = ${(echterWeg?.adaptive_tdee_kcal ?? t.current).toLocaleString('en-US')} kcal/day
  Formel-Grundlage ${(echterWeg?.formula_tdee_kcal ?? t.formulaBaseline).toLocaleString('en-US')} kcal/day

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
