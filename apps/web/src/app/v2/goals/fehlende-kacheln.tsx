'use client'

// Die Mockup-Kacheln, die OBERHALB der Linie noch fehlen — G-365, E-68.
//
// **Tom, 2026-09-07:** *,,definiert ist oben wird alles angezeigt das
// angebunden ist plus attrappen aus dem mockup welche oben noch
// fehlen, und unter dem strich wird das ganze mockup angezeigt."*
//
// `[cmd]` **Anlass: `goals/phase`.** Oben standen vier angebundene
// Kacheln, unten der vollstaendige Mockup-Reiter — **aber die sechs
// Mockup-Kacheln, die oben fehlen, standen nirgends als Attrappe.**
//
// `[read]` **Das ist die halbierte Regel.** Die Linie allein macht
// den Vergleich moeglich; sie macht nicht sichtbar, WAS oben noch
// aussteht. **Eine fehlende Kachel ohne Attrappe sieht aus wie eine
// Kachel, die es nicht geben soll.**
//
// ## Abgrenzung
//
// `[cmd]` **`GoalsPhaseView` (module-goals-pro.jsx:198-490) hat zehn
// Kacheln.** `[cmd]` **`PhaseEcht` baut vier davon:** den Phasenkopf,
// `Phase parameters`, `Phasenwechsel`, `Zeile`.
//
// `[cmd]` **Dieselbe Luecke in zwei weiteren Reitern, gemessen am
// Schirm mit Titelvergleich:**
//
//     goals     fehlen  This week · Cross-module health
//     metrics   fehlen  Body fat trend · Lean mass · 30 days
//     phase     fehlen  4 Kennzahlen · Weekly auto-adjustment ·
//                       Phase state machine · Expert BB annual
//
// **Jede traegt den Grund, warum sie nicht angebunden ist** — E-68.
//
// `[read]` **Nicht gemessen wurde per Dateizaehlung:**
// `tab-koerper.tsx` traegt `metrics` UND `measure`, eine Zaehlung je
// Datei haette beide Reiter gleich gemeldet.
import * as React from 'react'
import { Card, Pill, Icon, LineChart } from '@lumeos/ui'

import {
  PHASE_STATE, GOAL_PHASES, BODY_METRICS,
} from './daten'
import { useGoals } from './kontext'
// `[read]` **Nur der TYP** — `lesen.ts` ist serverseitig, ein
// Wert-Import zoege den Server-Baum ueber die `'use client'`-Grenze
// (die Lehre aus G-412).
import type { Fotosession, Koerpermessung } from '../../../lib/goals/lesen'

const QUELLE = 'theme-v1/module-goals-pro.jsx'


// `[read]` Listen ausserhalb des JSX: ein mehrzeiliger `as Array<…>`
// im Rumpf bricht die JSX-Analyse (TS1005).
const WOCHENBEWEGUNG: Array<[string, string, string]> = [
  ['Bench Press', '+0 kg (next session Mon)', 'neutral'],
  ['Weight', '−0.2 kg', 'gut'],
  ['Body fat', '−0.1 %', 'gut'],
  ['10k pace', '−5 s/km avg (3 runs)', 'gut'],
  ['Meditation', '3 of 5 sessions', 'schlecht'],
]
const MODULGESUNDHEIT: Array<[string, string, number]> = [
  ['Nutrition adherence', '94% · 30d', 94],
  ['Training compliance', '22 / 24 sessions', 92],
  ['Sleep quality avg', '84 / 100', 84],
  ['Recovery avg', '78 / 100', 78],
]
const FFMI_BAENDER: Array<[string, string, boolean]> = [
  ['18–20', 'Developing', false],
  ['20–22', 'Natural trained', false],
  ['22–25', 'Advanced natural', true],
  ['25+', 'Elite / assisted', false],
]

/** E-68: Quelle UND Grund. */
function marke(wartet: string): string {
  return `Attrappe — ${QUELLE} · wartet auf: ${wartet}`
}

/**
 * Die sechs Mockup-Kacheln des Phase-Reiters, die oben fehlen.
 *
 * `[read]` Sie stehen ueber der Linie, weil sie zum Soll-Bestand des
 * Reiters gehoeren — nicht darunter, wo der Vergleich steht.
 */
