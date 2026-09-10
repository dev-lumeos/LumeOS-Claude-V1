// Die Draft-Fassung des Portals — G-405.
//
// ══ WARUM EINE ZWEITE SEITE UND KEIN UMBAU ═════════════════════════
//
// `[read]` **Tom will den direkten Vergleich** — „ich habe den
// direkten vergleich". `[read]` **Ein Umbau haette das Gebaute
// ersetzt**, und dann gaebe es nichts mehr zu vergleichen.
//
// `[cmd]` **`?draft=<bereich>` zeigt diese Fassung**, ohne die
// bestehende zu beruehren: `?bereich=` bleibt Wort fuer Wort, was
// sie war. **Kein Lesezeichen wird ungueltig.**
//
// ══ WAS AUS DEM DRAFT KOMMT UND WAS GEMESSEN IST ═══════════════════
//
// `[read]` **Die STRUKTUR ist die des Drafts** — vier Gruppen, elf
// Bereiche, 35 Unterpunkte, die Pills und Aktionen aus `CP_META`.
// **Abgeschrieben, nicht erfunden.**
//
// `[cmd]` **Die ZAHLEN sind gemessen, wo es Zeilen gibt** — und
// dann sichtbar anders: die Pill traegt `data-echt`, die Kennzahl
// in der Kontextspalte steht in der Vordergrundfarbe. `[read]`
// **Was aus dem Draft stammt, bleibt gedaempft und sagt es im
// Titel.**
//
// `[read]` **Ein Unterpunkt ohne Tabelle traegt den Vermerk mit dem
// NAMEN der fehlenden Tabelle** (E-72, wie G-398) — nicht
// „unbekannt", nicht „noch nicht angebunden".
import { Empty } from '@lumeos/ui'

import type { PortalStand } from '../lib/daten'
import {
  bereichVon, alleBereiche, type DraftBereich, type DraftKind,
} from './portal-draft-nav'
import { DraftSchale, type DraftZaehler } from './portal-draft-schale'
import { DraftKontextspalte } from './portal-draft-kontextspalte'

import { TabUebersicht } from './tab-uebersicht'
import { TabAthleten } from './tab-athleten'
import { TabCheckins } from './tab-checkins'
import { TabNachrichten } from './tab-nachrichten'
import { TabAlerts } from './tab-alerts'
import { TabAutonomie } from './tab-autonomie'
import { TabConsent } from './tab-consent'
import { TabOnboarding } from './tab-onboarding'

/**
 * Der Attrappenvermerk.
 *
 * `[read]` **Er nennt die fehlende Tabelle**, weil das die einzige
 * Angabe ist, mit der jemand weiterarbeiten kann. `[read]` **„Noch
 * nicht angebunden" sagt nichts** — es verhindert sogar, dass
 * jemand nachsieht (die Lehre aus dem falschen Vermerk).
 */
function Vermerk({ k }: { k: DraftKind }) {
  return (
    <Empty
      title={`${k.label} — Attrappe`}
      sub={k.fehlt
        ?? 'kein Grund vermerkt — das ist ein Fehler in portal-draft-nav.ts'}
    />
  )
}

