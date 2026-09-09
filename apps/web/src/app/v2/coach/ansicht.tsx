'use client'

// Das Coach-Modul der Vorlage, Unterbereich „Human Coaches".
//
// QUELLE: theme-v1/module-coach.jsx (970 Zeilen) — der Rahmen.
//
// **WELCHER RAHMEN GILT:** `[cmd]` `app.jsx:126-128` fuehrt drei Faelle:
//
//     case "coach": case "coach-human": return <CoachModule />;
//     case "coach-ai":                  return <BuddyModule />;
//     case "portal":                    return <CoachPortalStandalone />;
//
// Anders als bei Recovery und Medical gibt es **keine V2-Weiche**:
// `module-coach.jsx:969` setzt `window.CoachModule` genau einmal, keine
// zweite Datei ueberschreibt es. Der Rahmen ist eindeutig.
//
// **WEN ER RUFT — rekursiv, und hier steckt die Ueberraschung:**
// `[cmd]` `CoachModule` traegt eine Variable `side = "athlete"`, die
// fest verdrahtet ist (module-coach.jsx:137). Der Rahmen enthaelt
// trotzdem den **gesamten Trainerarbeitsplatz** — `PortalOverview`,
// `PortalAthletes`, `PortalPlans`, `PortalMessages`, `PortalRevenue`,
// `PortalAlerts` stehen in derselben Datei, sind aber ueber `side` nie
// erreichbar. Sie gehoeren zu `CoachPortalStandalone`, das seit G-02
// unter WORKSPACES als externer Link steht und **nicht** hierher.
// Uebernommen ist deshalb der Athletenzweig — die zehn Tabs.
//
// **ZEHN TABS, nicht elf.** `[cmd]` module-coach.jsx:183-194 zaehlt
// zehn Eintraege. Der Auftrag nannte elf; gezaehlt sind es zehn.
// Ausfuehrlich im Bericht.
//
// GEAENDERT IST NUR DAS TECHNISCHE:
//   1. JSX ohne Typen -> TypeScript.
//   2. Klassen auf `v2-`-Praefix.
//   3. `window.X` und blosse Globale -> Importe.
//   4. Knoepfe ohne Ziel oeffnen `InEntwicklung`.
//   5. `@media`-Haltepunkte, weil die Vorlage keine hat.
//   6. `Math.random()` im QR-Muster -> festes Bitmuster (Hydration).
//
// NICHT geaendert: keine Kachel weggelassen, keine Zahl ersetzt, keine
// Anordnung angepasst.
//
// `[cmd]` **GEKIPPT, berichtigt in A-62 am 2026-08-30.** Hier stand
// *„Ein `coach`-Schema gibt es nicht — der Begriff kommt in
// `supabase/_pipeline/` in keiner SQL-Datei vor."* **Das war richtig,
// als es geschrieben wurde, und ist es seit C-119 nicht mehr:**
// `supabase/_pipeline/15_coach/` fuehrt 13 `CREATE TABLE`, die
// laufende Datenbank 12 Tabellen im Schema `coach`, und `coach` steht
// in `config.toml` unter `schemas` — also ueber PostgREST erreichbar.
//
// `[read]` **Was weiter gilt: diese Datei ist Attrappe.** Der Grund
// ist nur ein anderer — nicht *,,es gibt kein Schema"*, sondern
// *,,diese Ansicht liest es nicht"*. Die echten Kacheln liegen in
// `rechte-echt.tsx` und `uebersicht-echt.tsx`.
import * as React from 'react'
import { useTabParam } from '../../../lib/tab-url'
import {
  CoachOverviewReferenz, CoachCoachesReferenz, CoachPermissionsReferenz,
  CoachProposalsReferenz, CoachAutonomyReferenz, CoachCheckinsReferenz,
  CoachMessagesReferenz, CoachNotesReferenz, CoachOhneMockup,
  FehlendeOverviewKachel, FehlendeAutonomyKacheln, FehlendeCheckinKachel,
} from './mockup-referenz'
// ══ G-391: die zehn Karten ohne Gegenstueck ════════════════════════
import { CoachPortalReferenz } from './mockup-referenz-portal'
import {
  Card, Pill, Empty, Icon, Row, Sparkline, Tabs, type TabItem,
} from '@lumeos/ui'

