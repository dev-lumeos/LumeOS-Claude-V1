// Das Coach-Portal: eine Seite, 16 Tabs — die Leiste der Vorlage
// (module-coach.jsx:923-940), serverseitig gerendert. Datengetragene
// Tabs lesen echt (lib/daten.ts), der Rest ist Leerzustand mit
// Ursache (Muster G-65) — keine Attrappe.
import { redirect } from 'next/navigation'
import { Card, Empty, Pill } from '@lumeos/ui'
import { portalStand, type PortalStand } from '../lib/daten'
import { TabUebersicht } from '../components/tab-uebersicht'
import { TabAthleten } from '../components/tab-athleten'
import { TabCheckins } from '../components/tab-checkins'
import { TabNachrichten } from '../components/tab-nachrichten'
import { TabAlerts } from '../components/tab-alerts'
import { TabAutonomie } from '../components/tab-autonomie'
import { TabConsent } from '../components/tab-consent'
import { TabOnboarding } from '../components/tab-onboarding'
import { TabLeer, LEERE_TABS } from '../components/tab-leer'
// ══ G-404: die Einstellungen des Coaches ═══════════════════════════
import { TabSettings } from '../components/tab-settings'
// ══ G-398: die Mockup-Referenz unter der Linie (E-69) ══════════════
//
// `[cmd]` **Vorher: null Referenzen auf 3220** — gemessen ueber alle
// 16 Reiter. `[read]` **Eine Zeile je Reiter**, weil die Referenz
// unter dem Gebauten steht und nicht daneben.
import { TabReferenz } from '../components/tab-referenz'
// ══ G-401: die Schale — Seitenleiste, Modulkopf, Reiterleiste ══════
import { PortalSchale, type PortalZaehler } from '../components/portal-schale'
import { alleEintraege, bereichFuerReiter } from '../components/portal-nav'
// ══ G-405: die Schale des Drafts, unter `?draft=` ══════════════════
import { DraftSeite } from '../components/portal-draft-seite'

export const dynamic = 'force-dynamic'

const TABS: { id: string; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'athletes', label: 'Athletes' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'alerts', label: 'Alerts' },
  { id: 'rules', label: 'Rules' },
  { id: 'autonomy', label: 'Autonomy' },
  { id: 'patterns', label: 'Patterns' },
  { id: 'intervene', label: 'Interventions' },
  { id: 'consent', label: 'Consent' },
  { id: 'plans', label: 'Plans' },
  { id: 'workflows', label: 'Check-ins' },
  { id: 'onboard', label: 'Onboarding' },
  { id: 'programs', label: 'Programs' },
  { id: 'messages', label: 'Messages' },
  { id: 'revenue', label: 'Revenue' },
  { id: 'team', label: 'Team & Audit' },
]

