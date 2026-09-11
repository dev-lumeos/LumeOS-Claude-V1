// Der Mikronaehrstoff-Verlauf als Waermebild — G-412/A6.
//
// ══ ABGELESEN AUS DER VORLAGE ══════════════════════════════════════
//
// `[cmd]` **`module-nutrition.jsx:393`, `NutrientHeatmap` ab `:399`:**
//
//     acht Naehrstoffe x 30 Tage
//     Zellhoehe 16, Abstand 2
//     Beschriftungsspalte 80 px
//     >= 0.8  var(--pos)
//     >= 0.5  var(--warn)
//     sonst   var(--neg)
//
// `[cmd]` **In der Vorlage sind die Werte `Math.random()`.**
// `[read]` **Hier nicht** — sie kommen aus
// `nutrition.micronutrient_snapshot`, je Tag.
//
// `[read]` **Und wo ein Tag keinen Anteil hergibt, bleibt die Zelle
// LEER** — nicht rot. **Rot hiesse *zu wenig*, leer heisst *nicht
// ermittelbar*, und das sind zwei verschiedene Aussagen.**
import { Card } from '@lumeos/ui'

import type { MikroTrendStand } from '../../../lib/nutrition/mikro-trend-read'

/** Die drei Stufen der Vorlage (`:404-406`). */
function farbe(anteil: number | null): string {
  if (anteil === null) return 'var(--surface-2)'
  if (anteil >= 0.8) return 'var(--pos)'
  if (anteil >= 0.5) return 'var(--warn)'
  return 'var(--neg)'
}

export function MikroTrendKachel({ d }: { d: MikroTrendStand }) {
  if (d.fehler) {
    return (
      <Card title="Micronutrient trend" sub="30 Tage">
        <p className="v2-muted" style={{ fontSize: 12 }}>
          Nicht gelesen: {d.fehler}
        </p>
      </Card>
    )
  }

  if (d.reihen.length === 0) {
    return (
      <Card title="Micronutrient trend" sub="30 Tage">
        <p className="v2-muted" style={{ fontSize: 12 }}>
          Fuer diesen Zeitraum liegen keine Werte vor.
        </p>
      </Card>
    )
  }

  const zellen = d.reihen.reduce((s, r) => s + r.zellen.length, 0)
  const belegt = d.reihen.reduce(
    (s, r) => s + r.zellen.filter(z => z.anteil !== null).length, 0)

  return (
    <Card
      title="Micronutrient trend"
      sub={`${d.reihen.length} Naehrstoffe · ${d.tage.length} Tage`}
    >
      <div className="v2-col-gap" style={{ gap: 2 }}>
        {d.reihen.map(r => (
          <div key={r.code} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* `[cmd]` **Beschriftungsspalte 80 px** (`:401`). */}
            <span
              className="v2-eyebrow"
              style={{ width: 80, flexShrink: 0, fontSize: 9.5 }}
              title={r.label}
            >
              {r.label}
            </span>
            <div style={{ display: 'flex', gap: 2, flex: 1 }}>
              {r.zellen.map(z => (
                <div
                  key={z.datum}
                  title={`${r.label} · ${z.datum} · ${
                    z.anteil === null
                      ? 'kein Anteil ermittelbar'
                      : `${Math.round(z.anteil * 100)} %`}`}
                  style={{
                    // `[cmd]` **Zellhoehe 16, Abstand 2** (`:402`).
                    height: 16,
                    flex: 1,
                    minWidth: 4,
                    borderRadius: 2,
                    background: farbe(z.anteil),
                    // `[read]` **Leere Zellen ohne Deckkraft** — sie
                    // sollen als Luecke lesbar sein, nicht als Wert.
                    opacity: z.anteil === null ? 0.35 : 0.85,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 13, flexWrap: 'wrap', marginTop: 10 }}>
        {([
          ['var(--pos)', 'ab 80 %'],
          ['var(--warn)', '50 bis 79 %'],
          ['var(--neg)', 'unter 50 %'],
          ['var(--surface-2)', 'nicht ermittelbar'],
        ] as const).map(([c, l]) => (
          <span key={l} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 10.5, color: 'var(--fg-muted)',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
            {l}
          </span>
        ))}
      </div>

      {belegt < zellen && (
        <p className="v2-muted" style={{ fontSize: 10.5, marginTop: 8, lineHeight: 1.5 }}>
          {zellen - belegt} von {zellen} Zellen ohne Anteil — dort ist die
          Tagessumme unvollstaendig. <strong>Leer heisst nicht null:</strong>{' '}
          die Funktion laesst den Wert weg, statt ihn zu schaetzen.
        </p>
      )}
    </Card>
  )
}
