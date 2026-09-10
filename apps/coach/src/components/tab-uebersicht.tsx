// Overview: die Morgenrunde — Zaehlstaende und die Arbeit, die ansteht.
// Nach dem staerksten Vorgaenger-Muster (F-06 4.4): eine priorisierte,
// klickbare Arbeitsliste statt eines Kennzahlenfriedhofs. Sortiert wird
// nach Zustand und Datum — es gibt keinen Personen-Score (T7).
import { Card, Empty, KPI, Pill } from '@lumeos/ui'
import type { PortalStand } from '../lib/daten'
// G-409: der Linkhelfer entscheidet, wohin ein Klick fuehrt.
import { wegZuReiter, wegZuAthlet, type DraftLage } from './draft/wege'
import { datum, zeitpunkt } from '../lib/format'

export function TabUebersicht({ stand, lage = null }: {
  stand: PortalStand
  /** In welcher Fassung — G-409. */
  lage?: DraftLage
}) {
  const namen = new Map(stand.klienten.map(k => [k.client_id, k.display_name]))
  const eingereicht = stand.checkins.filter(c => c.status === 'submitted')
  const offeneAlerts = stand.alerts.filter(a => a.status === 'open')
  const ungelesen = stand.nachrichten.filter(n => n.read_at === null && n.sender_id !== stand.userId)
  const offeneVorschlaege = stand.pending.filter(p => p.status === 'pending')
  const aktive = stand.klienten.filter(k => k.status === 'active')
  const eingeladen = stand.klienten.filter(k => k.status === 'invited')
  // G-400: „n athletes affected" wie in der Vorlage — je Klient
  // hoechstens einmal gezaehlt, nicht je Alert.
  const betroffene = new Set(offeneAlerts.map(a => a.client_id)).size

  const arbeit: { text: string; ziel: string; wann: string }[] = [
    ...eingereicht.map(c => ({
      text: `Check-in von ${namen.get(c.client_id) ?? c.client_id} reviewen`,
      ziel: wegZuReiter(lage, 'workflows'),
      wann: zeitpunkt(c.submitted_at),
    })),
    ...ungelesen.map(n => ({
      text: `Nachricht von ${namen.get(n.client_id) ?? n.client_id} beantworten`,
      ziel: wegZuReiter(lage, 'messages'),
      wann: zeitpunkt(n.sent_at),
    })),
    ...offeneAlerts.map(a => ({
      text: `Alert: ${a.title} (${namen.get(a.client_id) ?? a.client_id})`,
      ziel: wegZuReiter(lage, 'alerts'),
      wann: zeitpunkt(a.created_at),
    })),
  ]

  return (
    <div className="cp-stapel">
      {/* ══ G-400/A1: die Kennzahlen tragen ihre Einordnung ══════
          `[cmd]` **Die Vorlage gibt jeder Kennzahl DREI Felder**
          (`module-coach.jsx:507-510`): Beschriftung, Zahl, und eine
          Zeile darunter, die sie einordnet — *„+2 last 30d"*,
          *„30-day rolling"*, *„3 athletes affected"*.
          `[cmd]` **Gebaut waren zwei Felder je Kachel** — die
          dritte Zeile fehlte durchweg.
          `[read]` **`KPI` kann sie seit jeher** (`delta`,
          `deltaVariant`, `spark`) — sie wurde nur nie uebergeben.
          **Ergaenzt ist, was aus echten Zeilen faellt**; erfunden
          wird nichts. */}
      <div className="cp-grid cp-grid-4">
        <KPI
          label="Aktive Athleten"
          value={aktive.length}
          unit={` von ${stand.klienten.length}`}
          delta={`${eingeladen.length} eingeladen`}
        />
        <KPI
          label="Check-ins eingereicht"
          value={eingereicht.length}
          delta={`von ${stand.checkins.length} gesamt`}
        />
        <KPI
          label="Alerts offen"
          value={offeneAlerts.length}
          // `[cmd]` **`deltaVariant` kennt nur `pos` und `neg`**
          // (`primitives.tsx:397`) — die Vorlage faerbt die ZAHL
          // gelb, nicht die Zeile darunter. `[read]` **Das waere eine
          // Aenderung in `packages/ui`** und ist gemeldet, nicht
          // gebaut: ein `warn` fuer `deltaVariant`.
          // `[cmd]` **Die Vorlage schreibt „3 athletes affected"** —
          // aus `alerts` gruppiert nach Klient, hier dieselbe
          // Rechnung ueber den geladenen Stand.
          delta={`${betroffene} ${betroffene === 1 ? 'Athlet' : 'Athleten'} betroffen`}
        />
        <KPI
          label="Vorschlaege offen"
          value={offeneVorschlaege.length}
          delta={`von ${stand.pending.length} gesamt`}
        />
      </div>

      <div className="cp-grid cp-grid-15">
        <Card title="Anstehende Arbeit" sub={`${arbeit.length} Punkte`}>
          {arbeit.length === 0 ? (
            <Empty title="Nichts offen" sub="Keine eingereichten Check-ins, keine ungelesenen Nachrichten, keine offenen Alerts." />
          ) : (
            <div className="cp-tabelle-huelle">
              <table className="cp-tabelle">
                <tbody>
                  {arbeit.map((a, i) => (
                    <tr key={i}>
                      <td><a href={a.ziel}>{a.text}</a></td>
                      <td className="cp-monospace">{a.wann}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* ══ G-400/A1: „Athletes needing attention" ══════════════
            `[cmd]` **Die Vorlage zeigt SIEBEN Felder je Zeile**
            (`module-coach.jsx:502`): Avatar, Name, Plan, letzte
            Sitzung, Pill „n alerts", Compliance farbig, Klick.
            `[cmd]` **Gebaut waren zwei: Name und Datum.**
            **Ergaenzt sind Avatar und Alertzahl** — beide fallen aus
            Zeilen, die der Stand schon traegt. `[read]` **Plan und
            Compliance bleiben weg**: es gibt keine Plantabelle und
            keinen Erfuellungsgrad je Klient. **Die Kachel darunter
            zeigt, wie es aussaehe.** */}
        <Card title="Athleten" sub={`${aktive.length} aktiv · ${betroffene} mit offenen Alerts`}>
          {stand.klienten.map(k => {
            const eigene = offeneAlerts.filter(a => a.client_id === k.client_id).length
            return (
              <div key={k.relationship_id} className="cp-athlet">
                {/* `[read]` **Initialen statt Bild** — die Vorlage
                    zeigt genau das (`avatar: "LB"`), und ein Bild
                    gibt es in keiner Tabelle. */}
                <span className="cp-avatar" aria-hidden="true">
                  {k.display_name.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                </span>
                <a href={wegZuAthlet(lage, k.client_id)} style={{ flex: 1, minWidth: 0 }}>
                  {k.display_name}
                </a>
                {eigene > 0 && (
                  <Pill variant="warn">{`${eigene} ${eigene === 1 ? 'Alert' : 'Alerts'}`}</Pill>
                )}
                <Pill variant={k.status === 'active' ? 'pos' : undefined}>
                  {k.status === 'active' ? `aktiv seit ${datum(k.started_at)}` : k.status === 'invited' ? 'eingeladen' : 'beendet'}
                </Pill>
              </div>
            )
          })}
        </Card>
      </div>

      <Card
        title="Offene Vorschlaege"
        sub="Warten auf die Bestaetigung des Klienten — der Coach schreibt nie direkt (F-06 4.3)"
      >
        {offeneVorschlaege.length === 0 ? (
          <Empty title="Keine offenen Vorschlaege" sub="Ein neuer Vorschlag entsteht in der Klientenakte." />
        ) : (
          <div className="cp-tabelle-huelle">
            <table className="cp-tabelle">
              <thead>
                <tr><th>Athlet</th><th>Modul</th><th>Vorschlag</th><th>Verfaellt</th></tr>
              </thead>
              <tbody>
                {offeneVorschlaege.map(p => (
                  <tr key={p.id}>
                    <td>{namen.get(p.client_id) ?? p.client_id}</td>
                    <td>{p.module}</td>
                    <td>{String(p.preview['title'] ?? p.action_type)}</td>
                    <td className="cp-monospace">{zeitpunkt(p.expires_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
