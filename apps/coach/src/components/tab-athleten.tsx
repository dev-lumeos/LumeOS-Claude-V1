// Athletes: die Liste — G-402/A1.
//
// **Tom, 2026-09-08:** *„gib ihm alles, ich will endlich resultate
// sehen."* **Und aus dem Auftrag:** *„Nicht Namen mit Datum —
// Avatar, Name, Plan, letzte Sitzung, Alertzahl, Compliance FARBIG,
// klickbar."*
//
// ══ GEGEN WAS GEMESSEN WURDE ════════════════════════════════════════
//
// `[cmd]` **`ClientList.tsx` aus dem Vorgaengerrepo, 13.123 B**,
// Spalte fuer Spalte gelesen:
//
//     Avatar + Statuspunkt   Ziel      Tags
//     Name                   Status    Alerts
//     E-Mail                 unread    $/Mo
//     dazu: Suche, Statusfilter, Sortierung, "Neu anlegen"
//
// `[cmd]` **Gebaut waren vier Felder** (Name, E-Mail, Status, Sicht
// je Modul). `[read]` **Struktur uebernommen, kein Code.**
//
// ══ WAS NICHT GEHT, UND WARUM ═══════════════════════════════════════
//
// `[cmd]` **Gemessen mit einer Suche ueber ALLE Schemata nach
// `goal|tag|fee|monthly`:** `coach.relationships` fuehrt 17 Spalten,
// **keine davon traegt Ziel, Tags oder Gebuehr.**
//
// `[cmd]` **Zwei Treffer waren Namensvetter:**
// `public.profiles.nutrition_goal` ist das Ernaehrungsziel (nicht das
// Coachingziel), `supplements.daily_intake_summary.compliance_pct`
// die Einnahmetreue (nicht die Trainingsadherence). `[read]`
// **Gleicher Name, andere Sache** — beide bleiben weg.
//
// `[read]` **Und „Compliance farbig" braucht eine Adherence je
// Klient** — die rechnete im Altrepo `services/adherence.ts`
// (20,8 KB) aus Plan gegen Ist. **Es gibt weder Plan noch Rechnung**,
// also zeigt die Liste statt einer erfundenen Prozentzahl die
// Groessen, die es gibt: offene Alerts und die letzte Sitzung.
// ══ G-402: KEIN 'use client' ═══════════════════════════════════════
//
// `[cmd]` **Der erste Anlauf setzte `'use client'`** — und der Server
// antwortete auf JEDER Seite mit HTTP 500:
//
//     You're importing a component that needs next/headers.
//     packages/shared/src/supabase/session.ts:15
//
// `[cmd]` **Die Ursache:** diese Datei holt `MODULE`, `MODUL_LABEL`
// und `sichtVon` als WERTE aus `lib/daten.ts`, und die laedt
// `createSessionClient` aus `@lumeos/shared/session`. **Ein
// Wert-Import ueber die `'use client'`-Grenze zieht den ganzen
// Server-Baum ins Browserbuendel** (derselbe Befund wie G-388/G-74).
//
// `[read]` **`tsc` bleibt dabei gruen** — der Typ stimmt ja. **Nur
// der Aufruf faellt um.**
//
// `[read]` **Also serverseitig gerendert, und Suche und Filter reisen
// in der Adresse** (`?suche=` und `?stand=`). **Das ist ohnehin die
// Bauart des Portals:** die Reiter sind Verweise, kein Client-Zustand.
import { Card, Empty, Pill } from '@lumeos/ui'

import { MODULE, MODUL_LABEL, sichtVon, type PortalStand } from '../lib/daten'
import { datum } from '../lib/format'

/** Die Initialen, wie im Altrepo (`Avatar name={client_name}`). */
function initialen(name: string): string {
  const teile = name.trim().split(/\s+/).filter(Boolean)
  if (teile.length === 0) return '?'
  if (teile.length === 1) return teile[0].slice(0, 2).toUpperCase()
  return (teile[0][0] + teile[teile.length - 1][0]).toUpperCase()
}

/**
 * Wie viele Tage her.
 *
 * `[read]` **Kein `new Date()` in der Rechnung selbst** — der
 * Stichtag kommt herein. **G-390:** eine Funktion, die keinen
 * Zeitpunkt annimmt, kann keinen falschen annehmen.
 */
function tageSeit(iso: string | undefined, heute: string): number | null {
  if (!iso) return null
  const ms = Date.parse(`${heute}T00:00:00Z`) - Date.parse(`${iso}T00:00:00Z`)
  return Number.isFinite(ms) ? Math.max(0, Math.round(ms / 86400000)) : null
}

type Filter = 'alle' | 'active' | 'invited' | 'ended'

