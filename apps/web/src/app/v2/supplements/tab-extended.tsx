'use client'

// Der Tab „Extended" — vollstaendig, mit allen acht Unterkomponenten.
//
// QUELLE: theme-v1/module-supplements.jsx — `SuppExtended` (1195),
// `ExtendedGate` (1242), `ExtendedHeader` (1285),
// `ExtendedCompoundCard` (1312), `CycleTimeline` (1381),
// `BloodworkPanel` (1426), `SideEffectLog` (1462),
// `HalfLifeChart` (1493), `ExtendedDrawer` (1528).
//
// `[cmd]` G-29 hatte den Rumpf gebaut und ALLE acht Unterkomponenten
// weggelassen — 365 Zeilen Vorlage. Die Zeilenzahl des Rumpfs (46) sah
// klein aus; der Inhalt haengt an dem, was er aufruft. Das ist die
// Falle, die im Bericht steht.
//
// `[cmd]` **G-110: Der Tab hat KEIN eigenes Gate mehr.** Hier stand
// `ExtendedGate` mit einem `useState` — G-92 hat es gemessen:
// *„schuetzt nichts. Wer klickt, sieht die Protokolle."*
//
// `[read]` Die Aufklaerung und die Entscheidung stehen jetzt in
// `extended-gate.tsx` und fallen in `ansicht.tsx` gegen
// `profiles.experience_level` (C-140) — **bevor diese Datei gerendert
// wird.**
import * as React from 'react'
import { Card, Pill, Icon, Row, Meter, LineChart, InEntwicklungKnopf } from '@lumeos/ui'

import { EXTENDED_STACK, EXTENDED_LABS } from './daten'
import { useSupp } from './kontext'

const ATTRAPPE = 'Aus dem Entwurf uebernommen. Es gibt kein `supplements`-Schema — die Zahlen sind erfunden.'

/** Ein Eintrag aus EXTENDED_STACK. Die Vorlage typisiert nicht. */
type Compound = Record<string, unknown>

const t = (v: unknown) => (v === null || v === undefined ? '' : String(v))
const z = (v: unknown) => {
  const n = typeof v === 'string' ? Number(v) : v
  return typeof n === 'number' && Number.isFinite(n) ? n : 0
}

export function SuppExtended() {
  const { open } = useSupp()
  const [drawer, setDrawer] = React.useState<string | null>(null)

  // G-110: DAS INNERE GATE IST WEG.
  //
  // `[cmd]` Hier stand `const [unlocked, setUnlocked] =
  // React.useState(false)` und darunter `if (!unlocked) return
  // <ExtendedGate …>`. **G-92 hat es gemessen:** *„Sein Gate ist ein
  // blosses `useState` und schuetzt nichts. Wer klickt, sieht die
  // Protokolle."*
  //
  // `[read]` **Das Gate faellt jetzt eine Ebene hoeher** — in
  // `ansicht.tsx`, gegen den gespeicherten Erfahrungsgrad. Wer hierher
  // kommt, hat ihn; ein zweites Gate an dieser Stelle waere entweder
  // Zierrat oder eine zweite Wahrheit.

  const liste = EXTENDED_STACK as Compound[]
  const offen = liste.find(c => t(c.id) === drawer)

  return (
    <>
      <ExtendedHeader />
      <div className="v2-grid-14" style={{ marginTop: 16 }}>
        <div className="v2-col-gap" style={{ gap: 14 }}>
          <Card
            title="Active protocols"
            sub={`${liste.length} compounds · physician-supervised`}
            attrappe={ATTRAPPE}
            actions={
              <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                      onClick={() => open('catalogAddEnh')}>
                <Icon name="plus" className="v2-ic v2-ic-sm" /> Add compound
              </button>
            }
          >
            <div className="v2-col-gap" style={{ gap: 8 }}>
              {liste.map(c => (
                <ExtendedCompoundCard key={t(c.id)} c={c} onClick={() => setDrawer(t(c.id))} />
              ))}
            </div>
          </Card>

          <CycleTimeline />

          <Card
            title="Side effect log"
            sub="last 7 days"
            attrappe={ATTRAPPE}
            actions={
              <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                      onClick={() => open('addSideEffect')}>Add entry</button>
            }
          >
            <SideEffectLog />
          </Card>
        </div>

        <div className="v2-col-gap" style={{ gap: 14 }}>
          <BloodworkPanel />

          <Card title="Visibility · who sees what" sub="permissions per coach" attrappe={ATTRAPPE}>
            <div className="v2-col-gap" style={{ gap: 6 }}>
              <Row label="Medical coach (Dr. Kessler)" value="full" sub="all compounds + labs" />
              <Row label="Nutrition coach (J. Bauer)" value="MK-677 only" sub="metabolic relevance" />
              <Row label="Training coach (Anders)" value="hidden" sub="opt-in required" />
              <Row label="Buddy (AI)" value="aggregate" sub="trends, no compounds" />
            </div>
            <div className="v2-divider" />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button type="button" className="v2-btn" onClick={() => open('permissions')}>
                <Icon name="edit" className="v2-ic v2-ic-sm" /> Edit permissions
              </button>
              <InEntwicklungKnopf titel="Audit log" className="v2-btn v2-btn-ghost">Audit log</InEntwicklungKnopf>
            </div>
          </Card>

          <Card title="Half-life · this week" attrappe={ATTRAPPE}>
            <HalfLifeChart />
          </Card>
        </div>
      </div>

      {offen && <ExtendedDrawer compound={offen} onClose={() => setDrawer(null)} />}
    </>
  )
}

