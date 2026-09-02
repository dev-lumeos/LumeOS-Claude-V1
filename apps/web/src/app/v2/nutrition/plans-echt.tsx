'use client'

// Die echten Kacheln des Meal-Plans-Tabs (G-161).
//
// ── WAS HIER ECHT IST, UND WAS NICHT ────────────────────────────
//
// `[cmd]` **Der Lesepfad ist `plan-lesen`** — derselbe, den der
// Planner seit G-97 nutzt. Er verbindet die vier Ebenen in einem
// Aufruf: Plan -> Wochen -> Tage -> Eintraege. **Nicht nachgebaut,
// benutzt.**
//
// `[cmd]` **Gemessen am 2026-08-23**, Konto `dev@lumeos.app`: der
// Gesamtbestand ist 2 Plaene / 6 Wochen / 42 Tage / 112 Eintraege,
// **davon gehoert dev die Haelfte** — 1 / 3 / 21 / 56. Der zweite Plan
// gehoert einem anderen Konto und faellt per RLS heraus.
//
// ── DREI VON ACHT KACHELN, UND WARUM NICHT MEHR ─────────────────
//
// `[cmd]` **Fuenf Kacheln brauchen Spalten, die es nicht gibt.**
// `meal_plans` fuehrt weder `lifecycle` noch `started_at`,
// `days_count`, `confirm_mode` oder `next_plan_id`;
// `meal_plan_entries` hat **keine Statusspalte**. Ohne sie sind
// „ghost entries", „Lifecycle types" und jede Compliance-Rechnung
// nicht ableitbar — sie blieben Attrappe und sagen das weiter.
//
// `[read]` **Eine Kachel, die aus vorhandenen Zahlen etwas
// Plausibles rechnet, waere schlimmer als eine markierte.** Sie sieht
// aus wie eine Messung. Genau das war der Fall bei der
// Health-Score-Kachel (G-135).
import * as React from 'react'

// G-335: EINE Namensliste statt acht.
import { KATEGORIE_TEXT }
  from '../../../lib/nutrition/slots-lage'
import { Card, Pill, Row, Ring, Sparkline, Icon } from '@lumeos/ui'

import type { PlanDaten, PlanKurz } from '../../../lib/nutrition/plan-lesen'
// G-319: dieselbe Frage wie im Planner — je Plan eine.
import { AktivierenFrage } from './plan-werkbank-ui'
import {
  zyklusVon, ZYKLUS_TEXT, ZYKLUS_ERKLAERUNG,
  statusText, herkunftVon, HERKUNFT_TEXT, type Herkunft,
  // G-310: die Badges der Bibliothek (Mockup Z. 89).
  HERKUNFT_BADGE, HERKUNFT_FARBE,
  KEIN_LOG_SATZ, KEINE_EINKAUFSLISTE_SATZ,
  einhaltungVon, quoteVon, type LogZeile,
  // G-310: die Sieben-Tage-Reihe der Attrappe.
  tagesQuoten, schnittQuote,
  type WechselStand,
} from '../../../lib/nutrition/plan-lage'

/** Eine Zahl in deutscher Schreibweise, oder ein Strich. */
function zahl(n: number | null | undefined): string {
  return typeof n === 'number' && Number.isFinite(n)
    ? n.toLocaleString('de-DE') : '—'
}

/**
 * Die Zaehlung ueber alle vier Ebenen.
 *
 * `[read]` Aus den geladenen Daten gerechnet, nicht zweitabgefragt —
 * `plan-lesen` hat den Baum schon.
 */
export function planZaehlung(d: PlanDaten) {
  const tage = d.wochen.reduce((s, w) => s + w.tage.length, 0)
  const eintraege = d.wochen.reduce(
    (s, w) => s + w.tage.reduce((t, tg) => t + tg.eintraege.length, 0), 0)
  return { wochen: d.wochen.length, tage, eintraege }
}

/**
 * Der Plankopf — die Kopie der Attrappe, mit echten Zahlen.
 *
 * ══ A-62: DIE BEGRUENDUNG FUER „OHNE RING" IST GEKIPPT ═════════
 *
 * `[cmd]` **Hier stand:** *,,Ohne Ring. Die Vorlage zeigt dort eine
 * Compliance in Prozent; sie braucht einen Ist-Soll-Vergleich je
 * Eintrag, und `meal_plan_entries` fuehrt keinen Status."*
 *
 * `[cmd]` **Das stimmte, bis G-309 den Weg gebaut hat.** Der Status
 * liegt in `meal_plan_logs`, nicht am Eintrag — und seit dem
 * 2026-09-01 entstehen dort Zeilen. **Die Zahl ist gemessen, nicht
 * erfunden.**
 *
 * ══ DIE ATTRAPPE IST DIE VORLAGE ═════════════════════════
 *
 * **Tom, 2026-09-01:** *,,es war definiert das attrappe mockup bleibt
 * im code reaktivierbar und das angebunden ist eine kopie des mockups
 * angebunden."*
 *
 * `[cmd]` **`tab-plans.tsx` Zeilen 151-169** — Ring links, rechts
 * Name, Pills, eine Zeile mit Tag/Start/Quelle, darunter die
 * ausgeschriebene Rechnung. **Herkunft: `theme-v1/
 * module-nutrition-spec.jsx`, `MealPlansView` Zeile 334-521.**
 */
// G-298: die Laufzeit kommt aus den Tagen - `start_date` ist NULL.
import {
  laufzeitVon, laufzeitSatz, LAUFZEIT_MARKE,
} from '../../../lib/nutrition/plan-eintrag-lage'

