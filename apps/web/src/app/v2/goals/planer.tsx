'use client'

// G-615 — der Planer im Reiter Phase engine.
//
// **Tom, 2026-10-07:** *„reiter phase engine ist doch genau der planner"*.
// `[read]` **Einstieg ist ein Termin** (Wettkampf oder Zieldatum); die
// Phasen werden vom Termin RUECKWAERTS gelegt (`planvorschau`). Plaene
// sind die Zeilen mit `auswahl_gruppe = 'plan'`, gesperrt nach
// `min_erfahrung` — **dieselbe Regel wie im Anlegemodal (G-610)**.
//
// `[read]` **Angelegt wird ueber denselben Weg wie im Reiter Goals**
// (`phasenzielAnlegenAktion`): Ziel mit Termin und Phase mit Strategie in
// einem Schritt. Die Stufenwochen sind danach der Vorschlag aus dem
// Verhaeltnis — aenderbar im Editor an der Zielzeile (G-608).
import * as React from 'react'
import { Card, Icon } from '@lumeos/ui'

import { gesperrt, planStrategien } from '../../../lib/goals/zielwahl'
import { planvorschau } from '../../../lib/goals/planer'
import { phasenartFuerStrategie } from '../../../lib/goals/strategie-regeln'
import { unterartFuer } from '../../../lib/goals/ziel-arten'
import { type Phasenart } from '../../../lib/goals/phase-regeln'
import type { Strategie } from '../../../lib/goals/strategie-read'
import type { ZielFortschritt } from '../../../lib/goals/lesen'
import { phasenzielAnlegenAktion } from './ziel-aktionen'
import { StrategieVorschau } from './strategie-vorschau'

const feld: React.CSSProperties = {
  width: '100%', height: 30, background: 'var(--surface)', color: 'var(--fg)',
  border: '1px solid var(--border)', borderRadius: 6, padding: '0 10px', fontSize: 12,
}

