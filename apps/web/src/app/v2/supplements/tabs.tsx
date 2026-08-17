'use client'

// Die sieben Tabs, die der Rahmen der Vorlage selbst traegt.
//
// QUELLE: theme-v1/module-supplements.jsx — `SuppToday` (292),
// `SlotCard` (401), `CheckCircle` (468), `SuppStack` (489),
// `StackMatrix` (516), `StackList` (578), `SuppExtended`,
// `SuppDatabase` (640), `SuppCompliance` (710), `SuppInteractions`,
// `SuppCost`.
//
// UEBERNOMMEN: Aufbau, Reihenfolge, Beschriftung und **alle Zahlen**.
// `[read]` Es gibt kein `supplements`-Schema; nichts hier ist
// angebunden, und die erfundenen Werte bleiben stehen — dieselbe Regel
// wie beim Dashboard und beim Training.
//
// GEAENDERT IST NUR DAS TECHNISCHE: Typen, `v2-`-Praefix, Knoepfe ohne
// Ziel oeffnen ein Modal. Zwei Befunde der Vorlage stehen unten bei
// ihren Stellen.
import * as React from 'react'
import { Card, Pill, Icon, Meter, Ring, InEntwicklungKnopf } from '@lumeos/ui'

import {
  STACK, SLOTS, DAY_LETTERS, EVIDENCE_PALETTE, SUPPLEMENT_DB,
  INTERACTIONS, EXTENDED_STACK, EXTENDED_LABS, type StackItem,
} from './daten'
import { useSupp } from './kontext'

/** `[cmd]` Feste Vorfuehrwerte der Vorlage (Zeile 190/191) — Sa, 13:30.
    Kein `new Date()`: die Vorlage will ein reproduzierbares Bild, und
    ein Modul ohne Datenquelle haette von der echten Uhr nichts. */
const TODAY_DOW = 5
const NOW_HOUR = 13.5

const ATTRAPPE = 'Aus dem Entwurf uebernommen. Es gibt kein `supplements`-Schema — die Zahlen sind erfunden.'

// ── CheckCircle ────────────────────────────────────────────────
type Status = 'taken' | 'due' | 'planned' | 'skip'

function CheckCircle({ status }: { status: Status }) {
  const palette: Record<Status, { bg: string; stroke: string; ic: boolean }> = {
    taken: { bg: 'var(--pos)', stroke: 'var(--pos)', ic: true },
    due: { bg: 'transparent', stroke: 'var(--acc-suppl)', ic: false },
    planned: { bg: 'transparent', stroke: 'var(--fg-dim)', ic: false },
    skip: { bg: 'transparent', stroke: 'var(--fg-dim)', ic: false },
  }
  const p = palette[status] ?? palette.planned
  return (
    <div style={{
      width: 18, height: 18, borderRadius: 999,
      background: p.bg, border: `1.5px solid ${p.stroke}`,
      display: 'grid', placeItems: 'center', flexShrink: 0,
    }}>
      {p.ic && <Icon name="check" className="v2-ic"
                    style={{ width: 10, height: 10, color: 'var(--bg)', strokeWidth: 3 }} />}
    </div>
  )
}

