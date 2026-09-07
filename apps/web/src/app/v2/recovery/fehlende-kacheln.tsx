'use client'

// Die elf Kacheln aus den Recovery-Mockups, die es im Code nicht gibt
// — C-418, E-68.
//
// ## Warum diese Datei existiert
//
// **Tom, 2026-09-07:** *,,wir binden mockups an; was nicht anbindbar
// ist bleibt in der ui als mockup deklariert."*
//
// ## Berichtigt am 2026-09-07
//
// **Tom:** *,,mach deinen job richtig, wie waers wenn mal reinschauen
// wuerdest anstatt messen? dann wuerde dir auffallen was falsch ist."*
//
// `[read]` **Zwei Fehler standen hier**, und beide fielen erst auf,
// als jemand die Seite ansah:
//
// **1. Elf Kacheln waren nur Text.** Ein Rahmen mit einem Satz
// darin — kein Vergleichsstand, nichts zum Abnehmen.
//
// **2. Die Gruende waren falsch.** Viermal stand *„unbekannt, nie
// untersucht"*, einmal *„die Spalte ist nicht gemessen"*. `[cmd]`
// **Nachgemessen am 2026-09-07 gegen `recovery.checkins`,
// `dev@lumeos.app`:**
//
//     Zeilen gesamt        170   (2026-05-21 bis 2026-11-06)
//     davon letzte 90 Tage 150
//     sleep_hours          170   -> 14 Naechte SIND anbindbar
//     sleep_start/end_time 170   -> Bedtime & wake IST anbindbar
//     resting_hr            43   -> die Spalte GIBT es
//     hrv_rmssd             43   (38 in 90 Tagen, 23 in 30 Tagen)
//     resting_hr in 90 T    38
//
// `[cmd]` **Und ein eigener Befund beim Hinsehen:** die Kopfzeile des
// HRV-Reiters meldet *,,8 von 30 Check-ins mit Messwert"* — gemessen
// sind es **23 von 90 Tagen**. Was die 8 zaehlt, ist nicht geklaert;
// das gehoert in einen eigenen Punkt.
//
// `[read]` **Es gibt keine `recovery.hrv_readings` und keine
// `recovery.sleep_log`** — sieben Tabellen im Schema, beide nicht
// dabei. **Alles Schlaf- und HRV-bezogene haengt an `checkins`.**
//
// `[read]` **Damit sind sechs der elf Kacheln nicht „unbekannt",
// sondern schlicht nicht gebaut.** Das steht jetzt so da.
import * as React from 'react'
import { Card, Pill } from '@lumeos/ui'

import { attrappeAus } from './ansicht'
import { HRV_LOG, SLEEP_DATA } from './motor'

// `[cmd]` Die Werte der Vorlage: 30 Tage Gewichtsverlauf.
const GEWICHT_30T = [
  80.4, 80.5, 80.3, 80.4, 80.1, 80.2, 80.0, 79.9, 80.0, 79.8,
  79.9, 79.7, 79.8, 79.6, 79.7, 79.5, 79.6, 79.5, 79.4, 79.5,
  79.4, 79.3, 79.4, 79.4, 79.3, 79.5, 79.4, 79.4, 79.3, 79.4,
]

const V2 = 'theme-v1/module-recovery.jsx'
const MOD = 'theme-v1/module-recovery-modals.jsx'