// ── Header ─────────────────────────────────────────────────────
function ExtendedHeader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: 12,
      background: 'color-mix(in oklch, var(--acc-medic) 5%, var(--surface))',
      border: '1px solid color-mix(in oklch, var(--acc-medic) 22%, var(--border))',
      borderRadius: 8, flexWrap: 'wrap',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 7,
        background: 'color-mix(in oklch, var(--acc-medic) 18%, transparent)',
        border: '1px solid color-mix(in oklch, var(--acc-medic) 35%, transparent)',
        color: 'var(--acc-medic)', display: 'grid', placeItems: 'center',
      }}><Icon name="medical" className="v2-ic" /></div>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Extended supplements · log</span>
          <Pill style={{
            borderColor: 'color-mix(in oklch, var(--acc-medic) 30%, var(--border))',
            color: 'var(--acc-medic)',
            background: 'color-mix(in oklch, var(--acc-medic) 6%, transparent)',
          }}>Tracking only</Pill>
          <Pill variant="acc">Physician supervised</Pill>
        </div>
        <div className="v2-muted" style={{ fontSize: 11.5 }}>
          Dr. M. Kessler · Endokrinologie Berlin · last visit 23 Apr · next 15 Jul
        </div>
      </div>
      <InEntwicklungKnopf titel="Disclosure" className="v2-btn v2-btn-ghost">
        <Icon name="bookmark" className="v2-ic v2-ic-sm" />Disclosure
      </InEntwicklungKnopf>
      <InEntwicklungKnopf titel="Open Medical"
                          grund="Das Modul `/v2/medical` gibt es noch nicht."
                          className="v2-btn">
        <Icon name="medical" className="v2-ic v2-ic-sm" />Open Medical →
      </InEntwicklungKnopf>
    </div>
  )
}

