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

// G-90: die echte Einstufung und ihre Historie.
import { AutonomieEcht, HistorieEcht } from './rechte-echt'
import type { CoachRechteStand } from '../../../lib/coach/rechte-read'
// G-163/G-169: die Entwurfsdaten sind mit den Rueckfallfassungen
// gefallen — Check-ins lesen jetzt echt.

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

export function AthleteCheckins({ stand }: { stand?: CoachRechteStand }) {
  // G-169: Vorlagen und Check-ins aus `coach` — der Entwurf war mit
  // dem Lesepfad ein Rueckfall und ist nach dem G-163-Beschluss raus.
  if (stand && (stand.vorlagen.length > 0 || stand.coachCheckins.length > 0)) {
    return <CheckinsEcht stand={stand} />
  }
  if (stand) {
    return (
      <Card title="Check-ins">
        <Empty
          title={stand.fehler ? 'Nicht geladen' : 'Noch keine Check-ins'}
          sub={stand.fehler
            ? `coach.checkins meldet: ${stand.fehler}`
            : 'Vorlagen und Check-ins legt der Coach an — für dieses Konto liegt keines vor.'}
          icon="calendar"
        />
      </Card>
    )
  }
  return (
    <Card title="Check-ins">
      <Empty
        title="Nicht geladen"
        sub="Der Coach-Stand wurde nicht gelesen — keine Sitzung oder ein Ladefehler."
        icon="calendar"
      />
    </Card>
  )
}

/** G-169: die echten Vorlagen und Check-ins. */
function CheckinsEcht({ stand }: { stand: CoachRechteStand }) {
  const STATUS_VARIANTE: Record<string, 'pos' | 'warn' | 'neg' | undefined> = {
    reviewed: 'pos', submitted: 'pos', pending: 'warn', missed: 'neg',
  }
  return (
    <div className="v2-grid v2-grid-14">
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card
          title="Check-ins"
          sub={`${stand.coachCheckins.length} · aus coach.checkins`}
        >
          {stand.coachCheckins.length === 0 ? (
            <Empty title="Noch keine Check-ins"
                   sub="Der Coach legt sie an — hier erscheint jeder mit Termin und Stand."
                   icon="calendar" />
          ) : (
            <div className="v2-col-gap" style={{ gap: 6 }}>
              {stand.coachCheckins.map(c => (
                <div key={c.id} style={{
                  padding: 10, background: 'var(--bg-elev)',
                  border: '1px solid var(--border)', borderRadius: 6,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span className="v2-num" style={{ fontSize: 11 }}>{c.due_date}</span>
                    <Pill variant={STATUS_VARIANTE[c.status]}>{c.status}</Pill>
                    {c.submitted_at && (
                      <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 9 }}>
                        abgegeben {c.submitted_at.slice(0, 10)}
                      </span>
                    )}
                  </div>
                  {c.client_note && (
                    <div className="v2-muted" style={{ fontSize: 11, lineHeight: 1.45 }}>
                      {c.client_note}
                    </div>
                  )}
                  {c.coach_feedback && (
                    <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.45, marginTop: 3 }}>
                      Coach: {c.coach_feedback}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card
        title="Vorlagen"
        sub={`${stand.vorlagen.filter(v => v.is_active).length} aktiv · aus coach.checkin_templates`}
      >
        {stand.vorlagen.length === 0 ? (
          <Empty title="Noch keine Vorlage"
                 sub="Vorlagen legt der Coach an." icon="edit" />
        ) : (
          <div className="v2-col-gap" style={{ gap: 8 }}>
            {stand.vorlagen.map(v => (
              <div key={v.id} style={{
                padding: 10, background: 'var(--bg-elev)',
                border: '1px solid var(--border)', borderRadius: 6,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{v.name}</span>
                  {v.is_active ? <Pill variant="pos">aktiv</Pill> : <Pill>inaktiv</Pill>}
                  <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 9.5 }}>
                    {v.cadence}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {v.fields.map(f => <Pill key={f.key} style={{ fontSize: 9 }}>{f.label}</Pill>)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
