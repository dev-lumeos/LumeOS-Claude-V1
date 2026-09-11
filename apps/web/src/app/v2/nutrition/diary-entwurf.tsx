'use client'

// Die rechte Spalte des Diary, uebernommen.
//
// QUELLEN, unveraendert uebernommen:
//   SmartSuggestionsCard    theme-v1/module-completeness.jsx:693
//   NutritionScoreCard      theme-v1/module-nutrition-spec.jsx:44
//   NutritionPendingActions theme-v1/module-nutrition-spec.jsx:521
//   PreWorkoutOptimizer     theme-v1/module-completeness.jsx:653
//   Hydration, Micronutrient snapshot, Below threshold
//                           theme-v1/module-nutrition.jsx:232/253/274
//
// Reihenfolge wie in `NutritionDiary` (Zeile 227-289): Smart
// suggestions, Nutrition score, Pending actions, Pre-workout, Hydration,
// Micronutrient snapshot, Below threshold.
//
// Die Zahlen sind die des Entwurfs — Score 1, Pre-workout 68,
// Hydration 1.2/3.0 L, das Netzdiagramm, die drei Werte unter der
// Schwelle. Sie bleiben stehen, bis die jeweilige Kachel angebunden ist.
import * as React from 'react'
import {
  Card, Pill, Icon, Row, Ring, Meter, RadarChart, InEntwicklungKnopf,
} from '@lumeos/ui'

const ATTRAPPE = 'Aus dem Entwurf uebernommen. Die Zahlen sind erfunden, bis die Kachel eine Quelle hat.'

// ══ G-412: der Stufenfaktor liegt jetzt in lib/ ═══════════════════
//
// `[cmd]` **Diese Datei traegt `'use client'`.** `[cmd]` **Die
// angebundene Score-Kachel ist eine Server-Komponente** — ein
// WERT-Import ueber die Grenze zog den Client-Baum in den Server und
// warf zur Laufzeit `stufenFaktor is not a function`.
//
// `[read]` **Die Tabelle steht deshalb in
// `lib/nutrition/stufenfaktor.ts`** — ohne `'use client'`, von
// beiden Seiten benutzbar. **Hier nur der Weiterverweis**, damit
// bestehende Aufrufer nicht brechen.
export {
  LEVEL_MULT, stufenFaktor, stufeGilt, nutritionScore,
  STUFE_UNBEKANNT_SATZ,
} from '../../../lib/nutrition/stufenfaktor'

export function NutritionPendingActions() {
  return (
    <Card title="Pending actions" sub="feeds Buddy's daily TODO" attrappe={ATTRAPPE}>
      <div className="v2-col-gap" style={{ gap: 6 }}>
        {([
          { t: '2 ghost entries still open', s: 'Pre-workout 16:30 · Dinner 20:00', trigger: 'meal_plan pending', sev: 'warn', act: 'Confirm' },
          { t: 'Water below 80% of target', s: '1.2 L logged + 0.6 L from food = 1.8 of 3.0 L', trigger: 'after 18:00', sev: 'warn', act: 'Log water' },
          { t: 'Protein 38 g short', s: '142 of 180 g · dinner should cover it', trigger: 'daily target', sev: 'info', act: 'See suggestions' },
        ] as const).map(a => {
          const c = a.sev === 'warn' ? 'var(--warn)' : 'var(--acc-nutri)'
          return (
            <div key={a.t} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: 10,
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6,
            }}>
              <div style={{ width: 3, alignSelf: 'stretch', background: c, borderRadius: 2 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>{a.t}</div>
                <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 2 }}>{a.s}</div>
              </div>
              <span className="v2-dim v2-num" style={{ fontSize: 9.5 }}>{a.trigger}</span>
              <InEntwicklungKnopf titel={a.act} className="v2-btn v2-btn-sm">{a.act}</InEntwicklungKnopf>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

