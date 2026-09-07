'use client'

// Der Mockup-Reiter `today` als Referenz unter der gebauten Ansicht —
// G-365, E-69.
//
// ## Warum diese Datei existiert
//
// `[cmd]` **Gemessen 2026-09-07:** `TrainingToday` in `ansicht.tsx`
// traegt **vier Verdraengungen** der Form `echt ? <Echt/> : <Entwurf/>`
// — bei `This week`, `Training readiness`, `Weekly volume` und
// `Streak`.
//
// `[cmd]` **`dev@lumeos.app` hat 30 Sitzungen und 1.416 Uebungen** —
// **also lief immer der echte Zweig, und die vier Entwuerfe waren auf
// Toms Konto nie zu sehen.**
//
// `[read]` **Dieselbe Bauform ist in recovery und supplements schon
// gefallen.** Ein `else`-Zweig ist kein Vergleich: wer Daten hat, sieht
// ihn nie, und wer keine hat, sieht die echte Fassung nicht.
//
// **Tom, 2026-09-07:** *,,so habe ich ist und soll fuer mich immer
// bereit und ich kann arbeiten."*
//
// ## Was hier steht
//
// `[cmd]` **QUELLE: `theme-v1/module-training.jsx:62-203`**, die
// Komponente `TrainingToday` — 142 Zeilen, fuenf Kacheln.
//
// `[read]` **Uebernommen ist die ANSICHT, eins zu eins.** Die
// Entwurfszahlen sind die der Vorlage und bleiben es — **hier wird
// nichts gerechnet und nichts erfunden.**
//
// `[read]` **Die Zweige in `ansicht.tsx` bleiben unangetastet.** Sie
// tragen den Rueckfall fuer ein Konto ohne Sitzungen; diese Datei ist
// der Vergleich fuer ein Konto MIT Sitzungen.
import * as React from 'react'
import { Card, Pill, Icon, Ring, Meter, Row } from '@lumeos/ui'

import { ReferenzTrenner } from '@/components/shell/referenz-trenner'
import {
  OUTBOX, SYNC_LOG, HR_MAX, HR_ZONES, HR_SETS,
} from './tabs-offline-hr'

const QUELLE = 'theme-v1/module-training.jsx'

// `[read]` Die Marke steht hier lokal, nicht aus `ansicht.tsx` geholt:
// diese Datei wird VON `ansicht.tsx` importiert, ein Gegenimport waere
// ein Zirkel. Und die Marke traegt ohnehin einen anderen Grund —
// E-68 verlangt Quelle UND Grund, und der ist hier immer derselbe.
/** `module-training.jsx:206` — die Woche des Entwurfs. */
const WOCHE: Array<{
  day: string; date: number; session: string; state: string;
  volume?: string; pr?: number;
}> = [
  { day: 'Mon', date: 12, session: 'Pull A', state: 'done', volume: '5.4t', pr: 0 },
  { day: 'Tue', date: 13, session: 'Push A', state: 'done', volume: '4.9t', pr: 1 },
  { day: 'Wed', date: 14, session: 'Legs A', state: 'done', volume: '7.2t', pr: 0 },
  { day: 'Thu', date: 15, session: 'Rest', state: 'rest' },
  { day: 'Fri', date: 16, session: 'Push B', state: 'today', volume: '6.2t plan' },
  { day: 'Sat', date: 17, session: 'Pull B', state: 'planned' },
  { day: 'Sun', date: 18, session: 'Legs B', state: 'planned' },
]

const ATTRAPPE =
  `Attrappe — ${QUELLE} · wartet auf: nichts — Referenz zum Vergleich, `
  + 'faellt mit Toms Abnahme'

/** Die Entwurfssitzung der Vorlage — `module-training.jsx:63-78`. */
const SITZUNG = {
  name: 'Push B',
  sub: 'Chest, Shoulders, Triceps',
  block: 'Block 3 · Wk 2',
  date: 'Tonight · 18:00',
  sets: 18,
  volume: '6.2 t',
  duration: '~74m',
  uebungen: [
    { name: 'Bench Press', target: '5×5 @ 117.5kg', rir: 'RIR 2', last: '5,5,5,5,4 @ 115kg', pr: true, equip: 'Barbell' },
    { name: 'Incline DB Press', target: '4×8 @ 38kg', rir: 'RIR 2', last: '8,8,7,7 @ 36kg', equip: 'Dumbbell' },
    { name: 'Cable Fly', target: '3×12 @ 22kg', rir: 'RIR 1', last: '12,12,11 @ 22kg', equip: 'Cable' },
    { name: 'OHP · seated', target: '4×6 @ 65kg', rir: 'RIR 2', last: '6,6,5,5 @ 62.5kg', equip: 'Barbell' },
    { name: 'Lateral Raise', target: '3×15 @ 9kg', rir: 'RIR 0', last: '15,14,12 @ 9kg', equip: 'Dumbbell' },
    { name: 'Triceps Pushdown', target: '3×12 @ 38kg', rir: 'RIR 1', last: '12,12,10 @ 36kg', equip: 'Cable' },
    { name: 'Overhead Triceps', target: '3×10 @ 24kg', rir: 'RIR 1', last: '10,10,9 @ 24kg', equip: 'Dumbbell' },
  ],
}

