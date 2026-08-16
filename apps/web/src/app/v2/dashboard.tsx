// Darstellung des Dashboards (G-05). Reine Anzeige, kein I/O.
//
// =====================================================================
// DIE ENTSCHEIDUNG: nur zeigen, was da ist
// =====================================================================
// `[cmd]` Die Vorlage (module-dashboard.jsx) hat zwoelf Kacheln: vier
// Kennzahlen oben (Recovery 82, Trainingslast 2.142 TSS, Kalorien,
// Schlaf 7:42) und acht Karten (Tagesablauf, Makros, Aktivitaet,
// Readiness-Ring, Body Battery, Tonight, PR-Watch).
//
// `[cmd]` Davon haben DREI eine Datenquelle: Kalorien, Makros und —
// teilweise — die Aktivitaet. Die uebrigen neun brauchen `recovery`,
// Trainings-Sitzungen, Schlaf und HRV. Gemessen: `recovery`,
// `supplements` und `medical` existieren als Schema nicht; `training`
// hat vier Tabellen, alle Stammdaten (Uebungen, Muskelgruppen,
// Geraete) — keine einzige Sitzung.
//
// GEWAEHLT: nur die Kacheln bauen, die eine Quelle haben. Statt der
// uebrigen EINE Karte, die benennt, was fehlt und woran es haengt.
//
// `[read]` Der Grund steht in G-03: dort wurde entschieden, KEINE
// gefuellten Ringe ohne Ziel zu zeigen, weil „ein zu 68 % gefuellter
// Ring eine Falschaussage mit hoher Ueberzeugungskraft waere". Neun
// Attrappen sind dasselbe Problem neunmal.
//
// Der Gegenvorschlag — alles zeigen und als Attrappe kennzeichnen —
// hat einen Fehler, den man erst im Betrieb merkt: Eine Marke wie
// `MOCK` neben „Recovery 82" nimmt der Zahl nicht ihre Wirkung. Wer
// morgens auf ein Dashboard schaut, liest die Zahlen, nicht die
// Marken. Und ein Dashboard, das zu drei Vierteln aus Attrappen
// besteht, ist keine Uebersicht, sondern ein Bildschirmfoto.
//
// `[annahme]` Die Kacheln wachsen mit den Modulen. Die Liste unten
// sagt G-06, was ein neues Modul liefern muss, damit seine Kachel
// erscheint — das ist mehr wert als eine Attrappe, die schon da
// aussieht.
import * as React from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import {
  Card, Pill, Icon, Row, ModuleHero, ProgressRing, Sparkline, Meter,
} from '@lumeos/ui'

import type { DailySummaryRow, SummaryMacro } from '../../lib/nutrition/diary-summary'
import type { ReferenceAssessmentRow } from '../../lib/nutrition/reference-assessment-read'
import type { Zielvorschlag, Zielwerte } from '../../lib/profile/zielwerte-read'

const MAKROS: Array<{
  code: SummaryMacro
  label: string
  unit: string
  color: string
  zielFeld: 'kcal' | 'protein_g' | 'carbs_g' | 'fat_g'
}> = [
  { code: 'enercc',  label: 'Energie',       unit: 'kcal', color: 'var(--acc-nutri)', zielFeld: 'kcal' },
  { code: 'prot625', label: 'Protein',       unit: 'g',    color: 'var(--acc-train)', zielFeld: 'protein_g' },
  { code: 'cho',     label: 'Kohlenhydrate', unit: 'g',    color: 'var(--acc-recov)', zielFeld: 'carbs_g' },
  { code: 'fat',     label: 'Fett',          unit: 'g',    color: 'var(--acc-goals)', zielFeld: 'fat_g' },
]

/** Was ein Modul liefern muesste, damit seine Kachel erscheint. */
const FEHLENDE_KACHELN: Array<{ kachel: string; braucht: string }> = [
  { kachel: 'Recovery, Readiness, Body Battery', braucht: 'Schema `recovery` mit Checkins und HRV' },
  { kachel: 'Trainingslast, PR-Watch',           braucht: 'Trainings-Sitzungen — `training` hat heute nur Stammdaten' },
  { kachel: 'Schlaf, Tonight',                   braucht: 'Schlafdaten, in keinem Schema' },
  { kachel: 'Supplement-Einnahme',               braucht: 'Schema `supplements`' },
  { kachel: 'Tagesablauf mit Uhrzeiten',         braucht: 'Uhrzeit je Mahlzeit — `meals` hat nur `entry_date`' },
]

