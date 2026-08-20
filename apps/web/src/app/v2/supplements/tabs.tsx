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
import { Card, Pill, Icon, Meter, Ring, Row, LineChart, InEntwicklungKnopf } from '@lumeos/ui'

import {
  STACK, SLOTS, DAY_LETTERS, EVIDENCE_PALETTE, SUPPLEMENT_DB,
  INTERACTIONS, EXTENDED_STACK, EXTENDED_LABS, type StackItem,
} from './daten'
import { useSupp } from './kontext'
// G-74: die zwei Kostenkacheln, die das Protokoll brauchen.
import { CostErgaenzung } from './tab-inventory-echt'

/** `[cmd]` Feste Vorfuehrwerte der Vorlage (Zeile 190/191) — Sa, 13:30.
    Kein `new Date()`: die Vorlage will ein reproduzierbares Bild, und
    ein Modul ohne Datenquelle haette von der echten Uhr nichts. */
const TODAY_DOW = 5
const NOW_HOUR = 13.5

const ATTRAPPE = 'Aus dem Entwurf uebernommen. Es gibt kein `supplements`-Schema — die Zahlen sind erfunden.'

/**
 * Die Marke der **Rueckfallfassungen** (G-74).
 *
 * **Tom, 2026-08-19:** *„Im Code ausdokumentieren, sprich den Code als
 * alten Mockup-Code markieren, falls wir spaeter was brauchen."*
 *
 * `[cmd]` **Warum eine zweite Marke und nicht nur ein Kommentar:** Der
 * Zaehler in `v2-attrappen.test.ts` zaehlte bis G-74 pauschal 17 — die
 * Zahl blieb gleich, obwohl vier Tabs echt lesen, weil die alten
 * Fassungen daneben stehenbleiben. **Ein Kommentar fuer Menschen haette
 * daran nichts geaendert.** `RUECKFALL` ist maschinenlesbar: der
 * Zaehler trennt jetzt „noch nie angebunden" von „abgeloest, aber
 * aufgehoben".
 *
 * `[read]` **Goals hat es anders gemacht** — dort wurden die
 * Attrappenfassungen geloescht (`ansicht.tsx` 772 → 315 Zeilen). Hier
 * bleiben sie: der dritte Weg, stehenlassen und erkennbar machen.
 *
 * **Wer eine Rueckfallfassung wieder braucht**, findet sie an dieser
 * Marke. Wer sie loeschen will, sieht an ihr, dass es eine bewusste
 * Aufbewahrung war und kein vergessener Code.
 */
const RUECKFALL = 'Rueckfallfassung: der urspruengliche Entwurf. Die angebundene '
  + 'Fassung steht daneben und wird gezeigt, sobald Daten vorliegen — '
  + 'diese hier bleibt als Vorlage aufgehoben (G-74).'

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
  const { daten } = useSupp()
  // G-37: Liegen echte Daten vor, zeigt der Tab sie. Sonst die Vorlage.
  return daten ? <TodayEcht /> : <TodayAttrappe />
}

/**
 * Der Tab „Today" aus dem `supplements`-Schema.
 *
 * `[cmd]` Angebunden sind: die Tagesquote aus `intake_logs`, die
 * Positionen aus `stack_items` nach `timing` gruppiert, und die
 * Nachfuellliste aus `stock_remaining`/`low_stock_threshold`.
 *
 * `[read]` NICHT angebunden und deshalb entfallen: „Streak" (braucht
 * eine Kette von Tagen, es gibt einen), „in 4h 02m" (braucht eine
 * geplante Uhrzeit gegen die echte Uhr) und „Active cycles"
 * (`cycling` ist auf allen vier Positionen leer). Was fehlt, steht
 * nicht als erfundene Zahl da — es steht gar nicht da.
 */