// ── Eine Wirkstoffkarte ────────────────────────────────────────
function ExtendedCompoundCard({ c, onClick }: { c: Compound; onClick: () => void }) {
  const labStatus = t(c.labStatus)
  const labColor = labStatus === 'in_range' ? 'var(--pos)'
    : labStatus === 'watch' ? 'var(--warn)'
      : labStatus === 'out_of_range' ? 'var(--neg)' : 'var(--fg-dim)'
  const zyklus = t(c.cycleType)

  return (
    <div onClick={onClick} style={{
      padding: 12, background: 'var(--bg-elev)', border: '1px solid var(--border)',
      borderRadius: 8, cursor: 'pointer', position: 'relative',
    }}>
      <div style={{
        position: 'absolute', left: 0, top: 12, bottom: 12,
        width: 2, background: 'var(--acc-medic)', borderRadius: '0 2px 2px 0',
      }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, paddingLeft: 8, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.005em' }}>{t(c.name)}</span>
            <Pill>{t(c.category)}</Pill>
            {zyklus === 'continuous' && <Pill variant="acc">continuous</Pill>}
            {zyklus === 'cycled' && (
              <Pill style={{
                borderColor: 'color-mix(in oklch, var(--warn) 30%, var(--border))',
                color: 'var(--warn)',
                background: 'color-mix(in oklch, var(--warn) 6%, transparent)',
              }}>Wk {t(c.cycleWeek)}/{t(c.cycleTotalWeeks)}</Pill>
            )}
            {zyklus === 'as_needed' && <Pill>as-needed</Pill>}
          </div>
          <div className="v2-muted" style={{ fontSize: 11.5, marginBottom: 8, lineHeight: 1.45 }}>
            {t(c.protocol)}
          </div>
          <div className="v2-supp-compound-felder">
            {[
              ['Dose', t(c.dose), true],
              ['Schedule', t(c.schedule), false],
              ['Half-life', t(c.halfLife), true],
              ['Next dose', t(c.nextDose), true],
            ].map(([label, wert, mono]) => (
              <div key={String(label)}>
                <div className="v2-eyebrow" style={{ marginBottom: 2 }}>{String(label)}</div>
                <div className={mono ? 'v2-num' : undefined}>{String(wert)}</div>
              </div>
            ))}
          </div>
          {zyklus === 'cycled' && (
            <div style={{ marginTop: 10 }}>
              <Meter value={z(c.cycleWeek)} max={z(c.cycleTotalWeeks)} color="var(--acc-medic)" />
              <div className="v2-dim" style={{ fontSize: 10, marginTop: 3, fontFamily: 'var(--font-mono)' }}>
                {z(c.cycleTotalWeeks) - z(c.cycleWeek)} wk remaining · then {t(c.cycleOffWeeks)}w off
              </div>
            </div>
          )}
        </div>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
          gap: 6, flexShrink: 0,
        }}>
          {labStatus !== 'not_required' && labStatus !== '' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span className="v2-dot" style={{ background: labColor }} />
              <span className="v2-num" style={{ fontSize: 10, color: labColor }}>
                labs {labStatus.replace('_', ' ')}
              </span>
            </div>
          )}
          {c.prescription != null && c.prescription !== '' && (
            <span className="v2-num v2-dim" style={{ fontSize: 10 }}>{t(c.prescription)}</span>
          )}
          <span className="v2-num v2-dim" style={{ fontSize: 10 }}>
            €{z(c.monthlyCost).toFixed(2)}/mo
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Zyklus-Zeitstrahl ──────────────────────────────────────────
function CycleTimeline() {
  const { open } = useSupp()
  const weeks = Array.from({ length: 16 }, (_, i) => i + 1)
  const cycles: Array<{ name: string; color: string; bars: string[] }> = [
    { name: 'Testosterone Cyp.', color: 'var(--acc-medic)', bars: weeks.map(() => 'on') },
    { name: 'HCG', color: 'var(--acc-medic)', bars: weeks.map(() => 'on') },
    { name: 'Anastrozole', color: 'var(--acc-suppl)', bars: weeks.map(() => 'on') },
    { name: 'MK-677', color: 'var(--acc-buddy)', bars: weeks.map((_, i) => (i < 7 ? 'past' : i < 12 ? 'on' : 'off')) },
    { name: 'BPC-157', color: 'var(--acc-recov)', bars: weeks.map((_, i) => (i < 1 ? 'off' : i < 7 ? 'past' : i < 10 ? 'on' : 'off')) },
  ]
  return (
    <Card
      title="Cycle timeline · 16 weeks"
      sub="Apr 7 → Jul 28"
      attrappe={ATTRAPPE}
      actions={
        <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                onClick={() => open('planCycle')}>Plan next cycle</button>
      }
    >
      <div className="v2-supp-tbl-wrap">
        <div className="v2-supp-cycle">
          <div></div>
          <div className="v2-supp-cycle-weeks">
            {weeks.map(w => <span key={w} style={{ textAlign: 'center' }}>{w}</span>)}
          </div>
          {cycles.map(cy => (
            <React.Fragment key={cy.name}>
              <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{cy.name}</div>
              <div className="v2-supp-cycle-bars">
                {cy.bars.map((state, i) => (
                  <div key={i} style={{
                    height: 16, borderRadius: 2,
                    background: state === 'on' ? cy.color
                      : state === 'past' ? `color-mix(in oklch, ${cy.color} 35%, var(--surface-2))`
                        : 'var(--surface-2)',
                    opacity: state === 'past' ? 0.5 : state === 'off' ? 1 : 0.85,
                    border: i === 6 ? '1px solid var(--fg)' : undefined,
                  }} title={`Week ${i + 1} · ${state}`} />
                ))}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 14, marginTop: 12, fontSize: 10, color: 'var(--fg-muted)', flexWrap: 'wrap' }}>
        <span className="v2-row-gap"><span style={{ width: 10, height: 10, background: 'var(--acc-medic)', borderRadius: 2 }} /> Active</span>
        <span className="v2-row-gap"><span style={{ width: 10, height: 10, background: 'color-mix(in oklch, var(--acc-medic) 35%, var(--surface-2))', borderRadius: 2 }} /> Past</span>
        <span className="v2-row-gap"><span style={{ width: 10, height: 10, background: 'var(--surface-2)', borderRadius: 2 }} /> Off / planned</span>
        <span className="v2-row-gap" style={{ marginLeft: 'auto' }}><span style={{ width: 2, height: 10, background: 'var(--fg)' }} /> This week (Wk 7)</span>
      </div>
    </Card>
  )
}

// ── Bloodwork ──────────────────────────────────────────────────
function BloodworkPanel() {
  const { open } = useSupp()
  const labs = EXTENDED_LABS as Array<Record<string, unknown>>
  return (
    <Card
      title="Bloodwork · linked from Medical"
      sub="last panel · 23 Apr 2026"
      attrappe={ATTRAPPE}
      actions={
        <InEntwicklungKnopf titel="Open Medical"
                            grund="Das Modul `/v2/medical` gibt es noch nicht."
                            className="v2-btn v2-btn-ghost v2-btn-sm">
          Open Medical <Icon name="arrow_right" className="v2-ic v2-ic-sm" />
        </InEntwicklungKnopf>
      }
    >
      <div className="v2-col-gap" style={{ gap: 0 }}>
        {labs.map((l, i) => {
          const status = t(l.status)
          const color = status === 'in_range' ? 'var(--pos)'
            : status === 'watch' ? 'var(--warn)' : 'var(--neg)'
          return (
            <div key={t(l.marker) || i} className="v2-row" style={{ padding: '7px 0', fontSize: 11.5 }}>
              <span className="v2-row-l">
                <span className="v2-dot" style={{ background: color }} />
                {t(l.marker)}
                <span className="v2-dim" style={{ fontSize: 10 }}>{t(l.range)} {t(l.unit)}</span>
              </span>
              <span className="v2-row-r" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {t(l.trend) === 'up' && (
                  <Icon name="trend_up" className="v2-ic v2-ic-sm"
                        style={{ color: status === 'in_range' ? 'var(--fg-dim)' : color }} />
                )}
                {t(l.trend) === 'down' && (
                  <Icon name="trend_down" className="v2-ic v2-ic-sm" style={{ color: 'var(--fg-dim)' }} />
                )}
                <span style={{ color }}>
                  {t(l.value)}<span className="v2-dim" style={{ marginLeft: 3, fontSize: 10 }}>{t(l.unit)}</span>
                </span>
              </span>
            </div>
          )
        })}
      </div>
      <div className="v2-divider" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--fg-muted)' }}>
        <Icon name="alert" className="v2-ic v2-ic-sm" style={{ color: 'var(--warn)' }} />
        <span>Fasting glucose 102 mg/dL — slight rise (+14 since pre-MK677). Watch.</span>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
        <button type="button" className="v2-btn" onClick={() => open('addLab')}>
          Schedule next panel · Jul 15
        </button>
        <InEntwicklungKnopf titel="Export PDF" className="v2-btn v2-btn-ghost">
          <Icon name="download" className="v2-ic v2-ic-sm" />Export PDF
        </InEntwicklungKnopf>
      </div>
    </Card>
  )
}

