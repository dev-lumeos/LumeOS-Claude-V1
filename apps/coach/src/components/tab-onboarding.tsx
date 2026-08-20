// Onboarding: der Stand der Anbahnung — nur Anzeige. Wer wen einlaedt
// (Richtung, Annahme-Flow) ist T3 und liegt bei Tom; die Tabelle traegt
// beide Richtungen schon (151), die Oberflaeche baut erst nach der
// Entscheidung einen Einladungsweg.
import { Card, Empty, Pill } from '@lumeos/ui'
import type { PortalStand } from '../lib/daten'
import { datum } from '../lib/format'

export function TabOnboarding({ stand }: { stand: PortalStand }) {
  return (
    <Card
      title="Onboarding"
      sub="Anbahnung -> Annahme -> Ende; der Einladungsweg wartet auf T3"
    >
      {stand.klienten.length === 0 ? (
        <Empty title="Keine Beziehungen" />
      ) : (
        <div className="cp-tabelle-huelle">
          <table className="cp-tabelle">
            <thead>
              <tr><th>Athlet</th><th>Status</th><th>Eingeladen</th><th>Aktiv seit</th><th>Notiz</th></tr>
            </thead>
            <tbody>
              {stand.klienten.map(k => (
                <tr key={k.relationship_id}>
                  <td>{k.display_name}</td>
                  <td>
                    <Pill variant={k.status === 'active' ? 'pos' : k.status === 'invited' ? 'warn' : undefined}>
                      {k.status}
                    </Pill>
                  </td>
                  <td className="cp-monospace">{datum(k.invited_at)}</td>
                  <td className="cp-monospace">{datum(k.started_at)}</td>
                  <td style={{ color: 'var(--fg-muted)' }}>{k.invite_note ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
