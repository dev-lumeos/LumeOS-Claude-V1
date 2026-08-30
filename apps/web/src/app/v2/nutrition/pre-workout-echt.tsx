// ════════════════════════════════════════════════════════════════════
// DAS PRE-WORKOUT-FENSTER — G-262
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **Was die Attrappe zeigte, und was davon bleibt:**
//
//     17:30-Sitzung          BLEIBT - `training.workout_sessions`
//                            traegt sie, fuer dev 13 geplante ab
//                            heute, alle 17:30 (gemessen 2026-08-30)
//     Abstand „2h 28m"       BLEIBT - rechnerisch aus der Uhrzeit
//     Score „68 · optimal"   RAUS - eine Bewertung
//     „Eat by 16:00"         RAUS - eine Empfehlung
//     „Carbs 60 g, Protein   RAUS - Dosierungsempfehlung
//       25-30 g, Fat <10 g"
//     drei Mahlzeiten-       RAUS - Kombinationsvorschlag
//       kombinationen
//
// `[read]` **Die Grenze ist C-108/F-02: *nennen ja, bewerten nein.***
// `[cmd]` Die Linie ist ausdruecklich festgehalten (C-113): *,,Was
// nicht gebaut wird: Dosierungsempfehlung, Zyklusaufbau,
// PCT-Protokoll, Kombinationsvorschlag."*
//
// `[read]` **Vier der sechs Teile waren genau das.** Ein Fenster
// *,,60-120 min vor dem Training"* ist keine Messung, sondern eine
// Ernaehrungsempfehlung — **und niemand hat sie belegt.** Die 68 war
// eine Zahl ohne Formel.
//
// `[read]` **Was bleibt, ist eine Angabe:** wann die naechste geplante
// Einheit ist und wie lange es noch hin ist. **Das ist eine Tatsache
// aus den eigenen Daten des Nutzers, keine Aussage darueber, was er
// tun soll.**
//
// `[read]` **A-30:** nur Typen und reine Funktionen aus dem Leseweg —
// kein `createSessionClient`, kein Ladeaufruf.
import * as React from 'react'
import { Card, Empty, Pill } from '@lumeos/ui'

import {
  lageVon, abstandSatz, LAGE_SATZ, type SitzungStand,
} from '../../../lib/training/naechste-sitzung'

export function PreWorkoutEcht({ stand }: { stand: SitzungStand }) {
  const lage = lageVon(stand.sitzung)
  const roh = new Date(stand.gelesenUm)
  const zeit = Number.isNaN(roh.getTime()) ? new Date(0) : roh

  if (stand.fehler) {
    return (
      <Card title="Nächstes Training" sub="aus training.workout_sessions">
        <Empty title="Nicht geladen" sub={stand.fehler} icon="alert" />
      </Card>
    )
  }

  if (lage !== 'geplant' || !stand.sitzung) {
    return (
      <Card title="Nächstes Training" sub="aus training.workout_sessions">
        <Empty
          title={lage === 'ohne_zeit' ? 'Ohne Uhrzeit' : 'Nichts geplant'}
          sub={LAGE_SATZ[lage]}
          icon="calendar"
        />
      </Card>
    )
  }

  const s = stand.sitzung
  return (
    <Card
      title="Nächstes Training"
      sub="aus training.workout_sessions"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div>
          <div className="v2-num" style={{ fontSize: 24, letterSpacing: '-0.01em' }}>
            {s.startzeit}
          </div>
          <div className="v2-dim v2-mono" style={{ fontSize: 10.5, marginTop: 2 }}>
            {s.datum}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {s.name && (
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{s.name}</div>
          )}
          <div className="v2-muted" style={{ fontSize: 11.5 }}>
            {abstandSatz(s, zeit)}
          </div>
        </div>
        <Pill>geplant</Pill>
      </div>

      {/* `[read]` **Der Satz steht da, statt eine Empfehlung zu
          ersetzen.** Ohne ihn liest jemand die blosse Uhrzeit und
          fragt sich, warum die Kachel duenner ist als im Entwurf —
          und baut die Empfehlung nach. */}
      <div className="v2-dim" style={{ fontSize: 10, marginTop: 10, lineHeight: 1.5 }}>
        Nur der Zeitpunkt, keine Empfehlung: was und wann davor
        gegessen werden sollte, ist eine Ernährungsberatung
        (C-108/F-02 — nennen ja, bewerten nein).
      </div>
    </Card>
  )
}