/** Ein ISO-Datum deutsch — dieselbe Form wie in `plan-werkbank`. */
function deutschesDatum(iso: string): string {
  const [j, m, tg] = iso.split('-')
  return tg && m && j ? `${Number(tg)}.${Number(m)}.${j}` : iso
}

/**
 * Die EINE Zeile unter dem Plannamen — Vorlage Z. 371.
 *
 * `[cmd]` **Die Vorlage zeigt:** *,,Day 3 of 7 · started May 14 ·
 * source: coach (Jana Bauer)"* — **Dauer, Start und Herkunft in
 * einer Zeile, durch `·` getrennt.**
 *
 * **Tom, 2026-09-02:** *,,Aufbau-Wochenplan zeigt genau die gleichen
 * daten wie nebendran Plan settings."*
 *
 * `[read]` **Jeder Teil faellt weg, wenn er nicht belegbar ist** —
 * ein `· — ·` behauptet eine Leerstelle, wo es keine gibt.
 *
 * `[cmd]` **Der Bestandsplan traegt `plan_origin = NULL`** (G-287:
 * zeigen, nicht fuellen) — **dann steht die Herkunft nicht da.**
 */
export function kopfzeile(
  d: PlanDaten,
  p: NonNullable<PlanDaten['plan']>,
  laufzeit: ReturnType<typeof laufzeitVon>,
  h: Herkunft,
): string {
  const teile: string[] = []

  // „Day 3 of 7" — der wievielte Tag von wie vielen.
  const tage = d.wochen.reduce((s, w) => s + w.tage.length, 0)
  const heute = heuteIso()
  const alle = d.wochen
    .flatMap(w => w.tage.map(x => x.plan_date))
    .filter(Boolean)
    .sort()
  const index = alle.indexOf(heute)
  if (index >= 0 && tage > 0) {
    teile.push(`Tag ${index + 1} von ${tage}`)
  } else if (tage > 0) {
    // ══ G-298: aktiv, aber abgelaufen ══════════════════════════════
    //
    // **Tom, 2026-08-31:** *„der Plan laeuft vom 18.06. bis 08.07.,
    // heute ist der 31.08., und die Karte sagt aktiv."*
    //
    // `[read]` **Läuft der Plan nicht heute, sagt die Zeile das** —
    // statt einen Tag zu behaupten, der nicht läuft.
    //
    // `[read]` **Und sie sagt WANN** — „abgelaufen" ohne Datum lässt
    // offen, ob es gestern war oder im Juni. **Der alte
    // `laufzeitSatz` nannte es; die Zeile der Vorlage tut es jetzt.**
    teile.push(laufzeit.art === 'abgelaufen'
      ? `${tage} Tage, abgelaufen am ${deutschesDatum(laufzeit.bis)}`
      : laufzeit.art === 'kuenftig'
        ? `${tage} Tage, beginnt am ${deutschesDatum(laufzeit.von)}`
        : `${tage} Tage`)
  }

  // „started May 14" — aus `start_date`, sonst aus dem ersten Tag.
  const start = p.start_date ?? alle[0] ?? null
  if (start) teile.push(`Start ${deutschesDatum(start)}`)

  // „source: coach (Jana Bauer)" — ohne Namen: `meal_plans` fuehrt
  // keine Coach-Referenz (in G-310 gemessen).
  if (h !== 'unbekannt') teile.push(HERKUNFT_TEXT[h])

  return teile.join(' · ')
}

/** Heute als ISO - dieselbe Rechnung wie im Planner. */
function heuteIso(): string {
  const j = new Date()
  const m = String(j.getMonth() + 1).padStart(2, '0')
  const t = String(j.getDate()).padStart(2, '0')
  return `${j.getFullYear()}-${m}-${t}`
}

