// Darstellung des Tagebuchs. Reine Anzeige, kein I/O.
//
// DIE ZENTRALE ABWEICHUNG VON DER VORLAGE: dort steht
// `const target = { kcal: 2700, p: 180, c: 320, f: 90 }` — vier
// erfundene Zahlen. [cmd] In diesem Repo gibt es keine Zieltabelle und
// kein ausgefuelltes Profil. Ringe, die gegen ein erfundenes Ziel
// fuellen, behaupten etwas, das die Daten nicht hergeben.
//
// Deshalb zeigen die Ringe hier den Wert ohne Ziel, und wo ein Ziel
// noetig waere, steht, dass es fehlt.
import * as React from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import {
  Card, Pill, Icon, Row, ModuleHero, ProgressRing, CoverageRow,
  type ReferenceStatus, type ReferenceDirection,
} from '@lumeos/ui'
import type { DailySummaryRow, SummaryMacro } from '../../../lib/nutrition/diary-summary'
import type { ReferenceAssessmentRow } from '../../../lib/nutrition/reference-assessment-read'
import type { Zielvorschlag, Zielwerte } from '../../../lib/profile/zielwerte-read'
import { Zielhinweis } from './zielhinweis'
import { Erfassen } from './erfassen'

/** Die vier Makros, die die Vorlage oben zeigt. */
const HAUPTMAKROS: Array<{
  code: SummaryMacro
  label: string
  unit: string
  color: string
  /** Das passende Feld in goals.nutrition_targets. */
  zielFeld: 'kcal' | 'protein_g' | 'carbs_g' | 'fat_g'
}> = [
  { code: 'enercc',  label: 'Energie',       unit: 'kcal', color: 'var(--acc-nutri)', zielFeld: 'kcal' },
  { code: 'prot625', label: 'Protein',       unit: 'g',    color: 'var(--acc-train)', zielFeld: 'protein_g' },
  { code: 'cho',     label: 'Kohlenhydrate', unit: 'g',    color: 'var(--acc-recov)', zielFeld: 'carbs_g' },
  { code: 'fat',     label: 'Fett',          unit: 'g',    color: 'var(--acc-goals)', zielFeld: 'fat_g' },
]

const WEITERE_MAKROS: Array<{ code: SummaryMacro; label: string; unit: string }> = [
  { code: 'fibt', label: 'Ballaststoffe', unit: 'g' },
  { code: 'sugar', label: 'Zucker', unit: 'g' },
  { code: 'fasat', label: 'gesaettigte Fettsaeuren', unit: 'g' },
  { code: 'nacl', label: 'Salz', unit: 'g' },
  { code: 'water_g', label: 'Wasser aus Lebensmitteln', unit: 'g' },
]

