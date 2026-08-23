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
      <Row label="Zustand" value={d.plan?.is_active ? 'aktiv' : 'pausiert'} />
      <div className="v2-divider" />
      <p className="v2-muted" style={{ fontSize: 11, lineHeight: 1.55 }}>
        <strong>Lebenszyklus, Startdatum und Bestätigungsmodus fehlen im
        Schema.</strong> Die Vorlage zeigt sie; `meal_plans` führt dafür
        keine Spalten. Sie stehen deshalb hier nicht — auch nicht als
        Strich, denn ein Strich hiesse „leer" statt „gibt es nicht".
      </p>
    </Card>
  )
}

/**
 * Die Planbibliothek — je Plan seine Zaehlung.
 *
 * `[cmd]` Es ist **ein** Plan sichtbar, nicht zwei: der zweite gehoert
 * einem anderen Konto und faellt per RLS heraus.
 */
export function PlanBibliothekEcht({ d }: { d: PlanDaten }) {
  const z = planZaehlung(d)
  if (!d.plan) {
    return (
      <Card title="Bibliothek">
        <p className="v2-muted" style={{ fontSize: 12 }}>
          Kein Plan vorhanden.
        </p>
      </Card>
    )
  }
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{d.plan.name}</span>
        {d.plan.is_active && <Pill variant="acc">aktiv</Pill>}
      </div>
      <div className="v2-dim v2-mono" style={{ fontSize: 10.5, lineHeight: 1.7 }}>
        {z.wochen} Wochen · {z.tage} Tage · {z.eintraege} Einträge
        {d.rezepte.length > 0 && <> · {d.rezepte.length} eigene Rezepte</>}
      </div>
      {/* Die Wochen einzeln — sie tragen ihre Herkunft, wenn sie
          kopiert wurden (C-150). */}
      <div className="v2-col-gap" style={{ gap: 4, marginTop: 10 }}>
        {d.wochen.map(w => (
          <div key={w.id} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '5px 9px', borderRadius: 6, fontSize: 11.5,
            background: 'var(--surface)', border: '1px solid var(--border)',
          }}>
            <span className="v2-num" style={{ color: 'var(--fg-subtle)' }}>
              {w.week_start}
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>{w.name ?? '—'}</span>
            {w.kopiert_von && <Pill>kopiert</Pill>}
            <span className="v2-num v2-dim">
              {w.tage.length} Tage ·{' '}
              {w.tage.reduce((s, t) => s + t.eintraege.length, 0)} Einträge
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