/** Die fuenf Bereitschaftsanteile der Vorlage — `:139-145`. */
const ANTEILE: Array<[string, number, string]> = [
  ['Recovery', 82, 'var(--acc-recov)'],
  ['Sleep quality', 84, 'var(--acc-recov)'],
  ['Soreness — chest', 78, 'var(--acc-train)'],
  ['Nutrition', 88, 'var(--acc-nutri)'],
  ['Mood', 90, 'var(--acc-buddy)'],
]

/** Das Wochenvolumen der Vorlage — `:159-166`. */
const VOLUMEN = [
  { m: 'Chest', done: 14, target: 16, color: 'var(--acc-train)' },
  { m: 'Back', done: 18, target: 18, color: 'var(--acc-train)' },
  { m: 'Shoulders', done: 10, target: 14, color: 'var(--acc-train)' },
  { m: 'Quads', done: 18, target: 16, color: 'var(--pos)' },
  { m: 'Hamstrings', done: 9, target: 12, color: 'var(--acc-train)' },
  { m: 'Arms', done: 14, target: 14, color: 'var(--acc-train)' },
]

/**
 * Der Reiter `today`, wie er im Mockup steht.
 *
 * `[read]` Fuenf Kacheln: die Sitzungstafel (ohne Titel), `This week`,
 * `Training readiness`, `Weekly volume`, `Streak`.
 */