export function PlanKopfEcht({ d, logs = [] }: {
  d: PlanDaten
  /** G-310: die Logzeilen fuer Ring und Rechnung (Attrappe Z. 153+164). */
  logs?: readonly LogZeile[]
}) {
  const z = planZaehlung(d)
  const p = d.plan
  if (!p) {
    return (
      <Card title="Aktiver Plan">
        <p className="v2-muted" style={{ fontSize: 12 }}>
          Für dieses Konto liegt kein Essensplan vor. Die Kachel bleibt
          leer, statt einen fremden zu zeigen.
        </p>
      </Card>
    )
  }
  // ══ G-298: aktiv, aber abgelaufen ═══════════════════════════════
  //
  // **Tom, 2026-08-31:** *,,der Plan laeuft vom 18.06. bis 08.07.,
  // heute ist der 31.08., und die Karte sagt aktiv."*
  //
  // `[cmd]` **Gemessen am 2026-08-31: `start_date`, `days_count` und
  // `lifecycle_type` sind bei diesem Plan alle `NULL`** — **die
  // Laufzeit steht nur in den Tageszeilen** (18.6. bis 15.7., also 47
  // Tage vor heute).
  //
  // `[read]` **`is_active` bleibt `true`** — das beim Lesen
  // umzuschreiben waere ein Schreibvorgang. **Also wird der Zustand
  // gezeigt UND eingeordnet.**
  const laufzeit = laufzeitVon(
    d.wochen.flatMap(w => w.tage.map(x => x.plan_date)), heuteIso())
  const marke = LAUFZEIT_MARKE[laufzeit.art]

  // ══ DIE RECHNUNG STEHT IN DER ATTRAPPE, ZEILE 164-166 ═══════
  //
  // `[cmd]` **`(confirmed + deviated) / (confirmed + deviated +
  // skipped)`** — dieselbe Formel wie in `theme-v1` Zeile 340 **und
  // in `SPEC_09` Abschnitt 2.**
  //
  // `[read]` **Die Attrappe schreibt sie aus**, damit die Zahl
  // nachvollziehbar ist. **Die Kopie tut dasselbe** — sonst stuende
  // dort eine Prozentzahl, die niemand nachrechnen kann.
  const e = einhaltungVon(logs)
  const quote = quoteVon(e)

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        {/* `[read]` **Ohne entschiedene Zeile kein Ring** — ein Ring
            auf 0 % behauptet, der Plan sei nicht eingehalten worden.
            **`null` heisst „noch keine Aussage"** (C-323). */}
        {quote !== null && (
          <Ring value={quote} max={100} color="var(--acc-nutri)"
                label="compliance" size={92} stroke={7} />
        )}
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>{p.name}</span>
            {p.is_active
              ? <Pill variant="acc">aktiv</Pill>
              : <Pill>pausiert</Pill>}
            {/* Die Attrappe traegt hier den Zyklus als zweite Pille. */}
            {p.lifecycle_type && <Pill>{p.lifecycle_type}</Pill>}
            {marke && <Pill>{marke}</Pill>}
          </div>
          {/* ══ Vorlage Z. 371: EINE Zeile, muted, 12 px ════════
              *,,Day 3 of 7 · started May 14 · source: coach (Jana
              Bauer)"* — **Dauer, Start und Herkunft zusammen.**

              **Tom, 2026-09-02:** *,,Aufbau-Wochenplan zeigt genau die
              gleichen daten wie nebendran Plan settings."*

              `[cmd]` **Hier standen zwei Bloecke und darunter zwei
              Tabellen mit acht Zeilen** — vier davon nochmal rechts
              in `Plan settings`.

              `[read]` **Die Vorlage fasst zusammen, wir haben
              ausgebreitet.** */}
          <div className="v2-muted" style={{ fontSize: 12, marginBottom: 8, lineHeight: 1.5 }}>
            {kopfzeile(d, p, laufzeit, herkunftVon(p.plan_origin))}
          </div>
          {/* `[read]` **Die ausgeschriebene Rechnung** — wie in der
              Attrappe. `[cmd]` **Ohne Entscheidung sagt sie, dass
              nichts entschieden ist**, statt „0 %". */}
          <div className="v2-dim v2-mono" style={{ fontSize: 10.5, lineHeight: 1.6 }}>
            {quote === null
              ? `noch nichts entschieden · ${e.offen} offen`
              : `(${e.bestaetigt} bestätigt + ${e.abgewichen} abgewichen) / `
                + `(${e.bestaetigt} + ${e.abgewichen} + ${e.ausgelassen} ausgelassen)`
                + ` = ${quote} % · ${e.offen} offen zählen nicht`}
          </div>
        </div>
      </div>
      {/* ══ G-317: HIER STANDEN ZWEI TABELLEN ════════════════
          `[cmd]` **Wochen, Tage, Eintraege, Zeilen je Tag** — und
          darunter kcal Ziel, Protein, Kohlenhydrate, Fett.

          `[cmd]` **Vier davon standen rechts nochmal** in `Plan
          settings` (G-315 hat sie dort auf fuenf Zeilen gebracht).

          `[cmd]` **Und die Vorlage zeigt im aktiven Bereich KEINE
          Zielwerte** — gemessen ueber Z. 334-521: `target_kcal`
          kommt dort nicht vor, nur `kcal` als Pille in der
          Bibliothek (Z. 464).

          `[read]` **Damit loest sich G-302 mit auf:** die Zielzeile,
          die bei 1440 px umbrach, war kein Layoutfehler — **sie
          stand an der falschen Stelle.**

          `[read]` **Was der Plan anstrebt, gehoert zu seinen
          Einstellungen, nicht in den Kopf** — dort steht, wie er
          gerade laeuft. */}

      {/* ══ G-317: der Fliesstext ist weg ══════════════════
          `[cmd]` **Er lautete *,,aus nutrition.meal_plans · 3 Wochen
          · 21 Tage · 56 Eintraege · 4 Reihen aus deinen
          Vorlieben…"*** — **die dritte Wiederholung derselben
          Zahlen.**

          `[read]` **Die Herkunftsangabe gehoert an die Karte, nicht
          in einen Absatz** — `Plan settings` traegt sie als `sub`. */}
    </Card>
  )
}

/**
 * `Plan settings` — die Kopie der Attrappe (`tab-plans.tsx` Z. 246).
 *
 * ══ A-62: DER SATZ HIER WAR SEIT DEM 2026-08-30 FALSCH ═════════
 *
 * `[cmd]` **Hier stand:** *,,Vier der fuenf Zeilen der Vorlage fehlen
 * im Schema: `Lifecycle`, `Started`, `Next restart` und `Confirm
 * mode` haben keine Spalte."*
 *
 * `[cmd]` **Am 2026-09-01 gemessen: alle vier existieren.**
 * `lifecycle_type`, `start_date`, `days_count`, `next_plan_id` und
 * `rollover_count` stehen an `meal_plans`; `confirmation_mode` liegt
 * an `meal_plan_logs`.
 *
 * `[read]` **Die Berichtigung stand seit dem 30.08. IM RUMPF** (der
 * Kommentar unter „Zustand"), **aber nicht im Kopf** — und der Kopf
 * ist, was der naechste Leser zuerst sieht. **Genau die Klasse, die
 * A-62 meint: eine Aussage, die still kippt.**
 *
 * ══ WAS DIE ATTRAPPE ZEIGT, UND WAS DAVON BLEIBT ═════════════
 *
 *     Lifecycle       bleibt   `lifecycle_type`
 *     Days count      bleibt   `days_count`, sonst gezaehlte Tage
 *     Started         bleibt   `start_date`
 *     Next restart    ENTFAELLT
 *     Confirm mode    ENTFAELLT
 *
 * `[cmd]` **`Next restart` entfaellt**, weil die Zeile einen Termin
 * behauptet, an dem etwas geschieht. **Nach C-373/E-42 geschieht
 * nichts von selbst** — der Ablauf erzeugt eine Frage, und der
 * Nutzer waehlt. `[read]` **Ein Datum ohne Ausfuehrer ist ein
 * Versprechen.**
 *
 * `[cmd]` **`Confirm mode` entfaellt**, weil `confirmation_mode` an
 * `meal_plan_logs` haengt — **je Ausfuehrung, nicht als
 * Planeinstellung.** `[read]` **Und der MealCam-Weg existiert nicht**
 * (G-276): einen Modus anzubieten, den nichts ausfuehrt, waere
 * dasselbe Versprechen.
 */
