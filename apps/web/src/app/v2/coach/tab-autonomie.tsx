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
import { Card, Pill, Icon, Empty } from '@lumeos/ui'

import { ATTRAPPE } from './ansicht'
// G-90: die echte Einstufung und ihre Historie.
import { AutonomieEcht, HistorieEcht } from './rechte-echt'
import type { CoachRechteStand } from '../../../lib/coach/rechte-read'
// G-163: CLIENT_AUTONOMY und AUTONOMY_LADDER sind mit dem
// Autonomie-Entwurf gefallen; die Check-in-Attrappe bleibt.
import { CHECKIN_TEMPLATES, CHECKIN_HISTORY } from './daten'

// ── Autonomy · client side ───────────────────────────────────────────
// [cmd] module-coach-athlete.jsx:397-500.

// **G-90: Der Tab liest — und setzt NICHTS.**
//
// `[read]` Tom, 2026-08-19: *„Unter Autonomy setzt der Coach den Level
// seines Users."* **Der Tab `Autonomie` ist die Coach-Sicht auf seiner
// Plattform** — hier sieht der Klient, wie er eingestuft wurde, und
// von wem. Bedienelemente gibt es deshalb keine.
//
// `[cmd]` Das Schema erzwingt es: `client_autonomy` nimmt Schreib-
// zugriffe nur von `coach_id`. Ein Regler hier waere wirkungslos.
export function AthleteAutonomy({ stand }: { stand?: CoachRechteStand }) {
  if (stand) {
    return (
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <AutonomieEcht stand={stand} />
        <HistorieEcht
          titel="Historie der Einstufungen"
          zeilen={stand.autonomieLog}
          leerText="Jede Änderung der Stufe erscheint hier — mit Alt- und Neuwert."
        />
      </div>
    )
  }
  // G-163: der Entwurf ist raus — ohne Stand steht hier der Grund.
  return (
    <Card title="Autonomy">
      <Empty
        title="Nicht geladen"
        sub="Der Autonomie-Stand wurde nicht gelesen — keine Sitzung oder ein Ladefehler."
        icon="coach"
      />
    </Card>
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