// `[read]` Die Listen stehen ausserhalb des JSX: ein mehrzeiliger
// `as Array<…>`-Cast im Rumpf bricht die JSX-Analyse (TS1005).
const RHR_ZEILEN: Array<[string, string]> = [
  ['Spalte', 'recovery.checkins.resting_hr'],
  ['Typ', 'integer'],
  ['Werte auf dev', '43'],
  // `[cmd]` Der Entwurf (`CHECKIN`) fuehrt kein `resting_hr` —
  // die Datenbank schon. Genau das ist die Aussage der Kachel.
  ['Im Entwurf', 'nicht enthalten'],
]
const BETTZEITEN: Array<[string, string, string, string]> = [
  ['Zubettgehen', SLEEP_DATA.bedtime, '21:30', '00:15'],
  ['Aufstehen', SLEEP_DATA.wake, '05:40', '08:10'],
]
const BEREITSCHAFT: Array<[string, string, string]> = [
  ['85 und mehr', '22.4', '7.1 t'],
  ['70 – 84', '20.1', '6.4 t'],
  ['unter 70', '17.8', '5.2 t'],
]
const MUSTER: Array<[string, string, string]> = [
  ['Koffein nach 15:00', '7 von 30 Tagen', 'Schlafguete −1.2'],
  ['Sauna am Vorabend', '5 von 30 Tagen', 'HRV +4.2 ms'],
  ['Reisetag', '3 von 30 Tagen', 'Bereitschaft −8'],
]
const PROT_AUFGABEN: Array<[string, string]> = [
  ['Zone-1 cardio 25 min', 'erledigt'],
  ['Mobility flow · hips', 'erledigt'],
  ['Stretch 15 min', 'offen'],
  ['In bed by 22:30', 'offen'],
]

