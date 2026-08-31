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
import { Card, Pill, Row } from '@lumeos/ui'

import type { PlanDaten } from '../../../lib/nutrition/plan-lesen'
import {
  herkunftVon, HERKUNFT_TEXT, HERKUNFT_UNBEKANNT_SATZ,
  zyklusVon, ZYKLUS_TEXT, ZYKLUS_ERKLAERUNG,
  statusText, bearbeitbarkeit,
  KEIN_LOG_SATZ, KEINE_EINKAUFSLISTE_SATZ,
  einhaltungVon, quoteVon, type LogZeile,
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
 * Der Plankopf — Name, Zustand, Ziele.
 *
 * `[cmd]` **Ohne Ring.** Die Vorlage zeigt dort eine Compliance in
 * Prozent; sie braucht einen Ist-Soll-Vergleich je Eintrag, und
 * `meal_plan_entries` fuehrt keinen Status. **Statt einer erfundenen
 * Zahl steht die Zaehlung da**, die wirklich gemessen ist.
 */
export function PlanKopfEcht({ d }: { d: PlanDaten }) {
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
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 15, fontWeight: 600 }}>{p.name}</span>
        {p.is_active
          ? <Pill variant="acc">aktiv</Pill>
          : <Pill>pausiert</Pill>}
      </div>
      {p.description && (
        <div className="v2-muted" style={{ fontSize: 12, marginBottom: 8 }}>
          {p.description}
        </div>
      )}
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
 * Die Planeinstellungen, soweit sie in den Daten stehen.
 *
 * `[cmd]` **Vier der fuenf Zeilen der Vorlage fehlen im Schema:**
 * `Lifecycle`, `Started`, `Next restart` und `Confirm mode` haben
 * keine Spalte. Sie stehen deshalb nicht als Strich da, **sondern gar
 * nicht** — eine Zeile mit Strich behauptet, der Wert sei nur leer.
 */
export function PlanEinstellungenEcht({ d }: { d: PlanDaten }) {
  const z = planZaehlung(d)
  return (
    <Card title="Planumfang" sub="aus dem Schema gelesen">
      <Row label="Wochen" value={zahl(z.wochen)} />
      <Row label="Tage gesamt" value={zahl(z.tage)} />
      <Row label="Einträge" value={zahl(z.eintraege)} />
      {/* `[cmd]` **G-267, 2026-08-30: der Zustand kommt jetzt aus
          `status`**, nicht mehr aus `is_active` — fuenf Werte statt
          zwei (`assigned`, `active`, `completed`, `paused`,
          `archived`). */}
      <Row label="Zustand"
           value={d.plan ? statusText(d.plan.status) : '—'} />
      {/* `[cmd]` **Hier stand bis zum 2026-08-30:** *„Lebenszyklus,
          Startdatum und Bestaetigungsmodus fehlen im Schema."*
          **Das stimmt nicht mehr** — Codex hat die sechs Spalten und
          `meal_plan_logs` eingespielt, am selben Tag nachgemessen.
          `[read]` **Der Satz stand vier Wochen richtig und wurde an
          dem Tag falsch, an dem das Schema kam** — genau die Klasse
          von Kommentar, die still altert. Der Lebenszyklus steht
          jetzt in einer eigenen Kachel. */}
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
export function EinhaltungEcht({ logs }: { logs: readonly LogZeile[] }) {
  const e = einhaltungVon(logs)
  const q = quoteVon(e)
  return (
    <Card title="Einhaltung" sub="aus meal_plan_logs">
      {q === null ? (
        <div className="v2-hinweis">{KEIN_LOG_SATZ}</div>
      ) : (
        <>
          <div className="v2-num" style={{ fontSize: 22 }}>{q} %</div>
          <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 11 }}
               className="v2-dim">
            <span>bestätigt {e.bestaetigt}</span>
            <span>abgewichen {e.abgewichen}</span>
            <span>ausgelassen {e.ausgelassen}</span>
          </div>
        </>
      )}
    </Card>
  )
}

/**
 * Herkunft und Bearbeitungsrecht — G-268 / G-269.
 *
 * `[cmd]` **Die Freigabe kommt aus
 * `coach.darf_nutrition_plan_aendern`** (E-29), nicht aus
 * `coach.client_autonomy`. `[cmd]` **Gemessen am 2026-08-30: `dev`
 * steht auf Stufe 3 und bekommt `false`.**
 *
 * `[read]` **Der Reiter sagt WARUM gesperrt ist, nicht nur DASS** —
 * ein ausgegrauter Knopf ohne Begruendung ist eine Sackgasse.
 */
export function HerkunftEcht({
  d, coachFreigabe, onBearbeiten,
}: {
  d: PlanDaten
  coachFreigabe: boolean
  onBearbeiten: () => void
}) {
  const p = d.plan
  if (!p) return null
  const h = herkunftVon(p.plan_origin)
  const b = bearbeitbarkeit(h, coachFreigabe)
  return (
    <Card title="Herkunft" sub={HERKUNFT_TEXT[h]}>
      {h === 'unbekannt' && (
        <div className="v2-hinweis" style={{ marginBottom: 8 }}>
          {HERKUNFT_UNBEKANNT_SATZ}
        </div>
      )}
      {b.erlaubt ? (
        <button type="button" className="v2-btn" onClick={onBearbeiten}>
          Plan bearbeiten
        </button>
      ) : (
        <div className="v2-hinweis" style={{ color: 'var(--warn)' }}>{b.satz}</div>
      )}
    </Card>
  )
}

/**
 * Die Einkaufsliste — G-270.
 *
 * `[cmd]` **`nutrition.shopping_lists` existiert** (1 Zeile, 6
 * Positionen im Bestand); **`dev` hat nur keine.** `[read]` **Das ist
 * ein Leerzustand, kein fehlendes Feature** — der Quelltext nannte
 * bis heute eine fehlende Tabelle als Grund, und das war schon in
 * G-271 falsch.
 */
export function EinkaufslisteEcht({ anzahl }: { anzahl: number }) {
  if (anzahl > 0) return null
  return (
    <Card title="Einkaufsliste">
      <div className="v2-hinweis">{KEINE_EINKAUFSLISTE_SATZ}</div>
    </Card>
  )
}
