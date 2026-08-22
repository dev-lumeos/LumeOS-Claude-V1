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
// **KEIN SENDEN.** `[read]` Eine Antwort waere ein INSERT in
// `coach.messages` — ein Schreibweg, den der Auftrag ausdruecklich zur
// Meldung stellt statt zum Bau. Gemeldet im Bericht.
import * as React from 'react'
import { Card, Pill, Empty } from '@lumeos/ui'

import type {
  Beziehung, CoachRechteStand, Nachricht,
} from '../../../lib/coach/rechte-read'

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
    </Card>
  )
}

/** „Threads" — aus `coach.messages`, je Beziehung die juengste. */
export function ThreadsEcht({ stand }: { stand: CoachRechteStand }) {
  // Ein Thread je Beziehung; `nachrichten` kommt absteigend sortiert,
  // die erste je Schluessel ist also die juengste.
  const threads = new Map<string, Nachricht[]>()
  for (const n of stand.nachrichten) {
    const k = `${n.coach_id}:${n.client_id}`
    const liste = threads.get(k) ?? []
    liste.push(n)
    threads.set(k, liste)
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
        {Array.from(threads.values()).map(liste => {
          const juengste = liste[0]
          const neu = liste.filter(n => n.read_at === null && n.sender_id !== stand.userId).length
          const vonMir = juengste.sender_id === stand.userId
          return (
            <div
              key={`${juengste.coach_id}:${juengste.client_id}`}
              style={{ padding: 12, borderBottom: '1px solid var(--border)', display: 'flex', gap: 10 }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>
                    {stand.userId === juengste.client_id ? 'Coach' : 'Klient'}
                  </span>
                  <span className="v2-dim v2-mono" style={{ fontSize: 9 }}>
                    {(stand.userId === juengste.client_id
                      ? juengste.coach_id : juengste.client_id).slice(0, 8)}
                  </span>
                  {neu > 0 && (
                    <span style={{
                      width: 6, height: 6, borderRadius: 999,
                      background: 'var(--acc-coach)', display: 'inline-block',
                    }} />
                  )}
                  <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 9 }}>
                    {juengste.sent_at.slice(0, 10)}
                  </span>
                </div>
                <div
                  className="v2-muted"
                  style={{ fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {vonMir ? 'Du: ' : ''}{juengste.body}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="v2-dim" style={{ fontSize: 10, padding: '8px 12px', lineHeight: 1.5 }}>
        Nur lesen: Antworten wäre ein Schreibweg in coach.messages —
        gemeldet, nicht gebaut (G-158).
      </div>
    </Card>
  )
}