// ── TODAY ──────────────────────────────────────────────────────
export function SuppToday() {
  const { takenToday, toggleTaken, open } = useSupp()
  const dueToday = STACK.filter(s => s.days[TODAY_DOW]).length
  const takenCount = STACK.filter(s => s.days[TODAY_DOW] && takenToday[s.id]).length
  const nextItem = STACK.find(s => s.slot === 'pre_workout' && s.days[TODAY_DOW])
  const nachfuellen = STACK.filter(s => s.servingsLeft / s.servingsTotal < 0.4)

  return (
    <div className="v2-grid-15">
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card attrappe={ATTRAPPE}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Ring value={takenCount} max={dueToday} color="var(--acc-suppl)" label="taken" size={88} stroke={7} />
            <div style={{ flex: 1, minWidth: 180 }}>
              <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Today&apos;s adherence</div>
              <div className="v2-num" style={{ fontSize: 26, lineHeight: 1, marginBottom: 4 }}>
                {takenCount}<span className="v2-dim" style={{ fontSize: 13 }}> / {dueToday}</span>
              </div>
              <div className="v2-muted" style={{ fontSize: 11.5 }}>
                Next: <span style={{ color: 'var(--fg)', fontWeight: 500 }}>{nextItem?.name}</span>{' '}
                in <span className="v2-num">4h 02m</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
              <span className="v2-eyebrow">Streak</span>
              <span className="v2-num" style={{ fontSize: 18 }}>23<span className="v2-dim" style={{ fontSize: 11 }}> days</span></span>
            </div>
          </div>
        </Card>

        {SLOTS.map(slot => {
          const items = STACK.filter(s => s.slot === slot.id)
          if (items.length === 0) return null
          return (
            <SlotCard key={slot.id} slot={slot} items={items}
                      takenToday={takenToday} toggleTaken={toggleTaken}
                      onSkip={item => open('skip', item)} />
          )
        })}
      </div>

      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card
          title="Next dose"
          sub={nextItem?.brand}
          attrappe={ATTRAPPE}
          actions={
            <InEntwicklungKnopf titel="Skip" className="v2-btn v2-btn-ghost v2-btn-sm">
              Skip <Icon name="chevron_down" className="v2-ic v2-ic-sm" />
            </InEntwicklungKnopf>
          }
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
            <span className="v2-num" style={{ fontSize: 28, fontWeight: 500 }}>4:02</span>
            <span className="v2-dim" style={{ fontSize: 12 }}>until 17:30 · pre-workout</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{nextItem?.name}</div>
          <div className="v2-muted v2-num" style={{ fontSize: 11 }}>{nextItem?.dose}</div>
          <div className="v2-divider" />
          <div className="v2-eyebrow" style={{ marginBottom: 8 }}>Stacks with</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Pill>Caffeine · 200mg</Pill>
            <Pill>Pre-workout meal</Pill>
          </div>
        </Card>

        <Card
          title="Refills"
          sub="next 14 days"
          attrappe={ATTRAPPE}
          actions={
            <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                    onClick={() => open('reorder', nachfuellen)}>
              Order all <Icon name="arrow_right" className="v2-ic v2-ic-sm" />
            </button>
          }
        >
          <div className="v2-col-gap" style={{ gap: 0 }}>
            {nachfuellen.slice().sort((a, b) => a.servingsLeft - b.servingsLeft).map((s, i, arr) => (
              <div key={s.id} style={{
                padding: '10px 0',
                borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span className="v2-dot" style={{ background: s.refillUrgent ? 'var(--neg)' : 'var(--warn)' }} />
                  <span style={{ fontSize: 12, fontWeight: 500, flex: 1 }}>{s.name}</span>
                  <span className="v2-num" style={{ fontSize: 11, color: s.refillUrgent ? 'var(--neg)' : 'var(--warn)' }}>{s.refill}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <Meter value={s.servingsLeft} max={s.servingsTotal}
                           color={s.refillUrgent ? 'var(--neg)' : 'var(--warn)'} />
                  </div>
                  <span className="v2-num v2-dim" style={{ fontSize: 10 }}>
                    {s.servingsLeft} / {s.servingsTotal} servings
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Active cycles" sub="time-bound items" attrappe={ATTRAPPE}>
          {[
            { n: 'Ashwagandha (KSM-66)', s: '8w on / 2w off', r: 'Wk 5 of 8', c: 'var(--acc-suppl)', warn: true },
            { n: 'Caffeine', s: '8w on / 2w off', r: 'Wk 6 of 8', c: 'var(--acc-suppl)', warn: false },
            { n: 'Creatine', s: 'continuous', r: '—', c: 'var(--pos)', warn: false },
          ].map(z => (
            <div key={z.n} className="v2-row">
              <span className="v2-row-l">
                <span className="v2-dot" style={{ background: z.c }} />
                {z.n}
                <span className="v2-dim" style={{ fontSize: 10 }}>{z.s}</span>
              </span>
              <span className={`v2-row-r${z.r === '—' ? ' v2-dim' : ''}`}
                    style={z.warn ? { color: 'var(--warn)' } : undefined}>{z.r}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

function SlotCard({
  slot, items, takenToday, toggleTaken, onSkip,
}: {
  slot: { id: string; label: string; time: string }
  items: StackItem[]
  takenToday: Record<string, boolean>
  toggleTaken: (id: string) => void
  onSkip: (item: StackItem) => void
}) {
  const slotTime = parseFloat(slot.time.split(':')[0])
  const isPast = NOW_HOUR > slotTime + 1.5
  const isCurrent = !isPast && NOW_HOUR > slotTime - 1
  const heute = items.filter(i => i.days[TODAY_DOW]).length

  return (
    <Card
      className="v2-card-tight"
      attrappe
      style={{
        padding: 0,
        border: isCurrent ? '1px solid color-mix(in oklch, var(--acc-suppl) 35%, var(--border))' : undefined,
        background: isCurrent ? 'color-mix(in oklch, var(--acc-suppl) 4%, var(--surface))' : undefined,
      }}
    >
      <div style={{
        padding: '10px 14px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
      }}>
        <span className="v2-num" style={{
          fontSize: 11, color: isCurrent ? 'var(--acc-suppl)' : 'var(--fg-dim)',
          width: 44, fontWeight: 600,
        }}>{slot.time}</span>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{slot.label}</span>
        {isCurrent && <Pill variant="acc">Next</Pill>}
        {isPast && <Pill variant="pos"><Icon name="check" className="v2-ic v2-ic-sm" />Done</Pill>}
        <div className="v2-spacer" />
        <span className="v2-dim v2-num" style={{ fontSize: 10 }}>
          {heute} item{heute === 1 ? '' : 's'}
        </span>
      </div>
      <div>
        {items.map((it, i) => {
          const active = !!it.days[TODAY_DOW]
          const isTaken = !!takenToday[it.id]
          const isPastSlot = NOW_HOUR > slotTime + 1.5
          const status: Status = !active ? 'skip' : isTaken ? 'taken' : isPastSlot ? 'due' : 'planned'
          return (
            <div key={it.id} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px',
              borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none',
              opacity: active ? 1 : 0.45, flexWrap: 'wrap',
            }}>
              <button type="button" onClick={() => active && toggleTaken(it.id)} disabled={!active}
                      aria-label={isTaken ? 'Als nicht genommen markieren' : 'Als genommen markieren'}
                      style={{ background: 'none', border: 0, cursor: active ? 'pointer' : 'default', padding: 0 }}>
                <CheckCircle status={status} />
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12.5, fontWeight: 500 }}>{it.name}</span>
                  <span className="v2-num v2-dim" style={{ fontSize: 10.5 }}>{it.dose}</span>
                  {it.coachRecommended && <Pill><Icon name="check" className="v2-ic v2-ic-sm" />Coach</Pill>}
                </div>
                <div className="v2-muted" style={{ fontSize: 10.5 }}>{it.brand}</div>
              </div>
              {active && isTaken && <span className="v2-num" style={{ fontSize: 10, color: 'var(--pos)' }}>✓ logged</span>}
              {active && !isTaken && (
                <>
                  <button type="button" className="v2-btn v2-btn-sm" onClick={() => toggleTaken(it.id)}>Mark taken</button>
                  <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm" onClick={() => onSkip(it)}>Skip</button>
                </>
              )}
              {!active && <span className="v2-dim" style={{ fontSize: 10 }}>not today</span>}
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ── STACK ──────────────────────────────────────────────────────
export function SuppStack() {
  const { open } = useSupp()
  const [view, setView] = React.useState<'matrix' | 'list'>('matrix')
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex', background: 'var(--surface)',
          border: '1px solid var(--border)', borderRadius: 6, padding: 2,
        }}>
          {(['matrix', 'list'] as const).map(v => (
            <button key={v} type="button"
                    className={view === v ? 'v2-btn v2-btn-primary' : 'v2-btn v2-btn-ghost'}
                    style={{ height: 26, fontSize: 11, padding: '0 12px', borderRadius: 4 }}
                    onClick={() => setView(v)}>
              {v === 'matrix' ? 'Timing matrix' : 'List'}
            </button>
          ))}
        </div>
        <div className="v2-spacer" />
        <InEntwicklungKnopf titel="Filter" className="v2-btn">
          <Icon name="filter" className="v2-ic v2-ic-sm" /> Filter
        </InEntwicklungKnopf>
        <button type="button" className="v2-btn v2-btn-primary" onClick={() => open('add')}>
          <Icon name="plus" className="v2-ic v2-ic-sm" /> Add to stack
        </button>
      </div>

      {view === 'matrix' ? <StackMatrix /> : <StackList />}
    </div>
  )
}

function StackMatrix() {
  const { open } = useSupp()
  return (
    <Card attrappe={ATTRAPPE}>
      <div className="v2-supp-tbl-wrap">
        <table className="v2-tbl">
          <thead>
            <tr>
              <th style={{ width: 240 }}>Supplement</th>
              <th style={{ width: 110 }}>Dose</th>
              <th style={{ width: 110 }}>Slot</th>
              <th style={{ width: 168 }}>Mon — Sun</th>
              <th style={{ width: 60 }}>Evidence</th>
              <th style={{ width: 50, textAlign: 'right' }}>€/mo</th>
              <th style={{ width: 60, textAlign: 'right' }}>Streak</th>
              <th style={{ width: 30 }}></th>
            </tr>
          </thead>
          <tbody>
            {STACK.map(s => (
              <tr key={s.id} style={{ cursor: 'pointer' }}
                  onClick={() => open('product', { name: s.name, inStack: true })}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="v2-dot" style={{ background: 'var(--acc-suppl)', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 500 }}>{s.name}</div>
                      <div className="v2-muted" style={{ fontSize: 10.5 }}>{s.brand}</div>
                    </div>
                  </div>
                </td>
                <td className="v2-num" style={{ fontSize: 11.5 }}>{s.dose}</td>
                <td className="v2-muted">{SLOTS.find(sl => sl.id === s.slot)?.label}</td>
                <td>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {s.days.map((d, i) => (
                      <div key={i} style={{
                        width: 20, height: 20, borderRadius: 4,
                        display: 'grid', placeItems: 'center',
                        background: d ? 'color-mix(in oklch, var(--acc-suppl) 22%, transparent)' : 'var(--surface-2)',
                        border: d ? '1px solid color-mix(in oklch, var(--acc-suppl) 40%, var(--border))' : '1px solid var(--border)',
                        color: d ? 'var(--acc-suppl)' : 'var(--fg-dim)',
                        fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 600,
                      }}>{DAY_LETTERS[i]}</div>
                    ))}
                  </div>
                </td>
                <td>
                  <Pill style={{
                    color: (EVIDENCE_PALETTE as Record<string, string>)[s.evidence] ?? 'var(--fg-dim)',
                  }}>{s.evidence}</Pill>
                </td>
                <td className="v2-num" style={{ textAlign: 'right' }}>{s.monthlyCost.toFixed(2)}</td>
                <td className="v2-num" style={{ textAlign: 'right', color: 'var(--pos)' }}>{s.streakDays}d</td>
                <td><Icon name="chevron_right" className="v2-ic v2-ic-sm" style={{ color: 'var(--fg-dim)' }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function StackList() {
  return (
    <div className="v2-grid v2-g-cols-2" style={{ gap: 14 }}>
      {STACK.map(s => (
        <Card key={s.id} title={s.name} sub={s.brand} attrappe={ATTRAPPE}>
          <div className="v2-grid v2-g-cols-3" style={{ gap: 10, marginBottom: 10 }}>
            <div>
              <div className="v2-eyebrow" style={{ marginBottom: 2 }}>Dose</div>
              <div className="v2-num" style={{ fontSize: 12 }}>{s.dose}</div>
            </div>
            <div>
              <div className="v2-eyebrow" style={{ marginBottom: 2 }}>Slot</div>
              <div style={{ fontSize: 12 }}>{SLOTS.find(sl => sl.id === s.slot)?.label}</div>
            </div>
            <div>
              <div className="v2-eyebrow" style={{ marginBottom: 2 }}>Streak</div>
              <div className="v2-num" style={{ fontSize: 12, color: 'var(--pos)' }}>{s.streakDays}d</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
            {s.purpose.map(p => <Pill key={p}>{p}</Pill>)}
          </div>
          <div className="v2-muted" style={{ fontSize: 11, lineHeight: 1.45 }}>{s.notes}</div>
        </Card>
      ))}
    </div>
  )
}

// ── DATABASE ───────────────────────────────────────────────────
export function SuppDatabase() {
  const { open } = useSupp()
  const [frage, setFrage] = React.useState('')
  const treffer = frage
    ? SUPPLEMENT_DB.filter(s => s.name.toLowerCase().includes(frage.toLowerCase()))
    : SUPPLEMENT_DB

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          className="v2-feld"
          style={{ flex: 1, minWidth: 220 }}
          value={frage}
          placeholder="Search supplements…"
          onChange={e => setFrage(e.target.value)}
        />
        <InEntwicklungKnopf titel="Filter" className="v2-btn">
          <Icon name="filter" className="v2-ic v2-ic-sm" /> Filter
        </InEntwicklungKnopf>
      </div>

      <Card attrappe={ATTRAPPE}>
        <div className="v2-supp-tbl-wrap">
          <table className="v2-tbl">
            <thead>
              <tr>
                <th>Supplement</th>
                <th style={{ width: 110 }}>Category</th>
                <th style={{ width: 60 }}>Evidence</th>
                <th style={{ width: 150 }}>Typical dose</th>
                <th style={{ width: 90 }}>In stack</th>
                <th style={{ width: 90, textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {treffer.map(s => (
                <tr key={s.name} style={{ cursor: 'pointer' }}
                    onClick={() => open('product', { name: s.name, inStack: s.inStack })}>
                  <td>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{s.name}</div>
                    <div className="v2-muted" style={{ fontSize: 10.5 }}>{s.purpose}</div>
                  </td>
                  <td className="v2-muted">{s.category}</td>
                  <td>
                    <Pill style={{
                      color: (EVIDENCE_PALETTE as Record<string, string>)[s.evidence] ?? 'var(--fg-dim)',
                    }}>{s.evidence}</Pill>
                  </td>
                  <td className="v2-num" style={{ fontSize: 11.5 }}>{s.doseTypical}</td>
                  <td>
                    {s.inStack
                      ? <Pill variant="pos"><Icon name="check" className="v2-ic v2-ic-sm" />Active</Pill>
                      : <span className="v2-dim" style={{ fontSize: 11 }}>—</span>}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {s.inStack
                      ? <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                                onClick={e => { e.stopPropagation(); open('product', { name: s.name, inStack: true }) }}>View</button>
                      : <button type="button" className="v2-btn v2-btn-sm"
                                onClick={e => { e.stopPropagation(); open('add', { name: s.name }) }}>
                          <Icon name="plus" className="v2-ic v2-ic-sm" />Add
                        </button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ── INTERACTIONS ───────────────────────────────────────────────
export function SuppInteractions() {
  const { open } = useSupp()
  return (
    <div className="v2-col-gap" style={{ gap: 12 }}>
      {(INTERACTIONS as Array<Record<string, unknown>>).map((it, i) => {
        const schwere = String(it.severity ?? it.level ?? 'info')
        const farbe = schwere.toLowerCase().includes('high') || schwere.toLowerCase().includes('avoid')
          ? 'var(--neg)'
          : schwere.toLowerCase().includes('mod') || schwere.toLowerCase().includes('caution')
            ? 'var(--warn)' : 'var(--acc-suppl)'
        return (
          <Card key={String(it.pair ?? it.title ?? i)} attrappe={ATTRAPPE}
                onClick={() => open('interaction', it)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
              <span className="v2-dot" style={{ background: farbe }} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                {String(it.pair ?? it.title ?? '')}
              </span>
              <Pill style={{ color: farbe }}>{schwere}</Pill>
            </div>
            <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
              {String(it.note ?? it.detail ?? it.description ?? '')}
            </div>
          </Card>
        )
      })}
    </div>
  )
}

// ── COST ───────────────────────────────────────────────────────
export function SuppCost() {
  const monat = STACK.reduce((s, x) => s + x.monthlyCost, 0)
  const jahr = monat * 12
  const teuerste = STACK.slice().sort((a, b) => b.monthlyCost - a.monthlyCost)
  const max = teuerste[0]?.monthlyCost ?? 1

  return (
    <div className="v2-grid-14">
      <Card title="Cost per supplement" sub="monthly" attrappe={ATTRAPPE}>
        {teuerste.map(s => (
          <div key={s.id} className="v2-supp-cost-row">
            <span style={{ fontSize: 11.5 }}>{s.name.split(' ')[0]}</span>
            <Meter value={s.monthlyCost} max={max} color="var(--acc-suppl)" />
            <span className="v2-num" style={{ fontSize: 11, textAlign: 'right' }}>
              €{s.monthlyCost.toFixed(2)}
            </span>
          </div>
        ))}
      </Card>

      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="Total" sub="all active items" attrappe={ATTRAPPE}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
            <span className="v2-num" style={{ fontSize: 30, fontWeight: 500 }}>€{monat.toFixed(2)}</span>
            <span className="v2-dim" style={{ fontSize: 12 }}>/ month</span>
          </div>
          <div className="v2-row">
            <span className="v2-row-l">Per year</span>
            <span className="v2-row-r v2-num">€{jahr.toFixed(2)}</span>
          </div>
          <div className="v2-row">
            <span className="v2-row-l">Per day</span>
            <span className="v2-row-r v2-num">€{(monat / 30).toFixed(2)}</span>
          </div>
          <div className="v2-row">
            <span className="v2-row-l">Items</span>
            <span className="v2-row-r v2-num">{STACK.length}</span>
          </div>
        </Card>

        <Card title="Cost per evidence grade" sub="where the money goes" attrappe={ATTRAPPE}>
          {['A', 'B+', 'B', 'C'].map(g => {
            const posten = STACK.filter(s => s.evidence === g)
            if (posten.length === 0) return null
            const summe = posten.reduce((s, x) => s + x.monthlyCost, 0)
            return (
              <div key={g} className="v2-row">
                <span className="v2-row-l">
                  <Pill style={{ color: (EVIDENCE_PALETTE as Record<string, string>)[g] ?? 'var(--fg-dim)' }}>{g}</Pill>
                  <span className="v2-dim" style={{ fontSize: 10.5 }}>{posten.length} items</span>
                </span>
                <span className="v2-row-r v2-num">€{summe.toFixed(2)}</span>
              </div>
            )
          })}
        </Card>
      </div>
    </div>
  )
}
