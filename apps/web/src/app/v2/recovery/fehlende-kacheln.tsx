'use client'

// Die elf Kacheln aus den Recovery-Mockups, die es im Code nicht gibt
// — C-418, E-68.
//
// ## Warum diese Datei existiert
//
// **Tom, 2026-09-07:** *,,wir binden mockups an; was nicht anbindbar
// ist bleibt in der ui als mockup deklariert."*
//
// `[cmd]` **C-418: der Deckungswaechter meldete 170 fehlende Elemente
// in `recovery`.** `[cmd]` **Nachgemessen Titel gegen Titel: von 39
// Mockup-Kacheln sind 18 wortgleich da, 10 stehen unter einem anderen
// Namen (meist deutsch), und 11 fehlen wirklich.**
//
// `[read]` **Der Waechter verglich Zeichenketten** — *„Last night"*
// gegen `Letzte Nacht`, *„Measurement log"* gegen `Messprotokoll`.
// **Dieselbe Kachel, andere Sprache.**
//
// `[read]` **Diese Datei traegt NUR die elf, die wirklich fehlen.**
// **Keine Anbindung, keine erfundenen Zahlen** — jede Kachel sagt,
// was sie zeigen wuerde und worauf sie wartet.
import * as React from 'react'
import { Card } from '@lumeos/ui'

import { attrappeAus } from './ansicht'

/** Eine fehlende Kachel: Titel, Zweck, und worauf sie wartet. */
function Fehlt({
  titel, sub, quelle, wartet, zweck,
}: {
  titel: string
  sub?: string
  quelle: string
  wartet: string
  zweck: string
}) {
  return (
    <Card title={titel} sub={sub} attrappe={attrappeAus(quelle, wartet)}>
      <p className="v2-muted" style={{ fontSize: 12, lineHeight: 1.55, margin: 0 }}>
        {zweck}
      </p>
    </Card>
  )
}

const V2 = 'theme-v1/module-recovery.jsx'
const MOD = 'theme-v1/module-recovery-modals.jsx'

/** Die vier Verlaufskacheln des HRV-Reiters. */
export function FehlendeHrvKacheln() {
  return (
    <div className="v2-col-gap" style={{ gap: 14, marginTop: 14 }}>
      <Fehlt
        titel="HRV · last 30 days" sub="rMSSD nightly avg"
        quelle={V2} wartet="Anmerkungen an Messpunkten (kein Feld in recovery.hrv)"
        zweck="Ein 30-Tage-Verlauf der naechtlichen rMSSD-Werte mit
               Anmerkungsknopf je Punkt. Der Verlauf selbst steht im
               Reiter als „Verlauf“ — was fehlt, ist die Anmerkung."
      />
      <Fehlt
        titel="HRV · 90 days" sub="drei Monate statt einem"
        quelle={V2} wartet="unbekannt, nie untersucht"
        zweck="Derselbe Verlauf ueber 90 Tage. Ob die Daten reichen,
               ist nicht gemessen."
      />
      <Fehlt
        titel="Resting HR · 90 days"
        quelle={V2} wartet="unbekannt, nie untersucht"
        zweck="Ruhepuls ueber 90 Tage. Die Spalte ist nicht gemessen."
      />
      <Fehlt
        titel="Weight · 30 days"
        quelle={V2} wartet="Leseweg aus goals.body_measurements"
        zweck="Gewichtsverlauf neben den Erholungswerten. Die Daten
               liegen in `goals`, nicht in `recovery`."
      />
    </div>
  )
}

/** Die drei Schlafkacheln. */
export function FehlendeSchlafKacheln() {
  return (
    <div className="v2-col-gap" style={{ gap: 14, marginTop: 14 }}>
      <Fehlt
        titel="Sleep · last 14 nights" sub="Dauer je Nacht"
        quelle={V2} wartet="unbekannt, nie untersucht"
        zweck="Balkenverlauf der letzten 14 Naechte. Die Kachel
               „14 Naechte“ zeigt heute etwas anderes."
      />
      <Fehlt
        titel="Sleep debt · 7 day rolling"
        quelle={V2} wartet="Sollwert je Nutzer (keine Spalte gemessen)"
        zweck="Aufgelaufenes Schlafdefizit gegen ein Ziel. Ohne
               hinterlegten Sollwert waere die Zahl erfunden (C-378)."
      />
      <Fehlt
        titel="Bedtime &amp; wake · 30 days"
        quelle={V2} wartet="unbekannt, nie untersucht"
        zweck="Zubettgeh- und Aufstehzeiten als Streuung ueber 30 Tage."
      />
    </div>
  )
}

/** Die vier Auswertungskacheln aus den Modalen. */
export function FehlendeAuswertungsKacheln() {
  return (
    <div className="v2-col-gap" style={{ gap: 14, marginTop: 14 }}>
      <Fehlt
        titel="Training load × Recovery" sub="Zusammenhang, nicht Ursache"
        quelle={MOD} wartet="gemeinsame Sicht ueber training + recovery (E-52)"
        zweck="Streudiagramm aus Trainingslast und Erholung des
               Folgetages. Braucht beide Module in einer Abfrage."
      />
      <Fehlt
        titel="Readiness ↔ performance"
        quelle={MOD} wartet="gemeinsame Sicht ueber training + recovery (E-52)"
        zweck="Ob hohe Bereitschaft zu besseren Saetzen fuehrt.
               Dieselbe Vorbedingung wie oben."
      />
      <Fehlt
        titel="Pattern detection · 30d"
        quelle={MOD} wartet="unbekannt, nie untersucht"
        zweck="Wiederkehrende Muster in den Check-ins — etwa
               Koffein spaet, Sauna, Reisetag."
      />
      <Fehlt
        titel="Today · protocols logged"
        quelle={MOD} wartet="unbekannt, nie untersucht"
        zweck="Was heute an Protokollen erfasst wurde, als Tagesliste."
      />
    </div>
  )
}