export function PlanEinstellungenEcht({ d }: { d: PlanDaten }) {
  const z = planZaehlung(d)
  const p = d.plan
  // `[read]` **Die Laufzeit ist echt** — sie steht in den Tageszeilen,
  // auch wenn `days_count` fehlt (G-298).
  const laufzeit = laufzeitVon(
    d.wochen.flatMap(w => w.tage.map(x => x.plan_date)), heuteIso())
  return (
    <Card title="Plan settings" sub="aus nutrition.meal_plans">
      {/* Die Attrappe: Lifecycle · Days count · Started. */}
      <Row label="Lifecycle"
           value={p?.lifecycle_type ? ZYKLUS_TEXT[zyklusVon(p.lifecycle_type)] : '—'} />
      <Row label="Days count"
           value={zahl(p?.days_count ?? z.tage)} />
      {/* `[read]` **`start_date` oder gar nichts** — ein Plan aus der
          Zeit vor der Unterscheidung hat kein Startdatum, **und das
          ist eine Tatsache, keine Luecke** (E-40, G-287). */}
      <Row label="Started"
           value={p?.start_date ? deutschesDatum(p.start_date) : '—'} />
      {/* `[cmd]` **Statt `Next restart` das Ende der Laufzeit** — es
          ist gemessen, und es behauptet keinen Vollzug. */}
      {laufzeit.art !== 'unbekannt' && (
        <Row label="Läuft bis" value={deutschesDatum(laufzeit.bis)} />
      )}
      {/* ══ G-315: HIER STANDEN VIER ZEILEN ZU VIEL ═══════════
          `[cmd]` **`Wochen`, `Tage gesamt`, `Eintraege` und
          `Zustand`** — **acht Zeilen statt fuenf.**

          `[cmd]` **Die Vorlage (Z. 414-419) hat fuenf**, und alle
          vier Entfernten standen schon woanders:

              Wochen / Tage / Eintraege   in der Kopfkarte, Z. 132-137
              Zustand                     als Pille am Plannamen

          `[read]` **Eine Zahl an zwei Stellen ist keine Bestaetigung,
          sondern eine Frage** — welche gilt, wenn sie
          auseinandergehen? */}
      <Row label="Zustand"
           value={d.plan ? statusText(d.plan.status) : '—'} />
      {/* `[read]` **Der Lebenszyklus steht oben UND als eigene
          Karte** — hier der Wert, dort die drei Wahlen (Attrappe
          `Lifecycle types`). */}
    </Card>
  )
}

/**
 * Die Planbibliothek — je Plan seine Zaehlung.
 *
 * `[cmd]` Es ist **ein** Plan sichtbar, nicht zwei: der zweite gehoert
 * einem anderen Konto und faellt per RLS heraus.
 */
// ══ G-287 (2026-08-31): `PlanBibliothekEcht` ist entfernt ═════
//
// `[read]` **Sie zeigte je Woche eine Textzeile** — Datum, Name,
// Tageszahl, Eintragszahl. **Nicht anklickbar, kein Detail
// dahinter.** `[cmd]` **Tom, 2026-08-31:** *„irgend eine auflistung
// die gar nichts sagt, nichtmal anschaubar ist oder editierbar."*
//
// `[cmd]` **Ersetzt durch `MealPlanCard` + `MealPlanDetail`** in
// `plan-detail.tsx` — die Karte traegt Quelle, Status und kcal/Tag
// (SPEC_10), das Akkordeon die Tage mit ihren Eintraegen.
//
// `[read]` **A-59: geloescht, nicht auskommentiert** — was keinen
// Aufrufer hat, gilt beim naechsten Auftrag sonst als gebaut. git
// holt sie zurueck.

// ══ G-267 ff.: die drei Kacheln, die bis heute Attrappe waren ══════

// ══ G-274: `GhostEintraegeEcht` ist entfernt ═══════════════════════
//
// `[cmd]` **Sie zeigte Log-Zeilen** — und war damit am ersten Tag
// leer, weil ein Eintrag ohne Log gar nicht vorkam. `[read]` **Der
// Eintrag ist die Vorlage, das Log die Ausfuehrung:** was gezeigt
// werden muss, sind die Eintraege des Tages MIT ihrem Zustand.
//
// `[cmd]` **Ersetzt durch `PlanEintraegeEcht`** in
// `plan-eintraege.tsx` — mit den Knoepfen aus Flow 4. **Geloescht,
// nicht auskommentiert** (A-59); git holt sie zurueck.

