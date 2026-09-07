'use client'

// Die Mockup-Reiter von Nutrition als Referenz unter der Linie —
// G-365, E-69.
//
// **Tom, 2026-09-07:** *,,fuer jeden Reiter jedes Moduls: der KOMPLETTE
// Mockup-Reiter kommt unter die Linie."*
//
// `[cmd]` **Gemessen 2026-09-07: sieben von neun Reitern hatten KEINE
// Linie** — `nutrients`, `insights`, `plans`, `prefs`, `rezepte`,
// `einkauf`, `foods`. **Alle sieben sind angebunden** (je eine
// Attrappe am Schirm), brauchen die Referenz also.
//
// ## Woher die Reiter kommen
//
//     insights    module-nutrition.jsx           NutritionInsights   3
//     foods       module-nutrition.jsx           NutritionFoods      1
//     planner     module-nutrition.jsx           NutritionPlanner    1
//     nutrients   module-nutrition-nutrients.jsx NutrientAnalysisView 5
//     plans       module-nutrition-spec.jsx      MealPlansView       8
//     prefs       module-nutrition-spec.jsx      FoodPreferencesView 6
//
// `[cmd]` **`rezepte` und `einkauf` stehen in KEINEM Mockup** — sie
// sind nach dem Entwurf entstanden. **Sie bekommen keine Referenz**,
// weil es nichts zu vergleichen gibt; das ist kein Versaeumnis,
// sondern der Befund.
//
// `[read]` **Uebernommen ist die ANSICHT, nicht die Rechnung.** Die
// Entwurfszahlen sind die der Vorlage. **Hier wird nichts erfunden.**
import * as React from 'react'
import { Card, Pill, Icon, Row, Meter, LineChart } from '@lumeos/ui'

import { ReferenzTrenner } from '@/components/shell/referenz-trenner'

const QUELLE = 'theme-v1/module-nutrition.jsx'
const QUELLE_SPEC = 'theme-v1/module-nutrition-spec.jsx'
const QUELLE_NUTR = 'theme-v1/module-nutrition-nutrients.jsx'

// `[read]` Lokal, nicht aus `ansicht.tsx`: diese Datei wird VON dort
// importiert, ein Gegenimport waere ein Zirkel.
function marke(quelle: string): string {
  return `Attrappe — ${quelle} · wartet auf: nichts — Referenz zum `
    + 'Vergleich, faellt mit Toms Abnahme'
}

