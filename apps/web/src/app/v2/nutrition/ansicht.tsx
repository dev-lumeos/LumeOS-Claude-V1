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
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import type { Route } from 'next'
import {
  Card, Pill, Icon, Row, ProgressRing, CoverageRow, Meter,
  InEntwicklungKnopf,
  type ReferenceStatus, type ReferenceDirection, type TabItem,
} from '@lumeos/ui'
import { Tableiste } from './tableiste'
import {
  SmartSuggestionsCard, NutritionScoreCard, NutritionPendingActions,
  PreWorkoutOptimizer, MicronutrientSnapshot, BelowThreshold,
} from './diary-entwurf'
import { HydrationKachel } from './hydration'
// G-101: die zwei Mikronaehrstoff-Kacheln mit echten Werten.
import { MikroSchnappschuss, UnterSchwelle } from './mikro-kacheln'
import type { MikroStand } from '../../../lib/nutrition/mikro-read'
// G-101/C-54: die Naehrstoffordnung — der Baum kommt aus `parent_code`
// (C-161), nicht aus `display_tier`. `[cmd]` G-140: hier stand
// *„aus display_tier"*, und genau dieses Missverstaendnis hat G-101
// die Einrueckung falsch bauen lassen.
import { NaehrstoffOrdnungTab } from './naehrstoff-ordnung-tab'
import type { NaehrstoffOrdnung } from '../../../lib/nutrition/naehrstoff-ordnung'
// G-101: zwei Insights-Kacheln mit echten Zahlen.
import { KalorienbilanzKachel, MakroschnittKachel } from './insights-echt'
import type { InsightsStand } from '../../../lib/nutrition/insights-read'
import type { HydrationDay } from '../../../lib/nutrition/hydration-day-read'
import { NutrientAnalysisView } from './nutrients-entwurf'
import type { DailySummaryRow, SummaryMacro } from '../../../lib/nutrition/diary-summary'
import type { ReferenceAssessmentRow } from '../../../lib/nutrition/reference-assessment-read'
import type { Zielvorschlag, Zielwerte } from '../../../lib/profile/zielwerte-read'
import { Zielhinweis } from './zielhinweis'
import { Mahlzeiten } from './mahlzeiten'
import { Datumsnavigation, Zukunftshinweis } from './datumsnavigation'
// G-38: die Tabs, die bisher nur als Attrappen-Platzhalter dastanden.
import { NutritionInsightsTab } from './tab-insights'
import { MealPlansTab } from './tab-plans'
import { FoodPreferencesTab } from './tab-prefs'
// G-65: derselbe Tab mit echten Daten.
import { VorliebenTab, type VorliebenDaten } from './tab-vorlieben'
import { NutritionPlannerTab } from './tab-planner'
// G-97: der Planner mit echten Daten (C-150).
import { PlannerEchtTab } from './tab-planner-echt'
import type { PlanDaten } from '../../../lib/nutrition/plan-lesen'
// G-66: der Food-DB-Tab in der Form des Entwurfs.
import { NutritionFoodsTab } from './tab-foods'
import type { NutritionFoodSearchPayload } from '../../../lib/nutrition/food-search'
import { Kopfknoepfe } from './kopfknoepfe'
import './nutrition.css'

/** Die vier Makros, die die Vorlage oben zeigt. */
const HAUPTMAKROS: Array<{
  code: SummaryMacro
  label: string
  unit: string
  color: string
  /** Das passende Feld in goals.nutrition_targets. */
  zielFeld: 'kcal' | 'protein_g' | 'carbs_g' | 'fat_g'
}> = [
  // A-14: `label` ist der SCHLUESSEL, nicht der Text — uebersetzt wird
  // erst in der Komponente, wo `t` vorliegt.
  { code: 'enercc',  label: 'kalorien',      unit: 'kcal', color: 'var(--acc-nutri)', zielFeld: 'kcal' },
  { code: 'prot625', label: 'protein',       unit: 'g',    color: 'var(--acc-train)', zielFeld: 'protein_g' },
  { code: 'cho',     label: 'kohlenhydrate', unit: 'g',    color: 'var(--acc-recov)', zielFeld: 'carbs_g' },
  { code: 'fat',     label: 'fett',          unit: 'g',    color: 'var(--acc-goals)', zielFeld: 'fat_g' },
]

