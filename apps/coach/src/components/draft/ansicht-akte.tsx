// Die Klientenakte — G-409/A3.
//
// **Tom, 2026-09-08:** *„nicht dieser rest — die tiefe und jeder
// klick."*
//
// ══ WAS G-407 HIER ZEIGTE UND WAS DIE VORLAGE ZEIGT ════════════════
//
// `[cmd]` **G-407 zeigte hier `TabAthleten`** — eine Liste mit zwei
// Zeilen. `[cmd]` **Die Vorlage
// (`module-coach-client-record.jsx:94`) zeigt eine KLIENTENKARTE
// und darunter ACHT Untertabs.**
//
// `[read]` **Das ist der Unterschied, den Tom meint.**
//
// ══ DIE KARTE, FELD FUER FELD ══════════════════════════════════════
//
//     Zeichen (av)          Name + drei Pills + „since …"
//     Zeile                 goal · phase · Alter, Groesse
//     drei Coach-Pills      training, nutrition, medical
//     Trennlinie
//     ACCESS + sechs Pills  je Modul, gefaerbt nach Freigabe
//     rechts                granted … · revocable any time
//     Knoepfe               Message, Add note, Open review
//
// ══ WORAUS DIE ZAHLEN KOMMEN ═══════════════════════════════════════
//
// `[read]` **Aus der Vorlage** — es gibt im Coach-Schema keine
// Tabelle mit Trainings-, Naehrwert- oder Koerperdaten je Klient.
// **Die Werte liegen beim Klienten, nicht beim Coach.**
//
// `[cmd]` **Je Kachel ein Vermerk mit diesem Grund** (E-69).
'use client'

import * as React from 'react'
import { Card, Pill, Icon, Meter, Sparkline } from '@lumeos/ui'

import {
  FCR_CLIENT, FCR_MODULES, FCR_TRAINING, FCR_NUTRITION, FCR_RECOVERY,
  FCR_SUPPS, FCR_BODY, FCR_MEDICAL, FCR_TIMELINE,
} from './daten-portal'
import { Attrappe, Kasten, KastenKopf, Raster, Stapel, Auge, Haken } from './bausteine'

const FEHLT = 'die Akte der Vorlage zeigt Trainings-, Naehrwert-, '
  + 'Erholungs- und Koerperdaten je Klient — im Schema coach gibt es '
  + 'dafuer keine Tabelle (die Werte liegen beim Klienten)'

const V = (quelle: string) => <Attrappe fehlt={FEHLT} quelle={quelle} />

/** Die acht Untertabs — `client-record.jsx:139`. */
const MODULE = [
  ['overview', 'Overview'], ['training', 'Training'], ['nutrition', 'Nutrition'],
  ['recovery', 'Recovery'], ['supplements', 'Supplements'], ['body', 'Body'],
  ['medical', 'Medical'], ['timeline', 'Timeline'],
] as const

/** Vier Kennzahlen nebeneinander — die Bauform der Vorlage. */
function Kennzahlen({ werte }: { werte: ReadonlyArray<readonly [string, string]> }) {
  return (
    <Raster spalten="repeat(4, 1fr)" gap={10}>
      {werte.map(([l, v]) => (
        <div key={l} className="dk-kennzahl">
          <div className="v2-eyebrow">{l}</div>
          <div className="dk-kennzahl-wert v2-num">{v}</div>
        </div>
      ))}
    </Raster>
  )
}

