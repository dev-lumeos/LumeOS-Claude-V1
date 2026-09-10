// Die Schale nach dem Draft — G-405.
//
// **Tom, 2026-09-10:** *„ich habe den direkten vergleich."*
//
// ══ ABGELESEN AUS `module-coach-portal-shell.jsx:112-117` ═══════════
//
//     display: "grid"
//     gridTemplateColumns: rightOpen ? "222px 1fr 306px" : "222px 1fr"
//     height: "100vh", width: "100vw"
//     background: "var(--bg)", overflow: "hidden"
//     "--acc": "var(--acc-coach)"
//
// `[read]` **222 statt 240, 306 statt 340** — der Draft ist enger als
// die Athletenschale. **Das ist kein Zufall:** ein Arbeitsplatz zeigt
// mehr Zeilen auf demselben Schirm.
//
// `[cmd]` **`--acc` auf den Coach-Akzent** (`:116`) — damit faerbt
// jede `v2-`-Regel, die `var(--acc)` nutzt, im Portal tuerkis statt
// blau. **Eine Zeile statt einer Kopie des Farbwerks.**
//
// ══ DIE REGEL AUS ZEILE 2 ═══════════════════════════════════════════
//
// > *„Sidebar carries parents only; children live in the content
// > sub-nav."*
//
// `[cmd]` **Elf Bereiche links, 35 Unterpunkte im Inhalt.**
'use client'

import * as React from 'react'
import Link from 'next/link'
import { Icon, Pill } from '@lumeos/ui'

import {
  DRAFT_NAV, type DraftBereich, type DraftKind,
} from './portal-draft-nav'
// G-409/A5: die Modale der Vorlage.
import { DraftModal } from './draft/modal-huelle'

/** Die Zaehler, aus echten Zeilen — nie erfunden. */
export type DraftZaehler = Partial<Record<
  'athletes' | 'checkins' | 'alerts' | 'inbox', number>>

/**
 * Die Seitenleiste — nur Eltern.
 *
 * `[cmd]` **Nach `:119-186`:** Marke oben, Nutzerzeile, vier Gruppen,
 * Workspaces, Statuszeile, und der Weg zurueck nach LumeOS.
 */
