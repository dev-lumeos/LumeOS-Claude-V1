// Consent: was die Klienten freigegeben haben — fuer den Coach strikt
// lesend (die RLS aus 150 nimmt Schreibzugriffe nur vom Klienten an).
// Dazu die drei Historien: Rechte, Beziehung — append-only, aus
// Triggern, mit Feld-Diff statt JSONB-Rohzeile (Muster G-90).
import { Card, Empty, Pill } from '@lumeos/ui'
import {
  MODULE, MODUL_LABEL, autoApplyVon, sichtVon, unterschied, type PortalStand,
} from '../lib/daten'
import { datum, zeitpunkt } from '../lib/format'

export function TabConsent({ stand }: { stand: PortalStand }) {
  const namen = new Map(stand.klienten.map(k => [k.client_id, k.display_name]))

  return (
    <div className="cp-stapel">
      <Card
        title="Freigaben je Athlet"
        sub="Vergeben vom Klienten in apps/web — hier nur lesbar; der Schreibversuch scheitert an der Policy"
      >
        {stand.rechte.length === 0 ? (
          <Empty title="Keine Freigaben" sub="Ohne Freigabe liest der Coach kein Modul (152)." />
        ) : (
          <div className="cp-tabelle-huelle">
            <table className="cp-tabelle">
              <thead>
                <tr>
                  <th>Athlet</th>
                  {MODULE.map(m => <th key={m}>{MODUL_LABEL[m]}</th>)}
                  <th>Ablauf</th>
                </tr>
              </thead>
              <tbody>
                {stand.rechte.map(r => (
                  <tr key={r.id}>
                    <td>{namen.get(r.client_id) ?? r.client_id}</td>
                    {MODULE.map(m => {
                      const sicht = sichtVon(r, m)
                      const auto = autoApplyVon(r, m)
                      return (
                        <td key={m}>
                          <Pill variant={sicht === 'full' ? 'pos' : sicht === 'summary' ? 'acc' : undefined}>
                            {sicht}
                          </Pill>
                          {auto && <div style={{ fontSize: 10, color: 'var(--fg-muted)' }}>ohne Bestaetigung</div>}
                        </td>
                      )
                    })}
                    <td className="cp-monospace">{r.expires_at ? datum(r.expires_at) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Historie titel="Rechte-Historie" zeilen={stand.rechteLog} namen={namen} />
      <Historie titel="Beziehungs-Historie" zeilen={stand.beziehungsLog} namen={namen} />
    </div>
  )
}

function Historie({
  titel, zeilen, namen,
}: {
  titel: string
  zeilen: PortalStand['rechteLog']
  namen: Map<string, string>
}) {
  return (
    <Card title={titel} sub="Append-only, Trigger-geschrieben — auch der Widerruf hat eine Spur">
      {zeilen.length === 0 ? (
        <Empty title="Keine Eintraege" />
      ) : (
        <div className="cp-tabelle-huelle">
          <table className="cp-tabelle">
            <thead><tr><th>Wann</th><th>Athlet</th><th>Art</th><th>Aenderung</th></tr></thead>
            <tbody>
              {zeilen.map(l => (
                <tr key={l.id}>
                  <td className="cp-monospace">{zeitpunkt(l.changed_at)}</td>
                  <td>{namen.get(l.client_id) ?? l.client_id}</td>
                  <td>{l.change_kind}</td>
                  <td>
                    {unterschied(l.old_value, l.new_value).slice(0, 8).map(u => (
                      <div key={u.feld} style={{ fontSize: 11 }}>
                        {u.feld}: <span className="cp-monospace">{u.von} → {u.zu}</span>
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
