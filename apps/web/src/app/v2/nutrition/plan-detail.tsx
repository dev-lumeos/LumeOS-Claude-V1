'use client'

// ════════════════════════════════════════════════════════════════════
// MealPlanCard · MealPlanDetail · MealPlanActivationModal — G-286/287/290
// ════════════════════════════════════════════════════════════════════
//
// **Tom, 2026-08-31:** *,,irgend eine auflistung die gar nichts sagt,
// nichtmal anschaubar ist oder editierbar."*
//
// `[cmd]` **`SPEC_10_COMPONENTS.md`, Abschnitt *Meal Plan Components*:**
//
//     MealPlanCard             Name, Quelle, Status, Tage, kcal/Tag
//     MealPlanDetail           Plan-Vorschau: Tages-Accordion mit Items
//     MealPlanActivationModal  Startdatum + Lifecycle-Wahl + Bestaetigung
//     LifecyclePicker          once / rollover / sequence
//
// ══ WAS HIER NICHT ENTSTEHT ═════════════════════════════════════════
//
// `[read]` **Keine zweite Tagesansicht.** `PlanEintraegeEcht`
// (`plan-eintraege.tsx`) zeigt die Eintraege EINES Tages mit ihrem
// Ausfuehrungszustand — Bestaetigen und Ueberspringen, Flow 4.
// **Das ist die Ausfuehrung von heute.**
//
// `[read]` **Das Akkordeon zeigt etwas anderes: die STRUKTUR des
// Plans** — 21 Tage, ihre Eintraege, ohne Ausfuehrungszustand. **Ein
// Tag im Akkordeon ist kein Tag im Tagebuch;** wer beides
// zusammenlegt, zeigt an einem Plantag in vier Wochen Knoepfe zum
// Abhaken.
//
// `[read]` **A-30:** nur Typen aus dem Leseweg, kein Wertimport —
// geladen wird serverseitig in `page.tsx`.
import * as React from 'react'
import { Card, Pill, Icon, Empty } from '@lumeos/ui'

import type { PlanDaten, PlanTag, PlanWoche } from '../../../lib/nutrition/plan-lesen'
import {
  HERKUNFT_TEXT, herkunftVon, HERKUNFT_UNBEKANNT_SATZ,
  ZYKLUS_TEXT, ZYKLUS_ERKLAERUNG,
} from '../../../lib/nutrition/plan-lage'
import {
  ZYKLUS_WAEHLBAR, type ZyklusWahl, planKennzahlen, tagesKcal,
} from '../../../lib/nutrition/plan-detail-lage'

// ── MealPlanCard ──────────────────────────────────────────────────
//
// `[cmd]` **SPEC_10: *,,Name, Quelle, Status, Tage, kcal/Tag"*.**
//
// `[read]` **Und sie fuehrt aufs Detail** — das war der Kern von
// G-287: die Liste war nicht anklickbar.

