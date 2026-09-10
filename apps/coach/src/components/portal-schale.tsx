// Die Schale des Portals — G-401, in G-402 auf `AppShell` umgestellt.
//
// **Tom, 2026-09-10:** *„dann fehlt gegenueber lumeos-vorlagen:
// settings, links unten user logged in, workspaces, rechts buddy,
// top header mit allen actions und einstellungsmoeglichkeiten."*
//
// ══ SIE WAREN ALLE SCHON DA ═════════════════════════════════════════
//
// `[cmd]` **`packages/ui/src/shell/` fuehrt sie seit G-02:**
// `app-shell`, `sidebar` (Suche + Nutzerzeile), `topbar` (Commands,
// Synced, Modus), `context-panel`, `buddy-orb`, `nav`.
//
// `[cmd]` **G-401 hat sie NACHGEBAUT statt gerufen** — 60 Zeilen
// eigene Seitenleiste, eigenes Raster, keine Kopfleiste, keine
// Kontextspalte. **Die vierte Doppelung nach Tokens,
// Referenz-Trenner und Seitenleiste.**
//
// `[read]` **Jetzt ruft diese Datei `AppShell`** — dasselbe Stueck,
// das `apps/web` in `v2/shell.tsx:14` benutzt. **Was hier bleibt,
// ist nur das Portal-Eigene:** der Modulkopf, die Reiterleiste des
// Bereichs und die Uebersetzung der Navigation.
//
// ══ WAS DAFUER IN `packages/ui` NOETIG WAR ══════════════════════════
//
// `[cmd]` **Drei wahlfreie Requisiten, alle mit Vorgabe = heutiges
// Verhalten** (Gegenprobe im Bericht: `apps/web` rendert
// unveraendert):
//
//     SidebarProps.gruppen    ersetzt MODULES/WORKSPACES/SYSTEM
//     SidebarProps.marke      ersetzt „L / LumeOS"
//     SidebarProps.ohneSuche  blendet die Attrappensuche aus
//     AppShellProps.bereich   ersetzt die Brotkrume aus resolveNav
//
// `[read]` **Ohne sie zeigte die Paketleiste dem Coach die Module des
// Athleten** — Nutrition, Training, Recovery. **Das war der Befund
// aus G-401, und das ist seine Aufloesung.**
//
// ══ WAS `apps/coach` NICHT AUS `@lumeos/shared` HOLEN DARF ══════════
//
// `[cmd]` **`createClient` aus `@lumeos/shared` STUERZT hier ab** —
// Befund F-07, im Browser gemessen: `@supabase/ssr` 0.1.0
// ueberschreibt den Cookie-Default mit `undefined`. **Deshalb hat
// das Portal `lib/browser-client.ts`.** `[read]` **Eine Kopie der
// alten Schale haette genau diesen Absturz mitgebracht.**
'use client'

import * as React from 'react'
import Link from 'next/link'
import { AppShell, Icon, Pill, type SidebarGruppe } from '@lumeos/ui'

import { PORTAL_NAV, type PortalNavEintrag } from './portal-nav'

/**
 * `next/link` fuer die Paketleiste.
 *
 * `[read]` **Das Paket kennt kein Next** (`linkAs` ist der Weg) —
 * und `apps/coach` hat keine typisierten Routen, also genuegt der
 * schlichte Verweis.
 */
function PortalLink({ href, ...rest }: { href: string } & Record<string, unknown>) {
  return <Link href={href} {...rest} />
}

/** Die Zaehler, aus echten Zeilen gerechnet — nie erfunden. */
export type PortalZaehler = Partial<Record<
  'klienten' | 'ungelesen' | 'checkins' | 'alerts'
  | 'vorschlaege' | 'rechte' | 'autonomie' | 'einladungen', number>>

// ══ G-402: die eigene Seitenleiste ist entfallen ══════════════════
//
// `[cmd]` **Hier standen 60 Zeilen**, die `v2-sidebar`,
// `v2-nav-group` und `v2-nav-item` selbst zusammensetzten — die
// dritte Doppelung nach Tokens und Referenz-Trenner (G-399).
//
// `[cmd]` **`SidebarProps` nimmt jetzt `gruppen`, `marke` und
// `ohneSuche`** (G-402/A5). `[read]` **Die Leiste kommt aus dem
// Paket**, und dieselbe Datei bedient beide Anwendungen.
//
// `[read]` **Ohne `gruppen` bleibt alles wie bisher** — `apps/web`
// uebergibt sie nicht und rendert unveraendert (Gegenprobe im
// Bericht).

/**
 * Der Modulkopf des Bereichs — A3.
 *
 * `[cmd]` **Vier Pills und zwei Aktionen wie die Vorlage**
 * (`module-coach.jsx:910-920`, `CoachPortalStandalone`).
 *
 * `[read]` **Die Aktionen sind abgeschaltet** — es gibt weder einen
 * Schreibweg fuer Rundnachrichten noch eine Plantabelle. **Ein Knopf
 * ohne Wirkung ist schlimmer als keiner** (C-426), also nennt der
 * `title` den Grund.
 */
