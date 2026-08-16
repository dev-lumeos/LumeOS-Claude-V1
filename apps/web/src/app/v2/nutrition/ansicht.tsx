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
  Card, Pill, Icon, Row, ModuleHero, ProgressRing, CoverageRow, Ring,
  type ReferenceStatus, type ReferenceDirection, type TabItem,
} from '@lumeos/ui'
import { Tableiste } from './tableiste'
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

/**
 * Die sieben Tabs der Vorlage — Reihenfolge und Benennung uebernommen.
 *
 * `[cmd]` `module-nutrition.jsx` Zeile 28-36. `Diary` traegt dort einen
 * Zaehler (3 = Mahlzeiten), `Nutrients` einen (138). Der erste wird hier
 * aus den Daten gefuellt, der zweite bleibt fest: `[cmd]` es sind die
 * 138 Naehrstoffe des BLS, keine Tagesgroesse.
 */
function tabs(mahlzeiten: number | null): TabItem[] {
  return [
    { id: 'diary',     label: 'Diary',       icon: 'edit',     count: mahlzeiten ?? undefined },
    { id: 'insights',  label: 'Insights',    icon: 'sparkles' },
    { id: 'nutrients', label: 'Nutrients',   icon: 'layers',   count: 138 },
    { id: 'foods',     label: 'Food DB',     icon: 'search' },
    { id: 'plans',     label: 'Meal plans',  icon: 'calendar' },
    { id: 'prefs',     label: 'Preferences', icon: 'settings' },
    { id: 'planner',   label: 'Planner',     icon: 'calendar' },
  ]
}

export function TagebuchAnsicht({
  datum, tab, summe, bewertung, fehler, bewertungFehler, ziele, vorschlag, zielFehler,
}: {
  datum: string
  tab: string
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
      {/* Kopfzeile wie in der Vorlage: Titel, Datum, „138-nutrient
          tracking", Herkunftszeile, Aktionen rechts.
          [cmd] Die Vorlage nennt „BLS 4.0 · Max Rubner-Institut" — das
          ist die Quelle, die auch hier liegt. */}
      <ModuleHero
        icon="nutrition"
        title="Nutrition"
        sub="Tagebuch, Mikronaehrstoff-Analyse und Planung · BLS 4.0 · Max Rubner-Institut"
        pills={
          <>
            <Pill>{tagText(datum)}</Pill>
            <Pill variant="acc">138-nutrient tracking</Pill>
          </>
        }
        actions={
          <>
            <Link
              href={`/v2/nutrition?datum=${vortag(datum)}` as Route}
              className="v2-btn v2-btn-ghost"
              aria-label="Vorheriger Tag"
            >
              <Icon name="chevron_left" className="v2-ic v2-ic-sm" />
            </Link>
            <Link
              href={`/v2/nutrition?datum=${folgetag(datum)}` as Route}
              className="v2-btn v2-btn-ghost"
              aria-label="Naechster Tag"
            >
              <Icon name="chevron_right" className="v2-ic v2-ic-sm" />
            </Link>
            <Link href={'/v2/nutrition?tab=foods' as Route} className="v2-btn">
              <Icon name="search" className="v2-ic v2-ic-sm" /> Lebensmittel suchen
            </Link>
          </>
        }
        stats={[
          { label: 'Mahlzeiten', value: summe ? String(summe.meal_count) : '—' },
          { label: 'Positionen', value: summe ? String(summe.item_count) : '—' },
          {
            label: 'Bewertbar',
            value: bewertbar.length > 0 ? `${erreicht}/${bewertbar.length}` : '—',
            sub: bewertbar.length > 0 ? 'Referenz gedeckt' : undefined,
          },
        ]}
      />

      <Tableiste items={tabs(summe?.meal_count ?? null)} aktiv={tab} />

      {tab !== 'diary' && <AndererTab tab={tab} />}
      {tab === 'diary' && (
      <>

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

      {/* Die Diary-Anordnung der Vorlage: links Tagessumme und
          Mahlzeitenkarten, rechts die drei Begleitkarten.
          [cmd] `module-nutrition.jsx` Zeile 184: gridTemplateColumns
          "1.5fr 1fr". */}
      <div className="v2-diary-grid" style={{ marginTop: 16 }}>
        <div className="v2-col-gap" style={{ gap: 12 }}>
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

        {/* Die Mahlzeitenkarten der Vorlage. Hier ist es die Erfassung
            aus C-03 — sie fuehrt dieselben Mahlzeiten, kann aber
            zusaetzlich schreiben. */}
        <Erfassen datum={datum} />
        </div>

        {/* ---------- Rechte Spalte der Vorlage ---------- */}
        <div className="v2-col-gap" style={{ gap: 12 }}>
        <Card
          title="Smart suggestions"
          sub="based on your patterns"
          attrappe="Vorschlaege brauchen erkannte Muster ueber viele Tage — es gibt keine Musterauswertung."
        >
          <div className="v2-attrappe-flaeche" style={{ height: 120 }} />
        </Card>

        {/* [read] Der Auftrag: „Der Nutrition score steht im Entwurf auf
            1 bei Schwellen ok >= 80 — er gehoert zu C-49. Als Attrappe
            zeigen, keinen Wert erfinden." Genau deshalb steht hier ein
            Ring auf 0 mit „—", nicht die 1 aus dem Entwurf: eine
            uebernommene Zahl waere eine erfundene Messung. */}
        <Card
          title="Nutrition score"
          sub="deterministisch · ohne KI"
          attrappe="Die Gewichtung — welcher Naehrstoff wie stark zaehlt — ist C-49 und in keiner Spec entschieden."
        >
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <Ring value={0} max={100} color="var(--acc-nutri)" label="—" size={92} stroke={7} />
            <div style={{ flex: 1, fontSize: 11.5, color: 'var(--fg-muted)', lineHeight: 1.45 }}>
              Der Entwurf zeigt hier eine Zahl mit der Schwelle
              „ok ab 80". Welche Groessen sie bilden und wie stark jede
              zaehlt, steht in keiner Spec — deshalb bleibt das Feld leer
              statt gefuellt.
            </div>
          </div>
        </Card>

        <Card
          title="Pending actions"
          sub="feeds Buddy's daily TODO"
          attrappe="Offene Punkte entstehen aus Regeln ueber mehrere Module — Buddy ist seit G-02 eine Attrappe."
        >
          <div className="v2-attrappe-flaeche" style={{ height: 96 }} />
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
      </div>
      </>
      )}
    </>
  )
}

