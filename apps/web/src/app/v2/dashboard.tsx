// Darstellung des Dashboards. Reine Anzeige, kein I/O.
//
// =====================================================================
// ALLE ZWOELF KACHELN DER VORLAGE — neun davon als Attrappe
// =====================================================================
// `[read]` Tom, 2026-08-16: „Jedes Feature traegt einen Hinweis, ob es
// Mockup ist; wenn es verdrahtet ist, faellt der Hinweis weg. So sieht
// man als Mensch das Gesamtbild und kann entscheiden."
//
// G-05 hatte die neun Kacheln ohne Datenquelle WEGGELASSEN. Das war
// falsch, und der Denkfehler ist benannt: das Argument „eine Marke nimmt
// einer Zahl nicht ihre Wirkung" gilt fuer Endnutzer. Auf einem Stand,
// den nur Tom sieht, gibt es diesen Endnutzer nicht — und wer die
// unfertigen Kacheln weglaesst, nimmt genau die Anzeige weg, die das
// Design liefern soll.
//
// Der Unterschied zum Ring ohne Ziel bleibt bestehen:
//   Ring ohne Ziel  — eine Zahl, die aussieht wie gemessen, OHNE Marke.
//   Attrappenkachel — eine Flaeche, die SAGT, dass sie nichts weiss.
//
// Verdrahtet wird eine Kachel, indem `attrappe` entfaellt. Die Marke ist
// der Fortschrittsbalken; sie zu entfernen ist der Abschluss.
//
// `[cmd]` Aufbau aus `theme-v1/module-dashboard.jsx`: Kopfzeile, vier
// KPI-Kacheln, dann ein Raster 1.4fr/1fr — links Tagesablauf, Makros,
// Aktivitaet; rechts Readiness, Body battery, Tonight, PR watch.
// Reihenfolge und Benennung sind uebernommen, nicht nachempfunden.
import * as React from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import {
  Card, Pill, Icon, Row, ModuleHero, ProgressRing, Sparkline, LineChart, Meter, KPI, Ring,
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

/**
 * Woran jede Attrappe haengt. Steht hier und nicht im JSX, damit die
 * Liste beim Verdrahten vollstaendig bleibt: Zeile streichen, `attrappe`
 * an der Kachel entfernen, fertig.
 *
 * `[cmd]` Gemessen: die Schemata `recovery`, `supplements` und `medical`
 * gibt es nicht; `training` hat vier Tabellen, alle Stammdaten.
 */
const BRAUCHT = {
  recovery:  'Schema `recovery` mit Checkins und HRV — existiert nicht.',
  training:  'Trainings-Sitzungen — `training` hat heute nur Stammdaten.',
  schlaf:    'Schlafdaten — in keinem Schema vorhanden.',
  ablauf:    'Uhrzeit je Mahlzeit — `meals` fuehrt nur `entry_date`.',
  aktivitaet: 'Ereignisse mit Zeitstempel aus allen Modulen — es gibt nur Mahlzeiten, und die ohne Uhrzeit.',
} as const

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

  const kcal = summe?.macros.enercc.value ?? null
  const zielKcal = ziele?.kcal ?? null

  return (
    <>
      <ModuleHero
        icon="dashboard"
        title="Today"
        sub={tagText(datum)}
        pills={
          <>
            <Pill>{tagText(datum).split(',')[0]}</Pill>
            <Pill variant="acc">{bewertbar.length > 0 ? 'Nutrition live' : 'ohne Daten'}</Pill>
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

      {/* ============================================================
          Die vier KPI-Kacheln der Vorlage: Recovery, Training Load,
          Calories, Sleep. Nur „Calories" hat eine Quelle.
          ============================================================ */}
      <div className="v2-grid v2-g-cols-4" style={{ marginTop: 16, marginBottom: 16 }}>
        <div className="v2-card v2-attrappe" style={{ padding: 0 }}>
          <KPI label="Recovery" value="—" unit="/100" delta={BRAUCHT.recovery} />
          <AttrappenMarke />
        </div>
        <div className="v2-card v2-attrappe" style={{ padding: 0 }}>
          <KPI label="Training Load" value="—" unit="TSS · 7d" delta={BRAUCHT.training} />
          <AttrappenMarke />
        </div>
        <KPI
          label="Kalorien"
          value={kcal === null ? '—' : Math.round(kcal).toLocaleString('de-DE')}
          unit={zielKcal ? `/ ${Math.round(zielKcal).toLocaleString('de-DE')}` : 'ohne Ziel'}
          delta={
            kcal !== null && zielKcal
              ? `${Math.round(zielKcal - kcal).toLocaleString('de-DE')} kcal offen`
              : 'kein Tagesziel gesetzt'
          }
          spark={kcalVerlauf.length >= 2 ? kcalVerlauf : undefined}
          sparkColor="var(--acc-nutri)"
        />
        <div className="v2-card v2-attrappe" style={{ padding: 0 }}>
          <KPI label="Schlaf · zuletzt" value="—" unit="Std." delta={BRAUCHT.schlaf} />
          <AttrappenMarke />
        </div>
      </div>

      {/* ============================================================
          Hauptraster 1.4fr / 1fr — wie in der Vorlage.
          ============================================================ */}
      <div className="v2-dash-grid">
        {/* ---------- Linke Spalte ---------- */}
        <div className="v2-col-gap" style={{ gap: 16 }}>
          {/* Tagesablauf — Vorlage: „Today's flow" */}
          <Card
            title="Tagesablauf"
            sub="06:30 — 22:00"
            attrappe={BRAUCHT.ablauf}
          >
            <div className="v2-attrappe-flaeche" style={{ height: 96 }} />
          </Card>

          {/* Makros — die erste echte Kachel */}
          <Card
            title="Makros · heute"
            sub={ziele ? `Ziele seit ${ziele.gueltig_ab}` : 'ohne Tagesziel'}
            actions={
              <Link href={'/v2/nutrition' as Route} className="v2-btn v2-btn-ghost"
                    style={{ height: 22, fontSize: 11, padding: '0 8px' }}>
                Nutrition <Icon name="arrow_right" className="v2-ic v2-ic-sm" />
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

          {/* Aktivitaet — Vorlage: „Activity · Live" */}
          <Card title="Aktivitaet" sub="Live" attrappe={BRAUCHT.aktivitaet}>
            <div className="v2-attrappe-flaeche" style={{ height: 120 }} />
          </Card>
        </div>

        {/* ---------- Rechte Spalte ---------- */}
        <div className="v2-col-gap" style={{ gap: 16 }}>
          {/* Readiness */}
          <Card title="Readiness" sub="Composite · 7d" attrappe={BRAUCHT.recovery}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
              <Ring value={0} max={100} color="var(--acc-train)" label="—" size={108} stroke={7} />
              <div style={{ flex: 1, fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.45 }}>
                Der zusammengesetzte Wert braucht Recovery, Schlafqualitaet
                und HRV. Keine dieser Groessen wird heute erfasst.
              </div>
            </div>
            <div className="v2-col-gap" style={{ gap: 6 }}>
              {['Recovery', 'Schlafqualitaet', 'Muskelkater', 'Ernaehrung', 'Stress'].map(k => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11 }}>
                  <span style={{ width: 96, color: 'var(--fg-muted)' }}>{k}</span>
                  <div style={{ flex: 1 }}><Meter value={0} /></div>
                  <span className="v2-num" style={{ width: 28, textAlign: 'right' }}>—</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Body battery */}
          <Card title="Body battery" sub="vs. 14-Tage-Basis" attrappe={BRAUCHT.recovery}>
            <div className="v2-attrappe-flaeche" style={{ height: 120 }} />
          </Card>

          {/* Tonight */}
          <Card title="Tonight" sub="18:00" accent="var(--acc-train)" attrappe={BRAUCHT.training}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: 'var(--fg-muted)' }}>
              Keine Einheit geplant
            </div>
            <div className="v2-grid v2-g-cols-3" style={{ gap: 6, marginTop: 10 }}>
              {['Saetze', 'Volumen', 'Dauer'].map(l => (
                <div key={l} style={{ padding: '8px 10px', background: 'var(--surface-2)', borderRadius: 6 }}>
                  <div className="v2-eyebrow" style={{ marginBottom: 2 }}>{l}</div>
                  <div className="v2-num" style={{ fontSize: 14 }}>—</div>
                </div>
              ))}
            </div>
          </Card>

          {/* PR watch */}
          <Card title="PR watch" sub="letzte 30 Tage" attrappe={BRAUCHT.training}>
            <div className="v2-attrappe-flaeche" style={{ height: 84 }} />
          </Card>
        </div>
      </div>

      {/* ============================================================
          Was die Vorlage nicht hat, die Daten aber verlangen: die
          Naehrstoffdeckung und der Energieverlauf. Beide stammen aus
          G-05 und bleiben — sie zeigen, was C-48 verlangt, und ohne sie
          waere die einzige echte Aussage des Dashboards eine Zahl.
          ============================================================ */}
      <div className="v2-grid v2-g-cols-2" style={{ marginTop: 16, alignItems: 'start' }}>
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
              {leer
                ? 'Fuer diesen Tag ist nichts erfasst — ohne Positionen gibt es nichts zu bewerten.'
                : 'Ohne erfasste Positionen gibt es nichts zu bewerten.'}
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

        <Card
          title="Energie, letzte sieben Tage"
          sub={kcalVerlauf.length > 0 ? `${kcalVerlauf.length} Tage mit Eintrag` : 'keine Eintraege'}
        >
          {kcalVerlauf.length >= 2 ? (
            <>
              <LineChart
                series={[{ data: kcalVerlauf, color: 'var(--acc-nutri)' }]}
                h={120}
                showArea
              />
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
              {zielKcal != null && (
                <div style={{ marginTop: 10 }}>
                  <Meter
                    value={kcalVerlauf.reduce((a, b) => a + b, 0) / kcalVerlauf.length}
                    max={zielKcal}
                  />
                  <div style={{ fontSize: 10.5, color: 'var(--fg-dim)', marginTop: 4 }}>
                    Schnitt gegen das heutige Ziel von {Math.round(zielKcal)} kcal.
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
    </>
  )
}

/**
 * Die Marke fuer Attrappen, die keine `Card` sind.
 *
 * `KPI` bringt seinen eigenen Rahmen mit und nimmt keine `attrappe`-
 * Requisite — die Marke sitzt deshalb darueber statt im Kopf.
 */
function AttrappenMarke() {
  return (
    <div style={{ position: 'absolute', top: 8, right: 8 }}>
      <Pill variant="warn">Attrappe</Pill>
    </div>
  )
}
