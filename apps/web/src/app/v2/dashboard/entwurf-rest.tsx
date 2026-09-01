'use client'

// Was vom Dashboard-Entwurf steht, weil es keine Quelle gibt (G-100).
//
// **DIESE DATEI IST DER REST, NICHT DER ENTWURF.** `entwurf.tsx`
// bleibt unveraendert als vollstaendige Vorlage liegen; hier stehen
// nur die Kacheln, die **auch nach G-100 keine Groesse haben** — jede
// mit der Marke und dem Grund an der Kachel selbst.
//
// `[read]` Warum sie nicht einfach verschwinden: Die Marke ist der
// Fortschrittsbalken (Tom, 2026-08-16). Eine geloeschte Kachel sagt
// nichts; eine markierte sagt, woran es haengt.
import * as React from 'react'
import { Card, Ring, Meter, LineChart, Icon, InEntwicklungKnopf } from '@lumeos/ui'

/**
 * Der Readiness-Komposit.
 *
 * `[cmd]` **Die fuenf Anteile des Entwurfs sind nicht dieselben, die
 * `recovery.scores` fuehrt.** Der Entwurf zeigt Recovery · Sleep
 * quality · Soreness · Nutrition · Stress mit gleicher Optik; die
 * Datenbank rechnet mit sieben Anteilen und eigenen Gewichten (G-82),
 * darunter Trainingslast, die im Entwurf fehlt.
 *
 * `[read]` **Zwei Gesamtwerte nebeneinander waeren schlimmer als
 * einer.** Und die Gewichtung des Entwurfs ist nirgends getroffen —
 * sie stuende nur in dieser Datei. Deshalb bleibt die Kachel Attrappe,
 * und der echte Wert steht in der Recovery-Kachel darueber.
 */
const GRUND_READINESS =
  'Ein zweiter Gesamtwert neben `recovery.scores`. Die fuenf Anteile des '
  + 'Entwurfs sind andere als die sieben der Datenbank (G-82), und ihre '
  + 'Gewichtung ist nirgends entschieden. Der gemessene Wert steht oben.'

/**
 * `[cmd]` **„Body battery" gibt es im Schema nicht** — weder als
 * Tabelle noch als Spalte, in keinem der sieben Module. Der Entwurf
 * zeigt eine Kurve gegen eine 14-Tage-Grundlinie; beides waere
 * erfunden.
 */
const GRUND_BATTERY =
  'Es gibt keine Groesse „Body battery" — in keinem der sieben Module. '
  + 'Die Kurve und ihre Grundlinie waeren beide erfunden.'

/**
 * `[cmd]` **Nur die Zuordnung fehlt, nicht die Einheit.** Zeit, Dauer
 * und Ort stehen auf allen 14 geplanten Sitzungen (17:30 · 75 min ·
 * Gym) — sie sind oben in der Training-Kachel angebunden.
 *
 * `[cmd]` **Was fehlt:** „Assigned by Coach Anders · Block 3 · Week 2"
 * — `workout_sessions` fuehrt weder Block noch Woche noch Zuweisung
 * (G-86). Und **`total_sets` und `total_volume_kg` stehen bei geplanten
 * Sitzungen auf 0**; die Spalten gibt es, gefuellt sind sie nur bei
 * absolvierten.
 */
const GRUND_TONIGHT =
  'Block, Woche und die Zuweisung durch einen Coach fehlen in '
  + '`workout_sessions` (G-86); `total_sets` und `total_volume_kg` sind bei '
  + 'geplanten Sitzungen 0. Was belegt ist — Name, Datum, Zeit, Dauer und '
  + 'Ort — steht in der Training-Kachel oben.'

/**
 * Der Tagesverlauf.
 *
 * `[cmd]` **Die Uhrzeiten gibt es**: `meals.meal_time` (725 von 725),
 * `intake_logs.intake_time` (360 von 360),
 * `workout_sessions.started_time` (30 von 30).
 *
 * `[read]` **Was fehlt, ist die Dauer je Ereignis.** Der Entwurf
 * zeichnet Balken mit Laenge — eine Mahlzeit hat keinen Endzeitpunkt,
 * eine Einnahme auch nicht. Eine geratene Balkenlaenge waere eine
 * erfundene Zahl in einer Zeitachse, die praezise aussieht.
 */