/**
 * `Lifecycle types` — die Kopie der Attrappe (`tab-plans.tsx` Z. 274).
 *
 * `[cmd]` **BERICHTIGT in G-310: der Titel hiess *,,Lebenszyklus"*.**
 * `[read]` **Dieselbe Klasse wie `Planumfang` und `Einhaltung`** —
 * ein erfundener Titel neben einer Attrappe, die einen anderen traegt.
 *
 * Der Lebenszyklus DIESES Plans — G-270.
 *
 * `[read]` **Bisher stand hier eine Legende ueber drei Woerter.**
 * Jetzt steht da, was fuer den vorliegenden Plan gilt — und bei den
 * Bestandsplaenen, dass nichts hinterlegt ist.
 */
export function LebenszyklusEcht({ d }: { d: PlanDaten }) {
  const p = d.plan
  if (!p) return null
  const z = zyklusVon(p.lifecycle_type)
  return (
    <Card title="Lifecycle types" sub={statusText(p.status)}>
      <Row label="Zyklus" value={ZYKLUS_TEXT[z]} />
      {p.start_date && <Row label="Start" value={p.start_date} />}
      {p.days_count !== null && <Row label="Dauer" value={`${p.days_count} Tage`} />}
      {z === 'rollover' && p.rollover_count !== null && (
        <Row label="Durchläufe" value={String(p.rollover_count)} />
      )}
      <div className="v2-hinweis" style={{ marginTop: 8 }}>
        {ZYKLUS_ERKLAERUNG[z]}
      </div>
    </Card>
  )
}

/**
 * Die Einhaltung ueber den Zeitraum — G-270.
 *
 * `[read]` **Ohne entschiedene Zeilen gibt es keine Quote, nicht null
 * Prozent** — dieselbe Regel wie in C-323.
 */
export function EinhaltungEcht({ logs, datum }: {
  logs: readonly LogZeile[]
  /** G-310: der letzte Tag der Reihe — ohne ihn keine Sparkline. */
  datum?: string
}) {
  const e = einhaltungVon(logs)
  const q = quoteVon(e)
  // `[cmd]` **Die Attrappe zeigt SIEBEN Werte** (Z. 301) — dieselbe
  // Zahl, damit die Kurve dieselbe Breite hat.
  const reihe = datum ? tagesQuoten(logs, datum, 7) : []
  const schnitt = schnittQuote(reihe)
  // G-317: nur die Tage MIT Aussage — `null` ist keine 0.
  const gemessen = reihe
    .map(x => x.quote)
    .filter((v): v is number => v !== null)
  return (
    <Card title="7-day compliance" sub="aus meal_plan_logs">
      {q === null ? (
        <div className="v2-hinweis">{KEIN_LOG_SATZ}</div>
      ) : (
        <>
          {/* `[read]` **Nur zeichnen, wenn mindestens ZWEI Tage eine
              Aussage tragen** — eine Linie durch einen Punkt ist
              keine Kurve, sondern eine Behauptung ueber einen Verlauf,
              den niemand gemessen hat. */}
          {/* ══ G-317: die Kurve zeigt NUR gemessene Tage ════════
              `[cmd]` **Hier stand `reihe.map(x => x.quote ?? 0)`** —
              **ein Tag ohne Entscheidung wurde als 0 % gezeichnet.**

              `[read]` **Das ist dieselbe Erfindung, die `quoteVon`
              vermeidet:** `null` heisst *,,noch keine Aussage"*, nicht
              *,,null Prozent"* (C-323). **Eine Kurve, die an solchen
              Tagen auf den Boden faellt, behauptet einen Einbruch, den
              es nicht gab.**

              `[read]` **Der Auftrag fragt, was sie zeigen soll, wenn
              nur wenige Tage Daten haben.** **Antwort: nur diese** —
              die Kurve wird kuerzer, nicht falscher.

              `[cmd]` **Und die Skala steht fest auf 0-100** — ohne
              Vorgabe normalisiert die Sparkline auf min/max, und
              75/80/100 saehe aus wie ein Absturz. */}
          {gemessen.length >= 2 && (
            <Sparkline
              data={gemessen}
              min={0} max={100}
              color="var(--acc-nutri)" h={44}
            />
          )}
          {/* `[read]` **Und die Kurve sagt, ueber wie viele Tage sie
              geht** — sonst liest man sieben, wo sechs stehen. */}
          {gemessen.length >= 2 && gemessen.length < reihe.length && (
            <div className="v2-dim" style={{ fontSize: 10, marginTop: 2 }}>
              {gemessen.length} von {reihe.length} Tagen protokolliert
            </div>
          )}
          <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 11, flexWrap: 'wrap' }}
               className="v2-dim">
            {/* Die drei Zahlen der Attrappe: Avg · Deviations · Skips. */}
            <span>Avg <span className="v2-num" style={{ color: 'var(--fg)' }}>
              {schnitt === null ? '—' : `${schnitt} %`}
            </span></span>
            <span>Deviations <span className="v2-num" style={{ color: 'var(--warn)' }}>
              {e.abgewichen}
            </span></span>
            <span>Skips <span className="v2-num" style={{ color: 'var(--fg)' }}>
              {e.ausgelassen}
            </span></span>
            {/* `[read]` **Bestaetigt steht nicht in der Attrappe** —
                aber die Rechnung in der Kopfkarte nennt es, und ohne
                die Zahl waere `Avg` nicht nachvollziehbar. */}
            <span>Confirmed <span className="v2-num" style={{ color: 'var(--pos)' }}>
              {e.bestaetigt}
            </span></span>
          </div>
        </>
      )}
    </Card>
  )
}

