'use client'

// Die Supplements-Mockup-Reiter als Referenz unter der gebauten
// Ansicht — G-365, E-69.
//
// **Tom, 2026-09-07:** *,,Fuer jeden Reiter jedes Moduls: der
// KOMPLETTE Mockup-Reiter kommt unter die Linie. Eins zu eins, wie er
// im Mockup steht."*
//
// ## Was hier steht und was nicht
//
// `[cmd]` **Die meisten Supplements-Reiter tragen ihren Mockup-Stand
// schon** — `tabs.tsx`, `tab-spec.tsx`, `tab-injektionen.tsx` und
// `tab-compliance.tsx` SIND die portierten Mockup-Reiter und stehen
// unter der Linie, sobald eine echte Ansicht darueber laeuft.
//
// `[cmd]` **Eine Ausnahme: `SuppInteractions` wurde in G-189
// geloescht.** `[read]` **Nach der neuen Regel gehoert der
// Mockup-Reiter wieder sichtbar unter die Linie** — er steht hier,
// eins zu eins aus `module-supplements-spec.jsx:703`.
//
// `[read]` **Keine Anbindung.** Diese Ansicht liest ausschliesslich
// die Entwurfskonstanten aus `spec-daten.ts`.
import * as React from 'react'
import { Card, Pill, Icon, Row } from '@lumeos/ui'

import { ReferenzTrenner } from '../../../components/shell/referenz-trenner'
import { EXTENDED_STACK, EXTENDED_LABS } from './daten'
import {
  INTERACTION_DB, SEVERITY_META, TIMING_LABEL, GAP_ROWS,
} from './spec-daten'

const QUELLE = 'theme-v1/module-supplements-spec.jsx'

/**
 * Der Wechselwirkungs-Reiter, wie er im Mockup steht.
 *
 * `[cmd]` **QUELLE: `module-supplements-spec.jsx:703-780`**
 * (`window.SuppInteractionsView`) — **die aktive Fassung.** Der Rahmen
 * waehlt sie vor `SuppInteractions` aus der Hauptdatei
 * (`module-supplements.jsx:264`).
 */
