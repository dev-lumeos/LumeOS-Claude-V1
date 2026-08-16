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

/** Die vier Makros, die die Vorlage oben zeigt. */
const HAUPTMAKROS: Array<{
  code: SummaryMacro
  label: string
  unit: string
  color: string
}> = [
  { code: 'enercc', label: 'Energie', unit: 'kcal', color: 'var(--acc-nutri)' },
  { code: 'prot625', label: 'Protein', unit: 'g', color: 'var(--acc-train)' },
  { code: 'cho', label: 'Kohlenhydrate', unit: 'g', color: 'var(--acc-recov)' },
  { code: 'fat', label: 'Fett', unit: 'g', color: 'var(--acc-goals)' },
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
  datum, summe, bewertung, fehler, bewertungFehler,
}: {
  datum: string
  summe: DailySummaryRow | null
  bewertung: ReferenceAssessmentRow[]
  fehler: string | null
  bewertungFehler?: string | null
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
            <Pill variant="acc">G-03</Pill>
            <Pill>nur lesen</Pill>
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

      {/* Der ehrliche Zustand von heute: nichts erfasst, und es GIBT
          keinen Weg, hier etwas zu erfassen. Beides gehoert gesagt. */}
      {!fehler && leer && (
        <div className="v2-empty" style={{ marginTop: 16 }}>
          <Icon name="nutrition" />
          <div>
            <strong>Nichts erfasst an diesem Tag.</strong>
            <p style={{ marginTop: 6 }}>
              Diese Seite <em>liest</em> das Tagebuch. Das Erfassen von
              Mahlzeiten ist ein eigener Auftrag (C-03) und noch nicht
              gebaut — deshalb steht hier kein „Mahlzeit hinzufuegen".
            </p>
            <p style={{ marginTop: 6 }}>
              Die Suche funktioniert bereits:{' '}
              <Link href={'/v2/nutrition/suche' as Route} className="v2-link">
                Lebensmittel suchen
              </Link>
            </p>
          </div>
        </div>
      )}

      <div className="v2-grid v2-g-cols-2" style={{ marginTop: 16, alignItems: 'start' }}>
        <Card title="Tagessumme" sub="aus den eingefrorenen Werten">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
            {HAUPTMAKROS.map(m => {
              const wert = summe?.macros[m.code]
              return (
                <div key={m.code} style={{ textAlign: 'center' }}>
                  <ProgressRing
                    value={wert?.value ?? null}
                    target={null}
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

          {/* Warum kein Ring gefuellt ist. Ohne diesen Satz sieht die
              Karte nach einem Fehler aus. */}
          <p className="v2-hinweis" style={{ marginTop: 14 }}>
            <Icon name="alert" className="v2-ic v2-ic-sm" />
            <span>
              <strong>Keine Ringe, weil es keine Ziele gibt.</strong>{' '}
              [cmd] Dieses Repo hat keine Zieltabelle — die Vorlage zeigt
              an dieser Stelle vier erfundene Zahlen (2.700 kcal, 180 g
              Protein …). Solange Tagesziele nicht aus einer Quelle
              kommen, zeigt der Ring den Wert und kein Verhaeltnis.
            </span>
          </p>

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
                  key={b.nutrient_code}
                  name={b.nutrient_name_de}
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
