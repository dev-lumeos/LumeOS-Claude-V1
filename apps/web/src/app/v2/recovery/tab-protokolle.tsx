'use client'

// Vier Tabs: „Modalities", „Overtraining", „Protocols" und „Stress".
//
// QUELLEN:
//   theme-v1/module-recovery-v2.jsx:648-745 (`RecModalities`),
//     :748-822 (`RecOvertraining`), :825-897 (`RecProtocols`).
//   theme-v1/module-crossmodule-rest.jsx:22-113 (`RecoveryStress`).
//
// `[cmd]` **Der Tab „Stress" steht in KEINER der fuenf
// Recovery-Dateien.** Beide Rahmen rufen ihn als
// `window.RecoveryStress` auf (module-recovery.jsx:47 und
// module-recovery-v2.jsx:56); definiert ist er in
// `module-crossmodule-rest.jsx` — einer Sammeldatei, die ausserdem
// Goals-Fotos und die Marketplace-Boerse enthaelt. Ohne sie waere der
// neunte Tab leer. Im Bericht vermerkt.
//
// GEAENDERT IST NUR DAS TECHNISCHE: TypeScript, `v2-`-Praefix,
// `color-mix(in srgb, …)` -> `in oklch`, `<div onClick>` -> `<button>`,
// Knoepfe ohne Ziel oeffnen `InEntwicklung`.
//
// `[cmd]` ALLES IST ATTRAPPE.
import * as React from 'react'
import { Card, Pill, Icon, Ring, Meter, LineChart, InEntwicklungKnopf } from '@lumeos/ui'

import {
  MODALITY_EVIDENZ, MODALITY_META, MODALITY_LOG, TODAY_MODALITIES,
  RECOVERY_PROTOCOLS, ACTIVE_PROTOCOL,
  STRESS_TODAY, STRESS_SOURCES, STRESS_BANDS, STRESS_14D,
} from './motor'
import { useRecovery } from './kontext'
import { ATTRAPPE } from './ansicht'

