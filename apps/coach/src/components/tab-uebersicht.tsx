// Overview: die Morgenrunde — Zaehlstaende und die Arbeit, die ansteht.
// Nach dem staerksten Vorgaenger-Muster (F-06 4.4): eine priorisierte,
// klickbare Arbeitsliste statt eines Kennzahlenfriedhofs. Sortiert wird
// nach Zustand und Datum — es gibt keinen Personen-Score (T7).
import { Card, Empty, KPI, Pill } from '@lumeos/ui'
import type { PortalStand } from '../lib/daten'
import { datum, zeitpunkt } from '../lib/format'

export function TabUebersicht({ stand }: { stand: PortalStand }) {
  const namen = new Map(stand.klienten.map(k => [k.client_id, k.display_name]))
  const eingereicht = stand.checkins.filter(c => c.status === 'submitted')
  const offeneAlerts = stand.alerts.filter(a => a.status === 'open')
  const ungelesen = stand.nachrichten.filter(n => n.read_at === null && n.sender_id !== stand.userId)
  const offeneVorschlaege = stand.pending.filter(p => p.status === 'pending')
  const aktive = stand.klienten.filter(k => k.status === 'active')

  const arbeit: { text: string; ziel: string; wann: string }[] = [
    ...eingereicht.map(c => ({
      text: `Check-in von ${namen.get(c.client_id) ?? c.client_id} reviewen`,
      ziel: '/?tab=workflows',
      wann: zeitpunkt(c.submitted_at),
    })),
    ...ungelesen.map(n => ({
      text: `Nachricht von ${namen.get(n.client_id) ?? n.client_id} beantworten`,
      ziel: '/?tab=messages',
      wann: zeitpunkt(n.sent_at),
    })),
    ...offeneAlerts.map(a => ({
      text: `Alert: ${a.title} (${namen.get(a.client_id) ?? a.client_id})`,
      ziel: '/?tab=alerts',
      wann: zeitpunkt(a.created_at),
    })),
  ]

  return (
    <div className="cp-stapel">
      <div className="cp-grid cp-grid-4">
        <KPI label="Aktive Athleten" value={aktive.length} unit={` von ${stand.klienten.length}`} />
        <KPI label="Check-ins eingereicht" value={eingereicht.length} />
        <KPI label="Alerts offen" value={offeneAlerts.length} />
        <KPI label="Vorschlaege offen" value={offeneVorschlaege.length} />
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

        <Card title="Athleten" sub="Beziehungsstand">
          {stand.klienten.map(k => (
            <div key={k.relationship_id} className="cp-zeile" style={{ padding: '6px 0' }}>
              <a href={`/athlet/${k.client_id}`}>{k.display_name}</a>
              <Pill variant={k.status === 'active' ? 'pos' : undefined}>
                {k.status === 'active' ? `aktiv seit ${datum(k.started_at)}` : k.status === 'invited' ? 'eingeladen' : 'beendet'}
              </Pill>
            </div>
          ))}
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
