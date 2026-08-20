// Alerts: die Arbeitsliste. Bewusst ohne Schweregrad und ohne Ampel —
// jeder Eintrag traegt den Sachverhalt und die Zahlen dahinter (154).
// Sortiert nach Status und Datum; Dringlichkeitsstufen sind T7.
import { Card, Empty, Pill } from '@lumeos/ui'
import type { PortalStand } from '../lib/daten'
import { alertStatusSetzen } from '../lib/aktionen'
import { zeitpunkt } from '../lib/format'

export function TabAlerts({ stand }: { stand: PortalStand }) {
  const namen = new Map(stand.klienten.map(k => [k.client_id, k.display_name]))
  const reihenfolge = { open: 0, read: 1, done: 2 } as const
  const sortiert = [...stand.alerts].sort(
    (a, b) => reihenfolge[a.status] - reihenfolge[b.status] || b.created_at.localeCompare(a.created_at),
  )

  if (sortiert.length === 0) {
    return (
      <Card title="Alerts">
        <Empty title="Keine Alerts" sub="Eintraege entstehen heute aus den Seeds; ein automatischer Erzeuger ist eigener Bauauftrag." />
      </Card>
    )
  }

  return (
    <Card title="Alerts" sub="Sachverhalt und Zahlen — keine Schweregrade (T7 offen)">
      <div className="cp-tabelle-huelle">
        <table className="cp-tabelle">
          <thead>
            <tr>
              <th>Wann</th><th>Athlet</th><th>Modul</th><th>Sachverhalt</th><th>Zahlen</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {sortiert.map(a => (
              <tr key={a.id}>
                <td className="cp-monospace">{zeitpunkt(a.created_at)}</td>
                <td>{namen.get(a.client_id) ?? a.client_id}</td>
                <td>{a.module}</td>
                <td>
                  <div>{a.title}</div>
                  {a.detail && <div style={{ color: 'var(--fg-muted)', fontSize: 11 }}>{a.detail}</div>}
                </td>
                <td>
                  {Object.keys(a.metric).length > 0
                    ? <span className="cp-monospace" style={{ fontSize: 10 }}>{JSON.stringify(a.metric)}</span>
                    : '—'}
                </td>
                <td><Pill variant={a.status === 'open' ? 'warn' : a.status === 'done' ? 'pos' : undefined}>{a.status}</Pill></td>
                <td>
                  {a.status !== 'done' && (
                    <form action={alertStatusSetzen} className="cp-zeile">
                      <input type="hidden" name="id" value={a.id} />
                      <input type="hidden" name="pfad" value="/?tab=alerts" />
                      {a.status === 'open' && (
                        <button className="cp-knopf" name="status" value="read" type="submit">Gelesen</button>
                      )}
                      <button className="cp-knopf" name="status" value="done" type="submit">Erledigt</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