export function DraftAkte() {
  const [mod, setMod] = React.useState<string>('overview')
  const farbe = Object.fromEntries(FCR_MODULES.map(m => [m.id, m.color]))

  return (
    <Stapel>
      {/* ══ Die Klientenkarte — `:101-135` ══════════════════════ */}
      <Card>
        <div className="dk-akte-kopf">
          <div className="dk-akte-zeichen">{FCR_CLIENT.av}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="dk-akte-namenzeile">
              <span className="dk-akte-name">{FCR_CLIENT.name}</span>
              <Pill variant="pos" dot>full access granted</Pill>
              <Pill>{FCR_CLIENT.tier}</Pill>
              <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>
                since {FCR_CLIENT.since}
              </span>
            </div>
            <div className="dk-akte-ziel">
              {FCR_CLIENT.goal} · {FCR_CLIENT.phase} · {FCR_CLIENT.age}, {FCR_CLIENT.height} cm
            </div>
            {/* Die drei Coach-Pills. */}
            <div className="dk-akte-coaches">
              {FCR_CLIENT.coaches.map(c => <Pill key={c}>{c}</Pill>)}
            </div>
          </div>
          <div className="dk-akte-knoepfe">
            <button type="button" className="v2-btn" disabled title="Attrappe — kein Schreibweg">
              <Icon name="message" className="v2-ic v2-ic-sm" />Message
            </button>
            <button type="button" className="v2-btn" disabled title="Attrappe — kein Schreibweg">
              <Icon name="edit" className="v2-ic v2-ic-sm" />Add note
            </button>
            <button type="button" className="v2-btn v2-btn-primary" disabled title="Attrappe — kein Schreibweg">
              Open review
            </button>
          </div>
        </div>

        <div className="dk-trenner" />

        {/* ══ Die ACCESS-Zeile, sechs Pills — `:124-134` ═══════ */}
        <div className="dk-akte-access">
          <span className="v2-eyebrow" style={{ marginRight: 3 }}>Access</span>
          {FCR_MODULES.map(m => (
            <Pill
              key={m.id}
              style={{
                color: m.access === 'full' ? m.color : 'var(--fg-dim)',
                borderColor: m.access === 'full'
                  ? `color-mix(in srgb, ${m.color} 30%, var(--border))`
                  : 'var(--border)',
              }}
            >
              {m.label} · {m.access}
            </Pill>
          ))}
          <span className="v2-dim v2-mono dk-akte-granted">
            granted {FCR_CLIENT.granted} · revocable any time
          </span>
        </div>
        {V('FCR_CLIENT, FCR_MODULES')}
      </Card>

      {/* ══ Die acht Untertabs — `:138-143` ═════════════════════ */}
      <div className="dk-modulwahl" role="tablist" aria-label="Module der Akte">
        {MODULE.map(([k, l]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={mod === k}
            className={mod === k ? 'v2-btn v2-btn-primary' : 'v2-btn'}
            onClick={() => setMod(k)}
          >
            {l}
          </button>
        ))}
      </div>

      {/* ── Overview: je Modul eine Kachel ────────────────────── */}
      {mod === 'overview' && (
        <Raster spalten="repeat(3, 1fr)" gap={12}>
          {([
            ['Training', farbe.training, FCR_TRAINING.kpis,
              '6 von 6 Einheiten. Kraft haelt bei drei von vier Uebungen '
              + 'innerhalb von 5 % des Hoechststands.'],
            ['Nutrition', farbe.nutrition, FCR_NUTRITION.kpis,
              '97 % Treue ueber sieben Tage. Samstag 200 kcal darueber, '
              + 'abgesprochen.'],
            ['Recovery', farbe.recovery, FCR_RECOVERY.kpis,
              'Die Problemstelle. Schlaf die ganze Woche unter Ziel, '
              + 'HRV 17 % unter dem Ausgangswert.'],
          ] as const).map(([t, c, rows, foot]) => (
            <Card key={t} title={<><span className="v2-dot" style={{ background: c }} /> {t}</>}>
              <Stapel gap={5}>
                {rows.map(([l, v]) => (
                  <div key={l} className="v2-row">
                    <span className="v2-row-l">{l}</span>
                    <span className="v2-row-r v2-num">{v}</span>
                  </div>
                ))}
              </Stapel>
              <div className="dk-balken-note" style={{ marginTop: 9 }}>{foot}</div>
              {V(`FCR_${t.toUpperCase()}.kpis`)}
            </Card>
          ))}
        </Raster>
      )}

      {/* ── Training ─────────────────────────────────────────── */}
      {mod === 'training' && (
        <Stapel gap={12}>
          <Kennzahlen werte={FCR_TRAINING.kpis} />
          <Card title="Einheiten" sub={`${FCR_TRAINING.sessions.length} zuletzt`}>
            <Stapel gap={8}>
              {FCR_TRAINING.sessions.map((s, i) => (
                <Kasten key={i}>
                  <KastenKopf name={s.name} marken={<Pill>RPE {s.rpe}</Pill>} rechts={s.d} />
                  <div className="dk-streifen-text">{s.sets} Saetze · {s.vol} · {s.note}</div>
                </Kasten>
              ))}
            </Stapel>
            {V('FCR_TRAINING.sessions')}
          </Card>

          {/* `[cmd]` **G-409: `FCR_TRAINING.lifts`** — vier Felder je
              Uebung (aktuell, Hoechstwert, Abstand, in Ordnung).
              **G-407 zeigte keines davon.** */}
          <Card title="Uebungen" sub="aktuell gegen Hoechstwert">
            <table className="cp-tabelle">
              <thead>
                <tr>
                  <th>Uebung</th>
                  <th style={{ width: 110, textAlign: 'right' }}>aktuell</th>
                  <th style={{ width: 110, textAlign: 'right' }}>Hoechstwert</th>
                  <th style={{ width: 100, textAlign: 'right' }}>Abstand</th>
                  <th style={{ width: 70 }}>Stand</th>
                </tr>
              </thead>
              <tbody>
                {FCR_TRAINING.lifts.map(x => (
                  <tr key={x.l}>
                    <td>{x.l}</td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>{x.cur}</td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>{x.peak}</td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>{x.delta}</td>
                    <td>
                      {x.ok
                        ? <Pill variant="pos">im Rahmen</Pill>
                        : <Pill variant="warn">abgefallen</Pill>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {V('FCR_TRAINING.lifts')}
          </Card>
        </Stapel>
      )}

      {/* ── Nutrition: vier Kennzahlen, drei Kacheln — `:215` ── */}
      {mod === 'nutrition' && (
        <Stapel gap={12}>
          <Kennzahlen werte={FCR_NUTRITION.kpis} />
          <Raster spalten="1fr 1fr 1fr" gap={12}>
            <Card title="Today's macros">
              {FCR_NUTRITION.macros.map(([l, cur, tgt, c]) => (
                <div key={String(l)} style={{ marginBottom: 12 }}>
                  <div className="dk-balken-kopf">
                    <span className="dk-balken-label">{l}</span>
                    <span className="dk-balken-wert v2-num">{cur} / {tgt} g</span>
                  </div>
                  <Meter value={Number(cur)} max={Number(tgt)} color={String(c)} tall />
                </div>
              ))}
              {V('FCR_NUTRITION.macros')}
            </Card>

            <Card title="This week" sub="Kalorien und Eiweiss">
              {/* `[read]` **Die Vorlage benutzt `BarSeries`** — das
                  Paket hat keine Balkenreihe, also die Kurve mit
                  denselben Werten. **Die Zahlen sind dieselben.** */}
              <Sparkline
                data={FCR_NUTRITION.week.map(d => d.kcal)}
                color="var(--acc-nutri)"
                w={280}
                h={92}
              />
              <div className="dk-wochentage">
                {FCR_NUTRITION.week.map(d => (
                  <span key={d.d} className="v2-mono">{d.d}</span>
                ))}
              </div>
              <div className="dk-balken-note" style={{ marginTop: 9 }}>
                Samstag 200 kcal darueber, abgesprochenes Refeed. Eiweiss nie
                unter 208 g.
              </div>
              {V('FCR_NUTRITION.week')}
            </Card>

            <Card title="Micronutrient gaps" sub="unter Ziel, 30-Tage-Mittel">
              {FCR_NUTRITION.gaps.map(([l, v]) => (
                <div key={String(l)} style={{ marginBottom: 11 }}>
                  <div className="dk-balken-kopf">
                    <span className="dk-balken-label">{l}</span>
                    <span
                      className="dk-balken-wert v2-num"
                      style={{ color: Number(v) < 70 ? 'var(--warn)' : 'var(--fg)' }}
                    >
                      {v} %
                    </span>
                  </div>
                  <Meter
                    value={Number(v)}
                    color={Number(v) < 70 ? 'var(--warn)' : 'var(--acc-recov)'}
                  />
                </div>
              ))}
              <div className="dk-trenner" />
              <div className="dk-streifen-text">
                Vitamin D wird ergaenzt — die Luecke ist nur die Zufuhr ueber
                die Nahrung.
              </div>
              {V('FCR_NUTRITION.gaps')}
            </Card>
          </Raster>
        </Stapel>
      )}

      {/* ── Recovery ─────────────────────────────────────────── */}
      {mod === 'recovery' && (
        <Stapel gap={12}>
          <Kennzahlen werte={FCR_RECOVERY.kpis} />
          <Raster spalten="1fr 1fr" gap={12}>
            <Card title="Schlaf" sub="sieben Tage">
              <Sparkline data={[...FCR_RECOVERY.sleep]} color="var(--acc-recov)" w={320} h={60} />
              {V('FCR_RECOVERY.sleep')}
            </Card>
            <Card title="HRV" sub="sieben Tage">
              <Sparkline data={[...FCR_RECOVERY.hrv]} color="var(--acc-buddy)" w={320} h={60} />
              {V('FCR_RECOVERY.hrv')}
            </Card>
          </Raster>
          <Card title="Auffaelligkeiten" sub={`${FCR_RECOVERY.flags.length}`}>
            <Stapel gap={5}>
              {FCR_RECOVERY.flags.map((f, i) => <Haken key={i} ton="warn">{f.t}</Haken>)}
            </Stapel>
            {V('FCR_RECOVERY.flags')}
          </Card>
        </Stapel>
      )}

      {/* ── Supplements ──────────────────────────────────────── */}
      {mod === 'supplements' && (
        <Card title="Ergaenzungen" sub={`${FCR_SUPPS.length} · Einnahmetreue`}>
          <table className="cp-tabelle">
            <thead>
              <tr>
                <th>Mittel</th><th style={{ width: 90 }}>Dosis</th>
                <th style={{ width: 110 }}>Zeitpunkt</th>
                <th style={{ width: 110 }}>Treue</th>
                <th style={{ width: 80, textAlign: 'right' }}>Tage</th>
              </tr>
            </thead>
            <tbody>
              {FCR_SUPPS.map(s => (
                <tr key={s.n}>
                  <td>{s.n}</td>
                  <td className="v2-num">{s.dose}</td>
                  <td className="v2-dim">{s.when}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ flex: 1 }}>
                        <Meter
                          value={s.adherence}
                          color={s.adherence >= 95 ? 'var(--pos)' : 'var(--warn)'}
                        />
                      </div>
                      <span className="v2-num v2-dim" style={{ fontSize: 10 }}>
                        {s.adherence} %
                      </span>
                    </div>
                  </td>
                  <td className="v2-num" style={{ textAlign: 'right' }}>{s.days}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {V('FCR_SUPPS')}
        </Card>
      )}

      {/* ── Body ─────────────────────────────────────────────── */}
      {mod === 'body' && (
        <Stapel gap={12}>
          <Kennzahlen werte={FCR_BODY.kpis} />
          <Raster spalten="1.4fr 1fr" gap={12}>
            <Card title="Gewicht" sub="zwoelf Wochen">
              <Sparkline data={[...FCR_BODY.weight]} color="var(--acc-goals)" w={420} h={80} />
              {V('FCR_BODY.weight')}
            </Card>
            <Card title="Masse">
              <Stapel gap={5}>
                {FCR_BODY.measures.map(([l, w]) => (
                  <div key={String(l)} className="v2-row">
                    <span className="v2-row-l">{l}</span>
                    <span className="v2-row-r v2-num">{w}</span>
                  </div>
                ))}
              </Stapel>
              {V('FCR_BODY.measures')}
            </Card>
          </Raster>
        </Stapel>
      )}

      {/* ── Medical: nur Zusammenfassung ─────────────────────── */}
      {mod === 'medical' && (
        <Card title="Medizinisch" sub="nur Zusammenfassung — Detail bleibt beim Klienten">
          <div className="dk-streifen-text" style={{ marginBottom: 10 }}>
            {FCR_MEDICAL.note}
          </div>
          <Stapel gap={5}>
            {FCR_MEDICAL.visible.map(([l, w]) => (
              <div key={String(l)} className="v2-row">
                <span className="v2-row-l">{l}</span>
                <span className="v2-row-r">{w}</span>
              </div>
            ))}
          </Stapel>
          {V('FCR_MEDICAL')}
        </Card>
      )}

      {/* ── Timeline ─────────────────────────────────────────── */}
      {mod === 'timeline' && (
        <Card title="Verlauf" sub={`${FCR_TIMELINE.length} Ereignisse`}>
          <Stapel gap={6}>
            {FCR_TIMELINE.map((e, i) => (
              <div key={i} className="v2-row">
                <span className="v2-row-l">
                  <span
                    className="v2-dot"
                    style={{ background: farbe[e.m] ?? 'var(--fg-dim)' }}
                  />
                  <Pill>{e.m}</Pill> {e.t}
                </span>
                <span className="v2-row-r v2-mono v2-dim">{e.at}</span>
              </div>
            ))}
          </Stapel>
          {V('FCR_TIMELINE')}
        </Card>
      )}
    </Stapel>
  )
}
