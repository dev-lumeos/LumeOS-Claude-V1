'use client'

// Das Dashboard der Vorlage, uebernommen.
//
// QUELLE: theme-v1/module-dashboard.jsx, 329 Zeilen.
//
// `[read]` Tom, 2026-08-16: „Wieso holen wir nicht einfach das ganze
// Template als Mockup rein und binden dann an?" — Genau das ist diese
// Datei. Anordnung, Reihenfolge, Benennung und **die Entwurfszahlen**
// stehen unveraendert da: Recovery 82, Training Load 2.142 TSS,
// Calories 1.847, Sleep 7:42, Readiness 84, PR watch, Tonight.
//
// GEAENDERT IST NUR DAS TECHNISCHE:
//   1. JSX ohne Typen -> TypeScript.
//   2. Klassen auf `v2-`-Praefix.
//   3. Knoepfe ohne Ziel oeffnen `InEntwicklung` statt nichts zu tun.
//   4. `@media`-Haltepunkte, weil die Vorlage keine hat.
//
// NICHT geaendert: keine Kachel zusammengefasst, keine Zahl ersetzt,
// keine Anordnung angepasst.
//
// ANBINDEN heisst: die Entwurfszahl gegen die echte tauschen und die
// Marke `attrappe` an der Kachel entfernen. Was heute echt ist, steht
// in `dashboard-echt.tsx` — diese Datei bleibt der unveraenderte
// Entwurf, bis jede Kachel eine Quelle hat.
import * as React from 'react'
import {
  Card, Pill, Icon, KPI, Ring, Meter, LineChart, InEntwicklungKnopf,
} from '@lumeos/ui'

// --- Die Zahlen der Vorlage, unveraendert -------------------------
const recovery = 82
const calories = { val: 1847, target: 2700 }

const feed = [
  { t: '08:42', icon: 'nutrition', color: 'var(--acc-nutri)', label: 'Breakfast logged', meta: 'Oats + Whey · 612 kcal · 38g P' },
  { t: '07:15', icon: 'recovery', color: 'var(--acc-recov)', label: 'HRV captured', meta: '64ms · +2 vs 7d avg' },
  { t: '06:48', icon: 'supplements', color: 'var(--acc-suppl)', label: 'Morning stack taken', meta: 'Creatine, D3, Omega-3 · 8 items' },
  { t: '06:30', icon: 'recovery', color: 'var(--acc-recov)', label: 'Sleep ended', meta: '7h 42m · quality 84' },
  { t: 'Yesterday 21:14', icon: 'training', color: 'var(--acc-train)', label: 'Pull A completed', meta: '12 sets · 5,840 kg volume · 1 PR' },
  { t: 'Yesterday 18:32', icon: 'nutrition', color: 'var(--acc-nutri)', label: 'Dinner logged', meta: 'Salmon + Rice · 738 kcal · 52g P' },
] as const

const ATTRAPPE = 'Aus dem Entwurf uebernommen. Die Zahlen sind erfunden, bis die Kachel eine Quelle hat.'

/**
 * Die angebundenen Makros. `null` heisst: keine Daten fuer den Tag —
 * dann bleibt die Kachel beim Entwurf und behaelt die Marke.
 *
 * `[read]` „Angebunden heisst: Marke weg." Genau das macht `echteMakros`
 * hier: liegt sie an, faellt `attrappe` an der Makro-Kachel weg.
 */
export type EchteMakros = {
  kcal: { cur: number | null; tgt: number | null }
  protein: { cur: number | null; tgt: number | null }
  carbs: { cur: number | null; tgt: number | null }
  fat: { cur: number | null; tgt: number | null }
}

