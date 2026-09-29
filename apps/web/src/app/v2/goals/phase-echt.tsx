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
          {/* ══ G-534/A3: die ueberzogene Phase ist ein POSTEN ══
              `[cmd]` **Gemessen 2026-09-29: zwei von drei laufenden
              Phasen sind ueber `projected_end_date`, die aelteste um
              73 Tage.**

              `[read]` **Der Reiter nannte das als Tatsache in der
              Kennzahlenreihe** (,,Tage ueberzogen 73"). **Ein
              Planungswerkzeug macht daraus einen offenen Posten mit
              dem Weg daneben.**

              `[read]` **Keine Bewertung des Nutzers** — C-108/F-02
              und E-74. **Es ist eine Aussage ueber die PHASE.** */}
          {lauf.tageRest != null && lauf.tageRest < 0 && !lauf.beendet && (
            <div data-phase-ueberzogen style={{
              marginTop: 12, padding: '10px 12px', borderRadius: 7,
              background: 'color-mix(in oklch, var(--warn) 8%, var(--surface))',
              border: '1px solid color-mix(in oklch, var(--warn) 30%, var(--border))',
            }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 3 }}>
                Diese Phase laeuft {Math.abs(lauf.tageRest)} Tage laenger als geplant.
              </div>
              <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
                Geplantes Ende war {phase.projected_end_date}. Beende sie
                oder verschieb das geplante Ende.
              </div>
            </div>
          )}
        </Card>

        {/* ══ G-534/A1+A7: die Kachel zeigt sich nur, wenn sie etwas
            zu sagen hat ══════════════════════════════════════════
            `[cmd]` **Sie stand mit zwei Strichen da** — ,,Kam aus —"
            und ,,Empfohlen als Naechstes —". `[read]` **Eine
            Kachel, die dreimal nichts sagt, ist kein Posten.**

            `[cmd]` **Und der Untertitel nannte die Tabelle**
            (,,was die Tabelle ueber Herkunft und Weg sagt"). */}
        {(phase.transitioned_from || phase.recommended_next
          || phase.transition_reason) && (
        <Card title="Phasenwechsel" sub="woher diese Phase kommt">
          {phase.transitioned_from && (
            <Row label="Kam aus" value={lesbar(phase.transitioned_from)} />
          )}
          {phase.recommended_next && (
            <Row label="Empfohlen als Nächstes" value={lesbar(phase.recommended_next)} />
          )}
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
        </Card>
        )}
      </div>

      <div className="v2-col-gap" style={{ gap: 14 }}>
        {/* ══ G-534/A2: feste Felder statt JSON-Inhalt ════════════
            `[cmd]` **Hier standen die Schluessel aus `parameters`,
            wie sie drinstanden** — *,,Source GO-07 testdata ·
            Calorie surplus kcal 250"*.

            `[cmd]` **`calorie_surplus_kcal` ist die von E1
            verworfene Groesse**, und der Nutzer las einen
            Datenbankschluessel.

            `[read]` **`PHASE_MODELS.md` fuehrt je Phasenart DREI
            feste Felder:** Rate, Hoechstdauer, Protein. **Die
            Kachel zeigt diese drei** — und wo ein Wert fehlt, einen
            Strich MIT GRUND. */}
        <Card title="Phase parameters" sub={lesbar(phase.phase_type)}>
          <Row label="Zielrate"
               value={phase.zielrate_pct_kg_woche != null
                 ? `${phase.zielrate_pct_kg_woche} % KG/Woche`
                 : '—'} />
          {phase.zielrate_pct_kg_woche == null && (
            <div className="v2-dim" data-grund="rate"
                 style={{ fontSize: 10.5, lineHeight: 1.5, marginTop: -4, marginBottom: 6 }}>
              Diese Phasenart laeuft ohne Zielrate.
            </div>
          )}

          {/* `[cmd]` **Hoechstdauer und Protein haben KEINE
              Quelle** — gemessen 2026-09-29: `phase_rate_rules` hat
              0 Zeilen. `[read]` **Also ein Strich mit genau diesem
              Grund, keine aus der Spec abgetippte Zahl.** */}
          <Row label="Hoechstdauer" value="—" />
          <Row label="Protein" value="—" />
          <div className="v2-dim" data-grund="baender"
               style={{ fontSize: 10.5, lineHeight: 1.5, marginTop: -4 }}>
            Empfohlene Werte je Variante sind noch nicht hinterlegt.
          </div>
        </Card>

        {/* ══ G-534/A1: die Kachel „Zeile" ist RAUS ═══════════════
            `[cmd]` **Sie zeigte `Phase-ID` (die ersten acht Zeichen
            der Datenbankkennung), `Ziel verknuepft ja/nein` und
            drei Daten.**

            `[cmd]` **Start und geplantes Ende stehen schon im Kopf**
            (`:153-154`) — **die Kachel war eine Dublette plus eine
            Kennung, die niemanden ausser uns angeht.**

            `[read]` **Das ist keine Attrappe** (sie las echte
            Daten), **also faellt sie nicht unter E-68.** **Sie war
            eine Entwicklersicht auf dem Nutzerschirm.** */}
      </div>
    </div>
  )
}
