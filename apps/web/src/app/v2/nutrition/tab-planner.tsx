'use client'

// Der Planner-Tab des Nutrition-Moduls.
//
// QUELLE: theme-v1/module-nutrition.jsx, `NutritionPlanner`
// (Zeile 598-638) und `planSample` (Zeile 639-654).
// Eine Wochenmatrix: vier Mahlzeitenreihen ueber sieben Tage.
//
// GEAENDERT IST NUR DAS TECHNISCHE:
//   1. JSX ohne Typen -> TypeScript.
//   2. Klassen auf `v2-`-Praefix.
//   3. `window.dispatchEvent("open-nutrition-modal")` -> `onModal`.
//   4. **Die Zufallszahlen sind ersetzt** — dieselbe Begruendung wie
//      im Insights-Tab: `Math.round(400 + Math.random() * 400)`
//      (Zeile 648) wuerfelt bei jedem Rendern neu und zerlegt in
//      Next.js die Hydration. Ersetzt durch eine feste Formel im
//      selben Bereich (400 bis 800 kcal).
//
// NICHT geaendert: dieselben Gerichte, dieselbe Woche, dieselbe
// Hervorhebung des Samstags (`di === 5`).
//
// `[cmd]` ALLES IST ATTRAPPE. Planung braucht kuenftige Tage; `meals`
// kennt nur erfasste.
import * as React from 'react'
import { Card, Icon } from '@lumeos/ui'

const ATTRAPPE = 'Planung kuenftiger Tage — `meals` kennt nur erfasste Tage, keine geplanten.'

const TAGE = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const SLOTS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const
type Slot = typeof SLOTS[number]

/** Die Gerichte der Vorlage (Zeile 640-645), unveraendert. */
const PLAN: Record<Slot, string[]> = {
  Breakfast: ['Oats + Whey', 'Oats + Whey', 'Eggs · 3', 'Oats + Whey', 'Eggs · 3', 'Oats + Whey', 'Skyr bowl'],
  Lunch: ['Chicken + Rice', 'Salmon + Sweet Pot.', 'Chicken + Rice', 'Beef + Rice', 'Chicken + Rice', 'Chicken + Rice', 'Tuna salad'],
  Dinner: ['Pasta + Mince', 'Stir-fry tofu', 'Chicken curry', 'Lentil bowl', 'Pizza · cheat', 'Roast chicken', 'Risotto'],
  Snacks: ['Cottage + Berries', 'Skyr + Almonds', 'Banana + PB', 'Skyr + Almonds', 'Pretzels', 'Cottage + Berries', 'Apple'],
}

/** Fester Ersatz fuer `Math.round(400 + Math.random() * 400)`. */
function kcal(slot: Slot, di: number): number {
  const i = SLOTS.indexOf(slot)
  const s = Math.sin((i + 1) * 24.719 + (di + 1) * 55.113) * 43758.5453
  return Math.round(400 + (s - Math.floor(s)) * 400)
}

export function NutritionPlannerTab({ onModal }: { onModal?: (typ: string) => void }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button type="button" className="v2-btn v2-btn-ghost">
          <Icon name="chevron_left" className="v2-ic v2-ic-sm" />
        </button>
        <button type="button" className="v2-btn">Week of May 12–18</button>
        <button type="button" className="v2-btn v2-btn-ghost">
          <Icon name="chevron_right" className="v2-ic v2-ic-sm" />
        </button>
        <div className="v2-spacer" />
        <button type="button" className="v2-btn">
          <Icon name="copy" className="v2-ic v2-ic-sm" /> Copy week
        </button>
        <button type="button" className="v2-btn v2-btn-primary" onClick={() => onModal?.('recipe')}>
          <Icon name="plus" className="v2-ic v2-ic-sm" /> New recipe
        </button>
      </div>

      <Card attrappe={ATTRAPPE}>
        <div className="v2-planner-wrap">
          <div className="v2-planner">
            <div />
            {TAGE.map((d, i) => (
              <div
                key={d}
                style={{
                  padding: 6,
                  fontSize: 11,
                  color: i === 5 ? 'var(--acc)' : 'var(--fg-muted)',
                  textAlign: 'center',
                  fontWeight: i === 5 ? 600 : 400,
                }}
              >
                {d} <span className="v2-num v2-dim" style={{ fontSize: 10 }}>{12 + i}</span>
              </div>
            ))}

            {SLOTS.map(s => (
              <React.Fragment key={s}>
                <div
                  style={{
                    padding: '10px 6px',
                    fontSize: 11,
                    fontWeight: 500,
                    color: 'var(--fg-muted)',
                    borderTop: '1px solid var(--border)',
                  }}
                >
                  {s}
                </div>
                {TAGE.map((d, di) => (
                  <div
                    key={d}
                    style={{
                      padding: 8,
                      minHeight: 60,
                      borderTop: '1px solid var(--border)',
                      background: di === 5 ? 'color-mix(in oklch, var(--acc) 5%, transparent)' : 'transparent',
                      fontSize: 11,
                    }}
                  >
                    <div style={{ fontSize: 11, color: 'var(--fg)' }}>
                      <div style={{ marginBottom: 2 }}>{PLAN[s][di]}</div>
                      <div className="v2-num v2-dim" style={{ fontSize: 10 }}>{kcal(s, di)} kcal</div>
                    </div>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
