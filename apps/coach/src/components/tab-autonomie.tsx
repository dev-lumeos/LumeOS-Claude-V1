// Autonomy: der Reifegrad des Athleten, gesetzt vom Coach — die zweite
// Achse aus ssot/139. Die RLS laesst nur den Coach schreiben; der
// Klient sieht die Stufen in apps/web, aendern kann er sie nicht.
// Jede Aenderung landet per Trigger in der Historie (150).
// Nicht mit experience_level (Selbstauskunft in profiles) verwechseln.
import { Card, Empty } from '@lumeos/ui'
import { MODULE, MODUL_LABEL, levelVon, unterschied, type PortalStand } from '../lib/daten'
import { autonomieSetzen } from '../lib/aktionen'
import { zeitpunkt } from '../lib/format'

export function TabAutonomie({ stand }: { stand: PortalStand }) {
  const namen = new Map(stand.klienten.map(k => [k.client_id, k.display_name]))

  return (
    <div className="cp-stapel">
      {stand.autonomie.length === 0 && (
        <Card title="Autonomy">
          <Empty title="Keine Autonomy-Zeilen" sub="Eine Zeile entsteht je Beziehung; die Seeds legen sie an." />
        </Card>
      )}

      {stand.autonomie.map(z => (
        <Card
          key={z.id}
          title={`${namen.get(z.client_id) ?? z.client_id} · Reifegrad je Modul`}
          sub="Stufen 1-5, Safety 1-3 — Einschaetzung des Coaches, keine Selbstauskunft"
        >
          <form action={autonomieSetzen} className="cp-formular">
            <input type="hidden" name="client_id" value={z.client_id} />
            <input type="hidden" name="pfad" value="/?tab=autonomy" />
            <div className="cp-grid cp-grid-4">
              {MODULE.map(m => (
                <label key={m}>
                  {MODUL_LABEL[m]}
                  <select name={`${m}_level`} defaultValue={levelVon(z, m) ?? 2}>
                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>
              ))}
              <label>
                Safety
                <select name="safety_level" defaultValue={z.safety_level}>
                  {[1, 2, 3].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
            </div>
            <label>
              Notiz
              <input name="coach_note" defaultValue={z.coach_note ?? ''} />
            </label>
            <button className="cp-knopf cp-knopf-primaer" type="submit">Speichern</button>
            <p className="cp-hinweis">
              Die Stufen werden gezeigt und protokolliert; eine Wirkung auf
              Ausfuehrungen gibt es noch nicht (Ausfuehrer fehlt, ssot/139).
            </p>
          </form>
        </Card>
      ))}

      <Card title="Historie" sub="Trigger-geschrieben, append-only — je Aenderung nur die betroffenen Felder">
        {stand.autonomieLog.length === 0 ? (
          <Empty title="Keine Aenderungen protokolliert" />
        ) : (
          <div className="cp-tabelle-huelle">
            <table className="cp-tabelle">
              <thead><tr><th>Wann</th><th>Athlet</th><th>Art</th><th>Aenderung</th></tr></thead>
              <tbody>
                {stand.autonomieLog.map(l => (
                  <tr key={l.id}>
                    <td className="cp-monospace">{zeitpunkt(l.changed_at)}</td>
                    <td>{namen.get(l.client_id) ?? l.client_id}</td>
                    <td>{l.change_kind}</td>
                    <td>
                      {unterschied(l.old_value, l.new_value).map(u => (
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
    </div>
  )
}
