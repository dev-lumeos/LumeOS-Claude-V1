// Messages: ein Faden je Athlet, senden per Server-Aktion. read_at darf
// nur die Empfaengerseite setzen (Policy 154) — hier wird deshalb nichts
// automatisch als gelesen markiert.
import { Card, Empty, Pill } from '@lumeos/ui'
import type { PortalStand } from '../lib/daten'
import { nachrichtSenden } from '../lib/aktionen'
import { zeitpunkt } from '../lib/format'

export function TabNachrichten({ stand }: { stand: PortalStand }) {
  const aktive = stand.klienten.filter(k => k.status !== 'ended')
  if (aktive.length === 0) {
    return (
      <Card title="Messages">
        <Empty title="Keine Athleten" sub="Ohne Beziehung kein Faden." />
      </Card>
    )
  }

  return (
    <div className="cp-grid cp-grid-2">
      {aktive.map(k => {
        const faden = stand.nachrichten
          .filter(n => n.client_id === k.client_id)
          .slice(0, 20)
          .reverse()
        return (
          <Card key={k.client_id} title={k.display_name} sub={`${faden.length} Nachrichten`}>
            {faden.length === 0 ? (
              <Empty title="Noch keine Nachrichten" />
            ) : (
              <div className="cp-stapel" style={{ gap: 6, marginBottom: 10 }}>
                {faden.map(n => (
                  <div key={n.id} style={{ fontSize: 12 }}>
                    <span className="cp-monospace" style={{ color: 'var(--fg-subtle)', fontSize: 10 }}>
                      {zeitpunkt(n.sent_at)} ·{' '}
                    </span>
                    <Pill variant={n.sender_id === stand.userId ? 'acc' : undefined}>
                      {n.sender_id === stand.userId ? 'Coach' : k.display_name}
                    </Pill>{' '}
                    {n.body}
                    {n.read_at === null && n.sender_id !== stand.userId && (
                      <Pill variant="warn">ungelesen</Pill>
                    )}
                  </div>
                ))}
              </div>
            )}
            <form action={nachrichtSenden} className="cp-formular">
              <input type="hidden" name="client_id" value={k.client_id} />
              <input type="hidden" name="pfad" value="/?tab=messages" />
              <label>
                Antwort
                <textarea name="body" rows={2} required />
              </label>
              <button className="cp-knopf cp-knopf-primaer" type="submit">Senden</button>
            </form>
          </Card>
        )
      })}
    </div>
  )
}