function TodayEcht() {
  const { daten, takenToday, toggleTaken, open } = useSupp()
  const d = daten!
  const heute = d.einnahmen[0]?.intake_date ?? null
  const heuteZeilen = d.einnahmen.filter(e => e.intake_date === heute)

  // Faellig ist, was heute im Protokoll steht; ohne Protokoll der
  // ganze aktive Stack.
  const dueToday = heuteZeilen.length || d.positionen.length
  const takenCount = heuteZeilen.filter(e => e.status === 'taken').length

  // Die naechste offene Einnahme des Tages, nach Uhrzeit.
  const naechste = heuteZeilen
    .filter(e => e.status === 'planned')
    .sort((a, b) => (a.intake_time ?? '').localeCompare(b.intake_time ?? ''))[0] ?? null

  const nachfuellen = d.positionen
    .filter(p => p.unter_schwelle === true)
    .sort((a, b) => (a.tage_bis_leer ?? Infinity) - (b.tage_bis_leer ?? Infinity))

  // Nach `timing` gruppieren — die Slot-Ordnung der Vorlage, soweit
  // die Werte sich decken.
  const gruppen = TIMING_ORDNUNG
    .map(t => ({ t, items: d.positionen.filter(p => p.timing === t.id) }))
    .filter(g => g.items.length > 0)

  return (
    <div className="v2-grid-15">
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Ring value={takenCount} max={dueToday} color="var(--acc-suppl)" label="taken" size={88} stroke={7} />
            <div style={{ flex: 1, minWidth: 180 }}>
              <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Today&apos;s adherence</div>
              <div className="v2-num" style={{ fontSize: 26, lineHeight: 1, marginBottom: 4 }}>
                {takenCount}<span className="v2-dim" style={{ fontSize: 13 }}> / {dueToday}</span>
              </div>
              <div className="v2-muted" style={{ fontSize: 11.5 }}>
                {naechste
                  ? <>Next: <span style={{ color: 'var(--fg)', fontWeight: 500 }}>
                      {naechste.supplement_name_snapshot}</span>
                      {naechste.intake_time ? <> · <span className="v2-num">{naechste.intake_time.slice(0, 5)}</span></> : null}
                    </>
                  : 'Nothing planned for the rest of the day'}
              </div>
            </div>
            {heute && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                <span className="v2-eyebrow">Logged</span>
                <span className="v2-num" style={{ fontSize: 18 }}>{heute}</span>
              </div>
            )}
          </div>
        </Card>

        {gruppen.map(g => (
          <Card key={g.t.id} className="v2-card-tight" style={{ padding: 0 }}>
            <div style={{
              padding: '10px 14px', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
            }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{g.t.label}</span>
              <div className="v2-spacer" />
              <span className="v2-dim v2-num" style={{ fontSize: 10 }}>
                {g.items.length} item{g.items.length === 1 ? '' : 's'}
              </span>
            </div>
            <div>
              {g.items.map((p, i) => {
                const zeile = heuteZeilen.find(e => e.stack_item_id === p.id)
                const isTaken = zeile ? zeile.status === 'taken' : !!takenToday[p.id]
                const status: Status = isTaken ? 'taken'
                  : zeile?.status === 'skipped' ? 'skip' : 'planned'
                return (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px',
                    borderBottom: i < g.items.length - 1 ? '1px solid var(--border)' : 'none',
                    flexWrap: 'wrap',
                  }}>
                    <button type="button" onClick={() => toggleTaken(p.id)}
                            aria-label={isTaken ? 'Als nicht genommen markieren' : 'Als genommen markieren'}
                            style={{ background: 'none', border: 0, cursor: 'pointer', padding: 0 }}>
                      <CheckCircle status={status} />
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12.5, fontWeight: 500 }}>{p.name}</span>
                        <span className="v2-num v2-dim" style={{ fontSize: 10.5 }}>
                          {p.dose} {p.dose_unit}
                        </span>
                        {p.katalog && (
                          <Pill style={{
                            color: (EVIDENCE_PALETTE as Record<string, string>)[p.katalog.evidence_grade]
                              ?? 'var(--fg-dim)',
                          }}>{p.katalog.evidence_grade}</Pill>
                        )}
                      </div>
                      <div className="v2-muted" style={{ fontSize: 10.5 }}>
                        {p.katalog?.category ?? '—'}
                        {zeile?.measurement_source
                          ? ` · ${zeile.measurement_source}`
                          : ''}
                      </div>
                    </div>
                    {isTaken
                      ? <span className="v2-num" style={{ fontSize: 10, color: 'var(--pos)' }}>✓ logged</span>
                      : (
                        <>
                          <button type="button" className="v2-btn v2-btn-sm"
                                  onClick={() => toggleTaken(p.id)}>Mark taken</button>
                          <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                                  onClick={() => open('skip', { name: p.name })}>Skip</button>
                        </>
                      )}
                  </div>
                )
              })}
            </div>
          </Card>
        ))}
      </div>

      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="Refills" sub="stock at or below threshold">
          {nachfuellen.length === 0
            ? <div className="v2-muted" style={{ fontSize: 11.5 }}>
                Nothing below its threshold.
              </div>
            : (
              <div className="v2-col-gap" style={{ gap: 0 }}>
                {nachfuellen.map((p, i, arr) => (
                  <div key={p.id} style={{
                    padding: '10px 0',
                    borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span className="v2-dot" style={{ background: 'var(--neg)' }} />
                      <span style={{ fontSize: 12, fontWeight: 500, flex: 1 }}>{p.name}</span>
                      <span className="v2-num" style={{ fontSize: 11, color: 'var(--neg)' }}>
                        {p.tage_bis_leer != null ? `${p.tage_bis_leer.toFixed(0)} d left` : '—'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <Meter value={p.stock_remaining ?? 0}
                               max={Math.max(p.stock_remaining ?? 0, (p.low_stock_threshold ?? 0) * 3, 1)}
                               color="var(--neg)" />
                      </div>
                      <span className="v2-num v2-dim" style={{ fontSize: 10 }}>
                        {p.stock_remaining} / {p.low_stock_threshold} {p.stock_unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </Card>

        <Card title="Stack" sub={d.stack_name ?? undefined}>
          <div className="v2-col-gap" style={{ gap: 0 }}>
            {d.positionen.map(p => (
              <Row key={p.id} label={p.name}
                   value={`${p.dose} ${p.dose_unit}`} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

/**
 * Die Slot-Ordnung fuer echte Daten.
 *
 * `[cmd]` `stack_items.timing` kennt acht Werte (C-68), die Vorlage
 * fuenf Slots. Nur die Werte, die wirklich vorkommen koennen, stehen
 * hier — in der Reihenfolge des Tages.
 */
const TIMING_ORDNUNG = [
  { id: 'morning', label: 'Morning' },
  { id: 'midday', label: 'Midday' },
  { id: 'pre_workout', label: 'Pre-workout' },
  { id: 'post_workout', label: 'Post-workout' },
  { id: 'with_meal', label: 'With meal' },
  { id: 'evening', label: 'Evening' },
  { id: 'bedtime', label: 'Bedtime' },
  { id: 'any', label: 'Any time' },
] as const

function TodayAttrappe() {
  const { takenToday, toggleTaken, open } = useSupp()
  const dueToday = STACK.filter(s => s.days[TODAY_DOW]).length
  const takenCount = STACK.filter(s => s.days[TODAY_DOW] && takenToday[s.id]).length
  const nextItem = STACK.find(s => s.slot === 'pre_workout' && s.days[TODAY_DOW])
  const nachfuellen = STACK.filter(s => s.servingsLeft / s.servingsTotal < 0.4)

  return (
    <div className="v2-grid-15">
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card attrappe={RUECKFALL}>
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
          attrappe={RUECKFALL}
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
          attrappe={RUECKFALL}
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

        <Card title="Active cycles" sub="time-bound items" attrappe={RUECKFALL}>
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
      // G-74: `SlotCard` wird nur von `TodayAttrappe` benutzt und ist
      // damit selbst Rueckfall. Die blosse Marke der Vorlage bekommt
      // deshalb denselben Begruendungssatz wie die uebrigen.
      attrappe={RUECKFALL}
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
  const { open, daten } = useSupp()
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

      {view === 'matrix'
        ? (daten ? <StackMatrixEcht /> : <StackMatrix />)
        : (daten ? <StackListeEcht /> : <StackList />)}
    </div>
  )
}

/**
 * Die Timing-Matrix aus `stack_items`.
 *
 * `[read]` Die Wochentagsspalte der Vorlage entfaellt: `frequency`
 * kennt `daily`, `weekdays`, `training_days`, `custom`, `cycling` —
 * aber KEINE Tagesliste. Sieben Kaestchen zu zeichnen, wo die
 * Datenbank ein einzelnes Wort fuehrt, waere eine Erfindung. Die
 * Spalte zeigt stattdessen `frequency` im Klartext.
 */
function StackMatrixEcht() {
  const { daten, open } = useSupp()
  const d = daten!
  return (
    <Card>
      <div className="v2-supp-tbl-wrap">
        <table className="v2-tbl">
          <thead>
            <tr>
              <th style={{ width: 240 }}>Supplement</th>
              <th style={{ width: 110 }}>Dose</th>
              <th style={{ width: 110 }}>Timing</th>
              <th style={{ width: 120 }}>Frequency</th>
              <th style={{ width: 60 }}>Evidence</th>
              <th style={{ width: 70, textAlign: 'right' }}>€/mo</th>
              <th style={{ width: 90, textAlign: 'right' }}>Stock</th>
              <th style={{ width: 30 }}></th>
            </tr>
          </thead>
          <tbody>
            {d.positionen.map(p => (
              <tr key={p.id} style={{ cursor: 'pointer' }}
                  onClick={() => open('product', { name: p.name, inStack: true })}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="v2-dot" style={{ background: 'var(--acc-suppl)', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 500 }}>{p.name}</div>
                      <div className="v2-muted" style={{ fontSize: 10.5 }}>
                        {p.katalog?.category ?? '—'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="v2-num" style={{ fontSize: 11.5 }}>{p.dose} {p.dose_unit}</td>
                <td className="v2-muted">
                  {TIMING_ORDNUNG.find(t => t.id === p.timing)?.label ?? p.timing}
                </td>
                <td className="v2-muted" style={{ fontSize: 11.5 }}>{p.frequency}</td>
                <td>
                  {p.katalog
                    ? <Pill style={{
                        color: (EVIDENCE_PALETTE as Record<string, string>)[p.katalog.evidence_grade]
                          ?? 'var(--fg-dim)',
                      }}>{p.katalog.evidence_grade}</Pill>
                    : <span className="v2-dim">—</span>}
                </td>
                <td className="v2-num" style={{ textAlign: 'right' }}>
                  {p.kosten_pro_tag != null ? (p.kosten_pro_tag * 30).toFixed(2) : '—'}
                </td>
                <td className="v2-num" style={{
                  textAlign: 'right',
                  color: p.unter_schwelle ? 'var(--neg)' : 'var(--fg)',
                }}>
                  {p.stock_remaining != null ? `${p.stock_remaining} ${p.stock_unit ?? ''}` : '—'}
                </td>
                <td><Icon name="chevron_right" className="v2-ic v2-ic-sm" style={{ color: 'var(--fg-dim)' }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {d.positionen.length === 0 && (
        <div className="v2-muted" style={{ fontSize: 12, padding: '12px 0' }}>
          No active stack items.
        </div>
      )}
    </Card>
  )
}

/** Die Listenansicht aus `stack_items` mit den Nutzen des Katalogs. */
function StackListeEcht() {
  const { daten } = useSupp()
  const d = daten!
  if (d.positionen.length === 0) {
    return (
      <Card>
        <div className="v2-muted" style={{ fontSize: 12 }}>No active stack items.</div>
      </Card>
    )
  }
  return (
    <div className="v2-grid v2-g-cols-2" style={{ gap: 14 }}>
      {d.positionen.map(p => (
        <Card key={p.id} title={p.name} sub={p.katalog?.category ?? undefined}>
          <div className="v2-grid v2-g-cols-3" style={{ gap: 10, marginBottom: 10 }}>
            <div>
              <div className="v2-eyebrow" style={{ marginBottom: 2 }}>Dose</div>
              <div className="v2-num" style={{ fontSize: 12 }}>{p.dose} {p.dose_unit}</div>
            </div>
            <div>
              <div className="v2-eyebrow" style={{ marginBottom: 2 }}>Timing</div>
              <div style={{ fontSize: 12 }}>
                {TIMING_ORDNUNG.find(t => t.id === p.timing)?.label ?? p.timing}
              </div>
            </div>
            <div>
              <div className="v2-eyebrow" style={{ marginBottom: 2 }}>Stock</div>
              <div className="v2-num" style={{
                fontSize: 12, color: p.unter_schwelle ? 'var(--neg)' : 'var(--fg)',
              }}>
                {p.stock_remaining != null ? `${p.stock_remaining} ${p.stock_unit ?? ''}` : '—'}
              </div>
            </div>
          </div>
          {p.katalog && p.katalog.benefits.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
              {p.katalog.benefits.slice(0, 4).map(b => <Pill key={b}>{b}</Pill>)}
            </div>
          )}
          {p.katalog?.evidence_summary && (
            <div className="v2-muted" style={{ fontSize: 11, lineHeight: 1.45 }}>
              {p.katalog.evidence_summary}
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}

function StackMatrix() {
  const { open } = useSupp()
  return (
    <Card attrappe={RUECKFALL}>
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
        <Card key={s.id} title={s.name} sub={s.brand} attrappe={RUECKFALL}>
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
  const { katalog } = useSupp()
  // G-37: der echte Katalog, sobald er gelesen ist.
  return katalog.length > 0 ? <DatabaseEcht /> : <DatabaseAttrappe />
}

/**
 * Der Wirkstoffkatalog aus `supplement_catalog`.
 *
 * `[cmd]` 44 Eintraege auf `dev@lumeos.app`, gegen 15 in der Vorlage.
 * „In stack" kommt aus dem Verbund mit `stack_items`, nicht aus einem
 * Feld des Katalogs — der Katalog ist Stammdaten und weiss nichts
 * ueber eine Nutzerin.
 */
function DatabaseEcht() {
  const { katalog, daten, open } = useSupp()
  const [frage, setFrage] = React.useState('')
  const [kategorie, setKategorie] = React.useState<string>('all')

  const imStack = new Set(
    (daten?.positionen ?? []).map(p => p.katalog?.id).filter(Boolean) as string[])

  const kategorien = React.useMemo(
    () => Array.from(new Set(katalog.map(k => k.category))).sort(),
    [katalog])

  const treffer = katalog.filter(k =>
    (kategorie === 'all' || k.category === kategorie)
    && (!frage || k.name.toLowerCase().includes(frage.toLowerCase())))

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
        <select className="v2-feld" value={kategorie}
                aria-label="Kategorie"
                onChange={e => setKategorie(e.target.value)}>
          <option value="all">All categories</option>
          {kategorien.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <Card>
        <div className="v2-supp-tbl-wrap">
          <table className="v2-tbl">
            <thead>
              <tr>
                <th>Supplement</th>
                <th style={{ width: 110 }}>Category</th>
                <th style={{ width: 60 }}>Evidence</th>
                {/* `[cmd]` `typical_dose_min` ist auf ALLEN 44 Eintraegen
                    leer, `serving_size` auf allen 44 gefuellt. Die Spalte
                    zeigt deshalb die Portionsgroesse — eine Spalte voller
                    Striche waere kein Nachweis, sondern ein Leerlauf. */}
                <th style={{ width: 130 }}>Serving</th>
                <th style={{ width: 80, textAlign: 'right' }}>€/serving</th>
                <th style={{ width: 90 }}>In stack</th>
                <th style={{ width: 90, textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {treffer.map(k => {
                const drin = imStack.has(k.id)
                const dosis = k.serving_size != null
                  ? `${k.serving_size} ${k.serving_unit ?? ''}`.trim()
                  : '—'
                return (
                  <tr key={k.id} style={{ cursor: 'pointer' }}
                      onClick={() => open('product', { name: k.name, inStack: drin })}>
                    <td>
                      <div style={{ fontSize: 12.5, fontWeight: 500 }}>{k.name}</div>
                      <div className="v2-muted" style={{ fontSize: 10.5 }}>
                        {k.evidence_summary ?? k.benefits.slice(0, 3).join(' · ') ?? ''}
                      </div>
                    </td>
                    <td className="v2-muted">{k.category}</td>
                    <td>
                      <Pill style={{
                        color: (EVIDENCE_PALETTE as Record<string, string>)[k.evidence_grade]
                          ?? 'var(--fg-dim)',
                      }}>{k.evidence_grade}</Pill>
                    </td>
                    <td className="v2-num" style={{ fontSize: 11.5 }}>{dosis}</td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>
                      {k.cost_per_serving != null ? k.cost_per_serving.toFixed(2) : '—'}
                    </td>
                    <td>
                      {drin
                        ? <Pill variant="pos"><Icon name="check" className="v2-ic v2-ic-sm" />Active</Pill>
                        : <span className="v2-dim" style={{ fontSize: 11 }}>—</span>}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {drin
                        ? <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                                  onClick={e => { e.stopPropagation(); open('product', { name: k.name, inStack: true }) }}>View</button>
                        : <button type="button" className="v2-btn v2-btn-sm"
                                  onClick={e => { e.stopPropagation(); open('add', { name: k.name }) }}>
                            <Icon name="plus" className="v2-ic v2-ic-sm" />Add
                          </button>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 8 }}>
          {treffer.length} of {katalog.length} entries
        </div>
      </Card>
    </div>
  )
}

function DatabaseAttrappe() {
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

      <Card attrappe={RUECKFALL}>
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
// G-45: NACHGEZOGEN. `[cmd]` Die Vorlage fuehrt hier **fuenf**
// Kacheln (module-supplements.jsx:936-1046), G-33 hatte **zwei**
// gebaut — dieselbe Klasse Luecke wie bei `SuppExtended`: der Tab
// sieht beim Klicken vollstaendig aus, ist es aber nicht.
export function SuppCost() {
  const { daten } = useSupp()
  // G-37: `cost_per_serving` steht auf allen 44 Katalogeintraegen und
  // `serving_size` ebenso — die Monatskosten sind damit rechenbar.
  // Der Verlauf und die Sparvorschlaege sind es nicht.
  return daten ? <CostEcht /> : <CostAttrappe />
}

/**
 * Der Tab „Cost" aus echten Preisen.
 *
 * `[cmd]` Gerechnet: Tagesdosis / Portionsgroesse × Preis je Portion.
 * Fuer die vier Positionen ergibt das 20,40 € im Monat.
 *
 * `[read]` ENTFALLEN, weil die Grundlage fehlt: „12 months trend"
 * (es gibt einen Protokolltag, keinen Monatsverlauf), „+ €4.20 vs
 * Apr" (kein Vormonat), „Cost optimization" (das sind
 * Einkaufsempfehlungen, keine Rechnung) und „Category split" mit den
 * vier erfundenen Gruppen — die echten Kategorien kommen aus dem
 * Katalog und sind andere.
 */
function CostEcht() {
  const { daten } = useSupp()
  const d = daten!
  const mitPreis = d.positionen.filter(p => p.kosten_pro_tag != null)
  const ohnePreis = d.positionen.length - mitPreis.length
  const tag = mitPreis.reduce((s, p) => s + (p.kosten_pro_tag ?? 0), 0)
  const monat = tag * 30
  const jahr = monat * 12
  const teuerste = mitPreis.slice().sort(
    (a, b) => (b.kosten_pro_tag ?? 0) - (a.kosten_pro_tag ?? 0))

  // Kategorien aus dem Katalog, nicht erfunden.
  const kategorien = Object.entries(
    mitPreis.reduce<Record<string, number>>((acc, p) => {
      const c = p.katalog?.category ?? 'Other'
      acc[c] = (acc[c] ?? 0) + (p.kosten_pro_tag ?? 0) * 30
      return acc
    }, {})).sort((a, b) => b[1] - a[1])

  return (
    <div className="v2-grid v2-grid-14" style={{ gap: 16 }}>
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <div className="v2-grid v2-g-cols-3" style={{ gap: 12 }}>
          <Card style={{ padding: 14 }}>
            <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Monthly</div>
            <div className="v2-num" style={{ fontSize: 22, fontWeight: 500 }}>€{monat.toFixed(2)}</div>
            <div className="v2-muted" style={{ fontSize: 11 }}>
              {mitPreis.length} item{mitPreis.length === 1 ? '' : 's'} × 30 d
            </div>
          </Card>
          <Card style={{ padding: 14 }}>
            <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Annual run-rate</div>
            <div className="v2-num" style={{ fontSize: 22, fontWeight: 500 }}>€{jahr.toFixed(0)}</div>
            <div className="v2-muted" style={{ fontSize: 11 }}>12 × current</div>
          </Card>
          <Card style={{ padding: 14 }}>
            <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Per day</div>
            <div className="v2-num" style={{ fontSize: 22, fontWeight: 500 }}>€{tag.toFixed(2)}</div>
            <div className="v2-muted" style={{ fontSize: 11 }}>at current doses</div>
          </Card>
        </div>

        <Card title="Spend per supplement" sub="dose ÷ serving size × price per serving">
          <div className="v2-supp-tbl-wrap">
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th>Supplement</th>
                  <th style={{ width: 130 }}>Distribution</th>
                  <th style={{ width: 80, textAlign: 'right' }}>€/mo</th>
                  <th style={{ width: 80, textAlign: 'right' }}>€/day</th>
                  <th style={{ width: 60, textAlign: 'right' }}>%</th>
                </tr>
              </thead>
              <tbody>
                {teuerste.map(p => {
                  const proMonat = (p.kosten_pro_tag ?? 0) * 30
                  const pct = monat > 0 ? (proMonat / monat) * 100 : 0
                  return (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td><Meter value={pct} color="var(--acc-suppl)" tall /></td>
                      <td className="v2-num" style={{ textAlign: 'right' }}>€{proMonat.toFixed(2)}</td>
                      <td className="v2-num" style={{ textAlign: 'right', color: 'var(--fg-dim)' }}>
                        €{(p.kosten_pro_tag ?? 0).toFixed(2)}
                      </td>
                      <td className="v2-num" style={{ textAlign: 'right' }}>{pct.toFixed(1)}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {ohnePreis > 0 && (
            <div className="v2-dim" style={{ fontSize: 10, marginTop: 8 }}>
              {ohnePreis} item{ohnePreis === 1 ? '' : 's'} without a price — not counted.
            </div>
          )}
        </Card>
      </div>

      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="Category split" sub="from the catalog">
          <div className="v2-col-gap" style={{ gap: 8 }}>
            {kategorien.map(([c, v]) => (
              <div key={c} className="v2-supp-kategorie">
                <span style={{ color: 'var(--fg-muted)' }}>{c}</span>
                <div style={{ flex: 1 }}>
                  <Meter value={v} max={monat} color="var(--acc-suppl)" tall />
                </div>
                <span className="v2-num" style={{ textAlign: 'right' }}>€{v.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* `[cmd]` G-74: „If you removed…" um den Rest und den Anteil
            erweitert — reine Subtraktion, wie der Auftrag sagt. Was ein
            Praeparat BRINGT, sagt die Tabelle nicht; `Cost
            optimization` der Vorlage bleibt draussen, weil es Beratung
            waere. */}
        <Card title="If you removed…" sub="monthly saving per item">
          {teuerste.slice(0, 4).map(p => (
            <Row key={p.id} label={`− ${p.name}`}
                 value={`save €${((p.kosten_pro_tag ?? 0) * 30).toFixed(2)}/mo`} />
          ))}
        </Card>
      </div>

      {/* G-74: der Kostenverlauf aus dem Protokoll und die vollstaendige
          Subtraktionstabelle. Beide brauchen die Einnahmen, nicht nur
          die Positionen — deshalb eine eigene Datei. */}
      <div className="v2-grid-14" style={{ marginTop: 14 }}>
        <CostErgaenzung d={d} />
      </div>
    </div>
  )
}

function CostAttrappe() {
  const monat = STACK.reduce((s, x) => s + x.monthlyCost, 0)
  const jahr = monat * 12
  const teuerste = STACK.slice().sort((a, b) => b.monthlyCost - a.monthlyCost)
  // Die Verlaufszahlen der Vorlage (Zeile 939), letzter Wert gerechnet.
  const verlauf = [82, 79, 84, 88, 91, 86, 90, 94, 89, 88, 92, monat]

  const kategorien = [
    { c: 'Performance', ids: ['creatine', 'betaala', 'caffeine'], color: 'var(--acc-train)' },
    { c: 'Recovery', ids: ['magnesium', 'ashwagandha'], color: 'var(--acc-recov)' },
    { c: 'Foundation', ids: ['d3k2', 'omega3'], color: 'var(--acc-suppl)' },
    { c: 'Protein', ids: ['whey'], color: 'var(--acc-nutri)' },
  ].map(k => ({
    ...k,
    v: STACK.filter(s => k.ids.includes(s.id)).reduce((a, b) => a + b.monthlyCost, 0),
  }))

  return (
    <div className="v2-grid v2-grid-14" style={{ gap: 16 }}>
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <div className="v2-grid v2-g-cols-3" style={{ gap: 12 }}>
          <Card style={{ padding: 14 }} attrappe={RUECKFALL}>
            <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Monthly</div>
            <div className="v2-num" style={{ fontSize: 22, fontWeight: 500 }}>€{monat.toFixed(2)}</div>
            <div className="v2-muted" style={{ fontSize: 11 }}>+ €4.20 vs Apr</div>
          </Card>
          <Card style={{ padding: 14 }} attrappe={RUECKFALL}>
            <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Annual run-rate</div>
            <div className="v2-num" style={{ fontSize: 22, fontWeight: 500 }}>€{jahr.toFixed(0)}</div>
            <div className="v2-muted" style={{ fontSize: 11 }}>12 × current</div>
          </Card>
          <Card style={{ padding: 14 }} attrappe={RUECKFALL}>
            <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Per active day</div>
            <div className="v2-num" style={{ fontSize: 22, fontWeight: 500 }}>€{(monat / 30).toFixed(2)}</div>
            <div className="v2-muted" style={{ fontSize: 11 }}>8 items · ~26 doses</div>
          </Card>
        </div>

        <Card title="Cost · 12 months trend" sub="rolling monthly spend" attrappe={RUECKFALL}>
          <LineChart
            h={180}
            series={[{ data: verlauf, color: 'var(--acc-suppl)' }]}
            xLabels={['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May']}
            range={[70, 110]}
          />
        </Card>

        <Card title="Spend per supplement · this month" attrappe={RUECKFALL}>
          <div className="v2-supp-tbl-wrap">
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th>Supplement</th>
                  <th style={{ width: 130 }}>Distribution</th>
                  <th style={{ width: 80, textAlign: 'right' }}>€/mo</th>
                  <th style={{ width: 80, textAlign: 'right' }}>€/day*</th>
                  <th style={{ width: 60, textAlign: 'right' }}>%</th>
                </tr>
              </thead>
              <tbody>
                {teuerste.map(s => {
                  const pct = (s.monthlyCost / monat) * 100
                  // Aktive Tage je Monat: Wochentage × 4,3 (Vorlage Zeile 985).
                  const aktiveTage = s.days.reduce((sum, d) => sum + d, 0) * 4.3
                  return (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td><Meter value={pct} color="var(--acc-suppl)" tall /></td>
                      <td className="v2-num" style={{ textAlign: 'right' }}>€{s.monthlyCost.toFixed(2)}</td>
                      <td className="v2-num" style={{ textAlign: 'right', color: 'var(--fg-dim)' }}>
                        €{(s.monthlyCost / aktiveTage).toFixed(2)}
                      </td>
                      <td className="v2-num" style={{ textAlign: 'right' }}>{pct.toFixed(1)}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="v2-dim" style={{ fontSize: 10, marginTop: 8 }}>
            * € per active-day, accounting for non-daily items (whey 5/7, pre-workout 4/7).
          </div>
        </Card>
      </div>

      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="Category split" attrappe={RUECKFALL}>
          <div className="v2-col-gap" style={{ gap: 8 }}>
            {kategorien.map(k => (
              <div key={k.c} className="v2-supp-kategorie">
                <span style={{ color: 'var(--fg-muted)' }}>{k.c}</span>
                <div style={{ flex: 1 }}>
                  <Meter value={k.v} max={monat} color={k.color} tall />
                </div>
                <span className="v2-num" style={{ textAlign: 'right' }}>€{k.v.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="If you removed…" sub="cost-per-effect quick reference" attrappe={RUECKFALL}>
          <div className="v2-muted" style={{ fontSize: 11.5, marginBottom: 10, lineHeight: 1.55 }}>
            Hypothetical monthly savings if individual items were dropped. Use with Buddy&apos;s
            effect analysis for trade-offs.
          </div>
          {teuerste.slice(0, 4).map(s => (
            <Row key={s.id} label={`− ${s.name}`} value={`save €${s.monthlyCost.toFixed(2)}/mo`} />
          ))}
        </Card>

        <Card title="Cost optimization · suggestions" attrappe={RUECKFALL}>
          <div className="v2-col-gap" style={{ gap: 8 }}>
            <div className="v2-supp-vorschlag">
              <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 3 }}>
                Bulk Nordic Naturals via subscription
              </div>
              <div className="v2-muted" style={{ fontSize: 11 }}>
                Save ~€7/mo on Omega-3 with quarterly auto-ship.
              </div>
            </div>
            <div className="v2-supp-vorschlag">
              <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 3 }}>
                Switch creatine to 1kg pouch
              </div>
              <div className="v2-muted" style={{ fontSize: 11 }}>
                Per-gram cost drops 22% — save €1.80/mo, ~€22/year.
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