const GRUND_FLOW =
  'Die Uhrzeiten liegen vor (meal_time, intake_time, started_time — je '
  + 'vollstaendig), aber nicht die DAUER je Ereignis: eine Mahlzeit und eine '
  + 'Einnahme haben keinen Endzeitpunkt. Der Entwurf zeichnet Balken mit '
  + 'Laenge; sie waere geraten.'

/**
 * Der Aktivitaetsstrom.
 *
 * `[read]` Anders als beim Verlauf ist hier keine Dauer noetig — der
 * Strom braucht nur Zeitpunkt, Modul und einen Satz dazu. **Er waere
 * baubar**, kostet aber sechs Abfragen je Seitenaufruf und eine
 * Mischung nach Zeit. Das ist eine eigene Entscheidung, keine
 * Nebenwirkung dieses Auftrags.
 */
const GRUND_AKTIVITAET =
  'Waere baubar: Zeitpunkte liegen in allen sechs Modulen vor. Es gibt aber '
  + 'keine gemeinsame Ereignistabelle — sechs Abfragen je Seitenaufruf, nach '
  + 'Zeit gemischt. Das ist eine eigene Entscheidung (G-101).'

export function DashboardEntwurfRest() {
  return (
    <div style={{ marginTop: 24 }}>
      <div className="v2-eyebrow" style={{ marginBottom: 10 }}>
        Aus dem Entwurf — noch ohne Quelle
      </div>

      <div className="v2-dash-grid">
        <div className="v2-col-gap" style={{ gap: 16 }}>
          <Card title="Today&apos;s flow" sub="06:30 — 22:00" attrappe={GRUND_FLOW}>
            <p className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
              Der Entwurf zeigt sieben Ereignisse auf einer Zeitachse von
              06:00 bis 22:00, mit einer Marke fuer „jetzt&quot;.
            </p>
          </Card>

          <Card title="Activity" sub="Live" attrappe={GRUND_AKTIVITAET}>
            <p className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
              Der Entwurf zeigt sechs Eintraege aus vier Modulen, nach Zeit
              geordnet.
            </p>
          </Card>
        </div>

        <div className="v2-col-gap" style={{ gap: 16 }}>
          <Card title="Readiness" sub="Composite · 7d trend" attrappe={GRUND_READINESS}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
              <Ring value={84} max={100} color="var(--acc-train)" label="ready" size={92} stroke={7} />
              <div style={{ flex: 1 }}>
                <p className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
                  Die Zahl und die fuenf Anteile stammen aus dem Entwurf.
                </p>
              </div>
            </div>
            <div className="v2-col-gap" style={{ gap: 6 }}>
              {([
                ['Recovery', 82, 'var(--acc-recov)'],
                ['Sleep quality', 84, 'var(--acc-recov)'],
                ['Soreness', 78, 'var(--acc-train)'],
                ['Nutrition', 88, 'var(--acc-nutri)'],
                ['Stress', 71, 'var(--acc-buddy)'],
              ] as Array<[string, number, string]>).map(([k, v, c]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11 }}>
                  <span style={{ width: 88, color: 'var(--fg-muted)' }}>{k}</span>
                  <div style={{ flex: 1 }}><Meter value={v} color={c} /></div>
                  <span className="v2-num" style={{ width: 28, textAlign: 'right' }}>{v}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Body battery" sub="vs. 14-day baseline" attrappe={GRUND_BATTERY}>
            <LineChart
              series={[
                { data: [62, 71, 68, 74, 78, 81, 82], color: 'var(--acc-recov)' },
                { data: [68, 70, 69, 70, 71, 72, 71], color: 'var(--fg-dim)' },
              ]}
              h={110}
              xLabels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
              showArea
              range={[40, 100]}
            />
          </Card>

          <Card
            title="Tonight"
            sub="18:00"
            accent="var(--acc-train)"
            attrappe={GRUND_TONIGHT}
            actions={
              <InEntwicklungKnopf
                titel="Start"
                className="v2-btn v2-btn-accent"
                style={{ height: 22, fontSize: 11, padding: '0 8px' }}
                grund={GRUND_TONIGHT}
              >
                <Icon name="play" className="v2-ic v2-ic-sm" />Start
              </InEntwicklungKnopf>
            }
          >
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
              Push B · Chest, Shoulders, Triceps
            </div>
            <div className="v2-muted" style={{ fontSize: 11 }}>
              Assigned by Coach Anders · Block 3 · Week 2
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
