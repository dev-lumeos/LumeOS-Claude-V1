'use client'

// Die Mikronaehrstoff-Ansicht — G-239.
//
// **QUELLEN, in dieser Reihenfolge gelesen:**
//   `docs/specs/.../SPEC_10_COMPONENTS.md` — `MicroDashboard`
//     („Mikronaehrstoff-Dashboard mit Tier-System"), `MicroNutrientCard`
//     („aktuell/RDA, Severity-Farbe, Details")
//   `public/mockup/features/nutrition/MicroDashboard.js` — fuenf
//     Gruppen, Vitamine in fett-/wasserloeslich geteilt, aufklappbare
//     Zeilen, Balken, Zusammenfassung in vier Kacheln
//   `referenz/lumeos-2026/.../nutrientDetails.ts` — die Struktur, aus
//     der die `ND`-Tabelle des Mockups stammt
//
// `[cmd]` **Uebernommen:** Gruppen, Teilung der Vitamine, aufklappbare
// Zeile, Balken, Zusammenfassung.
//
// `[read]` **NICHT uebernommen: die Farblogik des Mockups.** `[cmd]`
// Dort gilt `pct>=80` gruen, `>=50` gelb, sonst rot — **in EINE
// Richtung, fuer jeden Naehrstoff gleich.** Bei einer Obergrenze
// faerbt das genau falsch herum: 163 % Vitamin A waere gruen.
// **Das ist Regel 2 aus C-48, und sie geht vor.**
//
// `[cmd]` **A-30:** aus dem Leseweg kommen nur TYPEN. Die Einordnung
// steht serverfrei in `lib/nutrition/mikro-lage.ts`.

import * as React from 'react'
import { Card, Pill, Icon } from '@lumeos/ui'

import {
  lageVon, zeigtProzent, fehlSatz, richtungsSatz, geltungsSatz,
  faelleZusammen, gruppiere, verteilung,
  LAGE_TEXT, LAGE_FARBE, OHNE_REFERENZ_SATZ,
  type Lage, type Naehrstoff, type ZeileMitLage,
} from '../../../lib/nutrition/mikro-lage'
import type { ReferenceAssessmentRow } from '../../../lib/nutrition/reference-assessment-read'

function zahl(n: number | null, einheit: string): string {
  if (n === null) return '—'
  const gerundet = Math.abs(n) >= 100 ? Math.round(n) : Math.round(n * 10) / 10
  return `${gerundet.toLocaleString('de-DE')} ${einheit}`
}