export function MealPlanCard({
  d, offen, onOeffnen, onAktivieren,
}: {
  d: PlanDaten
  offen: boolean
  onOeffnen: () => void
  onAktivieren: () => void
}) {
  const p = d.plan
  if (!p) {
    return (
      <Card title="Meal plans">
        <Empty
          title="Kein Plan vorhanden"
          sub="Ein neuer Plan entsteht über „Plan anlegen“."
          icon="calendar"
        />
      </Card>
    )
  }

  const k = planKennzahlen(d)
  const herkunft = herkunftVon(p.plan_origin)

  return (
    <Card>
      <button
        type="button"
        onClick={onOeffnen}
        aria-expanded={offen}
        style={{
          background: 'none', border: 0, padding: 0, width: '100%',
          textAlign: 'left', cursor: 'pointer', color: 'inherit',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Icon
            name={offen ? 'chevron_down' : 'chevron_right'}
            className="v2-ic v2-ic-sm"
          />
          <span style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</span>
          {/* Das Source-Badge aus der Spec. `[read]` Bei `null` steht
              „Herkunft nicht hinterlegt" — zeigen, nicht fuellen. */}
          <Pill variant={herkunft === 'unbekannt' ? undefined : 'acc'}>
            {HERKUNFT_TEXT[herkunft]}
          </Pill>
          <Pill variant={p.status === 'active' ? 'pos' : undefined}>{p.status}</Pill>
          <span className="v2-num v2-dim" style={{ marginLeft: 'auto', fontSize: 10.5 }}>
            {k.tage} Tage · {k.eintraege} Einträge
            {k.kcalSchnitt !== null && <> · ø {k.kcalSchnitt} kcal/Tag</>}
          </span>
        </div>
      </button>

      {p.description && (
        <div className="v2-muted" style={{ fontSize: 11.5, marginTop: 6 }}>
          {p.description}
        </div>
      )}

      {/* `[read]` **Der Satz steht nur, wenn die Herkunft fehlt** —
          sonst ist er Rauschen. */}
      {herkunft === 'unbekannt' && (
        <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 6, lineHeight: 1.5 }}>
          {HERKUNFT_UNBEKANNT_SATZ}
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
        <button type="button" className="v2-btn v2-btn-sm" onClick={onOeffnen}>
          {offen ? 'Zuklappen' : 'Tage ansehen'}
        </button>
        <button type="button" className="v2-btn v2-btn-sm v2-btn-primary"
                onClick={onAktivieren}>
          <Icon name="calendar" className="v2-ic v2-ic-sm" />
          {p.status === 'active' ? 'Laufzeit ändern' : 'Aktivieren'}
        </button>
      </div>
    </Card>
  )
}

// ── MealPlanDetail ────────────────────────────────────────────────
//
// `[cmd]` **SPEC_10: *,,Plan-Vorschau: Tages-Accordion mit Items"*.**

export function MealPlanDetail({ d }: { d: PlanDaten }) {
  // `[read]` **Der erste Tag ist offen.** Ein Akkordeon, das
  // vollstaendig zu ist, sieht aus wie eine leere Liste — genau der
  // Zustand, den G-286 behebt.
  const ersterTag = d.wochen[0]?.tage[0]?.id ?? null
  const [offen, setOffen] = React.useState<string | null>(ersterTag)

  if (!d.plan) return null
  if (d.wochen.length === 0) {
    return (
      <Card title="Plan-Vorschau">
        <Empty
          title="Keine Wochen angelegt"
          sub="Der Plan trägt noch keine Tage — im Planner entstehen sie."
          icon="calendar"
        />
      </Card>
    )
  }

  return (
    <Card title="Plan-Vorschau" sub={`${d.wochen.length} Wochen · Tag anklicken`}>
      <div className="v2-col-gap" style={{ gap: 10 }}>
        {d.wochen.map(w => (
          <WochenBlock
            key={w.id}
            w={w}
            offen={offen}
            onSchalten={id => setOffen(a => (a === id ? null : id))}
          />
        ))}
      </div>
    </Card>
  )
}

function WochenBlock({
  w, offen, onSchalten,
}: {
  w: PlanWoche
  offen: string | null
  onSchalten: (id: string) => void
}) {
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
      }}>
        <span className="v2-eyebrow">{w.name ?? w.week_start}</span>
        {w.kopiert_von && <Pill>kopiert</Pill>}
        <span className="v2-num v2-dim" style={{ marginLeft: 'auto', fontSize: 10 }}>
          {w.tage.length} Tage
        </span>
      </div>
      <div className="v2-col-gap" style={{ gap: 3 }}>
        {w.tage.map(t => (
          <TagesZeile key={t.id} t={t} offen={offen === t.id}
                      onSchalten={() => onSchalten(t.id)} />
        ))}
      </div>
    </div>
  )
}

