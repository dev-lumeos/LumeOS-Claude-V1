// Check-ins: die Queue und der Ein-Bildschirm-Review (F-06 5.3).
// Sortierung nach Zustand (eingereicht zuerst), je Einreichung die
// Antworten, der Prefill-Schnappschuss, die deterministischen Befunde
// und der Antwort-Composer — kein Tab-Wechsel noetig.
import { Card, Empty, Pill } from '@lumeos/ui'
import type { Checkin, PortalStand } from '../lib/daten'
import { checkinBefunde } from '../lib/analyse'
import { checkinAnlegen, checkinReviewen } from '../lib/aktionen'
import { datum, zeitpunkt, wert } from '../lib/format'

const REIHENFOLGE: Record<Checkin['status'], number> = {
  submitted: 0, pending: 1, missed: 2, reviewed: 3,
}

export function TabCheckins({ stand }: { stand: PortalStand }) {
  const namen = new Map(stand.klienten.map(k => [k.client_id, k.display_name]))
  const sortiert = [...stand.checkins].sort(
    (a, b) => REIHENFOLGE[a.status] - REIHENFOLGE[b.status] || b.due_date.localeCompare(a.due_date),
  )

  // Letztes reviewtes Gewicht je Klient — Bezugswert der Befunde.
  const letztesGewicht = new Map<string, number>()
  for (const c of stand.checkins) {
    if (c.status !== 'reviewed') continue
    const g = c.client_data['gewicht_kg']
    if (typeof g === 'number' && !letztesGewicht.has(c.client_id)) {
      letztesGewicht.set(c.client_id, g)
    }
  }

  return (
    <div className="cp-stapel">
      {sortiert.length === 0 && (
        <Card title="Check-ins">
          <Empty title="Keine Check-ins" sub="Unten einen neuen anlegen — der Klient fuellt ihn in apps/web aus." />
        </Card>
      )}

      {sortiert.map(c => (
        <CheckinKarte
          key={c.id}
          checkin={c}
          name={namen.get(c.client_id) ?? c.client_id}
          vorherGewicht={letztesGewicht.get(c.client_id)}
        />
      ))}

      <Card title="Check-in anlegen" sub="Faelligkeit ab heute; der Klient bekommt ihn in seiner Ansicht">
        <form action={checkinAnlegen} className="cp-formular cp-grid cp-grid-3">
          <input type="hidden" name="pfad" value="/?tab=workflows" />
          <label>
            Athlet
            <select name="client_id" required>
              {stand.klienten.filter(k => k.status === 'active').map(k => (
                <option key={k.client_id} value={k.client_id}>{k.display_name}</option>
              ))}
            </select>
          </label>
          <label>
            Vorlage
            <select name="template_id">
              <option value="">ohne Vorlage</option>
              {stand.templates.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.cadence})</option>
              ))}
            </select>
          </label>
          <label>
            Faellig in Tagen
            <input name="faellig_in" type="number" min={0} max={60} defaultValue={7} />
          </label>
          <div><button className="cp-knopf cp-knopf-primaer" type="submit">Anlegen</button></div>
        </form>
      </Card>
    </div>
  )
}

function CheckinKarte({
  checkin, name, vorherGewicht,
}: {
  checkin: Checkin
  name: string
  vorherGewicht?: number
}) {
  const befunde = checkin.status === 'submitted'
    ? checkinBefunde(checkin.client_data, vorherGewicht)
    : []

  return (
    <Card
      title={`${name} · faellig ${datum(checkin.due_date)}`}
      sub={checkin.submitted_at ? `eingereicht ${zeitpunkt(checkin.submitted_at)}` : undefined}
      actions={
        <Pill variant={checkin.status === 'submitted' ? 'warn' : checkin.status === 'reviewed' ? 'pos' : undefined}>
          {checkin.status}
        </Pill>
      }
    >
      <div className="cp-grid cp-grid-2">
        <div>
          <p className="v2-eyebrow">Antworten des Klienten</p>
          {Object.keys(checkin.client_data).length === 0 ? (
            <p className="cp-hinweis">Noch nichts eingereicht.</p>
          ) : (
            <div className="cp-tabelle-huelle">
              <table className="cp-tabelle">
                <tbody>
                  {Object.entries(checkin.client_data).map(([k, v]) => (
                    <tr key={k}><td>{k}</td><td className="cp-monospace">{wert(v)}</td></tr>
                  ))}
                  {checkin.client_note && (
                    <tr><td>Notiz</td><td>{checkin.client_note}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {befunde.length > 0 && (
            <>
              <p className="v2-eyebrow" style={{ marginTop: 10 }}>Befunde (Wert gegen Schwelle)</p>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12 }}>
                {befunde.map(b => <li key={b.feld}>{b.text}</li>)}
              </ul>
            </>
          )}

          {Object.keys(checkin.auto_data).length > 0 && (
            <>
              <p className="v2-eyebrow" style={{ marginTop: 10 }}>Prefill beim Anlegen (nach Sichtmatrix)</p>
              <div className="cp-diff">{JSON.stringify(checkin.auto_data, null, 1)}</div>
            </>
          )}
        </div>

        <div>
          {checkin.status === 'submitted' ? (
            <form action={checkinReviewen} className="cp-formular">
              <input type="hidden" name="id" value={checkin.id} />
              <input type="hidden" name="pfad" value="/?tab=workflows" />
              <label>
                Feedback an den Klienten
                <textarea name="feedback" rows={4} required placeholder="Lief gut · aendern · beobachten" />
              </label>
              <label>
                Interne Notiz (sieht der Klient nicht)
                <textarea name="notizen" rows={2} />
              </label>
              <button className="cp-knopf cp-knopf-primaer" type="submit">Review abschliessen</button>
              <p className="cp-hinweis">
                Die meisten Wochen ist die Antwort „halten" — eine fachliche
                Aenderung geht als Vorschlag aus der Klientenakte.
              </p>
            </form>
          ) : checkin.status === 'reviewed' ? (
            <>
              <p className="v2-eyebrow">Feedback</p>
              <p style={{ fontSize: 12, margin: '4px 0' }}>{checkin.coach_feedback ?? '—'}</p>
              {checkin.coach_notes && (
                <>
                  <p className="v2-eyebrow" style={{ marginTop: 8 }}>Interne Notiz</p>
                  <p style={{ fontSize: 12, margin: '4px 0', color: 'var(--fg-muted)' }}>{checkin.coach_notes}</p>
                </>
              )}
              <p className="cp-hinweis">Reviewt {zeitpunkt(checkin.reviewed_at)}.</p>
            </>
          ) : (
            <p className="cp-hinweis">Wartet auf die Einreichung des Klienten.</p>
          )}
        </div>
      </div>
    </Card>
  )
}