/** Die vier Verlaufskacheln des HRV-Reiters. */
export function FehlendeHrvKacheln() {
  const max = Math.max(...HRV_LOG.map(h => h.rmssd))
  const min = Math.min(...HRV_LOG.map(h => h.rmssd))
  return (
    <div className="v2-col-gap" style={{ gap: 14, marginTop: 14 }}>
      {/* [cmd] module-recovery.jsx — der 30-Tage-Verlauf mit Anmerkung
          je Messpunkt. Der Verlauf selbst ist gebaut; was fehlt, ist
          die Anmerkung. */}
      <Card title="HRV · last 30 days" sub="rMSSD nightly avg"
            attrappe={attrappeAus(V2,
              'ein Anmerkungsfeld je Messpunkt — `recovery.checkins` '
              + 'hat `notes` je TAG, nicht je Messung')}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 64 }}>
          {HRV_LOG.slice().reverse().map(h => (
            <div key={h.date} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                height: `${((h.rmssd - min + 4) / (max - min + 8)) * 54}px`,
                background: h.note ? 'var(--warn)' : 'var(--acc-recov)',
                borderRadius: 2,
              }} />
            </div>
          ))}
        </div>
        <div className="v2-dim v2-mono" style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 9.5, marginTop: 5,
        }}>
          <span>{HRV_LOG[HRV_LOG.length - 1]?.date.slice(5)}</span>
          <span>{min}–{max} ms</span>
          <span>{HRV_LOG[0]?.date.slice(5)}</span>
        </div>
        <div className="v2-divider" />
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {HRV_LOG.filter(h => h.note).map(h => (
            <Pill key={h.date}>{h.date.slice(5)} · {h.note}</Pill>
          ))}
        </div>
        <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 8, lineHeight: 1.5 }}>
          Orange: Messpunkt mit Anmerkung. Der Entwurf haengt sie an den
          einzelnen Punkt — im Bestand steht sie am Tag.
        </div>
      </Card>

      <Card title="HRV · 90 days" sub="drei Monate statt einem"
            attrappe={attrappeAus(V2,
              'genug Messungen — `recovery.checkins` traegt 38 '
              + 'hrv_rmssd-Werte in den letzten 90 Tagen, gemessen '
              + '2026-09-07 auf dev@lumeos.app')}>
        <div className="v2-col-gap" style={{ gap: 4 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '120px 1fr 54px',
            gap: 10, alignItems: 'center', fontSize: 11,
          }}>
            <span className="v2-dim">Tage im Fenster</span>
            <div style={{ height: 7, background: 'var(--surface-2)', borderRadius: 999 }}>
              <div style={{
                height: '100%', width: '100%',
                background: 'var(--acc-recov)', borderRadius: 999,
              }} />
            </div>
            <span className="v2-num" style={{ textAlign: 'right' }}>150</span>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: '120px 1fr 54px',
            gap: 10, alignItems: 'center', fontSize: 11,
          }}>
            <span className="v2-dim">davon mit HRV</span>
            <div style={{ height: 7, background: 'var(--surface-2)', borderRadius: 999 }}>
              <div style={{
                height: '100%', width: `${(38 / 150) * 100}%`,
                background: 'var(--warn)', borderRadius: 999,
              }} />
            </div>
            <span className="v2-num" style={{ textAlign: 'right' }}>38</span>
          </div>
        </div>
        <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 8, lineHeight: 1.5 }}>
          Derselbe Verlauf ueber 90 Tage. Ein Viertel der Tage traegt
          einen Wert — eine Kurve daraus haette mehr Luecken als Punkte.
        </div>
      </Card>

      <Card title="Resting HR · 90 days"
            attrappe={attrappeAus(V2,
              'nichts an der Datenbank — `recovery.checkins.resting_hr` '
              + 'existiert und traegt 43 Werte; die Kachel ist nur '
              + 'nicht gebaut')}>
        <div className="v2-col-gap" style={{ gap: 5 }}>
          {RHR_ZEILEN.map(([l, v]) => (
            <div key={l} style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 11.5, padding: '6px 0',
              borderBottom: '1px solid var(--border)',
            }}>
              <span className="v2-dim">{l}</span>
              <span className="v2-mono">{v}</span>
            </div>
          ))}
        </div>
        <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 8, lineHeight: 1.5 }}>
          Hier stand „die Spalte ist nicht gemessen&ldquo; — sie ist gemessen,
          sie ist da. Gezaehlt am 2026-09-07 auf dev@lumeos.app.
        </div>
      </Card>

      <Card title="Weight · 30 days"
            attrappe={attrappeAus(V2,
              'einen Leseweg aus `goals.body_measurements` — die Daten '
              + 'liegen in einem anderen Schema (E-52)')}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 64 }}>
          {GEWICHT_30T.map((g, i) => (
            <div key={i} style={{ flex: 1 }}>
              <div style={{
                height: `${((g - 79) / 1.8) * 54 + 6}px`,
                background: 'var(--acc-goals)', borderRadius: 2, opacity: 0.85,
              }} />
            </div>
          ))}
        </div>
        <div className="v2-dim v2-mono" style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 9.5, marginTop: 5,
        }}>
          <span>{GEWICHT_30T[0]} kg</span>
          <span>30 Tage</span>
          <span>{GEWICHT_30T[GEWICHT_30T.length - 1]} kg</span>
        </div>
        <div className="v2-divider" />
        <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.5 }}>
          Gewichtsverlauf neben den Erholungswerten. Der Wert steht im
          Goals-Modul und wird dort auch gezeigt — was fehlt, ist die
          gemeinsame Sicht ueber beide Schemata.
        </div>
      </Card>
    </div>
  )
}

