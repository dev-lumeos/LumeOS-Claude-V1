'use client'

// Die angebundene Fassung von „Phase engine" (G-87).
//
// `[cmd]` **Was die Tabelle traegt** (`goals.goal_phases`, 14 Spalten):
// `phase_type`, `variant`, `parameters` (jsonb), `gueltig_ab`,
// `projected_end_date`, `actual_end_date`, `transitioned_from`,
// `recommended_next`, `transition_reason` — dazu `goal_id`.
//
// **Der Leseweg lag schon da:** `goals.phase_am(user, stichtag)` waehlt
// die zum Stichtag geltende Phase, und `ladePhase` in
// `lib/goals/lesen.ts` reicht sie seit GO-16 bis in diese Ansicht.
// **Der Tab hat sie bloss nicht benutzt.**
//
// `[cmd]` **Was das Mockup darueber hinaus zeigt** — und was deshalb
// Attrappe bleibt (in `tab-phase.tsx`):
//   „week 9 of 20", „adherence 94%", „on track"
//   „Weight trend −0.18 kg/wk", „Strength +4.2%", „Body fat −0.12 %/wk"
//   „Weekly auto-adjustment" mit `confidence 0.88`
//   „Suggested transition in 4 weeks" mit Begruendungstext
//   sieben Phasentypen mit Varianten, Guards, Exits, Erfolgsmassen
//   „Expert BB annual", der 12-Monats-Zyklus
//
// **Keine dieser Zahlen hat eine Spalte.** `[cmd]` `goal_phases`
// fuehrt weder Woche noch Adhaerenz noch Trend noch Konfidenz.
//
// `[read]` **Und die Regel aus C-119 gilt hier:** *„Wenn ein Wert
// gerechnet wird und daneben gespeichert steht, muss klar sein, welcher
// gilt."* Die Woche und die Restdauer **werden hier gerechnet** — aus
// `gueltig_ab` und `projected_end_date` gegen den Stichtag. Gespeichert
// ist keine von beiden. Das steht an der Kachel, damit niemand die
// gerechnete Woche fuer eine gespeicherte haelt.
import * as React from 'react'
import { Card, Pill, Row } from '@lumeos/ui'

import type { Phase } from '../../../lib/goals/lesen'

/** Tage zwischen zwei ISO-Tagen, ohne Zeitzonenfalle. */
function tageZwischen(vonISO: string, bisISO: string): number | null {
  const von = Date.parse(`${vonISO}T12:00:00Z`)
  const bis = Date.parse(`${bisISO}T12:00:00Z`)
  if (!Number.isFinite(von) || !Number.isFinite(bis)) return null
  return Math.round((bis - von) / 86_400_000)
}

/**
 * Was sich aus den Spalten rechnen laesst — und nur das.
 *
 * `[read]` **Gerechnet, nicht gespeichert.** Die Tabelle fuehrt zwei
 * Daten; alles Weitere hier ist deren Differenz zum Stichtag.
 */
export function phasenLauf(p: Phase, stichtag: string) {
  const start = p.gueltig_ab
  const ende = p.actual_end_date ?? p.projected_end_date
  const tageBisher = start ? tageZwischen(start, stichtag) : null
  const tageGesamt = start && ende ? tageZwischen(start, ende) : null

  return {
    tageBisher,
    tageGesamt,
    /** Woche 1 ist die erste — Tag 0 bis 6. */
    woche: tageBisher != null && tageBisher >= 0
      ? Math.floor(tageBisher / 7) + 1 : null,
    wochenGesamt: tageGesamt != null && tageGesamt > 0
      ? Math.ceil(tageGesamt / 7) : null,
    tageRest: tageGesamt != null && tageBisher != null
      ? tageGesamt - tageBisher : null,
    /** Ob die Phase am Stichtag bereits abgeschlossen ist. */
    beendet: Boolean(p.actual_end_date),
  }
}