// ── Nebenwirkungen ─────────────────────────────────────────────
function SideEffectLog() {
  const entries = [
    { date: 'May 14', compound: 'MK-677', severity: 2, note: 'Increased appetite, mild water retention. Sleep depth +.' },
    { date: 'May 11', compound: 'Anastrozole', severity: 1, note: 'Slight joint dryness — within tolerance.' },
    { date: 'May 7', compound: 'Test Cyp.', severity: 0, note: 'No noted effects.' },
    { date: 'May 3', compound: 'MK-677', severity: 2, note: 'Vivid dreams x3 nights · slight numbness in fingertips.' },
    { date: 'Apr 28', compound: 'BPC-157', severity: 0, note: 'Reduced elbow pain · functional improvement.' },
  ]
  return (
    <div className="v2-col-gap" style={{ gap: 0 }}>
      {entries.map((e, i) => (
        <div key={`${e.date}-${e.compound}`} style={{
          padding: '9px 0',
          borderBottom: i < entries.length - 1 ? '1px solid var(--border)' : 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <span className="v2-num v2-dim" style={{ fontSize: 10, width: 50 }}>{e.date}</span>
            <span style={{ fontSize: 12, fontWeight: 500 }}>{e.compound}</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
              {[0, 1, 2, 3].map(s => (
                <div key={s} style={{
                  width: 14, height: 5, borderRadius: 1,
                  background: s <= e.severity
                    ? (e.severity >= 2 ? 'var(--warn)' : 'var(--pos)')
                    : 'var(--surface-2)',
                }} />
              ))}
            </div>
          </div>
          <div className="v2-muted" style={{ fontSize: 11, lineHeight: 1.4, paddingLeft: 58 }}>{e.note}</div>
        </div>
      ))}
    </div>
  )
}

// ── Halbwertszeit ──────────────────────────────────────────────
function HalfLifeChart() {
  // `[cmd]` Die Kurve der Vorlage: zweimal woechentlich gespritzt,
  // acht Tage Halbwertszeit, Anstieg ueber den ersten Tag. Formel
  // uebernommen — deterministisch, kein Zufall.
  const days = 14
  const points: number[] = []
  const injectionDays = [0, 3, 7, 10]
  for (let d = 0; d <= days * 4; d++) {
    const day = d / 4
    let level = 0
    injectionDays.forEach(inj => {
      const dt = day - inj
      if (dt < 0) return
      const peak = dt < 1 ? dt : 1
      const decay = Math.pow(0.5, Math.max(0, dt - 1) / 8)
      level += peak * decay * 80
    })
    points.push(700 + level)
  }
  return (
    <>
      <LineChart
        h={140}
        series={[{ data: points, color: 'var(--acc-medic)' }]}
        range={[650, 900]}
        xLabels={['Mon', '', 'Wed', '', 'Fri', '', 'Sun', 'Mon', '', 'Wed', '', 'Fri', '', 'Sun']}
      />
      <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11, color: 'var(--fg-muted)', flexWrap: 'wrap' }}>
        <span>Trough <span className="v2-num" style={{ color: 'var(--fg)' }}>~702</span></span>
        <span>Peak <span className="v2-num" style={{ color: 'var(--fg)' }}>~862</span></span>
        <span>Avg <span className="v2-num" style={{ color: 'var(--fg)' }}>~780 ng/dL</span></span>
      </div>
    </>
  )
}

