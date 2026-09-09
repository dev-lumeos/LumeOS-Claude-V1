// Das Coach-Portal: eine Seite, 16 Tabs — die Leiste der Vorlage
// (module-coach.jsx:923-940), serverseitig gerendert. Datengetragene
// Tabs lesen echt (lib/daten.ts), der Rest ist Leerzustand mit
// Ursache (Muster G-65) — keine Attrappe.
import { redirect } from 'next/navigation'
import { Card, Empty } from '@lumeos/ui'
import { portalStand } from '../lib/daten'
import { TabUebersicht } from '../components/tab-uebersicht'
import { TabAthleten } from '../components/tab-athleten'
import { TabCheckins } from '../components/tab-checkins'
import { TabNachrichten } from '../components/tab-nachrichten'
import { TabAlerts } from '../components/tab-alerts'
import { TabAutonomie } from '../components/tab-autonomie'
import { TabConsent } from '../components/tab-consent'
import { TabOnboarding } from '../components/tab-onboarding'
import { TabLeer, LEERE_TABS } from '../components/tab-leer'
// ══ G-398: die Mockup-Referenz unter der Linie (E-69) ══════════════
//
// `[cmd]` **Vorher: null Referenzen auf 3220** — gemessen ueber alle
// 16 Reiter. `[read]` **Eine Zeile je Reiter**, weil die Referenz
// unter dem Gebauten steht und nicht daneben.
import { TabReferenz } from '../components/tab-referenz'

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
  searchParams: { tab?: string; fehler?: string }
}) {
  const stand = await portalStand()
  if (!stand) redirect('/login')

  const tab = TABS.some(t => t.id === searchParams.tab) ? searchParams.tab! : 'overview'

  if (stand.fehler) {
    return (
      <main className="cp-shell">
        <Kopf email={stand.email} />
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
      <main className="cp-shell">
        <Kopf email={stand.email} />
        <Card title="Kein Coach-Zugang">
          <Empty
            title="Dieses Konto fuehrt keine Coach-Beziehung"
            sub="Der Einlass folgt bis zur Entscheidung T2 der Beziehungstabelle: wer keinen Klienten hat, sieht hier nichts."
          />
        </Card>
      </main>
    )
  }

  const zaehler: Record<string, number | undefined> = {
    athletes: stand.klienten.length,
    alerts: stand.alerts.filter(a => a.status !== 'done').length,
    workflows: stand.checkins.filter(c => c.status === 'submitted').length,
    messages: stand.nachrichten.filter(n => n.read_at === null && n.sender_id !== stand.userId).length,
  }

  return (
    <main className="cp-shell">
      <Kopf email={stand.email} />
      <nav className="cp-tabs" aria-label="Portal-Bereiche">
        {TABS.map(t => (
          <a
            key={t.id}
            className={`cp-tab${tab === t.id ? ' cp-aktiv' : ''}`}
            href={`/?tab=${t.id}`}
            aria-current={tab === t.id ? 'page' : undefined}
          >
            {t.label}
            {zaehler[t.id] ? <span className="cp-zaehler">{zaehler[t.id]}</span> : null}
          </a>
        ))}
      </nav>

      {searchParams.fehler && (
        <p className="cp-hinweis" role="alert" style={{ color: 'var(--neg)', marginBottom: 10 }}>
          {searchParams.fehler}
        </p>
      )}

      {tab === 'overview' && <TabUebersicht stand={stand} />}
      {tab === 'athletes' && <TabAthleten stand={stand} />}
      {tab === 'alerts' && <TabAlerts stand={stand} />}
      {tab === 'autonomy' && <TabAutonomie stand={stand} />}
      {tab === 'consent' && <TabConsent stand={stand} />}
      {tab === 'workflows' && <TabCheckins stand={stand} />}
      {tab === 'onboard' && <TabOnboarding stand={stand} />}
      {tab === 'messages' && <TabNachrichten stand={stand} />}
      {tab in LEERE_TABS && <TabLeer tab={tab} />}

      {/* ══ E-69: darunter die Vorlage ═══════════════════════════
          `[read]` **Je Reiter eine Linie, je Karte eine Referenz** —
          ein Block liesse sich nicht zaehlen. **Die Kachel traegt
          ihre Stufe** (angebunden / baubar / blockiert) und den
          gemessenen Grund. */}
      <TabReferenz tab={tab} />
    </main>
  )
}

function Kopf({ email }: { email: string }) {
  return (
    <header className="cp-kopf">
      <h1>LumeOS Coach</h1>
      <span className="v2-pill">coach.lumeos.app · Port 3220</span>
      <span className="cp-konto cp-monospace">{email}</span>
    </header>
  )
}