export function TrainingTodayReferenz() {
  return (
    <>
      <ReferenzTrenner reiter="Today" quelle={QUELLE} />
      <div
        className="v2-grid"
        style={{ gridTemplateColumns: '1.4fr 1fr', gap: 16 }}
      >
        <div className="v2-col-gap" style={{ gap: 16 }}>
          {/* [cmd] module-training.jsx:84-135 — die Sitzungstafel. */}
          <Card attrappe={ATTRAPPE}>
            <div style={{
              display: 'flex', alignItems: 'flex-start',
              gap: 14, marginBottom: 16,
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 8,
                background: 'color-mix(in oklch, var(--acc-train) 18%, transparent)',
                border: '1px solid color-mix(in oklch, var(--acc-train) 35%, transparent)',
                display: 'grid', placeItems: 'center',
                color: 'var(--acc-train)', flexShrink: 0,
              }}>
                <Icon name="training" className="v2-ic" style={{ width: 24, height: 24 }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 18, fontWeight: 600,
                  letterSpacing: '-0.01em', marginBottom: 2,
                }}>{SITZUNG.name}</div>
                <div className="v2-muted" style={{ fontSize: 12, marginBottom: 8 }}>
                  {SITZUNG.sub} · {SITZUNG.block}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Pill variant="acc">
                    <Icon name="calendar" className="v2-ic v2-ic-sm" />{SITZUNG.date}
                  </Pill>
                  <Pill>{SITZUNG.sets} sets</Pill>
                  <Pill>{SITZUNG.duration}</Pill>
                  <Pill>Volume {SITZUNG.volume}</Pill>
                </div>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="v2-tbl">
                <thead>
                  <tr>
                    <th style={{ width: 28 }}>#</th>
                    <th>Exercise</th>
                    <th style={{ width: 130 }}>Target</th>
                    <th style={{ width: 60 }}>RIR</th>
                    <th>Last session</th>
                  </tr>
                </thead>
                <tbody>
                  {SITZUNG.uebungen.map((ex, i) => (
                    <tr key={ex.name}>
                      <td className="v2-num v2-muted">
                        {(i + 1).toString().padStart(2, '0')}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {ex.name}
                          {ex.pr && (
                            <Pill variant="pos">
                              <Icon name="trend_up" className="v2-ic v2-ic-sm" />PR attempt
                            </Pill>
                          )}
                        </div>
                        <div className="v2-muted" style={{ fontSize: 10, marginTop: 2 }}>
                          {ex.equip}
                        </div>
                      </td>
                      <td className="v2-num">{ex.target}</td>
                      <td className="v2-num v2-muted">{ex.rir}</td>
                      <td className="v2-num v2-muted" style={{ fontSize: 11 }}>
                        {ex.last}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* [cmd] module-training.jsx:137-139 */}
          <Card title="This week" sub="Coach plan · 5 of 6 sessions"
                attrappe={ATTRAPPE}>
            {/* `[cmd]` QUELLE: `module-training.jsx:205` — `WeekStrip`. */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6,
            }}>
              {WOCHE.map(d => (
                <div key={d.date} style={{
                  padding: 10, borderRadius: 6, fontSize: 11, minHeight: 80,
                  background: d.state === 'today'
                    ? 'color-mix(in oklch, var(--acc-train) 10%, var(--surface))'
                    : 'var(--surface)',
                  border: `1px solid ${d.state === 'today'
                    ? 'color-mix(in oklch, var(--acc-train) 40%, var(--border))'
                    : 'var(--border)'}`,
                }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    marginBottom: 6,
                  }}>
                    <span style={{ color: 'var(--fg-muted)' }}>{d.day}</span>
                    <span className="v2-num" style={{ color: 'var(--fg-dim)' }}>
                      {d.date}
                    </span>
                  </div>
                  <div style={{
                    fontSize: 12, fontWeight: 500, marginBottom: 4,
                    color: d.state === 'today' ? 'var(--acc-train)'
                      : d.state === 'rest' ? 'var(--fg-dim)' : 'var(--fg)',
                  }}>{d.session}</div>
                  {d.state === 'done' && (
                    <div style={{
                      display: 'flex', gap: 4, alignItems: 'center', fontSize: 10,
                    }}>
                      <Icon name="check" className="v2-ic v2-ic-sm"
                            style={{ color: 'var(--pos)', width: 10, height: 10 }} />
                      <span className="v2-num v2-dim">{d.volume}</span>
                      {(d.pr ?? 0) > 0 && (
                        <Pill variant="pos" style={{ padding: '0 4px' }}>PR</Pill>
                      )}
                    </div>
                  )}
                  {d.state === 'today' && (
                    <div className="v2-num v2-dim" style={{ fontSize: 10 }}>
                      {d.volume}
                    </div>
                  )}
                  {d.state === 'rest' && (
                    <div className="v2-dim" style={{ fontSize: 10 }}>—</div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="v2-col-gap" style={{ gap: 16 }}>
          {/* [cmd] module-training.jsx:143-160 */}
          <Card title="Training readiness" sub="Composite" attrappe={ATTRAPPE}>
            <div style={{
              display: 'flex', alignItems: 'center',
              gap: 14, marginBottom: 14,
            }}>
              <Ring value={84} max={100} color="var(--acc-train)"
                    label="ready" size={92} stroke={7} />
              <div style={{ flex: 1 }}>
                <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Good to go</div>
                <div style={{ fontSize: 11, color: 'var(--fg-muted)', lineHeight: 1.45 }}>
                  Normal training. Focus on progressive overload — consider
                  attempting 120kg ×3 on bench.
                </div>
              </div>
            </div>
            {ANTEILE.map(([k, v, c]) => (
              <div key={k} style={{
                display: 'flex', alignItems: 'center',
                gap: 10, fontSize: 11, marginBottom: 6,
              }}>
                <span style={{ width: 110, color: 'var(--fg-muted)' }}>{k}</span>
                <div style={{ flex: 1 }}><Meter value={v} color={c} /></div>
                <span className="v2-num" style={{ width: 28, textAlign: 'right' }}>{v}</span>
              </div>
            ))}
          </Card>

          {/* [cmd] module-training.jsx:162-186 — mit Zielband. */}
          <Card title="Weekly volume" sub="Sets per muscle · target band"
                attrappe={ATTRAPPE}>
            <div className="v2-col-gap" style={{ gap: 8 }}>
              {VOLUMEN.map(v => (
                <div key={v.m} style={{
                  display: 'grid', gridTemplateColumns: '80px 1fr 64px',
                  gap: 10, alignItems: 'center', fontSize: 11,
                }}>
                  <span style={{ color: 'var(--fg-muted)' }}>{v.m}</span>
                  <div style={{
                    position: 'relative', height: 14,
                    background: 'var(--surface-2)', borderRadius: 3,
                  }}>
                    <div style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0,
                      width: `${Math.min((v.done / 24) * 100, 100)}%`,
                      background: v.color, opacity: 0.85, borderRadius: 3,
                    }} />
                    <div style={{
                      position: 'absolute', left: `${(v.target / 24) * 100}%`,
                      top: -2, bottom: -2, width: 1, background: 'var(--fg)',
                    }} />
                  </div>
                  <span className="v2-num" style={{ textAlign: 'right', fontSize: 11 }}>
                    {v.done}<span className="v2-dim"> / {v.target}</span>
                  </span>
                </div>
              ))}
            </div>
            <div className="v2-divider" />
            <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.45 }}>
              Das Zielband der Vorlage. `[cmd]` Die gebaute Fassung zeigt es
              NICHT — Sollwerte je Muskel sind Schwellen aus der Literatur,
              und im Repo liegt keine belegte Quelle dafuer.
            </div>
          </Card>

          {/* [cmd] module-training.jsx:188-190 */}
          <Card title="Streak" sub="last 12 weeks" attrappe={ATTRAPPE}>
            {/* `[cmd]` QUELLE: `module-training.jsx:248` —
                `StreakHeatmap`. **Die Zahlenreihe ist die der Vorlage**,
                samt ihrer festen Formel — kein Zufall, damit das Bild
                zwischen zwei Seitenaufrufen stehenbleibt. */}
            <div>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3,
              }}>
                {Array.from({ length: 12 }).map((_, wi) => (
                  <div key={wi} style={{
                    display: 'grid', gridTemplateRows: 'repeat(7, 1fr)', gap: 3,
                  }}>
                    {Array.from({ length: 7 }).map((__, di) => {
                      const r = di === 3 ? 0 : (((wi * 7 + di) * 17) % 100) / 100
                      const v = r > 0.35 ? Math.min(1, r + 0.2) : 0
                      return (
                        <div key={di} title={`Week ${wi + 1}, day ${di + 1}`}
                             style={{
                               height: 10, borderRadius: 2,
                               background: v > 0 ? 'var(--acc-train)' : 'var(--surface-2)',
                               opacity: v > 0 ? 0.3 + v * 0.7 : 1,
                             }} />
                      )
                    })}
                  </div>
                ))}
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                marginTop: 8, fontSize: 10, color: 'var(--fg-dim)',
              }}>
                <span className="v2-num">12 wks ago</span>
                <span className="v2-num">this week</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}