const WEITERE_MAKROS: Array<{ code: SummaryMacro; label: string; unit: string }> = [
  { code: 'fibt', label: 'ballaststoffe', unit: 'g' },
  { code: 'sugar', label: 'zucker', unit: 'g' },
  { code: 'fasat', label: 'gesaettigt', unit: 'g' },
  { code: 'nacl', label: 'salz', unit: 'g' },
  { code: 'water_g', label: 'wasser', unit: 'g' },
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

export async function TagebuchAnsicht({
  datum, tab, summe, bewertung, fehler, bewertungFehler, ziele, vorschlag, zielFehler, wasser,
  istAdmin = false, foodsStart = null, vorlieben = null, plan = null, mikro = null, ordnung = null, einsichten = null,
  unvertraeglichkeiten = [],
}: {
  /** G-154: fuer den Hinweis im Foods-Tab. */
  unvertraeglichkeiten?: string[]
  datum: string
  tab: string
  /** G-14: nur Admins duerfen in die Zukunft blaettern. */
  istAdmin?: boolean
  summe: DailySummaryRow | null
  bewertung: ReferenceAssessmentRow[]
  fehler: string | null
  bewertungFehler?: string | null
  ziele?: Zielwerte | null
  vorschlag?: Zielvorschlag | null
  zielFehler?: string | null
  wasser?: HydrationDay | null
  /** G-66: die erste Trefferseite des Food-DB-Tabs. */
  foodsStart?: NutritionFoodSearchPayload | null
  /** G-65: die Vorlieben, wenn der Tab gezeigt wird. */
  vorlieben?: VorliebenDaten | null
  /** G-97: der Wochenplan, wenn der Planner-Tab gezeigt wird. */
  plan?: PlanDaten | null
  /** G-101: Mikronaehrstoffe und Schwellenunterschreitungen. */
  mikro?: MikroStand | null
  /** G-101/C-54: die Naehrstoffordnung, wenn der Tab gezeigt wird. */
  ordnung?: NaehrstoffOrdnung | null
  /** G-101: Kalorienbilanz und Makroschnitt. */
  einsichten?: InsightsStand | null
}) {
  // A-14: Serverkomponente — `getTranslations`, nicht `useTranslations`.
  const t = await getTranslations('Nutrition')
  const tA = await getTranslations('Allgemein')
  const leer = !summe || summe.item_count === 0

  // Der Profilzustand steht in jeder Zeile gleich — eine reicht.
  const profilFehlt = bewertung.length > 0 &&
    bewertung[0].reference_status === 'missing_profile'

  const bewertbar = bewertung.filter(b => b.reference_status === 'complete')
  const erreicht = bewertbar.filter(b =>
    b.reference_direction === 'target' && (b.reference_pct ?? 0) >= 100).length

  return (
    <>
      {/* [cmd] module-nutrition.jsx:9-26 — `module-header
          module-hero-lite` mit Titelblock links und Aktionen rechts.
          NICHT `ModuleHero` aus G-02: der ist ein anderer Kopf mit
          Medaillon und Kennzahlenblock, den die Vorlage hier nicht hat.
          Er quetschte den Titelblock in eine schmale Spalte.

          G-73, Tom 2026-08-19 — drei Aenderungen:
            1. `‹ Heute ›` steht MITTIG, nicht mehr rechts bei den
               Aktionsknoepfen.
            2. Die Datumspille links ist weg — „haben wir ja in der
               Mitte."
            3. `BLS 4.0 · Max Rubner-Institut` ist aus dem Untertitel
               heraus. `[read]` Geprueft, bevor entfernt wurde: die
               BLS-Dokumentation nennt in Kapitel 9.2 eine EMPFOHLENE
               Zitierweise und stellt den Bestand in 9.3 „kostenfrei
               und ohne Lizenzbarrieren" bereit — es gibt keine
               Pflicht zur Nennung in der Oberflaeche. Die Herkunft
               bleibt in der Trefferliste (Spalte `SOURCE`) und in
               docs/ssot/45-bls-dokumentation.md. */}
      <div className="v2-module-header v2-module-hero-lite v2-nutri-kopf">
        <div className="v2-module-title-block">
          <div className="v2-module-title-row">
            <span className="v2-module-title">Nutrition</span>
            <Pill variant="acc">138-nutrient tracking</Pill>
          </div>
          <div className="v2-module-sub">
            {t('untertitel')}
          </div>
        </div>

        {/* G-14: `‹ Heute ›` als Einheit. Vorher zwei blasse Pfeile
            hier — sichtbar erst, wenn man wusste, dass es sie gibt.
            G-73: eigene Spalte in der Mitte. */}
        <div className="v2-nutri-kopf-mitte">
          <Datumsnavigation datum={datum} istAdmin={istAdmin} />
        </div>

        <div className="v2-module-actions">
          {/* G-38: Quick-add und MealCam oeffnen jetzt die Fenster der
              Vorlage statt „in Entwicklung". Sie stehen in einer
              Client-Insel, weil diese Ansicht eine async
              Server-Komponente ist und keinen Zustand halten kann.
              „Find food" bleibt dazwischen — Reihenfolge der Vorlage. */}
          <Kopfknoepfe
            kinder={(
              <Link href={'/v2/nutrition/suche' as Route} className="v2-btn">
                <Icon name="search" className="v2-ic v2-ic-sm" /> Find food
              </Link>
            )}
          />
        </div>
      </div>

      <Tableiste items={tabs(summe?.meal_count ?? null)} aktiv={tab} />

      <Zukunftshinweis datum={datum} />

      {tab !== 'diary' && (
        <AndererTab tab={tab} foodsStart={foodsStart} vorlieben={vorlieben} plan={plan} ordnung={ordnung} einsichten={einsichten} unvertraeglichkeiten={unvertraeglichkeiten} />
      )}
      {tab === 'diary' && (
      <>

      {fehler && (
        <div className="v2-insight v2-neg" style={{ marginTop: 16 }}>
          <div className="v2-insight-mark" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="v2-insight-title">{t('summeNichtLesbar')}</div>
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
        {/* Day summary strip — EIN Kalorienring, DREI lineare Balken.
            [cmd] module-nutrition.jsx:188-218. Der vorige Durchgang
            hatte daraus vier Ringe gemacht; das ist zurueckgenommen.
            Angebunden: die Werte kommen aus daily_summary, die Ziele aus
            goals.zielwerte_am. Fehlt ein Ziel, bleibt der Nenner „—" —
            der Ring fuellt sich dann nicht (G-03). */}
        <Card>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <ProgressRing
                value={summe?.macros.enercc.value ?? null}
                target={ziele?.kcal ?? null}
                showPercent={ziele?.kcal != null}
                unit="kcal"
                size={96}
                color="var(--acc-nutri)"
                incomplete={(summe?.macros.enercc.missing ?? 0) > 0}
              />
              <div className="v2-num" style={{ fontSize: 10, color: 'var(--fg-dim)' }}>
                {summe?.macros.enercc.value != null && ziele?.kcal != null
                  ? t('kcalOffen', { menge: Math.round(ziele.kcal - summe.macros.enercc.value).toLocaleString('de-DE') })
                  : t('ohneTagesziel')}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {HAUPTMAKROS.filter(m => m.code !== 'enercc').map(m => {
                const wert = summe?.macros[m.code]?.value ?? null
                const ziel = ziele ? ziele[m.zielFeld] : null
                const pct = wert !== null && ziel ? Math.round((wert / ziel) * 100) : null
                return (
                  <div key={m.code}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 5 }}>
                      {/* ABWEICHUNG MIT GRUND: die Vorlage setzt hier
                          `width: 56` fuer „Protein"/„Carbs"/„Fat". Die
                          deutschen Woerter sind laenger
                          („Kohlenhydrate"), sie liefen bei fester
                          Breite in die Zahl daneben. Deshalb
                          `minWidth` statt `width`. */}
                      <span className="v2-eyebrow" style={{ minWidth: 56, flexShrink: 0 }}>{t(m.label)}</span>
                      <span className="v2-num" style={{ fontSize: 14, fontWeight: 500 }}>
                        {wert === null ? '—' : Math.round(wert)}
                        <span style={{ fontSize: 10, color: 'var(--fg-dim)', marginLeft: 1 }}>
                          /{ziel === null ? '—' : Math.round(ziel)}g
                        </span>
                      </span>
                      <span className="v2-num v2-dim" style={{ fontSize: 10, marginLeft: 'auto' }}>
                        {wert !== null && ziel !== null ? t('gLeft', { menge: Math.round(ziel - wert) }) : ''}
                      </span>
                      <span className="v2-num" style={{
                        fontSize: 11, width: 34, textAlign: 'right',
                        color: pct !== null && pct >= 100 ? 'var(--pos)' : 'var(--fg-muted)',
                      }}>
                        {pct === null ? '—' : `${pct}%`}
                      </span>
                    </div>
                    <Meter value={wert ?? 0} max={ziel ?? 100} color={m.color} tall />
                  </div>
                )
              })}
            </div>
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
                  label={t(m.label)}
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

        {/* Die Mahlzeitenkarten der Vorlage — Anzeige wie dort,
            Bearbeitung ueber `+` und `···`. Ersetzt das Formular aus
            C-03, das je Zeile ein Eingabefeld hatte. */}
        <Mahlzeiten datum={datum} />
        </div>

        {/* ---------- Rechte Spalte, Reihenfolge der Vorlage ----------
            [cmd] module-nutrition.jsx:227-289. Sieben Kacheln, alle mit
            ihren Entwurfszahlen uebernommen — inklusive Nutrition score
            (Formel aus module-nutrition-spec.jsx), Pre-workout 68 und
            Hydration 1.2/3.0 L. Die Deckung je Naehrstoff steht als
            achte darunter: sie ist angebunden und ersetzt nichts. */}
        <div className="v2-col-gap" style={{ gap: 12 }}>
        <SmartSuggestionsCard />
        <NutritionScoreCard />
        <NutritionPendingActions />
        <PreWorkoutOptimizer />
        {/* ANGEBUNDEN: hydration_day. Deshalb keine Marke mehr — und
            zwei Farben, weil die Vorlage die beiden Herkuenfte nicht
            unterscheidet. */}
        <HydrationKachel tag={wasser ?? null} datum={datum} />
        {/* G-101: angebunden an `micronutrient_snapshot` und
            `micronutrient_below_threshold`. Ohne Daten bleibt der
            Entwurf mit seiner Marke stehen — dasselbe Muster wie bei
            den Vorlieben (G-65). */}
        {mikro && mikro.zeilen.length > 0
          ? <MikroSchnappschuss d={mikro} />
          : <MicronutrientSnapshot />}
        {mikro && mikro.zeilen.length > 0
          ? <UnterSchwelle d={mikro} />
          : <BelowThreshold />}

        <Card
          title={t('deckungTitel')}
          sub={t('bewertet', { anzahl: bewertung.length })}
          actions={
            bewertbar.length > 0
              ? <Pill variant="acc">{t('mitReferenz', { anzahl: bewertbar.length })}</Pill>
              : undefined
          }
        >
          {profilFehlt && (
            <div className="v2-insight v2-warn" style={{ marginBottom: 12 }}>
              <div className="v2-insight-mark" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="v2-insight-title">{t('profilUnvollstaendig')}</div>
                <div className="v2-insight-body">
                  {t('profilHinweis')}
                </div>
              </div>
            </div>
          )}

          {bewertungFehler && (
            <div className="v2-insight v2-neg" style={{ marginBottom: 12 }}>
              <div className="v2-insight-mark" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="v2-insight-title">{t('bewertungNichtLesbar')}</div>
                <div className="v2-insight-body">{bewertungFehler}</div>
              </div>
            </div>
          )}

          {bewertung.length === 0 && !bewertungFehler && (
            <p className="v2-muted" style={{ fontSize: 12 }}>
              {t('ohnePositionen')}
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
              <strong>{t('regel100')}</strong> {t('referenzHinweis')}
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
function AndererTab({
  tab, foodsStart, vorlieben, plan, ordnung, einsichten, unvertraeglichkeiten = [],
}: {
  tab: string
  /** G-154: die gesetzten Unvertraeglichkeiten (`strong`). */
  unvertraeglichkeiten?: string[]
  /** G-66: die erste Trefferseite, serverseitig geladen. */
  foodsStart?: NutritionFoodSearchPayload | null
  /** G-65: der gespeicherte Vorliebenstand. */
  vorlieben?: VorliebenDaten | null
  plan?: PlanDaten | null
  /** G-101/C-54: die Naehrstoffordnung. */
  ordnung?: NaehrstoffOrdnung | null
  /** G-101: Kalorienbilanz und Makroschnitt. */
  einsichten?: InsightsStand | null
}) {
  const inhalt: Record<string, { titel: string; braucht: string }> = {
    insights: {
      titel: 'Insights',
      braucht: 'Auswertungen ueber Zeitraeume — heute gibt es nur die Tagessumme. `daily_summary` fuehrt keine Wochen- oder Monatswerte.',
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

  // Der Naehrstoffbaum der Vorlage — vollstaendig uebernommen.
  if (tab === 'nutrients') {
    // G-101: die echte Ordnung, sobald sie gelesen ist. Ohne
    // sie bleibt der Entwurf stehen — 79 erfundene Eintraege, aber mit
    // Marke; dasselbe Muster wie bei den Vorlieben (G-65).
    return (
      <div style={{ marginTop: 16 }}>
        {ordnung && ordnung.gruppen.length > 0
          ? <NaehrstoffOrdnungTab d={ordnung} />
          : <NutrientAnalysisView />}
      </div>
    )
  }

  // G-38: vier Tabs, die bis hierher nur einen Platzhalter zeigten.
  // Sie sind nach der Vorlage gebaut und weiterhin Attrappe — jede
  // Kachel traegt den Hinweis, woran die Anbindung haengt.
  if (tab === 'insights') {
    // G-101: zwei der drei Kacheln lesen echt. Der Rest des Entwurfs
    // steht darunter, mit Marke — der Mikronaehrstoff-Trend braucht
    // eine Referenz je Tag, siehe Bericht 152.
    return (
      <div style={{ marginTop: 16 }}>
        {einsichten && (einsichten.bilanz || einsichten.makros) && (
          <div className="v2-grid v2-g-cols-2" style={{ gap: 16, marginBottom: 16 }}>
            <KalorienbilanzKachel d={einsichten} />
            <MakroschnittKachel d={einsichten} />
          </div>
        )}
        <NutritionInsightsTab />
      </div>
    )
  }
  if (tab === 'plans') {
    return <div style={{ marginTop: 16 }}><MealPlansTab /></div>
  }
  if (tab === 'prefs') {
    // `[cmd]` SEIT G-65 ECHT. Ohne geladene Vorlieben (keine Sitzung)
    // bleibt der Entwurf mit seiner Marke stehen — dasselbe Muster wie
    // beim Exercises-Tab in G-64: eine leere echte Kachel saehe aus wie
    // ein Befund und waere doch nur ein fehlendes Cookie.
    return (
      <div style={{ marginTop: 16 }}>
        {vorlieben ? <VorliebenTab d={vorlieben} /> : <FoodPreferencesTab />}
      </div>
    )
  }
  if (tab === 'planner') {
    // `[cmd]` SEIT G-97 ECHT, sobald ein Plan gelesen wurde. Dasselbe
    // Muster wie bei `prefs` (G-65): ohne Sitzung oder ohne Plan bleibt
    // der Entwurf mit seiner Marke stehen — eine leere echte Flaeche
    // saehe aus wie ein Befund und waere doch nur ein fehlendes Cookie.
    return (
      <div style={{ marginTop: 16 }}>
        {plan ? <PlannerEchtTab d={plan} /> : <NutritionPlannerTab />}
      </div>
    )
  }

  if (tab === 'foods') {
    // G-66: der Tab in der Form des Entwurfs, mit echten Daten.
    // `[read]` Bis G-66 stand hier ein Satz und ein Link. Der
    // G-38-Bericht hatte das begruendet („die Vorlage hat zwoelf feste
    // Zeilen, die Umsetzung eine echte BLS-Suche") — das war richtig,
    // solange die Suche die einzige Form war. Jetzt hat der Tab die
    // Form des Entwurfs UND die echte Suche dahinter.
    // G-154: Die Unvertraeglichkeiten entscheiden, ob der
    // Einblenden-Schalter ueberhaupt erscheint.
    return (
      <NutritionFoodsTab
        start={foodsStart ?? null}
        unvertraeglichkeiten={unvertraeglichkeiten}
      />
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