// ── Die Schublade ──────────────────────────────────────────────
function ExtendedDrawer({ compound: c, onClose }: { compound: Compound; onClose: () => void }) {
  const { open } = useSupp()
  React.useEffect(() => {
    const auf = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', auf)
    return () => window.removeEventListener('keydown', auf)
  }, [onClose])

  return (
    <div className="v2-modal-veil" onClick={onClose} role="presentation">
      <div className="v2-modal" style={{ width: 640, maxHeight: '88vh' }}
           role="dialog" aria-modal="true" aria-label={t(c.name)}
           onClick={e => e.stopPropagation()}>
        <div className="v2-modal-h">
          <Icon name="medical" className="v2-ic v2-ic-sm" style={{ color: 'var(--acc-medic)' }} />
          <span className="v2-card-title">{t(c.name)}</span>
          <Pill>{t(c.category)}</Pill>
          <Pill variant="warn">Attrappe</Pill>
          <div className="v2-spacer" />
          <button type="button" className="v2-icon-btn" onClick={onClose} aria-label="Schliessen">
            <Icon name="x" className="v2-ic v2-ic-sm" />
          </button>
        </div>
        <div className="v2-modal-body">
          <div className="v2-muted" style={{ fontSize: 12, lineHeight: 1.5, marginBottom: 12 }}>
            {t(c.protocol)}
          </div>
          <div className="v2-grid v2-g-cols-2" style={{ gap: 10 }}>
            {[
              ['Dose', t(c.dose)],
              ['Schedule', t(c.schedule)],
              ['Half-life', t(c.halfLife)],
              ['Next dose', t(c.nextDose)],
              ['Prescription', t(c.prescription) || '—'],
              ['Cost', `€${z(c.monthlyCost).toFixed(2)}/mo`],
            ].map(([label, wert]) => (
              <div key={label}>
                <div className="v2-eyebrow" style={{ marginBottom: 2 }}>{label}</div>
                <div className="v2-num" style={{ fontSize: 12 }}>{wert}</div>
              </div>
            ))}
          </div>
          {t(c.notes) && (
            <>
              <div className="v2-divider" />
              <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>{t(c.notes)}</div>
            </>
          )}
        </div>
        <div className="v2-modal-f">
          <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Schliessen</button>
          <button type="button" className="v2-btn" onClick={() => { onClose(); open('logDose', c) }}>
            <Icon name="plus" className="v2-ic v2-ic-sm" /> Log dose
          </button>
        </div>
      </div>
    </div>
  )
}