function tagText(datum: string): string {
  const d = new Date(`${datum}T00:00:00`)
  return d.toLocaleDateString('de-DE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export function DashboardAnsicht({
  datum, summe, verlauf, bewertung, ziele, vorschlag, fehler,
}: {
  datum: string
  summe: DailySummaryRow | null
  verlauf: DailySummaryRow[]
  bewertung: ReferenceAssessmentRow[]
  ziele: Zielwerte | null
  vorschlag: Zielvorschlag | null
  fehler: string | null
}) {
  const leer = !summe || summe.item_count === 0

  // Die Deckungsgrade, die wirklich einen Prozentwert tragen. Alles
  // andere zaehlt hier NICHT mit — das ist Regel 1 und 3 aus C-48.
  const bewertbar = bewertung.filter(b => b.reference_status === 'complete'
    && b.reference_pct !== null)
  // Zeilen mit Richtung `target` — eine Empfehlung, die man decken kann.
  // Obergrenzen gehoeren NICHT hierher: „erreicht" hiesse dort „ueber-
  // schritten", und das ist das Gegenteil.
  const empfehlungen = bewertbar.filter(b => b.reference_direction === 'target')
  const erreicht = empfehlungen.filter(b => (b.reference_pct ?? 0) >= 100)
  const ueberGrenze = bewertbar.filter(b =>
    b.reference_direction === 'upper_limit' && (b.reference_pct ?? 0) > 100)
  const unvollstaendig = bewertung.filter(b => b.reference_status === 'incomplete')
  const profilFehlt = bewertung.length > 0
    && bewertung.every(b => b.reference_status === 'missing_profile')

  // Der Verlauf der letzten sieben Tage, fuer die Kurve. Tage ohne
  // Eintrag fallen raus statt als 0 zu erscheinen — eine 0 hiesse
  // „nichts gegessen", und das steht hier nicht fest.
  const kcalVerlauf = verlauf
    .map(v => v.macros.enercc.value)
    .filter((v): v is number => v !== null)

  return (
    <>
      <ModuleHero
        icon="dashboard"
        title="Dashboard"
        sub={tagText(datum)}
        pills={
          <>
            <Pill variant="acc">G-05</Pill>
            <Pill>{bewertbar.length > 0 ? 'Nutrition live' : 'ohne Daten'}</Pill>
          </>
        }
        stats={[
          {
            label: 'Mahlzeiten',
            value: summe ? String(summe.meal_count) : '—',
            sub: summe && summe.item_count > 0 ? `${summe.item_count} Positionen` : undefined,
          },
          {
            // NICHT „Ziele erreicht". Das Tagesziel kommt aus `goals` und
            // meint Kalorien und Makros; DIESE Zahl zaehlt Naehrstoffe
            // gegen ihre Referenzwerte. Am 02.08. stand „Ziele erreicht
            // 15/30" an einem Tag GANZ OHNE Tagesziel — zwei verschiedene
            // Dinge unter einem Namen.
            // Der Nenner sind nur die Zeilen mit Richtung `target`:
            // bei einer Obergrenze ist „erreicht" keine sinnvolle Frage.
            label: 'Referenz gedeckt',
            value: empfehlungen.length > 0 ? `${erreicht.length}/${empfehlungen.length}` : '—',
            sub: empfehlungen.length > 0 ? 'Naehrstoffe, nicht das Tagesziel' : undefined,
          },
          {
            label: 'Ueber Grenze',
            value: bewertbar.length > 0 ? String(ueberGrenze.length) : '—',
            sub: ueberGrenze.length > 0 ? ueberGrenze.map(u => u.nutrient_code).join(', ') : undefined,
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

      {/* Der Fall „Tag ohne jede Mahlzeit" aus dem Register. */}
      {!fehler && leer && (
        <div className="v2-empty" style={{ marginTop: 16 }}>
          <Icon name="nutrition" />
          <div>
            <strong>
              {summe && summe.meal_count > 0
                ? 'Mahlzeiten angelegt, aber nichts erfasst.'
                : 'Fuer diesen Tag ist nichts erfasst.'}
            </strong>
            <p style={{ marginTop: 6 }}>
              {summe && summe.meal_count > 0
                ? `${summe.meal_count} Mahlzeit(en) stehen da, aber ohne Positionen — die Summen bleiben leer, nicht null.`
                : 'Ohne Positionen gibt es nichts zusammenzutragen.'}
            </p>
            <p style={{ marginTop: 6 }}>
              <Link href={'/v2/nutrition' as Route} className="v2-link">
                Im Tagebuch erfassen
              </Link>
            </p>
          </div>
        </div>
      )}

      <div className="v2-grid v2-g-cols-2" style={{ marginTop: 16, alignItems: 'start' }}>
        {/* ---- Kachel 1: Makros gegen Ziel ---- */}
        <Card
          title="Makros heute"
          sub={ziele ? `Ziele seit ${ziele.gueltig_ab}` : 'ohne Tagesziel'}
          actions={
            <Link href={'/v2/nutrition' as Route} className="v2-btn v2-btn-ghost"
                  style={{ height: 22, fontSize: 11, padding: '0 8px' }}>
              Tagebuch <Icon name="arrow_right" className="v2-ic v2-ic-sm" />
            </Link>
          }
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            {MAKROS.map(m => {
              const wert = summe?.macros[m.code]
              const ziel = ziele ? ziele[m.zielFeld] : null
              return (
                <div key={m.code} style={{ textAlign: 'center' }}>
                  <ProgressRing
                    value={wert?.value ?? null}
                    target={ziel}
                    showPercent={ziel !== null}
                    unit={m.unit}
                    size={84}
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

          {/* Der Fall „Tag ohne Ziel" aus dem Register. */}
          {!ziele && (
            <p className="v2-hinweis" style={{ marginTop: 12 }}>
              <Icon name="alert" className="v2-ic v2-ic-sm" />
              <span>
                <strong>Kein Tagesziel fuer diesen Tag.</strong>{' '}
                {vorschlag?.hindernis === 'profil_unvollstaendig'
                  ? 'Das Profil ist unvollstaendig.'
                  : 'Vor dem ersten gesetzten Ziel gibt es keines — auch nicht das aelteste als Naeherung.'}{' '}
                <Link href={'/v2/settings' as Route} className="v2-link">Profil</Link>
              </span>
            </p>
          )}
          {ziele && (
            <p className="v2-hinweis" style={{ marginTop: 12 }}>
              <Icon name="alert" className="v2-ic v2-ic-sm" />
              <span>
                Ziele{ziele.herkunft === 'formel' ? ' aus dem Profil geschaetzt' : ' von Hand gesetzt'}
                {ziele.tdee !== null && ` (TDEE ${Math.round(ziele.tdee)} kcal)`}.{' '}
                <strong>Eine Schaetzung ist keine Messung.</strong>
              </span>
            </p>
          )}
        </Card>

        {/* ---- Kachel 2: Deckung ---- */}
        <Card
          title="Naehrstoffdeckung"
          sub={`${bewertung.length} Zeilen bewertet`}
          actions={
            bewertbar.length > 0
              ? <Pill variant="acc">{bewertbar.length} mit Prozentwert</Pill>
              : undefined
          }
        >
          {profilFehlt && (
            <div className="v2-insight v2-warn" style={{ marginBottom: 12 }}>
              <div className="v2-insight-mark" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="v2-insight-title">Profil unvollstaendig</div>
                <div className="v2-insight-body">
                  Referenzwerte haengen an Alter, Geschlecht und Gewicht.
                  Ohne sie steht bei jedem Naehrstoff „Profil fehlt" —
                  nicht 0 %.{' '}
                  <Link href={'/v2/settings' as Route} className="v2-link">
                    Profil ergaenzen
                  </Link>
                </div>
              </div>
            </div>
          )}

          {bewertung.length === 0 && !profilFehlt && (
            <p className="v2-muted" style={{ fontSize: 12 }}>
              Ohne erfasste Positionen gibt es nichts zu bewerten.
            </p>
          )}

          {bewertbar.length > 0 && (
            <>
              <Row
                label="Referenz gedeckt"
                value={`${erreicht.length} von ${empfehlungen.length}`}
                sub="Naehrstoffempfehlungen, nicht das Tagesziel"
              />
              <Row
                label="Ueber einer Obergrenze"
                value={
                  ueberGrenze.length === 0
                    ? 'keine'
                    : ueberGrenze.map(u => u.nutrient_name_de).join(', ')
                }
              />
              {unvollstaendig.length > 0 && (
                <Row
                  label="Unvollstaendig erfasst"
                  value={`${unvollstaendig.length} Naehrstoff(e)`}
                  sub="Summe ist eine Untergrenze"
                />
              )}
              <p className="v2-hinweis" style={{ marginTop: 10 }}>
                <Icon name="alert" className="v2-ic v2-ic-sm" />
                <span>
                  Gezaehlt werden nur Zeilen mit Prozentwert.{' '}
                  {bewertung.length - bewertbar.length} weitere tragen
                  keinen — unvollstaendig erfasst, ohne Referenzwert oder
                  mit fremder Bezugsgroesse. <strong>Das ist kein 0 %.</strong>
                </span>
              </p>
            </>
          )}
        </Card>
      </div>

      {/* ---- Kachel 3: Verlauf ---- */}
      <div style={{ marginTop: 16 }}>
        <Card
          title="Energie, letzte sieben Tage"
          sub={kcalVerlauf.length > 0 ? `${kcalVerlauf.length} Tage mit Eintrag` : 'keine Eintraege'}
        >
          {kcalVerlauf.length >= 2 ? (
            <>
              <Sparkline data={kcalVerlauf} color="var(--acc-nutri)" h={54} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span className="v2-num v2-dim" style={{ fontSize: 11 }}>
                  {Math.round(Math.min(...kcalVerlauf))} kcal
                </span>
                <span className="v2-num v2-dim" style={{ fontSize: 11 }}>
                  Schnitt {Math.round(kcalVerlauf.reduce((a, b) => a + b, 0) / kcalVerlauf.length)} kcal
                </span>
                <span className="v2-num v2-dim" style={{ fontSize: 11 }}>
                  {Math.round(Math.max(...kcalVerlauf))} kcal
                </span>
              </div>
              {ziele?.kcal != null && (
                <div style={{ marginTop: 10 }}>
                  <Meter
                    value={kcalVerlauf.reduce((a, b) => a + b, 0) / kcalVerlauf.length}
                    max={ziele.kcal}
                  />
                  <div style={{ fontSize: 10.5, color: 'var(--fg-dim)', marginTop: 4 }}>
                    Schnitt gegen das heutige Ziel von {Math.round(ziele.kcal)} kcal.
                    {' '}Aeltere Tage hatten moeglicherweise ein anderes.
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="v2-muted" style={{ fontSize: 12 }}>
              {kcalVerlauf.length === 1
                ? 'Ein Tag mit Eintrag — fuer eine Kurve braucht es mindestens zwei.'
                : 'Keine Eintraege in den letzten sieben Tagen.'}
            </p>
          )}
        </Card>
      </div>

      {/* ---- Was fehlt ---- */}
      <div style={{ marginTop: 16 }}>
        <Card title="Was dieses Dashboard nicht zeigt" sub="und woran es haengt">
          <p style={{ fontSize: 12, color: 'var(--fg-muted)', marginBottom: 10, lineHeight: 1.55 }}>
            Die Vorlage hat zwoelf Kacheln. Drei haben eine
            Datenquelle und stehen oben. Die uebrigen neun braeuchten
            Module, die es noch nicht gibt — sie werden hier{' '}
            <strong>nicht als Attrappe gezeigt</strong>: Eine erfundene
            Zahl neben echten sieht aus wie eine Messung, und eine Marke
            daneben nimmt ihr die Wirkung nicht.
          </p>
          {FEHLENDE_KACHELN.map(f => (
            <Row key={f.kachel} label={f.kachel} value={f.braucht} />
          ))}
        </Card>
      </div>
    </>
  )
}