export function DashboardEntwurf({ echteMakros }: { echteMakros?: EchteMakros | null }) {
  return (
    <>
      <div className="v2-module-header v2-module-hero-lite">
        <div className="v2-module-title-block">
          <div className="v2-module-title-row">
            <span className="v2-module-title">Today</span>
            <Pill>Sat · May 16</Pill>
            <Pill variant="acc">Streak 23d</Pill>
          </div>
          <div className="v2-module-sub">Your full health picture, refreshed 2 minutes ago.</div>
        </div>
        <div className="v2-module-actions">
          <InEntwicklungKnopf titel="Week" className="v2-btn v2-btn-ghost">
            <Icon name="calendar" className="v2-ic v2-ic-sm" /> Week
          </InEntwicklungKnopf>
          <InEntwicklungKnopf titel="Export" className="v2-btn">
            <Icon name="download" className="v2-ic v2-ic-sm" /> Export
          </InEntwicklungKnopf>
          <InEntwicklungKnopf titel="Log" className="v2-btn v2-btn-primary">
            <Icon name="plus" className="v2-ic v2-ic-sm" /> Log
          </InEntwicklungKnopf>
        </div>
      </div>

      {/* Top KPI row */}
      <div className="v2-grid v2-g-cols-4" style={{ marginBottom: 16 }}>
        <div className="v2-kpi-huelle v2-attrappe">
          <KPI
            label="Recovery" value={recovery} unit="/100"
            delta="+4 wk avg" deltaVariant="pos"
            spark={[68, 71, 70, 74, 78, 81, 82]} sparkColor="var(--acc-recov)"
          />
          <span className="v2-attrappe-marke"><Pill variant="warn">Attrappe</Pill></span>
        </div>
        <div className="v2-kpi-huelle v2-attrappe">
          <KPI
            label="Training Load" value="2,142" unit="TSS · 7d"
            delta="+12% vs baseline" deltaVariant="pos"
            spark={[180, 240, 320, 290, 360, 380, 372]} sparkColor="var(--acc-train)"
          />
          <span className="v2-attrappe-marke"><Pill variant="warn">Attrappe</Pill></span>
        </div>
        <div className="v2-kpi-huelle v2-attrappe">
          <KPI
            label="Calories" value="1,847" unit={`/ ${calories.target}`}
            delta="–32% remaining"
            spark={[2400, 2680, 2510, 2740, 2620, 2590, 1847]} sparkColor="var(--acc-nutri)"
          />
          <span className="v2-attrappe-marke"><Pill variant="warn">Attrappe</Pill></span>
        </div>
        <div className="v2-kpi-huelle v2-attrappe">
          <KPI
            label="Sleep · last" value="7:42" unit="hrs"
            delta="Quality 84" deltaVariant="pos"
            spark={[5.8, 7.2, 6.9, 7.8, 8.1, 7.4, 7.7]} sparkColor="var(--acc-recov)"
          />
          <span className="v2-attrappe-marke"><Pill variant="warn">Attrappe</Pill></span>
        </div>
      </div>

      {/* Main grid */}
      <div className="v2-dash-grid">
        {/* Left column */}
        <div className="v2-col-gap" style={{ gap: 16 }}>
          <Card
            title="Today's flow"
            sub="06:30 — 22:00"
            attrappe={ATTRAPPE}
            actions={
              <>
                <InEntwicklungKnopf titel="Filter" className="v2-icon-btn">
                  <Icon name="filter" className="v2-ic v2-ic-sm" />
                </InEntwicklungKnopf>
                <InEntwicklungKnopf titel="Mehr" className="v2-icon-btn">
                  <Icon name="more" className="v2-ic v2-ic-sm" />
                </InEntwicklungKnopf>
              </>
            }
          >
            <DayTimeline />
          </Card>

          {/* ANGEBUNDEN, sobald echteMakros anliegt: dann faellt die
              Marke weg und die Zahlen kommen aus daily_summary und
              goals.zielwerte_am. Ohne Daten bleibt der Entwurf stehen. */}
          <Card
            title="Macros · today"
            sub={
              echteMakros?.protein.cur != null && echteMakros.protein.tgt != null
                ? `${Math.round(echteMakros.protein.cur)}g of ${Math.round(echteMakros.protein.tgt)}g protein`
                : '142g of 180g protein'
            }
            attrappe={echteMakros ? undefined : ATTRAPPE}
            actions={
              <a href="/v2/nutrition" className="v2-btn v2-btn-ghost"
                 style={{ height: 22, fontSize: 11, padding: '0 8px' }}>
                Open Nutrition <Icon name="arrow_right" className="v2-ic v2-ic-sm" />
              </a>
            }
          >
            <MacroGrid echt={echteMakros} />
          </Card>

          <Card
            title="Activity"
            sub="Live"
            attrappe={ATTRAPPE}
            actions={
              <InEntwicklungKnopf titel="All events" className="v2-btn v2-btn-ghost"
                                  style={{ height: 22, fontSize: 11, padding: '0 8px' }}>
                All events
              </InEntwicklungKnopf>
            }
          >
            <div className="v2-col-gap" style={{ gap: 0 }}>
              {feed.map((e, i) => (
                <div key={e.label} style={{
                  display: 'flex', gap: 10, padding: '9px 0',
                  borderBottom: i < feed.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div className="v2-num" style={{ fontSize: 10, color: 'var(--fg-dim)', width: 64, paddingTop: 1, flexShrink: 0 }}>{e.t}</div>
                  <div style={{
                    width: 16, height: 16, borderRadius: 4,
                    background: `color-mix(in oklch, ${e.color} 18%, transparent)`,
                    border: `1px solid color-mix(in oklch, ${e.color} 35%, transparent)`,
                    display: 'grid', placeItems: 'center', color: e.color, flexShrink: 0,
                  }}>
                    <Icon name={e.icon} className="v2-ic" style={{ width: 10, height: 10, strokeWidth: 2 }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: 'var(--fg)' }}>{e.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{e.meta}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="v2-col-gap" style={{ gap: 16 }}>
          <Card title="Readiness" sub="Composite · 7d trend" attrappe={ATTRAPPE}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
              <Ring value={84} max={100} color="var(--acc-train)" label="ready" size={108} stroke={7} />
              <div style={{ flex: 1 }}>
                <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Push hard</div>
                <div style={{ fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.45 }}>
                  All systems in optimal zone. Recovery, sleep, and HRV align — green light for tonight&apos;s Push B session.
                </div>
              </div>
            </div>
            <div className="v2-col-gap" style={{ gap: 6 }}>
              {([
                ['Recovery', 82, 'var(--acc-recov)'],
                ['Sleep quality', 84, 'var(--acc-recov)'],
                ['Soreness', 78, 'var(--acc-train)'],
                ['Nutrition', 88, 'var(--acc-nutri)'],
                ['Stress', 71, 'var(--acc-buddy)'],
              ] as Array<[string, number, string]>).map(([k, v, c]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11 }}>
                  <span style={{ width: 88, color: 'var(--fg-muted)' }}>{k}</span>
                  <div style={{ flex: 1 }}><Meter value={v} color={c} /></div>
                  <span className="v2-num" style={{ width: 28, textAlign: 'right' }}>{v}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card
            title="Body battery"
            sub="vs. 14-day baseline"
            attrappe={ATTRAPPE}
            actions={
              <InEntwicklungKnopf titel="Mehr" className="v2-icon-btn">
                <Icon name="more" className="v2-ic v2-ic-sm" />
              </InEntwicklungKnopf>
            }
          >
            <LineChart
              series={[
                { data: [62, 71, 68, 74, 78, 81, 82], color: 'var(--acc-recov)' },
                { data: [68, 70, 69, 70, 71, 72, 71], color: 'var(--fg-dim)' },
              ]}
              h={120}
              xLabels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
              showArea
              range={[40, 100]}
            />
            <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 10, color: 'var(--fg-muted)' }}>
              <div className="v2-row-gap"><span className="v2-dot" style={{ background: 'var(--acc-recov)' }} />Score</div>
              <div className="v2-row-gap"><span className="v2-dot" style={{ background: 'var(--fg-dim)' }} />Baseline</div>
            </div>
          </Card>

          <Card
            title="Tonight"
            sub="18:00"
            accent="var(--acc-train)"
            attrappe={ATTRAPPE}
            actions={
              <InEntwicklungKnopf titel="Start" className="v2-btn v2-btn-accent"
                                  style={{ height: 22, fontSize: 11, padding: '0 8px' }}>
                <Icon name="play" className="v2-ic v2-ic-sm" />Start
              </InEntwicklungKnopf>
            }
          >
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Push B · Chest, Shoulders, Triceps</div>
            <div className="v2-muted" style={{ fontSize: 11, marginBottom: 10 }}>Assigned by Coach Anders · Block 3 · Week 2</div>
            <div className="v2-grid v2-g-cols-3" style={{ gap: 6 }}>
              {[
                { l: 'Sets', v: '18' },
                { l: 'Volume', v: '≈ 6.2 t' },
                { l: 'Time', v: '~74m' },
              ].map(s => (
                <div key={s.l} style={{ padding: '8px 10px', background: 'var(--surface-2)', borderRadius: 6 }}>
                  <div className="v2-eyebrow" style={{ marginBottom: 2 }}>{s.l}</div>
                  <div className="v2-num" style={{ fontSize: 14 }}>{s.v}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="PR watch" sub="Last 30d" attrappe={ATTRAPPE}>
            <div className="v2-col-gap">
              {[
                { lift: 'Bench Press', last: '117.5kg ×3', neu: '120.0kg ×3', date: 'May 10' },
                { lift: 'Deadlift', last: '180.0kg ×1', neu: '185.0kg ×1', date: 'May 5' },
                { lift: 'Pull-up wtd', last: '+27.5kg ×5', neu: '+30.0kg ×5', date: 'Apr 28' },
              ].map(p => (
                <div key={p.lift} className="v2-row">
                  <span className="v2-row-l">
                    <Icon name="trend_up" className="v2-ic v2-ic-sm" style={{ color: 'var(--pos)' }} />
                    {p.lift}
                    <span className="v2-dim" style={{ fontSize: 10 }}>{p.date}</span>
                  </span>
                  <span className="v2-row-r" style={{ color: 'var(--pos)' }}>{p.neu}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

// --- Day timeline, uebernommen ------------------------------------
function DayTimeline() {
  const events = [
    { t: 6.5, dur: 0.5, label: 'Sleep ends', color: 'var(--acc-recov)', icon: 'moon' },
    { t: 7.25, dur: 0.5, label: 'Stack AM', color: 'var(--acc-suppl)', icon: 'supplements' },
    { t: 8.7, dur: 0.5, label: 'Breakfast', color: 'var(--acc-nutri)', icon: 'nutrition' },
    { t: 13, dur: 0.5, label: 'Lunch', color: 'var(--acc-nutri)', icon: 'nutrition' },
    { t: 18, dur: 1.5, label: 'Push B', color: 'var(--acc-train)', icon: 'training' },
    { t: 20, dur: 0.5, label: 'Dinner', color: 'var(--acc-nutri)', icon: 'nutrition' },
    { t: 22, dur: 0.5, label: 'Wind down', color: 'var(--acc-recov)', icon: 'moon' },
  ] as const
  const hours = [6, 9, 12, 15, 18, 21]
  const start = 6
  const end = 22
  return (
    <div>
      <div style={{ position: 'relative', height: 56, marginBottom: 8, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 28, height: 1, background: 'var(--border)' }} />
        <div style={{ position: 'absolute', left: `${((13.5 - start) / (end - start)) * 100}%`, top: 0, bottom: 0, width: 1, background: 'var(--acc)' }}>
          <span style={{
            position: 'absolute', top: -2, left: -16, width: 32, textAlign: 'center',
            fontSize: 9, color: 'var(--acc)', fontFamily: 'var(--font-mono)', fontWeight: 600,
          }}>NOW</span>
        </div>
        {events.map(e => {
          const leftPct = ((e.t - start) / (end - start)) * 100
          const widthPct = (e.dur / (end - start)) * 100
          const clamped = Math.min(widthPct, Math.max(0.5, 100 - leftPct))
          return (
            <div key={e.label} style={{
              position: 'absolute', left: `${leftPct}%`, top: 22, height: 12,
              width: `${clamped}%`, background: e.color, opacity: 0.85,
              borderRadius: 3, minWidth: 4,
            }} title={e.label} />
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        {hours.map(h => (
          <span key={h} className="v2-num" style={{ fontSize: 9, color: 'var(--fg-dim)' }}>
            {h.toString().padStart(2, '0')}:00
          </span>
        ))}
      </div>
      <div className="v2-col-gap" style={{ gap: 0 }}>
        {events.slice(0, 5).map((e, i) => (
          <div key={e.label} className="v2-row" style={{ borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
            <span className="v2-row-l">
              <div style={{
                width: 14, height: 14, borderRadius: 3,
                background: `color-mix(in oklch, ${e.color} 20%, transparent)`,
                border: `1px solid color-mix(in oklch, ${e.color} 40%, transparent)`,
                color: e.color, display: 'grid', placeItems: 'center',
              }}>
                <Icon name={e.icon} className="v2-ic" style={{ width: 9, height: 9, strokeWidth: 2 }} />
              </div>
              <span className="v2-num" style={{ fontSize: 10, color: 'var(--fg-dim)', width: 36 }}>
                {Math.floor(e.t).toString().padStart(2, '0')}:{((e.t % 1) * 60).toFixed(0).padStart(2, '0')}
              </span>
              {e.label}
            </span>
            <span className="v2-row-r v2-dim" style={{ fontSize: 10 }}>
              {e.dur < 1 ? `${Math.round(e.dur * 60)}m` : `${e.dur.toFixed(1)}h`}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- MacroGrid, uebernommen ---------------------------------------
// Aufbau unveraendert: vier Spalten, je Eyebrow, Prozent, Wert/Ziel,
// Balken. Angebunden werden nur die Zahlen.
function MacroGrid({ echt }: { echt?: EchteMakros | null }) {
  const macros = [
    { label: 'Calories', cur: 1847, tgt: 2700, unit: 'kcal', color: 'var(--acc-nutri)', quelle: echt?.kcal },
    { label: 'Protein', cur: 142, tgt: 180, unit: 'g', color: 'var(--acc-train)', quelle: echt?.protein },
    { label: 'Carbs', cur: 168, tgt: 320, unit: 'g', color: 'var(--acc-recov)', quelle: echt?.carbs },
    { label: 'Fat', cur: 72, tgt: 90, unit: 'g', color: 'var(--acc-goals)', quelle: echt?.fat },
  ]
  return (
    <div className="v2-grid v2-g-cols-4" style={{ gap: 10 }}>
      {macros.map(m => {
        // Ohne Anbindung die Entwurfszahl. Mit Anbindung der echte
        // Wert — und `null` bleibt `—`, nie 0 (C-48, Regel 1).
        const cur = echt ? m.quelle?.cur ?? null : m.cur
        const tgt = echt ? m.quelle?.tgt ?? null : m.tgt
        const pct = cur !== null && tgt ? Math.round((cur / tgt) * 100) : null
        return (
          <div key={m.label}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
              <span className="v2-eyebrow">{m.label}</span>
              <span className="v2-num" style={{ fontSize: 9, color: 'var(--fg-dim)' }}>
                {pct === null ? '—' : `${pct}%`}
              </span>
            </div>
            <div className="v2-num" style={{ fontSize: 18, marginBottom: 2 }}>
              {cur === null ? '—' : Math.round(cur).toLocaleString('en-US')}
              <span style={{ fontSize: 10, color: 'var(--fg-dim)', marginLeft: 4 }}>
                / {tgt === null ? '—' : Math.round(tgt).toLocaleString('en-US')} {m.unit}
              </span>
            </div>
            <Meter value={cur ?? 0} max={tgt ?? 100} color={m.color} tall />
          </div>
        )
      })}
    </div>
  )
}