export function Planer({ strategien, erfahrung, ziele, heute }: {
  strategien: Strategie[]
  erfahrung: string | null
  ziele: ZielFortschritt[]
  heute: string
}) {
  const plaene = planStrategien(strategien)
  const [code, setCode] = React.useState<string | null>(null)
  const [termin, setTermin] = React.useState('')
  const [titel, setTitel] = React.useState('')
  const [details, setDetails] = React.useState(false)
  const [laeuft, setLaeuft] = React.useState(false)
  const [meldung, setMeldung] = React.useState<{ ok: boolean; text: string } | null>(null)

  const plan = plaene.find(p => p.code === code) ?? null
  const vorschau = plan && termin ? planvorschau(plan, termin, heute) : null
  const phasenart = plan ? phasenartFuerStrategie(plan.code, plan.category) as Phasenart | null : null
  // `[cmd]` **G-618: kein Platz 1–3 mehr** — der Index ist live weg
  // (2026-10-09). Drei aktive Messziele sperrten hier den Plan.
  const platz = 1

  async function anlegen() {
    if (!plan || !phasenart || !vorschau?.ok) return
    setLaeuft(true)
    setMeldung(null)
    const r = await phasenzielAnlegenAktion({
      ziel: {
        goal_type: 'body_composition',
        subtype: unterartFuer('body_comp', plan.category),
        title: titel.trim() || plan.label,
        gueltig_ab: heute,
        priority: platz,
        target_date: termin,
      },
      phase: { phase_type: phasenart, strategie_code: plan.code, zielrate_pct_kg_woche: plan.weight_change_target_percent },
    })
    setLaeuft(false)
    setMeldung(r.ok
      ? { ok: true, text: `${plan.label} angelegt — die Stufen stehen in der Zeitachse.` }
      : { ok: false, text: r.fehler })
  }

  return (
    <Card title="Plan vom Termin aus" sub="Termin setzen · Phasen rückwärts · legt Ziel und Plan an">
      <div data-planer className="v2-col-gap" style={{ gap: 10 }}>
        <div className="v2-dim" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
          Ein Plan hat mehrere Phasen. Sie werden vom Termin aus rückwärts gelegt —
          Einzelstrategien wählst du beim Anlegen eines Ziels im Reiter Goals.
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {plaene.map(p => {
            const zu = gesperrt(p, erfahrung)
            const an = code === p.code
            return (
              <button key={p.code} type="button" data-plan={p.code} disabled={zu}
                      aria-pressed={an} onClick={() => { setCode(an ? null : p.code); setMeldung(null) }}
                      className="v2-btn v2-btn-sm"
                      style={{
                        opacity: zu ? 0.55 : 1, cursor: zu ? 'not-allowed' : 'pointer',
                        background: an ? 'color-mix(in oklch, var(--acc-goals) 14%, var(--surface))' : undefined,
                      }}>
                {p.label}
                {zu && <span data-plan-sperre style={{ marginLeft: 6, fontSize: 10.5 }}>ab {p.min_erfahrung}</span>}
              </button>
            )
          })}
        </div>

        {plan && (
          <>
            <div className="v2-dim" style={{ fontSize: 10.5 }}>
              {plan.description}{' '}
              <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm" data-planer-details
                      onClick={() => setDetails(true)}>
                <Icon name="search" className="v2-ic v2-ic-sm" /> Details
              </button>
            </div>
            <div className="v2-grid v2-g-cols-2" style={{ gap: 10 }}>
              <label>
                <span className="v2-eyebrow">Termin · Wettkampf oder Zieldatum</span>
                <input type="date" data-planer-termin value={termin} min={heute}
                       onChange={e => setTermin(e.target.value)} style={{ ...feld, marginTop: 4 }} />
              </label>
              <label>
                <span className="v2-eyebrow">Titel</span>
                <input data-planer-titel value={titel} placeholder={plan.label}
                       onChange={e => setTitel(e.target.value)} style={{ ...feld, marginTop: 4 }} />
              </label>
            </div>
          </>
        )}

        {/* ══ Die Vorschau: Stage / Weeks out / Deficit / Cardio ═════ */}
        {vorschau && !vorschau.ok && (
          <div className="v2-dim" data-planer-grund style={{ fontSize: 11 }}>{vorschau.grund}</div>
        )}
        {vorschau?.ok && (
          <div>
            <table className="v2-tbl" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Stufe</th><th style={{ textAlign: 'right' }}>Wochen</th>
                  <th style={{ textAlign: 'right' }}>Beginn</th><th style={{ textAlign: 'right' }}>Weeks out</th>
                  <th style={{ textAlign: 'right' }}>Defizit</th><th>Cardio</th>
                </tr>
              </thead>
              <tbody>
                {vorschau.stufen.map(st => (
                  <tr key={st.name} data-planer-stufe={st.name}>
                    <td>{st.name}</td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>{st.wochen}</td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>{st.beginn}</td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>{st.wochenVorher}</td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>
                      {st.defizitPct === null ? '—' : `${st.defizitPct} %`}
                    </td>
                    <td className="v2-dim" style={{ fontSize: 10.5 }}>{st.cardio ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 6 }}>
              {vorschau.summe} Wochen bis {vorschau.ende}.
              {vorschau.verschoben && (
                <span data-planer-verschoben style={{ color: 'var(--warn)' }}>
                  {' '}Ab heute reicht die Zeit nicht bis zum Termin — der Plan beginnt heute,
                  das Ende verschiebt sich auf {vorschau.ende}.
                </span>
              )}
            </div>
          </div>
        )}

        {plan && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button type="button" className="v2-btn v2-btn-primary v2-btn-sm" data-planer-anlegen
                    disabled={laeuft || !vorschau?.ok || !phasenart}
                    onClick={() => { void anlegen() }}>
              <Icon name="check" className="v2-ic v2-ic-sm" /> {laeuft ? 'Legt an …' : 'Plan anlegen'}
            </button>
          </div>
        )}
        {meldung && (
          <div data-planer-fertig={meldung.ok ? '' : undefined}
               data-planer-fehler={meldung.ok ? undefined : ''}
               style={{ fontSize: 11.5, color: meldung.ok ? 'var(--pos)' : 'var(--neg)' }}>
            {meldung.text}
          </div>
        )}
      </div>
      {details && plan && <StrategieVorschau s={plan} onSchliessen={() => setDetails(false)} />}
    </Card>
  )
}
