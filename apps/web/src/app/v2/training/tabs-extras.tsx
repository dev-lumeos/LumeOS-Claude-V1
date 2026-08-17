'use client'

// Die Kachel „Body stats × strength" im History-Tab.
//
// QUELLE: theme-v1/module-training-extras.jsx:441-481
// (`window.TrainingBodyStatsCorrelation`). `module-training.jsx:433`
// zeigt sie am Fuss des History-Tabs ueber die ganze Breite.
//
// Sie steht hier allein, weil der Rest von `-extras.jsx` Modale sind
// (`modale.tsx`) bzw. der Kontext (`kontext.tsx`).
//
// GEAENDERT IST NUR DAS TECHNISCHE: TypeScript, `v2-`-Praefix.
// Die Skalierungsfaktoren der Vorlage (×1.4 fuer das Gewicht, ×6 fuer
// den Koerperfettanteil) bleiben — sie machen drei Groessenordnungen in
// einem Diagramm vergleichbar und stehen als Kommentar auch dort.
//
// `[cmd]` ALLES IST ATTRAPPE.
import * as React from 'react'
import { Card, LineChart } from '@lumeos/ui'

import { ATTRAPPE } from './ansicht'

export function TrainingBodyStatsCorrelation() {
  const weeks = ['wk1', 'wk2', 'wk3', 'wk4', 'wk5', 'wk6', 'wk7', 'wk8', 'wk9', 'wk10', 'wk11', 'wk12']
  const bench = [102, 105, 105, 107.5, 110, 112.5, 110, 115, 117.5, 117.5, 120, 122.5]
  const weight = [80.4, 80.5, 80.3, 80.1, 80.0, 79.9, 79.8, 79.7, 79.5, 79.5, 79.5, 79.4]
  const bf = [15.0, 14.9, 14.8, 14.6, 14.5, 14.3, 14.2, 14.0, 13.9, 13.8, 13.8, 13.8]
  return (
    <Card title="Body stats × strength" sub="12 weeks · correlation overlay" attrappe={ATTRAPPE}>
      <LineChart h={180} range={[60, 130]}
        xLabels={weeks}
        series={[
          { data: bench, color: 'var(--acc-train)' },
          { data: weight.map(w => w * 1.4), color: 'var(--acc-goals)' },
          { data: bf.map(b => b * 6), color: 'var(--acc-suppl)' },
        ]} />
      <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11, color: 'var(--fg-muted)', flexWrap: 'wrap' }}>
        <span className="v2-row-gap"><span className="v2-dot" style={{ background: 'var(--acc-train)' }} />Bench e1RM (kg)</span>
        <span className="v2-row-gap"><span className="v2-dot" style={{ background: 'var(--acc-goals)' }} />Bodyweight (scaled)</span>
        <span className="v2-row-gap"><span className="v2-dot" style={{ background: 'var(--acc-suppl)' }} />Body fat % (scaled)</span>
      </div>
      <div className="v2-divider" />
      <div className="v2-grid v2-g-cols-3" style={{ gap: 10, fontSize: 11.5 }}>
        <Card className="v2-card-tight" style={{ padding: 10 }}>
          <div className="v2-eyebrow">Bench × weight</div>
          <div className="v2-num" style={{ fontSize: 14, color: 'var(--pos)' }}>+20kg / −1.0kg</div>
          <div className="v2-dim" style={{ fontSize: 10 }}>relative strength +13%</div>
        </Card>
        <Card className="v2-card-tight" style={{ padding: 10 }}>
          <div className="v2-eyebrow">Bench × bodyfat</div>
          <div className="v2-num" style={{ fontSize: 14, color: 'var(--pos)' }}>+20kg / −1.2%</div>
          <div className="v2-dim" style={{ fontSize: 10 }}>recomposition confirmed</div>
        </Card>
        <Card className="v2-card-tight" style={{ padding: 10 }}>
          <div className="v2-eyebrow">Coef. of determination</div>
          <div className="v2-num" style={{ fontSize: 14 }}>R² = 0.91</div>
          <div className="v2-dim" style={{ fontSize: 10 }}>strong linear trend</div>
        </Card>
      </div>
    </Card>
  )
}
