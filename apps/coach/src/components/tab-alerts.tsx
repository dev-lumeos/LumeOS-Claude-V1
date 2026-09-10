// Alerts: die Arbeitsliste — G-402/A4.
//
// Bewusst ohne Schweregrad und ohne Ampel: jeder Eintrag traegt den
// Sachverhalt und die Zahlen dahinter (154). Sortiert nach Status und
// Datum; Dringlichkeitsstufen sind T7.
//
// ══ GEGEN `AlertsPanel.tsx` GEMESSEN (7.569 B) ══════════════════════
//
// `[cmd]` **Das Altrepo fuehrte je Alarm:** `title`, `message`,
// `client_name`, `created_at`, `category`, `level`, `is_read`,
// `is_dismissed`, `data`.
//
// `[cmd]` **`coach.alerts` fuehrt 13 Spalten** — und **keine fuer die
// Stufe**: gemessen in `information_schema`. `[read]` **Das Altrepos
// `level: critical|warning|info` hat hier kein Zuhause**, und eine
// Stufe zu erfinden waere eine Bewertung, die T7 offen laesst.
//
// `[cmd]` **`category` fehlt ebenso** — `module` ist das Naechste,
// benennt aber das Fachgebiet (nutrition, training), nicht den Anlass
// (Inaktivitaet, Adherence, Sicherheit).
//
// `[read]` **Gebaut ist deshalb, was die Spalten tragen:** Filter
// nach Status, Zaehler je Stand, Gruppierung nach Modul — und das
// Quittieren, das es schon gab.
// `[cmd]` **KEIN `'use client'`** — `lib/aktionen.ts` ist eine
// Server-Aktion und `lib/daten.ts` laedt `next/headers`. **Ein
// Wert-Import ueber die Client-Grenze ergab HTTP 500 auf jeder
// Seite** (gemessen, `tsc` blieb gruen). `[read]` **Der Filter reist
// deshalb in der Adresse**, wie die Reiter auch.
import { Card, Empty, Pill } from '@lumeos/ui'
import type { PortalStand } from '../lib/daten'
import { alertStatusSetzen } from '../lib/aktionen'
import { zeitpunkt } from '../lib/format'

type Filter = 'offen' | 'alle' | 'done'

export function TabAlerts({ stand, filter }: {
  stand: PortalStand
  /** Aus `?stand=`. Vorgabe „offen" — ein Coach oeffnet die Liste,
   *  um zu sehen, was ansteht, nicht um Erledigtes zu lesen. */
  filter: Filter
}) {
  const namen = new Map(stand.klienten.map(k => [k.client_id, k.display_name]))
  const reihenfolge = { open: 0, read: 1, done: 2 } as const
  const sortiert = [...stand.alerts].sort(
    (a, b) => reihenfolge[a.status] - reihenfolge[b.status] || b.created_at.localeCompare(a.created_at),
  )

  const gezaehlt = {
    open: stand.alerts.filter(a => a.status === 'open').length,
    read: stand.alerts.filter(a => a.status === 'read').length,
    done: stand.alerts.filter(a => a.status === 'done').length,
  }
  const gefiltert = sortiert.filter(a => filter === 'alle'
    ? true
    : filter === 'done' ? a.status === 'done' : a.status !== 'done')

  if (sortiert.length === 0) {
    return (
      <Card title="Alerts">
        <Empty title="Keine Alerts" sub="Eintraege entstehen heute aus den Seeds; ein automatischer Erzeuger ist eigener Bauauftrag." />
      </Card>
    )
  }

  return (
    <Card
      title="Alerts"
      sub={`${gezaehlt.open} offen · ${gezaehlt.read} gelesen · ${gezaehlt.done} erledigt`}
      actions={(
        <div className="cp-filter" role="group" aria-label="Nach Status filtern">
          {([['offen', `Offen (${gezaehlt.open + gezaehlt.read})`],
             ['done', `Erledigt (${gezaehlt.done})`],
             ['alle', 'Alle']] as const).map(([k, l]) => (
            <a
              key={k}
              className={`cp-filter-knopf${filter === k ? ' cp-aktiv' : ''}`}
              href={`/?bereich=alerts&stand=${k}`}
              aria-current={filter === k ? 'page' : undefined}
            >
              {l}
            </a>
          ))}
        </div>
      )}
    >
      {gefiltert.length === 0 ? (
        <Empty
          title="Nichts in dieser Auswahl"
          sub={`${sortiert.length} Alerts insgesamt — keiner passt zum Filter.`}
        />
      ) : (
      <div className="cp-tabelle-huelle">
        <table className="cp-tabelle">
          <thead>
            <tr>
              <th>Wann</th><th>Athlet</th><th>Modul</th><th>Sachverhalt</th><th>Zahlen</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {gefiltert.map(a => (
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
      )}

      {/* ══ Was fehlt, und warum ═══════════════════════════════════
          `[read]` **E-72:** eine fehlende Spalte wird benannt, sonst
          sucht der naechste Leser den Fehler im Code. */}
      <div className="cp-fehlt">
        Ohne Spalte: <strong>Stufe</strong> (critical / warning / info)
        {' '}und <strong>Kategorie</strong> — <span className="cp-monospace">coach.alerts</span>
        {' '}fuehrt 13 Spalten, keine davon. Ein Filter nach Stufe braucht
        {' '}erst die Stufe. <strong>Und der Erzeuger fehlt:</strong> die
        {' '}Eintraege stammen aus den Seeds;
        {' '}<span className="cp-monospace">alertGenerator.ts</span> (12,9 KB)
        {' '}pruefte im Vorgaenger fuenf Anlaesse — was er braeuchte, steht
        {' '}im Bericht zu G-402.
      </div>
    </Card>
  )
}
