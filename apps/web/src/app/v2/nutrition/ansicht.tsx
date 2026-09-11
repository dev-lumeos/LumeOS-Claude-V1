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
import { ReferenzTrenner } from '../../../components/shell/referenz-trenner'
import { Tableiste } from './tableiste'

/** C-418/3: die Quelle unter der Trennlinie. */
const QUELLE = 'theme-v1/module-nutrition.jsx'
import {
  // G-263: `SmartSuggestionsCard` ist hier raus — die Kachel ist
  // entfernt, nicht nur abgeschaltet (Begruendung am Renderort).
  // G-412: vier Entwuerfe sind entfernt — der Score ist angebunden,
  // die anderen drei standen doppelt (Gruende am Renderort).
  NutritionPendingActions,
} from './diary-entwurf'
import { HydrationKachel } from './hydration'
// G-101: die zwei Mikronaehrstoff-Kacheln mit echten Werten.
import { MikroSchnappschuss, UnterSchwelle } from './mikro-kacheln'
// G-412/1: der angebundene Score.
import { ScoreEcht } from './score-echt'
import type { ScoreStand } from '../../../lib/nutrition/score-read'
import type { MikroStand } from '../../../lib/nutrition/mikro-read'
// G-101/C-54: die Naehrstoffordnung — der Baum kommt aus `parent_code`
// (C-161), nicht aus `display_tier`. `[cmd]` G-140: hier stand
// *„aus display_tier"*, und genau dieses Missverstaendnis hat G-101
// die Einrueckung falsch bauen lassen.
// C-48: die Lage des Tages und die Fehlzaehler (Regel 1).
import {
  tageslageVon, lageSatz, lueckenVon, lueckenSatz, gesamtLueckenSatz,
  LAGE_TITEL,
} from '../../../lib/nutrition/tageslage'
import { NaehrstoffOrdnungTab } from './naehrstoff-ordnung-tab'
import type { NaehrstoffOrdnung } from '../../../lib/nutrition/naehrstoff-ordnung'
// G-101: zwei Insights-Kacheln mit echten Zahlen.
import { KalorienbilanzKachel, MakroschnittKachel } from './insights-echt'
// G-289/G-288/G-300: Rezepte, Einkaufslisten - SPEC_03 Flow 7 und 8.
import { RezepteTab } from './rezepte-echt'
// C-372/G-306/E-41: die Werkbank - alle Plaene, neu, Kopie.
import { PlanWerkbank } from './plan-werkbank-ui'
// G-291/292/293/295: die vier fehlenden Kacheln aus SPEC_10.
import {
  TrendKachel, HeatmapKachel, MakroDetailKachel, WarnungenKachel,
} from './insights-kacheln'
// G-258/E-29: die echte Pending-Actions-Kachel.
import { NutritionPendingEcht } from './pending-echt'
// G-262: die naechste geplante Trainingseinheit.
import { PreWorkoutEcht } from './pre-workout-echt'
import type { SitzungStand } from '../../../lib/training/naechste-sitzung'
import type { OffeneAktionenStand } from '../../../lib/coach/offene-aktionen'
import type { InsightsStand } from '../../../lib/nutrition/insights-read'
import type { RezeptStand } from '../../../lib/nutrition/rezept-lesen'
import type { PlanKurz } from '../../../lib/nutrition/plan-lesen'
import type { HydrationDay } from '../../../lib/nutrition/hydration-day-read'
import { LeerHinweis } from './leer-hinweis'
import type { DailySummaryRow, SummaryMacro } from '../../../lib/nutrition/diary-summary'
import type { ReferenceAssessmentRow } from '../../../lib/nutrition/reference-assessment-read'
import type { Zielvorschlag, Zielwerte } from '../../../lib/profile/zielwerte-read'
import { Zielhinweis } from './zielhinweis'
import { Mahlzeiten } from './mahlzeiten'
import { Zukunftshinweis } from './datumsnavigation'
import {
  LEERER_WECHSELSTAND,
  type LogZeile as PlanLogZeile, type WechselStand,
} from '../../../lib/nutrition/plan-lage'
import type { TagesEintrag } from './plan-eintraege'
// G-38: die Tabs, die bisher nur als Attrappen-Platzhalter dastanden.
import { NutritionInsightsTab } from './tab-insights'
import { MealPlansTab } from './tab-plans'
// G-65: derselbe Tab mit echten Daten.
// G-72: die Reihen aus den Vorlieben.
import type { Slot } from '../../../lib/nutrition/plan-model'
import type { MahlzeitSlot } from '../../../lib/nutrition/slots-lage'
import { VorliebenTab, type VorliebenDaten } from './tab-vorlieben'
import { NutritionPlannerTab } from './tab-planner'
// G-97: der Planner mit echten Daten (C-150).
import { PlannerEchtTab } from './tab-planner-echt'
import type { PlanDaten } from '../../../lib/nutrition/plan-lesen'
// G-66: der Food-DB-Tab in der Form des Entwurfs.
import { NutritionFoodsTab } from './tab-foods'
import type { NutritionFoodSearchPayload } from '../../../lib/nutrition/food-search'
import { Kopfknoepfe } from './kopfknoepfe'
// G-345 / E-64: der Einkaufsreiter.
import { EinkaufTab } from './tab-einkauf-echt'
import type { EinkaufslisteKurz }
  from '../../../lib/nutrition/einkaufsliste-lesen'