import {
  // G-185: `PENDING_INVITES` ist raus (G-163-Beschluss:
  // Entwurfskonstanten bleiben nicht als Notfallanzeige stehen).
  // `[cmd]` `COACHES` und `COACH_NOTES` bleiben — sie werden ausserhalb
  // dieser Datei verwendet (tab-rechte.tsx 5x, modale.tsx 3x), das ist
  // ein eigener Punkt.
  COACHES, COACH_NOTES,
} from './daten'
import { CoachKontext, useCoach, type ModalZustand } from './kontext'
import { CoachModale } from './modale'
import { AthleteAutonomy, AthleteCheckins } from './tab-autonomie'
import { CoachOnboardingWizard } from './tab-onboarding'
import { AthletePermissionsV2, AthleteProposals } from './tab-rechte'
// G-158: Beziehungen und Nachrichten aus `coach`, statt daten.ts.
import { CoachesEcht, EinladungenEcht, ThreadsEcht } from './uebersicht-echt'
// G-90: die echten Rechte, Autonomy und beide Historien.
//
// `[cmd]` **Nur ein Typ-Import.** `rechte-read.ts` zieht ueber
// `createSessionClient` das Modul `next/headers` nach; ein Wert-Import
// von hier aus holte Server-I/O ins Browserbuendel — Typpruefung
// gruen, jede Seite HTTP 500 (G-74, G-79).
import type { CoachRechteStand } from '../../../lib/coach/rechte-read'

/** Die Marke an jeder Kachel. Ein Satz, damit er nicht driftet. */
export const ATTRAPPE =
  'Aus dem Entwurf uebernommen. Diese Kachel ist noch nicht an die vorhandenen '
  + 'Coach-Daten angebunden - die Zahlen sind erfunden.'

// [cmd] module-coach.jsx:183-194, in dieser Reihenfolge.
//
// G-158: Coaches und Messages zaehlen echt, sobald ein Stand geladen
// ist — Beziehungen und ungelesene fremde Nachrichten aus `coach`.
function tabs(stand?: CoachRechteStand): TabItem[] {
  const echt = stand?.userId != null && !stand.fehler
  const ungelesen = echt
    ? stand!.nachrichten.filter(n => n.read_at === null && n.sender_id !== stand!.userId).length
    : COACHES.filter(c => c.unread > 0).length
  return [
    { id: 'overview', label: 'Overview' },
    { id: 'coaches', label: 'Coaches', count: echt ? stand!.beziehungen.length : COACHES.length },
    { id: 'permissions', label: 'Permissions' },
    { id: 'proposals', label: 'Proposals', count: 2 },
    { id: 'autonomy', label: 'Autonomy' },
    { id: 'checkins', label: 'Check-ins' },
    { id: 'messages', label: 'Messages', count: ungelesen },
    { id: 'notes', label: 'Notes', count: COACH_NOTES.length },
    // G-185: die Zahl der ZEILENRECHTE, nicht die Gesamtzahl.
    // `[cmd]` 2 Zeilen tragen `status='invited'`, beide gehoeren
    // `sarah.seed@example.com` — `test-user` sieht 0.
    {
      id: 'invites',
      label: 'Invites',
      count: echt
        ? stand!.beziehungen.filter(b => b.status === 'invited').length
        : undefined,
    },
    { id: 'onboard', label: 'Onboarding' },
  ]
}