/** `lean_bulk` -> „lean bulk". Die Tabelle fuehrt Text, keinen Enum. */
function lesbar(s: string | null): string {
  return s ? s.replace(/_/g, ' ') : '—'
}

/**
 * Die Werte aus `parameters` (jsonb) als Zeilen.
 *
 * `[cmd]` Gemessen liegen dort heute vier Schluessel: `source`,
 * `reason`, `note` und `calorie_surplus_kcal`. **Das Feld ist frei** —
 * deshalb wird nicht auf bekannte Namen geprueft, sondern gezeigt, was
 * drinsteht. Ein unbekannter Schluessel verschwaende sonst lautlos.
 */
function parameterZeilen(parameters: Record<string, unknown>): Array<[string, string]> {
  return Object.entries(parameters)
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => [
      k.replace(/_/g, ' ').replace(/^./, s => s.toUpperCase()),
      typeof v === 'object' ? JSON.stringify(v) : String(v),
    ])
}

export function PhaseEcht({ phase, stichtag }: { phase: Phase; stichtag: string }) {
  const lauf = React.useMemo(() => phasenLauf(phase, stichtag), [phase, stichtag])
  const params = React.useMemo(
    () => parameterZeilen(phase.parameters), [phase.parameters])

  return (
    <div className="v2-grid-15">
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card>
          <div className="v2-goals-phase-kopf">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                marginBottom: 4, flexWrap: 'wrap',
              }}>
                <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.015em' }}>
                  {lesbar(phase.phase_type)}
                </span>
                {phase.variant && <Pill>{lesbar(phase.variant)}</Pill>}
                {/* `[read]` **Kein „on track".** Das waere eine
                    Bewertung des Verlaufs, und die Tabelle fuehrt
                    nichts, woraus sie folgen wuerde. Stattdessen steht
                    da, ob die Phase laeuft oder beendet ist — eine
                    Tatsache aus `actual_end_date`. */}
                <Pill variant={lauf.beendet ? undefined : 'acc'}>
                  {lauf.beendet ? 'abgeschlossen' : 'laufend'}
                </Pill>
              </div>
              {/* `[cmd]` **„Woche 12 von 7" stand hier zuerst** — beide
                  Zahlen richtig (77 Tage gelaufen, 44 geplant), die
                  Fuegung falsch. Ueber das geplante Ende hinaus gibt es
                  kein „von": die Phase laeuft laenger als vorgesehen,
                  und genau das sagt der Satz jetzt. */}
              <div className="v2-muted" style={{ fontSize: 11.5 }}>
                {phase.gueltig_ab
                  ? `Seit ${phase.gueltig_ab}`
                  : 'Ohne Startdatum'}
                {lauf.woche != null && ` · Woche ${lauf.woche}`}
                {lauf.wochenGesamt != null && lauf.tageRest != null && (
                  lauf.tageRest >= 0
                    ? ` von ${lauf.wochenGesamt}`
                    : ` · ${Math.abs(lauf.tageRest)} Tage über das geplante Ende`
                )}
              </div>
            </div>
          </div>

          {/* `[cmd]` **Nicht `v2-g-cols-4`.** Die Klasse steht fest auf
              vier Spalten (`v2.css:472`) — bei 375 px sind die Zellen
              dann rund 70 px breit, und `2026-06-04` bricht mitten im
              Datum um. `auto-fit` mit 92 px Mindestbreite legt sie
              stattdessen um. **`packages/ui` bleibt unangetastet** —
              dort arbeitet ein anderer Agent. */}
          <div className="v2-grid" style={{
            gap: 8,
            gridTemplateColumns: 'repeat(auto-fit, minmax(92px, 1fr))',
          }}>
            {([
              ['Start', phase.gueltig_ab ?? '—'],
              ['Geplantes Ende', phase.projected_end_date ?? '—'],
              ['Tage bisher', lauf.tageBisher != null ? String(lauf.tageBisher) : '—'],
              // `[read]` Negative „Tage uebrig" sind keine uebrigen Tage.
              // Die Zahl bleibt dieselbe, die Beschriftung wechselt mit
              // dem Vorzeichen — sonst liest man −33 als Restdauer.
              lauf.tageRest != null && lauf.tageRest < 0
                ? ['Tage überzogen', String(Math.abs(lauf.tageRest))]
                : ['Tage übrig', lauf.tageRest != null ? String(lauf.tageRest) : '—'],
            ] as Array<[string, string]>).map(([l, v]) => (
              <Card key={l} className="v2-card-tight" style={{ padding: 10 }}>
                <div className="v2-eyebrow">{l}</div>
                <div className="v2-num" style={{ fontSize: 15 }}>{v}</div>
              </Card>
            ))}
          </div>

          {/* `[read]` **Die Regel aus C-119, sichtbar gemacht.**
              `progress_pct` war der Fall, in dem gerechnet und
              gespeichert nebeneinanderstanden, ohne dass klar war,
              welcher gilt. Hier ist nur eines von beidem da — und die
              Zeile sagt, welches. */}
          <div className="v2-divider" />
          <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.55 }}>
            Woche und Tage sind aus Start und geplantem Ende gegen den
            Stichtag {stichtag} <strong>gerechnet</strong>, nicht
            gespeichert — <span className="v2-mono">goal_phases</span> führt
            weder Woche noch Fortschritt.
          </div>
        </Card>

        <Card title="Phasenwechsel" sub="was die Tabelle über Herkunft und Weg sagt">
          <Row label="Kam aus" value={lesbar(phase.transitioned_from)} />
          <Row label="Empfohlen als Nächstes" value={lesbar(phase.recommended_next)} />
          {/* `transition_reason` ist Freitext aus der Zeile — er wird
              gezeigt, nicht ausgewertet. */}
          {phase.transition_reason && (
            <>
              <div className="v2-divider" />
              <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Begründung</div>
              <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
                {phase.transition_reason}
              </div>
            </>
          )}
          <div className="v2-divider" />
          <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.55 }}>
            <span className="v2-mono">recommended_next</span> ist ein
            gespeicherter Text, keine Ableitung aus dem Verlauf. Der
            Entwurf zeigt daneben einen Zeitpunkt („in 4 Wochen&quot;) und
            eine Konfidenz — beides hat keine Spalte.
          </div>
        </Card>
      </div>

      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="Phase parameters" sub={lesbar(phase.phase_type)}>
          {params.length > 0
            ? params.map(([k, v]) => <Row key={k} label={k} value={v} />)
            : (
              <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
                Für diese Phase ist kein Parameter hinterlegt.
              </div>
            )}
          <div className="v2-divider" />
          <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.55 }}>
            Aus <span className="v2-mono">parameters</span>, einem freien
            JSON-Feld — gezeigt wird, was drinsteht. Der Entwurf führt
            hier feste Felder je Phasenart (Defizit, Rate, Protein,
            Höchstdauer); die Tabelle kennt sie nicht.
          </div>
        </Card>

        <Card title="Zeile" sub="woher diese Phase kommt">
          <Row label="Phase-ID" value={phase.phase_id.slice(0, 8)} />
          <Row label="Ziel verknüpft" value={phase.goal_id ? 'ja' : 'nein'} />
          <Row label="Gültig ab" value={phase.gueltig_ab ?? '—'} />
          <Row label="Geplantes Ende" value={phase.projected_end_date ?? '—'} />
          <Row label="Tatsächliches Ende" value={phase.actual_end_date ?? '—'} />
          <div className="v2-divider" />
          <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.55 }}>
            <span className="v2-mono">phase_am()</span> wählt die Zeile,
            deren <span className="v2-mono">gueltig_ab</span> am Stichtag
            erreicht und deren Ende noch nicht überschritten ist.
          </div>
        </Card>
      </div>
    </div>
  )
}
