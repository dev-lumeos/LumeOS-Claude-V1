'use client'

// Zwei Tabs: „Autonomy" und „Check-ins".
//
// QUELLE: theme-v1/module-coach-athlete.jsx:397-500 (`AthleteAutonomy`),
// :503-563 (`AthleteCheckins`).
//
// **WAS DIE AUTONOMIE-LEITER IST:** `[cmd]` Die Vorlage fuehrt fuenf
// Stufen (`AUTONOMY_LADDER`, daten.ts:337-343). Jede Stufe legt drei
// Dinge fest — wie oft der Trainer nachfragt (`cadence`), wann er
// eingreift (`threshold`) und wie weit vom Plan abgewichen werden darf
// (`flex`). Die Zeile der eigenen Stufe wird in der Tabelle
// hinterlegt und traegt zusaetzlich ein `you`-Pill.
//
// `[cmd]` Die `threshold`-Werte stehen in der Datei mit Unterstrich
// (`significant_trends`); die Vorlage ersetzt sie beim Anzeigen durch
// Leerzeichen (`.replace(/_/g, " ")`). Uebernommen, nicht in den Daten
// korrigiert — die Daten bleiben, wie die Vorlage sie fuehrt.
//
// GEAENDERT IST NUR DAS TECHNISCHE:
//   1. JSX ohne Typen -> TypeScript.
//   2. Klassen auf `v2-`-Praefix.
//   3. `window.X` und blosse Globale -> Importe aus `./daten`.
//   4. `<Pill variant="pos" dot>` -> `PunktPill` (packages/ui kennt
//      kein `dot`; Begruendung in bausteine.tsx).
//   5. `<Pill variant="block">` -> `variant="neg"`. `PillVariant` in
//      packages/ui/src/primitives.tsx:80 kennt vier Werte —
//      'pos' | 'warn' | 'neg' | 'acc'. Ein `block` gibt es nicht;
//      `neg` ist die rote Variante und damit die gemeinte.
//      Das leere `variant=""` der Vorlage heisst „gar keine Variante"
//      und wird `undefined`.
//   6. Die beiden Seitenraster nutzen die geteilten Klassen
//      `v2-grid-15` (1.5fr/1fr) und `v2-grid-14` (1.4fr/1fr) statt
//      eigener `gridTemplateColumns` — sie tragen den 1100px-Haltepunkt,
//      den die Vorlage nicht hat (v2.css:1735-1762).
//   7. Jede breite Tabelle in `v2-tbl-wrap`.
//   8. Mehrteilige Textknoten (`{a} → {b}`) zu einem Template-Literal
//      zusammengezogen — sonst weicht der Server-HTML vom Client ab.
//
// NICHT geaendert: keine Kachel weggelassen, keine Zahl ersetzt, keine
// Anordnung angepasst. Der Knopf „Fill in early" hat in der Vorlage
// kein `onClick` und bekommt hier auch keines.
//
// `[cmd]` ALLES IST ATTRAPPE. Ein `coach`-Schema gibt es nicht.
import { Card, Pill, Icon, Meter, Row } from '@lumeos/ui'

import { ATTRAPPE } from './ansicht'
import {
  CLIENT_AUTONOMY, AUTONOMY_LADDER, CHECKIN_TEMPLATES, CHECKIN_HISTORY,
} from './daten'

// ── Autonomy · client side ───────────────────────────────────────────
// [cmd] module-coach-athlete.jsx:397-500.

