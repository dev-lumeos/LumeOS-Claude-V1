'use client'

// Die echten Kacheln fuer Beziehungen und Nachrichten (G-158).
//
// `[cmd]` Beide Tabellen lagen gefuellt und ungelesen: relationships
// traegt 6 Zeilen, messages 6 (Stand 2026-08-22) — die Oberflaeche
// zeigte daneben erfundene Coaches aus `daten.ts`. Die Zeilenrechte
// begrenzen auf eigene Zeilen: angemeldet als `dev@lumeos.app` kommen
// 1 Beziehung und 2 Nachrichten an, gemessen gegen die Datenbank.
//
// **KEIN NAME AM COACH — mit Absicht sichtbar.** `[cmd]` Es gibt keine
// Namensquelle: `public.profiles` fuehrt kein Namensfeld, eine Tabelle
// `coach_profiles` (SPEC_02 HumanCoach) ist nicht gebaut. Statt einen
// Namen zu erfinden, steht hier die Rolle und die gekuerzte Kennung —
// der fehlende Unterbau ist ein Befund fuer Codex (C-219).
//
// **SEIT C-225 WIRD GESCHRIEBEN:** Antworten (messages INSERT),
// Einladen (relationships INSERT, status='invited', per Kennung) und
// Als-gelesen (messages UPDATE read_at) — die Regeln erzwingen die
// Zeilenrechte, nicht diese Datei (nachrichten-schreiben.ts).
import * as React from 'react'
import { Card, Pill, Empty, Icon } from '@lumeos/ui'

import type {
  Beziehung, CoachRechteStand, Nachricht,
} from '../../../lib/coach/rechte-read'
// C-225: die drei Schreibwege — Antworten, Einladen, Als-gelesen.
import {
  sendeNachricht, ladeCoachEin, markiereGelesen,
} from '../../../lib/coach/nachrichten-schreiben'

const STATUS_VARIANTE: Record<string, 'pos' | 'warn' | 'neg' | undefined> = {
  active: 'pos', invited: 'warn', ended: 'neg',
}

/** Rolle des Gegenuebers aus Sicht des angemeldeten Nutzers. */
function gegenueber(b: Beziehung, userId: string | null) {
  return userId === b.client_id
    ? { rolle: 'Coach', kennung: b.coach_id }
    : { rolle: 'Klient', kennung: b.client_id }
}

function ungeleseneIn(nachrichten: Nachricht[], b: Beziehung, userId: string | null) {
  return nachrichten.filter(n =>
    n.coach_id === b.coach_id && n.client_id === b.client_id
    && n.read_at === null && n.sender_id !== userId).length
}

