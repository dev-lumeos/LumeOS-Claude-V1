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
import { Card, Pill, Row, Ring, Sparkline } from '@lumeos/ui'

import type { PlanDaten } from '../../../lib/nutrition/plan-lesen'
import {
  zyklusVon, ZYKLUS_TEXT, ZYKLUS_ERKLAERUNG,
  statusText,
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
          {laufzeit.art !== 'laeuft' && (
            <div className="v2-dim" style={{ fontSize: 11, marginBottom: 8, lineHeight: 1.5 }}>
              {laufzeitSatz(laufzeit)}
            </div>
          )}
          {p.description && (
            <div className="v2-muted" style={{ fontSize: 12, marginBottom: 8 }}>
              {p.description}
            </div>
          )}
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
      <div className="v2-grid v2-g-cols-4" style={{ gap: 10, marginTop: 10 }}>
        <Row label="Wochen" value={zahl(z.wochen)} />
        <Row label="Tage" value={zahl(z.tage)} />
        <Row label="Einträge" value={zahl(z.eintraege)} />
        <Row label="Zeilen je Tag" value={zahl(d.zeilen.length)} />
      </div>
      {/* `[read]` Die Ziele stehen als Zahlen da, ohne Bewertung —
          ein „89 % erreicht" braeuchte den Ist-Wert des Tages. */}
      {(p.target_kcal !== null || p.target_protein_g !== null) && (
        <>
          <div className="v2-divider" />
          <div className="v2-grid v2-g-cols-4" style={{ gap: 10 }}>
            <Row label="kcal Ziel" value={zahl(p.target_kcal)} />
            <Row label="Protein" value={p.target_protein_g !== null ? `${zahl(p.target_protein_g)} g` : '—'} />
            <Row label="Kohlenhydrate" value={p.target_carbs_g !== null ? `${zahl(p.target_carbs_g)} g` : '—'} />
            <Row label="Fett" value={p.target_fat_g !== null ? `${zahl(p.target_fat_g)} g` : '—'} />
          </div>
        </>
      )}
      <div className="v2-dim v2-mono" style={{ fontSize: 10, marginTop: 10, lineHeight: 1.6 }}>
        aus nutrition.meal_plans · {z.wochen} Wochen · {z.tage} Tage ·
        {' '}{z.eintraege} Einträge · {d.zeilenGrund}
      </div>
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
      <Row label="Wochen" value={zahl(z.wochen)} />
      <Row label="Tage gesamt" value={zahl(z.tage)} />
      <Row label="Einträge" value={zahl(z.eintraege)} />
      {/* `[cmd]` **G-267, 2026-08-30: der Zustand kommt jetzt aus
          `status`**, nicht mehr aus `is_active` — fuenf Werte statt
          zwei (`assigned`, `active`, `completed`, `paused`,
          `archived`). */}
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
    <Card title="Lebenszyklus" sub={statusText(p.status)}>
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
          {reihe.filter(x => x.quote !== null).length >= 2 && (
            <Sparkline
              data={reihe.map(x => x.quote ?? 0)}
              color="var(--acc-nutri)" h={44}
            />
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

/** Die Slotnamen, wie sie im Tagebuch stehen. */
const SLOT_TEXT: Record<string, string> = {
  breakfast: 'Frühstück', lunch: 'Mittag', dinner: 'Abend',
  snack: 'Snack', pre_workout: 'Pre-Workout', post_workout: 'Post-Workout',
}

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
