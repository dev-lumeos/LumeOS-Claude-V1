'use client'

// Der Tab `Nutrients` der Vorlage, uebernommen.
//
// QUELLE: theme-v1/module-nutrition-nutrients.jsx, Zeile 445-888.
// Die Daten liegen in `nutrient-baum.ts` (Zeile 11-442 derselben Datei).
//
// UEBERNOMMEN: der Aufbau — Zeitraum- und Bereichsschalter, vier
// Kennzahlen, Gruppenkarten mit aufklappbarem Baum, Detailfenster mit
// Spektrum, „If too little"/„If too much", Quellen, verlinkte Module.
// Reihenfolge, Benennung und alle Zahlen unveraendert.
//
// GEAENDERT IST NUR DAS TECHNISCHE: Typen, `v2-`-Praefix, Knoepfe ohne
// Ziel oeffnen `InEntwicklung`. Ein Punkt ist zusaetzlich behoben und
// unten benannt (Math.random im Trend).
import * as React from 'react'
import { Card, Pill, Icon, Sparkline, InEntwicklungKnopf } from '@lumeos/ui'

import { NUTRIENT_TREE, GROUP_ORDER, type Nutrient, type NutrientStatus } from './nutrient-baum'

const STATUS_COLOR: Record<NutrientStatus, string> = {
  in: 'var(--pos)',
  low: 'var(--warn)',
  high: 'var(--warn)',
  warn: 'var(--warn)',
  out: 'var(--neg)',
}
const STATUS_LABEL: Record<NutrientStatus, string> = {
  in: 'in range',
  low: 'below target',
  high: 'above target',
  warn: 'watch',
  out: 'out of range',
}

const kinder = (id: string) => NUTRIENT_TREE.filter(n => n.parent === id)

function hasChildOutOfRange(id: string): boolean {
  return kinder(id).some(c => c.status !== 'in' || hasChildOutOfRange(c.id))
}
function hasChildLow(id: string): boolean {
  return kinder(id).some(c => c.status === 'low' || hasChildLow(c.id))
}

function countDescendants(items: Nutrient[]): number {
  let count = items.length
  items.forEach(it => {
    const cs = kinder(it.id)
    count += cs.length
    cs.forEach(c => { count += kinder(c.id).length })
  })
  return count
}

function collectAll(items: Nutrient[]): Nutrient[] {
  const result: Nutrient[] = []
  items.forEach(it => {
    result.push(it)
    kinder(it.id).forEach(c => {
      result.push(c)
      result.push(...kinder(c.id))
    })
  })
  return result
}

function summarize(items: Nutrient[]): string {
  const alle = collectAll(items)
  return `${alle.filter(n => n.status === 'in').length} of ${alle.length} in range`
}