export function MikroAnsicht({ zeilen }: { zeilen: ReferenceAssessmentRow[] }) {
  const [offen, setOffen] = React.useState<string | null>(null)

  const stoffe = React.useMemo(() => {
    const mitLage: ZeileMitLage[] = zeilen.map(z => ({ ...z, lage: lageVon(z) }))
    return faelleZusammen(mitLage)
  }, [zeilen])

  const gruppen = React.useMemo(() => gruppiere(stoffe), [stoffe])
  const stufen = React.useMemo(() => verteilung(stoffe), [stoffe])

  if (zeilen.length === 0) {
    return (
      <Card title="Mikronährstoffe">
        <p className="v2-muted" style={{ fontSize: 12, lineHeight: 1.55 }}>
          Für diesen Tag ist nichts erfasst. <strong>Das ist keine Aussage
          über deine Zufuhr</strong> — es liegen schlicht keine Einträge vor.
        </p>
      </Card>
    )
  }

  return (
    <div className="v2-col-gap" style={{ gap: 14 }}>
      <Card title="Mikronährstoffe"
            sub={`${stoffe.length} Nährstoffe bewertet`}>
        {/* ══ Die Verteilung — gezaehlt, nicht gerechnet ══════════ */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {stufen.map(({ lage, anzahl }) => (
            <Pill key={lage} style={lage === 'zu_viel'
              ? {
                  color: 'var(--bg)', background: 'var(--neg)',
                  borderColor: 'var(--neg)', fontWeight: 600,
                }
              : { color: LAGE_FARBE[lage] }}>
              {anzahl}× {LAGE_TEXT[lage]}
            </Pill>
          ))}
        </div>

        {/* ══ Regel 2, als Satz ══════════════════════════════════ */}
        <p className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
          Ein Prozentwert sagt <strong>nur zusammen mit seiner
          Bezugsgröße</strong> etwas: 80 % eines Zielwerts sind zu wenig,
          80 % einer Obergrenze sind unbedenklich. Deshalb steht bei jeder
          Zahl, worauf sie sich bezieht.
        </p>

        {/* ══ Regel 4, als Fusszeile ═════════════════════════════ */}
        <p className="v2-dim" style={{
          fontSize: 11, lineHeight: 1.55, marginTop: 8, marginBottom: 0,
        }}>
          {geltungsSatz(zeilen[0] ?? null)}
        </p>
      </Card>

      {gruppen.map(g => (
        <Card key={g.key} title={g.titel} sub={`${g.stoffe.length}`}>
          <div className="v2-col-gap" style={{ gap: 0 }}>
            {g.stoffe.map(s => (
              <Zeile key={s.code} s={s}
                     offen={offen === s.code}
                     aufklappen={() => setOffen(offen === s.code ? null : s.code)} />
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}

function Zeile({ s, offen, aufklappen }: {
  s: Naehrstoff; offen: boolean; aufklappen: () => void
}) {
  const farbe = LAGE_FARBE[s.lage]
  const z = s.ziel
  const prozent = zeigtProzent(s.lage, z.reference_pct) ? z.reference_pct : null
  // Der Balken bildet bis 200 Prozent ab — daruber saehe jede
  // Ueberschreitung gleich aus (uebernommen aus dem Mockup).
  const balken = prozent === null ? 0 : Math.min(prozent, 200) / 2

  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <button type="button" onClick={aufklappen}
              aria-expanded={offen}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                padding: '7px 0', background: 'none', border: 'none',
                cursor: 'pointer', textAlign: 'left', color: 'inherit',
              }}>
        <span className="v2-dot" style={{ background: farbe, flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 12, minWidth: 0 }}>{s.name}</span>

        <span style={{
          width: 80, height: 4, background: 'var(--surface)',
          borderRadius: 2, overflow: 'hidden', flexShrink: 0,
        }}>
          <span style={{
            display: 'block', height: '100%', width: `${balken}%`,
            background: farbe, borderRadius: 2,
          }} />
        </span>

        <span className="v2-num v2-dim" style={{
          width: 92, textAlign: 'right', fontSize: 10.5, flexShrink: 0,
        }}>
          {zahl(z.actual_value, s.einheit)}
        </span>

        {/* `[read]` **Regel 1 und 3:** kein Prozentwert, wo die
            Funktion keinen liefert — und ein Strich ist keine Null. */}
        <span className="v2-num" style={{
          width: 52, textAlign: 'right', fontSize: 10.5,
          fontWeight: 600, color: farbe, flexShrink: 0,
        }}>
          {prozent !== null ? `${Math.round(prozent)} %` : '—'}
        </span>
        <Icon name={offen ? 'chevron_down' : 'chevron_right'}
              className="v2-ic v2-ic-sm" />
      </button>

      {offen && <Aufgeklappt s={s} />}
    </div>
  )
}

function Aufgeklappt({ s }: { s: Naehrstoff }) {
  const z = s.ziel
  return (
    <div style={{
      padding: '8px 0 12px 18px', fontSize: 11.5, lineHeight: 1.6,
      color: 'var(--fg-muted)',
    }}>
      {/* ══ Regel 1: der Fehlzaehler bleibt sichtbar ═══════════ */}
      {s.lage === 'unvollstaendig' && (
        <div style={{
          padding: 8, marginBottom: 8, borderRadius: 5,
          background: 'color-mix(in oklch, var(--warn) 10%, transparent)',
          border: '1px solid color-mix(in oklch, var(--warn) 35%, var(--border))',
        }}>
          {fehlSatz(z.missing_count)}{' '}
          <strong>Deshalb steht hier kein Prozentwert</strong> — er wäre
          zu niedrig, nicht bloß ungenau.
        </div>
      )}

      {/* ══ Regel 3: ohne Referenz ist keine Null ══════════════ */}
      {s.lage === 'ohne_referenz' && (
        <div style={{ marginBottom: 8 }}>{OHNE_REFERENZ_SATZ}</div>
      )}

      {/* ══ Regel 2: die Bezugsgroesse steht dabei ═════════════ */}
      {zeigtProzent(s.lage, z.reference_pct) && z.reference_pct !== null && (
        <div style={{ marginBottom: 6 }}>
          <strong>{Math.round(z.reference_pct)} %</strong>{' '}
          {richtungsSatz(z.reference_direction)}
          {z.reference_value_min !== null && (
            <> ({zahl(z.reference_value_min, z.reference_unit ?? s.einheit)}
              {z.reference_kind ? `, ${z.reference_kind}` : ''})</>
          )}
        </div>
      )}

      {/* ══ Die zweite Referenz, falls es eine gibt ════════════ */}
      {s.grenze && (
        <div style={{
          marginBottom: 6,
          color: s.grenze.lage === 'zu_viel' ? 'var(--neg)' : undefined,
          fontWeight: s.grenze.lage === 'zu_viel' ? 600 : undefined,
        }}>
          {s.grenze.lage === 'zu_viel' && (
            <Icon name="alert" className="v2-ic v2-ic-sm"
                  style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
          )}
          {s.grenze.reference_pct !== null
            ? <>{Math.round(s.grenze.reference_pct)} % der Obergrenze</>
            : <>Obergrenze geführt</>}
          {s.grenze.reference_value_max !== null && (
            <> ({zahl(s.grenze.reference_value_max,
              s.grenze.reference_unit ?? s.einheit)})</>
          )}
        </div>
      )}

      {/* ══ Der Beleg ═════════════════════════════════════════ */}
      {z.source && (
        <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 8 }}>
          Quelle: {z.source}
          {z.source_locator ? ` · ${z.source_locator}` : ''}
          {z.reference_basis ? ` · Bezug: ${z.reference_basis}` : ''}
        </div>
      )}
      {z.notes && (
        <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 4 }}>
          {z.notes}
        </div>
      )}
    </div>
  )
}
