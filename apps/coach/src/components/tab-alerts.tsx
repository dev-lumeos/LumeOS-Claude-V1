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
// G-409: der Linkhelfer entscheidet, wohin ein Klick fuehrt.
import { wegZuFilter, wegZuReiter, type DraftLage } from './draft/wege'
// `[cmd]` **G-582: der Alarm bekommt seinen Aufrufer.**
import { alertStatusSetzen, alarmAusloesen } from '../lib/aktionen'
import { zeitpunkt } from '../lib/format'

type Filter = 'offen' | 'alle' | 'done'

export function TabAlerts({ stand, filter, lage = null }: {
  stand: PortalStand
  /** Aus `?stand=`. Vorgabe „offen" — ein Coach oeffnet die Liste,
   *  um zu sehen, was ansteht, nicht um Erledigtes zu lesen. */
  filter: Filter
  /** In welcher Fassung dieser Reiter laeuft — G-409. */
  lage?: DraftLage
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
        {/* `[cmd]` **G-582: hier stand *„ein automatischer Erzeuger
            ist eigener Bauauftrag"*** — er fehlt weiter, **aber von
            Hand geht es jetzt.** `[read]` **Das Formular steht auch
            im Leerzustand**, sonst waere es genau dann unerreichbar,
            wenn man den ersten Alarm braucht. */}
        <Empty title="Keine Alerts" sub="Eintraege entstehen heute aus den Seeds und von Hand; ein automatischer Erzeuger ist eigener Bauauftrag." />
        <AlarmFormular stand={stand} lage={lage} />
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
              href={wegZuFilter(lage, 'alerts', `&stand=${k}`)}
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
                      <input type="hidden" name="pfad"
                value={wegZuReiter(lage, 'alerts')} />
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

      {/* ══ G-582: einen Alarm von Hand ausloesen ═════════════════
          `[cmd]` **`coach.raise_alert` hatte null Aufrufer** — der
          Reiter zeigte Alarme, erzeugen konnte sie niemand.

          `[read]` **Hier und nicht am Athletendetail:** das ist die
          Arbeitsliste, auf der ein Coach die Alarme sieht und
          abarbeitet. **Wer einen vermisst, traegt ihn dort nach, wo
          die anderen stehen** — und sieht ihn sofort in derselben
          Liste.

          `[cmd]` **Nur AKTIVE Klienten stehen zur Wahl** — der Rumpf
          verlangt eine aktive eigene Beziehung und wirft sonst
          `42501`. **Eine Auswahl, die garantiert scheitert, waere
          schlimmer als eine kurze.** */}
      <AlarmFormular stand={stand} lage={lage} />

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

/**
 * Einen Alarm von Hand ausloesen — G-582.
 *
 * `[cmd]` **Die Werte kommen aus dem Rumpf von `coach.raise_alert`**
 * (gelesen 2026-10-02), nicht aus dem Mockup: fuenf Alarmarten, fuenf
 * Schweregrade. **Dieselben Listen stehen in `alerts_kind_ck` und
 * `alerts_severity_ck`.**
 *
 * `[read]` **Kein `'use client'`** — wie der ganze Reiter. Das
 * Formular ist ein `<form action={…}>` auf eine Server-Aktion; ein
 * Wert-Import ueber die Client-Grenze ergaebe HTTP 500 (A-30).
 */
function AlarmFormular({ stand, lage }: {
  stand: PortalStand
  lage: DraftLage
}) {
  // `[cmd]` **Der Rumpf verlangt `status = 'active'`** — ein
  // eingeladener oder beendeter Klient wirft `42501`.
  const waehlbar = stand.klienten.filter(k => k.status === 'active')

  if (waehlbar.length === 0) {
    // `[read]` **E-72: ein benannter Leerhinweis, kein leeres
    // Formular.** **Ohne aktive Betreuung gibt es niemanden, fuer den
    // ein Alarm zulaessig waere** — und der Satz sagt warum.
    return (
      <div className="cp-fehlt" data-alarm-keine-klienten>
        Kein Athlet in aktiver Betreuung — ein Alarm laesst sich nur
        {' '}fuer eigene Klienten ausloesen
        {' '}(<span className="cp-monospace">coach.relationships</span>,
        {' '}Status <span className="cp-monospace">active</span>).
      </div>
    )
  }

  return (
    <form action={alarmAusloesen} className="cp-zeile" data-alarm-formular
          style={{ marginTop: 14, flexWrap: 'wrap', gap: 6 }}>
      <input type="hidden" name="pfad" value={wegZuReiter(lage, 'alerts')} />

      <select name="client_id" aria-label="Athlet" className="cp-feld"
              data-alarm-klient required>
        {waehlbar.map(k => (
          <option key={k.client_id} value={k.client_id}>{k.display_name}</option>
        ))}
      </select>

      {/* `[cmd]` **Fuenf Arten, aus dem Rumpf** — eine sechste wirft
          `23514`. */}
      <select name="kind" aria-label="Anlass" className="cp-feld"
              data-alarm-art required>
        {([
          ['checkin_overdue', 'Check-in ueberfaellig'],
          ['inactivity', 'Inaktivitaet'],
          ['adherence_low', 'Adherence niedrig'],
          ['progress_stagnation', 'Fortschritt stagniert'],
          ['engagement_low', 'Engagement niedrig'],
        ] as const).map(([w, t]) => <option key={w} value={w}>{t}</option>)}
      </select>

      <select name="severity" aria-label="Schweregrad" className="cp-feld"
              data-alarm-grad defaultValue="medium" required>
        {['info', 'low', 'medium', 'high', 'critical'].map(w => (
          <option key={w} value={w}>{w}</option>
        ))}
      </select>

      <input name="titel" aria-label="Sachverhalt" className="cp-feld"
             data-alarm-titel required maxLength={200}
             placeholder="Sachverhalt — was ist der Fall?"
             style={{ flex: 1, minWidth: 220 }} />

      <button className="cp-knopf" type="submit" data-alarm-ausloesen>
        Alarm anlegen
      </button>

      {/* `[read]` **Die Entdoppelung gehoert an den Knopf**, nicht in
          den Bericht: **die Funktion gibt den bestehenden Alarm
          zurueck**, wenn zu Athlet und Anlass in den letzten 24
          Stunden schon einer offen ist. **Ohne diesen Satz sieht ein
          ausbleibender zweiter Eintrag wie ein Fehler aus.** */}
      <div className="cp-fehlt" data-alarm-entdoppelt
           style={{ flexBasis: '100%', marginTop: 4 }}>
        Besteht zu Athlet und Anlass in den letzten 24 Stunden schon ein
        {' '}offener Alarm, bleibt es bei diesem — es entsteht kein
        {' '}zweiter. Das Modul steht auf
        {' '}<span className="cp-monospace">general</span>: die Funktion
        {' '}setzt es selbst, ein Fachmodul nimmt sie nicht entgegen.
      </div>
    </form>
  )
}