function tagText(datum: string): string {
  const d = new Date(`${datum}T00:00:00`)
  return d.toLocaleDateString('de-DE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export function TagebuchAnsicht({
  datum, summe, bewertung, fehler, bewertungFehler, ziele, vorschlag, zielFehler,
}: {
  datum: string
  summe: DailySummaryRow | null
  bewertung: ReferenceAssessmentRow[]
  fehler: string | null
  bewertungFehler?: string | null
  ziele?: Zielwerte | null
  vorschlag?: Zielvorschlag | null
  zielFehler?: string | null
}) {
  const leer = !summe || summe.item_count === 0

  // Der Profilzustand steht in jeder Zeile gleich — eine reicht.
  const profilFehlt = bewertung.length > 0 &&
    bewertung[0].reference_status === 'missing_profile'

  const bewertbar = bewertung.filter(b => b.reference_status === 'complete')
  const erreicht = bewertbar.filter(b =>
    b.reference_direction === 'target' && (b.reference_pct ?? 0) >= 100).length

  return (
    <>
      <ModuleHero
        icon="nutrition"
        title="Tagebuch"
        sub={tagText(datum)}
        pills={
          <>
            <Pill variant="acc">C-03</Pill>
            <Pill>lesen und schreiben</Pill>
          </>
        }
        stats={[
          { label: 'Mahlzeiten', value: summe ? String(summe.meal_count) : '—' },
          { label: 'Positionen', value: summe ? String(summe.item_count) : '—' },
          {
            label: 'Bewertbar',
            value: bewertbar.length > 0 ? `${erreicht}/${bewertbar.length}` : '—',
            sub: bewertbar.length > 0 ? 'Ziele erreicht' : undefined,
          },
        ]}
      />

      {fehler && (
        <div className="v2-insight v2-neg" style={{ marginTop: 16 }}>
          <div className="v2-insight-mark" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="v2-insight-title">Tagessumme nicht lesbar</div>
            <div className="v2-insight-body">{fehler}</div>
          </div>
        </div>
      )}

      {/* Bis C-03 stand hier, dass es keinen Weg zum Erfassen gibt.
          Es gibt jetzt einen — direkt darunter. */}
      {!fehler && leer && (
        <div className="v2-empty" style={{ marginTop: 16 }}>
          <Icon name="nutrition" />
          <div>
            <strong>Nichts erfasst an diesem Tag.</strong>
            <p style={{ marginTop: 6 }}>
              Mahlzeit anlegen, Lebensmittel suchen, Menge angeben — die
              Naehrwerte werden dabei <strong>eingefroren</strong>. Eine
              spaetere Korrektur am Lebensmittel aendert diesen Tag nicht
              mehr.
            </p>
            <p style={{ marginTop: 6 }}>
              Nur stoebern?{' '}
              <Link href={'/v2/nutrition/suche' as Route} className="v2-link">
                Lebensmittel suchen
              </Link>
            </p>
          </div>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <Erfassen datum={datum} />
      </div>

      <div className="v2-grid v2-g-cols-2" style={{ marginTop: 16, alignItems: 'start' }}>
        <Card title="Tagessumme" sub="aus den eingefrorenen Werten">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
            {HAUPTMAKROS.map(m => {
              const wert = summe?.macros[m.code]
              // C-03: Der Nenner kommt aus goals.zielwerte_am. Fehlt er,
              // bleibt der Ring ohne Verhaeltnis — der Baustein nimmt
              // `target` seit G-03 als optional.
              const ziel = ziele ? ziele[m.zielFeld] : null
              return (
                <div key={m.code} style={{ textAlign: 'center' }}>
                  <ProgressRing
                    value={wert?.value ?? null}
                    target={ziel}
                    showPercent={ziel !== null}
                    unit={m.unit}
                    size={88}
                    color={m.color}
                    incomplete={(wert?.missing ?? 0) > 0}
                  />
                  <div style={{ fontSize: 10, color: 'var(--fg-dim)', marginTop: 4 }}>
                    {m.label}
                  </div>
                  {(wert?.missing ?? 0) > 0 && (
                    <div style={{ fontSize: 9, color: 'var(--warn)' }}>
                      {wert!.missing} ohne Wert
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Warum kein Ring gefuellt ist — und was dagegen zu tun ist.
              Bis GO-03 stand hier „es gibt keine Zieltabelle". Die gibt
              es jetzt; der Satz muss sagen, WAS fehlt. */}
          <div style={{ marginTop: 14 }}>
            <Zielhinweis
              ziele={ziele ?? null}
              vorschlag={vorschlag ?? null}
              fehler={zielFehler ?? null}
            />
          </div>

          <div style={{ marginTop: 12 }}>
            {WEITERE_MAKROS.map(m => {
              const wert = summe?.macros[m.code]
              return (
                <Row
                  key={m.code}
                  label={m.label}
                  value={
                    <>
                      {wert?.value == null
                        ? '—'
                        : wert.value.toLocaleString('de-DE', { maximumFractionDigits: 1 })}
                      {wert?.value != null && <span className="v2-unit">{m.unit}</span>}
                    </>
                  }
                  sub={(wert?.missing ?? 0) > 0 ? `${wert!.missing} ohne Wert` : undefined}
                />
              )
            })}
          </div>
        </Card>

        <Card
          title="Deckung je Naehrstoff"
          sub={`${bewertung.length} bewertet`}
          actions={
            bewertbar.length > 0
              ? <Pill variant="acc">{bewertbar.length} mit Referenz</Pill>
              : undefined
          }
        >
          {profilFehlt && (
            <div className="v2-insight v2-warn" style={{ marginBottom: 12 }}>
              <div className="v2-insight-mark" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="v2-insight-title">Profil unvollstaendig</div>
                <div className="v2-insight-body">
                  Referenzwerte haengen an Alter und biologischem Geschlecht.
                  [cmd] Beides fehlt im Profil, deshalb steht bei jedem
                  Naehrstoff „Profil fehlt" statt eines Prozentwerts —
                  nicht 0 %.
                </div>
              </div>
            </div>
          )}

          {bewertungFehler && (
            <div className="v2-insight v2-neg" style={{ marginBottom: 12 }}>
              <div className="v2-insight-mark" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="v2-insight-title">Bewertung nicht lesbar</div>
                <div className="v2-insight-body">{bewertungFehler}</div>
              </div>
            </div>
          )}

          {bewertung.length === 0 && !bewertungFehler && (
            <p className="v2-muted" style={{ fontSize: 12 }}>
              Ohne erfasste Positionen gibt es nichts zu bewerten.
            </p>
          )}

          {bewertung.length > 0 && (
            <div style={{ maxHeight: 460, overflowY: 'auto' }}>
              {bewertung.map(b => (
                <CoverageRow
                  key={`${b.nutrient_code}-${b.reference_kind ?? 'x'}`}
                  name={
                    <>
                      {b.nutrient_name_de}
                      {/* Ohne diese Marke stehen Vitamin A und D zweimal
                          untereinander und sehen nach einem Fehler aus.
                          Es sind zwei Aussagen: Ziel und Obergrenze. */}
                      {b.reference_kind && (
                        <span className="v2-kind">{b.reference_kind}</span>
                      )}
                    </>
                  }
                  unit={b.nutrient_unit}
                  value={b.actual_value}
                  missing={b.missing_count}
                  status={b.reference_status as ReferenceStatus}
                  direction={(b.reference_direction ?? undefined) as ReferenceDirection | undefined}
                  percent={b.reference_pct}
                  referenceMin={b.reference_value_min}
                  referenceMax={b.reference_value_max}
                  referenceKind={b.reference_kind}
                />
              ))}
            </div>
          )}

          {/* Regel 4 aus C-48, im Klartext. Sie steht hier und nicht im
              Bericht, weil sie die Person betrifft, die auf die Zahlen
              schaut. */}
          <p className="v2-hinweis" style={{ marginTop: 12 }}>
            <Icon name="alert" className="v2-ic v2-ic-sm" />
            <span>
              <strong>100 % heisst nicht „genug fuer dich".</strong> Die
              Referenzwerte gelten fuer gesunde Erwachsene in Ruhe. Wer
              trainiert, krank ist, schwanger ist oder Medikamente nimmt,
              braucht andere Mengen — das kann diese Seite nicht wissen.
            </span>
          </p>
        </Card>
      </div>
    </>
  )
}
