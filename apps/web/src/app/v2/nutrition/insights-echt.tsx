'use client'

// Zwei Insights-Kacheln mit echten Zahlen (G-101).
//
// VORLAGE: `tab-insights.tsx` — „Calorie balance" und „Macro split ·
// 14d avg". **Aufbau uebernommen**, die Zahlen kommen aus
// `goals.adaptive_tdee` und `nutrition.daily_summary`.
//
// **DIE GRENZE:** `[read]` Zahlen ja, Urteile nein. Der Entwurf nennt
// eine „Target ratio: 28 / 47 / 25" — **eine Zielverteilung, die
// nirgends entschieden ist.** Sie steht deshalb nicht hier; gezeigt
// wird die gemessene Verteilung, ohne Sollwert daneben.
//
// `[cmd]` Bemerkenswert: der gemessene Schnitt liegt bei **27,7 /
// 47,5 / 24,8** — nah an der erfundenen Zahl des Entwurfs. **Das macht
// sie nicht zum Ziel**, es heisst nur, dass der Entwurf plausibel
// geraten hat.
import * as React from 'react'
import { Card, Pill, Row, Meter } from '@lumeos/ui'

import type { InsightsStand } from '../../../lib/nutrition/insights-read'

function z(v: number | null, nach = 0): string {
  return v === null ? '—' : v.toLocaleString('de-DE', {
    minimumFractionDigits: nach, maximumFractionDigits: nach,
  })
}

/** Die Konfidenz im Klartext — der Begriff allein sagt nichts. */
const KONFIDENZ: Record<string, string> = {
  high: 'hoch',
  medium: 'mittel',
  low: 'niedrig',
}

export function KalorienbilanzKachel({ d, fenster }: {
  d: InsightsStand
  /**
   * `[cmd]` **Berichtigt in G-291:** hier stand `14` als Text, und
   * seit dem Fenster von 30 Tagen war das falsch. **Eine Zahl im
   * Titel altert mit dem Aufrufer** — sie kommt jetzt von dort.
   */
  fenster: number
}) {
  const b = d.bilanz
  if (!b) {
    return (
      <Card title="Calorie balance" sub={`${fenster} Tage`}>
        <p className="v2-muted" style={{ fontSize: 12 }}>
          Keine Bilanz — dafuer fehlen Gewichtsmessungen oder vollstaendige Tage.
        </p>
      </Card>
    )
  }

  return (
    <Card
      title="Calorie balance"
      sub={`${z(b.tage)} Tage · ${z(b.vollstaendige_tage)} vollstaendig erfasst`}
      actions={b.konfidenz
        ? <Pill variant={b.belastbar ? 'acc' : undefined}>
            Konfidenz {KONFIDENZ[b.konfidenz] ?? b.konfidenz}
          </Pill>
        : undefined}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
        <span className="v2-num" style={{ fontSize: 28 }}>
          {b.abstand === null ? '—' : `${b.abstand > 0 ? '+' : ''}${z(b.abstand, 1)}`}
        </span>
        <span className="v2-dim" style={{ fontSize: 12 }}>kcal je Tag</span>
      </div>
      {/*
        `[read]` KEIN URTEIL. Der Abstand steht da; ob er „gut" ist,
        haengt am Ziel (Aufbau, Diaet, Halten) und das entscheidet das
        Goals-Modul, nicht diese Kachel.
      */}
      <p className="v2-muted" style={{ fontSize: 11.5, marginBottom: 10 }}>
        Zufuhr minus Verbrauch, gemittelt ueber den Zeitraum.
      </p>

      <Row label="Zufuhr" value={`${z(b.zufuhr, 1)} kcal`} />
      <Row label="Verbrauch (adaptiv)" value={`${z(b.verbrauch, 1)} kcal`} />
      <Row label="Gewichtsaenderung" value={
        b.gewicht_delta_kg === null ? '—' : `${z(b.gewicht_delta_kg, 2)} kg`
      } />
      {b.alpha !== null && (
        // `[cmd]` GO-15: bei alpha < 1 bleibt der adaptive Wert
        // anteilig an der Formel. Das gehoert an die Zahl.
        <Row label="Glaettung (alpha)" value={z(b.alpha, 1)} />
      )}
      {b.status && b.status !== 'complete' && (
        <p className="v2-muted" style={{ fontSize: 11, marginTop: 8 }}>
          Status: {b.status} — die Zahl ist eine Naeherung.
        </p>
      )}
    </Card>
  )
}

const MAKROFARBEN: Array<{
  schluessel: 'protein' | 'carbs' | 'fat'; label: string; farbe: string
}> = [
  { schluessel: 'protein', label: 'Protein', farbe: 'var(--acc-train)' },
  { schluessel: 'carbs', label: 'Kohlenhydrate', farbe: 'var(--acc-recov)' },
  { schluessel: 'fat', label: 'Fett', farbe: 'var(--acc-goals)' },
]

export function MakroschnittKachel({ d, fenster }: {
  d: InsightsStand
  /** G-291: `14d avg` stand fest im Titel - siehe oben. */
  fenster: number
}) {
  const m = d.makros
  if (!m || m.tage === 0) {
    return (
      <Card title={`Macro split · ${fenster}d avg`}>
        <p className="v2-muted" style={{ fontSize: 12 }}>
          Fuer den Zeitraum liegen keine Tagessummen vor.
        </p>
      </Card>
    )
  }

  const anteile = {
    protein: m.anteil_protein, carbs: m.anteil_carbs, fat: m.anteil_fat,
  }
  const gramm = { protein: m.protein_g, carbs: m.carbs_g, fat: m.fat_g }

  return (
    <Card title={`Macro split · ${fenster}d avg`} sub={`${m.tage} Tage gemittelt`}>
      <div className="v2-col-gap" style={{ gap: 10, marginTop: 8 }}>
        {MAKROFARBEN.map(f => {
          const anteil = anteile[f.schluessel]
          return (
            <div key={f.schluessel}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span className="v2-eyebrow">{f.label}</span>
                <span className="v2-num" style={{ fontSize: 11 }}>
                  {anteil === null ? '—' : `${z(anteil, 1)} %`}
                  <span className="v2-dim"> · {z(gramm[f.schluessel], 0)} g</span>
                </span>
              </div>
              <Meter value={anteil ?? 0} max={60} color={f.farbe} tall />
            </div>
          )
        })}
      </div>
      <div className="v2-divider" />
      <Row label="Kalorien im Schnitt" value={`${z(m.kcal, 0)} kcal`} />
      {/*
        `[read]` **KEINE ZIELVERTEILUNG.** Der Entwurf schreibt
        „Target ratio: 28 / 47 / 25" in den Untertitel — diese Zahlen
        sind nirgends entschieden. `goals.zielwerte_am` fuehrt Gramm je
        Makro, keine Prozentverteilung; daraus eine Sollquote zu
        rechnen waere eine eigene Erfindung.
      */}
      <p className="v2-muted" style={{ fontSize: 10.5, marginTop: 8, lineHeight: 1.5 }}>
        Die Anteile sind aus den Gramm gerechnet (4 / 4 / 9 kcal je g)
        und auf ihre Summe bezogen — Alkohol und Ballaststoffe tragen
        ebenfalls Energie und fehlen deshalb hier. <strong>Eine
        Zielverteilung steht nicht daneben:</strong> die Ziele sind in
        Gramm hinterlegt, nicht als Quote.
      </p>
    </Card>
  )
}