function Modulkopf({ titel, athleten, alerts, email }: {
  titel: string
  athleten: number | null
  alerts: number | null
  email: string
}) {
  return (
    <div className="v2-module-header v2-module-hero-lite">
      <div className="v2-module-title-block">
        <div className="v2-module-title-row">
          <span className="v2-module-title">{titel}</span>
          <Pill variant="acc">separate platform</Pill>
          <Pill className="v2-mono">coach.lumeos.app</Pill>
          {athleten !== null && <Pill>{`${athleten} athletes`}</Pill>}
          {alerts !== null && (
            <Pill>
              <Icon name="alert" className="v2-ic v2-ic-sm" />
              {`${alerts} alerts`}
            </Pill>
          )}
        </div>
        <div className="v2-module-sub">
          Coach workspace · read-only on client data · every call
          permission-checked
        </div>
      </div>
      <div className="v2-module-actions">
        <button
          type="button" className="v2-btn" disabled
          title={'Attrappe — theme-v1/module-coach.jsx:919 · wartet auf: '
            + 'einen Schreibweg fuer Rundnachrichten; coach.messages traegt '
            + 'je Zeile genau einen Klienten'}
        >
          <Icon name="message" className="v2-ic v2-ic-sm" />Broadcast
        </button>
        <button
          type="button" className="v2-btn v2-btn-primary" disabled
          title={'Attrappe — theme-v1/module-coach.jsx:920 · wartet auf: '
            + 'eine Tabelle fuer Plaene'}
        >
          <Icon name="plus" className="v2-ic v2-ic-sm" />New plan
        </button>
        <span className="cp-konto cp-monospace">{email}</span>
      </div>
    </div>
  )
}

/**
 * Die Reiterleiste DES BEREICHS — A4.
 *
 * `[read]` **Nicht alle sechzehn** — LumeOS zeigt je Modul die
 * Reiter dieses Moduls. `[read]` **Ein einzelner Reiter braucht
 * keine Leiste**: eine Leiste mit genau einem Eintrag ist ein
 * Bedienelement ohne Wahl.
 */
function Reiterleiste({ e, tab }: { e: PortalNavEintrag, tab: string }) {
  if (e.reiter.length < 2) return null
  return (
    <nav className="v2-tabs" aria-label={`${e.label} — Reiter`}>
      {e.reiter.map(r => (
        <Link
          key={r.id}
          href={`/?bereich=${e.id}&tab=${r.id}`}
          className={`v2-tab ${r.id === tab ? 'v2-active' : ''}`.trim()}
          aria-current={r.id === tab ? 'page' : undefined}
        >
          {r.label}
        </Link>
      ))}
    </nav>
  )
}

/**
 * Die Gruppen des Portals in die Form der Paketleiste bringen.
 *
 * `[read]` **Die Navigation bleibt in `portal-nav.ts`** — sie ist
 * fachliche Ordnung, kein Baustein. **Hier wird nur uebersetzt.**
 */
function alsGruppen(bereich: string, zaehler: PortalZaehler): SidebarGruppe[] {
  return PORTAL_NAV.map(g => ({
    label: g.label,
    eintraege: g.eintraege.map(e => ({
      id: e.id,
      label: e.label,
      icon: e.icon,
      href: `/?bereich=${e.id}`,
      zahl: e.zaehler ? zaehler[e.zaehler] : undefined,
      stufe: e.stufe,
    })),
  }))
}

/**
 * Der Abmeldeknopf, rechts in der Nutzerzeile — A11.
 *
 * `[cmd]` **Der Weg existiert:** `/auth/callback` fuehrt die
 * Abmeldung, und `middleware.ts` schickt ohne Sitzung nach
 * `/login`. `[read]` **Kein Knopf ohne Ziel** (C-426).
 */
function AbmeldeKnopf() {
  return (
    <form action="/auth/abmelden" method="post">
      <button type="submit" className="v2-icon-btn" title="Abmelden">
        <Icon name="arrow_right" className="v2-ic v2-ic-sm" />
      </button>
    </form>
  )
}

/**
 * Was die Kontextspalte je Bereich zeigt — A13.
 *
 * `[read]` **Nur Gemessenes:** die Zahlen stammen aus demselben
 * Stand, den die Seitenleiste zaehlt. **Kein Text, den ein Modell
 * erzeugt haette.**
 */
function kontextDetails(
  e: PortalNavEintrag,
  z: PortalZaehler,
): Array<{ label: string, value: string }> {
  const raus: Array<{ label: string, value: string }> = [
    { label: 'Reiter in diesem Bereich', value: String(e.reiter.length) },
  ]
  if (e.zaehler) {
    const n = z[e.zaehler]
    raus.push({
      label: e.zaehler,
      value: typeof n === 'number' ? String(n) : 'kein Wert',
    })
  }
  raus.push({ label: 'Quelle', value: 'coach.* · gemessen' })
  return raus
}