/**
 * Welche Planposition regelmaessig gewechselt wird — G-309.
 *
 * **Tom, 2026-08-31:** *,,dass er seinen plan dementsprechend
 * vielleicht anpassen sollte wenn er eh zb die eine mahlzeit immer
 * gewechselt hat weil er es vielleicht nicht mag."*
 *
 * `[read]` **Etwas anderes als die Einhaltungsquote daneben.** **Die
 * sagt, WIE VIEL umgesetzt wurde — diese, WELCHE Position stoert.**
 * Eine Quote von 80 % kann heissen: alles laeuft, ausser dem
 * Fruehstueck.
 *
 * `[read]` **Ohne Befund keine leere Kachel mit 0 %** — sie sagt,
 * was fehlt: entweder noch keine Protokollzeilen, oder keine
 * Position, die auffaellt. **Das sind zwei verschiedene Aussagen.**
 */
export function WechselbefundEcht({ stand }: { stand: WechselStand }) {
  const { befunde, entschieden } = stand
  return (
    <Card title="Was du regelmäßig wechselst" sub="aus meal_plan_logs">
      {entschieden === 0 ? (
        <div className="v2-hinweis">
          Noch nichts protokolliert — bestätige oder lass Planpositionen
          aus, dann steht hier, welche du regelmäßig wechselst.
        </div>
      ) : befunde.length === 0 ? (
        <div className="v2-hinweis">
          {entschieden} {entschieden === 1 ? 'Position' : 'Positionen'} entschieden,
          keine fällt auf. Auffällig wird eine ab zwei Wechseln und mehr
          als der Hälfte ihrer Vorkommen.
        </div>
      ) : (
        <div className="v2-col-gap" style={{ gap: 8 }}>
          {befunde.map(b => (
            <div key={b.plan_entry_id}>
              <div style={{
                display: 'flex', alignItems: 'baseline', gap: 8, fontSize: 12,
              }}>
                <span style={{ fontWeight: 600 }}>{b.bezeichnung}</span>
                <span className="v2-dim" style={{ fontSize: 10.5 }}>
                  {SLOT_TEXT[b.meal_type] ?? b.meal_type}
                </span>
                <span className="v2-num" style={{ marginLeft: 'auto' }}>
                  {Math.round(b.quote * 100)} %
                </span>
              </div>
              <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.5 }}>
                {b.abgewichen > 0 && `${b.abgewichen}× anders gegessen`}
                {b.abgewichen > 0 && b.ausgelassen > 0 && ', '}
                {b.ausgelassen > 0 && `${b.ausgelassen}× ausgelassen`}
                {` — von ${b.gesamt} ${b.gesamt === 1 ? 'Mal' : 'Malen'}`}
              </div>
            </div>
          ))}
          <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.5 }}>
            Vielleicht magst du das nicht — du kannst die Position im
            Plan austauschen.
          </div>
        </div>
      )}
    </Card>
  )
}

/**
 * Die Bibliothek — alle Plaene, als Kopie der Attrappe.
 *
 * ══ DREI QUELLEN SAGEN DASSELBE ═════════════════════════
 *
 * `[cmd]` **Die Attrappe** (`tab-plans.tsx` Z. 343-370) zeigt unten
 * ein Raster aus Plankarten mit `Activate` und `Preview`.
 * `[cmd]` **E-41:** *,,Meal plans ist die Bibliothek — alle Plaene,
 * aktivieren."*
 * `[cmd]` **`SPEC_03` Flow 3, Schritt 1-2:** *,,Uebersicht zeigt alle
 * verfuegbaren Plaene."*
 *
 * ══ DER BEFUND, DER DAZU FUEHRTE ════════════════════════
 *
 * `[cmd]` **Am 2026-09-01 gemessen: vier Plaene bei `test-user`, EINER
 * erschien.** `[read]` **Der Reiter zeigte nur den aktiven** —
 * `ladePlan()` nimmt `plaene[0]`. **`allePlaene` war geladen, ging
 * aber nur an den Planner.**
 *
 * `[cmd]` **Und der Kommentar dort sagte *,,Einen Plan, nicht zwei —
 * der zweite gehoert `tom.seed`"*** — **das begruendete genau die
 * Luecke** (A-62: eine Aussage, die still kippt).
 *
 * `[read]` **`PlanKurz`, nicht `PlanDaten`** — die Liste soll zeigen,
 * welche Plaene es gibt, nicht was in ihnen steht. **Das Detail laedt
 * `MealPlanCard` fuer den aktiven.**
 */
/**
 * Die Vorschau eines Plans — G-314.
 *
 * **`SPEC_03` Flow 3, Schritt 3:** *,,Tap auf Plan → Plan-Vorschau"*,
 * danach *,,Plan aktivieren"*.
 *
 * `[cmd]` **Der Knopf stand in der Attrappe** (`tab-plans.tsx`
 * Z. 365) — **und war nicht gebaut**, weil die Bibliothek `PlanKurz`
 * haelt und das Tages-Akkordeon `PlanDaten` braucht.
 *
 * `[cmd]` **Geloest ueber `GET ?vorschau=<id>`** — `ladePlan(planId)`
 * nimmt den Bezeichner seit G-311, **nur der Weg dorthin fehlte.**
 *
 * `[read]` **Rein lesend, und der Reiter bleibt stehen** — seit
 * G-327 gilt `?plan=` nur im Planner. **Die Vorschau setzt die
 * Adresse nicht**, sie laedt in ein Fenster.
 */
