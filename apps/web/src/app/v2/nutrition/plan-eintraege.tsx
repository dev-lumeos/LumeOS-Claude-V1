'use client'

// ════════════════════════════════════════════════════════════════════
// DIE PLAN-EINTRAEGE EINES TAGES UND IHRE KNOEPFE — G-274
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **112 Plan-Eintraege, 0 Log-Zeilen** — gemessen am
// 2026-08-30. **Die Gestalt stand seit Toms Bildschirmfoto vom
// 28.08.; was fehlte, war der Schreibweg.**
//
// ══ DIE ZEILE IST DER EINTRAG, NICHT DAS LOG ════════════════════════
//
// `[read]` **Der Eintrag ist die Vorlage, das Log die Ausfuehrung.**
// Eine Zeile ohne Log ist `pending` — **nicht abwesend.** Wer nur
// Log-Zeilen zeigte, saehe am ersten Tag gar nichts.
//
// `[cmd]` **Flow 4:** *,,Ghost Entries haben kein automatisches
// Expiry. User entscheidet jederzeit — auch retroaktiv fuer
// vergangene Tage."* **Also kein Ausgrauen alter Tage, nur ein
// Hinweis, auf welchen Tag gebucht wird.**

import * as React from 'react'
import { Card, Icon, Pill } from '@lumeos/ui'

import {
  STATUS_TEXT, STATUS_FARBE, abweichungSatz, istRueckwirkend,
  rueckwirkendSatz, type LogStatus,
} from '../../../lib/nutrition/plan-bestaetigung'

/** Ein Eintrag des Tages, mit seinem Zustand aus dem Log. */
export type TagesEintrag = {
  id: string
  meal_type: string
  bezeichnung: string
  kcal: number | null
  /** `pending`, solange kein Log dazu existiert. */
  status: LogStatus
  confirmation_mode: string | null
  deviation_kcal: number | null
  deviation_pct: number | null
}