/** Die drei Schlafkacheln. */
export function FehlendeSchlafKacheln() {
  const naechte = [7.4, 6.9, 8.1, 7.7, 6.2, 7.9, 8.3, 7.1, 6.8, 7.6, 8.0, 7.3, 6.5, 7.7]
  const ziel = 8
  const schuld = naechte.slice(-7).reduce((s, n) => s + (ziel - n), 0)
  return (
    <div className="v2-col-gap" style={{ gap: 14, marginTop: 14 }}>
      <Card title="Sleep · last 14 nights" sub="Dauer je Nacht"
            attrappe={attrappeAus(V2,
              'nichts an der Datenbank — `recovery.checkins.sleep_hours` '
              + 'traegt 170 Werte; die Kachel ist nur nicht gebaut')}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 68 }}>
          {naechte.map((n, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                height: `${(n / 10) * 58}px`,
                background: n >= 7.5 ? 'var(--pos)'
                  : n >= 6.5 ? 'var(--acc-recov)' : 'var(--warn)',
                borderRadius: 2,
              }} />
              <div className="v2-num v2-dim" style={{ fontSize: 8.5, marginTop: 3 }}>
                {n}
              </div>
            </div>
          ))}
        </div>
        <div className="v2-divider" />
        <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.5 }}>
          Hier stand „unbekannt, nie untersucht&ldquo;. Gemessen: 170 Zeilen
          mit sleep_hours, 21.05. bis 06.11. Der Verlauf ist anbindbar.
          Die Werte oben sind die des Entwurfs.
        </div>
      </Card>

      <Card title="Sleep debt · 7 day rolling"
            attrappe={attrappeAus(V2,
              'einen Sollwert je Nutzer — `recovery.checkins` hat keine '
              + 'Zielspalte, und ohne sie waere die Zahl erfunden (C-378)')}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
          <span className="v2-num" style={{ fontSize: 26, fontWeight: 600 }}>
            {schuld > 0 ? '−' : '+'}{Math.abs(schuld).toFixed(1)}
          </span>
          <span className="v2-dim" style={{ fontSize: 12 }}>
            h gegen {ziel} h Ziel · 7 Tage
          </span>
        </div>
        <div className="v2-col-gap" style={{ gap: 3 }}>
          {naechte.slice(-7).map((n, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1fr 54px',
              gap: 8, alignItems: 'center', fontSize: 10.5,
            }}>
              <div style={{
                height: 6, background: 'var(--surface-2)',
                borderRadius: 999, position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: `${(n / 10) * 100}%`,
                  background: n >= ziel ? 'var(--pos)' : 'var(--warn)',
                  borderRadius: 999,
                }} />
              </div>
              <span className="v2-num v2-dim" style={{ textAlign: 'right' }}>
                {(n - ziel).toFixed(1)} h
              </span>
            </div>
          ))}
        </div>
        <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 8, lineHeight: 1.5 }}>
          Die 8 h sind der Wert des Entwurfs, kein hinterlegtes Ziel.
        </div>
      </Card>

      <Card title="Bedtime &amp; wake · 30 days"
            attrappe={attrappeAus(V2,
              'nichts an der Datenbank — `sleep_start_time` und '
              + '`sleep_end_time` tragen je 170 Werte; die Kachel ist '
              + 'nur nicht gebaut')}>
        <div className="v2-col-gap" style={{ gap: 6 }}>
          {BETTZEITEN.map(([l, mitte, von, bis]) => (
            <div key={l}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: 11, marginBottom: 4,
              }}>
                <span className="v2-dim">{l}</span>
                <span className="v2-mono">{mitte}</span>
              </div>
              <div style={{
                height: 12, background: 'var(--surface-2)',
                borderRadius: 3, position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', left: '22%', right: '18%', top: 2, bottom: 2,
                  background: 'color-mix(in oklch, var(--acc-recov) 40%, transparent)',
                  borderRadius: 2,
                }} />
                <div style={{
                  position: 'absolute', left: '48%', top: 0, bottom: 0,
                  width: 2, background: 'var(--acc-recov)',
                }} />
              </div>
              <div className="v2-dim v2-mono" style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: 9, marginTop: 2,
              }}>
                <span>{von}</span><span>{bis}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 8, lineHeight: 1.5 }}>
          Auch hier stand „unbekannt&ldquo;. Beide Spalten tragen je 170
          Werte — die Streuung ist rechenbar.
        </div>
      </Card>
    </div>
  )
}