// ═══ MODALITIES ══════════════════════════════════════════════════
// [cmd] module-recovery-v2.jsx:648-745. **C-124: die Bonuspunkte der
// Vorlage („Today's bonus +3.5", Katalogspalte „Bonus", „Δ score")
// sind entfernt — alle 32 Registry-Zeilen sagen REMOVE_NUMERIC_VALUE.
// An ihrer Stelle steht je Modalitaet Richtung + Endpunkt + Quelle.**
export function RecModalities() {
  const { open } = useRecovery()
  return (
    <div>
      <div className="v2-grid v2-g-cols-4" style={{ gap: 10, marginBottom: 14 }}>
        {/* Marke ohne Begruendungstext — wie bei Training: der Satz
            waere laenger als die Kachel selbst. */}
        <Card className="v2-card-tight" style={{ padding: 14 }} attrappe>
          <div className="v2-eyebrow">Logged today</div>
          <div className="v2-num" style={{ fontSize: 22 }}>{TODAY_MODALITIES.length}</div>
          <div className="v2-dim" style={{ fontSize: 11 }}>{MODALITY_LOG.length} in last 7 days</div>
        </Card>
        <Card className="v2-card-tight" style={{ padding: 14 }} attrappe>
          <div className="v2-eyebrow">Best next-day rating</div>
          <div className="v2-num" style={{ fontSize: 22, color: 'var(--pos)' }}>9/10</div>
          <div className="v2-dim" style={{ fontSize: 11 }}>massage · 12 Aug · dein Rating</div>
        </Card>
        <Card className="v2-card-tight" style={{ padding: 14 }} attrappe>
          <div className="v2-eyebrow">Belegte Modalitaeten</div>
          <div className="v2-num" style={{ fontSize: 22 }}>
            {Object.values(MODALITY_EVIDENZ).filter(e => e.grad !== null).length}
          </div>
          <div className="v2-dim" style={{ fontSize: 11 }}>von {Object.keys(MODALITY_EVIDENZ).length} im Register (crawl_025)</div>
        </Card>
        <Card className="v2-card-tight" style={{ padding: 14 }} attrappe>
          <div className="v2-eyebrow">Awaiting rating</div>
          <div className="v2-num" style={{ fontSize: 22, color: 'var(--warn)' }}>
            {MODALITY_LOG.filter(m => m.nextDay == null).length}
          </div>
          <div className="v2-dim" style={{ fontSize: 11 }}>next-day feedback</div>
        </Card>
      </div>

      {/* Nicht `v2-grid v2-g-cols-2`: das Paar bricht auf schmalen
          Schirmen NICHT um (v2.css:470 setzt nur die Spalten). Die
          beiden Kacheln hier tragen Tabellen und brauchen den
          1100px-Haltepunkt. */}
      <div className="v2-rec-grid-11">
        <Card
          title="Modality catalog" sub="11 types · Wirkung laut Evidenzregister"
          attrappe={ATTRAPPE}
          actions={
            <button type="button" className="v2-btn v2-btn-sm" onClick={() => open({ typ: 'logModality' })}>
              <Icon name="plus" className="v2-ic v2-ic-sm" />Log
            </button>
          }
        >
          <div className="v2-tbl-wrap">
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th style={{ width: 150 }}>Modality</th>
                  <th>Wirkung (Endpunkt)</th>
                  <th style={{ width: 56, textAlign: 'right' }}>Grad</th>
                  <th style={{ width: 70, textAlign: 'right' }}>Used · 7d</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(MODALITY_EVIDENZ)
                  .sort((a, b) => (a[1].grad ?? 'Z').localeCompare(b[1].grad ?? 'Z'))
                  .map(([k, e]) => {
                    const meta = MODALITY_META[k]
                    const used = MODALITY_LOG.filter(m => m.type === k).length
                    return (
                      <tr key={k}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Icon name={meta.icon as never} className="v2-ic v2-ic-sm" style={{ color: meta.c }} />
                            <span style={{ fontSize: 12 }}>{meta.label}</span>
                          </div>
                        </td>
                        <td
                          style={{ fontSize: 11, lineHeight: 1.45 }}
                          className={e.grad === null ? 'v2-dim' : undefined}
                          title={e.quelle ?? undefined}
                        >
                          {e.aussage}
                          {e.quelle && (
                            <span className="v2-dim v2-mono" style={{ fontSize: 9, marginLeft: 5 }}>{e.quelle}</span>
                          )}
                        </td>
                        <td className="v2-num" style={{ textAlign: 'right' }}>{e.grad ?? '—'}</td>
                        <td className="v2-num v2-muted" style={{ textAlign: 'right' }}>{used || '—'}</td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
          <div className="v2-divider" />
          <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.5 }}>
            C-124: Punktboni sind entfernt — das Evidenzregister
            (crawl_025) belegt Richtungen je Endpunkt, aber keinen
            einzigen Punktwert. Eine Modalitaet ohne Registerzeile
            behauptet hier nichts.
          </div>
        </Card>

        <Card title="Effectiveness log" sub="immediate rating + next-day follow-up" attrappe={ATTRAPPE}>
          <div className="v2-col-gap" style={{ gap: 6 }}>
            {MODALITY_LOG.map(m => {
              const meta = MODALITY_META[m.type]
              return (
                <div key={m.id} style={{ padding: 11, background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <Icon name={meta.icon as never} className="v2-ic v2-ic-sm" style={{ color: meta.c }} />
                    <span style={{ fontSize: 12.5, fontWeight: 600 }}>{meta.label}</span>
                    <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>{m.duration} min · {m.detail}</span>
                    <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>{m.date.slice(5)} {m.time}</span>
                  </div>
                  <div className="v2-rec-effekt">
                    <div>
                      <div className="v2-eyebrow" style={{ marginBottom: 3 }}>Immediate · {m.immediate}/10</div>
                      <div style={{ display: 'flex', gap: 1.5 }}>
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div key={i} style={{ flex: 1, height: 5, borderRadius: 1, background: i < m.immediate ? meta.c : 'var(--surface-2)' }} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="v2-eyebrow" style={{ marginBottom: 3 }}>Next day · {m.nextDay ?? 'pending'}</div>
                      {m.nextDay != null ? (
                        <div style={{ display: 'flex', gap: 1.5 }}>
                          {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} style={{ flex: 1, height: 5, borderRadius: 1, background: i < (m.nextDay ?? 0) ? 'var(--acc-recov)' : 'var(--surface-2)' }} />
                          ))}
                        </div>
                      ) : (
                        <InEntwicklungKnopf titel={`${meta.label} — Rate now`} className="v2-btn v2-btn-sm"
                                            style={{ height: 18, fontSize: 9.5, padding: '0 7px' }}>
                          Rate now
                        </InEntwicklungKnopf>
                      )}
                    </div>
                    {/* C-124: die „Δ score"-Spalte (+4/+6/+8) ist
                        entfernt — erfundene Punkteffekte. Was bleibt,
                        sind die zwei NUTZER-Ratings links. */}
                    <div style={{ textAlign: 'right' }}>
                      <div className="v2-eyebrow" style={{ marginBottom: 2 }}>Wirkung lt. Register</div>
                      <div className="v2-dim" style={{ fontSize: 10, lineHeight: 1.4, maxWidth: 150 }}>
                        {MODALITY_EVIDENZ[m.type]?.grad
                          ? `Grad ${MODALITY_EVIDENZ[m.type].grad}`
                          : 'kein Eintrag'}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}

// ═══ OVERTRAINING ════════════════════════════════════════════════
// [cmd] module-recovery-v2.jsx:748-822.
export function RecOvertraining() {
  const { ot } = useRecovery()
  const sevColor = ({
    normal: 'var(--pos)', moderate: 'var(--warn)', high: 'var(--neg)', critical: 'var(--neg)',
  } as Record<string, string>)[ot.severity]

  return (
    <div className="v2-grid-14">
      <Card title="Signal panel" sub={`${ot.count} of 8 firing · severity ${ot.severity}`} attrappe={ATTRAPPE}>
        <div className="v2-col-gap" style={{ gap: 6 }}>
          {ot.results.map(r => (
            <div key={r.id} style={{
              display: 'flex', gap: 11, padding: 11,
              background: r.fired ? 'color-mix(in oklch, var(--warn) 6%, var(--surface))' : 'var(--surface)',
              border: `1px solid ${r.fired ? 'color-mix(in oklch, var(--warn) 26%, var(--border))' : 'var(--border)'}`,
              borderRadius: 6,
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
                display: 'grid', placeItems: 'center',
                background: r.fired ? 'var(--warn)' : 'var(--surface-2)',
                color: r.fired ? 'var(--bg)' : 'var(--fg-dim)',
              }}>
                <Icon name={r.fired ? 'alert' : 'check'} className="v2-ic" style={{ width: 10, height: 10, strokeWidth: 2.5 }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12.5, fontWeight: r.fired ? 600 : 500, color: r.fired ? 'var(--fg)' : 'var(--fg-muted)' }}>
                    {r.label}
                  </span>
                  <span className="v2-mono v2-dim" style={{ marginLeft: 'auto', fontSize: 9.5 }}>{r.id}</span>
                </div>
                <div className="v2-dim v2-mono" style={{ fontSize: 10.5 }}>{r.detailText}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="Severity" sub="based on signal count, not any single threshold" attrappe={ATTRAPPE}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 14, flexShrink: 0,
              background: `color-mix(in oklch, ${sevColor} 14%, var(--surface))`,
              border: `1px solid color-mix(in oklch, ${sevColor} 35%, var(--border))`,
              display: 'grid', placeItems: 'center',
            }}>
              <span className="v2-num" style={{ fontSize: 26, fontWeight: 600, color: sevColor }}>{ot.count}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: sevColor, textTransform: 'capitalize', marginBottom: 3 }}>
                {ot.severity}
              </div>
              <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.45 }}>
                {ot.severity === 'normal' ? 'No action needed. Keep training as planned.'
                  : ot.severity === 'moderate' ? 'Warning. A deload is worth considering.'
                    : ot.severity === 'high' ? 'Deload week strongly recommended.'
                      : 'Mandatory break. See a doctor if this persists.'}
              </div>
            </div>
          </div>
          {([
            ['0–2 signals', 'Normal', 'var(--pos)'],
            ['3–4 signals', 'Moderate · warning + deload suggestion', 'var(--warn)'],
            ['5–6 signals', 'High · deload week urgently recommended', 'var(--neg)'],
            ['7–8 signals', 'Critical · mandatory break + doctor', 'var(--neg)'],
          ] as Array<[string, string, string]>).map(([r, l, c], i) => (
            <div key={r} style={{
              display: 'flex', alignItems: 'center', gap: 9, padding: '7px 0',
              borderBottom: i < 3 ? '1px solid var(--border)' : 'none',
              opacity: (i === 0 && ot.count <= 2) || (i === 1 && ot.count >= 3 && ot.count <= 4)
                || (i === 2 && ot.count >= 5 && ot.count <= 6) || (i === 3 && ot.count >= 7) ? 1 : 0.42,
            }}>
              <span className="v2-num" style={{ fontSize: 11, width: 76, color: c }}>{r}</span>
              <span style={{ fontSize: 11, flex: 1 }}>{l}</span>
            </div>
          ))}
        </Card>

        <Card title="Alert lifecycle" attrappe={ATTRAPPE}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            {['active', 'acknowledged', 'resolved'].map((s, i) => (
              <React.Fragment key={s}>
                <div style={{
                  flex: 1, padding: '8px 6px', textAlign: 'center', borderRadius: 5, fontSize: 10.5,
                  background: i === 0 ? 'color-mix(in oklch, var(--warn) 10%, var(--surface))' : 'var(--surface)',
                  border: `1px solid ${i === 0 ? 'color-mix(in oklch, var(--warn) 30%, var(--border))' : 'var(--border)'}`,
                  color: i === 0 ? 'var(--warn)' : 'var(--fg-muted)',
                }}>{s}</div>
                {/* ABWEICHUNG MIT GRUND: die Vorlage schreibt hier
                    `<Icon name="arr_r"/>` (module-recovery-v2.jsx:811).
                    `[cmd]` Ein Symbol `arr_r` gibt es im Satz nicht —
                    weder in der Vorlage noch in packages/ui; es ist ein
                    Tippfehler fuer `arrow_right`. Dort zeichnet der
                    Pfeil deshalb NICHTS. Hier steht der gemeinte Pfeil. */}
                {i < 2 && <Icon name="arrow_right" className="v2-ic v2-ic-sm" style={{ color: 'var(--fg-dim)' }} />}
              </React.Fragment>
            ))}
          </div>
          <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.55 }}>
            No new alert is raised while one is active. That keeps a bad week from generating seven separate warnings.
          </div>
        </Card>
      </div>
    </div>
  )
}