export function DraftSeite({
  stand, bereichId, kindId, heute, suche, filter,
}: {
  stand: PortalStand
  bereichId: string
  kindId: string | null
  heute: string
  suche: string
  filter: string
}) {
  const bereich: DraftBereich = bereichVon(bereichId) ?? alleBereiche()[0]
  const kind: DraftKind | null = bereich.kinder
    ? (bereich.kinder.find(k => k.id === kindId) ?? bereich.kinder[0])
    : null

  // Was gezeigt wird: der Unterpunkt, wenn es welche gibt, sonst der
  // Bereich selbst. Genau `:107` im Draft.
  const sicht = kind?.id ?? bereich.id

  const aktive = stand.klienten.filter(k => k.status === 'active').length
  const offeneAlerts = stand.alerts.filter(a => a.status !== 'done').length
  const offeneCheckins = stand.checkins.filter(c => c.status === 'submitted').length
  const ungelesen = stand.nachrichten.filter(
    n => n.read_at === null && n.sender_id !== stand.userId).length

  // ══ Die vier Badges der Seitenleiste ══════════════════════════
  //
  // `[cmd]` **Der Draft nennt 14 / 7 / 7 warn / 12** (`CP_NAV`).
  // `[cmd]` **Gemessen sind 6 Beziehungen, 6 Check-ins, 6 Alerts,
  // 6 Nachrichten** — die Badges zeigen die gemessenen Zahlen, nicht
  // die des Drafts. **Eine erfundene 14 in der Leiste waere die
  // schlimmste Stelle dafuer**: sie steht auf jedem Schirm.
  const zaehler: DraftZaehler = {
    athletes: aktive,
    checkins: offeneCheckins,
    alerts: offeneAlerts,
    inbox: ungelesen,
  }

  // ══ Welche Pills gemessen werden koennen ══════════════════════
  //
  // `[read]` **Der Schluessel ist der Text des Drafts** — steht er
  // hier, wird er ersetzt; steht er nicht hier, bleibt der
  // Draft-Text stehen und sagt es im Titel.
  //
  // `[read]` **Nur wo eine Zeile die Zahl traegt.** Keine Schaetzung,
  // keine Hochrechnung.
  const echtePills: Record<string, string> = {
    '14 active': `${aktive} active`,
    '14 athletes': `${aktive} athletes`,
    '7 received': `${offeneCheckins} received`,
    '7 open': `${offeneAlerts} open`,
    '12 unread': `${ungelesen} unread`,
    // Die Unterzeile von `athletes` — die einzige der elf, die eine
    // Zahl traegt. Ohne diese Zeile stand „14 active clients" direkt
    // unter der gemessenen Pill „2 active".
    '14 active clients': `${aktive} active clients`,
  }

  // Dasselbe fuer die Kennzahlen der Kontextspalte.
  const echteDetails: Record<string, string> = {
    'Active athletes': String(aktive),
    'Open alerts': String(offeneAlerts),
    'Unread': String(ungelesen),
    'Check-ins due': String(offeneCheckins),
  }

  return (
    <DraftSchale
      bereich={bereich}
      kind={kind}
      rechtsOffen
      athleten={aktive}
      email={stand.email}
      zaehler={zaehler}
      echtePills={echtePills}
      kontext={<DraftKontextspalte bereich={bereich.id} echteDetails={echteDetails} />}
    >
      {/* ══ Die zehn angebundenen Unterpunkte ══════════════════
          `[cmd]` **Gemessen 2026-09-10:** relationships 6,
          messages 6, alerts 6, checkins 6, client_permissions 4,
          client_autonomy 4, pending_actions 2, action_log 1.
          **Jede dieser Ansichten hat Zeilen.** */}
      {sicht === 'overview' && <TabUebersicht stand={stand} />}
      {sicht === 'athletes' && <TabAthleten
        stand={stand}
        heute={heute}
        suche={suche}
        filter={(['alle', 'active', 'invited', 'ended'] as const)
          .find(x => x === filter) ?? 'alle'}
      />}
      {sicht === 'record' && <TabAthleten
        stand={stand}
        heute={heute}
        suche={suche}
        filter="active"
      />}
      {sicht === 'onboard' && <TabOnboarding stand={stand} />}
      {sicht === 'autonomy' && <TabAutonomie stand={stand} />}
      {sicht === 'autohist' && <TabAutonomie stand={stand} />}
      {sicht === 'consent' && <TabConsent stand={stand} />}
      {sicht === 'messages' && <TabNachrichten stand={stand} />}
      {sicht === 'workflows' && <TabCheckins
        stand={stand}
        heute={heute}
        filter={(['offen', 'alle', 'reviewed'] as const)
          .find(x => x === filter) ?? 'offen'}
      />}
      {sicht === 'alerts' && <TabAlerts
        stand={stand}
        filter={(['offen', 'alle', 'done'] as const)
          .find(x => x === filter) ?? 'offen'}
      />}
      {sicht === 'intervene' && <TabAlerts stand={stand} filter="alle" />}

      {/* Der Rest: der Vermerk mit dem Namen der fehlenden Tabelle. */}
      {kind?.art === 'attrappe' && <Vermerk k={kind} />}

      {/* ══ Die Bereiche OHNE Kinder ═════════════════════════════
          `[cmd]` **Vier: `overview`, `calendar`, `inbox`, `team`**
          (gemessen). `[read]` **Dort gibt es kein Kind, das den
          Vermerk traegt** — der Bereich traegt ihn selbst, sonst
          bliebe der Schirm leer ohne Grund (E-72). */}
      {!bereich.kinder && bereich.art === 'attrappe' && (
        <Vermerk k={{ id: bereich.id, label: bereich.titel, art: 'attrappe', fehlt: bereich.fehlt }} />
      )}
    </DraftSchale>
  )
}
