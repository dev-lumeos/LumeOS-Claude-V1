'use client'

// Der Insights-Tab des Nutrition-Moduls.
//
// QUELLE: theme-v1/module-nutrition.jsx, `NutritionInsights`
// (Zeile 357-399).
//
// **Die Vorlage fuehrt drei Kacheln.** `[cmd]` **Zwei stehen hier**
// (Calorie balance, Macro split), **die dritte ist in G-264 am
// 2026-08-30 entfernt** — Begruendung unten am Ort.
//
// GEAENDERT IST NUR DAS TECHNISCHE:
//   1. JSX ohne Typen -> TypeScript.
//   2. Klassen auf `v2-`-Praefix.
//   3. `window.NutritionHeatmapView` entfaellt — die Vorlage haengt dort
//      eine zweite Ansicht an, wenn sie geladen ist; sie liegt nicht vor.
//
// `[cmd]` **Mit `NutrientHeatmap` ist auch der Ersatz fuer
// `Math.random()` entfallen** (Sinusformel gegen den
// Hydration-Fehler). Die Begruendung stand hier vier Wochen und
// beschreibt seit G-264 keinen Code mehr.
//
// `[cmd]` ALLES IST ATTRAPPE. Die Kurven sind die Zahlen der Vorlage,
// nicht die des Nutzers.
import * as React from 'react'
import { Card, Pill, Row, Meter, LineChart } from '@lumeos/ui'

const ATTRAPPE = 'Die Zahlen stammen aus der Vorlage — die Auswertung rechnet noch nicht ueber `daily_summary`.'

/** Die Makroverteilung der Vorlage (Zeile 372-375). */
const MAKROS = [
  { l: 'Protein', v: 31, t: 28, color: 'var(--acc-train)' },
  { l: 'Carbs', v: 44, t: 47, color: 'var(--acc-recov)' },
  { l: 'Fat', v: 25, t: 25, color: 'var(--acc-goals)' },
]

export function NutritionInsightsTab({ ohneEchte = false }: {
  /**
   * G-11: die zwei Kacheln weglassen, die daneben schon echt stehen.
   *
   * `[cmd]` **Gemessen am 2026-08-29:** der Reiter zeigte „Calorie
   * balance" und „Macro split · 14d avg" **je zweimal** — einmal aus
   * `insights-echt.tsx` mit Werten aus `daily_summary`, einmal hier
   * mit denen der Vorlage. **Dieselbe Doppelung, die G-249 im
   * Nutrients-Reiter entfernt hat.**
   *
   * `[read]` **Der Entwurf bleibt aufrufbar** — ohne dieses Flag zeigt
   * er die zwei Kacheln der Vorlage, die noch hier stehen.
   *
   * `[cmd]` **Berichtigt in G-264:** hier stand *„alle drei Kacheln"*.
   * **Die dritte ist entfernt**, also sind es zwei. Ein Satz, der die
   * Zahl nennt, altert mit ihr.
   */
  ohneEchte?: boolean
} = {}) {
  return (
    <div className="v2-grid v2-g-cols-2" style={{ gap: 16 }}>
      {!ohneEchte && (
        <>
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

        </>
      )}

      {/* G-264: „Micronutrient trend" ist hier entfernt (2026-08-30).
          `[read]` **Was sie sicherte:** die Kachel zeigte eine Heatmap
          aus 8 Naehrstoffen x 30 Tagen, deren Werte eine Sinusformel
          erzeugte — kein Nutzerwert, sondern der Ersatz fuer das
          `Math.random()` der Vorlage.

          `[cmd]` **In G-11 wurde entschieden, sie nicht anzubinden:**
          der Nutrients-Reiter zeigt denselben Verlauf je Naehrstoff,
          aus `daily_nutrient_summary_long`, mit Sparkline ueber das
          gewaehlte Fenster. **Die Kachel waere die zweite Ansicht
          daneben gewesen.**

          `[read]` **A-59: nicht angebunden ist nicht entfernt.** Sie
          stand weiter am Schirm und sah aus wie eine Zusage — G-254
          fuehrte sie bereits als *gestrichen*, und das war falsch.
          **Jetzt ist sie es.** */}
    </div>
  )
}
