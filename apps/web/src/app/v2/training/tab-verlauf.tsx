'use client'

// History, Progression, Standards und Kalender — **echte Werte.**
//
// FORM: `theme-v1/module-training.jsx:509-596` (History),
// `module-training-spec.jsx` (Progression, Standards, Calendar).
// INHALT: `training.workout_sessions`, `workout_exercises`,
// `workout_sets` und die Muskelzuordnung des Katalogs.
//
// **GEPLANT GEGEN ABSOLVIERT, eindeutig ausgezeichnet.** `[read]` Tom
// zu G-69: *„Die Auszeichnung muss eindeutig sein — geplant gegen
// absolviert, nicht nur eine blassere Farbe."* Deshalb traegt jede
// kuenftige Sitzung eine Pille `geplant`, nicht nur einen helleren Ton.
//
// `[cmd]` **Zu G-69 taugte der `status` dafuer nicht:** alle 30
// Sitzungen standen auf `completed`, auch die 15 in der Zukunft.
// Massgeblich war das Datum.
//
// `[cmd]` **Das gilt seit G-86 nicht mehr** — gemessen am 2026-08-20:
// 15 `completed`, 14 `planned`, 1 `cancelled`. Der Seed hat sich
// geaendert. **Diese Datei rechnet weiter ueber das Datum**, weil
// `absolviert` daran haengt und beide Wege hier dasselbe Ergebnis
// geben; die Kachel „Diese Woche" (G-86) benutzt den Status, weil sie
// `cancelled` von `planned` unterscheiden muss.
//
// **KEINE BEWERTUNG.** `[read]` Der Auftrag: *„Keine Bewertung, ob
// jemand gut trainiert."* Die Vorlage stuft in `Beginner`, `Novice`,
// `Intermediate`, `Elite` ein — das kommt nicht mit, siehe
// `kraftVerhaeltnis` in `lib/training/auswertung.ts`.
import * as React from 'react'
import { Card, Pill, LineChart, Meter, Row, Sparkline } from '@lumeos/ui'

import type {
  Kennzahlen, Kraftverlauf, MuskelVolumen, Serie, Wochentag,
} from '../../../lib/training/auswertung'
import { kraftVerhaeltnis } from '../../../lib/training/auswertung'
import type { Sitzung } from '../../../lib/training/sitzungen-read'

export type VerlaufDaten = {
  stichtag: string
  sitzungen: Sitzung[]
  kennzahlen: Kennzahlen
  muskelVolumen: MuskelVolumen[]
  kraft: Kraftverlauf[]
  serie: Serie
  gewicht: { weight_kg: number; measurement_date: string } | null
  /** G-86: die sieben Tage um den Stichtag, fuer „This week". */
  woche: Wochentag[]
}

function z(n: number | null | undefined, stellen = 1): string {
  return n == null ? '—' : n.toFixed(stellen)
}

/** Tonnen statt Kilogramm, wie in der Vorlage („7.2 t"). */
function tonnen(kg: number): string {
  return `${(kg / 1000).toFixed(1)} t`
}

/** `[cmd]` Die Pille, die geplant von absolviert trennt. */
function ZustandsPille({ s }: { s: Sitzung }) {
  return s.absolviert
    ? <Pill variant="pos">absolviert</Pill>
    : <Pill variant="warn">geplant</Pill>
}

// ═══ HISTORY ══════════════════════════════════════════════════════