export function TabAthleten({ stand, heute, suche, filter }: {
  stand: PortalStand
  /** Serverseitig bestimmt — nie im Browser gerechnet. */
  heute: string
  /** Aus `?suche=` — der Server filtert, nicht der Browser. */
  suche: string
  /** Aus `?stand=`. */
  filter: Filter
}) {

  if (stand.klienten.length === 0) {
    return (
      <Card title="Athleten">
        <Empty
          title="Keine Athleten"
          sub="Es existiert keine Beziehung — Anbahnung ist T3 (offen)."
        />
      </Card>
    )
  }

  const begriff = suche.trim().toLowerCase()
  const gefiltert = stand.klienten.filter(k => {
    if (filter !== 'alle' && k.status !== filter) return false
    if (!begriff) return true
    return k.display_name.toLowerCase().includes(begriff)
      || k.email.toLowerCase().includes(begriff)
  })

  const aktive = stand.klienten.filter(k => k.status === 'active').length

  return (
    <Card
      title="Athleten"
      sub={`${stand.klienten.length} Beziehungen · ${aktive} aktiv · Sicht vergibt der Klient`}
      actions={(
        <div className="cp-werkzeug">
          {/* `[read]` **Suche wie im Altrepo** — dort ueber Name, Ziel
              und Tag. **Hier ueber Name und E-Mail:** Ziel und Tags
              hat keine Spalte. */}
          {/* `[read]` **Ein Formular, kein Client-Zustand** — es
              schickt `?suche=` an denselben Bereich zurueck, und der
              Server filtert. **Ohne JavaScript funktioniert es
              auch.** */}
          <form className="cp-werkzeug" method="get" action="/">
            <input type="hidden" name="bereich" value="klienten" />
            <input type="hidden" name="stand" value={filter} />
            <input
              className="cp-suche"
              type="search"
              name="suche"
              placeholder="Name oder E-Mail…"
              defaultValue={suche}
              aria-label="Athleten durchsuchen"
            />
          </form>
          <div className="cp-filter" role="group" aria-label="Nach Status filtern">
            {([['alle', 'Alle'], ['active', 'Aktiv'],
               ['invited', 'Eingeladen'], ['ended', 'Beendet']] as const).map(([k, l]) => (
              <a
                key={k}
                className={`cp-filter-knopf${filter === k ? ' cp-aktiv' : ''}`}
                href={`/?bereich=klienten&stand=${k}${suche ? `&suche=${encodeURIComponent(suche)}` : ''}`}
                aria-current={filter === k ? 'page' : undefined}
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      )}
    >
      {gefiltert.length === 0 ? (
        <Empty
          title="Kein Athlet passt"
          sub={`${stand.klienten.length} Beziehungen, keine trifft „${suche}" mit diesem Filter.`}
        />
      ) : (
        <div className="cp-athleten">
          {gefiltert.map(k => {
            const rechte = stand.rechte.find(r => r.client_id === k.client_id)
            const offene = stand.alerts.filter(
              a => a.client_id === k.client_id && a.status !== 'done').length
            const sitzung = stand.letzteSitzung[k.client_id]
            const tage = tageSeit(sitzung, heute)
            const trainingFrei = sichtVon(rechte, 'training') === 'full'
            return (
              <a key={k.relationship_id} className="cp-athlet-zeile" href={`/athlet/${k.client_id}`}>
                {/* Avatar mit Statuspunkt — wie ClientList.tsx:145 */}
                <span className="cp-avatar-huelle">
                  <span className="cp-avatar" aria-hidden="true">{initialen(k.display_name)}</span>
                  <span
                    className="cp-status-punkt"
                    data-stand={offene > 0 ? 'alarm' : k.status}
                    aria-hidden="true"
                  />
                </span>

                <span className="cp-athlet-name">
                  <span className="cp-athlet-titel">{k.display_name}</span>
                  <span className="cp-athlet-mail cp-monospace">{k.email}</span>
                </span>

                {/* Die letzte Sitzung — nur wo `training` freigegeben ist.
                    `[read]` **E-72: kein nackter Strich** — der Grund
                    steht daneben. */}
                <span className="cp-athlet-sitzung">
                  {!trainingFrei
                    ? <span className="cp-hinweis">Training nicht freigegeben</span>
                    : tage === null
                      ? <span className="cp-hinweis">keine Einheit erfasst</span>
                      : (
                        <>
                          <span className="cp-monospace">{datum(sitzung!)}</span>
                          <span className="cp-dim">{tage === 0 ? 'heute' : `vor ${tage} d`}</span>
                        </>
                      )}
                </span>

                {offene > 0 && (
                  <Pill variant="warn">{`${offene} ${offene === 1 ? 'Alert' : 'Alerts'}`}</Pill>
                )}

                <Pill variant={k.status === 'active' ? 'pos' : undefined}>
                  {k.status === 'active'
                    ? `aktiv · ${datum(k.started_at)}`
                    : k.status === 'invited' ? 'eingeladen' : 'beendet'}
                </Pill>

                {/* Die Sichtstufen je Modul — was der Klient freigegeben
                    hat. `[read]` **Der Coach vergibt sie nicht**, er
                    liest sie nur (RLS aus 152). */}
                <span className="cp-athlet-sicht">
                  {MODULE.map(m => {
                    const s = sichtVon(rechte, m)
                    if (s === 'none') return null
                    return (
                      <span
                        key={m}
                        className="cp-sicht-marke"
                        data-sicht={s}
                        title={`${MODUL_LABEL[m]}: ${s}`}
                      >
                        {MODUL_LABEL[m]}
                      </span>
                    )
                  })}
                  {!rechte && <span className="cp-hinweis">keine Freigaben</span>}
                </span>
              </a>
            )
          })}
        </div>
      )}

      {/* ══ Was die Liste NICHT zeigt, und warum ═══════════════════
          `[read]` **E-72 im Grossen:** eine Spalte, die fehlt, wird
          benannt — sonst sucht der naechste Leser den Fehler im
          Code. */}
      <div className="cp-fehlt">
        Ohne Spalte: <strong>Ziel</strong> und <strong>Tags</strong>
        {' '}(coach.relationships fuehrt 17 Spalten, keine davon),
        {' '}<strong>Monatsgebuehr</strong> (Geld gehoert zum Marketplace,
        {' '}F-06 T8) und <strong>Compliance</strong> — die rechnete im
        {' '}Vorgaenger <span className="cp-monospace">services/adherence.ts</span>
        {' '}aus Plan gegen Ist; es gibt weder Plantabelle noch Rechnung.
      </div>
    </Card>
  )
}