// `[cmd]` G-365: die Mockup-Reiter unter der Linie. Sieben
// Reiter hatten keine — gemessen 2026-09-07.
import {
  NutritionFoodsReferenz,
  NutritionPlannerReferenz, NutritionNutrientsReferenz,
  NutritionPlansReferenz, NutritionPrefsReferenz,
  EinkaufReferenz,
} from './mockup-referenz'
import {
  // G-412/7: `FehlendeInsightsKacheln` ist entfallen — die eine
  // Kachel darin (Micronutrient trend) ist angebunden.
  FehlendePlanKacheln,
} from './fehlende-kacheln'
// G-412/7: der Verlauf mit echten Anteilen.
import { MikroTrendKachel } from './mikro-trend'
import type { MikroTrendStand } from '../../../lib/nutrition/mikro-trend-read'
// G-353: die eine Setup-Karte.
import { SetupKarte } from './setup-karte'
import type { SetupKarte as SetupKarteDaten }
  from '../../../lib/nutrition/setup-karten'
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
function tabs(mahlzeiten: number | null, einkauf: number | null): TabItem[] {
  return [
    { id: 'diary',     label: 'Diary',       icon: 'edit',     count: mahlzeiten ?? undefined },
    { id: 'insights',  label: 'Insights',    icon: 'sparkles' },
    { id: 'nutrients', label: 'Nutrients',   icon: 'layers',   count: 138 },
    { id: 'foods',     label: 'Food DB',     icon: 'search' },
    { id: 'plans',     label: 'Meal plans',  icon: 'calendar' },
    { id: 'prefs',     label: 'Preferences', icon: 'settings' },
    { id: 'planner',   label: 'Planner',     icon: 'calendar' },
    // G-289/E-39: der „Rezept-Bereich" aus SPEC_03 Flow 7,
    // Schritt 1. Er traegt auch die Einkaufslisten (Flow 8).
    { id: 'rezepte',   label: 'Rezepte',     icon: 'nutrition' },
    // ══ G-345 / E-64: der eigene Reiter ═══════════════════════
    //
    // `[read]` **Hier stand, der Rezepte-Reiter trage auch die
    // Einkaufslisten.** `[cmd]` **E-64 gibt ihnen einen eigenen
    // Ort** — **wo man ALLE sieht, offene und archivierte.**
    //
    // `[read]` **Der Rezeptweg bleibt** (Flow 8, der Nebenfall) —
    // er fuehrt in dasselbe Fenster.
    { id: 'einkauf',   label: 'Einkauf',     icon: 'bookmark',
      count: einkauf ?? undefined },
  ]
}