/**
 * Die sechs Tabs, die die Vorlage zeigt und fuer die es noch keine
 * Daten gibt.
 *
 * `[read]` Nicht weglassen, sondern kennzeichnen: „Was markiert ist,
 * ist offen." Wer den Tab anklickt, sieht, woran es haengt — und nicht
 * eine leere Flaeche, die nach einem Fehler aussieht.
 *
 * `Food DB` ist die Ausnahme: die Suche gibt es (G-03), sie liegt unter
 * `/v2/nutrition/suche` und wird von dort verlinkt statt hier doppelt
 * eingebaut.
 */
function AndererTab({ tab }: { tab: string }) {
  const inhalt: Record<string, { titel: string; braucht: string }> = {
    insights: {
      titel: 'Insights',
      braucht: 'Auswertungen ueber Zeitraeume — heute gibt es nur die Tagessumme. `daily_summary` fuehrt keine Wochen- oder Monatswerte.',
    },
    nutrients: {
      titel: 'Nutrients',
      braucht: 'Die Deckung je Naehrstoff steht im Tagebuch. Die eigene Ansicht mit Verlauf je Naehrstoff braucht Verlaufsdaten.',
    },
    plans: {
      titel: 'Meal plans',
      braucht: 'Ein Schema fuer Essensplaene — es gibt keines.',
    },
    prefs: {
      titel: 'Preferences',
      braucht: 'Ernaehrungsvorlieben und Unvertraeglichkeiten am Profil — die Spalten fehlen.',
    },
    planner: {
      titel: 'Planner',
      braucht: 'Planung kuenftiger Tage. `meals` kennt nur erfasste Tage, keine geplanten.',
    },
  }

  if (tab === 'foods') {
    return (
      <div style={{ marginTop: 16 }}>
        <Card title="Food DB" sub="Lebensmittelsuche">
          <p style={{ fontSize: 12.5, color: 'var(--fg-muted)', lineHeight: 1.55 }}>
            Die Suche steht als eigene Seite.{' '}
            <Link href={'/v2/nutrition/suche' as Route} className="v2-link">
              Lebensmittel suchen
            </Link>
          </p>
        </Card>
      </div>
    )
  }

  const t = inhalt[tab]
  if (!t) return null
  return (
    <div style={{ marginTop: 16 }}>
      <Card title={t.titel} sub="in der Vorlage vorgesehen" attrappe={t.braucht}>
        <div className="v2-attrappe-flaeche" style={{ height: 160 }} />
      </Card>
    </div>
  )
}

/** Ein Tag zurueck, als YYYY-MM-DD. */
function vortag(datum: string): string {
  return verschiebe(datum, -1)
}

/** Ein Tag vor, als YYYY-MM-DD. */
function folgetag(datum: string): string {
  return verschiebe(datum, 1)
}

function verschiebe(datum: string, tage: number): string {
  const d = new Date(`${datum}T00:00:00`)
  d.setDate(d.getDate() + tage)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const t = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${t}`
}