function PlanVorschau({ plan, onClose }: {
  plan: PlanKurz
  onClose: () => void
}) {
  const [daten, setDaten] = React.useState<PlanDaten | null>(null)
  const [fehler, setFehler] = React.useState<string | null>(null)

  React.useEffect(() => {
    let weg = false
    void (async () => {
      try {
        const a = await fetch(`/api/nutrition/plan?vorschau=${plan.id}`)
        const k = await a.json()
        if (weg) return
        if (!a.ok) { setFehler(k?.error ?? `Fehler ${a.status}`); return }
        setDaten(k.plan as PlanDaten)
      } catch (e) {
        if (!weg) setFehler(e instanceof Error ? e.message : String(e))
      }
    })()
    return () => { weg = true }
  }, [plan.id])

  React.useEffect(() => {
    const auf = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', auf)
    return () => window.removeEventListener('keydown', auf)
  }, [onClose])

  return (
    <div
      role="dialog" aria-modal="true" aria-label={`Vorschau: ${plan.name}`}
      data-probe="plan-vorschau"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(0,0,0,0.5)', display: 'flex',
        alignItems: 'flex-start', justifyContent: 'center',
        padding: '5vh 16px', overflowY: 'auto',
      }}
    >
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 8, width: '100%', maxWidth: 720, padding: 16,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
        }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{plan.name}</span>
          <Pill>{statusText(plan.status)}</Pill>
          <div style={{ flex: 1 }} />
          <button type="button" className="v2-btn v2-btn-sm"
                  onClick={onClose} aria-label="Schliessen">
            <Icon name="x" className="v2-ic v2-ic-sm" />
          </button>
        </div>

        {plan.description && (
          <p className="v2-muted" style={{ fontSize: 11.5, margin: '0 0 10px' }}>
            {plan.description}
          </p>
        )}

        {fehler && (
          <p style={{ fontSize: 11.5, color: 'var(--neg)' }}>{fehler}</p>
        )}
        {!daten && !fehler && (
          <p className="v2-muted" style={{ fontSize: 11.5 }}>Lädt …</p>
        )}

        {daten && (
          <>
            {/* `[read]` **Die Zahlen zuerst** — wer entscheidet, ob er
                einen Plan aktiviert, will wissen, wie gross er ist. */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              <Pill style={{ fontSize: 9.5 }}>{plan.wochen} Wochen</Pill>
              <Pill style={{ fontSize: 9.5 }}>{plan.tage} Tage</Pill>
              <Pill style={{ fontSize: 9.5 }}>{plan.positionen} Positionen</Pill>
            </div>

            {/* `[cmd]` **Die erste Woche als Beispiel** — nicht alle:
                bei 28 Tagen waere das Fenster eine Tabelle, durch die
                niemand scrollt. `[read]` **Die Zahl daneben sagt, was
                nicht gezeigt wird.** */}
            {daten.wochen.length > 0 ? (
              <div data-probe="vorschau-tage" className="v2-col-gap" style={{ gap: 4 }}>
                {daten.wochen[0].tage.map(tag => (
                  <div key={tag.id} style={{
                    display: 'flex', gap: 8, fontSize: 11.5,
                    padding: '4px 0', borderBottom: '1px solid var(--border)',
                  }}>
                    <span className="v2-num v2-dim" style={{ width: 76 }}>
                      {tag.plan_date}
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      {tag.eintraege.length === 0
                        ? <span className="v2-dim">— nichts geplant</span>
                        : tag.eintraege.map(e => e.bezeichnung).join(' · ')}
                    </span>
                    <span className="v2-num v2-dim" style={{ width: 44, textAlign: 'right' }}>
                      {tag.eintraege.length}
                    </span>
                  </div>
                ))}
                {daten.wochen.length > 1 && (
                  <p className="v2-muted" style={{ fontSize: 10.5, marginTop: 6 }}>
                    Woche 1 von {daten.wochen.length} — die übrigen stehen
                    im Planner, sobald der Plan gewählt ist.
                  </p>
                )}
              </div>
            ) : (
              <p className="v2-muted" style={{ fontSize: 11.5 }}>
                Dieser Plan hat noch keine Wochen.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export function PlanBibliothekEcht({
  plaene, aktivId, heute, onGeaendert,
}: {
  plaene: readonly PlanKurz[]
  /** Der Plan, der oben schon in voller Breite steht. */
  aktivId?: string | null
  /** G-319: fuer die Aktivierungsfrage (Flow 3, Schritt 5). */
  heute: string
  onGeaendert?: () => void
}) {
  // G-319: welcher Plan wird gerade aktiviert?
  const [aktiviert, setAktiviert] = React.useState<string | null>(null)
  // G-314: welcher Plan wird gerade angesehen?
  const [vorschau, setVorschau] = React.useState<PlanKurz | null>(null)
  // `[read]` **Der laufende Plan** — er wird pausiert, und die Frage
  // sagt es vorher (G-309).
  const laufender = plaene.find(p => p.status === 'active') ?? null
  // `[read]` **Der aktive Plan steht OBEN in voller Breite** — ihn
  // hier zu wiederholen waere derselbe Plan zweimal. **Das Mockup
  // macht es genauso:** `plans.slice(1)` (Z. 84).
  const uebrige = plaene.filter(p => p.id !== aktivId)
  if (uebrige.length === 0) return null

  return (
    <div className="v2-col-gap" style={{ gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="v2-eyebrow">Alle Pläne</span>
        <Pill>{plaene.length} Pläne</Pill>
      </div>
      <div className="v2-grid v2-g-cols-3" style={{ gap: 12 }}>
        {uebrige.map(p => {
          const h = herkunftVon(p.plan_origin)
          const badge = HERKUNFT_BADGE[h]
          const farbe = HERKUNFT_FARBE[h]
          return (
            <Card key={p.id} style={{ padding: 14 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                marginBottom: 6, flexWrap: 'wrap',
              }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                {/* `[cmd]` **Das Badge der Vorlage** (Mockup Z. 89).
                    `[read]` **`self_created` traegt keines** —
                    `SPEC_03` Flow 3: *,,Eigene — ohne Label"*. */}
                {badge && (
                  <Pill style={{
                    fontSize: 9,
                    color: farbe ?? undefined,
                    borderColor: farbe
                      ? `color-mix(in srgb, ${farbe} 40%, var(--border))`
                      : undefined,
                  }}>
                    {badge}
                  </Pill>
                )}
              </div>
              {p.description && (
                <div className="v2-muted" style={{ fontSize: 11, marginBottom: 6 }}>
                  {p.description}
                </div>
              )}
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                <Pill style={{ fontSize: 9.5 }}>{statusText(p.status)}</Pill>
                <Pill style={{ fontSize: 9.5 }}>{p.tage} Tage</Pill>
                <Pill style={{ fontSize: 9.5 }}>{p.positionen} Positionen</Pill>
              </div>
              {/* `[cmd]` **Die Attrappe zeigt `Activate` nur an einem
                  Plan, der nicht laeuft** (Z. 364) — und `Preview`
                  fuehrt heute nirgendwohin, deshalb steht er nicht
                  da. **Ein Knopf ohne Ziel ist eine Sackgasse**
                  (G-311). */}
              {/* ══ G-319: der Knopf aktiviert DIESEN Plan ═══════
                  **Tom, 2026-09-02:** *,,wenn unten plaene stehen
                  muessen die auch aktivierbar sein, da geht
                  nichts."*

                  `[cmd]` **Der Aufrufer gab
                  `onAktivieren={() => setAktivieren(true)}`** — die
                  `id` wurde verworfen, und das Modal oeffnete fuer
                  den AKTIVEN Plan.

                  `[read]` **Deshalb fuehrt die Bibliothek die Frage
                  jetzt selbst** — dieselbe `AktivierenFrage` wie im
                  Planner, je Kachel eine. */}
              {/* ══ G-314: Vorschau vor dem Aktivieren ══════════
                  **Flow 3 Schritt 3.** `[read]` **An JEDER Kachel**,
                  auch am laufenden Plan — nachsehen darf man immer.
                  `[read]` **Der Reiter bleibt stehen:** die Vorschau
                  laedt in ein Fenster, sie setzt keine Adresse
                  (G-327). */}
              <button type="button" className="v2-btn v2-btn-sm"
                      data-probe="vorschau-knopf"
                      onClick={e => { e.stopPropagation(); setVorschau(p) }}>
                Vorschau
              </button>
              {p.status !== 'active' && aktiviert !== p.id && (
                <button type="button" className="v2-btn v2-btn-primary v2-btn-sm"
                        onClick={() => setAktiviert(p.id)}>
                  Aktivieren
                </button>
              )}
              {aktiviert === p.id && (
                <AktivierenFrage
                  plan={p}
                  laufender={laufender}
                  heute={heute}
                  onFertig={() => { setAktiviert(null); onGeaendert?.() }}
                  onAbbruch={() => setAktiviert(null)}
                />
              )}
            </Card>
          )
        })}

      {/* G-314: das Vorschaufenster — eines fuer alle Kacheln. */}
      {vorschau && (
        <PlanVorschau plan={vorschau} onClose={() => setVorschau(null)} />
      )}
      </div>
    </div>
  )
}

/** Die Slotnamen, wie sie im Tagebuch stehen. */
// ══ G-335: die eigene Namensliste ist weg ═════════════════
//
// `[cmd]` **`meal_type` wurde ueber FUENF Tabellen an ZEHN Stellen
// uebersetzt** (gemessen an HEAD, 2026-09-02) — vier
// Schreibweisen fuer `pre_workout` allein.
//
// `[read]` **`meal_type` ist eine Kategorie, keine Beschriftung**
// (E-58). **`KATEGORIE_TEXT` ist der Rueckfall**, wenn keine Quelle
// einen Namen liefert.
const SLOT_TEXT = KATEGORIE_TEXT

// ══ G-310: `HerkunftEcht` ist entfernt ════════════════════
//
// `[cmd]` **Sie stand in keiner Attrappe.** `[read]` **Sie war aus
// dem Schema abgeleitet** — eine Kachel je Spaltengruppe, genau das
// Muster, das G-310 beanstandet.
//
// `[cmd]` **In der Vorlage steht die Herkunft als BADGE an der
// Plankarte** (`MealPlansView.js` Z. 89; `SPEC_03` Flow 3 Schritt 2
// nennt die Beschriftungen je Quelle). **Dorthin ist sie gewandert**
// — `plan-detail.tsx`, `MealPlanCard`, mit `HERKUNFT_BADGE` und
// `HERKUNFT_FARBE`.
//
// `[read]` **Der Satz zur unbekannten Herkunft ist mitgegangen** —
// `plan-detail.tsx` zeigt ihn bereits; er traegt Information, die kein
// Badge fasst.
//
// `[read]` **A-59: geloescht, nicht auskommentiert** — was keinen
// Aufrufer hat, gilt beim naechsten Auftrag sonst als gebaut. git holt
// sie zurueck.

export function EinkaufslisteEcht({ anzahl }: { anzahl: number }) {
  if (anzahl > 0) return null
  return (
    <Card title="Einkaufsliste">
      <div className="v2-hinweis">{KEINE_EINKAUFSLISTE_SATZ}</div>
    </Card>
  )
}