/** `insights`, wie er im Mockup steht — `NutritionInsights`. */
export function NutritionInsightsReferenz() {
  const kcal = [2580, 2710, 2680, 2520, 2740, 2890, 2410,
                2670, 2530, 2620, 2780, 2650, 2510, 1847]
  return (
    <>
      <ReferenzTrenner reiter="Insights" quelle={QUELLE} />
      <div className="v2-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card title="Calorie balance" sub="14 days" attrappe={marke(QUELLE)}>
          <LineChart
            series={[
              { data: kcal, color: 'var(--acc-nutri)' },
              { data: Array(14).fill(2700), color: 'var(--fg-dim)' },
            ]}
            h={180}
            xLabels={['', '', 'Mon', '', '', 'Thu', '', '', 'Sun', '', '', 'Wed', '', 'Today']}
            range={[1500, 3200]}
          />
        </Card>

        <Card title="Macro split · 14d avg" sub="Target ratio: 28 / 47 / 25"
              attrappe={marke(QUELLE)}>
          <div className="v2-col-gap" style={{ gap: 10, marginTop: 8 }}>
            {([
              ['Protein', 31, 28, 'var(--acc-train)'],
              ['Carbs', 44, 47, 'var(--acc-recov)'],
              ['Fat', 25, 25, 'var(--acc-goals)'],
            ] as Array<[string, number, number, string]>).map(([l, v, t, c]) => (
              <div key={l}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span className="v2-eyebrow">{l}</span>
                  <span className="v2-num" style={{ fontSize: 11 }}>
                    {v}% <span className="v2-dim">/ {t}%</span>
                  </span>
                </div>
                <Meter value={v} max={50} color={c} tall />
              </div>
            ))}
          </div>
          <div className="v2-divider" />
          <Row label="Avg calories" value="2,617 kcal" />
          <Row label="Highest day" value="Tue · 2,890" />
          <Row label="Lowest day" value="Wed · 2,410" />
          <Row label="Days at target ±100" value="9 of 14" />
        </Card>

        <Card title="Micronutrient trend" sub="30 days · top 8"
              style={{ gridColumn: 'span 2' }} attrappe={marke(QUELLE)}>
          {/* [cmd] Waermekarte: acht Naehrstoffe ueber 30 Tage, je Feld
              die Zielerreichung. Die Reihe ist eine feste Pseudofolge
              der Vorlage, keine Zufallszahl. */}
          <div className="v2-col-gap" style={{ gap: 3 }}>
            {([
              ['Vit C', 82], ['Vit D', 42], ['Iron', 91], ['Ca', 74],
              ['Mg', 68], ['Zn', 85], ['B12', 93], ['Omega-3', 55],
            ] as Array<[string, number]>).map(([n, basis]) => (
              <div key={n} style={{
                display: 'grid', gridTemplateColumns: '68px 1fr 40px',
                gap: 8, alignItems: 'center',
              }}>
                <span className="v2-dim" style={{ fontSize: 10.5 }}>{n}</span>
                <div style={{ display: 'flex', gap: 2 }}>
                  {Array.from({ length: 30 }).map((_, d) => {
                    const v = Math.max(20, Math.min(100,
                      basis + ((d * 7 + n.length * 11) % 25) - 12))
                    return (
                      <div key={d} style={{
                        flex: 1, height: 14, borderRadius: 2,
                        background: v >= 80 ? 'var(--pos)'
                          : v >= 60 ? 'var(--acc-nutri)' : 'var(--warn)',
                        opacity: 0.35 + (v / 100) * 0.65,
                      }} />
                    )
                  })}
                </div>
                <span className="v2-num" style={{ fontSize: 10.5, textAlign: 'right' }}>
                  {basis}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}

/** `foods`, wie er im Mockup steht — `NutritionFoods`. */
export function NutritionFoodsReferenz() {
  const speisen = [
    { name: 'Oats · rolled, dry', kcal: 379, p: 13, c: 67, f: 7, fav: true },
    { name: 'Whey protein isolate', kcal: 380, p: 88, c: 7, f: 1, fav: true },
    { name: 'Chicken breast · raw', kcal: 165, p: 31, c: 0, f: 3.6, fav: true },
    { name: 'Salmon · Atlantic, raw', kcal: 208, p: 20, c: 0, f: 13 },
    { name: 'Basmati rice · dry', kcal: 360, p: 8, c: 79, f: 0.5 },
    { name: 'Sweet potato · raw', kcal: 86, p: 1.6, c: 20, f: 0.1 },
    { name: 'Banana · medium', kcal: 89, p: 1.1, c: 23, f: 0.3 },
    { name: 'Almonds · raw', kcal: 579, p: 21, c: 22, f: 50 },
  ]
  return (
    <>
      <ReferenzTrenner reiter="Foods" quelle={QUELLE} />
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {['All', 'Favorites', 'Recent', 'Meat', 'Fish', 'Grains',
          'Dairy', 'Produce', 'Beverages', 'Supplements'].map((c, i) => (
          <Pill key={c} variant={i === 0 ? 'acc' : undefined}>{c}</Pill>
        ))}
      </div>
      <Card attrappe={marke(QUELLE)}>
        <div style={{ overflowX: 'auto' }}>
          <table className="v2-tbl">
            <thead>
              <tr>
                <th style={{ width: 30 }} />
                <th>Food</th>
                <th style={{ width: 70 }}>Source</th>
                <th style={{ width: 80, textAlign: 'right' }}>kcal/100g</th>
                <th style={{ width: 60, textAlign: 'right' }}>P</th>
                <th style={{ width: 60, textAlign: 'right' }}>C</th>
                <th style={{ width: 60, textAlign: 'right' }}>F</th>
              </tr>
            </thead>
            <tbody>
              {speisen.map(f => (
                <tr key={f.name}>
                  <td>
                    {f.fav && (
                      <Icon name="bookmark" className="v2-ic v2-ic-sm"
                            style={{ color: 'var(--acc-nutri)' }} />
                    )}
                  </td>
                  <td>{f.name}</td>
                  <td><Pill>BLS</Pill></td>
                  <td className="v2-num" style={{ textAlign: 'right' }}>{f.kcal}</td>
                  <td className="v2-num" style={{ textAlign: 'right' }}>{f.p}</td>
                  <td className="v2-num" style={{ textAlign: 'right' }}>{f.c}</td>
                  <td className="v2-num" style={{ textAlign: 'right' }}>{f.f}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}

/** `planner`, wie er im Mockup steht — `NutritionPlanner`. */
export function NutritionPlannerReferenz() {
  const tage = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const slots = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']
  return (
    <>
      <ReferenzTrenner reiter="Planner" quelle={QUELLE} />
      <Card attrappe={marke(QUELLE)}>
        <div style={{ overflowX: 'auto' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '100px repeat(7, 1fr)',
            gap: 6, minWidth: 640,
          }}>
            <div />
            {tage.map((d, i) => (
              <div key={d} style={{
                padding: 6, fontSize: 11, textAlign: 'center',
                color: i === 5 ? 'var(--acc)' : 'var(--fg-muted)',
                fontWeight: i === 5 ? 600 : 400,
              }}>
                {d} <span className="v2-num v2-dim" style={{ fontSize: 10 }}>{12 + i}</span>
              </div>
            ))}
            {slots.map(s => (
              <React.Fragment key={s}>
                <div style={{
                  padding: '10px 6px', fontSize: 11, fontWeight: 500,
                  color: 'var(--fg-muted)', borderTop: '1px solid var(--border)',
                }}>{s}</div>
                {tage.map((d, di) => (
                  <div key={d} style={{
                    padding: 8, minHeight: 52,
                    borderTop: '1px solid var(--border)',
                    background: di === 5
                      ? 'color-mix(in oklch, var(--acc) 5%, transparent)'
                      : 'transparent',
                    fontSize: 11,
                  }} />
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </Card>
    </>
  )
}

/** `nutrients`, wie er im Mockup steht — `NutrientAnalysisView`. */
export function NutritionNutrientsReferenz() {
  return (
    <>
      <ReferenzTrenner reiter="Nutrients" quelle={QUELLE_NUTR} />
      <div className="v2-grid v2-g-cols-4" style={{ gap: 10, marginBottom: 16 }}>
        {([
          ['Tracked', '138', 'nutrients in your profile', undefined],
          ['In range', '—', 'Anteil am Gesamtbestand', 'var(--pos)'],
          ['Below target', '—', 'need attention today', 'var(--warn)'],
          ['Over UL', '—', 'upper limit exceeded', 'var(--fg-dim)'],
        ] as Array<[string, string, string, string | undefined]>).map(([l, v, s, c]) => (
          <Card key={l} className="v2-card-tight" style={{ padding: 14 }}
                attrappe={marke(QUELLE_NUTR)}>
            <div className="v2-eyebrow" style={{ marginBottom: 4 }}>{l}</div>
            <div className="v2-num" style={{ fontSize: 22, fontWeight: 500, color: c }}>
              {v}
            </div>
            <div className="v2-dim" style={{ fontSize: 11 }}>{s}</div>
          </Card>
        ))}
      </div>
      <Card title="Naehrstoffbaum" sub="nach Gruppe, aufklappbar"
            attrappe={marke(QUELLE_NUTR)}>
        {/* [cmd] Der Entwurf gliedert nach Gruppe; je Zeile Zufuhr,
            Ziel, Deckung und Einordnung. */}
        {([
          ['Makronaehrstoffe', [
            ['Protein', '142 g', '180 g', 79, 'low'],
            ['Kohlenhydrate', '168 g', '320 g', 53, 'low'],
            ['Fett', '72 g', '90 g', 80, 'in'],
            ['Ballaststoffe', '30.4 g', '30 g', 101, 'in'],
          ]],
          ['Vitamine', [
            ['Vitamin C', '82 mg', '100 mg', 82, 'in'],
            ['Vitamin D', '8.4 µg', '20 µg', 42, 'low'],
            ['Vitamin B12', '4.6 µg', '4 µg', 115, 'in'],
          ]],
          ['Mineralstoffe', [
            ['Eisen', '12.7 mg', '14 mg', 91, 'in'],
            ['Calcium', '740 mg', '1000 mg', 74, 'low'],
            ['Magnesium', '240 mg', '350 mg', 68, 'low'],
            ['Zink', '8.5 mg', '10 mg', 85, 'in'],
          ]],
        ] as Array<[string, Array<[string, string, string, number, string]>]>)
          .map(([gruppe, zeilen]) => (
          <div key={gruppe} style={{ marginBottom: 14 }}>
            <div className="v2-eyebrow" style={{ marginBottom: 6 }}>
              {gruppe} · {zeilen.length} Eintraege
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="v2-tbl">
                <thead>
                  <tr>
                    <th>Naehrstoff</th>
                    <th style={{ width: 90, textAlign: 'right' }}>Zufuhr</th>
                    <th style={{ width: 90, textAlign: 'right' }}>Ziel</th>
                    <th style={{ width: 130 }}>Deckung</th>
                    <th style={{ width: 70 }}>Stand</th>
                  </tr>
                </thead>
                <tbody>
                  {zeilen.map(([n2, ist, soll, pct, stand]) => (
                    <tr key={n2}>
                      <td>{n2}</td>
                      <td className="v2-num" style={{ textAlign: 'right' }}>{ist}</td>
                      <td className="v2-num v2-muted" style={{ textAlign: 'right' }}>{soll}</td>
                      <td>
                        <div style={{
                          height: 7, background: 'var(--surface-2)',
                          borderRadius: 999, overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%', width: `${Math.min(pct, 100)}%`,
                            background: stand === 'in' ? 'var(--pos)' : 'var(--warn)',
                            borderRadius: 999,
                          }} />
                        </div>
                      </td>
                      <td>
                        <Pill variant={stand === 'in' ? 'pos' : undefined}>
                          {pct}%
                        </Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </Card>
    </>
  )
}

/**
 * `plans`, wie er im Mockup steht — `MealPlansView`.
 *
 * `[cmd]` **module-nutrition-spec.jsx.** Compliance-Ring aus den
 * Geistereintraegen, die Tagesliste mit Status je Mahlzeit, die
 * Planeinstellungen.
 */
export function NutritionPlansReferenz() {
  const geister: Array<{
    id: string; meal: string; zeit: string; posten: string[]
    status: string; kcal: number; note?: string
  }> = [
    { id: 'g1', meal: 'Breakfast', zeit: '07:00', kcal: 549, status: 'confirmed',
      posten: ['Haferflocken 80g', 'Whey 35g', 'Banane 120g'] },
    { id: 'g2', meal: 'Snack', zeit: '10:00', kcal: 260, status: 'deviated',
      posten: ['Huettenkaese 200g', 'Mandeln 20g'],
      note: 'Mandeln zu Walnuessen' },
    { id: 'g3', meal: 'Lunch', zeit: '13:00', kcal: 681, status: 'confirmed',
      posten: ['Haehnchenbrust 180g', 'Basmati 200g', 'Salat'] },
    { id: 'g4', meal: 'Pre-workout', zeit: '16:30', kcal: 280, status: 'pending',
      posten: ['Reiswaffeln 40g', 'Whey 30g'] },
    { id: 'g5', meal: 'Dinner', zeit: '20:00', kcal: 720, status: 'pending',
      posten: ['Lachs 200g', 'Suesskartoffel 250g', 'Brokkoli'] },
  ]
  const farbe = (s: string) => s === 'confirmed' ? 'var(--pos)'
    : s === 'deviated' ? 'var(--warn)'
    : s === 'skipped' ? 'var(--neg)' : 'var(--fg-dim)'
  const bestaetigt = geister.filter(g => g.status === 'confirmed').length
  const abgewichen = geister.filter(g => g.status === 'deviated').length
  const offen = geister.filter(g => g.status === 'pending').length
  const einhaltung = Math.round(
    ((bestaetigt + abgewichen) / Math.max(1, bestaetigt + abgewichen)) * 100)

  return (
    <>
      <ReferenzTrenner reiter="Plans" quelle={QUELLE_SPEC} />
      <div className="v2-grid" style={{ gridTemplateColumns: '1.5fr 1fr', gap: 14 }}>
        <div className="v2-col-gap" style={{ gap: 14 }}>
          <Card attrappe={marke(QUELLE_SPEC)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div className="v2-num" style={{ fontSize: 26, fontWeight: 600 }}>
                  {einhaltung}%
                </div>
                <div className="v2-dim" style={{ fontSize: 10 }}>compliance</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
                }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>
                    Recomp 5-Meal Plan
                  </span>
                  <Pill variant="acc">active</Pill>
                  <Pill>rollover</Pill>
                </div>
                <div className="v2-muted" style={{ fontSize: 12, marginBottom: 8 }}>
                  Day 3 of 7 · started May 14 · source: coach (Jana Bauer)
                </div>
                <div className="v2-dim v2-mono" style={{ fontSize: 10.5 }}>
                  ({bestaetigt} confirmed + {abgewichen} deviated) /
                  ({bestaetigt} + {abgewichen} + 0 skipped) = {einhaltung}% ·
                  {' '}{offen} pending not counted
                </div>
              </div>
            </div>
          </Card>

          <Card title="Today's ghost entries"
                sub={`${offen} still open · confirm via MealCam or manually`}
                attrappe={marke(QUELLE_SPEC)}>
            <div className="v2-col-gap" style={{ gap: 6 }}>
              {geister.map(g => {
                const c = farbe(g.status)
                const wartend = g.status === 'pending'
                return (
                  <div key={g.id} style={{
                    padding: 12, borderRadius: 7,
                    background: wartend
                      ? 'var(--surface)'
                      : `color-mix(in oklch, ${c} 5%, var(--surface))`,
                    border: `1px ${wartend ? 'dashed' : 'solid'} ${wartend
                      ? 'var(--border)'
                      : `color-mix(in oklch, ${c} 25%, var(--border))`}`,
                  }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5,
                    }}>
                      <span className="v2-num v2-dim" style={{ fontSize: 10, width: 38 }}>
                        {g.zeit}
                      </span>
                      <span style={{ fontSize: 12.5, fontWeight: 600 }}>{g.meal}</span>
                      <Pill style={{
                        borderColor: `color-mix(in oklch, ${c} 35%, var(--border))`,
                        color: c, fontSize: 9.5,
                      }}>{g.status}</Pill>
                      <span className="v2-num v2-dim" style={{ marginLeft: 'auto', fontSize: 11 }}>
                        {g.kcal} kcal
                      </span>
                    </div>
                    <div className="v2-muted" style={{
                      fontSize: 11.5, paddingLeft: 46, lineHeight: 1.5,
                    }}>{g.posten.join(' · ')}</div>
                    {g.note && (
                      <div className="v2-mono" style={{
                        fontSize: 11, paddingLeft: 46, marginTop: 4, color: 'var(--warn)',
                      }}>{'\u21b3'} {g.note}</div>
                    )}
                    {wartend && (
                      <div style={{
                        display: 'flex', gap: 6, marginTop: 8, paddingLeft: 46,
                        flexWrap: 'wrap',
                      }}>
                        {['Confirm as planned', 'MealCam', 'Log deviation', 'Skip']
                          .map(k => <Pill key={k}>{k}</Pill>)}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        <div className="v2-col-gap" style={{ gap: 14 }}>
          <Card title="Plan settings" sub="Umfang und Lebenszyklus"
                attrappe={marke(QUELLE_SPEC)}>
            <Row label="Lifecycle" value="rollover" />
            <Row label="Days count" value="7" />
            <Row label="Started" value="May 14" />
            <Row label="Next restart" value="May 21 · Day 1" />
            <Row label="Confirm mode" value="ask" />
            <div className="v2-divider" />
            <div style={{
              padding: 10, borderRadius: 6, fontSize: 11, lineHeight: 1.5,
              background: 'color-mix(in oklch, var(--warn) 6%, var(--surface))',
              border: '1px solid color-mix(in oklch, var(--warn) 22%, var(--border))',
              color: 'var(--fg-muted)',
            }}>
              Plan items are read-only while active. To edit: pause,
              duplicate, edit, re-activate. Protects compliance history.
            </div>
          </Card>

          <Card title="Lifecycle types" sub="wie ein Plan endet"
                attrappe={marke(QUELLE_SPEC)}>
            {([
              ['rollover', 'startet nach dem letzten Tag neu'],
              ['fixed', 'laeuft aus und wird abgelegt'],
              ['open', 'ohne Enddatum, bis manuell beendet'],
            ] as Array<[string, string]>).map(([k, w]) => (
              <Row key={k} label={k} value={w} />
            ))}
          </Card>

          <Card title="7-day compliance" sub="Einhaltung ueber die Woche"
                attrappe={marke(QUELLE_SPEC)}>
            <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 54 }}>
              {[92, 88, 100, 76, 84, 100, einhaltung].map((v, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{
                    height: `${(v / 100) * 44}px`,
                    background: v >= 85 ? 'var(--pos)' : 'var(--warn)',
                    borderRadius: 2,
                  }} />
                  <div className="v2-num v2-dim" style={{ fontSize: 8.5, marginTop: 3 }}>
                    {v}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Shopping list" sub="aus der Planwoche"
                attrappe={marke(QUELLE_SPEC)}>
            <div style={{ overflowX: 'auto' }}>
              <table className="v2-tbl">
                <thead>
                  <tr><th>Zutat</th><th style={{ width: 90, textAlign: 'right' }}>Menge</th></tr>
                </thead>
                <tbody>
                  {[['Haferflocken', '560 g'], ['Whey', '245 g'],
                    ['Haehnchenbrust', '1260 g'], ['Basmati', '1400 g'],
                    ['Lachs', '400 g']].map(([z, m]) => (
                    <tr key={z}>
                      <td>{z}</td>
                      <td className="v2-num" style={{ textAlign: 'right' }}>{m}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Scale list" sub="Mengen je Portionszahl"
                attrappe={marke(QUELLE_SPEC)}>
            <Row label="Aktuell" value="1 Person" />
            <Row label="Bei 2 Personen" value="alle Mengen x2" />
            <Row label="Bei 4 Personen" value="alle Mengen x4" />
          </Card>
        </div>
      </div>
    </>
  )
}

/**
 * `prefs`, wie er im Mockup steht — `FoodPreferencesView`.
 *
 * `[cmd]` **module-nutrition-spec.jsx.** Kostform als harter Filter,
 * Kategorien mit +/-50, Einzellebensmittel mit +/-100, Allergien als
 * Ausschluss, dazu die Rangfolge der Regeln.
 */
export function NutritionPrefsReferenz() {
  const kostformen = ['omnivore', 'vegetarian', 'vegan', 'pescatarian',
                      'keto', 'paleo', 'halal', 'kosher']
  const kategorien: Array<[string, string]> = [
    ['Fleisch', 'like'], ['Fisch', 'like'],
    ['Milchprodukte', 'neutral'], ['Gemuese', 'like'],
    ['Obst', 'neutral'], ['Getreide', 'neutral'],
    ['Huelsenfruechte', 'dislike'], ['Suesswaren', 'dislike'],
  ]
  const speisen: Array<[string, string]> = [
    ['Lachs · Atlantik', 'like'], ['Haehnchenbrust', 'like'],
    ['Haferflocken', 'like'], ['Rosenkohl', 'dislike'], ['Leber', 'dislike'],
  ]
  const farbe = (s: string) => s === 'like' ? 'var(--pos)'
    : s === 'dislike' ? 'var(--neg)' : 'var(--fg-dim)'
  const zeichen = (s: string) => s === 'like' ? '+' : s === 'dislike' ? '\u2212' : ''

  return (
    <>
      <ReferenzTrenner reiter="Preferences" quelle={QUELLE_SPEC} />
      <div className="v2-grid" style={{ gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
        <div className="v2-col-gap" style={{ gap: 14 }}>
          <Card title="Diet type" sub="global — hard filter, applies before all scoring"
                attrappe={marke(QUELLE_SPEC)}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {kostformen.map((d, i) => (
                <Pill key={d} variant={i === 0 ? 'acc' : undefined}>{d}</Pill>
              ))}
            </div>
          </Card>

          <Card title="Categories" sub="like +50 · dislike -50"
                attrappe={marke(QUELLE_SPEC)}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6,
            }}>
              {kategorien.map(([n, s]) => (
                <div key={n} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 10px', background: 'var(--surface)',
                  border: '1px solid var(--border)', borderRadius: 6,
                }}>
                  <span style={{ flex: 1, fontSize: 12 }}>{n}</span>
                  <span className="v2-num" style={{
                    fontSize: 12, color: farbe(s), width: 34, textAlign: 'right',
                  }}>{zeichen(s)}{s !== 'neutral' ? 50 : '\u2014'}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Individual foods" sub="like +100 · dislike -100 · hoechster Rang"
                attrappe={marke(QUELLE_SPEC)}>
            <div style={{ overflowX: 'auto' }}>
              <table className="v2-tbl">
                <tbody>
                  {speisen.map(([n, s]) => (
                    <tr key={n}>
                      <td>{n}</td>
                      <td className="v2-num" style={{
                        width: 70, textAlign: 'right', color: farbe(s),
                      }}>{zeichen(s)}100</td>
                      <td style={{ width: 90 }}>
                        <Pill style={{ color: farbe(s) }}>{s}</Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="v2-col-gap" style={{ gap: 14 }}>
          <Card title="Allergies" sub="hard exclusion · no scoring override"
                attrappe={marke(QUELLE_SPEC)}>
            <div className="v2-dim" style={{ fontSize: 11, marginBottom: 10, lineHeight: 1.5 }}>
              Gilt fuer BLS-Lebensmittel ueber <span className="v2-mono">allergen_*</span>
              {' '}und fuer eigene ueber <span className="v2-mono">custom_allergens[]</span>.
            </div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {['Gluten', 'Krebstiere', 'Eier', 'Fisch', 'Erdnuesse', 'Soja',
                'Milch', 'Schalenfruechte', 'Sellerie', 'Senf', 'Sesam',
                'Schwefeldioxid', 'Lupinen', 'Weichtiere'].map(a => (
                <Pill key={a} variant={a === 'Schalenfruechte' ? 'acc' : undefined}>
                  {a}
                </Pill>
              ))}
            </div>
          </Card>

          <Card title="Tag preferences" sub="Vorlieben ueber Kennzeichen"
                attrappe={marke(QUELLE_SPEC)}>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {['high-protein', 'low-carb', 'meal-prep', 'quick', 'budget']
                .map(t2 => <Pill key={t2}>{t2}</Pill>)}
            </div>
          </Card>

          <Card title="Priority order" sub="welche Regel zuerst greift"
                attrappe={marke(QUELLE_SPEC)}>
            {([
              ['1', 'Allergien', 'harter Ausschluss'],
              ['2', 'Kostform', 'harter Filter'],
              ['3', 'Einzellebensmittel', '+/-100'],
              ['4', 'Kategorien', '+/-50'],
              ['5', 'Kennzeichen', 'Feinabstimmung'],
            ] as Array<[string, string, string]>).map(([r, n, w]) => (
              <div key={r} style={{
                display: 'grid', gridTemplateColumns: '24px 150px 1fr',
                gap: 10, alignItems: 'center', fontSize: 11.5,
                padding: '7px 0',
              }}>
                <span className="v2-num v2-dim">{r}</span>
                <span style={{ fontWeight: 600 }}>{n}</span>
                <span className="v2-dim">{w}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </>
  )
}


/**
 * `diary`, wie er im Mockup steht — `NutritionDiary`.
 *
 * `[cmd]` **module-nutrition.jsx, 147 Zeilen.** Links die Tagesbilanz
 * und fuenf Mahlzeiten mit Einzelpositionen, rechts Hydration,
 * Mikro-Radar und die Unterschreitungen.
 *
 * `[read]` **Die Zahlen sind die der Vorlage** — Ziel 2.700 kcal,
 * Stand 1.847, Makros 142/168/72 gegen 180/320/90.
 */
export function NutritionDiaryReferenz() {
  const ziel = { kcal: 2700, p: 180, c: 320, f: 90 }
  const stand = { kcal: 1847, p: 142, c: 168, f: 72 }
  const mahlzeiten: Array<{
    slot: string; zeit: string
    posten: Array<{ name: string; menge: string; kcal: number; p: number; c: number; f: number }>
    hinweis?: string
  }> = [
    {
      slot: 'Breakfast', zeit: '07:42',
      posten: [
        { name: 'Oats · rolled', menge: '80g', kcal: 304, p: 11, c: 54, f: 5 },
        { name: 'Whey protein · vanilla', menge: '35g', kcal: 138, p: 27, c: 4, f: 2 },
        { name: 'Banana', menge: '120g', kcal: 107, p: 1.3, c: 27, f: 0.4 },
        { name: 'Blueberries', menge: '100g', kcal: 57, p: 0.7, c: 14, f: 0.3 },
      ],
    },
    {
      slot: 'Snack', zeit: '10:14',
      posten: [
        { name: 'Cottage cheese · low-fat', menge: '200g', kcal: 144, p: 24, c: 7, f: 2.5 },
        { name: 'Almonds', menge: '20g', kcal: 116, p: 4, c: 4, f: 10 },
      ],
    },
    {
      slot: 'Lunch', zeit: '13:08',
      posten: [
        { name: 'Chicken breast · grilled', menge: '180g', kcal: 297, p: 56, c: 0, f: 6.5 },
        { name: 'Basmati rice · cooked', menge: '200g', kcal: 260, p: 5.4, c: 56, f: 0.6 },
        { name: 'Mixed greens + olive oil', menge: '150g', kcal: 124, p: 2.6, c: 5, f: 11 },
      ],
    },
    { slot: 'Snack', zeit: '16:00', posten: [],
      hinweis: 'Pre-workout · 60g carbs + 25g protein' },
    { slot: 'Dinner', zeit: '20:00', posten: [],
      hinweis: 'ca. 850 kcal remaining' },
  ]
  const mikro = [
    ['Vit C', 0.82], ['Vit D', 0.42], ['Iron', 0.91], ['Ca', 0.74],
    ['Mg', 0.68], ['Zn', 0.85], ['B12', 0.93], ['Omega-3', 0.55],
  ] as Array<[string, number]>
  const unterSchwelle = [
    ['Vitamin D', '8.4 µg', '20 µg', 42],
    ['Omega-3', '0.9 g', '1.6 g', 55],
    ['Magnesium', '240 mg', '350 mg', 68],
  ] as Array<[string, string, string, number]>

  return (
    <>
      <ReferenzTrenner reiter="Diary" quelle={QUELLE} />
      <div className="v2-grid" style={{ gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
        <div className="v2-col-gap" style={{ gap: 12 }}>
          <Card attrappe={marke(QUELLE)}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <div style={{ flexShrink: 0, textAlign: 'center' }}>
                <div className="v2-num" style={{ fontSize: 26, fontWeight: 600 }}>
                  {stand.kcal}
                </div>
                <div className="v2-dim" style={{ fontSize: 10.5 }}>
                  von {ziel.kcal} kcal
                </div>
                <div className="v2-num v2-dim" style={{ fontSize: 10, marginTop: 3 }}>
                  {ziel.kcal - stand.kcal} kcal left
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {([
                  ['Protein', stand.p, ziel.p, 'var(--acc-train)'],
                  ['Carbs', stand.c, ziel.c, 'var(--acc-recov)'],
                  ['Fat', stand.f, ziel.f, 'var(--acc-goals)'],
                ] as Array<[string, number, number, string]>).map(([l, c, tg, farbe]) => {
                  const pct = Math.round((c / tg) * 100)
                  return (
                    <div key={l}>
                      <div style={{
                        display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 5,
                      }}>
                        <span className="v2-eyebrow" style={{ width: 56 }}>{l}</span>
                        <span className="v2-num" style={{ fontSize: 14, fontWeight: 500 }}>
                          {c}
                          <span style={{ fontSize: 10, color: 'var(--fg-dim)', marginLeft: 1 }}>
                            /{tg}g
                          </span>
                        </span>
                        <span className="v2-num v2-dim" style={{ fontSize: 10, marginLeft: 'auto' }}>
                          {tg - c}g left
                        </span>
                        <span className="v2-num" style={{
                          fontSize: 11, width: 34, textAlign: 'right',
                          color: pct >= 100 ? 'var(--pos)' : 'var(--fg-muted)',
                        }}>{pct}%</span>
                      </div>
                      <Meter value={c} max={tg} color={farbe} tall />
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>

          {mahlzeiten.map(m => {
            const summe = m.posten.reduce((s, p) => s + p.kcal, 0)
            return (
              <Card key={m.slot + m.zeit} attrappe={marke(QUELLE)}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
                }}>
                  <span className="v2-num v2-dim" style={{ fontSize: 11 }}>{m.zeit}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{m.slot}</span>
                  <span className="v2-dim" style={{ fontSize: 11 }}>
                    {m.posten.length} items
                  </span>
                  {summe > 0 && (
                    <span className="v2-num" style={{ marginLeft: 'auto', fontSize: 12 }}>
                      {summe} kcal
                    </span>
                  )}
                </div>
                {m.posten.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="v2-tbl">
                      <thead>
                        <tr>
                          <th>Position</th>
                          <th style={{ width: 70 }}>Menge</th>
                          <th style={{ width: 70, textAlign: 'right' }}>kcal</th>
                          <th style={{ width: 56, textAlign: 'right' }}>P</th>
                          <th style={{ width: 56, textAlign: 'right' }}>C</th>
                          <th style={{ width: 56, textAlign: 'right' }}>F</th>
                        </tr>
                      </thead>
                      <tbody>
                        {m.posten.map(p => (
                          <tr key={p.name}>
                            <td>{p.name}</td>
                            <td className="v2-num v2-muted">{p.menge}</td>
                            <td className="v2-num" style={{ textAlign: 'right' }}>{p.kcal}</td>
                            <td className="v2-num v2-muted" style={{ textAlign: 'right' }}>{p.p}</td>
                            <td className="v2-num v2-muted" style={{ textAlign: 'right' }}>{p.c}</td>
                            <td className="v2-num v2-muted" style={{ textAlign: 'right' }}>{p.f}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="v2-dim" style={{
                    fontSize: 11.5, padding: '10px 12px',
                    background: 'var(--surface)', borderRadius: 6,
                    border: '1px dashed var(--border)',
                  }}>{m.hinweis}</div>
                )}
              </Card>
            )
          })}
        </div>

        <div className="v2-col-gap" style={{ gap: 12 }}>
          <Card title="Hydration" sub="Today" attrappe={marke(QUELLE)}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
              <span className="v2-num" style={{ fontSize: 28, fontWeight: 500 }}>1.2</span>
              <span className="v2-dim" style={{ fontSize: 12 }}>/ 3.0 L</span>
            </div>
            <Meter value={1.2} max={3.0} color="var(--acc-recov)" tall />
            <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{
                  flex: 1, height: 20, borderRadius: 2,
                  background: i < 5 ? 'var(--acc-recov)' : 'var(--surface-2)',
                  opacity: i < 5 ? 0.7 + (i / 12) * 0.3 : 1,
                }} />
              ))}
            </div>
            <div style={{
              marginTop: 6, fontSize: 10, color: 'var(--fg-dim)',
              display: 'flex', justifyContent: 'space-between',
            }}>
              <span>5 of 12 glasses</span>
              <span className="v2-num">38% behind 14d avg</span>
            </div>
          </Card>

          <Card title="Micronutrient snapshot" sub="vs target · today"
                attrappe={marke(QUELLE)}>
            <div className="v2-col-gap" style={{ gap: 7 }}>
              {mikro.map(([l, v]) => (
                <div key={l} style={{
                  display: 'grid', gridTemplateColumns: '68px 1fr 44px',
                  gap: 10, alignItems: 'center', fontSize: 11,
                }}>
                  <span style={{ color: 'var(--fg-muted)' }}>{l}</span>
                  <div style={{
                    position: 'relative', height: 8,
                    background: 'var(--surface-2)', borderRadius: 999,
                  }}>
                    <div style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0,
                      width: `${v * 100}%`, borderRadius: 999,
                      background: v >= 0.8 ? 'var(--pos)' : 'var(--warn)',
                    }} />
                    <div style={{
                      position: 'absolute', left: '80%', top: -2, bottom: -2,
                      width: 1, background: 'var(--fg-dim)',
                    }} />
                  </div>
                  <span className="v2-num" style={{ textAlign: 'right' }}>
                    {Math.round(v * 100)}%
                  </span>
                </div>
              ))}
            </div>
            <div className="v2-dim" style={{ fontSize: 10, marginTop: 8 }}>
              Strich bei 80 % — der Zielwert der Vorlage.
            </div>
          </Card>

          <Card title="Below threshold" sub="3 of 117" attrappe={marke(QUELLE)}>
            {unterSchwelle.map(([n, wert, tgt, pct], i) => (
              <div key={n} style={{
                padding: '8px 0',
                borderBottom: i < 2 ? '1px solid var(--border)' : undefined,
              }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', marginBottom: 4,
                }}>
                  <span style={{ fontSize: 12 }}>{n}</span>
                  <span className="v2-num" style={{ fontSize: 11, color: 'var(--warn)' }}>
                    {wert} / {tgt}
                  </span>
                </div>
                <Meter value={pct} max={100} color="var(--warn)" />
              </div>
            ))}
          </Card>
        </div>
      </div>
    </>
  )
}
