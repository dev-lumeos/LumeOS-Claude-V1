'use client'

// Die laufende Phase im Planer (G-87, seit G-645/3 ein Einschub der PlanSeite).
//
// `[cmd]` **G-645/3, am Schirm 10.10.:** unter dem Planer stand diese Kachel
// mit eigenem Kopf (Phasenart, „Seit", „Woche x"), Start und geplantem Ende
// und „Phase parameters" mit „Hoechstdauer —" / „Protein —". **Alles davon
// zeigt der Planer selbst** — Kopf und Woche im aktiven Plan (`phasenLauf`,
// EINE Rechnung mit der Steuerungskarte), Daten in der Zeitachse, Tempo,
// Protein und Hoechstdauer aus dem Katalog in den Details. **Die Striche
// widersprachen den Katalogwerten** daneben.
//
// `[read]` **Was bleibt, kann nur sie:** Tage bisher/uebrig, der Posten
// „ueberzogen" mit dem Weg daneben (G-534/A3), die Rate in der gewaehlten
// Einheit (G-565) und die Herkunft der Phase (G-534/A1).
//
// `[read]` **C-119:** Tage und Woche werden gerechnet — aus `gueltig_ab`
// und `projected_end_date` gegen den Stichtag. Gespeichert ist keine davon.
import * as React from 'react'

// ══ G-565/E-83: dieselbe Rate, zwei Einheiten ══════════════
import {
  inEinheit, EINHEIT_ZEICHEN, type Rateneinheit,
} from '../../../lib/goals/zielrate-einheit'
import { phasenLauf } from '../../../lib/goals/plan'
import { EinheitenSchalter } from './einheiten-schalter'
import { einheitSetzenAktion } from './phase-aktionen'
import { Card, Row } from '@lumeos/ui'

import type { Phase } from '../../../lib/goals/lesen'

/** `lean_bulk` -> „lean bulk". Die Tabelle fuehrt Text, keinen Enum. */
function lesbar(s: string | null): string {
  return s ? s.replace(/_/g, ' ') : '—'
}

export function PhaseEcht({ phase, stichtag, gewichtKg, einheit }: { phase: Phase; stichtag: string
  /**
   * `[cmd]` **G-565: fuer die Einheitenwahl** — ohne Gewicht keine
   * Kilokalorien (E-83). `[read]` **Das Gewicht am Phasenbeginn**,
   * nicht das heutige (G-543).
   */
  gewichtKg: number | null
  /** Die gewaehlte Einheit des Nutzers, aus den Einstellungen. */
  einheit: Rateneinheit
}) {
  // ══ G-565/A1: die gewaehlte Einheit, lokal umschaltbar ══════
  const [gewaehlt, setGewaehlt] = React.useState(einheit)
  // `[read]` **Eine Groesse, zwei Darstellungen** — gespeichert bleibt die Rate (E-83).
  const anzeige = inEinheit(phase.zielrate_pct_kg_woche, gewichtKg, gewaehlt)
  const lauf = React.useMemo(() => phasenLauf(phase, stichtag), [phase, stichtag])

  return (
    <div className="v2-grid-15">
      <Card title="Laufende Phase" sub="gerechnet aus Beginn und geplantem Ende">
        <div className="v2-grid" style={{ gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(92px, 1fr))' }}>
          {([
            ['Tage bisher', lauf.tageBisher != null ? String(lauf.tageBisher) : '—'],
            // `[read]` Negative „Tage uebrig" sind keine uebrigen Tage — die
            // Beschriftung wechselt mit dem Vorzeichen.
            lauf.tageRest != null && lauf.tageRest < 0
              ? ['Tage überzogen', String(Math.abs(lauf.tageRest))]
              : ['Tage übrig', lauf.tageRest != null ? String(lauf.tageRest) : '—'],
          ] as Array<[string, string]>).map(([l, v]) => (
            <Card key={l} className="v2-card-tight" style={{ padding: 10 }}>
              <div className="v2-eyebrow">{l}</div>
              <div className="v2-num" style={{ fontSize: 15 }}>{v}</div>
            </Card>
          ))}
        </div>

        {/* ══ G-534/A3: die ueberzogene Phase ist ein POSTEN ══
            `[read]` **Keine Bewertung des Nutzers** — C-108/F-02 und E-74.
            **Es ist eine Aussage ueber die PHASE.** */}
        {lauf.tageRest != null && lauf.tageRest < 0 && !lauf.beendet && (
          <div data-phase-ueberzogen style={{
            marginTop: 12, padding: '10px 12px', borderRadius: 7,
            background: 'color-mix(in oklch, var(--warn) 8%, var(--surface))',
            border: '1px solid color-mix(in oklch, var(--warn) 30%, var(--border))',
          }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 3 }}>
              Diese Phase läuft {Math.abs(lauf.tageRest)} Tage länger als geplant.
            </div>
            <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
              Geplantes Ende war {phase.projected_end_date}. Beende sie
              oder verschieb das geplante Ende.
            </div>
          </div>
        )}

        {/* ══ G-565/A1: die Rate in der gewaehlten Einheit ═════
            `[read]` **Ein Umschalter, kein zweites Feld** — gespeichert bleibt die Rate (E-83). */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
          <div style={{ flex: 1 }}>
            <Row label="Zielrate"
                 value={anzeige !== null
                   ? `${anzeige > 0 ? '+' : ''}${anzeige} ${EINHEIT_ZEICHEN[gewaehlt]}`
                   : '—'} />
          </div>
          {phase.zielrate_pct_kg_woche != null && (
            <EinheitenSchalter einheit={gewaehlt} gewichtKg={gewichtKg}
                               onWechsel={e => {
                                 setGewaehlt(e)
                                 void einheitSetzenAktion(e)
                               }} />
          )}
        </div>
        {phase.zielrate_pct_kg_woche == null && (
          <div className="v2-dim" data-grund="rate" style={{ fontSize: 10.5, lineHeight: 1.5 }}>
            Diese Phasenart läuft ohne Zielrate.
          </div>
        )}
      </Card>

      {/* ══ G-534/A1+A7: die Kachel zeigt sich nur, wenn sie etwas
          zu sagen hat — eine Kachel, die dreimal nichts sagt, ist kein Posten. */}
      {(phase.transitioned_from || phase.recommended_next
        || phase.transition_reason) && (
      <Card title="Phasenwechsel" sub="woher diese Phase kommt">
        {phase.transitioned_from && (
          <Row label="Kam aus" value={lesbar(phase.transitioned_from)} />
        )}
        {phase.recommended_next && (
          <Row label="Empfohlen als Nächstes" value={lesbar(phase.recommended_next)} />
        )}
        {/* `transition_reason` ist Freitext aus der Zeile — gezeigt, nicht ausgewertet. */}
        {phase.transition_reason && (
          <>
            <div className="v2-divider" />
            <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Begründung</div>
            <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
              {phase.transition_reason}
            </div>
          </>
        )}
      </Card>
      )}
    </div>
  )
}