export default async function PortalSeite({
  searchParams,
}: {
  searchParams: {
    bereich?: string; tab?: string; fehler?: string
    // G-402: Suche und Filter reisen in der Adresse, nicht im
    // Browserzustand — die Reiter sind ohnehin Verweise.
    suche?: string; stand?: string
    // G-405: die Draft-Fassung. Siehe unten.
    draft?: string; kind?: string
  }
}) {
  const stand = await portalStand()
  if (!stand) redirect('/login')

  // ══ G-401: Bereich und Reiter zusammen aufloesen ═══════════════
  //
  // `[read]` **Ein `?tab=` von fruueher bleibt gueltig** — es findet
  // seinen Bereich selbst (`bereichFuerReiter`). **Kein Lesezeichen
  // wird ungueltig**, obwohl die Navigation eine Ebene bekommen hat.
  //
  // `[read]` **Der Bereich gewinnt, wenn beides steht** — wer auf
  // `?bereich=alerts` klickt, will den Bereich, nicht den alten
  // Reiter.
  const ausTab = searchParams.tab ? bereichFuerReiter(searchParams.tab) : null
  // `[read]` **Nur Bereiche MIT Reitern kommen in Frage** — die drei
  // Aussenlinks (G-404) fuehren aus dem Portal heraus und haben
  // keinen Inhalt, den `?bereich=` zeigen koennte.
  const innen = alleEintraege().filter(e => e.reiter && e.reiter.length > 0)
  const eintrag = innen.find(e => e.id === searchParams.bereich)
    ?? ausTab
    ?? innen[0]
  const reiter = eintrag.reiter ?? []
  const tab = reiter.some(r => r.id === searchParams.tab)
    ? searchParams.tab!
    : reiter[0].id
  const bereich = eintrag.id

  // ══ G-402: der Stichtag, SERVERSEITIG ═════════════════════════
  //
  // `[read]` **Die Seite ist `force-dynamic`** — sie rendert je
  // Aufruf auf dem Server. `[cmd]` **Hier ist `new Date()`
  // richtig**, im Browser waere es falsch: die Hydration rechnete
  // dann in einer anderen Zeitzone als der Server (G-74, G-390).
  //
  // `[read]` **Deshalb reist der Tag als Zeichenkette weiter**, und
  // keine Komponente fragt selbst nach der Uhr.
  const heute = new Date().toISOString().slice(0, 10)
  const suche = searchParams.suche ?? ''
  const stand_ = searchParams.stand ?? ''

  if (stand.fehler) {
    return (
      <main className="cp-inhalt">
        <SchlichterKopf email={stand.email} />
        <Card title="Portal nicht lesbar">
          <Empty
            title="Die Datenschnittstelle antwortet mit einem Fehler"
            sub={`${stand.fehler} — die Tabellen aus 150-154 muessen eingespielt und das Schema coach freigegeben sein.`}
          />
        </Card>
      </main>
    )
  }

  if (!stand.istCoach) {
    // T2 (Einlass) ist offen. Konservative Regel bis zur Entscheidung:
    // Coach ist, wer mindestens eine Beziehung fuehrt — sonst Absage
    // statt Umleitung (Muster apps/admin).
    return (
      <main className="cp-inhalt">
        <SchlichterKopf email={stand.email} />
        <Card title="Kein Coach-Zugang">
          <Empty
            title="Dieses Konto fuehrt keine Coach-Beziehung"
            sub="Der Einlass folgt bis zur Entscheidung T2 der Beziehungstabelle: wer keinen Klienten hat, sieht hier nichts."
          />
        </Card>
      </main>
    )
  }

  // ══ G-405: die Draft-Fassung ══════════════════════════════════
  //
  // **Tom, 2026-09-10:** *„wie waers wenn du das nun als mockup
  // erzeugen laesst und nicht irgend eine abhandlung davon. ich habe
  // den direkten vergleich."*
  //
  // `[read]` **`?draft=<bereich>` zeigt die Schale des Drafts** —
  // eigenes Raster, eigene Seitenleiste, eigene Kontextspalte.
  // **Die bestehende Fassung bleibt unberuehrt**, sonst gaebe es
  // nichts zu vergleichen.
  //
  // `[read]` **Erst NACH den beiden Absagen oben** — eine Draft-Schale
  // ueber einem Datenfehler saehe aus, als funktioniere sie.
  if (searchParams.draft !== undefined) {
    return (
      <DraftSeite
        stand={stand}
        bereichId={searchParams.draft}
        kindId={searchParams.kind ?? null}
        heute={heute}
        suche={suche}
        filter={stand_}
      />
    )
  }

  // ══ G-400/A3: die Zaehler der Reiterleiste ════════════════════
  //
  // `[cmd]` **Die Vorlage traegt sieben** (`module-coach.jsx:924-939`):
  // Athletes 3, Smart alerts 7, Rules 6, Plans 4, Workflows 4,
  // Programs 4, Messages 7.
  //
  // `[cmd]` **Gemessen, welche aus echten Daten rechenbar sind:**
  //
  //     athletes    ja    coach.relationships          4 aktiv
  //     alerts      ja    coach.alerts, status<>done   4 offen
  //     workflows   ja    coach.checkins, submitted    2
  //     messages    ja    coach.messages, ungelesen    4
  //     consent     ja    coach.client_permissions     Zeilen
  //     autonomy    ja    coach.client_autonomy        Zeilen
  //     onboard     ja    relationships, status=invited
  //     rules       NEIN  keine Tabelle fuer Coach-Regeln
  //     plans       NEIN  keine Tabelle fuer Plaene
  //     programs    NEIN  keine Tabelle fuer Programme
  //     ...
  //
  // `[read]` **Ein Zaehler, der nicht rechenbar ist, bleibt weg** —
  // eine erfundene Zahl in der Leiste waere schlimmer als keine.
  // ══ G-401: die Zaehler der SEITENLEISTE ═══════════════════════
  //
  // `[read]` **Die Schluessel sind jetzt die Sache, nicht der
  // Reiter** — `klienten` statt `athletes`, `ungelesen` statt
  // `messages`. `[cmd]` **Der erste Anlauf benutzte Reiter-Ids**, und
  // `PortalZaehler` fragt nach den semantischen Namen: **sechs von
  // sieben Zaehlern blieben leer, obwohl alle Zeilen da waren**
  // (2 Klienten, 1 ungelesen, 1 Check-in, 3 Alerts, 2 Rechte,
  // 2 Autonomie — gemessen). **Nur `alerts` traf zufaellig.**
  //
  // `[read]` **Am Schirm gezaehlt, nicht im Quelltext** — sonst waere
  // es nicht aufgefallen.
  const zaehler: PortalZaehler = {
    klienten: stand.klienten.filter(k => k.status === 'active').length,
    ungelesen: stand.nachrichten.filter(
      n => n.read_at === null && n.sender_id !== stand.userId).length,
    checkins: stand.checkins.filter(c => c.status === 'submitted').length,
    alerts: stand.alerts.filter(a => a.status !== 'done').length,
    rechte: stand.rechte.length,
    autonomie: stand.autonomie.length,
    einladungen: stand.klienten.filter(k => k.status === 'invited').length,
    vorschlaege: stand.pending.filter(p => p.status === 'pending').length,
  }

  return (
    <PortalSchale
      bereich={bereich}
      tab={tab}
      eintrag={eintrag}
      athleten={stand.klienten.filter(k => k.status === 'active').length}
      alerts={stand.alerts.filter(a => a.status !== 'done').length}
      email={stand.email}
      zaehler={zaehler}
    >
      {searchParams.fehler && (
        <p className="cp-hinweis" role="alert" style={{ color: 'var(--neg)', marginBottom: 10 }}>
          {searchParams.fehler}
        </p>
      )}

      {tab === 'overview' && <TabUebersicht stand={stand} />}
      {tab === 'athletes' && <TabAthleten
          stand={stand}
          heute={heute}
          suche={suche}
          filter={(['alle', 'active', 'invited', 'ended'] as const)
            .find(x => x === stand_) ?? 'alle'}
        />}
      {tab === 'alerts' && <TabAlerts
          stand={stand}
          filter={(['offen', 'alle', 'done'] as const)
            .find(x => x === stand_) ?? 'offen'}
        />}
      {tab === 'autonomy' && <TabAutonomie stand={stand} />}
      {tab === 'consent' && <TabConsent stand={stand} />}
      {tab === 'workflows' && <TabCheckins
          stand={stand}
          heute={heute}
          filter={(['offen', 'alle', 'reviewed'] as const)
            .find(x => x === stand_) ?? 'offen'}
        />}
      {tab === 'onboard' && <TabOnboarding stand={stand} />}
      {tab === 'messages' && <TabNachrichten stand={stand} />}
      {tab === 'settings' && <TabSettings stand={stand} />}
      {tab in LEERE_TABS && <TabLeer tab={tab} />}

      {/* ══ E-69: darunter die Vorlage ═══════════════════════════
          `[read]` **Je Reiter eine Linie, je Karte eine Referenz** —
          ein Block liesse sich nicht zaehlen. **Die Kachel traegt
          ihre Stufe** (angebunden / baubar / blockiert) und den
          gemessenen Grund. */}
      <TabReferenz tab={tab} />
    </PortalSchale>
  )
}

// ══ G-401/A3: der Kopf der Sonderwege ═════════════════════════════
//
// `[read]` **Der Modulkopf lebt jetzt in der Schale**
// (`portal-schale.tsx`) — er braucht den Bereich, die Athletenzahl
// und die Alerts. `[read]` **Auf dem Fehlerweg und bei der Absage
// gibt es davon nichts**, und eine Seitenleiste waere dort irrefuehrend:
// **man kommt nicht weiter, also gibt es nichts zu navigieren.**
//
// `[cmd]` **Aber `v2-module-header` statt `cp-kopf`** — A3 verlangt
// es ohne Ausnahme, und dieselben Klassen sehen hier genauso aus.
function SchlichterKopf({ email }: { email: string }) {
  return (
    <div className="v2-module-header v2-module-hero-lite">
      <div className="v2-module-title-block">
        <div className="v2-module-title-row">
          <span className="v2-module-title">Coach Portal</span>
          <Pill variant="acc">separate platform</Pill>
          <Pill className="v2-mono">coach.lumeos.app</Pill>
        </div>
      </div>
      <div className="v2-module-actions">
        <span className="cp-konto cp-monospace">{email}</span>
      </div>
    </div>
  )
}
