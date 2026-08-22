'use client'

// Der Tab „Catalog", angebunden an `supplements.supplement_catalog`
// (G-91).
//
// `[cmd]` **Warum dieser Tab und nicht „Database":** beide zeigen
// denselben Katalog, aber Catalog filtert nach **Evidenzstufe** und
// stellt die Stufen als eigene Leiste voran. Genau das ist der
// Unterschied in der Vorlage (`module-supplements-spec.jsx:252-366`),
// und genau dafuer traegt die Tabelle die Spalte: **`evidence_grade`
// ist auf allen 44 Eintraegen gefuellt** (S 4 · A 13 · B 16 · C 7 ·
// D 4, gemessen am 2026-08-20).
//
// **Was die Vorlage zeigt und die Tabelle nicht traegt** — gemeldet,
// nicht ersetzt:
//
//   `[cmd]` **Die Gewichte je Stufe** (S 1.00 · A 0.90 · B 0.75 …)
//   stehen ausschliesslich in `spec-daten.ts:41-48`, uebernommen aus
//   der Vorlage. **Es gibt keine Spalte dafuer**, und die Vorlage
//   nennt keine Quelle. Der Satz *„Weight feeds the evidence-weighted
//   compliance score exported to Goals"* beschreibt eine Rechnung, die
//   es nicht gibt. **Die Legende bleibt deshalb Attrappe.**
//
//   `[cmd]` **Die Spalte „Mode" (standard/enhanced)** hat keine
//   Entsprechung: `supplement_catalog` fuehrt kein solches Feld, und
//   `enhanced_substances` existiert nicht (geprueft gegen
//   `information_schema.tables`). Sie entfaellt hier, statt alle 44
//   pauschal „standard" zu nennen.
//
//   `[cmd]` **Die Spalte „Dose"** zeigt die **Portionsgroesse**, nicht
//   eine Empfehlung: `typical_dose_min`/`_max`/`dose_unit` sind auf
//   **allen 44 Eintraegen leer**, `serving_size`/`serving_unit` auf
//   allen 44 gefuellt. `[read]` **Und das ist die schaerfere Grenze:**
//   eine Portionsgroesse **zeigen** ist etwas anderes, als eine Dosis
//   zu **raten** — der Auftrag verlangt genau diese Unterscheidung.
import * as React from 'react'
import { Card, Pill, Icon } from '@lumeos/ui'

import type { KatalogEintrag, StackDaten } from '../../../lib/supplements/stack-read'
// C-224: die Substanzdatenbank (566) unter dem 44er-Katalog.
import type {
  SubstanzListenEintrag, EigenerStack,
} from '../../../lib/supplements/substanz-read'
import { SubstanzKatalogKarte } from './substanz-detail'
import { useSupp } from './kontext'

/**
 * Die Farbe je Stufe.
 *
 * `[cmd]` Uebernommen aus `spec-daten.ts:41-48` — **nur die Farbe**,
 * nicht das Gewicht. Die Zuordnung Buchstabe→Farbe ist Darstellung;
 * das Gewicht waere eine Behauptung ueber Evidenz.
 */
const STUFEN_FARBE: Record<string, string> = {
  S: 'var(--pos)',
  A: 'var(--acc-recov)',
  B: 'var(--acc-train)',
  C: 'var(--acc-goals)',
  D: 'var(--warn)',
  F: 'var(--neg)',
}

/** Die Ordnung der Vorlage — beste Evidenz zuerst. */
const STUFEN_ORDNUNG = 'SABCDF'