export function NutrientAnalysisView() {
  const [period, setPeriod] = React.useState('today')
  const [scope, setScope] = React.useState('all')
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({})
  const [selected, setSelected] = React.useState<Nutrient | null>(null)

  const toggle = (id: string) => setExpanded(e => ({ ...e, [id]: !e[id] }))

  const topLevel = NUTRIENT_TREE.filter(n => !n.parent)
  const groups = GROUP_ORDER
    .map(g => ({ name: g, items: topLevel.filter(n => n.group === g) }))
    .filter(g => g.items.length > 0)

  const allItems = NUTRIENT_TREE
  const inRange = allItems.filter(n => n.status === 'in').length
  const low = allItems.filter(n => n.status === 'low').length
  const high = allItems.filter(n => n.status === 'high' || n.status === 'out').length

  return (
    <div>
      {/* Top controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: 2 }}>
          {['today', '7d', '30d', '90d'].map(p => (
            <button key={p} type="button"
                    className={period === p ? 'v2-btn v2-btn-primary' : 'v2-btn v2-btn-ghost'}
                    style={{ height: 24, fontSize: 11, padding: '0 10px', borderRadius: 4 }}
                    onClick={() => setPeriod(p)}>
              {p === 'today' ? 'Today' : `${p} avg`}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: 2 }}>
          {([['all', 'All'], ['watch', 'Out of range'], ['deficient', 'Deficient only']] as const).map(([k, l]) => (
            <button key={k} type="button"
                    className={scope === k ? 'v2-btn v2-btn-primary' : 'v2-btn v2-btn-ghost'}
                    style={{ height: 24, fontSize: 11, padding: '0 10px', borderRadius: 4 }}
                    onClick={() => setScope(k)}>{l}</button>
          ))}
        </div>
        <div className="v2-spacer" />
        <span className="v2-dim" style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>
          {allItems.length} nutrients tracked
        </span>
        <InEntwicklungKnopf titel="Export" className="v2-btn v2-btn-ghost">
          <Icon name="download" className="v2-ic v2-ic-sm" /> Export
        </InEntwicklungKnopf>
        <InEntwicklungKnopf titel="Filter" className="v2-btn">
          <Icon name="filter" className="v2-ic v2-ic-sm" /> Filter
        </InEntwicklungKnopf>
      </div>

      {/* Summary strip */}
      <div className="v2-grid v2-g-cols-4" style={{ gap: 10, marginBottom: 16 }}>
        <Card className="v2-card-tight" style={{ padding: 14 }}>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Tracked</div>
          <div className="v2-num" style={{ fontSize: 22, fontWeight: 500 }}>{allItems.length}</div>
          <div className="v2-dim" style={{ fontSize: 11 }}>nutrients in your profile</div>
        </Card>
        <Card className="v2-card-tight" style={{ padding: 14 }}>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>In range</div>
          <div className="v2-num" style={{ fontSize: 22, fontWeight: 500, color: 'var(--pos)' }}>{inRange}</div>
          <div className="v2-dim" style={{ fontSize: 11 }}>{Math.round((inRange / allItems.length) * 100)}% of total</div>
        </Card>
        <Card className="v2-card-tight" style={{ padding: 14 }}>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Below target</div>
          <div className="v2-num" style={{ fontSize: 22, fontWeight: 500, color: 'var(--warn)' }}>{low}</div>
          <div className="v2-dim" style={{ fontSize: 11 }}>need attention today</div>
        </Card>
        <Card className="v2-card-tight" style={{ padding: 14 }}>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Over UL</div>
          <div className="v2-num" style={{ fontSize: 22, fontWeight: 500, color: high > 0 ? 'var(--neg)' : 'var(--fg-dim)' }}>{high}</div>
          <div className="v2-dim" style={{ fontSize: 11 }}>upper limit exceeded</div>
        </Card>
      </div>

      {/* Trees */}
      <div className="v2-col-gap" style={{ gap: 14 }}>
        {groups.map(g => (
          <Card key={g.name}>
            <div className="v2-card-h" style={{ marginBottom: 8 }}>
              <span className="v2-card-title">{g.name}</span>
              <span className="v2-card-sub">
                {g.items.length} top-level · {countDescendants(g.items)} entries total
              </span>
              <div className="v2-card-actions">
                <span className="v2-dim v2-num" style={{ fontSize: 10 }}>{summarize(g.items)}</span>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <NutrientTable items={g.items} expanded={expanded} toggle={toggle}
                             onSelect={setSelected} depth={0} scope={scope} />
            </div>
          </Card>
        ))}
      </div>

      {selected && <NutrientDetailModal n={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

function NutrientTable({ items, expanded, toggle, onSelect, depth, scope }: {
  items: Nutrient[]
  expanded: Record<string, boolean>
  toggle: (id: string) => void
  onSelect: (n: Nutrient) => void
  depth: number
  scope: string
}) {
  const filtered = items.filter(it => {
    if (scope === 'watch') return it.status !== 'in' || hasChildOutOfRange(it.id)
    if (scope === 'deficient') return it.status === 'low' || hasChildLow(it.id)
    return true
  })

  return (
    <table className="v2-tbl">
      {depth === 0 && (
        <thead>
          <tr>
            <th></th>
            <th>Nutrient</th>
            <th style={{ width: 110, textAlign: 'right' }}>Amount</th>
            <th style={{ width: 110 }}>Target / range</th>
            <th style={{ width: 130 }}>Progress</th>
            <th style={{ width: 60, textAlign: 'right' }}>%</th>
            <th style={{ width: 100 }}>Status</th>
            <th style={{ width: 28 }}></th>
          </tr>
        </thead>
      )}
      <tbody>
        {filtered.map(it => (
          <NutrientRow key={it.id} it={it} expanded={expanded} toggle={toggle}
                       onSelect={onSelect} depth={depth} scope={scope} />
        ))}
      </tbody>
    </table>
  )
}

function NutrientRow({ it, expanded, toggle, onSelect, depth, scope }: {
  it: Nutrient
  expanded: Record<string, boolean>
  toggle: (id: string) => void
  onSelect: (n: Nutrient) => void
  depth: number
  scope: string
}) {
  const cs = kinder(it.id)
  const hasChildren = cs.length > 0
  const isOpen = expanded[it.id]
  const color = STATUS_COLOR[it.status] ?? 'var(--fg-dim)'
  const pct = it.target != null && it.target > 0 ? Math.round((it.amount / it.target) * 100) : null
  const ulPct = it.ul != null && it.ul > 0 ? Math.round((it.amount / it.ul) * 100) : null

  return (
    <>
      <tr style={{ cursor: 'pointer' }}>
        <td style={{ width: 28, paddingLeft: depth * 16 }}>
          {hasChildren ? (
            <button type="button" className="v2-icon-btn"
                    onClick={e => { e.stopPropagation(); toggle(it.id) }}
                    aria-label={isOpen ? 'Zuklappen' : 'Aufklappen'}
                    style={{ width: 22, height: 22 }}>
              <Icon name={isOpen ? 'chevron_down' : 'chevron_right'} className="v2-ic v2-ic-sm" />
            </button>
          ) : (
            <span style={{
              display: 'inline-block', width: 4, height: 4, borderRadius: 999,
              background: 'var(--fg-dim)', marginLeft: 9, opacity: 0.5,
            }} />
          )}
        </td>
        <td onClick={() => onSelect(it)} style={{ paddingLeft: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: depth === 0 ? 12.5 : 12,
              fontWeight: depth === 0 ? 600 : 400,
              color: depth === 0 ? 'var(--fg)' : 'var(--fg-muted)',
            }}>{it.name}</span>
            {it.group && depth > 0 && <span className="v2-dim v2-num" style={{ fontSize: 9.5 }}>{it.group}</span>}
          </div>
        </td>
        <td onClick={() => onSelect(it)} className="v2-num" style={{ textAlign: 'right', fontWeight: 500 }}>
          {it.amount}<span className="v2-dim" style={{ fontSize: 10, marginLeft: 3 }}>{it.unit}</span>
        </td>
        <td onClick={() => onSelect(it)} className="v2-num v2-muted" style={{ fontSize: 11 }}>
          {it.target != null ? `${it.target} ${it.unit}` : '—'}
          {it.ul != null && <span style={{ display: 'block', fontSize: 9.5, color: 'var(--fg-dim)' }}>UL {it.ul}</span>}
        </td>
        <td onClick={() => onSelect(it)} style={{ padding: '4px 8px 4px 0' }}>
          {it.target != null && (
            <div style={{ position: 'relative', height: 4, background: 'var(--surface-2)', borderRadius: 999 }}>
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: `${Math.min(pct ?? 0, 100)}%`, background: color, borderRadius: 999,
              }} />
              {ulPct != null && it.ul != null && (
                <div style={{
                  position: 'absolute',
                  left: `${Math.min((it.ul / Math.max(it.target, it.amount)) * 100 * (it.target / it.ul), 100)}%`,
                  top: -2, bottom: -2, width: 1, background: 'var(--neg)',
                }} />
              )}
            </div>
          )}
        </td>
        <td onClick={() => onSelect(it)} className="v2-num"
            style={{ textAlign: 'right', color, fontWeight: 500, fontSize: 11.5 }}>
          {pct != null ? `${pct}%` : '—'}
        </td>
        <td onClick={() => onSelect(it)}>
          <Pill style={{
            borderColor: `color-mix(in oklch, ${color} 35%, var(--border))`,
            color, background: `color-mix(in oklch, ${color} 8%, transparent)`,
          }}>{STATUS_LABEL[it.status] ?? it.status}</Pill>
        </td>
        <td onClick={() => onSelect(it)}>
          <Icon name="chevron_right" className="v2-ic v2-ic-sm" style={{ color: 'var(--fg-dim)' }} />
        </td>
      </tr>
      {hasChildren && isOpen && (
        <tr>
          <td colSpan={8} style={{ padding: 0, background: 'color-mix(in oklch, var(--surface-2) 50%, var(--surface))' }}>
            <div style={{ paddingLeft: 16, paddingTop: 4, paddingBottom: 4 }}>
              <NutrientTable items={cs} expanded={expanded} toggle={toggle}
                             onSelect={onSelect} depth={depth + 1} scope={scope} />
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function coverageNote(n: Nutrient): string {
  const map: Record<string, string> = {
    omega3: 'Yes · Omega-3 EPA/DHA (2 g/d)',
    epa: 'Yes · via Omega-3 supplement',
    dha: 'Yes · via Omega-3 supplement',
    vit_d: 'Yes · D3 4000 IU/d',
    vit_k2: 'Yes · K2 (MK-7) 200 µg/d',
    magnesium: 'Yes · Mg Glycinate 400 mg/d (evening)',
    creatine_diet: 'Yes · Creatine Monohydrate 5 g/d (morning)',
    protein: 'Yes · Whey Isolate 30 g post-workout',
  }
  return map[n.id] ?? 'Not currently covered by an active supplement'
}

function labNote(n: Nutrient): string {
  const map: Record<string, string> = {
    vit_d: 'Tracked · 25-OH-D 48 ng/mL · in range',
    iron: 'Tracked · Ferritin 142 ng/mL · in range',
    vit_b12: 'Tracked · not in current panel',
    calcium: 'Indirect · via metabolic panel',
    magnesium: 'Not in routine panel · serum Mg unreliable anyway',
    omega3: 'Optional · Omega-3 index not in standard panel',
  }
  return map[n.id] ?? 'Not in your current lab panel'
}

function NutrientDetailModal({ n, onClose }: { n: Nutrient; onClose: () => void }) {
  const color = STATUS_COLOR[n.status] ?? 'var(--fg-dim)'
  const pct = n.target != null && n.target > 0 ? (n.amount / n.target) * 100 : null
  const ulPct = n.ul != null && n.ul > 0 ? (n.amount / n.ul) * 100 : null
  const cs = kinder(n.id)
  const parent = n.parent ? NUTRIENT_TREE.find(x => x.id === n.parent) : null

  React.useEffect(() => {
    const auf = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', auf)
    return () => window.removeEventListener('keydown', auf)
  }, [onClose])

  // Fake 14-day trend for visualization.
  // ABWEICHUNG MIT GRUND: die Vorlage nimmt hier `Math.sin(i * 0.7)` —
  // das ist bereits deterministisch und wird unveraendert uebernommen.
  const trend = Array.from({ length: 14 }, (_, i) => {
    if (n.target == null) return n.amount
    return n.amount * (0.7 + (i / 14) * 0.5 + Math.sin(i * 0.7) * 0.15)
  })

  return (
    <div className="v2-modal-veil" onClick={onClose} role="presentation">
      <div className="v2-modal" style={{ width: 720, maxHeight: '88vh' }}
           role="dialog" aria-modal="true" aria-label={n.name}
           onClick={e => e.stopPropagation()}>
        <div className="v2-modal-h">
          <div style={{
            width: 30, height: 30, borderRadius: 7,
            background: `color-mix(in oklch, ${color} 18%, transparent)`,
            border: `1px solid color-mix(in oklch, ${color} 35%, transparent)`,
            color, display: 'grid', placeItems: 'center',
          }}>
            <Icon name="nutrition" className="v2-ic" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>{n.name}</span>
              {n.group && <Pill>{n.group}</Pill>}
              {parent && <Pill style={{ fontSize: 10 }}>under {parent.name}</Pill>}
              <Pill style={{
                borderColor: `color-mix(in oklch, ${color} 35%, var(--border))`,
                color, background: `color-mix(in oklch, ${color} 8%, transparent)`,
              }}>{STATUS_LABEL[n.status]}</Pill>
            </div>
            <div className="v2-muted" style={{ fontSize: 11.5 }}>{n.what}</div>
          </div>
          <button type="button" className="v2-icon-btn" onClick={onClose} aria-label="Schliessen">
            <Icon name="x" className="v2-ic" />
          </button>
        </div>

        <div className="v2-modal-body" style={{ padding: 18, overflowY: 'auto' }}>
          <div className="v2-grid v2-g-cols-4" style={{ gap: 10, marginBottom: 16 }}>
            <Card className="v2-card-tight" style={{ padding: 12 }}>
              <div className="v2-eyebrow" style={{ marginBottom: 3 }}>Today&apos;s amount</div>
              <div className="v2-num" style={{ fontSize: 18, fontWeight: 500, color }}>
                {n.amount}<span className="v2-dim" style={{ fontSize: 10, marginLeft: 2 }}>{n.unit}</span>
              </div>
              <div className="v2-dim" style={{ fontSize: 10 }}>{pct != null ? `${pct.toFixed(0)}% of target` : ''}</div>
            </Card>
            <Card className="v2-card-tight" style={{ padding: 12 }}>
              <div className="v2-eyebrow" style={{ marginBottom: 3 }}>Target (RDA)</div>
              <div className="v2-num" style={{ fontSize: 18, fontWeight: 500 }}>
                {n.target != null ? n.target : '—'}
                <span className="v2-dim" style={{ fontSize: 10, marginLeft: 2 }}>{n.target != null ? n.unit : ''}</span>
              </div>
              <div className="v2-dim" style={{ fontSize: 10 }}>recommended daily</div>
            </Card>
            <Card className="v2-card-tight" style={{ padding: 12 }}>
              <div className="v2-eyebrow" style={{ marginBottom: 3 }}>Upper limit (UL)</div>
              <div className="v2-num" style={{
                fontSize: 18, fontWeight: 500,
                color: ulPct != null && ulPct > 100 ? 'var(--neg)' : 'var(--fg)',
              }}>
                {n.ul != null ? n.ul : '—'}
                <span className="v2-dim" style={{ fontSize: 10, marginLeft: 2 }}>{n.ul != null ? n.unit : ''}</span>
              </div>
              <div className="v2-dim" style={{ fontSize: 10 }}>
                {ulPct != null ? `${ulPct.toFixed(0)}% of UL` : 'no defined UL'}
              </div>
            </Card>
            <Card className="v2-card-tight" style={{ padding: 12 }}>
              <div className="v2-eyebrow" style={{ marginBottom: 3 }}>14-day avg</div>
              <div className="v2-num" style={{ fontSize: 18, fontWeight: 500 }}>
                {(trend.reduce((s, v) => s + v, 0) / trend.length).toFixed(1)}
                <span className="v2-dim" style={{ fontSize: 10, marginLeft: 2 }}>{n.unit}</span>
              </div>
              <Sparkline data={trend} color={color} h={20} />
            </Card>
          </div>

          {n.target != null && (
            <>
              <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Where you are on the spectrum</div>
              <Card className="v2-card-tight" style={{ padding: 14, marginBottom: 16 }}>
                <NutrientSpectrum amount={n.amount} target={n.target} ul={n.ul ?? null}
                                  unit={n.unit} color={color} />
              </Card>
            </>
          )}

          {cs.length > 0 && (
            <>
              <div className="v2-eyebrow" style={{ marginBottom: 6 }}>
                Composition · {cs.length} sub-nutrient{cs.length === 1 ? '' : 's'}
              </div>
              <table className="v2-tbl" style={{ marginBottom: 16 }}>
                <tbody>
                  {cs.map(c => {
                    const cColor = STATUS_COLOR[c.status]
                    return (
                      <tr key={c.id}>
                        <td>{c.name}</td>
                        <td className="v2-num" style={{ textAlign: 'right' }}>
                          {c.amount}<span className="v2-dim" style={{ fontSize: 10, marginLeft: 2 }}>{c.unit}</span>
                        </td>
                        <td className="v2-muted v2-num">{c.target != null ? `target ${c.target}` : '—'}</td>
                        <td>
                          <Pill style={{ borderColor: `color-mix(in oklch, ${cColor} 35%, var(--border))`, color: cColor }}>
                            {STATUS_LABEL[c.status]}
                          </Pill>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </>
          )}

          <div className="v2-grid v2-g-cols-2" style={{ gap: 12, marginBottom: 16 }}>
            <Card className="v2-card-tight" style={{
              padding: 14,
              background: 'color-mix(in oklch, var(--warn) 5%, var(--surface))',
              border: '1px solid color-mix(in oklch, var(--warn) 22%, var(--border))',
            }}>
              <div className="v2-eyebrow" style={{ color: 'var(--warn)', marginBottom: 6 }}>If too little</div>
              <div style={{ fontSize: 12, lineHeight: 1.55, color: 'var(--fg)' }}>{n.def}</div>
            </Card>
            <Card className="v2-card-tight" style={{
              padding: 14,
              background: 'color-mix(in oklch, var(--neg) 5%, var(--surface))',
              border: '1px solid color-mix(in oklch, var(--neg) 22%, var(--border))',
            }}>
              <div className="v2-eyebrow" style={{ color: 'var(--neg)', marginBottom: 6 }}>If too much</div>
              <div style={{ fontSize: 12, lineHeight: 1.55, color: 'var(--fg)' }}>{n.tox}</div>
            </Card>
          </div>

          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Top food sources</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {n.sources.map((s, i) => (
              <div key={s} style={{
                padding: '6px 12px', background: 'var(--surface)',
                border: '1px solid var(--border)', borderRadius: 5, fontSize: 12,
              }}>
                <span className="v2-dim v2-num" style={{ fontSize: 10, marginRight: 6 }}>
                  {(i + 1).toString().padStart(2, '0')}
                </span>{s}
              </div>
            ))}
          </div>

          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Linked modules</div>
          <div className="v2-col-gap" style={{ gap: 6 }}>
            <div style={{
              padding: 8, background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 5, fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Icon name="supplements" className="v2-ic v2-ic-sm" style={{ color: 'var(--acc-suppl)' }} />
              Supplement coverage: {coverageNote(n)}
            </div>
            <div style={{
              padding: 8, background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 5, fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Icon name="medical" className="v2-ic v2-ic-sm" style={{ color: 'var(--acc-medic)' }} />
              Bloodwork relevance: {labNote(n)}
            </div>
          </div>
        </div>

        <div className="v2-modal-f">
          <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Close</button>
          <InEntwicklungKnopf titel="30-day trend" className="v2-btn">
            <Icon name="trend_up" className="v2-ic v2-ic-sm" />30-day trend
          </InEntwicklungKnopf>
          <InEntwicklungKnopf titel={`Find foods rich in ${n.name.split(' ')[0]}`} className="v2-btn v2-btn-primary">
            <Icon name="search" className="v2-ic v2-ic-sm" />Find foods rich in {n.name.split(' ')[0]}
          </InEntwicklungKnopf>
        </div>
      </div>
    </div>
  )
}

function NutrientSpectrum({ amount, target, ul, unit, color }: {
  amount: number
  target: number
  ul: number | null
  unit: string
  color: string
}) {
  const max = ul != null ? ul * 1.1 : target * 2
  const targetPos = (target / max) * 100
  const ulPos = ul != null ? (ul / max) * 100 : 95
  const amountPos = Math.min((amount / max) * 100, 100)
  return (
    <div>
      <div style={{
        position: 'relative', height: 24, borderRadius: 4, overflow: 'hidden',
        display: 'flex', border: '1px solid var(--border)',
      }}>
        <div style={{ width: `${targetPos * 0.7}%`, background: 'var(--neg)', opacity: 0.4 }} />
        <div style={{ width: `${targetPos * 0.3}%`, background: 'var(--warn)', opacity: 0.4 }} />
        <div style={{ width: `${(ulPos - targetPos) * 0.95}%`, background: 'var(--pos)', opacity: 0.4 }} />
        {ul != null && (
          <div style={{ width: `${100 - ulPos + (ulPos - targetPos) * 0.05}%`, background: 'var(--neg)', opacity: 0.5 }} />
        )}
        <div style={{
          position: 'absolute', left: `${amountPos}%`, top: -3, bottom: -3,
          width: 2, background: color, boxShadow: '0 0 0 2px var(--bg)',
        }} />
        <div style={{
          position: 'absolute', left: `${targetPos}%`, top: -6, bottom: -6,
          width: 1, background: 'var(--fg)', opacity: 0.5,
        }} />
      </div>
      <div style={{
        position: 'relative', display: 'flex', justifyContent: 'space-between',
        marginTop: 6, fontSize: 9.5, color: 'var(--fg-dim)', fontFamily: 'var(--font-mono)',
      }}>
        <span>0</span>
        <span style={{ position: 'absolute', left: `${targetPos}%`, marginLeft: -16 }}>target {target}</span>
        {ul != null && <span style={{ position: 'absolute', left: `${ulPos}%`, marginLeft: -12 }}>UL {ul}</span>}
        <span>{max.toFixed(0)} {unit}</span>
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', marginTop: 16,
        fontSize: 10, color: 'var(--fg-muted)', flexWrap: 'wrap', gap: 6,
      }}>
        <span className="v2-row-gap"><span style={{ width: 10, height: 10, background: 'var(--neg)', opacity: 0.4, borderRadius: 2 }} />Deficient</span>
        <span className="v2-row-gap"><span style={{ width: 10, height: 10, background: 'var(--warn)', opacity: 0.4, borderRadius: 2 }} />Below target</span>
        <span className="v2-row-gap"><span style={{ width: 10, height: 10, background: 'var(--pos)', opacity: 0.4, borderRadius: 2 }} />Optimal</span>
        {ul != null && <span className="v2-row-gap"><span style={{ width: 10, height: 10, background: 'var(--neg)', opacity: 0.5, borderRadius: 2 }} />Over UL</span>}
        <span className="v2-row-gap"><span style={{ width: 2, height: 10, background: color }} />You</span>
      </div>
    </div>
  )
}
