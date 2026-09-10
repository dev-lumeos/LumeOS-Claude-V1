// Check-ins: die Queue und der Ein-Bildschirm-Review (F-06 5.3).
// Sortierung nach Zustand (eingereicht zuerst), je Einreichung die
// Antworten, der Prefill-Schnappschuss, die deterministischen Befunde
// und der Antwort-Composer — kein Tab-Wechsel noetig.
// `[cmd]` **KEIN `'use client'`** — siehe `tab-alerts.tsx`: ein
// Wert-Import aus `lib/aktionen.ts` oder `lib/daten.ts` ueber die
// Client-Grenze zieht `next/headers` ins Browserbuendel.
import { Card, Empty, Pill } from '@lumeos/ui'
import type { Checkin, PortalStand } from '../lib/daten'
// G-409: der Linkhelfer entscheidet, wohin ein Klick fuehrt.
import { wegZuFilter, wegZuReiter, type DraftLage } from './draft/wege'
import { checkinBefunde } from '../lib/analyse'
import { checkinAnlegen, checkinReviewen } from '../lib/aktionen'
import { datum, zeitpunkt, wert } from '../lib/format'

const REIHENFOLGE: Record<Checkin['status'], number> = {
  submitted: 0, pending: 1, missed: 2, reviewed: 3,
}

// ══ G-402/A3: gegen `CheckinList.tsx` gemessen (13.470 B) ══════════
//
// `[cmd]` **Das Altrepo fuehrte je Zeile:** `client_name`,
// `due_date`, `status`, `week_number`, `client_data`, `auto_data`,
// `coach_notes` — **dazu einen Statusfilter** mit vier Staenden
// (`all`, `pending`, `client_submitted`, `completed`).
//
// `[cmd]` **`coach.checkins` fuehrt 16 Spalten** — **kein
// `week_number`**, gemessen. `[read]` **Die Woche liesse sich aus
// `due_date` rechnen**, aber gegen welchen Anfang? **Ohne
// Programmstart ist „Woche 4" eine Behauptung.**
//
// `[read]` **Gebaut ist der Filter** — er fehlte, und er ist der
// Unterschied zwischen einer Liste und einer Arbeitsliste.
export function TabCheckins({ stand, heute, filter, lage = null }: {
  stand: PortalStand
  /** Serverseitig bestimmt (G-390) — nie im Browser gerechnet. */
  heute: string
  /** Aus `?stand=`. */
  filter: 'offen' | 'alle' | 'reviewed'
  /** In welcher Fassung dieser Reiter laeuft — G-409. */
  lage?: DraftLage
}) {
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

  const gezaehlt = {
    pending: stand.checkins.filter(c => c.status === 'pending').length,
    submitted: stand.checkins.filter(c => c.status === 'submitted').length,
    reviewed: stand.checkins.filter(c => c.status === 'reviewed').length,
  }
  // `[read]` **„Offen" heisst: noch nicht durchgesehen** — faellig
  // ODER eingereicht. **Das ist die Arbeit**, alles andere ist Archiv.
  const gefiltert = sortiert.filter(c => filter === 'alle'
    ? true
    : filter === 'reviewed' ? c.status === 'reviewed' : c.status !== 'reviewed')

  // `[cmd]` **Ueberfaellig heisst: Faelligkeit vor heute und noch
  // nicht eingereicht.** `[read]` **Gegen den Stichtag vom Server**,
  // nicht gegen die Uhr des Browsers.
  const ueberfaellig = stand.checkins.filter(
    c => c.status === 'pending' && c.due_date < heute).length

  return (
    <div className="cp-stapel">
      <Card
        title="Check-ins"
        sub={`${gezaehlt.pending} faellig · ${gezaehlt.submitted} eingereicht · `
          + `${gezaehlt.reviewed} durchgesehen`}
        actions={(
          <div className="cp-filter" role="group" aria-label="Nach Status filtern">
            {([['offen', `Offen (${gezaehlt.pending + gezaehlt.submitted})`],
               ['reviewed', `Durchgesehen (${gezaehlt.reviewed})`],
               ['alle', 'Alle']] as const).map(([k, l]) => (
              <a
                key={k}
                className={`cp-filter-knopf${filter === k ? ' cp-aktiv' : ''}`}
                href={wegZuFilter(lage, 'checkins', `&stand=${k}`)}
                aria-current={filter === k ? 'page' : undefined}
              >
                {l}
              </a>
            ))}
          </div>
        )}
      >
        {ueberfaellig > 0
          ? (
            <div className="cp-hinweis" style={{ color: 'var(--warn)' }}>
              {`${ueberfaellig} ${ueberfaellig === 1 ? 'Check-in ist' : 'Check-ins sind'} `}
              ueberfaellig — Faelligkeit vor {heute}, noch nicht eingereicht.
            </div>
          )
          : (
            <div className="cp-hinweis">
              Nichts ueberfaellig — alle faelligen Check-ins liegen ab {heute}.
            </div>
          )}
        {/* ══ A3: was die Spalte nicht hergibt ════════════════════ */}
        <div className="cp-fehlt">
          Ohne Spalte: <strong>Wochennummer</strong> —
          {' '}<span className="cp-monospace">coach.checkins</span> fuehrt 16
          {' '}Spalten, keine davon. Aus <span className="cp-monospace">due_date</span>
          {' '}liesse sie sich rechnen, aber ohne Programmstart waere &bdquo;Woche 4&ldquo;
          {' '}eine Behauptung. <strong>Und die Rueckmeldung</strong> schreibt
          {' '}der Coach heute in <span className="cp-monospace">coach_notes</span>;
          {' '}<span className="cp-monospace">coach_feedback</span> steht als
          {' '}Spalte, wird aber von keinem Weg gefuellt.
        </div>
      </Card>

      {sortiert.length === 0 && (
        <Card title="Check-ins">
          <Empty title="Keine Check-ins" sub="Unten einen neuen anlegen — der Klient fuellt ihn in apps/web aus." />
        </Card>
      )}

      {gefiltert.map(c => (
        <CheckinKarte
          key={c.id}
          checkin={c}
          name={namen.get(c.client_id) ?? c.client_id}
          vorherGewicht={letztesGewicht.get(c.client_id)}
          lage={lage}
        />
      ))}

      <Card title="Check-in anlegen" sub="Faelligkeit ab heute; der Klient bekommt ihn in seiner Ansicht">
        <form action={checkinAnlegen} className="cp-formular cp-grid cp-grid-3">
          <input type="hidden" name="pfad"
                value={wegZuReiter(lage, 'workflows')} />
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
  checkin, name, vorherGewicht, lage,
}: {
  checkin: Checkin
  name: string
  vorherGewicht?: number
  /** G-409: der Rueckweg nach dem Reviewen. */
  lage: DraftLage
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
              <input type="hidden" name="pfad"
                value={wegZuReiter(lage, 'workflows')} />
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
                Die meisten Wochen ist die Antwort „halten&quot; — eine fachliche
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