export function TrainingVerlauf({ d }: { d: VerlaufDaten }) {
  const k = d.kennzahlen
  const absolvierte = d.sitzungen.filter(s => s.absolviert)
  const volumenReihe = absolvierte.map(s => s.total_volume_kg ?? 0)

  // Die Summe ueber alle Muskeln ist groesser als das Gesamtvolumen,
  // weil eine Uebung mehreren Gruppen voll zugerechnet wird. Das muss
  // dastehen, sonst sieht die Zahl falsch aus.
  const muskelSumme = d.muskelVolumen.reduce((n, m) => n + m.volumen_kg, 0)
  const maxVol = Math.max(1, ...d.muskelVolumen.map(m => m.volumen_kg))

  return (
    <div className="v2-grid-15">
      <Card
        title="Volumen je Sitzung"
        sub={`${k.sitzungen_absolviert} absolviert · ${k.saetze} Saetze · ${tonnen(k.volumen_kg)} gesamt`}
        className="v2-span-2"
      >
        {volumenReihe.length >= 2 ? (
          <>
            <LineChart
              h={180}
              series={[{ data: volumenReihe, color: 'var(--acc-train)' }]}
              xLabels={absolvierte.map(s => s.session_date.slice(5))}
            />
            <div style={{
              display: 'flex', gap: 24, marginTop: 10, fontSize: 11,
              color: 'var(--fg-muted)', flexWrap: 'wrap',
            }}>
              <div>
                Gesamtvolumen
                <span className="v2-num" style={{ color: 'var(--fg)', fontSize: 14, marginLeft: 4 }}>
                  {tonnen(k.volumen_kg)}
                </span>
              </div>
              <div>
                Je Sitzung
                <span className="v2-num" style={{ color: 'var(--fg)', fontSize: 14, marginLeft: 4 }}>
                  {tonnen(k.volumen_kg / Math.max(1, k.sitzungen_absolviert))}
                </span>
              </div>
              <div>
                Wiederholungen
                <span className="v2-num" style={{ color: 'var(--fg)', fontSize: 14, marginLeft: 4 }}>
                  {k.wiederholungen}
                </span>
              </div>
              {k.dauer_schnitt != null && (
                <div>
                  Dauer im Schnitt
                  <span className="v2-num" style={{ color: 'var(--fg)', fontSize: 14, marginLeft: 4 }}>
                    {k.dauer_schnitt} min
                  </span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="v2-dim" style={{ fontSize: 11.5, padding: '14px 0' }}>
            Noch zu wenige absolvierte Sitzungen fuer eine Kurve.
          </div>
        )}
        {k.sitzungen_geplant > 0 && (
          <>
            <div className="v2-divider" />
            <div className="v2-muted" style={{ fontSize: 11, lineHeight: 1.5 }}>
              {`${k.sitzungen_geplant} weitere Sitzungen liegen nach dem ${d.stichtag} und `}
              {'zaehlen hier nicht mit — sie stehen im Kalender. Leistung, die noch '}
              {'nicht erbracht ist, wird nicht summiert.'}
            </div>
          </>
        )}
      </Card>

      <Card title="Sitzungen" sub={`${d.sitzungen.length} gesamt`}>
        <div className="v2-col-gap">
          {d.sitzungen.slice().reverse().slice(0, 8).map((s, i, arr) => (
            <div key={s.id} style={{
              padding: '10px 0',
              borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 12, fontWeight: 500 }}>{s.name ?? '—'}</span>
                <ZustandsPille s={s} />
                <span className="v2-num v2-dim" style={{ fontSize: 10, marginLeft: 'auto' }}>
                  {s.session_date}
                </span>
              </div>
              <div className="v2-num v2-muted" style={{ fontSize: 11 }}>
                {s.total_volume_kg != null ? tonnen(s.total_volume_kg) : '—'}
                {` · ${s.total_sets ?? 0} Saetze · ${s.duration_minutes ?? '—'} min`}
                {s.location ? ` · ${s.location}` : ''}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card
        title="Volumen je Muskelgruppe"
        sub={`${d.muskelVolumen.length} Gruppen · nur absolvierte Sitzungen`}
        className="v2-span-2"
      >
        {d.muskelVolumen.length === 0 ? (
          <div className="v2-dim" style={{ fontSize: 11.5, padding: '14px 0' }}>
            Keine Zuordnung zwischen den trainierten Uebungen und dem Muskelkatalog.
          </div>
        ) : (
          <>
            <div className="v2-train-vol-tbl">
              <div className="v2-eyebrow">Muskel</div>
              <div className="v2-eyebrow">Verteilung</div>
              <div className="v2-eyebrow" style={{ textAlign: 'right' }}>Saetze</div>
              <div className="v2-eyebrow" style={{ textAlign: 'right' }}>Volumen</div>
              <div className="v2-eyebrow" style={{ textAlign: 'right' }}>Wdh.</div>
              {d.muskelVolumen.map(m => (
                <React.Fragment key={m.muskel}>
                  <div style={{ fontSize: 12 }}>{m.muskel}</div>
                  <div><Meter value={m.volumen_kg} max={maxVol} color="var(--acc-train)" /></div>
                  <div className="v2-num" style={{ textAlign: 'right', fontSize: 12 }}>{m.saetze}</div>
                  <div className="v2-num" style={{ textAlign: 'right', fontSize: 12 }}>
                    {tonnen(m.volumen_kg)}
                  </div>
                  <div className="v2-num" style={{ textAlign: 'right', fontSize: 12 }}>
                    {m.wiederholungen}
                  </div>
                </React.Fragment>
              ))}
            </div>
            <div className="v2-divider" />
            {/* Die Zahl, die sonst falsch aussieht. */}
            <div className="v2-muted" style={{ fontSize: 11, lineHeight: 1.5 }}>
              {`Summe ueber alle Gruppen ${tonnen(muskelSumme)} gegen ${tonnen(k.volumen_kg)} `}
              {'Gesamtvolumen: eine Uebung mit mehreren Primaermuskeln wird jeder '}
              {'Gruppe voll zugerechnet, nicht geteilt. Ein Satz Kniebeugen ist ein '}
              {'Satz fuer jede beteiligte Gruppe, kein halber.'}
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

// ═══ PROGRESSION ══════════════════════════════════════════════════

/**
 * Der Kraftverlauf je Uebung.
 *
 * `[read]` **Hier loest sich der offene Punkt aus G-64.** Dort deckte
 * `e1RM` nur 6 von 1.416 Katalogeintraegen; 1.410 zeigten einen
 * Strich, und der Vorschlag war ein eigener Bereich „meine Uebungen".
 * `[cmd]` Dieser Tab zeigt **nur, was Verlauf hat** — das sind
 * zwangslaeufig die trainierten Uebungen. Ein eigener Bereich waere
 * eine zweite Ansicht derselben sechs.
 */
export function TrainingKraftverlauf({ d }: { d: VerlaufDaten }) {
  const [gewaehlt, setGewaehlt] = React.useState(0)
  const k = d.kraft[gewaehlt]

  if (d.kraft.length === 0) {
    return (
      <Card title="Progression" sub="e1RM je Uebung">
        <div style={{ padding: '24px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
            Noch keine absolvierten Saetze
          </div>
          <div className="v2-dim" style={{ fontSize: 11.5 }}>
            Sobald eine Sitzung stattgefunden hat, steht ihr Kraftverlauf hier.
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="v2-grid-15">
      <Card
        title={k.name}
        sub={`${k.punkte.length} absolvierte Sitzungen · bestes e1RM ${z(k.bestes_e1rm, 1)} kg`}
        className="v2-span-2"
      >
        {k.punkte.length >= 2 ? (
          <>
            <LineChart
              h={180}
              series={[{ data: k.punkte.map(p => p.e1rm), color: 'var(--acc-train)' }]}
              xLabels={k.punkte.map(p => p.datum.slice(5))}
            />
            <div style={{
              display: 'flex', gap: 24, marginTop: 10, fontSize: 11,
              color: 'var(--fg-muted)', flexWrap: 'wrap',
            }}>
              <div>
                Aktuelles e1RM
                <span className="v2-num" style={{ color: 'var(--fg)', fontSize: 14, marginLeft: 4 }}>
                  {z(k.punkte[k.punkte.length - 1].e1rm, 1)} kg
                </span>
              </div>
              <div>
                Aenderung
                <span className="v2-num" style={{ color: 'var(--fg)', fontSize: 14, marginLeft: 4 }}>
                  {k.trend_pct == null
                    ? '—'
                    : `${k.trend_pct > 0 ? '+' : ''}${k.trend_pct} %`}
                </span>
              </div>
              <div>
                Bestes Gewicht
                <span className="v2-num" style={{ color: 'var(--fg)', fontSize: 14, marginLeft: 4 }}>
                  {z(k.max_gewicht_kg, 1)} kg
                </span>
              </div>
              <div>
                Volumen
                <span className="v2-num" style={{ color: 'var(--fg)', fontSize: 14, marginLeft: 4 }}>
                  {tonnen(k.gesamt_volumen_kg)}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="v2-dim" style={{ fontSize: 11.5, padding: '14px 0' }}>
            Nur eine absolvierte Sitzung mit dieser Uebung — fuer eine Kurve
            braucht es zwei.
          </div>
        )}
      </Card>

      <Card title="Uebungen mit Verlauf" sub={`${d.kraft.length} trainiert`}>
        <div className="v2-col-gap" style={{ gap: 4 }}>
          {d.kraft.map((u, i) => (
            <button
              key={u.exercise_id ?? u.name}
              type="button"
              onClick={() => setGewaehlt(i)}
              aria-pressed={i === gewaehlt}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                background: i === gewaehlt ? 'var(--surface-2)' : 'var(--bg-elev)',
                border: `1px solid ${i === gewaehlt ? 'var(--border-strong)' : 'var(--border)'}`,
                borderRadius: 5, cursor: 'pointer', textAlign: 'left', width: '100%',
                color: 'var(--fg)',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{u.name}</div>
                <div className="v2-dim v2-mono" style={{ fontSize: 10 }}>
                  {`${z(u.bestes_e1rm, 1)} kg · ${u.punkte.length} Sitzungen`}
                </div>
              </div>
              {/* `[cmd]` Die feste Breite ist noetig: `Sparkline` gibt
                  ein `<svg>` mit `preserveAspectRatio="none"` und ohne
                  eigene Breite aus. In einem Flexkasten zieht es sich
                  ueber die ganze Zeile und schiebt den Uebungsnamen
                  heraus — im Browser gemessen, der Name stand im DOM
                  und war unsichtbar. */}
              {u.punkte.length >= 2 && (
                <span style={{ width: 60, flexShrink: 0 }}>
                  <Sparkline data={u.punkte.map(p => p.e1rm)} color="var(--acc-train)" h={18} />
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="v2-divider" />
        {/* `[read]` Der G-64-Befund, an seiner Stelle. */}
        <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.45 }}>
          Gezeigt sind die Uebungen mit absolvierten Saetzen. Der Katalog fuehrt
          1.416 — die uebrigen haben keinen Verlauf, weil sie nie trainiert wurden.
        </div>
      </Card>
    </div>
  )
}

// ═══ STANDARDS ════════════════════════════════════════════════════

/**
 * e1RM gegen Koerpergewicht.
 *
 * `[read]` Tom zu G-69: *„Standards braucht das Koerpergewicht mit
 * Stichtag."* Das Gewicht kommt aus `goals.body_measurements` zum
 * Stichtag, nicht aus `profiles.body_weight_kg` — das haette kein
 * Datum, und das Verhaeltnis verschoebe sich rueckwirkend.
 *
 * **OHNE EINSTUFUNG.** `[cmd]` Die Vorlage vergibt `Beginner` bis
 * `Elite` gegen Schwellen, die sie selbst mitbringt. `[read]` Im Repo
 * liegt keine belegte Quelle dafuer — dieselbe Lage wie bei
 * MEV/MAV/MRV, und dieselbe Folge: die Zahl wird gezeigt, die Klasse
 * nicht erfunden.
 */
export function TrainingStandards({ d }: { d: VerlaufDaten }) {
  const bw = d.gewicht?.weight_kg ?? null
  const maxRatio = Math.max(
    1, ...d.kraft.map(k => kraftVerhaeltnis(k.bestes_e1rm, bw) ?? 0))

  return (
    <div className="v2-grid-15">
      <Card
        title="Kraft je Koerpergewicht"
        sub={bw != null
          ? `e1RM ÷ ${z(bw, 2)} kg · Messung vom ${d.gewicht!.measurement_date}`
          : 'ohne Koerpergewicht nicht rechenbar'}
        className="v2-span-2"
      >
        {bw == null ? (
          <div className="v2-muted" style={{ fontSize: 11.5, padding: '14px 0', lineHeight: 1.55 }}>
            {`Es liegt keine Koerpermessung am oder vor dem ${d.stichtag} vor. `}
            Das Verhaeltnis braucht ein Gewicht mit Datum — der Profilwert
            traegt keines und wuerde das Verhaeltnis rueckwirkend verschieben.
          </div>
        ) : (
          <div className="v2-col-gap" style={{ gap: 12 }}>
            {d.kraft.map(k => {
              const ratio = kraftVerhaeltnis(k.bestes_e1rm, bw)
              return (
                <div key={k.exercise_id ?? k.name}>
                  <div style={{
                    display: 'flex', alignItems: 'baseline', gap: 8,
                    marginBottom: 6, flexWrap: 'wrap',
                  }}>
                    <span style={{ fontSize: 12.5, fontWeight: 500, flex: 1, minWidth: 140 }}>
                      {k.name}
                    </span>
                    <span className="v2-num" style={{ fontSize: 13 }}>
                      {z(k.bestes_e1rm, 1)} kg
                    </span>
                    <span className="v2-dim v2-mono" style={{ fontSize: 10.5 }}>
                      {ratio != null ? `${ratio.toFixed(2)}× KG` : '—'}
                    </span>
                  </div>
                  <div style={{
                    position: 'relative', height: 14, background: 'var(--surface-2)',
                    borderRadius: 3, overflow: 'hidden',
                  }}>
                    <div style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0,
                      width: `${Math.min(100, ((ratio ?? 0) / maxRatio) * 100)}%`,
                      background: 'var(--acc-train)', opacity: 0.85,
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <div className="v2-divider" />
        {/* Was hier NICHT steht, und warum. */}
        <div className="v2-muted" style={{ fontSize: 11, lineHeight: 1.5 }}>
          Gezeigt ist das Verhaeltnis, keine Einstufung. Die Vorlage vergibt hier
          <span className="v2-mono"> Beginner</span> bis <span className="v2-mono">Elite</span>
          {' '}gegen Schwellen, fuer die im Repo keine belegte Quelle liegt — eine
          erfundene Klasse waere eine Aussage ueber einen Menschen.
        </div>
      </Card>

      <Card title="Kennzahlen" sub={`Stand ${d.stichtag}`}>
        <Row label="Absolvierte Sitzungen" value={String(d.kennzahlen.sitzungen_absolviert)} />
        <Row label="Geplante Sitzungen" value={String(d.kennzahlen.sitzungen_geplant)} />
        <Row label="Saetze" value={String(d.kennzahlen.saetze)} />
        <Row label="Volumen" value={tonnen(d.kennzahlen.volumen_kg)} />
        <Row label="Wiederholungen" value={String(d.kennzahlen.wiederholungen)} />
        <Row label="Persoenliche Bestwerte" value={String(d.kennzahlen.prs)} />
        <div className="v2-divider" />
        <Row label="Serie" value={`${d.serie.wochen} Wochen`} />
        <Row label="Laengste Serie" value={`${d.serie.laengste} Wochen`} />
      </Card>
    </div>
  )
}

// ═══ SERIE ════════════════════════════════════════════════════════

/**
 * Die Wochenserie.
 *
 * `[read]` Tom zu G-69: *„Streak rechnet nur bis heute — eine Serie,
 * die sich aus geplanten Trainings speist, ist keine Serie."*
 */
export function TrainingSerie({ d }: { d: VerlaufDaten }) {
  const max = Math.max(1, ...d.serie.wochenreihe.map(w => w.sitzungen))
  return (
    <Card
      title="Serie"
      sub={`${d.serie.wochen} Wochen in Folge · laengste ${d.serie.laengste}`}
    >
      <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 60 }}>
        {d.serie.wochenreihe.map(w => (
          <div
            key={w.woche}
            title={`${w.woche}: ${w.sitzungen} Sitzungen`}
            style={{
              flex: 1,
              height: `${Math.max(6, (w.sitzungen / max) * 100)}%`,
              background: w.sitzungen > 0 ? 'var(--acc-train)' : 'var(--surface-2)',
              borderRadius: 2,
              opacity: w.sitzungen > 0 ? 0.85 : 1,
            }}
          />
        ))}
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', marginTop: 6,
        fontSize: 9.5, color: 'var(--fg-dim)', fontFamily: 'var(--font-mono)',
      }}>
        <span>{d.serie.wochenreihe[0]?.woche.slice(5) ?? ''}</span>
        <span>{d.serie.wochenreihe[d.serie.wochenreihe.length - 1]?.woche.slice(5) ?? ''}</span>
      </div>
      <div className="v2-divider" />
      <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.45 }}>
        Gezaehlt werden Kalenderwochen mit mindestens einer absolvierten Sitzung.
        Geplante zaehlen nicht mit.
      </div>
    </Card>
  )
}

// ═══ KALENDER ═════════════════════════════════════════════════════

/**
 * Der Monatskalender.
 *
 * `[read]` Tom zu G-69: *„Kalender und Plan zeigen alle neun."* Hier
 * stehen deshalb **absolvierte und geplante** Sitzungen — mit
 * eindeutiger Auszeichnung, nicht nur einem blasseren Ton.
 */
export function TrainingKalender({ d }: { d: VerlaufDaten }) {
  const [monat, setMonat] = React.useState(() => d.stichtag.slice(0, 7))

  const jeTag = new Map<string, Sitzung[]>()
  for (const s of d.sitzungen) {
    const liste = jeTag.get(s.session_date)
    if (liste) liste.push(s)
    else jeTag.set(s.session_date, [s])
  }

  const monate = Array.from(new Set(d.sitzungen.map(s => s.session_date.slice(0, 7)))).sort()
  const [jahr, mon] = monat.split('-').map(Number)
  const ersterTag = new Date(`${monat}-01T12:00:00`)
  const versatz = (ersterTag.getDay() + 6) % 7
  const tageImMonat = new Date(jahr, mon, 0).getDate()

  const zellen: Array<string | null> = Array<string | null>(versatz).fill(null)
  for (let t = 1; t <= tageImMonat; t += 1) {
    zellen.push(`${monat}-${String(t).padStart(2, '0')}`)
  }
  while (zellen.length % 7) zellen.push(null)

  const imMonat = d.sitzungen.filter(s => s.session_date.startsWith(monat))
  const absolviert = imMonat.filter(s => s.absolviert).length

  return (
    <div className="v2-grid-14">
      <Card
        title={monat}
        sub={`${absolviert} absolviert · ${imMonat.length - absolviert} geplant`}
        actions={
          <select
            className="v2-btn"
            aria-label="Monat"
            value={monat}
            onChange={e => setMonat(e.target.value)}
            style={{ padding: '0 10px' }}
          >
            {monate.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        }
      >
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6,
        }}>
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(t => (
            <div key={t} className="v2-eyebrow" style={{ textAlign: 'center' }}>{t}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {zellen.map((tag, i) => {
            const sitzungen = tag ? jeTag.get(tag) ?? [] : []
            const hatAbsolviert = sitzungen.some(s => s.absolviert)
            const hatGeplant = sitzungen.some(s => !s.absolviert)
            const istHeute = tag === d.stichtag
            return (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={tag ?? `leer-${i}`}
                title={sitzungen.map(s => `${s.name} (${s.absolviert ? 'absolviert' : 'geplant'})`).join(', ')}
                style={{
                  minHeight: 44, borderRadius: 4, padding: 4,
                  border: istHeute ? '1px solid var(--fg)' : '1px solid var(--border)',
                  background: tag ? 'var(--surface)' : 'transparent',
                  opacity: tag ? 1 : 0,
                }}
              >
                {tag && (
                  <>
                    <div className="v2-num v2-dim" style={{ fontSize: 9.5 }}>
                      {Number(tag.slice(8))}
                    </div>
                    {hatAbsolviert && (
                      <div style={{
                        height: 6, borderRadius: 2, marginTop: 3,
                        background: 'var(--acc-train)',
                      }} />
                    )}
                    {/* Geplant: gestrichelt statt gefuellt — der
                        Unterschied ist eine Form, keine Helligkeit. */}
                    {hatGeplant && (
                      <div style={{
                        height: 6, borderRadius: 2, marginTop: 3,
                        border: '1px dashed var(--acc-train)',
                      }} />
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
        <div className="v2-divider" />
        <div style={{
          display: 'flex', gap: 14, fontSize: 10.5,
          color: 'var(--fg-muted)', flexWrap: 'wrap',
        }}>
          <span className="v2-row-gap">
            <span style={{ width: 12, height: 6, borderRadius: 2, background: 'var(--acc-train)' }} />
            absolviert
          </span>
          <span className="v2-row-gap">
            <span style={{
              width: 12, height: 6, borderRadius: 2,
              border: '1px dashed var(--acc-train)',
            }} />
            geplant
          </span>
        </div>
      </Card>

      <Card title="Sitzungen im Monat" sub={monat}>
        {imMonat.length === 0 ? (
          <div className="v2-dim" style={{ fontSize: 11.5, padding: '10px 0' }}>
            Keine Sitzungen in diesem Monat.
          </div>
        ) : (
          <div className="v2-col-gap" style={{ gap: 6 }}>
            {imMonat.map(s => (
              <div key={s.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                background: 'var(--bg-elev)', border: '1px solid var(--border)',
                borderRadius: 5,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{s.name ?? '—'}</div>
                  <div className="v2-dim v2-mono" style={{ fontSize: 10 }}>
                    {s.session_date}
                    {s.total_volume_kg != null ? ` · ${tonnen(s.total_volume_kg)}` : ''}
                  </div>
                </div>
                <ZustandsPille s={s} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