export function KatalogEcht({ katalog, daten, substanzen = [], stacks = [] }: {
  katalog: KatalogEintrag[]
  daten: StackDaten | null
  substanzen?: SubstanzListenEintrag[]
  stacks?: EigenerStack[]
}) {
  const { open } = useSupp()
  const [stufe, setStufe] = React.useState<string>('all')
  const [frage, setFrage] = React.useState('')

  const imStack = React.useMemo(
    () => new Set((daten?.positionen ?? [])
      .map(p => p.katalog?.id).filter(Boolean) as string[]),
    [daten])

  // Nur die Stufen anbieten, die auch vorkommen — eine Leiste mit
  // einem Knopf ohne Treffer waere eine leere Zusage.
  const vorhandeneStufen = React.useMemo(() => {
    const zaehler = new Map<string, number>()
    for (const k of katalog) {
      zaehler.set(k.evidence_grade, (zaehler.get(k.evidence_grade) ?? 0) + 1)
    }
    return Array.from(zaehler.entries())
      .sort((a, b) => STUFEN_ORDNUNG.indexOf(a[0]) - STUFEN_ORDNUNG.indexOf(b[0]))
  }, [katalog])

  const treffer = React.useMemo(() => katalog
    .filter(k => stufe === 'all' || k.evidence_grade === stufe)
    .filter(k => !frage || k.name.toLowerCase().includes(frage.toLowerCase())
      || k.category.toLowerCase().includes(frage.toLowerCase()))
    .sort((a, b) =>
      STUFEN_ORDNUNG.indexOf(a.evidence_grade) - STUFEN_ORDNUNG.indexOf(b.evidence_grade)
      || a.name.localeCompare(b.name)),
  [katalog, stufe, frage])

  return (
    <div>
      <div className="v2-supp-katalog-kopf">
        <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
          <Icon name="search" className="v2-ic v2-ic-sm v2-supp-suchsymbol" />
          <input
            className="v2-feld"
            value={frage}
            onChange={e => setFrage(e.target.value)}
            placeholder="Search catalog · name, category…"
            aria-label="Search catalog"
            style={{ paddingLeft: 30 }}
          />
        </div>
        <span className="v2-dim v2-mono" style={{ fontSize: 10.5 }}>
          {treffer.length} of {katalog.length}
        </span>
      </div>

      <div className="v2-supp-evidenzfilter">
        <span className="v2-eyebrow" style={{ marginRight: 4 }}>Evidence</span>
        <button
          type="button" onClick={() => setStufe('all')}
          className={stufe === 'all' ? 'v2-pill v2-pill-acc' : 'v2-pill'}
          aria-pressed={stufe === 'all'}
          style={{ cursor: 'pointer', padding: '3px 10px', fontSize: 11 }}
        >
          All
        </button>
        {/* `[cmd]` Die Zahl an jeder Stufe ist gezaehlt, nicht gesetzt —
            sie sagt, wie viele Eintraege die Stufe traegt. */}
        {vorhandeneStufen.map(([g, n]) => {
          const c = STUFEN_FARBE[g] ?? 'var(--fg-dim)'
          return (
            <button
              key={g} type="button" onClick={() => setStufe(g)}
              className="v2-pill"
              aria-pressed={stufe === g}
              style={{
                cursor: 'pointer', padding: '3px 12px', fontSize: 11, fontWeight: 600,
                borderColor: stufe === g ? c : `color-mix(in oklch, ${c} 30%, var(--border))`,
                color: c,
                background: stufe === g
                  ? `color-mix(in oklch, ${c} 14%, transparent)`
                  : `color-mix(in oklch, ${c} 5%, transparent)`,
              }}
            >
              {g} · {n}
            </button>
          )
        })}
      </div>

      <Card style={{ padding: 0 }}>
        <div className="v2-supp-tbl-wrap">
          <table className="v2-tbl">
            <thead>
              <tr>
                <th style={{ paddingLeft: 14 }}>Supplement</th>
                <th style={{ width: 60 }}>Grade</th>
                <th style={{ width: 140 }}>Category</th>
                {/* Portionsgroesse, keine Empfehlung — Begruendung im
                    Dateikopf. */}
                <th style={{ width: 120 }}>Serving</th>
                <th style={{ width: 110 }}>Timing</th>
                <th style={{ width: 90, textAlign: 'right' }}>€/serving</th>
                <th style={{ width: 80 }}>In stack</th>
              </tr>
            </thead>
            <tbody>
              {treffer.map(k => {
                const drin = imStack.has(k.id)
                return (
                  <tr key={k.id} style={{ cursor: 'pointer' }}
                      onClick={() => open('product', { name: k.name, inStack: drin })}>
                    <td style={{ paddingLeft: 14 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500 }}>{k.name}</div>
                      {k.benefits.length > 0 && (
                        <div className="v2-dim" style={{ fontSize: 10 }}>
                          {k.benefits.slice(0, 3).join(' · ')}
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        className="v2-supp-grade"
                        style={{
                          background: `color-mix(in oklch, ${STUFEN_FARBE[k.evidence_grade] ?? 'var(--fg-dim)'} 18%, transparent)`,
                          border: `1px solid color-mix(in oklch, ${STUFEN_FARBE[k.evidence_grade] ?? 'var(--fg-dim)'} 40%, transparent)`,
                          color: STUFEN_FARBE[k.evidence_grade] ?? 'var(--fg-dim)',
                        }}
                      >
                        {k.evidence_grade}
                      </span>
                    </td>
                    <td className="v2-muted" style={{ fontSize: 11.5 }}>{k.category}</td>
                    <td className="v2-num" style={{ fontSize: 11.5 }}>
                      {k.serving_size != null
                        ? `${k.serving_size} ${k.serving_unit ?? ''}`.trim()
                        : '—'}
                    </td>
                    <td className="v2-muted v2-mono" style={{ fontSize: 10.5 }}>
                      {k.timing_default.replace(/_/g, ' ')}
                    </td>
                    <td className="v2-num" style={{ textAlign: 'right', fontSize: 11.5 }}>
                      {k.cost_per_serving != null ? `€${k.cost_per_serving.toFixed(2)}` : '—'}
                    </td>
                    <td>
                      {drin
                        ? <Pill variant="pos" style={{ fontSize: 9 }}>active</Pill>
                        : <span className="v2-dim">—</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {treffer.length === 0 && (
          <div className="v2-muted" style={{ fontSize: 11.5, padding: 14 }}>
            Kein Eintrag zu dieser Auswahl.
          </div>
        )}
      </Card>

      <div style={{ height: 14 }} />

      {/* `[read]` **Was hier NICHT steht:** die Vorlage setzt an diese
          Stelle die Legende „Evidence grading" mit einem Gewicht je
          Stufe (S 1.00 … F 0.00) und dem Satz, das Gewicht speise
          einen Score fuer Goals. **Beides hat keine Spalte und keine
          Quelle** — die Legende bleibt in der Entwurfsfassung mit
          ihrer Marke stehen. Hier steht stattdessen, was die Stufe
          belegbar ist: ein Buchstabe aus der Tabelle. */}
      <Card title="Evidenzstufe" sub="was in der Tabelle steht">
        <div className="v2-dim" style={{ fontSize: 11, lineHeight: 1.6 }}>
          <span className="v2-mono">evidence_grade</span> ist auf allen{' '}
          {katalog.length} Einträgen gefüllt und wird hier unverändert
          gezeigt. <span className="v2-mono">evidence_summary</span> ist
          auf allen leer, <span className="v2-mono">evidence_sources</span>{' '}
          überall ein leeres Feld — <strong>die Begründung der Stufe
          liegt nicht vor</strong>, nur der Buchstabe. Ein Gewicht je
          Stufe führt die Tabelle nicht.
        </div>
      </Card>

      <div style={{ height: 14 }} />

      {/* C-224: die Substanzdatenbank — eigene Tabelle, eigener
          Lesepfad, Detail mit Herkunft je Feld. */}
      <SubstanzKatalogKarte liste={substanzen} stacks={stacks} />
    </div>
  )
}