export function CoachAnsicht({ stand }: { stand?: CoachRechteStand }) {
  // G-117: Tab in der Adresse — Drop-in aus lib/tab-url.
  const [tab, setTab] = useTabParam('overview')
  const [modal, setModal] = React.useState<ModalZustand | null>(null)

  const kontext = React.useMemo(() => ({
    open: (m: ModalZustand) => setModal(m),
    close: () => setModal(null),
  }), [])

  // G-158/G-149-Nachtrag: der Kopf zaehlt aus dem echten Stand — der
  // Rest des Moduls ist seit G-163 echt, und der Kopf war die letzte
  // Stelle mit einer erfundenen Zahl (COACHES-Entwurfskonstante), noch
  // dazu ohne Marke. Ohne Stand: Hinweis, kein Strich und keine Null.
  const kopfEcht = stand?.userId != null && !stand.fehler
  const aktiveBeziehungen = kopfEcht
    ? stand!.beziehungen.filter(b => b.status === 'active').length
    : null
  const ungeleseneNachrichten = kopfEcht
    ? stand!.nachrichten.filter(n => n.read_at === null && n.sender_id !== stand!.userId).length
    : null

  return (
    <CoachKontext.Provider value={kontext}>
      {/* [cmd] module-coach.jsx:146-181. `module-header module-hero-lite`. */}
      <div className="v2-module-header v2-module-hero-lite">
        <div className="v2-module-title-block">
          <div className="v2-module-title-row">
            <span className="v2-module-title">Human Coaches</span>
            {kopfEcht ? (
              <>
                <Pill variant="acc">{`${aktiveBeziehungen} active`}</Pill>
                <Pill>
                  <Icon name="bell" className="v2-ic v2-ic-sm" />
                  {`${ungeleseneNachrichten} unread`}
                </Pill>
              </>
            ) : (
              <span
                title="Der Coach-Stand wurde nicht gelesen — keine Sitzung oder ein Ladefehler."
              >
                <Pill>Nicht geladen</Pill>
              </span>
            )}
          </div>
          <div className="v2-module-sub">
            Your coaches · what they see · messages · plans assigned
          </div>
        </div>
        <div className="v2-module-actions">
          <button className="v2-btn" onClick={() => kontext.open({ typ: 'scan' })}>
            <Icon name="camera" className="v2-ic v2-ic-sm" />
            Scan QR
          </button>
          {/* ── G-185: der Kopf-Knopf fuehrt aufs echte Formular ────
              `[cmd]` Er oeffnete `kontext.open({ typ: 'invite' })`,
              also das Entwurfsmodal — waehrend seit C-225 daneben das
              Formular liegt, das in `coach.relationships` schreibt.
              **Wer oben klickte, landete in einer Attrappe.**

              `[read]` **Entschieden: er bleibt und springt auf den
              Reiter mit dem Formular** — er verschwindet nicht.
              *„Invite coach"* ist die Hauptaktion des Moduls und steht
              an der auffaelligsten Stelle; ihn zu entfernen hiesse,
              den Weg zum Einladen nur noch im Fliesstext eines
              Reiters zu haben.

              `[read]` **Der Auftrag warnt zu Recht, dass ein Sprung
              auf einen anderen Reiter schlechter sein kann als kein
              Knopf — das gilt, wenn das Ziel unklar ist.** Hier ist
              das Ziel das Formular selbst, der Reiterwechsel ist
              sichtbar, und der Reiter heisst wie der Knopf. */}
          <button className="v2-btn v2-btn-primary" onClick={() => setTab('invites')}>
            <Icon name="plus" className="v2-ic v2-ic-sm" />
            Invite coach
          </button>
        </div>
      </div>

      <Tabs items={tabs(stand)} active={tab} onChange={setTab} />

      {tab === 'overview' && (
        <>
          <AthleteOverview stand={stand} />
          <FehlendeOverviewKachel />
          <CoachOverviewReferenz />
          {/* ══ G-391: die zehn ohne Gegenstueck ═══════════════
              `[cmd]` **Gemessen 2026-09-09: 62 Vorlagenkarten, 23
              gebaut, 29 in `bekanntOffen` begruendet** — bleiben
              zehn, die in keiner der beiden Listen stehen.
              `[read]` **Auf `overview`, weil sie sechs verschiedene
              Ansichten betreffen** und zusammen EINE Aussage
              tragen: was noch keine Zaehlung gesehen hat. **Sie
              einzeln ueber die Reiter zu streuen zerlegte den
              Befund in zehn Einzelteile.** */}
          <CoachPortalReferenz reiter="ohne Gegenstueck" />
        </>
      )}
      {tab === 'coaches' && (
        <>
          <AthleteCoaches stand={stand} />
          <CoachCoachesReferenz />
        </>
      )}
      {tab === 'permissions' && (
        <>
          <AthletePermissionsV2 stand={stand} />
          <CoachPermissionsReferenz />
        </>
      )}
      {tab === 'proposals' && (
        <>
          <AthleteProposals stand={stand} />
          <CoachProposalsReferenz />
        </>
      )}
      {tab === 'autonomy' && (
        <>
          <AthleteAutonomy stand={stand} />
          <FehlendeAutonomyKacheln />
          <CoachAutonomyReferenz />
        </>
      )}
      {tab === 'checkins' && (
        <>
          <AthleteCheckins stand={stand} />
          <FehlendeCheckinKachel />
          <CoachCheckinsReferenz />
        </>
      )}
      {tab === 'messages' && (
        <>
          <AthleteMessages stand={stand} />
          <CoachMessagesReferenz />
        </>
      )}
      {tab === 'notes' && (
        <>
          <AthleteNotes />
          <CoachNotesReferenz />
        </>
      )}
      {/* G-185: echte Einladungen statt Entwurfstabelle. Ohne
          geladenen Stand (keine Sitzung) bleibt der Reiter leer —
          eine erfundene Liste waere schlimmer als nichts. */}
      {tab === 'invites' && (
        <>
          {stand && <EinladungenEcht stand={stand} />}
          {/* `[cmd]` G-365: kein Mockup — G-185 hat den Reiter
              nach dem Entwurf gebaut. */}
          <CoachOhneMockup reiter="invites" />
        </>
      )}
      {tab === 'onboard' && (
        <>
          <CoachOnboardingWizard />
          <CoachOhneMockup reiter="onboard" />
        </>
      )}

      <CoachModale zustand={modal} />
    </CoachKontext.Provider>
  )
}

