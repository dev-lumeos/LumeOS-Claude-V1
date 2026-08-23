'use client'

// Zwei Tabs: „Permissions" und „Proposals".
//
// QUELLE: theme-v1/module-coach-athlete.jsx:143-262 (`AthletePermissionsV2`),
// :265-312 (`AthleteProposals`), :314-338 (`ProposalCard`),
// :340-394 (`ProposalModal`).
//
// GEAENDERT IST NUR DAS TECHNISCHE:
//   1. JSX ohne Typen -> TypeScript, jede Requisite und jeder Zustand
//      getippt; kein `any`.
//   2. Klassen auf `v2-`-Praefix, jede `<table>` in `v2-tbl-wrap`.
//   3. `window.COACHES` -> Import aus `./daten` (siehe unten).
//   4. `Empty` -> `Leer` aus `./bausteine`.
//   5. Icon `shield` -> `admin` (siehe unten).
//   6. `<Pill variant="block">` -> `variant="neg"` (siehe unten).
//   7. Mehrteilige JSX-Textknoten zu einem Template-Literal
//      zusammengezogen — getrennte Ausdruecke wie `{a} · {b}` erzeugen
//      sonst eine Hydration-Meldung.
//
// `[cmd]` `window.COACHES` (Zeile 146) gibt es hier nicht: Die Vorlage
// laeuft als Sammlung von Skripten in einem Browser, die sich ueber
// `window` sehen. `COACHES` steht in `daten.ts` und wird importiert —
// dieselbe Liste, derselbe Inhalt, nur ohne den globalen Umweg. Der
// Rueckfall `|| []` der Vorlage entfaellt damit; ein Import ist immer da.
//
// `[cmd]` `<Icon name="shield">` (Zeile 152) gibt es in `packages/ui`
// nicht — `icons.tsx` fuehrt den Namen nicht. Genommen ist `admin`
// (icons.tsx:41), dessen Pfad genau ein Schild zeichnet. Der Auftrag
// G-40 sperrt `packages/ui/`; gemeldet ist es im Bericht.
//
// `[cmd]` `<Pill variant="block">` (Zeilen 253, 302) gibt es nicht —
// `PillVariant` in primitives.tsx:80 kennt `pos | warn | neg | acc`.
// Abgebildet auf `neg`; das ist in beiden Faellen die Bedeutung
// („revoked", „declined").
//
// NICHT geaendert: keine Kachel weggelassen, keine Zahl ersetzt, keine
// Anordnung angepasst. Knoepfe, die in der Vorlage kein `onClick`
// tragen, bleiben ohne — sie stehen da und tun nichts, genau wie dort.
//
// `[cmd]` ALLES IST ATTRAPPE. Ein `coach`-Schema gibt es nicht.
import * as React from 'react'
import { Card, Pill, Empty, Icon } from '@lumeos/ui'

// G-163: die Entwurfsdaten und die Marke sind mit den
// Rueckfallfassungen gefallen; COACHES braucht nur noch ein Untertitel.
import { COACHES, type Proposal } from './daten'
// G-90: die echten Kacheln. Liegt eine Zeile vor, ersetzen sie den
// Entwurf; sonst steht der Leerzustand da, und der Entwurf bleibt weg.
import { RechteEcht, HistorieEcht, WartendEcht } from './rechte-echt'
import type { CoachRechteStand } from '../../../lib/coach/rechte-read'

// ═══ TAB · PERMISSIONS ═══════════════════════════════════════════
// [cmd] module-coach-athlete.jsx:143-262.
//
// **G-90: Der Tab liest.** `[cmd]` Bis hierher war er ganz Attrappe,
// weil es kein `coach`-Schema gab. Seit C-119 gibt es sechs Tabellen.
// **Erreichbar sind sie heute nicht** (`coach` ist nicht fuer
// PostgREST freigegeben) — deshalb steht der Leerzustand da, mit dem
// Grund. Kein Attrappenmuster: Muster G-65.
export function AthletePermissionsV2({ stand }: { stand?: CoachRechteStand }) {
  // `[read]` Der Entwurf bleibt nur, solange gar nichts geladen wurde
  // (kein Prop). Sobald die Seite liest — auch wenn sie nichts findet
  // —, gilt der echte Weg mit seinem Leerzustand.
  if (stand) {
    return (
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <RechteEcht stand={stand} />
        <HistorieEcht
          titel="Historie der Freigaben"
          zeilen={stand.rechteLog}
          leerText="Jede Freigabe und jede Rücknahme erscheint hier — mit Alt- und Neuwert."
        />
      </div>
    )
  }
  // G-163: der Entwurf ist raus (Tom, 2026-08-23: "sie fliegen").
  // Ohne Stand steht hier der Grund, nicht die erfundene Matrix.
  return (
    <Card title="Permissions">
      <Empty
        title="Nicht geladen"
        sub="Der Rechte-Stand wurde nicht gelesen — keine Sitzung oder ein Ladefehler."
        icon="admin"
      />
    </Card>
  )
}

// **G-90: Der Bestaetigungspfad ist `coach.pending_actions`** —
// Vorschau, 10-Minuten-Verfall, `confirmed_at`. Das Muster stammt aus
// dem Vorgaengerrepo (022) und ist dort fuer den Einzelnutzer gebaut
// gewesen; hier traegt es Coach und Klient und echte Zeilenrechte.
export function AthleteProposals({ stand }: { stand?: CoachRechteStand }) {
  if (stand) return <WartendEcht stand={stand} />
  // G-163: der Entwurf ist raus (Tom, 2026-08-23: "sie fliegen").
  // Ohne Stand steht hier der Grund, nicht die erfundene Matrix.
  return (
    <Card title="Proposals">
      <Empty
        title="Nicht geladen"
        sub="Der Aktions-Stand wurde nicht gelesen — keine Sitzung oder ein Ladefehler."
        icon="admin"
      />
    </Card>
  )
}