export async function TagebuchAnsicht({
  datum, tab, summe, bewertung, lueckenGesamt = null, fehler, bewertungFehler, ziele, vorschlag, zielFehler, wasser,
  planLogs = [], coachFreigabe = false, einkaufslisten = 0, einkaufsliste = null, tagesEintraege = [],
  setupKarte = null,
  wechsel = LEERER_WECHSELSTAND,
  istAdmin = false, slots = null, mahlzeitSlots = [], ghostSlots = [], foodsStart = null, vorlieben = null, plan = null, mikro = null, ordnung = null, einsichten = null, rezepte = null, allePlaene = [],
  offeneAktionen = null, sitzung = null, score = null, mikroTrend = null,
  unvertraeglichkeiten = [],
}: {
  /** G-154: fuer den Hinweis im Foods-Tab. */
  unvertraeglichkeiten?: string[]
  /** G-258/E-29: `null` heisst nicht gelesen — dann bleibt der Entwurf. */
  offeneAktionen?: OffeneAktionenStand | null
  /** G-262: `null` heisst nicht gelesen — dann bleibt der Entwurf. */
  sitzung?: SitzungStand | null
  /** G-412/1: der Nutrition score aus echten Zeilen. */
  score?: ScoreStand | null
  /** G-412/7: acht Naehrstoffe x 30 Tage. */
  mikroTrend?: MikroTrendStand | null
  datum: string
  planLogs?: PlanLogZeile[]
  coachFreigabe?: boolean
  einkaufslisten?: number
  /**
   * G-353: die eine Setup-Karte, die gerade dran ist — oder `null`.
   *
   * `[read]` **Hoechstens eine**, sonst waere es ein zweites
   * Onboarding, das man nicht ueberspringen kann.
   */
  setupKarte?: SetupKarteDaten | null
  /** G-345: die Listen selbst, fuer den Einkaufsreiter. */
  einkaufsliste?: EinkaufslisteKurz[] | null
  tagesEintraege?: TagesEintrag[]
  /** G-309: Befunde UND Grundgesamtheit, aus EINER Messung. */
  wechsel?: WechselStand
  tab: string
  /** G-14: nur Admins duerfen in die Zukunft blaettern. */
  istAdmin?: boolean
  summe: DailySummaryRow | null
  bewertung: ReferenceAssessmentRow[]
  /** G-248: Naehrstoffe mit Luecken, gesamt. */
  lueckenGesamt?: { unvollstaendig: number; gesamt: number } | null
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
  /**
   * G-72: die Mahlzeitenreihen aus den Vorlieben.
   *
   * `[read]` **`null` heisst: nicht lesbar** — die Liste faellt dann
   * auf ihre Vorlage zurueck, statt leer zu bleiben.
   */
  slots?: Slot[] | null
  /** G-332: die benannten Slots aus `meal_slots` (C-392). */
  mahlzeitSlots?: MahlzeitSlot[]
  /** G-336: die Slots des aktiven Plans — nur fuer die Ghosts. */
  ghostSlots?: MahlzeitSlot[]
  /** G-97: der Wochenplan, wenn der Planner-Tab gezeigt wird. */
  plan?: PlanDaten | null
  /** G-101: Mikronaehrstoffe und Schwellenunterschreitungen. */
  mikro?: MikroStand | null
  /** G-101/C-54: die Naehrstoffordnung, wenn der Tab gezeigt wird. */
  ordnung?: NaehrstoffOrdnung | null
  /** G-101: Kalorienbilanz und Makroschnitt. */
  einsichten?: InsightsStand | null
  /** G-289: Rezepte und Einkaufslisten. */
  rezepte?: RezeptStand | null
  /** C-372/E-41: alle Plaene, kurz. */
  allePlaene?: PlanKurz[]
}) {
  // A-14: Serverkomponente — `getTranslations`, nicht `useTranslations`.
  const t = await getTranslations('Nutrition')
  const tA = await getTranslations('Allgemein')
  // ══ C-48: die Lage des Tages, nicht ein Ja/Nein ═════════════════
  // `[cmd]` Hier stand `!summe || summe.item_count === 0` — **eine
  // Bedingung fuer zwei verschiedene Lagen.** Auf dem Schirm
  // gemessen (2026-08-28): 2026-01-15 (nie etwas angelegt) und
  // 2026-05-29 (4 Mahlzeiten, 0 Positionen) zeigten denselben Satz.
  // `[read]` **Ein leerer Tag und ein unfertiger Tag sind nicht
  // dasselbe** — dieselbe Klasse wie G-208 und G-239.
  const lage = tageslageVon(summe)
  const leer = lage === 'nichts_angelegt' || lage === 'ohne_positionen'
  // Regel 1: die Fehlzaehler der angezeigten Makros. `label` ist der
  // SCHLUESSEL (A-14) — hier wird er zum Text, sonst stuende
  // „kalorien" im Satz.
  const luecken = lueckenVon(summe,
    HAUPTMAKROS.map(m => ({ code: m.code, label: t(m.label) })))

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

        {/* `[cmd]` **G-376: der Platz fuer den Tageswechsler.**
            Die Schale rendert per Portal hinein — der Kopf
            gehoert dem Modul, der Wechsler der Schale. */}
        <div className="v2-kopf-mitte" data-tageswechsler />

        <div className="v2-module-actions">
          {/* G-38: Quick-add und MealCam oeffnen jetzt die Fenster der
              Vorlage statt „in Entwicklung". Sie stehen in einer
              Client-Insel, weil diese Ansicht eine async
              Server-Komponente ist und keinen Zustand halten kann.
              „Find food" bleibt dazwischen — Reihenfolge der Vorlage. */}
          <Kopfknoepfe
            datum={datum}
            kinder={(
              <Link href={'/v2/nutrition/suche' as Route} className="v2-btn">
                <Icon name="search" className="v2-ic v2-ic-sm" /> Find food
              </Link>
            )}
          />
        </div>
      </div>

      <Tableiste items={tabs(summe?.meal_count ?? null, einkaufslisten)} aktiv={tab} />

      <Zukunftshinweis datum={datum} />

      {tab !== 'diary' && (
        <AndererTab tab={tab} foodsStart={foodsStart} vorlieben={vorlieben} plan={plan} ordnung={ordnung} einsichten={einsichten} mikroTrend={mikroTrend} rezepte={rezepte} allePlaene={allePlaene} bewertung={bewertung} datum={datum} unvertraeglichkeiten={unvertraeglichkeiten} planLogs={planLogs} coachFreigabe={coachFreigabe} einkaufslisten={einkaufslisten} einkaufsliste={einkaufsliste} tagesEintraege={tagesEintraege} wechsel={wechsel} />
      )}
      {tab === 'diary' && (
      <>
      {/* ══ G-353: die Setup-Karte ═════════════════════════
          `[read]` **Sie steht im Modul, nicht auf dem Dashboard**
          — eine Karte im Nutrition-Reiter kann ,,Ziel setzen"
          sagen, weil dort die Zielwerte stehen. **Dieselbe Karte
          auf dem Dashboard waere ein Hinweis ohne Ort.**

          `[read]` **Ohne Karte rendert sie nichts** — kein
          Platzhalter, keine leere Huelle. */}
      <SetupKarte karte={setupKarte} />

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
      {/* ══ C-48: zwei Leerlagen, zwei Saetze ═══════════════════════
          `[read]` **Wer vier Mahlzeiten angelegt und nichts
          eingetragen hat, hat NICHT „nichts erfasst"** — er ist auf
          halbem Weg. Der falsche Satz schickt ihn zum Anlegen einer
          fuenften Mahlzeit statt zum Fuellen der vier vorhandenen. */}
      {!fehler && leer && (
        <div className="v2-empty" style={{ marginTop: 16 }}>
          <Icon name="nutrition" />
          <div>
            <strong>{LAGE_TITEL[lage]}</strong>
            <p style={{ marginTop: 6 }}>
              {lageSatz(lage, summe?.meal_count ?? 0)}
            </p>
            <p style={{ marginTop: 6 }}>
              {lage === 'ohne_positionen'
                ? <>Öffne eine der Mahlzeiten unten und trag ein, was drin war
                    — die Nährwerte werden dabei <strong>eingefroren</strong>.</>
                : <>Mahlzeit anlegen, Lebensmittel suchen, Menge angeben — die
                    Nährwerte werden dabei <strong>eingefroren</strong>. Eine
                    spätere Korrektur am Lebensmittel ändert diesen Tag nicht
                    mehr.</>}
            </p>
            <p style={{ marginTop: 6 }}>
              Nur stöbern?{' '}
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
                  ? (() => {
                      // `[read]` **Ein negativer Rest ist nicht *uebrig*, er ist
                      // *darueber*.** Tom, 2026-09-08.
                      const rest = Math.round(ziele.kcal - summe.macros.enercc.value)
                      const menge = Math.abs(rest).toLocaleString('de-DE')
                      return rest < 0 ? t('kcalDarueber', { menge }) : t('kcalOffen', { menge })
                    })()
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
                          {wert !== null && ziel !== null
                            ? (() => {
                                // `[read]` **Wie beim Ring: negativ heisst *darueber*.**
                                const rest = Math.round(ziel - wert)
                                const menge = Math.abs(rest)
                                return rest < 0 ? t('gDarueber', { menge }) : t('gLeft', { menge })
                              })()
                            : ''}
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

          {/* ══ C-48, Regel 1: die Fehlzaehler ══════════════════════
              `[cmd]` `daily_summary` traegt 35 `_missing`-Spalten.
              Steht eine ueber null, ist die Summe unvollstaendig —
              **und zwar zu niedrig, nicht bloss ungenau.** Der Ring
              trug das schon als Markierung (`incomplete`), aber
              ohne Zahl und ohne Satz.
              `[cmd]` Auf dev feuert bei den vier Hauptmakros kein
              einziger Zaehler (0 von 181 Tagen) — `vitc_missing`
              dagegen an 180 von 181. **Die Regel ist nicht tot, sie
              trifft nur andere Naehrstoffe.** */}
          {luecken.length > 0 && (
            <div style={{
              marginTop: 12, padding: 10, borderRadius: 6, fontSize: 11.5,
              lineHeight: 1.55,
              background: 'color-mix(in oklch, var(--warn) 10%, transparent)',
              border: '1px solid color-mix(in oklch, var(--warn) 35%, var(--border))',
            }}>
              <Icon name="alert" className="v2-ic v2-ic-sm"
                    style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} />
              {lueckenSatz(luecken)}
            </div>
          )}

          {/* ══ G-248: der Sammelhinweis ═══════════════════════════
              `[cmd]` **Gemessen 2026-08-29, dev, 14 Tage:** von 35
              Fehlzaehlern feuern NEUN — der Diary-Leseweg laedt neun
              ANDERE, Schnittmenge `fibt`. **Der Hinweis darueber
              nennt heute einen Naehrstoff und schweigt ueber acht.**
              `[read]` **Die Gesamtzahl kommt aus
              `daily_nutrient_summary_long`, in einer Abfrage** — 35
              Spalten zu laden waere teurer und nicht genauer. Welche
              es betrifft, zeigt der Nutrients-Reiter. */}
          {gesamtLueckenSatz(lueckenGesamt) && (
            <div className="v2-dim" style={{
              marginTop: 8, fontSize: 11, lineHeight: 1.5,
            }}>
              {gesamtLueckenSatz(lueckenGesamt)}
            </div>
          )}

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
        <Mahlzeiten datum={datum} slots={slots} mahlzeitSlots={mahlzeitSlots}
                    ghostSlots={ghostSlots} />
        </div>

        {/* ---------- Rechte Spalte, Reihenfolge der Vorlage ----------
            [cmd] module-nutrition.jsx:227-289. Sieben Kacheln, alle mit
            ihren Entwurfszahlen uebernommen — inklusive Nutrition score
            (Formel aus module-nutrition-spec.jsx), Pre-workout 68 und
            Hydration 1.2/3.0 L. Die Deckung je Naehrstoff steht als
            achte darunter: sie ist angebunden und ersetzt nichts. */}
        <div className="v2-col-gap" style={{ gap: 12 }}>
        {/* G-263 (2026-08-30): „Smart suggestions" ist ENTFERNT.

            `[read]` **Die Vorfrage war inhaltlich:** was ist ein
            Vorschlag? **Ein Vorschlag sagt, was jemand tun soll — das
            ist eine Bewertung**, und C-108/F-02 zieht dort die Grenze
            (*nennen ja, bewerten nein*, ausdruecklich in C-113).

            `[cmd]` **Die vier Zeilen einzeln gemessen** — Belege in
            `lib/nutrition/vorschlags-lage.ts`:

              „Same as yesterday"   der Fakt ist da, ABER gebaut:
                                    `wieGestern()` in mahlzeiten.tsx:275
              „Top breakfast 78%"   Haeufigkeit zaehlbar, Quote nicht
                                    (eine Zielzeile) - und „Top" wertet
              „Quick post-workout"  keine Quelle; Dosierung + Kombination
              „Saturday cheat meal" kein Muster: je Wochentag 13 Tage,
                                    Samstag 625 kcal zwischen Fr 560
                                    und Do 663

            `[read]` **Eine ist gebaut, eine erfunden, zwei sind
            Empfehlungen. Keine traegt.** Der Auftrag: *„Wenn nicht: sag
            es, und die Kachel wird entfernt statt gefuellt."* */}
        {/* ══ G-412/1 + G-417/1: der Score rechnet ════════════
            `[cmd]` **Fuenf Anteile aus `nutrition.daily_summary`,
            Ziele aus `zielwerte-read`, Stufe aus
            `public.profiles.experience_level`.**
            `[cmd]` **Die Formel steht in `@lumeos/scoring`** — dem
            Ort, den `SPEC_09_SCORING.md:11` nennt.
            `[cmd]` **Beide Grenzen von G-412 sind gefallen:**
            `goals.nutrition_targets.fiber_g` gibt es seit C-464, und
            E-80 hat die vier Stufenfaktoren entschieden. */}
        {/* `[read]` **`null` heisst: der Leseweg ist ausgefallen** —
            dann zeigt die Kachel den Grund, keinen Ring auf 0. */}
        <ScoreEcht stand={score ?? {
          datum, anteile: [], score: null, status: 'offen',
          stufe: null, faktor: null, gewichtGerechnet: 0,
          fehler: 'Der Leseweg hat nicht geantwortet.',
        }} />
        {/* G-258/E-29: ANGEBUNDEN an `coach.offene_aktionen('nutrition')`.
            `[read]` **Muster G-90:** der Entwurf bleibt nur, solange gar
            nichts geladen wurde (kein Prop). Sobald gelesen wurde — auch
            wenn nichts gefunden wird —, gilt der echte Weg mit seinem
            Leerzustand. **Sonst stuende eine Attrappe da, die drei
            erfundene Aktionen zeigt, waehrend der Coach keine hat.** */}
        {offeneAktionen
          ? <NutritionPendingEcht
              stand={offeneAktionen}
              jetzt={offeneAktionen.gelesenUm}
            />
          : <NutritionPendingActions />}
        {/* G-262 (2026-08-30): ANGEBUNDEN an
            `training.workout_sessions` — aber nur der Zeitpunkt.

            `[cmd]` **Von sechs Teilen der Attrappe bleiben zwei:** die
            Sitzung (dev: 13 geplante ab heute, alle 17:30) und der
            Abstand dazu. **Raus sind Score 68, „Eat by 16:00", die
            Makrovorgaben und die drei Mahlzeitenkombinationen** — alle
            vier sind Empfehlungen (C-108/F-02, C-113).

            `[read]` **Die Modulgrenze ist gemessen, nicht angenommen:**
            E-29 begruendet sich aus Protokollen und Rechtetabellen —
            `coach` hat je vier davon, `training` **keine**. Ausserdem
            liest `lib/dashboard/lesen.ts:229` dieselbe Tabelle bereits
            direkt. Begruendung in `lib/training/naechste-sitzung.ts`. */}
        {/* ══ G-359/3 · E-68: der Entwurf verdraengt nicht mehr ════
            **Tom, 2026-09-07:** *„bestehendes bleibt wie es ist, wir
            blenden nur mockup attrappen ein als referenz."*

            `[cmd]` **Gemessen 2026-09-06: `dev@lumeos.app` hat 30
            Sitzungen und 5 Plaene** — **also lief immer der echte
            Zweig, und die Entwuerfe waren nie zu sehen.**

            `[read]` **Der echte Teil bleibt unveraendert** — dieselbe
            Bedingung, nur kein Sonst-Zweig mehr. */}
        {sitzung && <PreWorkoutEcht stand={sitzung} />}
        {/* ══ G-412/2: die Attrappe ist raus ══════════════════
            `[cmd]` **Gemessen, warum sie trotz `pre-workout-echt.tsx`
            stand:** sie wurde NICHT als Sonst-Zweig gerendert,
            sondern IMMER — eine Zeile unter der echten Kachel.
            `[read]` **Beide zeigten verschiedene Sachen:** die echte
            sagt, WANN die naechste Einheit ist
            (`training.workout_sessions`), die Attrappe zeigte einen
            Zeitfenster-Ring mit erfundenen 68 %.
            `[read]` **Der Ring braeuchte eine Naehrstoffplanung je
            Einheit** — dafuer gibt es keine Tabelle. */}
        {/* ANGEBUNDEN: hydration_day. Deshalb keine Marke mehr — und
            zwei Farben, weil die Vorlage die beiden Herkuenfte nicht
            unterscheidet. */}
        <HydrationKachel tag={wasser ?? null} datum={datum} />
        {/* G-101: angebunden an `micronutrient_snapshot` und
            `micronutrient_below_threshold`. Ohne Daten bleibt der
            Entwurf mit seiner Marke stehen — dasselbe Muster wie bei
            den Vorlieben (G-65). */}
        {mikro && mikro.zeilen.length > 0 && <MikroSchnappschuss d={mikro} />}
        {/* ══ G-412/3: das Netz sitzt jetzt IN der oberen Kachel
            **Tom:** *„bau die grafik in die obere kachel unter den
            balken mit rein, dann hat man zwei ansichten."*
            `[read]` **Damit faellt die Attrappe weg** — sie zeigte
            dieselben acht Naehrstoffe, nur als Netz. */}
        {mikro && mikro.zeilen.length > 0 && <UnterSchwelle d={mikro} />}
        {/* ══ G-412/4: doppelt, also raus ═════════════════════
            `[cmd]` **Die angebundene Fassung steht direkt darueber**
            (`UnterSchwelle`, echte Werte aus
            `micronutrient_below_threshold`). `[cmd]` **Die Attrappe
            zeigte 3 von 117 mit erfundenen Zahlen.** */}

        {/* ══ G-412/8: zwei Drittel Hoehe ═════════════════════════
            **Tom, 2026-09-08:** *„Tagesdeckung — zwei Drittel Hoehe,
            und die Kachel daneben entsprechend."*

            `[cmd]` **Am Schirm gemessen: 616 px** — die hoechste
            Kachel der rechten Spalte.
            `[cmd]` **Gemessen, ob eine Nachbarkachel ihre Hoehe aus
            einem Raster nimmt: NEIN** — die Spalte ist `flex`, die
            Kacheln stapeln sich. **Es gibt keine Nachbarin, die
            mitwaechst**, also reicht diese eine Aenderung.

            `[read]` **Der Inhalt bleibt vollstaendig** — die Liste
            scrollt innerhalb der Kachel, statt gekuerzt zu werden.
            **Eine gekuerzte Liste saehe aus wie weniger Daten.** */}
        <Card
          title={t('deckungTitel')}
          sub={t('bewertet', { anzahl: bewertung.length })}
          className="v2-deckung-kachel"
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

          {/* `[cmd]` **G-412/8: 460 -> 410.** `[read]` **Hier stand
              schon ein Scrollkasten** — meine erste Aenderung setzte
              die Hoehe in `nutrition.css` und blieb wirkungslos, weil
              ein Inline-Stil immer gewinnt. **Am Schirm gemessen:
              `maxHeight` blieb bei 460 px.**
              `[cmd]` **G-412 stauchte auf 411 px Kachel / 255 px
              Liste** — **8 von 154 Naehrstoffen sichtbar, gemessen.**

              **Tom, 2026-09-11:** *„Deckung je Naehrstoff 30 %
              hoeher — dass ein bisschen mehr direkt sehbar sind."*

              `[cmd]` **255 + 30 % = 332.** `[read]` **Mehr Hoehe,
              NICHT kleinere Zeilen** — eine gestauchte Zeile zeigt
              nicht mehr, sie ist nur schlechter zu lesen. */}
          {bewertung.length > 0 && (
            <div style={{ maxHeight: 332, overflowY: 'auto' }}>
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
      {/* ══ G-412/A3: die Diary-Referenz ist entfallen ══════════
          **Tom, 2026-09-08:** *„und dann kann die
          mockup-referenz-linie und alles darunter weg."*

          `[cmd]` **NUR fuer das Tagebuch** — die anderen SIEBEN
          Bloecke (Nutrients, Insights, Plans, Prefs, Planner,
          Einkauf, Foods) bleiben unveraendert.

          `[read]` **Der Grund ist der Fortschritt:** die vier
          Kacheln, die den Vergleich noetig machten, sind angebunden
          oder entfallen. **Was darunter stand, zeigte nichts mehr,
          was oben fehlte.** */}
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
  tab, foodsStart, vorlieben, plan, ordnung, einsichten, mikroTrend, rezepte,
  allePlaene = [], bewertung = [],
  datum,
  planLogs = [], coachFreigabe = false, einkaufslisten = 0, einkaufsliste = null, tagesEintraege = [],
  wechsel = LEERER_WECHSELSTAND,
  unvertraeglichkeiten = [],
}: {
  tab: string
  /** G-239: die Referenzbewertung des Tages, fuer die Mikro-Ansicht. */
  bewertung?: ReferenceAssessmentRow[]
  datum?: string
  planLogs?: PlanLogZeile[]
  coachFreigabe?: boolean
  einkaufslisten?: number
  /** G-345: die Listen selbst, fuer den Einkaufsreiter. */
  einkaufsliste?: EinkaufslisteKurz[] | null
  tagesEintraege?: TagesEintrag[]
  /** G-309: Befunde UND Grundgesamtheit, aus EINER Messung. */
  wechsel?: WechselStand
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
  /** G-412/7: acht Naehrstoffe x 30 Tage. */
  mikroTrend?: MikroTrendStand | null
  /** G-289: Rezepte und Einkaufslisten. */
  rezepte?: RezeptStand | null
  /** C-372/E-41: alle Plaene, kurz. */
  allePlaene?: PlanKurz[]
}) {
  const inhalt: Record<string, { titel: string; braucht: string }> = {
    insights: {
      titel: 'Insights',
      braucht: 'Auswertungen ueber Zeitraeume — heute gibt es nur die Tagessumme. `daily_summary` fuehrt keine Wochen- oder Monatswerte.',
    },
    plans: {
      titel: 'Meal plans',
      braucht: 'Essensplaene liegen in der Datenbank; diese Platzhalteransicht ist noch nicht an `plan-lesen` angebunden.',
    },
    prefs: {
      titel: 'Preferences',
      braucht: 'Vorlieben liegen in eigenen Tabellen; diese Platzhalteransicht erscheint nur, wenn der echte Stand nicht geladen wurde.',
    },
    planner: {
      titel: 'Planner',
      braucht: 'Planung kuenftiger Tage. `meals` kennt nur erfasste Tage, keine geplanten.',
    },
  }

  if (tab === 'nutrients') {
    // `[cmd]` SEIT G-101 ECHT, Rueckfall entfernt am 2026-08-23 (G-157).
    // `nutrition.nutrient_defs` traegt **138 Zeilen mit 40 Wurzelknoten**
    // (gemessen 2026-08-23), der echte Zweig laedt also.
    //
    // `[read]` **Der alte Rueckfall zeigte 79 erfundene Eintraege ohne
    // eine einzige Marke** — der Kommentar hier behauptete das Gegenteil
    // („aber mit Marke"). Beides ist weg.
    return (
      <div style={{ marginTop: 16 }}>
        {/* ══ G-249: EINE Ansicht, nicht zwei ═══════════════════════
            `[cmd]` Hier stand `MikroAnsicht` (G-239/246/247) UEBER der
            Ordnung — **zwei Ansichten derselben Sache, mit eigenen
            Zeitfiltern, die nicht ineinander wirkten.**
            `[read]` **Die Ordnung bleibt, weil sie mehr kann:** Baum,
            Suche, gespeicherter Klappzustand, `nutrition_targets`,
            Modal. **Was die andere konnte, ist eingegangen** — die
            Erklaertexte, die vier Zustaende und der Trend. */}
        {ordnung && ordnung.gruppen.length > 0
          ? <NaehrstoffOrdnungTab d={ordnung} />
          : <LeerHinweis
              titel="Nährstoffe"
              grund="Für dieses Konto ist keine Nährstoffordnung geladen. Ohne Sitzung greift die Zeilensicherheit, und es wird nichts gelesen." />}
        <NutritionNutrientsReferenz />
      </div>
    )
  }

  // G-38: vier Tabs, die bis hierher nur einen Platzhalter zeigten.
  // Sie sind nach der Vorlage gebaut und weiterhin Attrappe — jede
  // Kachel traegt den Hinweis, woran die Anbindung haengt.
  if (tab === 'insights') {
    // ══ G-291/292/293/295: von zwei Kacheln auf sechs ═════════════
    //
    // `[cmd]` **SPEC_10 nennt sechs Insights-Komponenten.** Fuenf
    // stehen jetzt: Kalorienbilanz und Makroschnitt (G-101), dazu
    // Verlauf (G-291), Tagesdeckung (G-295), Makrodetail (G-293) und
    // Warnungen (G-292).
    //
    // `[cmd]` **DeficitSuggestions ist gemeldet statt gebaut** —
    // SPEC_10 will Empfehlungen, C-108/F-02 verbietet sie
    // (`DEFIZIT_HINWEIS`). **CrossModuleInsights wartet auf C-324.**
    //
    // `[read]` **Das Fenster steht als Zahl an einer Stelle** —
    // `page.tsx` laedt 30 Tage, der Verlauf schneidet daraus im
    // Browser. Warnungen und Makrodetail bekommen dieselbe Zahl als
    // Prop, damit kein Titel eine andere behauptet.
    const insightsFenster = 30
    return (
      <div style={{ marginTop: 16 }}>
        {/* ══ G-417/2+3: zwei unabhaengige Spalten ═════════════════
            **Tom, 2026-09-11:** *„das sind zwei unabhaengige
            spalten."*

            `[cmd]` **Vorher zwei Raster uebereinander** — und ein
            Raster bindet seine Zeile: Zeile 2 begann erst, wenn beide
            Kacheln der Zeile 1 fertig waren. **`align-items: start`
            (G-416) aendert daran nichts**, es richtet nur INNERHALB
            der Zeile aus.

            `[cmd]` **Jetzt zwei Stapel nebeneinander**, jeder fuellt
            fuer sich. **Die Anordnung ist die beauftragte.** */}
        {einsichten && (
          <div className="v2-zwei-saeulen" style={{ marginBottom: 16 }}>
            <div className="v2-saeule">
              {(einsichten.bilanz || einsichten.makros) && (
                <KalorienbilanzKachel d={einsichten} fenster={insightsFenster} />
              )}
              <TrendKachel d={einsichten} heute={datum ?? ''} />
              <MakroDetailKachel d={einsichten} fenster={insightsFenster} />
            </div>
            <div className="v2-saeule">
              {(einsichten.bilanz || einsichten.makros) && (
                <MakroschnittKachel d={einsichten} fenster={insightsFenster} />
              )}
              <WarnungenKachel d={einsichten} fenster={insightsFenster} />
              <HeatmapKachel d={einsichten} heute={datum ?? ''} />
            </div>
          </div>
        )}
        {/* ══ G-11: nicht zweimal dieselbe Kachel ═══════════════════
            `[cmd]` Gemessen 2026-08-29: „Calorie balance" und „Macro
            split · 14d avg" standen **je zweimal** auf dem Schirm —
            oben echt, darunter als Attrappe mit den Zahlen der
            Vorlage. **Dieselbe Doppelung, die G-249 im
            Nutrients-Reiter entfernt hat.**
            `[read]` Der Entwurf zeigt sie nur noch, wenn die echten
            NICHT stehen — dann ist er der Rueckfall und kein
            Duplikat. */}
        {/* ══ G-412/7 + G-417/3: der Verlauf, ueber die volle Breite
            `[cmd]` **Acht Naehrstoffe x 30 Tage aus
            `nutrition.micronutrient_snapshot`** — dieselbe Funktion,
            die den Schnappschuss fuellt.
            `[cmd]` **In der Vorlage sind die Zellen `Math.random()`**
            (`module-nutrition.jsx:399`); hier nicht.
            `[cmd]` **Und die Vorlage setzt `gridColumn: "span 2"`**
            (`module-nutrition.jsx:393`) — **volle Breite ist die
            Vorlage.** `[read]` **Hier steht die Kachel NEBEN den
            beiden Saeulen statt in einer** — dann braucht sie keine
            Spannweite, sie hat die Breite schon. */}
        {mikroTrend && (
          <div style={{ marginBottom: 16 }}>
            <MikroTrendKachel d={mikroTrend} />
          </div>
        )}
        {/* `[cmd]` **G-419, 2026-09-08: der Insights-Block ist ABGENOMMEN.**
            Tom: *,,insights kann die mockuplinie und das darunter weg."*
            Die drei Karten darunter (Nutrition score, Pre-workout window,
            Micronutrient snapshot) sind seit G-412 angebunden, die Kurve
            und die Heatmap seit G-416/G-417. */}
        <NutritionInsightsTab
          ohneEchte={Boolean(einsichten && (einsichten.bilanz || einsichten.makros))} />
      </div>
    )
  }
  if (tab === 'plans') {
    // `[cmd]` SEIT G-161 TEILWEISE ECHT. Drei der acht Kacheln lesen
    // ueber `plan-lesen` — dieselbe Quelle wie der Planner (G-97).
    // **Fuenf bleiben Attrappe**, weil ihnen Spalten fehlen
    // (`lifecycle`, Eintragsstatus) oder eine Tabelle (`shopping_lists`,
    // C-175). Der Grund steht je Kachel im Quelltext.
    return (
      <div style={{ marginTop: 16 }}>
        <MealPlansTab
          d={plan}
          logs={planLogs}
          coachFreigabe={coachFreigabe}
          einkaufslisten={einkaufslisten}
          tagesEintraege={tagesEintraege}
          wechsel={wechsel}
          allePlaene={allePlaene}
          datum={datum ?? ''}
        />
      <FehlendePlanKacheln />
        <NutritionPlansReferenz />
      </div>
    )
  }
  if (tab === 'prefs') {
    // `[cmd]` SEIT G-65 ECHT, Rueckfall entfernt am 2026-08-23 (G-163).
    //
    // `[read]` **Der alte Rueckfall behauptete, die Vorlieben seien
    // nicht angebunden** — „die Schalter schreiben nichts". Das stimmte
    // nicht mehr: `VorliebenTab` liest `food_preferences` und
    // `food_preference_items` seit G-65 und schreibt seit G-154.
    // **Ein Rueckfall, der dem echten Zweig widerspricht, ist schlimmer
    // als keiner.**
    return (
      <div style={{ marginTop: 16 }}>
        {vorlieben
          ? <VorliebenTab d={vorlieben} />
          : <LeerHinweis
              titel="Vorlieben"
              grund="Für dieses Konto sind keine Vorlieben geladen. Ohne Sitzung greift die Zeilensicherheit, und es wird nichts gelesen." />}
        <NutritionPrefsReferenz />
      </div>
    )
  }
  if (tab === 'planner') {
    // ══ C-372/E-41: der Planner ist die WERKBANK ═══════════════════
    //
    // **E-41:** *„edit oder neuer Plan bleibt beim Planner, dann
    // brauchen wir da auch eine Auflistung aller Plaene."*
    //
    // `[cmd]` **Bis heute gab es hier keine Liste** — `ladePlan`
    // liefert `plaene[0]`, und *Neuen Plan anlegen* war die
    // *in Entwicklung*-Attrappe (G-304).
    //
    // `[read]` **Die Liste steht ueber dem Raster**, weil sie die
    // Frage beantwortet, an welchem Plan gearbeitet wird — das Raster
    // zeigt dann dessen Wochen.
    return (
      <div style={{ marginTop: 16 }} className="v2-col-gap">
        <PlanWerkbank plaene={allePlaene} heute={datum ?? ''} />

        {/* ══ G-319: die Trennung ══════════════════════════════════
            **Tom, 2026-09-02:** *„zwischen alle plaene und der
            werkbank darunter muss eine klare trennung kommen."*

            `[read]` **Vorher stiessen zwei Bereiche ohne Uebergang
            aneinander** — die Plankarten und das Wochenraster sahen
            aus wie eine durchlaufende Liste. */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginTop: 6,
        }}>
          <span className="v2-eyebrow">Werkbank</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* G-359/3: der Entwurf steht jetzt darunter, nicht dahinter. */}
        {plan && <PlannerEchtTab d={plan} />}
        <ReferenzTrenner reiter="Planner" quelle={QUELLE} />
        <NutritionPlannerTab />
        <NutritionPlannerReferenz />
      </div>
    )
  }

  // ══ G-289/G-288/G-300: der Rezept-Bereich ═══════════════════════
  //
  // `[cmd]` **`SPEC_03` Flow 7, Schritt 1: *„Rezept-Bereich → Neues
  // Rezept"*.** `[cmd]` **Flow 8, Schritt 1: *„Rezept oeffnen →
  // Einkaufsliste erstellen"*** — **die Liste gehoert hierher, nicht
  // in den Plan-Reiter.**
  //
  // `[cmd]` **`E-39` loest `ADR_RECIPES_SCHEMA_ONLY` ab:** die
  // Oberflaeche gehoert in V1. `[cmd]` **`SPEC_10` nennt fuenf
  // Komponenten, gebaut war keine.**
  if (tab === 'rezepte') {
    return (
      <div style={{ marginTop: 16 }}>
        {rezepte
          ? <RezepteTab d={rezepte} datum={datum ?? ''} />
          : (
            <LeerHinweis
              titel="Rezepte nicht geladen"
              grund="Ohne Sitzung greift die Zeilensicherheit, und es wird nichts gelesen." />
          )}

        {/* `[cmd]` G-365: KEIN Mockup-Reiter, und das ist der Befund.
            `module-nutrition.jsx` fuehrt sieben Reiter — `diary`,
            `insights`, `nutrients`, `foods`, `planner`, `plans`,
            `prefs`. **`rezepte` ist nicht darunter.**

            `[read]` **Der Reiter ist nach dem Entwurf entstanden**
            (C-372/E-41). Es gibt nichts zu vergleichen — deshalb steht hier
            keine Linie, sondern dieser Vermerk. */}
        <Card title="Kein Mockup-Gegenstueck"
              sub="dieser Reiter entstand nach dem Entwurf"
              attrappe={
                'Attrappe — kein Mockup · wartet auf: nichts — '
                + '`rezepte` steht in keiner theme-v1-Datei, es gibt '
                + 'keinen Soll-Stand zum Vergleich'
              }>
          <div className="v2-dim" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
            Die uebrigen Reiter zeigen unter einer Linie den
            Mockup-Entwurf als Vergleich. Fuer diesen gibt es keinen.
          </div>
        </Card>
      </div>
    )
  }

  // ══ G-345 / E-64: der Einkaufsreiter ═══════════════════════════
  //
  // `[read]` **Der dritte Ort:** wo man ALLE Listen sieht, offene und
  // archivierte. **Planner und Rezept fuehren in dasselbe Fenster.**
  if (tab === 'einkauf') {
    return (
      <div style={{ marginTop: 16 }}>
        {einkaufsliste
          ? <EinkaufTab listen={einkaufsliste} />
          : (
            <LeerHinweis
              titel="Einkaufslisten nicht geladen"
              grund="Ohne Sitzung greift die Zeilensicherheit, und es wird nichts gelesen." />
          )}

        {/* ══ G-344: der Vermerk war falsch ═════════════════════
            `[cmd]` **Hier stand ,,Kein Mockup-Gegenstueck"**, begruendet
            damit, dass `module-nutrition.jsx` sieben Reiter fuehrt und
            `einkauf` nicht darunter ist. **Das stimmt — es ist nur die
            falsche Datei.**

            `[cmd]` **`module-nutrition-spec.jsx:476` fuehrt ihn**, als
            Unterreiter von *Meal plans*, mit zwei Kacheln: der nach
            Warengruppen geordneten Liste und *Scale list*.

            `[read]` ***Nicht gefunden* heisst nur, dass die Suche nichts
            fand** — und kein Modul hat nur eine Mockupdatei. */}
        <EinkaufReferenz />
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
      <>
      <NutritionFoodsTab
        start={foodsStart ?? null}
        // G-272: `+ Add` schreibt in DIESEN Tag — denselben, den der
        // Datumswaehler im Kopf zeigt.
        //
        // `[read]` **`datum` ist hier optional typisiert**, obwohl der
        // einzige Aufrufer es immer mitgibt. **Ein Ersatzwert („heute")
        // waere eine zweite Wahrheit neben dem Datumswaehler** —
        // deshalb bleibt der Knopf ohne Datum stumm, statt in einen
        // geratenen Tag zu schreiben.
        datum={datum ?? null}
        unvertraeglichkeiten={unvertraeglichkeiten}
      />
      {/* `[cmd]` G-365: der Mockup-Reiter unter der Linie. */}
      <NutritionFoodsReferenz />
      </>
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