// ── Overview ─────────────────────────────────────────────────────────
// [cmd] module-coach.jsx:222-290.

function AthleteOverview({ stand }: { stand?: CoachRechteStand }) {
  const ctx = useCoach()
  // G-158: angemeldet und geladen zeigt die Kachel die Beziehungen aus
  // `coach.relationships` — auch als Leerzustand. Der Entwurf bleibt
  // nur ohne Sitzung stehen (Muster G-65: ein fehlendes Cookie ist
  // kein Befund).
  const echt = stand?.userId != null && !stand.fehler
  return (
    <div className="v2-grid v2-grid-15">
      <div className="v2-col-gap" style={{ gap: 14 }}>
        {echt ? <CoachesEcht stand={stand!} /> : (
          /* G-163: der Entwurf ist raus — ohne Stand steht der Grund. */
          <Card title="Your coaches">
            <Empty
              title="Nicht geladen"
              sub="Der Coach-Stand wurde nicht gelesen — keine Sitzung oder ein Ladefehler."
              icon="user"
            />
          </Card>
        )}

        <Card title="Latest from your coaches" sub={`${COACH_NOTES.length} notes`} attrappe={ATTRAPPE}>
          <div className="v2-col-gap" style={{ gap: 6 }}>
            {COACH_NOTES.slice(0, 4).map(n => (
              <div
                key={n.id}
                onClick={() => ctx.open({ typ: 'noteDet', n })}
                style={{
                  padding: 10, background: 'var(--bg-elev)',
                  border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{n.coach}</span>
                  <Pill>{n.module}</Pill>
                  <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>{n.date}</span>
                </div>
                <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.45 }}>{n.body}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="v2-col-gap" style={{ gap: 14 }}>
        {/* G-185: die Kachel „Pending invites" ist raus — sie
            zaehlte `PENDING_INVITES` und trug einen zweiten Knopf
            ins Entwurfsmodal. Die offenen Einladungen stehen im
            Reiter „Invites", aus `coach.relationships`. */}

        {/* [cmd] module-coach.jsx:262-271. Die Vorlage rechnet die Summe
            nicht, sie schreibt sie hin — €417 und +€60 stehen fest da. */}
        <Card title="Coaching balance" sub="monthly investment" attrappe={ATTRAPPE}>
          <Row label="Training" value="€180" />
          <Row label="Nutrition" value="€120" />
          <Row label="Supplements" value="€60" />
          <Row label="Medical (annualized)" value="€57" />
          <div className="v2-divider" />
          <Row label="Total" value="€417 / mo" />
          <Row label="Vs. last month" value="+€60" />
        </Card>

        <Card
          title="Trust circle"
          sub="who sees what"
          attrappe={ATTRAPPE}
          actions={<button className="v2-btn v2-btn-ghost v2-btn-sm">Edit privacy →</button>}
        >
          {COACHES.map(c => (
            <Row
              key={c.id}
              label={c.name}
              value={`${c.sharedModules.length} mod${c.sharedModules.length === 1 ? '' : 's'}`}
              sub={c.type}
            />
          ))}
        </Card>

        <Card title="Coach activity · 30d" attrappe={ATTRAPPE}>
          <Sparkline data={[3, 4, 6, 5, 7, 8, 5, 6, 7, 9, 8, 7, 6, 8]} color="var(--acc-coach)" h={40} />
          <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 11, color: 'var(--fg-muted)' }}>
            <span>Notes <span className="v2-num" style={{ color: 'var(--fg)' }}>42</span></span>
            <span>Messages <span className="v2-num" style={{ color: 'var(--fg)' }}>86</span></span>
            <span>Plan changes <span className="v2-num" style={{ color: 'var(--fg)' }}>4</span></span>
          </div>
        </Card>
      </div>
    </div>
  )
}

// ── Coaches ──────────────────────────────────────────────────────────
// [cmd] module-coach.jsx:311-347.

function AthleteCoaches({ stand }: { stand?: CoachRechteStand }) {
  const ctx = useCoach()

  // ── G-277 (2026-08-30): der Reiter zeigte vier erfundene Personen ──
  //
  // `[cmd]` **Gemessen am 2026-08-30:** `dev@lumeos.app` hat **eine
  // aktive Beziehung** zu `coach@lumeos.app` in `coach.relationships`
  // — der Reiter zeigte **vier** Coaches aus `daten.ts` (Anders
  // Lindqvist, Jana Bauer, Dr. Magnus Kessler, David Park).
  //
  // `[cmd]` **Die Reiterleiste zaehlte dabei richtig** (`Coaches 1`,
  // Zeile 99) — **nur der Inhalt kam aus dem Entwurf.** Zahl und
  // Liste widersprachen sich auf demselben Schirm.
  //
  // `[read]` **Die Ursache war ein fehlendes Prop, kein fehlender
  // Bauteil:** `CoachesEcht` steht seit G-158 fertig daneben und wird
  // in der Uebersicht benutzt. **Diese Funktion nahm `stand` gar nicht
  // entgegen** — sie konnte den Entwurf nicht verlassen, auch wenn
  // Daten dagewesen waeren.
  //
  // `[read]` **Muster G-65/G-90:** der Entwurf bleibt nur ohne Sitzung
  // stehen. Sobald gelesen wurde — auch mit null Beziehungen — gilt
  // der echte Weg mit seinem Leerzustand.
  const echt = stand?.userId != null && !stand.fehler
  if (echt) return <CoachesEcht stand={stand!} />

  return (
    <div className="v2-col-gap" style={{ gap: 12 }}>
      {COACHES.map(c => (
        <Card key={c.id} onClick={() => ctx.open({ typ: 'coachDetail', c })} style={{ cursor: 'pointer' }} attrappe={ATTRAPPE}>
          <div className="v2-coach-zeile">
            <div
              style={{
                width: 56, height: 56, borderRadius: 12, background: c.color, color: 'var(--bg)',
                display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 18, flexShrink: 0,
              }}
            >
              {c.avatar}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{c.name}</span>
                <Pill style={{ borderColor: `color-mix(in oklch, ${c.color} 35%, var(--border))`, color: c.color }}>
                  {c.type}
                </Pill>
                {c.status === 'active' && <Pill variant="pos" dot>active</Pill>}
                <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>
                  {`since ${c.since}`}
                </span>
              </div>
              <div className="v2-muted" style={{ fontSize: 12, marginBottom: 8, lineHeight: 1.45 }}>
                {`${c.title} · ${c.org}`}
              </div>
              <div className="v2-coach-kennzahlen">
                <div>
                  <div className="v2-eyebrow">Cadence</div>
                  <div>{c.cadence}</div>
                </div>
                <div>
                  <div className="v2-eyebrow">Active plan</div>
                  <div>{c.activePlan}</div>
                </div>
                <div>
                  <div className="v2-eyebrow">Fee</div>
                  <div className="v2-num">{c.fee}</div>
                </div>
                <div>
                  <div className="v2-eyebrow">Rating</div>
                  <div className="v2-num">{`${c.rating} ★`}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <span className="v2-eyebrow" style={{ marginRight: 4, alignSelf: 'center' }}>Sees</span>
                {c.sharedModules.map(m => <Pill key={m}>{m}</Pill>)}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button
                className="v2-btn"
                onClick={e => { e.stopPropagation(); ctx.open({ typ: 'thread', c }) }}
              >
                <Icon name="message" className="v2-ic v2-ic-sm" />
                {c.unread > 0 ? `Message · ${c.unread}` : 'Message'}
              </button>
              <button className="v2-btn v2-btn-ghost" onClick={e => e.stopPropagation()}>Manage</button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

// ── Messages ─────────────────────────────────────────────────────────
// [cmd] module-coach.jsx:404-434.

function AthleteMessages({ stand }: { stand?: CoachRechteStand }) {
  const ctx = useCoach()
  // G-158: Threads aus `coach.messages`, sobald ein Stand geladen ist.
  // Das rechte Panel bleibt Attrappe — einen Thread OEFFNEN gibt es
  // nicht, und Antworten waere ein Schreibweg (gemeldet).
  const echt = stand?.userId != null && !stand.fehler
  if (echt) {
    return (
      <div className="v2-coach-threads">
        <ThreadsEcht stand={stand!} />
        <ThreadPanelLeer />
      </div>
    )
  }
  return (
    <div className="v2-coach-threads">
      {/* G-163: der Threads-Entwurf ist raus. */}
      <Card title="Threads">
        <Empty
          title="Nicht geladen"
          sub="Der Nachrichten-Stand wurde nicht gelesen — keine Sitzung oder ein Ladefehler."
          icon="message"
        />
      </Card>
      <ThreadPanelLeer />
    </div>
  )
}

// G-158: das rechte Panel ist in beiden Zweigen dasselbe — und bleibt
// Attrappe: einen Thread OEFFNEN gibt es noch nicht.
function ThreadPanelLeer() {
  return (
    <Card attrappe={ATTRAPPE}>
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <Icon name="message" className="v2-ic" style={{ width: 32, height: 32, color: 'var(--fg-dim)', margin: '0 auto 10px' }} />
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Select a thread</div>
        <div className="v2-dim" style={{ fontSize: 12 }}>
          Click any coach in the left panel to open the conversation.
        </div>
      </div>
    </Card>
  )
}

// ── Notes ────────────────────────────────────────────────────────────
// [cmd] module-coach.jsx:436-472.

function AthleteNotes() {
  const ctx = useCoach()
  const [filter, setFilter] = React.useState('All')
  const modules = ['All', ...Array.from(new Set(COACH_NOTES.map(n => n.module)))]
  const gefiltert = filter === 'All' ? COACH_NOTES : COACH_NOTES.filter(n => n.module === filter)

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        <span className="v2-eyebrow" style={{ alignSelf: 'center', marginRight: 6 }}>Filter</span>
        {modules.map(m => (
          <button
            key={m}
            onClick={() => setFilter(m)}
            className={filter === m ? 'v2-pill v2-pill-acc' : 'v2-pill'}
            style={{ cursor: 'pointer', padding: '3px 10px', fontSize: 11 }}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="v2-col-gap" style={{ gap: 8 }}>
        {gefiltert.map(n => {
          const coach = COACHES.find(c => c.id === n.coachId)
          return (
            <Card key={n.id} onClick={() => ctx.open({ typ: 'noteDet', n })} style={{ cursor: 'pointer' }} attrappe={ATTRAPPE}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 32, height: 32, borderRadius: 6, background: coach?.color, color: 'var(--bg)',
                    display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 11, flexShrink: 0,
                  }}
                >
                  {coach?.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600 }}>{n.coach}</span>
                    <Pill>{n.module}</Pill>
                    {n.tags.map(t => <Pill key={t}>{t}</Pill>)}
                    <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>{n.date}</span>
                  </div>
                  <div className="v2-muted" style={{ fontSize: 12, lineHeight: 1.55 }}>{n.body}</div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// ── Invites ─────────────────────────────────────────────────
//
// `[cmd]` **G-185: hier stand eine Tabelle aus `PENDING_INVITES`**
// — erfundene Namen, erfundene Ablaufdaten, dazu zwei Zeilen fest
// im JSX (*Dr. R. Klein*, *Dr. P. Holzer*). Der Reiter zeigt jetzt
// `coach.relationships` mit `status='invited'`.
//
// `[read]` **Der Aufbau steht in `uebersicht-echt.tsx`**, neben den
// anderen echten Kacheln — und er traegt das Einladeformular aus
// C-225 in beiden Zweigen, auch im leeren.