// ═══ PROTOCOLS ═══════════════════════════════════════════════════
// [cmd] module-recovery-v2.jsx:825-897.
export function RecProtocols() {
  const { open } = useRecovery()
  const active = RECOVERY_PROTOCOLS.find(p => p.id === ACTIVE_PROTOCOL.id)
  if (!active) return null

  return (
    <div className="v2-rec-grid-13">
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card
          title={`Active · ${active.name}`}
          sub={`day ${ACTIVE_PROTOCOL.day} of ${ACTIVE_PROTOCOL.of} · started ${ACTIVE_PROTOCOL.started}`}
          attrappe={ATTRAPPE}
          actions={
            <InEntwicklungKnopf titel="End protocol" className="v2-btn v2-btn-ghost v2-btn-sm">
              End protocol
            </InEntwicklungKnopf>
          }
        >
          <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
            {Array.from({ length: Number(active.days) || 7 }).map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 8, borderRadius: 2,
                background: i < ACTIVE_PROTOCOL.day ? 'var(--acc-recov)' : 'var(--surface-2)',
              }} />
            ))}
          </div>
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Today&apos;s tasks</div>
          <div className="v2-col-gap" style={{ gap: 5 }}>
            {active.tasks.map(t => (
              <label key={t.t} style={{
                display: 'flex', alignItems: 'center', gap: 9, padding: '9px 11px',
                background: t.done ? 'color-mix(in oklch, var(--pos) 5%, var(--surface))' : 'var(--surface)',
                border: `1px solid ${t.done ? 'color-mix(in oklch, var(--pos) 24%, var(--border))' : 'var(--border)'}`,
                borderRadius: 5, cursor: 'pointer',
              }}>
                <input type="checkbox" defaultChecked={t.done} style={{ accentColor: 'var(--pos)' }} />
                <span style={{
                  fontSize: 12,
                  textDecoration: t.done ? 'line-through' : 'none',
                  color: t.done ? 'var(--fg-muted)' : 'var(--fg)',
                }}>{t.t}</span>
                {t.done && <Pill variant="pos" style={{ marginLeft: 'auto', fontSize: 9 }}>done</Pill>}
              </label>
            ))}
          </div>
          <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 10, lineHeight: 1.5 }}>
            Protocol tasks appear in your Today view the same way meal-plan ghost entries do — pre-filled, confirmable, skippable.
          </div>
        </Card>

        <Card title="Protocol library" sub="4 system templates" attrappe={ATTRAPPE}>
          <div className="v2-col-gap" style={{ gap: 8 }}>
            {RECOVERY_PROTOCOLS.map(p => (
              <button key={p.id} type="button" onClick={() => open({ typ: 'protocol', protokoll: p })}
                      style={{
                        padding: 12, textAlign: 'left', font: 'inherit', color: 'inherit', width: '100%',
                        background: p.id === ACTIVE_PROTOCOL.id ? 'color-mix(in oklch, var(--acc-recov) 6%, var(--surface))' : 'var(--surface)',
                        border: `1px solid ${p.id === ACTIVE_PROTOCOL.id ? 'color-mix(in oklch, var(--acc-recov) 28%, var(--border))' : 'var(--border)'}`,
                        borderRadius: 6, cursor: 'pointer',
                      }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                  {p.id === ACTIVE_PROTOCOL.id && <Pill variant="acc">active</Pill>}
                  <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>{p.days} days</span>
                </div>
                <div className="v2-muted" style={{ fontSize: 11.5, marginBottom: 6 }}>{p.goal}</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {p.activities.slice(0, 3).map(a => <Pill key={a} style={{ fontSize: 9.5 }}>{a}</Pill>)}
                  {p.activities.length > 3 && <Pill style={{ fontSize: 9.5 }}>+{p.activities.length - 3}</Pill>}
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <Card title="When to run which" sub="trigger conditions" attrappe={ATTRAPPE}>
        <div className="v2-col-gap" style={{ gap: 8 }}>
          {([
            ['Active Recovery Week', 'Score 60–70 for 3+ days, no acute problem', 'var(--acc-recov)'],
            ['Passive Deload', '5+ overtraining signals, or score below 55 for 3 days', 'var(--warn)'],
            ['Sleep Optimization', 'Sleep score below 70 across 7 days', 'var(--acc-coach)'],
            ['Injury Protocol', 'Acute injury logged in Medical, or soreness 3/3 for 5 days', 'var(--neg)'],
          ] as Array<[string, string, string]>).map(([n, c, col]) => (
            <div key={n} style={{ padding: 11, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                <span className="v2-dot" style={{ background: col, width: 7, height: 7 }} />
                <span style={{ fontSize: 12, fontWeight: 600 }}>{n}</span>
              </div>
              <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.45, paddingLeft: 14 }}>{c}</div>
            </div>
          ))}
        </div>
        <div className="v2-divider" />
        <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.55 }}>
          Buddy proposes a protocol when a trigger fires — it never activates one on its own. Activation is always your call.
        </div>
      </Card>
    </div>
  )
}