export function SuppInteractionsReferenz() {
  const ordnung = ['critical', 'warning', 'caution', 'info'] as const
  const reihen = [...INTERACTION_DB].sort(
    (a, b) => ordnung.indexOf(a.severity as typeof ordnung[number])
      - ordnung.indexOf(b.severity as typeof ordnung[number]))
  const zahlen = Object.fromEntries(
    ordnung.map(s => [s, reihen.filter(r => r.severity === s).length]))
  const blockend = reihen.filter(r => r.blocks)

  return (
    <>
      <ReferenzTrenner reiter="Interactions" quelle={QUELLE} />
      <div>
        <div className="v2-grid v2-g-cols-4" style={{ gap: 10, marginBottom: 14 }}>
          {ordnung.map(s => {
            const m = SEVERITY_META[s]
            return (
              <Card key={s} className="v2-card-tight"
                    style={{ padding: 14, borderLeft: `2px solid ${m.c}` }}>
                <div className="v2-eyebrow" style={{ color: m.c }}>{m.label}</div>
                <div className="v2-mono" style={{ fontSize: 22, color: m.c }}>
                  {zahlen[s]}
                </div>
                <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.4, marginTop: 2 }}>
                  {m.action}
                </div>
              </Card>
            )
          })}
        </div>

        {blockend.length > 0 && (
          <div style={{
            padding: 14,
            background: 'color-mix(in oklch, var(--neg) 8%, var(--surface))',
            border: '1px solid color-mix(in oklch, var(--neg) 35%, var(--border))',
            borderRadius: 8, marginBottom: 14,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Icon name="alert" className="v2-ic" style={{ color: 'var(--neg)' }} />
              <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--neg)' }}>
                {blockend.length} intake blocked
              </span>
              <Pill style={{
                borderColor: 'color-mix(in oklch, var(--neg) 40%, var(--border))',
                color: 'var(--neg)',
              }}>blocks_intake = true</Pill>
            </div>
            <div className="v2-muted" style={{ fontSize: 12, lineHeight: 1.55 }}>
              {blockend.map(b => `${b.a} + ${b.b}`).join(' · ')} — logging is
              disabled until resolved or a physician override is recorded.
            </div>
          </div>
        )}

        <Card
          title="Detected interactions"
          sub="rule-based · deterministic · runs on add, activate, and daily generation"
        >
          <div className="v2-col-gap" style={{ gap: 6 }}>
            {reihen.map(r => {
              const m = SEVERITY_META[r.severity as typeof ordnung[number]]
              return (
                <div key={`${r.a}-${r.b}`} style={{
                  padding: 12, borderRadius: 7,
                  background: `color-mix(in oklch, ${m.c} 5%, var(--surface))`,
                  border: `1px solid color-mix(in oklch, ${m.c} 25%, var(--border))`,
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    marginBottom: 5, flexWrap: 'wrap',
                  }}>
                    <Pill style={{
                      borderColor: `color-mix(in oklch, ${m.c} 40%, var(--border))`,
                      color: m.c, fontWeight: 600, fontSize: 9.5,
                    }}>{m.label}</Pill>
                    <span style={{ fontSize: 12.5, fontWeight: 500 }}>{r.a}</span>
                    <span className="v2-dim">+</span>
                    <span style={{ fontSize: 12.5, fontWeight: 500 }}>{r.b}</span>
                    <Pill style={{ marginLeft: 'auto', fontSize: 9.5 }}>
                      {TIMING_LABEL[r.timing as keyof typeof TIMING_LABEL]}
                    </Pill>
                    {r.blocks && (
                      <Pill style={{
                        borderColor: 'color-mix(in oklch, var(--neg) 40%, var(--border))',
                        color: 'var(--neg)', fontSize: 9.5,
                      }}>blocks intake</Pill>
                    )}
                  </div>
                  <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
                    {r.note}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </>
  )
}

// ══ Die Konstanten der Mockup-Reiter ═══════════════════════════════
//
// `[cmd]` **In G-255 aus `spec-daten.ts` geloescht**, weil sie dort
// keinen Aufrufer mehr hatten. `[read]` **Hier stehen sie wieder** —
// als Entwurfsdaten DER REFERENZ, nicht als Produktivdaten.

const STACK_TEMPLATES = [
  { id: 'tpl1', name: 'Muscle Building Starter', goal: 'hypertrophy', items: ['Creatine', 'Vitamin D3', 'Omega-3', 'Magnesium'] },
  { id: 'tpl2', name: 'Daily Health Basics', goal: 'health', items: ['Vitamin D3', 'Omega-3', 'Magnesium', 'K2'] },
  { id: 'tpl3', name: 'Fat Loss Stack', goal: 'fat loss', items: ['Caffeine', 'Creatine', 'Omega-3', 'Vitamin D3'] },
  { id: 'tpl4', name: 'Recovery & Sleep', goal: 'recovery', items: ['Magnesium', 'Omega-3', 'Melatonin', 'Glycine'] },
  { id: 'tpl5', name: 'Longevity', goal: 'longevity', items: ['Vitamin D3', 'K2', 'Omega-3', 'Magnesium', 'CoQ10', 'NAC'] },
]

const USER_STACKS = [
  { id: 's1', name: 'Stack v3.2 · current', source: 'user', items: 10, active: true, since: 'Mar 2026' },
  { id: 's2', name: 'Cut phase stack', source: 'coach', items: 8, active: false, since: 'Jan 2026' },
  { id: 's3', name: 'Travel minimal', source: 'user', items: 4, active: false, since: 'Nov 2025' },
  { id: 's4', name: 'Longevity (template)', source: 'template', items: 6, active: false, since: '—' },
]

const FREQUENCY_OPTIONS = [
  { id: 'daily', label: 'Daily', days: 30 },
  { id: 'weekdays', label: 'Weekdays', days: 22 },
  { id: 'training_days', label: 'Training days', days: 21 },
  { id: 'custom', label: 'Custom', days: 15 },
  { id: 'cycling', label: 'Cycling', days: 20 },
]

// ══ STACKS ═════════════════════════════════════════════════════════
// [cmd] module-supplements-spec.jsx:509-589, eins zu eins.

/** Der Stacks-Reiter, wie er im Mockup steht. */
export function SuppStacksReferenz() {
  return (
    <>
      <ReferenzTrenner reiter="Stacks" quelle={QUELLE} />
      <div className="v2-grid" style={{ gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
        <div className="v2-col-gap" style={{ gap: 14 }}>
          <Card title="My stacks" sub="only one active at a time · DB EXCLUDE constraint">
            <div className="v2-col-gap" style={{ gap: 6 }}>
              {USER_STACKS.map(s => (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: 12, borderRadius: 7,
                  background: s.active
                    ? 'color-mix(in oklch, var(--acc-suppl) 8%, var(--surface))'
                    : 'var(--surface)',
                  border: `1px solid ${s.active
                    ? 'color-mix(in oklch, var(--acc-suppl) 32%, var(--border))'
                    : 'var(--border)'}`,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</span>
                      {s.active && <Pill variant="acc" style={{ fontSize: 9 }}>active</Pill>}
                      <Pill style={{ fontSize: 9 }}>{s.source}</Pill>
                    </div>
                    <div className="v2-dim v2-mono" style={{ fontSize: 10 }}>
                      {s.items} items · since {s.since}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: 10, padding: 10, background: 'var(--surface)',
              borderRadius: 6, fontSize: 11, color: 'var(--fg-muted)', lineHeight: 1.5,
            }}>
              Activating a stack automatically deactivates all others. Intake logs
              generate from the active stack only.
            </div>
          </Card>

          <Card title="System templates" sub="5 curated starting points">
            <div className="v2-col-gap" style={{ gap: 6 }}>
              {STACK_TEMPLATES.map(t => (
                <div key={t.id} style={{
                  padding: 12, background: 'var(--surface)',
                  border: '1px solid var(--border)', borderRadius: 7,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600 }}>{t.name}</span>
                    <Pill style={{ fontSize: 9 }}>{t.goal}</Pill>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {t.items.map(i => <Pill key={i} style={{ fontSize: 9.5 }}>{i}</Pill>)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="v2-col-gap" style={{ gap: 14 }}>
          <Card title="Frequency options" sub="days per month used for cost + compliance">
            {FREQUENCY_OPTIONS.map(f => (
              <Row key={f.id} label={f.label} value={`${f.days} d/mo`} sub={f.id} />
            ))}
          </Card>

          {/* `[cmd]` **G-372: die vierte Kachel hatte kein
              Gegenstueck.** Am Schirm gemessen: oben vier
              angebundene Kacheln, unten drei Referenzen.
              **`module-supplements-spec.jsx:562` fuehrt sie** als
              `Item customization`. */}
          <Card title="Item customization" sub="per stack item"
                attrappe={marke(QUELLE)}>
            <Row label="Custom name" value={'"Morning Magnesium"'} />
            <Row label="Own dose" value="can deviate from rec." />
            <Row label="Own timing" value="any slot" />
            <Row label="Cycling config" value="{on_weeks, off_weeks}" />
            <div className="v2-divider" />
            <div className="v2-dim" style={{ fontSize: 11, lineHeight: 1.5 }}>
              Cycling config drives intake-log generation: during an off
              week no log is created at all.
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

// ══ INTELLIGENCE ═══════════════════════════════════════════════════
// [cmd] module-supplements-spec.jsx:590-702, eins zu eins.

/** Der Auswertungs-Reiter, wie er im Mockup steht. */
export function SuppIntelligenceReferenz() {
  const gaps = GAP_ROWS.map(r => {
    const gesamt = r.nutrition + r.supp
    const pct = Math.round((gesamt / r.rda) * 100)
    return { ...r, gesamt, pct, luecke: pct < 80, doppelt: r.supp > 0 && pct > 150 }
  })
  const luecken = gaps.filter(g => g.luecke)
  const doppelt = gaps.filter(g => g.doppelt)

  return (
    <>
      <ReferenzTrenner reiter="Auswertung" quelle={QUELLE} />
      <div>
        <div className="v2-grid v2-g-cols-4" style={{ gap: 10, marginBottom: 14 }}>
          <Card className="v2-card-tight" style={{ padding: 14 }}>
            <div className="v2-eyebrow">Gaps · below 80% RDA</div>
            <div className="v2-mono" style={{
              fontSize: 22, color: luecken.length ? 'var(--warn)' : 'var(--pos)',
            }}>{luecken.length}</div>
            <div className="v2-dim" style={{ fontSize: 11 }}>of {gaps.length} tracked</div>
          </Card>
          <Card className="v2-card-tight" style={{ padding: 14 }}>
            <div className="v2-eyebrow">Redundancies</div>
            <div className="v2-mono" style={{
              fontSize: 22, color: doppelt.length ? 'var(--warn)' : 'var(--pos)',
            }}>{doppelt.length}</div>
            <div className="v2-dim" style={{ fontSize: 11 }}>multi-source &gt; 150% RDA</div>
          </Card>
        </div>

        <Card title="Gap analysis" sub="food + supplements against the reference">
          <div className="v2-tbl-wrap">
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th>Nutrient</th>
                  <th style={{ textAlign: 'right' }}>Food</th>
                  <th style={{ textAlign: 'right' }}>Supp</th>
                  <th style={{ textAlign: 'right' }}>RDA</th>
                  <th style={{ textAlign: 'right' }}>%</th>
                </tr>
              </thead>
              <tbody>
                {gaps.map(g => (
                  <tr key={g.code}>
                    <td>{g.name}</td>
                    <td className="v2-mono" style={{ textAlign: 'right' }}>{g.nutrition}</td>
                    <td className="v2-mono" style={{ textAlign: 'right' }}>{g.supp}</td>
                    <td className="v2-mono" style={{ textAlign: 'right' }}>{g.rda} {g.unit}</td>
                    <td className="v2-mono" style={{
                      textAlign: 'right',
                      color: g.luecke ? 'var(--warn)'
                        : g.doppelt ? 'var(--neg)' : 'var(--pos)',
                    }}>{g.pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  )
}


// ══ extended und injection ═════════════════════════════════════════
//
// **Tom, 2026-09-07:** *,,Supplements/extended ganzer mockup fehlt,
// Supplements/injektionen hat keine linie und kein mockup."*
//
// `[cmd]` **Gemessen:** `extended` trug unten EINE Kachel („Dein
// Erfahrungsgrad"), `injection` gar keine Linie.
//
//     module-supplements.jsx            SuppExtended        4 Card
//     module-supplements-injection.jsx  InjectionPlannerView 18 Card

// `[read]` Listen ausserhalb des JSX: ein mehrzeiliger `as Array<…>`
// im Rumpf bricht die JSX-Analyse (TS1005).
const NADELN: Array<[string, string, string]> = [
  ['IM · Glute', '18G 1.5\"', '23G 1.5\"'],
  ['IM · Delt', '18G 1.5\"', '25G 1\"'],
  ['SubQ · Bauch', '18G 1.5\"', '29G 0.5\"'],
]

/** E-68: Quelle UND Grund — hier fuer jede Referenzkachel derselbe. */
function marke(quelle: string): string {
  return `Attrappe — ${quelle} · wartet auf: nichts — Referenz zum `
    + 'Vergleich, faellt mit Toms Abnahme'
}

const QUELLE_MAIN = 'theme-v1/module-supplements.jsx'
const QUELLE_INJ = 'theme-v1/module-supplements-injection.jsx'

/** `extended`, wie er im Mockup steht — `SuppExtended`. */
export function SuppExtendedReferenz() {
  return (
    <>
      <ReferenzTrenner reiter="Extended" quelle={QUELLE_MAIN} />
      <div className="v2-grid" style={{ gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        <div className="v2-col-gap" style={{ gap: 14 }}>
          <Card title="Active protocols"
                sub={`${EXTENDED_STACK.length} compounds · physician-supervised`}
                attrappe={marke(QUELLE_MAIN)}>
            <div className="v2-col-gap" style={{ gap: 8 }}>
              {EXTENDED_STACK.map(c => (
                <div key={c.id} style={{
                  padding: 12, background: 'var(--surface)',
                  border: '1px solid var(--border)', borderRadius: 7,
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    marginBottom: 5, flexWrap: 'wrap',
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                    <Pill>{c.category}</Pill>
                    <Pill>{c.cycleType}</Pill>
                    <span className="v2-num v2-dim" style={{ marginLeft: 'auto', fontSize: 10.5 }}>
                      {c.dose}
                    </span>
                  </div>
                  <div className="v2-muted" style={{ fontSize: 11.5, marginBottom: 6 }}>
                    {c.protocol} · {c.schedule}
                  </div>
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 8, fontSize: 10.5,
                  }}>
                    <div>
                      <div className="v2-eyebrow">Halbwertszeit</div>
                      <div className="v2-mono">{c.halfLife}</div>
                    </div>
                    <div>
                      <div className="v2-eyebrow">Naechste Gabe</div>
                      <div className="v2-mono">{c.nextDose}</div>
                    </div>
                    <div>
                      <div className="v2-eyebrow">Labor</div>
                      <div className="v2-mono">{c.nextLab}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Cycle timeline · 16 weeks" sub="Verlauf je Wirkstoff"
                attrappe={marke(QUELLE_MAIN)}>
            <div className="v2-col-gap" style={{ gap: 7 }}>
              {EXTENDED_STACK.map(c => (
                <div key={c.id} style={{
                  display: 'grid', gridTemplateColumns: '150px 1fr',
                  gap: 10, alignItems: 'center', fontSize: 11,
                }}>
                  <span className="v2-dim">{c.name}</span>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {Array.from({ length: 16 }).map((_, w) => {
                      const laeuft = c.cycleType === 'continuous'
                        || (c.cycleWeek != null && w < Number(c.cycleWeek))
                      return (
                        <div key={w} style={{
                          flex: 1, height: 14, borderRadius: 2,
                          background: laeuft ? 'var(--acc-suppl)' : 'var(--surface-2)',
                          opacity: laeuft ? 0.75 : 1,
                        }} />
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Side effect log" sub="last 7 days"
                attrappe={marke(QUELLE_MAIN)}>
            <div className="v2-col-gap" style={{ gap: 5 }}>
              {EXTENDED_STACK.map(c => (
                <div key={c.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', background: 'var(--surface)',
                  border: '1px solid var(--border)', borderRadius: 5,
                  fontSize: 11.5,
                }}>
                  <span style={{ flex: 1 }}>{c.name}</span>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {[0, 1, 2, 3].map(s => (
                      <span key={s} style={{
                        width: 12, height: 12, borderRadius: 3,
                        background: s <= Number(c.sideEffectScore)
                          ? (Number(c.sideEffectScore) >= 2
                            ? 'var(--warn)' : 'var(--acc-recov)')
                          : 'var(--surface-2)',
                      }} />
                    ))}
                  </div>
                  <span className="v2-num v2-dim" style={{ width: 30, textAlign: 'right' }}>
                    {c.sideEffectScore}/3
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="v2-col-gap" style={{ gap: 14 }}>
          <Card title="Bloodwork · linked from Medical"
                sub={`${EXTENDED_LABS.length} Marker`} attrappe={marke(QUELLE_MAIN)}>
            <div style={{ overflowX: 'auto' }}>
              <table className="v2-tbl">
                <thead>
                  <tr>
                    <th>Marker</th>
                    <th style={{ width: 90, textAlign: 'right' }}>Wert</th>
                    <th style={{ width: 90 }}>Stand</th>
                  </tr>
                </thead>
                <tbody>
                  {EXTENDED_LABS.map((l: Record<string, unknown>) => (
                    <tr key={String(l.name ?? l.marker)}>
                      <td>{String(l.name ?? l.marker)}</td>
                      <td className="v2-num" style={{ textAlign: 'right' }}>
                        {String(l.value ?? '—')} {String(l.unit ?? '')}
                      </td>
                      <td>
                        <Pill variant={l.status === 'in_range' ? 'pos' : undefined}>
                          {String(l.status ?? '—')}
                        </Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Visibility · who sees what" sub="permissions per coach"
                attrappe={marke(QUELLE_MAIN)}>
            <Row label="Medical coach (Dr. Kessler)" value="full" />
            <Row label="Nutrition coach (J. Bauer)" value="MK-677 only" />
            <Row label="Training coach (Anders)" value="hidden" />
            <Row label="Buddy (AI)" value="aggregate" />
            <div className="v2-divider" />
            <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.5 }}>
              Der Entwurf bietet darunter „Edit permissions&ldquo; und einen
              Pruefpfad.
            </div>
          </Card>

          <Card title="Half-life · this week" sub="Wirkspiegel je Wirkstoff"
                attrappe={marke(QUELLE_MAIN)}>
            <div className="v2-col-gap" style={{ gap: 8 }}>
              {EXTENDED_STACK.map(c => (
                <div key={c.id}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: 11, marginBottom: 3,
                  }}>
                    <span className="v2-dim">{c.name}</span>
                    <span className="v2-mono">{c.halfLife}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {Array.from({ length: 7 }).map((_, d) => (
                      <div key={d} style={{
                        flex: 1, height: 18, borderRadius: 2,
                        background: 'var(--acc-suppl)',
                        opacity: 0.9 - d * 0.1,
                      }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

/** `injection`, wie er im Mockup steht — `InjectionPlannerView`. */
export function SuppInjectionReferenz() {
  const stellen: Array<[string, string, number, string]> = [
    ['Glute · links', 'IM', 3, '18. Mai'],
    ['Glute · rechts', 'IM', 2, '14. Mai'],
    ['Delt · links', 'IM', 1, '07. Mai'],
    ['Delt · rechts', 'IM', 1, '04. Mai'],
    ['Bauch · links', 'SubQ', 5, '17. Mai'],
    ['Bauch · rechts', 'SubQ', 4, '16. Mai'],
  ]
  const plan: Array<[string, string, string]> = [
    ['Mo 18. Mai', 'Glute · rechts', 'Test-C 150 mg'],
    ['Do 21. Mai', 'Glute · links', 'Test-C 150 mg'],
    ['Mo 25. Mai', 'Delt · rechts', 'Test-C 150 mg'],
  ]
  return (
    <>
      <ReferenzTrenner reiter="Injektionen" quelle={QUELLE_INJ} />
      <div className="v2-grid" style={{ gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
        <div className="v2-col-gap" style={{ gap: 14 }}>
          <Card title="Rotation map" sub="Einstiche je Stelle · letzte 30 Tage"
                attrappe={marke(QUELLE_INJ)}>
            <div style={{ overflowX: 'auto' }}>
              <table className="v2-tbl">
                <thead>
                  <tr>
                    <th>Stelle</th>
                    <th style={{ width: 70 }}>Art</th>
                    <th style={{ width: 90, textAlign: 'right' }}>Einstiche</th>
                    <th style={{ width: 100 }}>zuletzt</th>
                  </tr>
                </thead>
                <tbody>
                  {stellen.map(([s, art, n, wann]) => (
                    <tr key={s}>
                      <td>{s}</td>
                      <td><Pill>{art}</Pill></td>
                      <td className="v2-num" style={{
                        textAlign: 'right',
                        color: n >= 4 ? 'var(--warn)' : 'var(--fg)',
                      }}>{n}</td>
                      <td className="v2-num v2-muted">{wann}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Overuse warnings" sub="Stellen ueber der Schwelle"
                attrappe={marke(QUELLE_INJ)}>
            <div className="v2-col-gap" style={{ gap: 6 }}>
              {stellen.filter(([, , n]) => n >= 4).map(([s, , n]) => (
                <div key={s} style={{
                  display: 'flex', alignItems: 'center', gap: 9, padding: 9,
                  background: 'color-mix(in oklch, var(--warn) 6%, var(--surface))',
                  border: '1px solid color-mix(in oklch, var(--warn) 24%, var(--border))',
                  borderRadius: 5, fontSize: 11.5,
                }}>
                  <span style={{ flex: 1 }}>{s}</span>
                  <span className="v2-num">{n} Einstiche in 30 Tagen</span>
                </div>
              ))}
            </div>
            <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 8, lineHeight: 1.5 }}>
              Schwelle des Entwurfs: ab vier Einstichen je Stelle in
              dreissig Tagen.
            </div>
          </Card>

          <Card title="Rotation plan · next 7 injections" sub="vorgeschlagene Reihenfolge"
                attrappe={marke(QUELLE_INJ)}>
            <div className="v2-col-gap" style={{ gap: 5 }}>
              {plan.map(([wann, wo, was]) => (
                <div key={wann} style={{
                  display: 'grid', gridTemplateColumns: '110px 140px 1fr',
                  gap: 10, alignItems: 'center', fontSize: 11.5,
                  padding: '8px 10px', background: 'var(--surface)',
                  border: '1px solid var(--border)', borderRadius: 5,
                }}>
                  <span className="v2-num v2-dim">{wann}</span>
                  <span>{wo}</span>
                  <span className="v2-mono v2-dim" style={{ fontSize: 10.5 }}>{was}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="v2-col-gap" style={{ gap: 14 }}>
          <Card title="Volume limits" sub="Hoechstmenge je Stelle"
                attrappe={marke(QUELLE_INJ)}>
            <Row label="Glute (IM)" value="bis 3.0 ml" />
            <Row label="Delt (IM)" value="bis 1.0 ml" />
            <Row label="Quad (IM)" value="bis 2.0 ml" />
            <Row label="Bauch (SubQ)" value="bis 1.0 ml" />
          </Card>

          <Card title="Weekly load" sub="Menge je Woche" attrappe={marke(QUELLE_INJ)}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 56 }}>
              {[2.0, 2.0, 1.5, 2.0, 2.0, 1.0, 2.0, 2.0].map((v, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{
                    height: `${(v / 2.5) * 44}px`,
                    background: 'var(--acc-suppl)', borderRadius: 2,
                  }} />
                  <div className="v2-num v2-dim" style={{ fontSize: 8, marginTop: 3 }}>
                    {v}
                  </div>
                </div>
              ))}
            </div>
            <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 6 }}>
              ml je Woche · acht Wochen
            </div>
          </Card>

          <Card title="Needle reference" sub="Groesse je Anwendung"
                attrappe={marke(QUELLE_INJ)}>
            <div style={{ overflowX: 'auto' }}>
              <table className="v2-tbl">
                <thead>
                  <tr>
                    <th>Anwendung</th>
                    <th style={{ width: 90 }}>Aufziehen</th>
                    <th style={{ width: 90 }}>Spritzen</th>
                  </tr>
                </thead>
                <tbody>
                  {NADELN.map(([a, b, c]) => (
                    <tr key={a}>
                      <td>{a}</td>
                      <td className="v2-mono v2-dim">{b}</td>
                      <td className="v2-mono">{c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
