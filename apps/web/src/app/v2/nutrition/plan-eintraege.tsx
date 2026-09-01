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
// G-315, Vorlage Z. 392: der Mahlzeitname, nicht der Code.
import { MAHLZEIT_LABEL } from '../../../lib/nutrition/plan-model'

/** Ein Eintrag des Tages, mit seinem Zustand aus dem Log. */
export type TagesEintrag = {
  id: string
  meal_type: string
  /** G-315, Vorlage Z. 391: die geplante Uhrzeit, links, 38 px. */
  planned_time?: string | null
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
      // `[cmd]` **G-310: der Titel der Attrappe** (`tab-plans.tsx`
      // Z. 188). Hier stand „Plan-Einträge" — dieselbe Klasse wie
      // `Planumfang`, `Einhaltung` und `Lebenszyklus`: ein erfundener
      // Titel neben einer Attrappe, die einen anderen trägt.
      title="Today's ghost entries"
      // Die Attrappe: „N still open · confirm via MealCam or manually".
      // `[read]` **MealCam bleibt ungenannt** — der Weg existiert
      // nicht (G-276), und ein Hinweis darauf wäre ein Versprechen.
      sub={eintraege.length === 0
        ? `${datum} · kein Eintrag`
        : `${offen} still open · ${datum}`}
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
                // ══ Vorlage Z. 384-388 ══════════════════════
                //
                // `[cmd]` **`padding: 12, borderRadius: 7`**, und der
                // Rahmen traegt die STATUSFARBE: gestrichelt bei
                // `pending`, sonst durchgezogen mit 5 % Hintergrund
                // und 25 % Rand.
                //
                // `[read]` **Vorher stand hier ein einheitliches
                // `var(--border)`** — der Zustand war nur an der
                // Pille zu sehen, nicht an der Zeile.
                style={{
                  padding: 12, borderRadius: 7,
                  background: offen
                    ? 'var(--surface)'
                    : `color-mix(in srgb, ${STATUS_FARBE[e.status]} 5%, var(--surface))`,
                  border: `1px ${offen ? 'dashed' : 'solid'} ${offen
                    ? 'var(--border)'
                    : `color-mix(in srgb, ${STATUS_FARBE[e.status]} 25%, var(--border))`}`,
                }}
              >
                {/* ══ Vorlage Z. 390-394 ════════════════════
                    Zeit (38 px, num dim) · Mahlzeitname (12,5 px,
                    600) · Status-Pille in der Statusfarbe · kcal
                    rechtsbuendig. */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5,
                }}>
                  {/* Z. 391 — `[cmd]` **`planned_time` steht im
                      Schema und ist gefuellt** (07:30, 12:30, 16:00,
                      19:30). **Fehlt sie, bleibt die Spalte leer**,
                      damit die Namen trotzdem fluchten. */}
                  <span className="v2-num v2-dim" style={{ fontSize: 10, width: 38 }}>
                    {e.planned_time ?? ''}
                  </span>
                  {/* Z. 392 — der Mahlzeitname, nicht der `meal_type`. */}
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>
                    {MAHLZEIT_LABEL[e.meal_type] ?? e.meal_type}
                  </span>
                  {/* Z. 393 — die Pille traegt die Statusfarbe auch im
                      Rand, nicht nur im Text. */}
                  <Pill style={{
                    borderColor: `color-mix(in srgb, ${STATUS_FARBE[e.status]} 35%, var(--border))`,
                    color: STATUS_FARBE[e.status],
                    fontSize: 9.5,
                  }}>
                    {STATUS_TEXT[e.status]}
                  </Pill>
                  {e.confirmation_mode && (
                    <Pill style={{ fontSize: 9.5 }}>{e.confirmation_mode}</Pill>
                  )}
                  {/* Z. 394 — kcal rechtsbuendig, ueber `marginLeft`. */}
                  {e.kcal !== null && (
                    <span className="v2-num v2-dim"
                          style={{ marginLeft: 'auto', fontSize: 11 }}>
                      {Math.round(e.kcal)} kcal
                    </span>
                  )}
                </div>

                {/* Z. 396 — die Lebensmittel, 46 px eingerueckt.
                    `[read]` **Die Vorlage verbindet mehrere mit
                    *,, · "***; ein Planeintrag traegt EINEN Namen
                    (ein Rezept oder ein Lebensmittel), **deshalb steht
                    hier einer.** */}
                <div className="v2-muted"
                     style={{ fontSize: 11.5, paddingLeft: 46, lineHeight: 1.5 }}>
                  {e.bezeichnung}
                </div>

                {/* Z. 397 — die Notiz bei Abweichung, mit Pfeil, in
                    `var(--warn)`, mono. */}
                {e.status === 'deviated' && (
                  <div style={{
                    fontSize: 11, paddingLeft: 46, marginTop: 4,
                    color: 'var(--warn)', fontFamily: 'var(--font-mono)',
                  }}>
                    ↳ {abweichungSatz(e.deviation_kcal, e.deviation_pct)}
                  </div>
                )}

                {/* Flow 4: die Knoepfe stehen nur an offenen
                    Eintraegen. `[read]` Ein entschiedener Eintrag
                    laesst sich erneut bestaetigen — der `upsert`
                    traegt es —, aber der haeufige Fall ist der
                    offene, und vier Knoepfe an jeder Zeile waeren
                    Laerm. */}
                {/* ══ Vorlage Z. 398-404: VIER Knoepfe ══════════
                    `Confirm as planned` · `MealCam` · `Log deviation`
                    · `Skip`, **46 px eingerueckt wie die Zeilen
                    darueber** (Z. 399).

                    `[cmd]` **Zwei davon sind gebaut, zwei nicht** —
                    die Gruende stehen unten an ihrer Stelle. */}
                {offen && (
                  <div style={{
                    display: 'flex', gap: 6, marginTop: 8,
                    paddingLeft: 46, flexWrap: 'wrap',
                  }}>
                    {/* Z. 400 — `Confirm as planned`, primaer, mit Haken. */}
                    <button
                      type="button" className="v2-btn v2-btn-primary v2-btn-sm"
                      disabled={busy}
                      onClick={() => void schicken({
                        art: 'bestaetigen', plan_entry_id: e.id,
                        execution_date: datum, confirmation_mode: 'manual',
                      }, e.id)}
                    >
                      <Icon name="check" className="v2-ic v2-ic-sm" />
                      {busy ? 'Speichert…' : 'Confirm as planned'}
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
                    {/* ══ Z. 402: `Log deviation` — NICHT GEBAUT ════
                        `[cmd]` **Der Schreibweg kann es**
                        (`bestaetigen` nimmt `mengen`, und daraus
                        entsteht `deviated` mit `deviation_kcal`).
                        `[cmd]` **Im Tagebuch ist er gebaut** —
                        `ghost-eintrag.tsx` zeigt je Zutat ein
                        Mengenfeld (G-309).

                        `[cmd]` **Was hier fehlt, sind die POSTEN:**
                        `ladeTagesEintraege` liefert `bezeichnung` und
                        `kcal`, **keine Zutatenliste** — am
                        2026-09-02 gemessen.

                        `[read]` **Ohne Posten keine Mengenfelder, und
                        ohne Mengenfelder keine Abweichung**, die man
                        beziffern koennte. **Ein Knopf, der ein leeres
                        Formular oeffnet, waere eine Sackgasse**
                        (G-311).

                        `[read]` **Der Weg dorthin ist derselbe wie in
                        G-311/2:** die Posten aus demselben Verbund
                        mitlesen. **Das ist ein eigener Punkt, kein
                        Nebensatz** — gemeldet, nicht weggelassen. */}
                    {/* Z. 403 — `Skip`. */}
                    <button
                      type="button" className="v2-btn v2-btn-ghost v2-btn-sm" disabled={busy}
                      onClick={() => void schicken({
                        art: 'ueberspringen', plan_entry_id: e.id,
                        execution_date: datum,
                      }, e.id)}
                    >
                      Skip
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