export function FehlendePhaseKacheln() {
  const p = GOAL_PHASES[PHASE_STATE.current]
  return (
    <>
      {/* [cmd] module-goals-pro.jsx:227-230 — die vier Kennzahlen im
          Phasenkopf. `PhaseEcht` baut den Kopf ohne sie. */}
      <div className="v2-grid v2-g-cols-4" style={{ gap: 8 }}>
        {([
          ['Weight trend', `${PHASE_STATE.weightTrend} kg/wk`,
            'goal_phases fuehrt keinen Gewichtstrend — die Spalte fehlt (G-357)'],
          ['Strength', `+${PHASE_STATE.strengthTrend}%`,
            'Kraftzuwachs je Phase braucht training.sets ueber den Phasenzeitraum'],
          ['Body fat', `${PHASE_STATE.bfTrend} %/wk`,
            'Koerperfett je Woche braucht body_composition_navy im Phasenfenster'],
          ['Adherence', `${PHASE_STATE.adherence}%`,
            'Einhaltung ist nirgends gespeichert — kein Feld, keine Ableitung'],
        ] as Array<[string, string, string]>).map(([l, v, w]) => (
          <Card key={l} className="v2-card-tight" style={{ padding: 10 }}
                attrappe={marke(w)}>
            <div className="v2-eyebrow">{l}</div>
            <div className="v2-num" style={{ fontSize: 15 }}>{v}</div>
          </Card>
        ))}
      </div>

      {/* [cmd] module-goals-pro.jsx:235-259 */}
      <Card title="Weekly auto-adjustment" sub="deterministic rules · no AI"
            attrappe={marke(
              'eine Regelauswertung je Woche — es gibt weder Regeln in der '
              + 'Datenbank noch einen Lauf, der sie anwendet')}>
        <div style={{
          padding: 12, borderRadius: 7,
          background: 'color-mix(in oklch, var(--pos) 6%, var(--surface))',
          border: '1px solid color-mix(in oklch, var(--pos) 25%, var(--border))',
          marginBottom: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Icon name="check" className="v2-ic v2-ic-sm" style={{ color: 'var(--pos)' }} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>No change this week</span>
            <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>
              confidence {Math.round(PHASE_STATE.recommendation.confidence * 100)}%
            </span>
          </div>
          <div className="v2-muted" style={{ fontSize: 12, lineHeight: 1.5 }}>
            {PHASE_STATE.recommendation.reason}
          </div>
        </div>
        <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Active guards</div>
        <div className="v2-col-gap" style={{ gap: 4 }}>
          {(p?.guards ?? [
            'Calorie cycling per training/rest day',
            'Protein floor 2.0 g/kg',
            'Weekly average ≈ maintenance',
          ]).map(g => (
            <div key={g} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 10px', background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: 5,
              fontSize: 11.5, fontFamily: 'var(--font-mono)',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: 999,
                background: 'var(--pos)', flexShrink: 0,
              }} />
              {g}
            </div>
          ))}
        </div>
      </Card>

      {/* [cmd] module-goals-pro.jsx:261-317 — die sieben Phasen zum
          Umschalten. Die Vorschau beim Anklicken ist Teil derselben
          Kachel.

          ══ G-421: DER GRUND WAR UEBERHOLT ═══════════════════════
          `[cmd]` **Hier stand:** *„goal_phases wird gelesen, aber
          nirgends geschrieben (G-357)"*.
          `[cmd]` **Gemessen 2026-09-11 gegen `pg_proc`:** die
          Schreibfunktionen GIBT es — `goals.goal_phase_start(…)`,
          `goal_phase_end(p_phase_id, p_transition_reason, …)` und
          `phase_transition_respond(…)`. **Sie stammen aus
          `_pipeline/11_goals/111_goals_ziele_phasen.sql` und haben
          eine eigene Pruefung** (`goals-g357-…test.ts`).
          `[read]` **G-357 hat den Mangel BEHOBEN** — der Vermerk
          nannte den Punkt, der ihn abgeschafft hat.
          `[cmd]` **Was fehlt, ist der AUFRUF:** kein
          `apps/web`-Pfad ruft eine der drei. */}
      <Card title="Phase state machine"
            sub="7 phases · click any phase to preview or switch"
            attrappe={marke(
              'einen Aufrufer fuer den Phasenwechsel — die Funktionen '
              + '`goals.goal_phase_start/_end` gibt es seit G-357, die '
              + 'Oberflaeche ruft sie nur noch nicht')}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8,
        }}>
          {Object.values(GOAL_PHASES).map(ph => {
            const aktiv = ph.id === PHASE_STATE.current
            const empfohlen = p?.next?.includes(ph.id)
            return (
              <div key={ph.id} style={{
                padding: 10, borderRadius: 7,
                background: aktiv
                  ? `color-mix(in oklch, ${ph.color} 12%, var(--surface))`
                  : 'var(--surface)',
                border: `1px solid ${aktiv
                  ? `color-mix(in oklch, ${ph.color} 40%, var(--border))`
                  : empfohlen ? 'var(--border-strong)' : 'var(--border)'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: 999, background: ph.color,
                  }} />
                  <span style={{ fontSize: 11.5, fontWeight: 600 }}>{ph.name}</span>
                </div>
                {aktiv && <Pill variant="acc" style={{ fontSize: 9 }}>current</Pill>}
                {!aktiv && empfohlen && (
                  <span className="v2-mono" style={{ fontSize: 9.5, color: 'var(--pos)' }}>
                    → recommended next
                  </span>
                )}
                {!aktiv && !empfohlen && (
                  <span className="v2-dim v2-mono" style={{ fontSize: 9.5 }}>switchable</span>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* [cmd] module-goals-pro.jsx:470-489 */}
      <Card title="Expert BB annual" sub="12-month cycle · advanced only"
            attrappe={marke(
              'einen Jahresplan je Nutzer — `goal_phases` traegt eine '
              + 'Phase, keine Zwoelfmonatsfolge')}>
        <div className="v2-col-gap" style={{ gap: 4 }}>
          {(GOAL_PHASES.expert_bb_annual?.annual ?? []).map(a => (
            <div key={a.months} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 10px', background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: 5,
              fontSize: 11.5,
            }}>
              <span className="v2-num v2-dim" style={{ width: 44, fontSize: 10 }}>
                M{a.months}
              </span>
              <span style={{ fontWeight: 500, fontSize: 11 }}>{a.phase}</span>
              <span className="v2-dim" style={{ marginLeft: 'auto', fontSize: 10.5 }}>
                {a.focus}
              </span>
            </div>
          ))}
        </div>
        <div className="v2-divider" />
        <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.5 }}>
          Sichtbar nur fuer Erfahrungsgrad „advanced&ldquo; und hoeher. Er
          steht in `PHASE_STATE`, nicht in der Datenbank.
        </div>
      </Card>
    </>
  )
}

/**
 * Die zwei Mockup-Kacheln des `goals`-Reiters, die oben fehlen.
 *
 * `[cmd]` Gemessen 2026-09-07, Titel gegen Titel: gebaut sind die
 * Zielkarten, `Abgeschlossene Ziele`, `Meilensteine` und
 * `Fortschritt · Herkunft`. **`This week` und `Cross-module health`
 * stehen nur im Mockup.**
 */
export function FehlendeZielKacheln() {
  return (
    <>
      {/* [cmd] module-goals.jsx, GoalsTab — die Wochenbewegung. */}
      <Card title="This week" sub="movement toward all goals"
            attrappe={marke(
              'eine Bewegung je Ziel ueber sieben Tage — `goal_progress_at` '
              + 'haelt Staende, aber keine Wochendifferenz je Ziel')}>
        <div className="v2-col-gap" style={{ gap: 5 }}>
          {WOCHENBEWEGUNG.map(([was, wert, richtung]) => (
            <div key={was} style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', fontSize: 11.5, padding: '7px 0',
              borderBottom: '1px solid var(--border)',
            }}>
              <span>{was}</span>
              <span className="v2-num" style={{
                color: richtung === 'gut' ? 'var(--pos)'
                  : richtung === 'schlecht' ? 'var(--warn)' : 'var(--fg-muted)',
              }}>{wert}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* [cmd] module-goals.jsx, GoalsTab — die Modulgesundheit. */}
      <Card title="Cross-module health"
            sub="how goals are doing in linked modules"
            attrappe={marke(
              'eine gemeinsame Sicht ueber vier Module — Nutrition, '
              + 'Training, Sleep und Recovery liegen in eigenen Schemata (E-52)')}>
        <div className="v2-col-gap" style={{ gap: 7 }}>
          {MODULGESUNDHEIT.map(([modul, wert, pct]) => (
            <div key={modul} style={{
              display: 'grid', gridTemplateColumns: '150px 1fr 92px',
              gap: 10, alignItems: 'center', fontSize: 11,
            }}>
              <span className="v2-dim">{modul}</span>
              <div style={{
                height: 7, background: 'var(--surface-2)',
                borderRadius: 999, overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', width: `${pct}%`,
                  background: pct >= 85 ? 'var(--pos)' : 'var(--acc-goals)',
                  borderRadius: 999,
                }} />
              </div>
              <span className="v2-num" style={{ textAlign: 'right' }}>{wert}</span>
            </div>
          ))}
        </div>
        <div className="v2-divider" />
        <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.45 }}>
          Buddy: All four inputs trend supportive. Body-comp goal pace is
          sustainable if compliance holds.
        </div>
      </Card>
    </>
  )
}

/**
 * `Body fat trend` und `Lean mass · 30 days` — ANGEBUNDEN seit G-421.
 *
 * ══ DER GRUND WAR UEBERHOLT ═══════════════════════════════════════
 *
 * `[cmd]` **Hier stand:** *„wartet auf eine Verlaufsfunktion —
 * `body_composition_navy` liefert einen Wert je Stichtag, keine
 * Reihe"*. **Und in der zweiten Kachel:** *„`lean_mass_kg` liegt im
 * Leseweg — aber nur fuer den Stichtag, nicht als Reihe."*
 *
 * `[cmd]` **Gemessen 2026-09-11:** beide Werte sind SPALTEN auf
 * `goals.body_measurements`, und zwar auf JEDER Zeile —
 *
 *     Zeilen gesamt      362
 *     mit body_fat_pct   362
 *     mit lean_mass_kg   362
 *
 * `[cmd]` **`ladeMessungen()` gibt die ganze Reihe zurueck**, und
 * `KoerperMetriken` zeigt beide bereits als Kennzahlkachel mit
 * Sparkline. **Die Reihe lag die ganze Zeit daneben.**
 *
 * `[read]` **Der Leseweg liegt oft daneben** — und ein Vermerk mit
 * falschem Grund verhindert, dass jemand nachsieht.
 *
 * `[cmd]` **`body_composition_navy` ist eine andere Sache:** das
 * Umfangsverfahren fuer den `comp`-Reiter, nicht die Messreihe.
 */
export function FehlendeMetrikKacheln({ messungen }: {
  messungen: Koerpermessung[]
}) {
  /** Die Reihe eines Feldes, Luecken heraus. */
  const reihe = (feld: 'body_fat_pct' | 'lean_mass_kg') => messungen
    .map(m => m[feld])
    .filter((v): v is number => v != null)

  const fett = reihe('body_fat_pct')
  const mager = reihe('lean_mass_kg')

  /** Erster und letzter Wert, plus Differenz. */
  const spanne = (r: number[]) => r.length >= 2
    ? { erst: r[0], letzt: r[r.length - 1], delta: r[r.length - 1] - r[0] }
    : null

  const fettSpanne = spanne(fett)
  const magerSpanne = spanne(mager)

  /** Die Achsenbeschriftung: erstes, mittleres, letztes Datum. */
  const achsen = (n: number) => {
    if (messungen.length === 0) return []
    const l: string[] = new Array(Math.min(n, messungen.length)).fill('')
    const d = (i: number) => messungen[i]?.measurement_date.slice(5) ?? ''
    l[0] = d(0)
    l[l.length - 1] = d(messungen.length - 1)
    if (l.length > 2) l[Math.floor(l.length / 2)] = d(Math.floor(messungen.length / 2))
    return l
  }

  return (
    <>
      {/* [cmd] module-goals.jsx, MetricsTab */}
      <Card title="Body fat trend"
            sub={`${fett.length} Messungen · aus body_measurements.body_fat_pct`}>
        {fett.length < 2
          ? (
            // `[read]` **Ein benannter Leerhinweis, keine Null** (E-72).
            <div className="v2-muted" style={{ fontSize: 11.5, padding: '14px 0' }}>
              Weniger als zwei Messungen mit Körperfettwert — eine Kurve
              braucht mindestens zwei Punkte.
            </div>
          )
          : (
            <>
              <LineChart h={160}
                range={[Math.min(...fett) - 0.5, Math.max(...fett) + 0.5]}
                xLabels={achsen(7)}
                series={[{ data: fett, color: 'var(--acc-suppl)' }]} />
              <div style={{
                display: 'flex', gap: 16, marginTop: 8,
                fontSize: 11, color: 'var(--fg-muted)',
              }}>
                <span>Current <span className="v2-num" style={{ color: 'var(--fg)' }}>
                  {fettSpanne?.letzt.toFixed(1)} %
                </span></span>
                <span>Delta <span className="v2-num">
                  {fettSpanne && fettSpanne.delta > 0 ? '+' : ''}
                  {fettSpanne?.delta.toFixed(1)} %
                </span></span>
                <span className="v2-dim">
                  über {fett.length} Messungen
                </span>
              </div>
              {/* `[cmd]` **Die Vorlage zeigt eine Ziellinie bei 12,0 %**
                  (`module-goals.jsx`, MetricsTab). `[read]` **Ein
                  Koerperfettziel gibt es in `goals.user_goals` nur als
                  Zielwert EINES Ziels** — welches gemeint ist, steht
                  nirgends. **Deshalb keine erfundene Linie.** */}
            </>
          )}
      </Card>

      {/* [cmd] module-goals.jsx, MetricsTab */}
      <Card title="Lean mass"
            sub={`${mager.length} Messungen · body_measurements.lean_mass_kg`}>
        {mager.length < 2
          ? (
            <div className="v2-muted" style={{ fontSize: 11.5, padding: '14px 0' }}>
              Weniger als zwei Messungen mit Magermasse.
            </div>
          )
          : (
            <>
              <LineChart h={150}
                range={[Math.min(...mager) - 0.5, Math.max(...mager) + 0.5]}
                xLabels={achsen(7)}
                series={[{ data: mager, color: 'var(--acc-train)' }]} />
              <div style={{
                display: 'flex', gap: 16, marginTop: 8,
                fontSize: 11, color: 'var(--fg-muted)',
              }}>
                <span>Current <span className="v2-num" style={{ color: 'var(--fg)' }}>
                  {magerSpanne?.letzt.toFixed(1)} kg
                </span></span>
                <span>Delta <span className="v2-num" style={{
                  color: magerSpanne && magerSpanne.delta >= 0 ? 'var(--pos)' : 'var(--fg)',
                }}>
                  {magerSpanne && magerSpanne.delta > 0 ? '+' : ''}
                  {magerSpanne?.delta.toFixed(1)} kg
                </span></span>
              </div>
              {/* `[cmd]` **Die Vorlage nennt „30 days"** — dieser
                  Titel nicht. `[read]` **Die Kachel zeigt, was
                  `ladeMessungen()` liefert**, und das ist die ganze
                  Reihe bis zum Stichtag. **Ein Titel mit einer
                  Fensterzahl, die niemand einhaelt, waere eine
                  Falschaussage.** */}
            </>
          )}
      </Card>
    </>
  )
}

/**
 * `Photo progression` — ANGEBUNDEN seit G-421.
 *
 * ══ DER VERMERK WAR UEBERHOLT ═════════════════════════════════════
 *
 * `[cmd]` **Hier stand:** *„wartet auf einen Leseweg fuer
 * Fortschrittsfotos — weder Tabelle noch Ablage im Repo, `lesen.ts`
 * kennt kein Foto"*.
 *
 * `[cmd]` **C-463 hat beides gebaut**, gemessen 2026-09-11:
 * `goals.progress_photos` (13 Spalten) und der private Bucket
 * `goals-progress-photos` mit vier Owner-Policies.
 *
 * `[read]` **Ein Vermerk mit falschem Grund ist schlimmer als eine
 * fehlende Kachel** — er verhindert, dass jemand nachsieht.
 *
 * `[read]` **Der Knopf „New session" fehlte ebenfalls** — das
 * `LogPhotoModal` war gebaut, aber NICHTS schickte
 * `{ typ: 'logPhoto' }`. **Eine Attrappe hatte den Auslöser der
 * Vorlage nicht mitkopiert** (`module-goals.jsx:516`).
 */
export function FehlendeMessKacheln({ sessions }: { sessions: Fotosession[] }) {
  const { open } = useGoals()
  return (
    <Card title="Photo progression"
          sub={`${sessions.length} ${sessions.length === 1 ? 'session' : 'sessions'} · front · side · back`}
          actions={(
            <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                    onClick={() => open({ typ: 'logPhoto' })}>
              <Icon name="camera" className="v2-ic v2-ic-sm" />New session
            </button>
          )}>
      {sessions.length === 0
        ? (
          // `[read]` **Ein benannter Leerhinweis, keine Null** (E-72)
          // — die Tabelle ist da und leer, das ist etwas anderes als
          // „gibt es nicht".
          <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
            Noch keine Fotosession. Über „New session“ wird die erste
            angelegt — die Bilder liegen im privaten Ablagefach
            <code> goals-progress-photos</code> und verlassen es nur
            über eine signierte Adresse.
          </div>
        )
        : (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5,
          }}>
            {sessions.map(s => (
              <div key={s.session_date}
                   style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{
                  aspectRatio: '9/16', border: '1px solid var(--border)',
                  borderRadius: 4, background: 'var(--surface-2)',
                  display: 'grid', placeItems: 'center', overflow: 'hidden',
                }}>
                  {/* `[read]` **Das erste Bild der Session** — der
                      Bucket ist privat, die Adresse ist signiert und
                      gilt eine Stunde. */}
                  {s.posen[0]?.url
                    ? <img src={s.posen[0].url} alt={s.posen[0].pose_name}
                           style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (
                      <div className="v2-dim" style={{
                        fontSize: 8.5, textAlign: 'center', lineHeight: 1.4,
                      }}>
                        {s.posen.map(p => p.pose_name.toLowerCase()).join(' · ')}
                      </div>
                    )}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className="v2-num v2-dim" style={{ fontSize: 9.5 }}>
                    {s.session_date.slice(5)}
                  </div>
                  <div className="v2-num" style={{ fontSize: 10.5 }}>
                    {s.posen.length} {s.posen.length === 1 ? 'Pose' : 'Posen'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      {/* `[cmd]` **Gewicht und Koerperfett zeigt die Vorlage je
          Session** (`module-goals.jsx:516-530`). `[read]` **Sie haben
          in `progress_photos` keine Spalte** — sie liegen in
          `body_measurements`, und eine Zuordnung ueber das Datum
          waere eine Behauptung. **Deshalb hier nicht.** */}
      <div className="v2-dim" style={{ fontSize: 10, marginTop: 8 }}>
        Gewicht und Körperfett je Session: <code>progress_photos</code> führt
        sie nicht — sie stehen in <code>body_measurements</code>.
      </div>
    </Card>
  )
}

/**
 * Die Mockup-Kachel des `physique`-Reiters, die oben fehlt.
 *
 * `[cmd]` `13 circumferences` und `Body fat method` sind gebaut
 * (`13 Umfangsstellen`, `Koerperzusammensetzung`). **Die
 * FFMI-Kachel fehlt** — der Wert steht im Composition-Reiter, die
 * Einordnungsbaender stehen nirgends.
 */
export function FehlendePhysiqueKacheln() {
  return (
    <Card title="FFMI" sub="fat-free mass index"
          attrappe={marke(
            'belegte Einordnungsbaender — 18-20 „Developing" bis 25+ '
            + '„Elite / assisted" haben im Repo keine Quelle (GO-21)')}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div className="v2-num" style={{ fontSize: 26, fontWeight: 600 }}>22.4</div>
          <div className="v2-dim" style={{ fontSize: 10 }}>ffmi</div>
        </div>
        <div style={{ flex: 1 }}>
          <Pill variant="acc">advanced</Pill>
          <div className="v2-dim v2-mono" style={{ fontSize: 10, marginTop: 6 }}>
            height-adjusted
          </div>
        </div>
      </div>
      <div className="v2-col-gap" style={{ gap: 3 }}>
        {FFMI_BAENDER.map(([spanne, label, aktiv]) => (
          <div key={spanne} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 10px', borderRadius: 5, fontSize: 11.5,
            background: aktiv
              ? 'color-mix(in oklch, var(--acc-train) 10%, var(--surface))'
              : 'var(--surface)',
            border: `1px solid ${aktiv
              ? 'color-mix(in oklch, var(--acc-train) 30%, var(--border))'
              : 'var(--border)'}`,
          }}>
            <span className="v2-num v2-dim" style={{ width: 52, fontSize: 10 }}>
              {spanne}
            </span>
            <span style={{ flex: 1 }}>{label}</span>
            {aktiv && <Pill variant="acc" style={{ fontSize: 9 }}>du</Pill>}
          </div>
        ))}
      </div>
      <div className="v2-divider" />
      <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.5 }}>
        Der WERT ist angebunden — er steht im Composition-Reiter aus
        `body_composition_navy`. Die Stufen sind es nicht.
      </div>
    </Card>
  )
}