export function AthleteAutonomy() {
  const a = CLIENT_AUTONOMY
  const cur = AUTONOMY_LADDER.find(l => l.lvl === a.level)

  // [cmd] Die Vorlage greift ungeprueft auf `cur.cadence` zu — sie weiss,
  // dass Stufe 4 in der Leiter steht. TypeScript weiss das nicht, also
  // wird der Fall abgefangen statt unterdrueckt.
  if (!cur) return null

  const kriterien: Array<[string, number]> = [
    ['Consistency', a.scores.consistency],
    ['Knowledge', a.scores.knowledge],
    ['Self-correction', a.scores.self_correction],
    ['Communication', a.scores.communication],
  ]

  return (
    <div className="v2-grid v2-grid-15">
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card attrappe={ATTRAPPE}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 14 }}>
            <div
              style={{
                width: 56, height: 56, borderRadius: 999, background: 'var(--acc-coach)',
                color: 'var(--bg)', display: 'grid', placeItems: 'center',
                fontWeight: 700, fontSize: 24,
              }}
            >
              {a.level}
            </div>
            <div style={{ flex: 1 }}>
              <div className="v2-eyebrow" style={{ color: 'var(--acc-coach)', marginBottom: 4 }}>
                Your autonomy level
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 3 }}>{a.levelName}</div>
              <div className="v2-muted" style={{ fontSize: 11.5 }}>
                {`Set by ${a.coach} on ${a.assignedAt}`}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="v2-eyebrow" style={{ marginBottom: 3 }}>Next review</div>
              <div className="v2-num" style={{ fontSize: 14 }}>{a.nextAssessment}</div>
            </div>
          </div>

          <div
            style={{
              padding: 12, background: 'var(--surface-2)', borderRadius: 6, fontSize: 12,
              lineHeight: 1.55, color: 'var(--fg-muted)', marginBottom: 14,
            }}
          >
            {a.reason}
          </div>

          <div className="v2-grid v2-g-cols-3" style={{ gap: 10 }}>
            <Card className="v2-card-tight" style={{ padding: 10 }} attrappe={ATTRAPPE}>
              <div className="v2-eyebrow">Check-in cadence</div>
              <div className="v2-mono" style={{ fontSize: 13, marginTop: 3 }}>{cur.cadence}</div>
            </Card>
            <Card className="v2-card-tight" style={{ padding: 10 }} attrappe={ATTRAPPE}>
              <div className="v2-eyebrow">Coach steps in on</div>
              <div className="v2-mono" style={{ fontSize: 12, marginTop: 3 }}>
                {cur.threshold.replace(/_/g, ' ')}
              </div>
            </Card>
            <Card className="v2-card-tight" style={{ padding: 10 }} attrappe={ATTRAPPE}>
              <div className="v2-eyebrow">Plan flexibility</div>
              <div className="v2-mono" style={{ fontSize: 13, marginTop: 3 }}>{cur.flex}</div>
            </Card>
          </div>
        </Card>

        <Card title="The ladder" sub="what changes as you move up" attrappe={ATTRAPPE}>
          <div className="v2-tbl-wrap">
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>Lvl</th>
                  <th style={{ width: 130 }}>Name</th>
                  <th style={{ width: 110 }}>Cadence</th>
                  <th>Coach intervenes on</th>
                  <th style={{ width: 110 }}>Flexibility</th>
                </tr>
              </thead>
              <tbody>
                {AUTONOMY_LADDER.map(l => (
                  <tr
                    key={l.lvl}
                    style={l.lvl === a.level
                      ? { background: 'color-mix(in oklch, var(--acc-coach) 8%, transparent)' }
                      : undefined}
                  >
                    <td
                      className="v2-num"
                      style={{
                        color: l.lvl === a.level ? 'var(--acc-coach)' : undefined,
                        fontWeight: l.lvl === a.level ? 600 : 400,
                      }}
                    >
                      {l.lvl}
                    </td>
                    <td style={{ fontWeight: l.lvl === a.level ? 600 : 400 }}>
                      {l.name}
                      {l.lvl === a.level && <Pill variant="acc" style={{ marginLeft: 6 }}>you</Pill>}
                    </td>
                    <td className="v2-mono v2-muted" style={{ fontSize: 11 }}>{l.cadence}</td>
                    <td className="v2-mono v2-muted" style={{ fontSize: 11 }}>
                      {l.threshold.replace(/_/g, ' ')}
                    </td>
                    <td className="v2-mono v2-muted" style={{ fontSize: 11 }}>{l.flex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="History" sub={`${a.history.length} changes`} attrappe={ATTRAPPE}>
          <div className="v2-col-gap" style={{ gap: 0 }}>
            {a.history.map((h, i) => (
              <div key={i} className="v2-row" style={{ fontSize: 12 }}>
                <span className="v2-row-l">
                  <span className="v2-num v2-dim" style={{ fontSize: 10, width: 78 }}>{h.date}</span>
                  <Pill
                    variant={h.type === 'promotion' ? 'pos' : h.type === 'demotion' ? 'neg' : undefined}
                  >
                    {h.type}
                  </Pill>
                  <span className="v2-mono" style={{ fontSize: 11 }}>
                    {`${h.from ?? '—'} → ${h.to}`}
                  </span>
                </span>
                <span
                  className="v2-row-r v2-muted"
                  style={{ fontSize: 11, fontFamily: 'var(--font-sans)' }}
                >
                  {h.reason}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card
          title="Assessment scores"
          sub="how your coach rates the four criteria"
          attrappe={ATTRAPPE}
        >
          <div className="v2-col-gap" style={{ gap: 10 }}>
            {kriterien.map(([k, v]) => (
              <div key={k}>
                <div
                  style={{
                    display: 'flex', justifyContent: 'space-between',
                    marginBottom: 4, fontSize: 11.5,
                  }}
                >
                  <span className="v2-muted">{k}</span>
                  <span className="v2-num">{(v * 100).toFixed(0)}</span>
                </div>
                <Meter
                  value={v * 100}
                  color={v >= 0.85 ? 'var(--pos)' : v >= 0.7 ? 'var(--warn)' : 'var(--neg)'}
                />
              </div>
            ))}
          </div>

          <div className="v2-divider" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span className="v2-eyebrow">Overall</span>
            <span className="v2-num" style={{ fontSize: 20, color: 'var(--acc-coach)' }}>
              {(a.scores.overall * 100).toFixed(0)}
            </span>
          </div>

          <div className="v2-divider" />
          <Row label="Regression risk" value={`${(a.regressionRisk * 100).toFixed(0)}%`} />
          <Row label="Assigned by" value={a.assignedBy} />
        </Card>

        <Card title="What this means" sub="in practice" attrappe={ATTRAPPE}>
          <div
            className="v2-col-gap"
            style={{ gap: 8, fontSize: 11.5, color: 'var(--fg-muted)', lineHeight: 1.55 }}
          >
            <div style={{ padding: 10, background: 'var(--surface)', borderRadius: 6 }}>
              Your coach reviews weekly rather than daily, and only messages you when a trend — not a single day — moves the wrong way.
            </div>
            <div style={{ padding: 10, background: 'var(--surface)', borderRadius: 6 }}>
              You may deviate from the plan without asking, as long as you log why. Level 5 removes the logging requirement.
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

// ── Check-ins ────────────────────────────────────────────────────────
// [cmd] module-coach-athlete.jsx:503-563.
//
// `[cmd]` Die rechte Kachel ist in der Vorlage vollstaendig fest
// verdrahtet: „2", „days · Mon 08:00" und der Untertitel „Monday ·
// Weekly standard" stehen im JSX, nicht in den Daten. Die Feldliste
// darunter kommt aus `CHECKIN_TEMPLATES[0]` — der erste Eintrag, nicht
// der erste aktive. Beides uebernommen.

export function AthleteCheckins() {
  return (
    <div className="v2-grid v2-grid-14">
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card
          title="Templates"
          sub={`${CHECKIN_TEMPLATES.filter(t => t.active).length} active`}
          attrappe={ATTRAPPE}
        >
          <div className="v2-col-gap" style={{ gap: 8 }}>
            {CHECKIN_TEMPLATES.map(t => (
              <div
                key={t.id}
                style={{
                  padding: 12,
                  borderRadius: 7,
                  background: t.active
                    ? 'color-mix(in oklch, var(--acc-coach) 6%, var(--surface))'
                    : 'var(--surface)',
                  border: `1px solid ${t.active
                    ? 'color-mix(in oklch, var(--acc-coach) 28%, var(--border))'
                    : 'var(--border)'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</span>
                  {t.active ? <Pill variant="pos" dot>active</Pill> : <Pill>inactive</Pill>}
                  <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>
                    {t.cadence}
                  </span>
                </div>
                <div className="v2-muted" style={{ fontSize: 11, marginBottom: 8 }}>
                  {`Assigned by ${t.coach}`}
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {t.fields.map(f => <Pill key={f} style={{ fontSize: 9.5 }}>{f}</Pill>)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="History" sub={`${CHECKIN_HISTORY.length} check-ins`} attrappe={ATTRAPPE}>
          <div className="v2-tbl-wrap">
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th style={{ width: 80 }}>Date</th>
                  <th style={{ width: 150 }}>Template</th>
                  <th style={{ width: 100 }}>Status</th>
                  <th>Coach reply</th>
                </tr>
              </thead>
              <tbody>
                {CHECKIN_HISTORY.map((h, i) => (
                  <tr key={i}>
                    <td className="v2-num v2-muted">{h.date}</td>
                    <td>{h.template}</td>
                    <td>
                      <Pill variant={h.status === 'submitted' ? 'pos' : 'neg'}>{h.status}</Pill>
                    </td>
                    <td className="v2-muted" style={{ fontSize: 11.5 }}>
                      {h.reply || <span className="v2-dim">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card title="Next check-in" sub="Monday · Weekly standard" attrappe={ATTRAPPE}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
          <span className="v2-num" style={{ fontSize: 26, fontWeight: 500 }}>2</span>
          <span className="v2-dim" style={{ fontSize: 12 }}>days · Mon 08:00</span>
        </div>

        <div className="v2-eyebrow" style={{ marginBottom: 8 }}>You&apos;ll be asked for</div>
        <div className="v2-col-gap" style={{ gap: 4 }}>
          {CHECKIN_TEMPLATES[0].fields.map(f => (
            <div
              key={f}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 5, fontSize: 11.5,
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--fg-dim)' }} />
              {f}
            </div>
          ))}
        </div>

        <div className="v2-divider" />
        {/* [cmd] Die Vorlage gibt dem Knopf kein `onClick` — er bleibt tot. */}
        <button type="button" className="v2-btn v2-btn-primary" style={{ width: '100%' }}>
          <Icon name="edit" className="v2-ic v2-ic-sm" />
          Fill in early
        </button>
      </Card>
    </div>
  )
}
