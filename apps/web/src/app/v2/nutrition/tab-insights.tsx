'use client'

// Der Insights-Tab des Nutrition-Moduls.
//
// QUELLE: theme-v1/module-nutrition.jsx, `NutritionInsights`
// (Zeile 357-399) und `NutrientHeatmap` (Zeile 400-439).
// Drei Kacheln: Calorie balance · Macro split · Micronutrient trend.
//
// GEAENDERT IST NUR DAS TECHNISCHE:
//   1. JSX ohne Typen -> TypeScript.
//   2. Klassen auf `v2-`-Praefix.
//   3. `window.NutritionHeatmapView` entfaellt — die Vorlage haengt dort
//      eine zweite Ansicht an, wenn sie geladen ist; sie liegt nicht vor.
//   4. **Die Zufallszahlen sind ersetzt.** Begruendung unten.
//
// `[cmd]` WARUM KEIN `Math.random()`: Die Vorlage wuerfelt die
// Heatmap bei jedem Rendern neu (Zeile 404-406). In Next.js rendert der
// Server einmal und der Browser noch einmal — mit `Math.random()`
// kommen zwei verschiedene Bilder heraus und React bricht die
// Hydration mit einer Fehlermeldung ab. Ersetzt durch eine feste
// Formel, die dieselbe Streuung (0 bis 1, Schwerpunkt um 0,55) und
// dieselbe Spannweite liefert, aber bei jedem Lauf dasselbe Bild.
// Das ist eine technische Anpassung, keine inhaltliche: die Vorlage
// nennt ihre Werte selbst „pseudo-stable data".
//
// `[cmd]` ALLES IST ATTRAPPE. Die Kurven sind die Zahlen der Vorlage,
// nicht die des Nutzers.
import * as React from 'react'
import { Card, Pill, Row, Meter, LineChart } from '@lumeos/ui'

const ATTRAPPE = 'Die Zahlen stammen aus der Vorlage — die Auswertung rechnet noch nicht ueber `daily_summary`.'

/** Die acht Naehrstoffe der Vorlage (Zeile 401). */
const NAEHRSTOFFE = ['Vit D', 'Omega-3', 'Magnesium', 'Iron', 'B12', 'Calcium', 'Zinc', 'Vit C']
const TAGE = 30

/**
 * Der Ersatz fuer `Math.random()`.
 *
 * Eine Sinus-Streuung ueber Naehrstoff und Tag: kein Muster, das ins
 * Auge faellt, aber bei jedem Aufruf derselbe Wert. Die Vorlage
 * streut `0.55 + (rnd - 0.4) * 0.6` und klemmt auf 0..1 — dieselbe
 * Mitte, dieselbe Spannweite.
 */
function wert(i: number, j: number): number {
  // `[cmd]` GERUNDET, UND ZWAR NICHT AUS SCHOENHEIT. Der erste Versuch
  // gab den vollen Gleitkommawert zurueck und React meldete im Browser:
  //   Prop `style` did not match.
  //   Server: opacity:0.6199775584337404
  //   Client: opacity:0.6199775584345043
  // `Math.sin` ist in ECMAScript nicht bitgenau festgelegt — Node und
  // das V8 im Browser weichen ab der zwoelften Stelle ab. „Fest" heisst
  // also nicht „bei jedem Aufruf gleich", sondern „in jeder Engine
  // gleich". Drei Nachkommastellen liegen weit ueber dem Unterschied
  // und weit unter dem, was man sieht.
  const s = Math.sin((i + 1) * 12.9898 + (j + 1) * 78.233) * 43758.5453
  const r = s - Math.floor(s) // 0..1, fest je (i, j)
  const v = Math.max(0, Math.min(1, 0.55 + (r - 0.4) * 0.6))
  return Math.round(v * 1000) / 1000
}

/** Die Makroverteilung der Vorlage (Zeile 372-375). */
const MAKROS = [
  { l: 'Protein', v: 31, t: 28, color: 'var(--acc-train)' },
  { l: 'Carbs', v: 44, t: 47, color: 'var(--acc-recov)' },
  { l: 'Fat', v: 25, t: 25, color: 'var(--acc-goals)' },
]

function NutrientHeatmap() {
  return (
    <div>
      <div className="v2-heat-wrap">
        <div className="v2-heat">
          {NAEHRSTOFFE.map((n, i) => (
            <React.Fragment key={n}>
              <div className="v2-heat-name">{n}</div>
              <div className="v2-heat-zeile">
                {Array.from({ length: TAGE }, (_, j) => {
                  const v = wert(i, j)
                  return (
                    <div
                      key={j}
                      title={`${n} · day ${j + 1}: ${Math.round(v * 100)}%`}
                      style={{
                        height: 16,
                        background: v >= 0.8 ? 'var(--pos)' : v >= 0.5 ? 'var(--warn)' : 'var(--neg)',
                        opacity: 0.25 + v * 0.7,
                        borderRadius: 2,
                      }}
                    />
                  )
                })}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10, fontSize: 10, color: 'var(--fg-muted)', flexWrap: 'wrap' }}>
        <span className="v2-row-gap">
          <span style={{ width: 10, height: 10, background: 'var(--neg)', opacity: 0.6, borderRadius: 2 }} /> {'<50%'}
        </span>
        <span className="v2-row-gap">
          <span style={{ width: 10, height: 10, background: 'var(--warn)', opacity: 0.6, borderRadius: 2 }} /> 50–80%
        </span>
        <span className="v2-row-gap">
          <span style={{ width: 10, height: 10, background: 'var(--pos)', opacity: 0.6, borderRadius: 2 }} /> {'>80%'}
        </span>
      </div>
    </div>
  )
}

export function NutritionInsightsTab() {
  return (
    <div className="v2-grid v2-g-cols-2" style={{ gap: 16 }}>
      <Card
        title="Calorie balance"
        sub="14 days"
        attrappe={ATTRAPPE}
        actions={<Pill>kcal vs target</Pill>}
      >
        <LineChart
          series={[
            {
              data: [2580, 2710, 2680, 2520, 2740, 2890, 2410, 2670, 2530, 2620, 2780, 2650, 2510, 1847],
              color: 'var(--acc-nutri)',
            },
            { data: Array(14).fill(2700), color: 'var(--fg-dim)' },
          ]}
          h={180}
          xLabels={['', '', 'Mon', '', '', 'Thu', '', '', 'Sun', '', '', 'Wed', '', 'Today']}
          range={[1500, 3200]}
        />
      </Card>

      <Card title="Macro split · 14d avg" sub="Target ratio: 28 / 47 / 25" attrappe={ATTRAPPE}>
        <div className="v2-col-gap" style={{ gap: 10, marginTop: 8 }}>
          {MAKROS.map(m => (
            <div key={m.l}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span className="v2-eyebrow">{m.l}</span>
                <span className="v2-num" style={{ fontSize: 11 }}>
                  {m.v}% <span className="v2-dim">/ {m.t}%</span>
                </span>
              </div>
              <Meter value={m.v} max={50} color={m.color} tall />
            </div>
          ))}
        </div>
        <div className="v2-divider" />
        <Row label="Avg calories" value="2,617 kcal" />
        <Row label="Highest day" value="Tue · 2,890" />
        <Row label="Lowest day" value="Wed · 2,410" />
        <Row label="Days at target ±100" value="9 of 14" />
      </Card>

      <Card
        title="Micronutrient trend"
        sub="30 days · top 8"
        attrappe={ATTRAPPE}
        style={{ gridColumn: 'span 2' }}
      >
        <NutrientHeatmap />
      </Card>
    </div>
  )
}