// ══ Die vier Reiter ohne Linie ═════════════════════════════════════
//
// **Tom, 2026-09-07:** *,,training/plan, training/volume landmarks,
// training/hr zones, training/offline sync noch nicht wie er soll."*
//
// `[cmd]` **Alle vier hatten KEINE Linie.** `[read]` Ich hatte sie als
// „selbst Entwurf" eingeordnet — **dieselbe Fehleinordnung wie bei
// `goals/tdee`: die Attrappenzahl entscheidet nicht ueber die Linie.**
//
//     plan        module-training.jsx            2 Kacheln
//     landmarks   module-training-spec.jsx       7 Kacheln
//     hrzones     module-training-offline-hr.jsx 3 Kacheln
//     offline     module-training-offline-hr.jsx 5 Kacheln

const QUELLE_SPEC2 = 'theme-v1/module-training-spec.jsx'
const QUELLE_HR = 'theme-v1/module-training-offline-hr.jsx'

function markeVon(quelle: string): string {
  return `Attrappe — ${quelle} · wartet auf: nichts — Referenz zum `
    + 'Vergleich, faellt mit Toms Abnahme'
}

/** `plan` — `TrainingPlan`, 2 Kacheln. */
export function TrainingPlanReferenz() {
  const wochen: Array<[string, string, string, string]> = [
    ['Week 1', 'Volume accumulation', 'Complete', '84%'],
    ['Week 2', 'Volume accumulation', 'Current', '92%'],
    ['Week 3', 'Intensification', 'Planned', '96%'],
    ['Week 4', 'Peak intensity', 'Planned', '100%'],
    ['Week 5', 'Deload', 'Planned', '55%'],
  ]
  const routinen: Array<[string, number, number, string, string, boolean]> = [
    ['Push A — Heavy', 7, 22, '6.8 t', 'coach', false],
    ['Push B — Volume', 7, 24, '6.2 t', 'coach', true],
    ['Pull A — Heavy', 7, 22, '7.4 t', 'coach', false],
    ['Pull B — Volume', 7, 24, '6.9 t', 'coach', false],
    ['Legs A — Squat focus', 8, 24, '9.8 t', 'coach', false],
    ['Mobility & Core', 6, 18, '0', 'self', false],
  ]
  return (
    <>
      <ReferenzTrenner reiter="Plan" quelle={QUELLE} />
      <div className="v2-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card title="Mesocycle · Block 3" sub="May 5 — Jun 8 · 5 weeks"
              attrappe={markeVon(QUELLE)}>
          <div className="v2-col-gap" style={{ gap: 8 }}>
            {wochen.map(([wk, fokus, stand, last]) => {
              const jetzt = stand === 'Current'
              return (
                <div key={wk} style={{
                  padding: 12, borderRadius: 6,
                  background: jetzt
                    ? 'color-mix(in oklch, var(--acc-train) 8%, var(--surface))'
                    : 'var(--surface)',
                  border: `1px solid ${jetzt
                    ? 'color-mix(in oklch, var(--acc-train) 30%, var(--border))'
                    : 'var(--border)'}`,
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
                  }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{wk}</span>
                    {jetzt && <Pill variant="acc">Now</Pill>}
                    <span className="v2-muted" style={{ fontSize: 11, marginLeft: 'auto' }}>
                      load <span className="v2-num">{last}</span>
                    </span>
                  </div>
                  <div className="v2-muted" style={{ fontSize: 11, marginBottom: 6 }}>
                    {fokus}
                  </div>
                  <Meter value={parseInt(last, 10)} max={100}
                         color={jetzt ? 'var(--acc-train)'
                           : stand === 'Complete' ? 'var(--pos)' : 'var(--fg-dim)'} />
                </div>
              )
            })}
          </div>
        </Card>

        <Card title="Routines" sub="6 total" attrappe={markeVon(QUELLE)}>
          <div className="v2-col-gap" style={{ gap: 8 }}>
            {routinen.map(([name, ex, saetze, vol, herkunft, heute]) => (
              <div key={name} style={{
                padding: 12, borderRadius: 6, border: '1px solid var(--border)',
                background: heute
                  ? 'color-mix(in oklch, var(--acc-train) 5%, var(--surface))'
                  : 'var(--surface)',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{name}</span>
                  {heute && <Pill variant="acc">Today</Pill>}
                  <Pill>{herkunft === 'coach' ? 'Coach' : 'Self'}</Pill>
                </div>
                <div className="v2-muted v2-num" style={{ fontSize: 11, marginTop: 3 }}>
                  {ex} exercises · {saetze} sets · {vol}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}

/** `landmarks` — `TrainingLandmarksView`, 7 Kacheln. */
export function TrainingLandmarksReferenz() {
  const muskeln: Array<[string, number, number, number, number]> = [
    ['Chest', 14, 10, 12, 22],
    ['Back', 18, 10, 14, 25],
    ['Shoulders', 10, 8, 12, 20],
    ['Quads', 18, 8, 12, 20],
    ['Hamstrings', 9, 6, 10, 16],
    ['Arms', 14, 6, 10, 20],
  ]
  const imBand = muskeln.filter(([, ist, , mev, mrv]) => ist >= mev && ist <= mrv).length
  const unterMev = muskeln.filter(([, ist, , mev]) => ist < mev).length
  const ueberMrv = muskeln.filter(([, ist, , , mrv]) => ist > mrv).length
  return (
    <>
      <ReferenzTrenner reiter="Volume landmarks" quelle={QUELLE_SPEC2} />
      <div className="v2-grid v2-g-cols-4" style={{ gap: 10, marginBottom: 14 }}>
        {([
          ['In MEV–MRV band', String(imBand), 'von 6 Gruppen', 'var(--pos)'],
          ['Below MEV', String(unterMev), 'zu wenig Reiz', 'var(--warn)'],
          ['Over MRV', String(ueberMrv), 'ueber der Grenze', 'var(--neg)'],
          ['Push : Pull ratio', '0.86', 'Ziel 0.8 – 1.2', undefined],
        ] as Array<[string, string, string, string | undefined]>).map(([l, v, s, c]) => (
          <Card key={l} className="v2-card-tight" style={{ padding: 13 }}
                attrappe={markeVon(QUELLE_SPEC2)}>
            <div className="v2-eyebrow" style={{ marginBottom: 4 }}>{l}</div>
            <div className="v2-num" style={{ fontSize: 19, fontWeight: 500, color: c }}>
              {v}
            </div>
            <div className="v2-dim" style={{ fontSize: 10.5 }}>{s}</div>
          </Card>
        ))}
      </div>

      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="Volume landmarks · sets per week"
              sub="MEV bis MRV je Muskelgruppe" attrappe={markeVon(QUELLE_SPEC2)}>
          <div className="v2-col-gap" style={{ gap: 9 }}>
            {muskeln.map(([m, ist, mv, mev, mrv]) => (
              <div key={m} style={{
                display: 'grid', gridTemplateColumns: '96px 1fr 76px',
                gap: 10, alignItems: 'center', fontSize: 11,
              }}>
                <span style={{ color: 'var(--fg-muted)' }}>{m}</span>
                <div style={{
                  position: 'relative', height: 16,
                  background: 'var(--surface-2)', borderRadius: 3,
                }}>
                  {/* das MEV-MRV-Band */}
                  <div style={{
                    position: 'absolute', top: 0, bottom: 0,
                    left: `${(mev / 30) * 100}%`,
                    width: `${((mrv - mev) / 30) * 100}%`,
                    background: 'color-mix(in oklch, var(--pos) 18%, transparent)',
                    borderRadius: 2,
                  }} />
                  <div style={{
                    position: 'absolute', top: 3, bottom: 3, left: 0,
                    width: `${(ist / 30) * 100}%`,
                    background: ist < mev ? 'var(--warn)'
                      : ist > mrv ? 'var(--neg)' : 'var(--acc-train)',
                    borderRadius: 2, opacity: 0.85,
                  }} />
                </div>
                <span className="v2-num" style={{ textAlign: 'right', fontSize: 10.5 }}>
                  {ist} · {mv}/{mev}/{mrv}
                </span>
              </div>
            ))}
          </div>
          <div className="v2-divider" />
          <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.5 }}>
            Balken: geleistete Saetze. Gruenes Band: MEV bis MRV. Die
            Zahlen rechts sind MV / MEV / MRV. `[cmd]` C-105: MAV ist
            entfernt, MEV ist Richtungshinweis, MRV Heuristik.
          </div>
        </Card>

        <Card title="Feedback loop" sub="wie sich die Grenzen anpassen"
              attrappe={markeVon(QUELLE_SPEC2)}>
          {([
            ['1', 'Satz erfasst', 'Volumen je Muskel steigt'],
            ['2', 'Rueckmeldung nach der Einheit', 'Pump, Kater, Leistung'],
            ['3', 'Grenze verschiebt sich', 'MEV hoch bei wenig Reiz, MRV runter bei Kater'],
            ['4', 'Naechste Woche', 'Vorgabe folgt der neuen Grenze'],
          ] as Array<[string, string, string]>).map(([r, was, wirkung]) => (
            <div key={r} style={{
              display: 'grid', gridTemplateColumns: '24px 200px 1fr',
              gap: 10, alignItems: 'center', fontSize: 11.5, padding: '7px 0',
            }}>
              <span className="v2-num v2-dim">{r}</span>
              <span style={{ fontWeight: 600 }}>{was}</span>
              <span className="v2-dim">{wirkung}</span>
            </div>
          ))}
        </Card>

        <Card title="Post-workout feedback" sub="was nach der Einheit gefragt wird"
              attrappe={markeVon(QUELLE_SPEC2)}>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {['Pump 1-3', 'Muskelkater 0-3', 'Leistung gehalten',
              'Gelenke ok', 'Ermuedung 1-5'].map(f => <Pill key={f}>{f}</Pill>)}
          </div>
        </Card>
      </div>
    </>
  )
}

/** `hrzones` — `TrainingHRAnalysis`, 3 Kacheln plus Kopfzeile. */
export function TrainingHRReferenz() {
  const gesamt = HR_ZONES.reduce((s, z) => s + z.min, 0)
  const schnitt = Math.round(HR_SETS.reduce((s, x) => s + x.avg, 0) / HR_SETS.length)
  const spitze = Math.max(...HR_SETS.map(x => x.peak))
  const abfall = Math.round(HR_SETS.reduce((s, x) => s + x.drop60, 0) / HR_SETS.length)
  return (
    <>
      <ReferenzTrenner reiter="HR zones" quelle={QUELLE_HR} />
      <div className="v2-grid v2-g-cols-4" style={{ gap: 10, marginBottom: 14 }}>
        {([
          ['Session duration', `${gesamt} min`, 'Push B · 16 May'],
          ['Average HR', `${schnitt} bpm`, `${Math.round(schnitt / HR_MAX * 100)}% of max`],
          ['Peak HR', `${spitze} bpm`, `${Math.round(spitze / HR_MAX * 100)}% · set 5`],
          ['60s recovery', `-${abfall} bpm`,
           abfall >= 25 ? 'good autonomic recovery' : 'declining across session'],
        ] as Array<[string, string, string]>).map(([l, v, s]) => (
          <Card key={l} className="v2-card-tight" style={{ padding: 13 }}
                attrappe={markeVon(QUELLE_HR)}>
            <div className="v2-eyebrow" style={{ marginBottom: 4 }}>{l}</div>
            <div className="v2-num" style={{ fontSize: 19, fontWeight: 500, marginBottom: 3 }}>
              {v}
            </div>
            <div className="v2-dim" style={{ fontSize: 10.5 }}>{s}</div>
          </Card>
        ))}
      </div>

      <div className="v2-grid" style={{ gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
        <Card title="Time in zone" sub={`${gesamt} minutes total · Polar H10`}
              attrappe={markeVon(QUELLE_HR)}>
          <div style={{
            display: 'flex', height: 30, borderRadius: 7, overflow: 'hidden',
            border: '1px solid var(--border)', marginBottom: 14,
          }}>
            {HR_ZONES.map(z => (
              <div key={z.z} style={{
                flex: z.min, background: z.color, opacity: 0.6,
                display: 'grid', placeItems: 'center', fontSize: 10,
                fontFamily: 'var(--font-mono)',
              }}>{z.min > 8 ? `Z${z.z}` : ''}</div>
            ))}
          </div>
          <div className="v2-col-gap" style={{ gap: 9 }}>
            {HR_ZONES.map(z => (
              <div key={z.z} style={{
                display: 'grid', gridTemplateColumns: '22px 100px 1fr 52px 46px',
                gap: 10, alignItems: 'center',
              }}>
                <span style={{
                  width: 18, height: 18, borderRadius: 5, background: z.color,
                  opacity: 0.65, display: 'grid', placeItems: 'center',
                  fontSize: 9.5, fontFamily: 'var(--font-mono)', fontWeight: 600,
                }}>{z.z}</span>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 500 }}>{z.name}</div>
                  <div className="v2-dim v2-mono" style={{ fontSize: 9.5 }}>
                    {Math.round(z.lo * HR_MAX)}–{Math.round(z.hi * HR_MAX)} bpm
                  </div>
                </div>
                <div style={{ height: 5, background: 'var(--surface-2)', borderRadius: 999 }}>
                  <div style={{
                    height: '100%', width: `${(z.min / gesamt) * 100}%`,
                    background: z.color, borderRadius: 999,
                  }} />
                </div>
                <span className="v2-num" style={{ textAlign: 'right', fontSize: 11.5 }}>
                  {z.min} min
                </span>
                <span className="v2-num v2-dim" style={{ textAlign: 'right', fontSize: 10.5 }}>
                  {Math.round((z.min / gesamt) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Per-set response" sub="peak, average, and 60-second recovery"
              attrappe={markeVon(QUELLE_HR)}>
          <div style={{ overflowX: 'auto' }}>
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th>Set</th>
                  <th style={{ width: 58, textAlign: 'right' }}>Peak</th>
                  <th style={{ width: 58, textAlign: 'right' }}>Avg</th>
                  <th style={{ width: 74, textAlign: 'right' }}>60s drop</th>
                  <th style={{ width: 40 }}>Zone</th>
                </tr>
              </thead>
              <tbody>
                {HR_SETS.map(s => {
                  const z = HR_ZONES.find(x => x.z === s.zone)
                  const schwach = s.drop60 < 20
                  return (
                    <tr key={s.set}>
                      <td style={{ fontSize: 11.5 }}>{s.set}</td>
                      <td className="v2-num" style={{
                        textAlign: 'right',
                        color: s.peak > 160 ? 'var(--warn)' : 'var(--fg)',
                      }}>{s.peak}</td>
                      <td className="v2-num v2-muted" style={{ textAlign: 'right' }}>
                        {s.avg}
                      </td>
                      <td className="v2-num" style={{
                        textAlign: 'right',
                        color: schwach ? 'var(--warn)' : 'var(--pos)',
                      }}>-{s.drop60}</td>
                      <td>
                        <span style={{
                          width: 16, height: 16, borderRadius: 4,
                          background: z?.color, opacity: 0.65,
                          display: 'grid', placeItems: 'center',
                          fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 600,
                        }}>{s.zone}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  )
}

/** `offline` — `TrainingOfflineView`, 5 Kacheln. */
export function TrainingOfflineReferenz() {
  return (
    <>
      <ReferenzTrenner reiter="Offline sync" quelle={QUELLE_HR} />
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="Outbox" sub={`${OUTBOX.length} Vorgaenge in der Warteschlange`}
              attrappe={markeVon(QUELLE_HR)}>
          <div style={{ overflowX: 'auto' }}>
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th style={{ width: 90 }}>ID</th>
                  <th style={{ width: 70 }}>Op</th>
                  <th style={{ width: 90 }}>Store</th>
                  <th>Nutzlast</th>
                  <th style={{ width: 90 }}>Wartet</th>
                  <th style={{ width: 90 }}>Stand</th>
                </tr>
              </thead>
              <tbody>
                {OUTBOX.map(o => (
                  <tr key={o.id}>
                    <td className="v2-num v2-dim">{o.id}</td>
                    <td><Pill>{o.op}</Pill></td>
                    <td className="v2-mono v2-dim" style={{ fontSize: 10.5 }}>{o.store}</td>
                    <td className="v2-muted" style={{ fontSize: 11 }}>{o.payload}</td>
                    <td className="v2-num v2-dim">{o.queued}</td>
                    <td>
                      <Pill variant={o.status === 'retrying' ? 'warn' : undefined}>
                        {o.status}{o.tries > 0 ? ` · ${o.tries}` : ''}
                      </Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Sync log" sub={`${SYNC_LOG.length} Eintraege`}
              attrappe={markeVon(QUELLE_HR)}>
          <div className="v2-col-gap" style={{ gap: 5 }}>
            {SYNC_LOG.map(l => (
              <div key={l.at} style={{
                display: 'grid', gridTemplateColumns: '76px 170px 1fr',
                gap: 10, alignItems: 'baseline', fontSize: 11,
                padding: '7px 9px', borderRadius: 5,
                background: l.kind === 'warn'
                  ? 'color-mix(in oklch, var(--warn) 5%, var(--surface))'
                  : 'var(--surface)',
                border: `1px solid ${l.kind === 'warn'
                  ? 'color-mix(in oklch, var(--warn) 22%, var(--border))'
                  : 'var(--border)'}`,
              }}>
                <span className="v2-num v2-dim">{l.at}</span>
                <span style={{ fontWeight: 600 }}>{l.ev}</span>
                <span className="v2-dim">{l.detail}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="IndexedDB" sub="was lokal liegt" attrappe={markeVon(QUELLE_HR)}>
          <Row label="exercises" value="1.850 Zeilen · 12.4 MB" />
          <Row label="sessions" value="412 Zeilen · 1.1 MB" />
          <Row label="sets" value="9.821 Zeilen · 3.8 MB" />
          <Row label="outbox" value={`${OUTBOX.length} Vorgaenge`} />
        </Card>

        <Card title="Conflict resolution" sub="wer gewinnt bei Widerspruch"
              attrappe={markeVon(QUELLE_HR)}>
          <Row label="Saetze" value="lokal gewinnt" />
          <Row label="Dauer" value="Server gewinnt" />
          <Row label="Notizen" value="beide behalten, neuere oben" />
          <div className="v2-divider" />
          <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.5 }}>
            Beispiel aus dem Protokoll: session w_409 — Serverzeit war
            neuer, lokale Satzdaten behalten, Serverdauer uebernommen.
          </div>
        </Card>
      </div>
    </>
  )
}


/**
 * `standards` — `TrainingStandardsView`, 2 Kacheln.
 *
 * `[cmd]` **Tom, 2026-09-07:** *,,training/standards ... mockup nicht
 * vollstaendig."* — der Reiter hatte keine eigene Referenz; die Linie
 * zeigte auf den Entwurfsreiter selbst.
 */
export function TrainingStandardsReferenz() {
  const bw = 79.4
  const lifts: Array<[string, number, number[]]> = [
    ['Bench Press', 122.5, [0.75, 1.0, 1.25, 1.6, 2.0]],
    ['Squat', 165, [1.0, 1.35, 1.75, 2.2, 2.75]],
    ['Deadlift', 192, [1.25, 1.65, 2.1, 2.6, 3.2]],
    ['OHP', 72.5, [0.45, 0.65, 0.85, 1.1, 1.4]],
  ]
  const stufen = ['beg', 'nov', 'int', 'adv', 'eli']
  const einstufung = (r: number, s: number[]) =>
    r >= s[4]! ? ['Elite', 'var(--acc-buddy)']
      : r >= s[3]! ? ['Advanced', 'var(--pos)']
      : r >= s[2]! ? ['Intermediate', 'var(--acc-train)']
      : r >= s[1]! ? ['Novice', 'var(--warn)']
      : ['Beginner', 'var(--fg-dim)']
  const anteile: Array<[string, number, number]> = [
    ['adherence', 0.92, 0.40], ['landmarks', 0.60, 0.30],
    ['strength', 0.88, 0.20], ['balance', 0.94, 0.10],
  ]
  const wert = Math.round(anteile.reduce((s, [, v, g]) => s + v * g, 0) * 100)
  return (
    <>
      <ReferenzTrenner reiter="Standards" quelle={QUELLE_SPEC2} />
      <div className="v2-grid" style={{ gridTemplateColumns: '1.5fr 1fr', gap: 14 }}>
        <Card title="Strength standards"
              sub={`Brzycki e1RM / Koerpergewicht ${bw} kg`}
              attrappe={markeVon(QUELLE_SPEC2)}>
          <div className="v2-col-gap" style={{ gap: 12 }}>
            {lifts.map(([name, e1rm, std]) => {
              const r = +(e1rm / bw).toFixed(2)
              const [label, farbe] = einstufung(r, std)
              const max = std[4]! * 1.1
              return (
                <div key={name}>
                  <div style={{
                    display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6,
                  }}>
                    <span style={{ fontSize: 12.5, fontWeight: 500, width: 110 }}>
                      {name}
                    </span>
                    <span className="v2-num" style={{ fontSize: 13 }}>{e1rm} kg</span>
                    <span className="v2-dim v2-mono" style={{ fontSize: 10.5 }}>
                      {r}x BW
                    </span>
                    <Pill style={{
                      marginLeft: 'auto', fontSize: 9.5, color: farbe,
                      borderColor: `color-mix(in oklch, ${farbe} 35%, var(--border))`,
                    }}>{label}</Pill>
                  </div>
                  <div style={{
                    position: 'relative', height: 18,
                    background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden',
                  }}>
                    {std.map((v, si) => (
                      <div key={stufen[si]} style={{
                        position: 'absolute', left: `${(v / max) * 100}%`,
                        top: 0, bottom: 0, width: 1, background: 'var(--border-strong)',
                      }}>
                        <span className="v2-dim v2-mono" style={{
                          position: 'absolute', top: 3, left: 3,
                          fontSize: 8, whiteSpace: 'nowrap',
                        }}>{stufen[si]}</span>
                      </div>
                    ))}
                    <div style={{
                      position: 'absolute', left: 0, top: 4, height: 10,
                      width: `${(r / max) * 100}%`,
                      background: farbe, opacity: 0.8, borderRadius: 3,
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card title="Training score" sub="exported to Goals"
              attrappe={markeVon(QUELLE_SPEC2)}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12,
          }}>
            <Ring value={wert} max={100} color="var(--acc-train)"
                  label="score" size={88} stroke={7} />
            <div className="v2-dim v2-mono" style={{ fontSize: 10.5, lineHeight: 1.7 }}>
              {anteile.map(([l, v, g]) => (
                <div key={l}>{l} {v.toFixed(2)} x {g.toFixed(2)}</div>
              ))}
            </div>
          </div>
          <Row label="Session adherence" value="22 of 24" />
          <Row label="Volume in landmarks" value="6 of 10 groups" />
          <Row label="Strength trend" value="+4.2% · 12 wk" />
          <Row label="Muscle balance" value="Push:Pull 1.05" />
        </Card>
      </div>
    </>
  )
}
