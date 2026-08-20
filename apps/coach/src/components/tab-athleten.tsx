// Athletes: die Liste. Je Athlet der Beziehungsstand, die sieben
// Sichtstufen (vom Klienten vergeben — hier nur lesbar) und der Weg in
// die Akte. Keine Attention-Scores, keine Ampeln (T7).
import { Card, Empty, Pill } from '@lumeos/ui'
import { MODULE, MODUL_LABEL, sichtVon, type PortalStand } from '../lib/daten'
import { datum } from '../lib/format'

export function TabAthleten({ stand }: { stand: PortalStand }) {
  if (stand.klienten.length === 0) {
    return (
      <Card title="Athleten">
        <Empty title="Keine Athleten" sub="Es existiert keine Beziehung — Anbahnung ist T3 (offen)." />
      </Card>
    )
  }

  return (
    <Card title="Athleten" sub={`${stand.klienten.length} Beziehungen · Sicht vergibt der Klient`}>
      <div className="cp-tabelle-huelle">
        <table className="cp-tabelle">
          <thead>
            <tr>
              <th>Athlet</th>
              <th>Status</th>
              <th>Sicht je Modul</th>
              <th>Akte</th>
            </tr>
          </thead>
          <tbody>
            {stand.klienten.map(k => {
              const rechte = stand.rechte.find(r => r.client_id === k.client_id)
              return (
                <tr key={k.relationship_id}>
                  <td>
                    <div>{k.display_name}</div>
                    <div className="cp-monospace" style={{ color: 'var(--fg-subtle)', fontSize: 10 }}>{k.email}</div>
                  </td>
                  <td>
                    <Pill variant={k.status === 'active' ? 'pos' : undefined}>
                      {k.status === 'active' ? `aktiv · ${datum(k.started_at)}` : k.status}
                    </Pill>
                  </td>
                  <td>
                    <div className="cp-zeile">
                      {MODULE.map(m => {
                        const sicht = sichtVon(rechte, m)
                        return (
                          <Pill
                            key={m}
                            variant={sicht === 'full' ? 'pos' : sicht === 'summary' ? 'acc' : undefined}
                          >
                            {MODUL_LABEL[m]}: {sicht}
                          </Pill>
                        )
                      })}
                      {!rechte && <span className="cp-hinweis">keine Freigaben</span>}
                    </div>
                  </td>
                  <td><a className="cp-knopf" href={`/athlet/${k.client_id}`}>Oeffnen</a></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