export function PortalSchale({
  bereich, tab, eintrag, athleten, alerts, email, zaehler, children,
}: {
  bereich: string
  tab: string
  eintrag: PortalNavEintrag
  athleten: number | null
  alerts: number | null
  email: string
  zaehler: PortalZaehler
  children: React.ReactNode
}) {
  // ══ A11: der Hell-Dunkel-Schalter ═══════════════════════════════
  //
  // `[read]` **Denselben Weg wie `apps/web`** (`v2/shell.tsx:72-81`):
  // das Attribut am `<html>` ist die Wahrheit, das Cookie macht sie
  // dauerhaft. **Kein zweiter Mechanismus daneben.**
  //
  // `[cmd]` **Das Cookie heisst hier `lume-mode` wie drueben** —
  // gemessen in `apps/web/src/styles/themes/registry.ts:31`.
  // `[read]` **Es wird ohne `domain=` gesetzt, ist also
  // hostgebunden** (G-400/A5): oertlich teilen 3200 und 3220 den
  // Host `127.0.0.1` und damit das Cookie, unter
  // `app.lumeos.app` / `coach.lumeos.app` nicht. **Das ist eine
  // Entscheidung fuer Tom, keine hier.**
  const [mode, setMode] = React.useState<'light' | 'dark'>('dark')

  React.useEffect(() => {
    const attr = document.documentElement.getAttribute('data-mode')
    if (attr === 'light' || attr === 'dark') setMode(attr)
  }, [])

  const wechsleModus = React.useCallback((next: 'light' | 'dark') => {
    document.documentElement.setAttribute('data-mode', next)
    document.cookie = `lume-mode=${next}; path=/; max-age=31536000; SameSite=Lax`
    setMode(next)
  }, [])

  return (
    // ══ G-402: die Huelle aus dem Paket ═══════════════════════
    //
    // `[read]` **`AppShell` bringt Raster, Seitenleiste und
    // Kopfzeile mit** — dasselbe Stueck, das `apps/web` in
    // `v2/shell.tsx` benutzt. **Ohne `context` bleibt die dritte
    // Spalte weg** (`data-rightpanel="hidden"` setzt die Huelle
    // selbst).
    <AppShell
      pathname={`/?bereich=${bereich}`}
      linkAs={PortalLink}
      marke={{ kuerzel: 'C', name: 'LumeOS Coach' }}
      gruppen={alsGruppen(bereich, zaehler)}
      ohneSuche
      // A12: sonst leitet `resolveNav` die Brotkrume aus den
      // LumeOS-Modulen ab und schreibt „DASHBOARD" ueber jeden
      // Bereich.
      bereich={{ tag: 'COACH', label: eintrag.label }}
      version="3220"
      // ══ A11: links unten die Nutzerzeile ══════════════════════
      // `[cmd]` `SidebarProps` nimmt `userName`, `userStatus`,
      // `userInitials` und `userMenu` — die Zeile gab es immer, das
      // Portal hat sie nur nie gefuellt.
      userName={email}
      userStatus="Coach"
      userMenu={<AbmeldeKnopf />}
      // ══ A11: die Kopfleiste ═══════════════════════════════════
      // `[cmd]` `syncState` faerbt den Punkt neben „Synced";
      // `mode`/`onModeChange` bringen den Hell-Dunkel-Schalter.
      syncState="synced"
      mode={mode}
      onModeChange={wechsleModus}
      // ══ A13: die Kontextspalte ════════════════════════════════
      //
      // `[cmd]` **Gemessen: die Portal-Vorlage hat KEINE
      // Kontextspalte** — `module-coach.jsx` nennt `context`,
      // `ctx-` oder `rightpanel` an null Stellen. **Die generische
      // Schale (`shell.jsx:229`) hat eine, der Trainerarbeitsplatz
      // benutzt sie nicht.**
      //
      // `[read]` **Erfunden wird hier nichts** — die Spalte zeigt,
      // was ueber den GEWAEHLTEN Bereich messbar ist, und nennt
      // ihre eigene Herkunft. **Eine leere 340-px-Spalte saehe aus
      // wie ein Fehler; ein erfundener Buddy-Text saehe aus wie
      // eine Funktion** (dasselbe Urteil wie `v2/shell.tsx:108`).
      context={{
        label: eintrag.label,
        buddyMessage: (
          <>
            Die Vorlage des Trainerarbeitsplatzes fuehrt keine
            Kontextspalte — gemessen: `module-coach.jsx` nennt sie an
            null Stellen. Was hier steht, ist der Stand des Bereichs,
            kein Modellaufruf.
          </>
        ),
        details: kontextDetails(eintrag, zaehler),
      }}
    >
      <div className="cp-inhalt">
        <Modulkopf
          titel={eintrag.label}
          athleten={athleten}
          alerts={alerts}
          email={email}
        />
        <Reiterleiste e={eintrag} tab={tab} />
        {children}
      </div>
    </AppShell>
  )
}