// ═══ STRESS ══════════════════════════════════════════════════════
// [cmd] module-crossmodule-rest.jsx:22-113 — NICHT aus den fuenf
// Recovery-Dateien. Siehe Dateikopf.
export function RecStress() {
  return (
    <div className="v2-grid-14">
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card attrappe={ATTRAPPE}>
          <div className="v2-rec-ring-zeile">
            <Ring value={STRESS_TODAY.score} max={100} color="var(--acc-recov)" label="stress" size={112} stroke={8} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="v2-eyebrow" style={{ marginBottom: 5 }}>Today · {STRESS_TODAY.band}</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Inside the working range</div>
              <div className="v2-muted" style={{ fontSize: 12, lineHeight: 1.55 }}>
                Work pressure is the main contributor this week. It costs about {Math.abs(STRESS_TODAY.hrvImpact)} ms of overnight HRV,
                which is enough to notice but not enough to change the plan.
              </div>
            </div>
          </div>
          <div style={{ position: 'relative', height: 26, borderRadius: 5, overflow: 'hidden', display: 'flex', border: '1px solid var(--border)' }}>
            {STRESS_BANDS.map((b, i) => {
              const from = i === 0 ? 0 : STRESS_BANDS[i - 1].to
              return (
                <div key={b.label} style={{
                  flex: b.to - from, background: b.color, opacity: 0.4,
                  display: 'grid', placeItems: 'center', fontSize: 9.5,
                  fontFamily: 'var(--font-mono)', color: 'var(--bg)', fontWeight: 600,
                }}>{b.label.toUpperCase()}</div>
              )
            })}
            <div style={{
              position: 'absolute', left: `${STRESS_TODAY.score}%`, top: -3, bottom: -3,
              width: 2, background: 'var(--fg)', boxShadow: '0 0 0 2px var(--bg)',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 9.5, color: 'var(--fg-dim)', fontFamily: 'var(--font-mono)' }}>
            <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
          </div>
        </Card>

        <Card title="Contributors" sub="what the score is made of" attrappe={ATTRAPPE}>
          <div className="v2-col-gap" style={{ gap: 9 }}>
            {STRESS_SOURCES.map(s => (
              <div key={s.k} className="v2-rec-stress-zeile">
                <div>
                  <div style={{ fontSize: 12 }}>{s.k}</div>
                  <div className="v2-dim" style={{ fontSize: 10 }}>{s.note}</div>
                </div>
                <Meter value={s.v} color={s.v >= 60 ? 'var(--warn)' : s.v >= 40 ? 'var(--acc-recov)' : 'var(--pos)'} />
                <span className="v2-num" style={{ textAlign: 'right', fontSize: 11.5 }}>{s.v}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="14 days" attrappe={ATTRAPPE}>
          <LineChart h={160} range={[25, 65]}
                     xLabels={['', '', '', '', 'May 8', '', '', '', '', '', '', '', '', 'today']}
                     series={[{ data: STRESS_14D, color: 'var(--acc-recov)' }]} />
          <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11, color: 'var(--fg-muted)', flexWrap: 'wrap' }}>
            <span>Average <span className="v2-num" style={{ color: 'var(--fg)' }}>44</span></span>
            <span>Peak <span className="v2-num" style={{ color: 'var(--warn)' }}>52 · May 9</span></span>
            <span className="v2-dim">Trend flat over the fortnight</span>
          </div>
        </Card>
      </div>

      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="Log stress" sub="one tap, feeds the score" attrappe={ATTRAPPE}>
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Right now</div>
          <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <InEntwicklungKnopf key={i} titel={`Stress ${i + 1} von 10`} className="v2-rec-skala-btn"
                                  style={{
                                    flex: 1, height: 30, borderRadius: 4, cursor: 'pointer',
                                    background: i < 4 ? 'color-mix(in oklch, var(--acc-recov) 25%, transparent)' : 'var(--surface-2)',
                                    border: `1px solid ${i === 3 ? 'var(--acc-recov)' : 'var(--border)'}`,
                                    color: i < 4 ? 'var(--acc-recov)' : 'var(--fg-dim)',
                                    fontFamily: 'var(--font-mono)', fontSize: 10,
                                  }}>{i + 1}</InEntwicklungKnopf>
            ))}
          </div>
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Source</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
            {['Work', 'Sleep', 'Training', 'Family', 'Travel', 'Illness', 'Money', 'Other'].map(t => (
              <InEntwicklungKnopf key={t} titel={`Stressquelle ${t}`} className="v2-pill"
                                  style={{ cursor: 'pointer', padding: '4px 10px', fontSize: 11 }}>
                {t}
              </InEntwicklungKnopf>
            ))}
          </div>
          <InEntwicklungKnopf titel="Log stress" className="v2-btn v2-btn-primary" style={{ width: '100%' }}>
            <Icon name="check" className="v2-ic v2-ic-sm" />Log
          </InEntwicklungKnopf>
        </Card>

        <Card title="What helps you" sub="from your own data" attrappe={ATTRAPPE}>
          <div className="v2-col-gap" style={{ gap: 5 }}>
            {([['Sauna', -9], ['Easy walk', -6], ['Cold plunge', -4], ['Meditation', -3], ['Extra hour of sleep', -11]] as Array<[string, number]>).map(([k, v]) => (
              <div key={k} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 5, fontSize: 11.5,
              }}>
                <span style={{ flex: 1 }}>{k}</span>
                <span className="v2-num" style={{ color: 'var(--pos)' }}>{v} pts</span>
              </div>
            ))}
          </div>
          <div className="v2-divider" />
          <div className="v2-muted" style={{ fontSize: 11, lineHeight: 1.5 }}>
            Average change in next-day stress score when logged. Sleep is the biggest lever by a clear margin.
          </div>
        </Card>
      </div>
    </div>
  )
}