function Leiste({ bereich, zaehler, email }: {
  bereich: string
  zaehler: DraftZaehler
  email: string
}) {
  return (
    <aside className="dp-leiste">
      {/* `:124-130` — Marke */}
      <div className="dp-marke">
        <div className="dp-marke-zeichen">C</div>
        <div style={{ minWidth: 0 }}>
          <div className="dp-marke-name">Coach Portal</div>
          <div className="dp-dim dp-mono">coach.lumeos.app</div>
        </div>
      </div>

      {/* `:132-140` — die angemeldete Person.
          `[cmd]` **Der Draft schreibt „Tom Müller · head coach"** —
          Vorfuehrmaterial. `[read]` **Hier steht die echte Adresse**,
          wie ueberall im Haus (G-402/A11). */}
      <div className="dp-nutzer-huelle">
        <div className="dp-nutzer">
          <div className="dp-nutzer-zeichen">
            {email.slice(0, 2).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="dp-nutzer-name">{email}</div>
            <div className="dp-dim dp-mono">head coach</div>
          </div>
        </div>
      </div>

      {/* `:142-154` — vier Gruppen, nur Eltern */}
      <nav className="dp-nav" aria-label="Portalbereiche">
        {DRAFT_NAV.map(g => (
          <div key={g.grp} className="dp-gruppe">
            <div className="dp-gruppe-titel">{g.grp}</div>
            {g.bereiche.map(b => {
              // `[read]` **Die Zahl kommt aus den Daten, wo es welche
              // gibt** — sonst die des Drafts, mit Marke. **E-72: eine
              // Null wird nicht gezeichnet.**
              const echt = zaehler[b.id as keyof DraftZaehler]
              const zahl = typeof echt === 'number' ? echt : undefined
              const zeigt = zahl != null ? zahl > 0 : Boolean(b.badge)
              return (
                <Link
                  key={b.id}
                  href={`/?draft=${b.id}`}
                  className={`dp-eintrag${bereich === b.id ? ' dp-aktiv' : ''}`}
                  aria-current={bereich === b.id ? 'page' : undefined}
                >
                  <span className="dp-eintrag-icon"><Icon name={b.icon} /></span>
                  {b.label}
                  {zeigt && (
                    <span
                      className="dp-badge"
                      data-variante={b.badgeVariant}
                      // `[read]` **Der Titel sagt, woher die Zahl
                      // kommt** — sonst haelt man eine Draftzahl fuer
                      // eine gemessene.
                      title={zahl != null
                        ? 'aus der Datenbank gezaehlt'
                        : `aus dem Draft (CP_NAV) — es gibt keine Daten dafuer`}
                    >
                      {zahl ?? b.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}

        {/* `:155-162` — Workspaces */}
        <div className="dp-gruppe">
          <div className="dp-gruppe-titel">Workspaces</div>
          <a
            className="dp-eintrag"
            href="http://localhost:3200"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="dp-eintrag-icon"><Icon name="dashboard" /></span>
            LumeOS
            <Icon name="arrow_right" className="v2-ic v2-ic-sm dp-aussen" />
          </a>
        </div>
      </nav>

      {/* `:165-169` — Statuszeile.
          `[read]` **Der Draft schreibt „API 5600 · healthy"** — eine
          Zahl ohne Quelle. `[cmd]` **Hier steht der Port, den diese
          Anwendung wirklich bedient.** */}
      <div className="dp-status">
        <span className="dp-punkt" />
        <span className="dp-dim dp-mono">Port 3220 · erreichbar</span>
      </div>

      {/* `:172-185` — zurueck nach LumeOS */}
      <div className="dp-zurueck-huelle">
        <a className="dp-zurueck" href="http://localhost:3200" target="_blank" rel="noopener noreferrer">
          <div className="dp-zurueck-zeichen">L</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="dp-zurueck-name">LumeOS</div>
            <div className="dp-dim dp-mono">your own training</div>
          </div>
          <Icon name="arrow_right" className="v2-ic v2-ic-sm dp-aussen" />
        </a>
      </div>
    </aside>
  )
}

/**
 * Die Kopfzeile — `:190-213`.
 *
 * `[read]` **Brotkrume, Athletenzahl, Glocke, Modus, Kontextschalter,
 * zwei Knoepfe.** **Was kein Ziel hat, ist abgeschaltet** (C-426).
 */
function Kopfzeile({ b, kind, athleten, rechtsOffen, umschalten }: {
  b: DraftBereich
  kind: DraftKind | null
  athleten: number
  rechtsOffen: boolean
  umschalten: () => void
}) {
  return (
    <div className="dp-kopfzeile">
      <span className="dp-marke-coach">COACH</span>
      <span className="dp-brot">{b.titel}</span>
      {kind && (
        <>
          <span className="dp-dim">/</span>
          <span className="dp-dim dp-brot-kind">{kind.label}</span>
        </>
      )}
      <div className="dp-spacer" />
      <Pill variant="pos" dot>{`${athleten} athletes`}</Pill>
      <Link className="dp-icon-knopf" href="/?draft=inbox" title="Notifications">
        <Icon name="bell" className="v2-ic" />
      </Link>
      <button
        type="button"
        className={`dp-icon-knopf${rechtsOffen ? ' dp-an' : ''}`}
        onClick={umschalten}
        title="Kontextspalte umschalten"
        aria-pressed={rechtsOffen}
      >
        <Icon name="layers" className="v2-ic" />
      </button>
      <button
        type="button" className="v2-btn" disabled
        title={'Attrappe — module-coach-portal-shell.jsx:211 · wartet auf: '
          + 'einen Schreibweg fuer Rundnachrichten; coach.messages traegt '
          + 'je Zeile genau einen Klienten'}
      >
        <Icon name="message" className="v2-ic v2-ic-sm" />Broadcast
      </button>
      <button
        type="button" className="v2-btn v2-btn-primary" disabled
        title="Attrappe — module-coach-portal-shell.jsx:212 · wartet auf: eine Tabelle fuer Plaene"
      >
        <Icon name="plus" className="v2-ic v2-ic-sm" />New plan
      </button>
    </div>
  )
}

/**
 * Der Modulkopf — `:216-233`.
 *
 * `[cmd]` **Pills und Aktionen kommen aus `CP_META`** — je Bereich
 * zwei oder drei Pills, ein oder zwei Aktionen.
 *
 * `[read]` **Die Pills tragen die Zahlen des Drafts**, wo es keine
 * Daten gibt. **Der Titel jeder solchen Pill sagt das** — sonst
 * haelt man sie fuer gemessen.
 */
function Modulkopf({ b, echt }: { b: DraftBereich, echt: Record<string, string> }) {
  return (
    <div className="v2-module-header v2-module-hero-lite">
      <div className="v2-module-title-block">
        <div className="v2-module-title-row">
          <span className="v2-module-title">{b.titel}</span>
          {b.pills.map(([v, l]) => {
            const gemessen = echt[l]
            return (
              // `PillProps` kennt kein `title` (gemessen an
              // `packages/ui/src/primitives.tsx:101`). Die Huelle
              // traegt es — das Paket bleibt unangetastet, und der
              // Vermerk, ob die Zahl gemessen oder aus dem Draft
              // ist, geht nicht verloren.
              <span
                key={l}
                title={gemessen
                  ? 'aus der Datenbank gezaehlt'
                  : 'aus dem Draft (CP_META) — es gibt keine Daten dafuer'}
                data-echt={gemessen ? 'ja' : undefined}
              >
                <Pill variant={(v || undefined) as 'acc' | 'warn' | 'pos' | 'neg' | undefined}>
                  {gemessen ?? l}
                </Pill>
              </span>
            )
          })}
        </div>
        {/* ══ Auch die Unterzeile traegt Zahlen ══════════════════
            `[cmd]` **Am Schirm gefunden, nicht im Quelltext:** unter
            der Pill „2 active" stand „14 active clients" — eine
            gemessene und eine erfundene Zahl, zwei Zeilen
            uebereinander. `[cmd]` **Eine einzige Unterzeile traegt
            eine Zahl** (`portal-draft-nav.ts:112`), die anderen
            zehn sind Text.
            `[read]` **Derselbe Weg wie bei den Pills** — steht der
            Text in `echt`, wird er ersetzt; sonst sagt der Titel,
            dass er aus dem Draft stammt. */}
        <div
          className="v2-module-sub"
          title={echt[b.sub] ? 'aus der Datenbank gezaehlt' : undefined}
          data-echt={echt[b.sub] ? 'ja' : undefined}
        >
          {echt[b.sub] ?? b.sub}
        </div>
      </div>
      <div className="v2-module-actions">
        {b.aktionen.map(([ic, l], i) => (
          <button
            key={l}
            type="button"
            className={i === b.aktionen.length - 1 ? 'v2-btn v2-btn-primary' : 'v2-btn'}
            disabled
            title={`Attrappe — CP_META.${b.id} · kein Schreibweg`}
          >
            <Icon name={ic} className="v2-ic v2-ic-sm" /> {l}
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * Die Unternavigation — `:235-241`, IM INHALT.
 *
 * `[read]` **Das ist die Regel aus Zeile 2**: die Seitenleiste
 * fuehrt elf Bereiche, die 35 Unterpunkte stehen hier.
 */
function Unternav({ b, aktiv }: { b: DraftBereich, aktiv: string }) {
  if (!b.kinder) return null
  return (
    // ══ G-407: `v2-tabs-rail`, nicht `v2-tabs` ═══════════════════
    //
    // `[cmd]` **Die Vorlage benutzt die Schiene:** `shared.jsx:197`
    // rendert `<div className="tabs tabs-rail">`. `[cmd]` **Und
    // `styles.css:1040` gibt ihr `overflow-x: auto`, `:1050` gibt
    // dem Reiter `white-space: nowrap`.**
    //
    // `[read]` **Die Vorlage beantwortet die Frage also selbst:
    // waagerecht scrollen, eine Zeile.** `[cmd]` **Und das Paket
    // traegt es laengst** (`v2.css:1069`) — G-405 hat nur die
    // falsche der beiden Klassen gerufen und den Mangel dann in
    // apps/coach nachgebaut.
    <nav className="v2-tabs v2-tabs-rail" aria-label={`${b.titel} — Unterpunkte`}>
      {b.kinder.map(k => (
        <Link
          key={k.id}
          href={`/?draft=${b.id}&kind=${k.id}`}
          className={`v2-tab ${k.id === aktiv ? 'v2-active' : ''}`.trim()}
          aria-current={k.id === aktiv ? 'page' : undefined}
        >
          {k.label}
          {/* `[read]` **Ein Punkt markiert, was nur Form ist** — man
              sieht vor dem Klick, ob dahinter Daten liegen. */}
          {k.art === 'attrappe' && <span className="dp-tab-punkt" title="Attrappe" />}
        </Link>
      ))}
    </nav>
  )
}

export function DraftSchale({
  bereich, kind, rechtsOffen, athleten, email, zaehler, echtePills,
  kontext, children,
}: {
  bereich: DraftBereich
  kind: DraftKind | null
  rechtsOffen: boolean
  athleten: number
  email: string
  zaehler: DraftZaehler
  echtePills: Record<string, string>
  kontext: React.ReactNode
  children: React.ReactNode
}) {
  // `[read]` **Der Schalter lebt im Browser** — er aendert nichts an
  // den Daten, also braucht er keinen Weg in die Adresse.
  const [offen, setOffen] = React.useState(rechtsOffen)

  return (
    <div className="dp-app" data-rechts={offen ? 'offen' : 'zu'}>
      <Leiste bereich={bereich.id} zaehler={zaehler} email={email} />

      <div className="dp-inhalt-huelle">
        <Kopfzeile
          b={bereich}
          kind={kind}
          athleten={athleten}
          rechtsOffen={offen}
          umschalten={() => setOffen(o => !o)}
        />
        <div className="dp-inhalt">
          <Modulkopf b={bereich} echt={echtePills} />
          <Unternav b={bereich} aktiv={kind?.id ?? bereich.id} />
          {children}
        </div>
      </div>

      {offen && kontext}

      {/* ══ G-409/A5: die dreizehn Modale ═════════════════════
          `[read]` **Am Ende der Schale, ueber allem** — genau wie
          in der Vorlage (`shell.jsx:288`). `[cmd]` **Welches offen
          ist, sagt `&modal=` in der Adresse.** */}
      <React.Suspense fallback={null}>
        <DraftModal />
      </React.Suspense>
    </div>
  )
}