/** Ein Tag: zugeklappt eine Zeile, aufgeklappt seine Eintraege. */
function TagesZeile({
  t, offen, onSchalten,
}: {
  t: PlanTag
  offen: boolean
  onSchalten: () => void
}) {
  const kcal = tagesKcal(t)
  return (
    <div style={{
      border: '1px solid var(--border)', borderRadius: 6,
      background: 'var(--surface)',
    }}>
      <button
        type="button"
        onClick={onSchalten}
        aria-expanded={offen}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          padding: '6px 10px', background: 'none', border: 0,
          cursor: 'pointer', color: 'inherit', textAlign: 'left',
        }}
      >
        <Icon name={offen ? 'chevron_down' : 'chevron_right'} className="v2-ic v2-ic-sm" />
        <span className="v2-num" style={{ fontSize: 11, color: 'var(--fg-subtle)' }}>
          {t.plan_date}
        </span>
        <span style={{ flex: 1, minWidth: 0, fontSize: 11.5 }}>
          {t.eintraege.length === 0
            ? <span className="v2-dim">nichts geplant</span>
            : `${t.eintraege.length} Einträge`}
        </span>
        {/* `[read]` **Ein Strich, keine Null.** `kcal: null` heisst
            „nicht ermittelbar", nicht „null Kalorien" — die Regel
            steht am Typ in `plan-lesen.ts`. */}
        <span className="v2-num v2-dim" style={{ fontSize: 10.5 }}>
          {kcal === null ? '—' : `${kcal} kcal`}
        </span>
      </button>

      {offen && t.eintraege.length > 0 && (
        <div className="v2-tbl-wrap">
          <table className="v2-tbl">
            <thead>
              <tr>
                <th>Slot</th><th>Eintrag</th><th>Menge</th><th style={{ textAlign: 'right' }}>kcal</th>
              </tr>
            </thead>
            <tbody>
              {t.eintraege.map(e => (
                <tr key={e.id}>
                  <td style={{ paddingLeft: 14 }}>
                    <Pill>{e.meal_type}</Pill>
                  </td>
                  <td>
                    <div style={{ fontSize: 12 }}>{e.bezeichnung}</div>
                    {e.note && (
                      <div className="v2-dim" style={{ fontSize: 10 }}>{e.note}</div>
                    )}
                  </td>
                  <td className="v2-num" style={{ fontSize: 11 }}>
                    {e.amount_g !== null
                      ? `${e.amount_g} g`
                      : e.planned_servings !== null
                        ? `${e.planned_servings} Port.`
                        : '—'}
                  </td>
                  <td className="v2-num" style={{ textAlign: 'right', fontSize: 11 }}>
                    {e.kcal === null ? '—' : Math.round(e.kcal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── MealPlanActivationModal mit LifecyclePicker ────────────────────
//
// `[cmd]` **SPEC_10: *,,Startdatum + Lifecycle-Wahl + Bestaetigung"*.**
//
// `[read]` **Warum ein eigener Vorgang und kein Feld im Anlegen:**
// `planAnlegen` setzt `status` bewusst auf `'assigned'` — **ein
// neuer Plan ist noch nicht aktiv.** Zwei Entscheidungen in einen
// Knopf zu legen war schon dort abgelehnt (G-267).

export function MealPlanActivationModal({
  d, onClose, onGespeichert,
}: {
  d: PlanDaten
  onClose: () => void
  onGespeichert: () => void
}) {
  const p = d.plan
  const k = planKennzahlen(d)
  const [zyklus, setZyklus] = React.useState<ZyklusWahl>(
    (p?.lifecycle_type as ZyklusWahl | null) ?? 'once')
  const [start, setStart] = React.useState(
    p?.start_date ?? new Date().toISOString().slice(0, 10))
  const [tage, setTage] = React.useState(String(p?.days_count ?? k.tage ?? 7))
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)

  React.useEffect(() => {
    const auf = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', auf)
    return () => window.removeEventListener('keydown', auf)
  }, [onClose])

  if (!p) return null

  async function speichern() {
    setLaeuft(true)
    setFehler(null)
    try {
      const a = await fetch('/api/nutrition/plan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          art: 'plan_aendern',
          id: p!.id,
          lifecycle_type: zyklus,
          start_date: start,
          days_count: Number(tage),
          status: 'active',
        }),
      })
      const antwort = await a.json()
      if (!a.ok) throw new Error(antwort?.error ?? 'Aktivieren fehlgeschlagen.')
      onGespeichert()
      onClose()
    } catch (e) {
      setFehler(e instanceof Error ? e.message : String(e))
    } finally {
      setLaeuft(false)
    }
  }

  return (
    <div className="v2-modal-veil" onClick={onClose} role="presentation">
      <div className="v2-modal" role="dialog" aria-modal="true"
           aria-label="Plan aktivieren"
           onClick={e => e.stopPropagation()}>
        <div className="v2-modal-h">
          <Icon name="calendar" className="v2-ic v2-ic-sm" />
          <span className="v2-card-title">Plan aktivieren</span>
          <div className="v2-spacer" />
          <button type="button" className="v2-icon-btn" onClick={onClose}
                  aria-label="Schliessen">
            <Icon name="x" className="v2-ic v2-ic-sm" />
          </button>
        </div>

        <div className="v2-modal-body">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{p.name}</div>

          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Startdatum</div>
          <input
            type="date"
            className="v2-feld"
            aria-label="Startdatum"
            value={start}
            onChange={e => setStart(e.target.value)}
            style={{ width: '100%', marginBottom: 12 }}
          />

          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Länge in Tagen</div>
          <input
            type="number"
            className="v2-feld"
            aria-label="Länge in Tagen"
            value={tage}
            min={1}
            max={365}
            onChange={e => setTage(e.target.value)}
            style={{ width: '100%', marginBottom: 12 }}
          />

          {/* ── LifecyclePicker ──────────────────────────────────── */}
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>
            Was am Ende geschieht
          </div>
          <div className="v2-col-gap" style={{ gap: 4 }}>
            {ZYKLUS_WAEHLBAR.map(z => (
              <button
                key={z}
                type="button"
                onClick={() => setZyklus(z)}
                aria-pressed={zyklus === z}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                  padding: '8px 10px', borderRadius: 6, cursor: 'pointer',
                  textAlign: 'left', width: '100%',
                  background: zyklus === z ? 'var(--bg-elev)' : 'var(--surface)',
                  border: `1px solid ${zyklus === z ? 'var(--acc-nutri)' : 'var(--border)'}`,
                  color: 'inherit',
                }}
              >
                <Icon
                  name={zyklus === z ? 'check' : 'chevron_right'}
                  className="v2-ic v2-ic-sm"
                  style={{ marginTop: 1, flexShrink: 0 }}
                />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{ZYKLUS_TEXT[z]}</span>
                  <span className="v2-dim" style={{
                    display: 'block', fontSize: 10.5, lineHeight: 1.45, marginTop: 2,
                  }}>
                    {ZYKLUS_ERKLAERUNG[z]}
                  </span>
                </span>
              </button>
            ))}
          </div>

          {fehler && (
            <div className="v2-insight v2-neg" style={{ marginTop: 10 }}>
              <div className="v2-insight-mark" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="v2-insight-body">{fehler}</div>
              </div>
            </div>
          )}
        </div>

        <div className="v2-modal-f">
          <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>
            Abbrechen
          </button>
          <button type="button" className="v2-btn v2-btn-primary"
                  disabled={laeuft} onClick={() => void speichern()}>
            <Icon name="check" className="v2-ic v2-ic-sm" />
            {laeuft ? 'Speichert…' : 'Aktivieren'}
          </button>
        </div>
      </div>
    </div>
  )
}