/** „Your coaches" — aus `coach.relationships`, nicht aus `daten.ts`. */
export function CoachesEcht({ stand }: { stand: CoachRechteStand }) {
  if (stand.beziehungen.length === 0) {
    return (
      <Card title="Your coaches" sub="aus coach.relationships">
        <Empty
          title="Noch kein Coach verbunden"
          sub={stand.fehler
            ? `Nicht geladen: ${stand.fehler}`
            : 'Eine Einladung erzeugt hier die erste Beziehung.'}
          icon="user"
        />
        {/* C-225: gerade im Leerzustand gehoert das Einladen hierher —
            die erste Beziehung entsteht genau hier. */}
        <div className="v2-divider" />
        <InviteFormular />
      </Card>
    )
  }
  return (
    <Card
      title="Your coaches"
      sub={`${stand.beziehungen.length} ${stand.beziehungen.length === 1 ? 'Beziehung' : 'Beziehungen'} · aus coach.relationships`}
    >
      <div className="v2-col-gap" style={{ gap: 8 }}>
        {stand.beziehungen.map(b => {
          const g = gegenueber(b, stand.userId)
          const neu = ungeleseneIn(stand.nachrichten, b, stand.userId)
          return (
            <div
              key={b.id}
              style={{
                padding: 12, background: 'var(--bg-elev)',
                border: '1px solid var(--border)', borderRadius: 7,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{g.rolle}</span>
                <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>
                  {g.kennung.slice(0, 8)}
                </span>
                <Pill variant={STATUS_VARIANTE[b.status]}>{b.status}</Pill>
                {neu > 0 && <Pill variant="acc">{`${neu} new`}</Pill>}
                {b.started_at && (
                  <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>
                    {`seit ${b.started_at.slice(0, 10)}`}
                  </span>
                )}
              </div>
              {b.invite_note && (
                <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.45 }}>
                  {b.invite_note}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="v2-dim" style={{ fontSize: 10, marginTop: 8, lineHeight: 1.5 }}>
        Ohne Namen, mit Absicht: es gibt kein Namensfeld — weder in
        profiles noch als coach_profiles. Gemeldet (C-219).
      </div>
      <div className="v2-divider" />
      <InviteFormular />
    </Card>
  )
}

/**
 * C-225: Einladen — `relationships` mit `status='invited'`.
 *
 * `[read]` Per KENNUNG (UUID), nicht per Name oder E-Mail: es gibt
 * keine Namensquelle (geklaert im Punkt), und eine E-Mail-Aufloesung
 * braeuchte eine DB-Funktion — gemeldet, nicht danebengebaut (C-268).
 *
 * `[read]` **G-185: exportiert, damit der Invites-Reiter DIESES
 * Formular benutzt** — kein zweiter Schreibweg. Es ist der einzige Weg
 * zu `ladeCoachEin`, und der Leerzustand des Reiters braucht ihn:
 * **bei 0 Beziehungen entsteht dort die erste.**
 */
export function InviteFormular() {
  const [kennung, setKennung] = React.useState('')
  const [notiz, setNotiz] = React.useState('')
  const [meldung, setMeldung] = React.useState<string | null>(null)
  const [laeuft, setLaeuft] = React.useState(false)

  async function einladen() {
    setLaeuft(true)
    setMeldung(null)
    const r = await ladeCoachEin({ coachId: kennung.trim(), note: notiz })
    setLaeuft(false)
    setMeldung(r.ok ? 'Einladung angelegt (status: invited).' : r.fehler)
    if (r.ok) { setKennung(''); setNotiz('') }
  }

  return (
    <div>
      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Coach einladen</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <input className="v2-feld" style={{ fontSize: 11, flex: '1 1 240px' }}
               value={kennung} onChange={e => setKennung(e.target.value)}
               placeholder="Coach-Kennung (UUID)" aria-label="Coach-Kennung" />
        <input className="v2-feld" style={{ fontSize: 11, flex: '1 1 160px' }}
               value={notiz} onChange={e => setNotiz(e.target.value)}
               placeholder="Notiz (optional)" aria-label="Einladungsnotiz" />
        <button type="button" className="v2-btn v2-btn-primary"
                disabled={laeuft || !kennung.trim()} onClick={() => void einladen()}>
          <Icon name="plus" className="v2-ic v2-ic-sm" />
          Einladen
        </button>
      </div>
      {meldung && <div className="v2-muted" style={{ fontSize: 10.5, marginTop: 6 }}>{meldung}</div>}
      <div className="v2-dim" style={{ fontSize: 9.5, marginTop: 4, lineHeight: 1.5 }}>
        Per Kennung — eine Suche nach Name oder E-Mail braucht eine
        Auflösungsfunktion in der Datenbank (gemeldet).
      </div>
    </div>
  )
}

/** „Threads" — aus `coach.messages`, je Beziehung die juengste. */
/**
 * Die offenen Einladungen (G-185) — aus `coach.relationships`.
 *
 * ══ WAS DER REITER VORHER ZEIGTE ═══════════════════════════════════
 *
 * `[cmd]` Bis G-185 kam die Reiterzahl aus `PENDING_INVITES`, einer
 * Entwurfskonstante in `daten.ts` — mit erfundenen Namen und
 * Ablaufdaten. Daneben lag seit C-225 die echte Tabelle.
 *
 * ══ DIE ZAHL IST DIE DER ZEILENRECHTE, NICHT DIE GESAMTZAHL ════════
 *
 * `[cmd]` **Gemessen 2026-08-25:** `coach.relationships` traegt
 * **2 Zeilen mit `status='invited'`** — **beide gehoeren
 * `sarah.seed@example.com`.** `test-user@lumeos.local` sieht davon
 * **null**, `dev@lumeos.app` ebenfalls.
 *
 * `[read]` **Das ist die Falle aus C-241:** wer die Gesamtzahl 2
 * erwartet, misst die Datenbank statt der Ansicht.
 *
 * ══ DER LEERZUSTAND TRAEGT DAS FORMULAR ════════════════════════════
 *
 * `[read]` **Fables Fund aus C-225:** bei 0 Beziehungen rendete nur
 * der Empty-Zweig, ohne Formular — **und genau dort entsteht die
 * erste Beziehung.** Deshalb steht `InviteFormular` hier in BEIDEN
 * Zweigen, nicht nur im gefuellten.
 */
export function EinladungenEcht({ stand }: { stand: CoachRechteStand }) {
  const offen = stand.beziehungen.filter(b => b.status === 'invited')
  return (
    <Card
      title="Offene Einladungen"
      sub={offen.length > 0 ? `${offen.length}` : undefined}
    >
      {offen.length === 0 ? (
        <div className="v2-muted" style={{ fontSize: 12, lineHeight: 1.6 }}>
          Für dieses Konto ist keine Einladung offen. Wer einen Coach
          einladen möchte, trägt unten dessen Kennung ein.
        </div>
      ) : (
        <div className="v2-col-gap" style={{ gap: 6 }}>
          {offen.map(b => {
            const g = gegenueber(b, stand.userId)
            return (
              <div key={b.id} style={{
                display: 'flex', alignItems: 'baseline', gap: 10,
                padding: '9px 11px', borderRadius: 6,
                background: 'var(--bg-elev)', border: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: 12 }}>
                  {g.rolle}
                  {/* Kein Name — es gibt keine Namensquelle (C-219,
                      C-268). Die gekuerzte Kennung statt einer
                      Erfindung. */}
                  <span className="v2-dim v2-mono" style={{ fontSize: 10, marginLeft: 6 }}>
                    {g.kennung.slice(0, 8)}…
                  </span>
                </span>
                <Pill variant="warn" style={{ fontSize: 9 }}>eingeladen</Pill>
                {b.invite_note && (
                  <span className="v2-muted" style={{ fontSize: 11, flex: 1, minWidth: 0 }}>
                    {b.invite_note}
                  </span>
                )}
                {b.created_at && (
                  <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>
                    seit {b.created_at.slice(0, 10)}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
      <div className="v2-divider" />
      <InviteFormular />
    </Card>
  )
}

export function ThreadsEcht({ stand }: { stand: CoachRechteStand }) {
  // Ein Thread je Beziehung; `nachrichten` kommt absteigend sortiert,
  // die erste je Schluessel ist also die juengste.
  // C-225: ein Thread je BEZIEHUNG, nicht je Nachricht — sonst haette
  // eine frisch eingeladene Beziehung kein Sendefeld fuer die erste
  // Nachricht.
  const threads = new Map<string, { beziehung: Beziehung; liste: Nachricht[] }>()
  for (const b of stand.beziehungen) {
    threads.set(`${b.coach_id}:${b.client_id}`, { beziehung: b, liste: [] })
  }
  for (const n of stand.nachrichten) {
    const k = `${n.coach_id}:${n.client_id}`
    const t = threads.get(k)
    if (t) t.liste.push(n)
    else threads.set(k, {
      beziehung: {
        id: k, coach_id: n.coach_id, client_id: n.client_id,
        status: 'unbekannt', invite_note: null, started_at: null, ended_at: null,
        // `[read]` Ein Thread ohne Beziehungszeile hat kein
        // Anlagedatum — `null`, nicht das der Nachricht.
        created_at: null,
      },
      liste: [n],
    })
  }

  if (threads.size === 0) {
    return (
      <Card title="Threads" sub="aus coach.messages">
        <Empty
          title="Noch keine Nachrichten"
          sub={stand.fehler
            ? `Nicht geladen: ${stand.fehler}`
            : 'Die erste Coach-Nachricht eröffnet hier den Thread.'}
          icon="message"
        />
      </Card>
    )
  }
  return (
    <Card
      title="Threads"
      sub={`${stand.nachrichten.length} Nachrichten · aus coach.messages`}
      className="v2-card-tight"
      style={{ padding: 0 }}
    >
      <div className="v2-col-gap" style={{ gap: 0 }}>
        {Array.from(threads.values()).map(({ beziehung, liste }) => (
          <ThreadZeile
            key={`${beziehung.coach_id}:${beziehung.client_id}`}
            beziehung={beziehung} liste={liste} userId={stand.userId}
          />
        ))}
      </div>
      {/* C-225: seit G-158 stand hier „Antworten wäre ein Schreibweg —
          gemeldet, nicht gebaut". Jetzt ist er gebaut. */}
    </Card>
  )
}

/** Ein Thread mit Antwortfeld und Als-gelesen (C-225). */
function ThreadZeile({ beziehung, liste, userId }: {
  beziehung: Beziehung
  liste: Nachricht[]
  userId: string | null
}) {
  const juengste = liste[0] ?? null
  const ungelesene = liste.filter(n => n.read_at === null && n.sender_id !== userId)
  const vonMir = juengste?.sender_id === userId
  const [antwort, setAntwort] = React.useState('')
  const [meldung, setMeldung] = React.useState<string | null>(null)
  const [laeuft, setLaeuft] = React.useState(false)

  async function senden() {
    setLaeuft(true)
    setMeldung(null)
    const r = await sendeNachricht({
      coachId: beziehung.coach_id, clientId: beziehung.client_id, text: antwort,
    })
    setLaeuft(false)
    setMeldung(r.ok ? 'Gesendet.' : r.fehler)
    if (r.ok) setAntwort('')
  }

  async function gelesen() {
    setLaeuft(true)
    setMeldung(null)
    // Alle fremden ungelesenen dieses Threads — der haeufige Fall ist
    // eine; die Policy laesst ohnehin nur fremde zu.
    for (const n of ungelesene) {
      const r = await markiereGelesen(n.id)
      if (!r.ok) { setMeldung(r.fehler); break }
    }
    setLaeuft(false)
  }

  return (
    <div style={{ padding: 12, borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
        <span style={{ fontSize: 12, fontWeight: 600 }}>
          {userId === beziehung.client_id ? 'Coach' : 'Klient'}
        </span>
        <span className="v2-dim v2-mono" style={{ fontSize: 9 }}>
          {(userId === beziehung.client_id
            ? beziehung.coach_id : beziehung.client_id).slice(0, 8)}
        </span>
        <Pill style={{ fontSize: 8.5 }}>{beziehung.status}</Pill>
        {ungelesene.length > 0 && (
          <span style={{
            width: 6, height: 6, borderRadius: 999,
            background: 'var(--acc-coach)', display: 'inline-block',
          }} />
        )}
        {juengste && (
          <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 9 }}>
            {juengste.sent_at.slice(0, 10)}
          </span>
        )}
      </div>
      {juengste ? (
        <div
          className="v2-muted"
          style={{ fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {vonMir ? 'Du: ' : ''}{juengste.body}
        </div>
      ) : (
        <div className="v2-dim" style={{ fontSize: 10.5 }}>
          Noch keine Nachricht in dieser Beziehung.
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
        <input className="v2-feld" style={{ fontSize: 11, flex: '1 1 160px' }}
               value={antwort} onChange={e => setAntwort(e.target.value)}
               placeholder="Antworten…" aria-label="Antwort" disabled={laeuft} />
        <button type="button" className="v2-btn v2-btn-sm"
                disabled={laeuft || !antwort.trim()} onClick={() => void senden()}>
          Senden
        </button>
        {ungelesene.length > 0 && (
          <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                  disabled={laeuft} onClick={() => void gelesen()}>
            Als gelesen ({ungelesene.length})
          </button>
        )}
      </div>
      {meldung && <div className="v2-muted" style={{ fontSize: 10, marginTop: 4 }}>{meldung}</div>}
    </div>
  )
}