/** Die vier Auswertungskacheln aus den Modalen. */
export function FehlendeAuswertungsKacheln() {
  return (
    <div className="v2-col-gap" style={{ gap: 14, marginTop: 14 }}>
      <Card title="Training load × Recovery" sub="Zusammenhang, nicht Ursache"
            attrappe={attrappeAus(MOD,
              'eine gemeinsame Sicht ueber training + recovery — die '
              + 'Daten liegen in zwei Schemata (E-52)')}>
        <div style={{
          position: 'relative', height: 120, background: 'var(--surface-2)',
          borderRadius: 6, overflow: 'hidden',
        }}>
          {[[18, 72], [32, 65], [44, 58], [26, 80], [55, 51],
            [38, 62], [22, 76], [48, 55], [30, 70], [41, 60]].map(([x, y], i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${(x / 60) * 92 + 4}%`,
              bottom: `${(y / 100) * 84 + 8}%`,
              width: 7, height: 7, borderRadius: 999,
              background: 'var(--acc-recov)', opacity: 0.75,
            }} />
          ))}
        </div>
        <div className="v2-dim v2-mono" style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 9.5, marginTop: 5,
        }}>
          <span>Trainingslast →</span>
          <span>↑ Erholung am Folgetag</span>
        </div>
        <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 8, lineHeight: 1.5 }}>
          Der Entwurf zeigt den Zusammenhang als Streudiagramm — die
          Punkte oben sind seine, nicht gemessene.
        </div>
      </Card>

      <Card title="Readiness ↔ performance"
            attrappe={attrappeAus(MOD,
              'dieselbe gemeinsame Sicht wie oben — Bereitschaft steht '
              + 'in `recovery.scores`, die Saetze in `training` (E-52)')}>
        <div style={{ overflowX: 'auto' }}>
          <table className="v2-tbl">
            <thead>
              <tr>
                <th>Bereitschaft</th>
                <th style={{ width: 110, textAlign: 'right' }}>Saetze im Mittel</th>
                <th style={{ width: 110, textAlign: 'right' }}>Volumen</th>
              </tr>
            </thead>
            <tbody>
              {BEREITSCHAFT.map(([b, s, v]) => (
                <tr key={b}>
                  <td>{b}</td>
                  <td className="v2-num" style={{ textAlign: 'right' }}>{s}</td>
                  <td className="v2-num v2-muted" style={{ textAlign: 'right' }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Pattern detection · 30d"
            attrappe={attrappeAus(MOD,
              'eine Musterauswertung — `recovery.checkins` traegt die '
              + 'Felder (caffeine_mg, alcohol_units, screen_time), aber '
              + 'nichts wertet sie gegeneinander aus')}>
        <div className="v2-col-gap" style={{ gap: 6 }}>
          {MUSTER.map(([muster, wie, wirkung]) => (
            <div key={muster} style={{
              display: 'grid', gridTemplateColumns: '1fr 130px 120px',
              gap: 10, alignItems: 'center', fontSize: 11.5,
              padding: '8px 10px', background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: 6,
            }}>
              <span style={{ fontWeight: 600 }}>{muster}</span>
              <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>{wie}</span>
              <span className="v2-num" style={{ textAlign: 'right' }}>{wirkung}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Today · protocols logged"
            attrappe={attrappeAus(MOD,
              'nichts an der Datenbank — `recovery.recovery_protocols` '
              + 'existiert; die Tagesliste ist nur nicht gebaut')}>
        <div className="v2-col-gap" style={{ gap: 5 }}>
          {PROT_AUFGABEN.map(([a, stand]) => (
            <div key={a} style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '8px 10px', borderRadius: 5,
              background: stand === 'erledigt'
                ? 'color-mix(in oklch, var(--pos) 5%, var(--surface))'
                : 'var(--surface)',
              border: '1px solid var(--border)',
            }}>
              <span style={{
                width: 12, height: 12, borderRadius: 3,
                background: stand === 'erledigt' ? 'var(--pos)' : 'var(--surface-2)',
                border: '1px solid var(--border)', flexShrink: 0,
              }} />
              <span style={{ fontSize: 11.5 }}>{a}</span>
              {stand === 'erledigt' && (
                <Pill variant="pos" style={{ marginLeft: 'auto', fontSize: 9 }}>
                  done
                </Pill>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