export function PlanEintraegeEcht({
  eintraege, datum, onGeaendert,
}: {
  eintraege: readonly TagesEintrag[]
  /** Der Tag, auf den gebucht wird — Flow 4 nennt ihn `execution_date`. */
  datum: string
  onGeaendert: () => void
}) {
  const [laeuft, setLaeuft] = React.useState<string | null>(null)
  const [fehler, setFehler] = React.useState<string | null>(null)

  const heute = new Date().toISOString().slice(0, 10)
  const rueckwirkend = istRueckwirkend(datum, heute)
  const offen = eintraege.filter(e => e.status === 'pending').length

  async function schicken(koerper: Record<string, unknown>, id: string) {
    setLaeuft(id)
    setFehler(null)
    try {
      const a = await fetch('/api/nutrition/plan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(koerper),
      })
      const d = await a.json()
      if (!a.ok) throw new Error(d?.error ?? 'Speichern fehlgeschlagen.')
      onGeaendert()
    } catch (e) {
      setFehler(e instanceof Error ? e.message : String(e))
    } finally {
      setLaeuft(null)
    }
  }

  return (
    <Card
      title="Plan-Einträge"
      sub={eintraege.length === 0
        ? `${datum} · kein Eintrag`
        : `${offen} von ${eintraege.length} offen · ${datum}`}
    >
      {rueckwirkend && eintraege.length > 0 && (
        // Flow 4: „Bestaetigung mit originalem execution_date,
        // confirmed_at = jetzt." `[read]` Der Nutzer soll wissen,
        // wohin gebucht wird — sonst waere die Bilanz eine Ueberraschung.
        <div className="v2-hinweis" style={{ marginBottom: 8 }}>
          {rueckwirkendSatz(datum)}
        </div>
      )}

      {eintraege.length === 0 ? (
        <div className="v2-hinweis">
          Für diesen Tag führt der Plan keine Einträge.
        </div>
      ) : (
        <div className="v2-col-gap" style={{ gap: 6 }}>
          {eintraege.map(e => {
            const busy = laeuft === e.id
            const offen = e.status === 'pending'
            return (
              <div
                key={e.id}
                style={{
                  padding: '7px 10px', borderRadius: 6,
                  background: 'var(--surface)',
                  border: `1px ${offen ? 'dashed' : 'solid'} var(--border)`,
                  opacity: e.status === 'skipped' ? 0.6 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span className="v2-dim v2-mono" style={{ fontSize: 10.5, width: 74 }}>
                    {e.meal_type}
                  </span>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 12 }}>{e.bezeichnung}</span>
                  {e.kcal !== null && (
                    <span className="v2-num v2-dim" style={{ fontSize: 11 }}>
                      {Math.round(e.kcal)} kcal
                    </span>
                  )}
                  <Pill style={{ color: STATUS_FARBE[e.status], fontSize: 9.5 }}>
                    {STATUS_TEXT[e.status]}
                  </Pill>
                  {e.confirmation_mode && (
                    <Pill style={{ fontSize: 9.5 }}>{e.confirmation_mode}</Pill>
                  )}
                </div>

                {e.status === 'deviated' && (
                  <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 3 }}>
                    {abweichungSatz(e.deviation_kcal, e.deviation_pct)}
                  </div>
                )}

                {/* Flow 4: die Knoepfe stehen nur an offenen
                    Eintraegen. `[read]` Ein entschiedener Eintrag
                    laesst sich erneut bestaetigen — der `upsert`
                    traegt es —, aber der haeufige Fall ist der
                    offene, und vier Knoepfe an jeder Zeile waeren
                    Laerm. */}
                {offen && (
                  <div style={{ display: 'flex', gap: 5, marginTop: 6, flexWrap: 'wrap' }}>
                    <button
                      type="button" className="v2-btn v2-btn-sm" disabled={busy}
                      onClick={() => void schicken({
                        art: 'bestaetigen', plan_entry_id: e.id,
                        execution_date: datum, confirmation_mode: 'manual',
                      }, e.id)}
                    >
                      <Icon name="check" className="v2-ic v2-ic-sm" />
                      {busy ? 'Speichert…' : 'Wie geplant'}
                    </button>
                    {/* ══ G-276: der MealCam-Knopf ist entfernt ═══════
                        `[cmd]` **Er schrieb `confirmation_mode:
                        'mealcam'`, ohne dass fotografiert wurde** —
                        eingebaut in G-274, gemeldet in G-276.
                        `[cmd]` **Einen Fotoweg gibt es nirgends:**
                        `MealCamModal` (`modale.tsx:110`) ist eine
                        Attrappe mit drei Schritten und festen
                        Treffern — *„MealCam hat kein Modell"*.
                        `[read]` **Zwei Wege standen zur Wahl:** den
                        Modus auf `manual` setzen oder den Knopf
                        entfernen. **Der Modus waere nicht falsch,
                        aber der Knopf bliebe eine Zusage** — zwei
                        Knoepfe, die dasselbe tun, einer davon mit
                        Kamerasymbol. **Also weg, bis der Fotoweg
                        steht.**
                        `[cmd]` **`ADR_MEALCAM_V1` verlangt ohnehin,
                        dass MealCam nie automatisch schreibt.**
                        `[read]` **`confirmation_mode` bleibt im
                        Schema** — die Spalte ist richtig, nur hatte
                        sie keinen ehrlichen Absender. */}
                    <button
                      type="button" className="v2-btn v2-btn-ghost v2-btn-sm" disabled={busy}
                      onClick={() => void schicken({
                        art: 'ueberspringen', plan_entry_id: e.id,
                        execution_date: datum,
                      }, e.id)}
                    >
                      Auslassen
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {fehler && (
        <div className="v2-hinweis" style={{ marginTop: 8, color: 'var(--neg)' }}>
          {fehler}
        </div>
      )}
    </Card>
  )
}
