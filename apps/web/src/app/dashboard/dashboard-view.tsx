import { Card, MetricCard, ModuleCard } from '../../components/ui/cards'
import { PageHeader, SectionHeader } from '../../components/ui/page-header'
import { StatusBadge } from '../../components/ui/status-badge'

const focusRows = [
  { label: 'Nutrition Foundation', text: 'BLS-only Scope prüfen', status: 'Review-ready', tone: 'ready' as const },
  { label: 'Broad Nutrition DB', text: 'Meals, Recipes, MealCam bleiben Backlog', status: 'Blockiert', tone: 'blocked' as const },
  { label: 'Governance Boundary', text: 'Kein Product Truth, keine Queue', status: 'Draft', tone: 'mock' as const },
]

const flowItems = [
  { kicker: 'Heute', title: 'Shell sichtbar', text: 'Dashboard, Navigation und Modulrahmen sind lokal erreichbar.' },
  { kicker: 'Review', title: 'Nutrition Claims', text: 'BLS-Grenze und Foundation-Schema als Kandidatenmaterial prüfen.' },
  { kicker: 'Nächster Schritt', title: 'Goals Scope', text: 'Body, Zielkarten und Downstream-Relationen als UI-Konzept schärfen.' },
  { kicker: 'Grenze', title: 'Klarer Rahmen', text: 'Dieses Dashboard zeigt Mock-Daten. Echt sind Anmeldung, Nutrition-Suche und der Preferences-Schreibpfad — RLS-begrenzt.' },
]

// Geteilte View fuer / und /dashboard (Block 4, 2026-08-05).
// Vorher importierte app/page.tsx das SEITENmodul ./dashboard/page —
// Next' typedRoutes liess dadurch /dashboard aus den Routentypen fallen
// und `next build` scheiterte am eigenen Link auf /dashboard.
// Seiten importieren Views, nie andere Seitenmodule.
export function DashboardView() {
  return (
    <div className="space-y-4">
      <PageHeader
        badges={[
          { label: 'Demo / Mock', tone: 'mock' },
          { label: 'Read-only', tone: 'readonly' },
        ]}
        description="Dashboard beantwortet im Draft die Operator-Frage: Was ist heute sichtbar, was ist Review-Fokus und welche Grenzen gelten? Es zeigt keine Live-Daten und schreibt nichts."
        eyebrow="Dashboard"
        title="Heute im LumeOS"
      />

      <section className="lume-grid-4">
        {/* C-10 (2026-08-06): stand als „Routes 11". `[cmd]` Weder die
            Seitenzahl (15 page.tsx) noch die Navigationseinträge (9 hrefs)
            ergeben 11 — die Zahl war an nichts verankert und wanderte mit
            jeder neuen Route weiter weg. Statt sie neu zu raten oder je
            Aufruf zu zählen: die Aussage ohne Zahl, denn die Karte sagt
            selbst „zeigt keine Live-Daten". */}
        <MetricCard accent="var(--acc-dash)" label="Shell" note="App Shell, Topbar, Context Panel und Navigation sind sichtbar." unit="Status" value="live" />
        <MetricCard accent="var(--acc-nutri)" label="Nutrition" note="BLS-only Foundation und alte Food Search sind verlinkt." unit="Scope" value="BLS" />
        <MetricCard accent="var(--acc-goals)" label="Goals" note="Goal Cards, Body Metrics und Relationen bleiben Mock." unit="Draft" value="01" />
        <MetricCard accent="var(--warn)" label="Truth" note="Nicht freigegeben, keine Queue und keine Execution." unit="State" value="0" />
      </section>

      <section>
        <SectionHeader kicker="Today Flow" title="Heute wichtig" />
        <div className="lume-flow">
          {flowItems.map(({ kicker, text, title }) => (
            <div className="lume-flow-item" key={title}>
              <div className="lume-small-label">{kicker}</div>
              <h3 className="mt-2 text-[14px] font-semibold text-[var(--fg)]">{title}</h3>
              <p className="mt-2 text-[13px] leading-6 text-[var(--fg-muted)]">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="lume-grid-2">
        <Card accent="var(--acc-nutri)" title="Review-Fokus" sub="Source-backed">
          <div className="space-y-1">
            {focusRows.map(({ label, status, text, tone }) => (
              <div className="lume-status-row" key={label}>
                <div>
                  <div className="font-medium text-[var(--fg)]">{label}</div>
                  <div className="mt-1 text-[12px] text-[var(--fg-subtle)]">{text}</div>
                </div>
                <StatusBadge tone={tone}>{status}</StatusBadge>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Module Status" sub="Phase 1">
          <div className="grid gap-3 sm:grid-cols-2">
            <ModuleCard
              accent="var(--acc-nutri)"
              description="Foundation DB Schema, BLS-only Boundary und Broad-Backlog-Trennung prüfen."
              href="/nutrition"
              meta="BLS / Foods"
              status="Review-ready"
              title="Nutrition"
              tone="ready"
            />
            <ModuleCard
              accent="var(--acc-goals)"
              description="Ziele, Körperdaten und downstream Beziehungen sichtbar machen, ohne Live-Ziele zu behaupten."
              href="/goals"
              meta="Goals / Body"
              status="Mock"
              title="Goals"
              tone="mock"
            />
            <ModuleCard
              accent="var(--acc-medic)"
              description="Sensible Monitoring-Fläche ohne Diagnose, Therapie oder Live-Daten."
              href="/medical"
              meta="Medical"
              status="Sensitive"
              title="Medical"
              tone="blocked"
            />
            <ModuleCard
              accent="var(--acc-coach)"
              description="Coach, Buddy, Marketplace und Admin sind externe Apps, kein Embed."
              href="/settings"
              meta="Workspaces"
              status="Mock"
              title="Workspace Links"
              tone="mock"
            />
          </div>
        </Card>
      </section>

      <section className="lume-grid-2">
        <Card title="Nächste Schritte" sub="Draft Stabilisierung">
          <div className="space-y-2">
            <div className="lume-status-row">
              <span>Designrichtung gegen WebPlatform-Specs prüfen</span>
              <StatusBadge tone="candidate">Jetzt</StatusBadge>
            </div>
            <div className="lume-status-row">
              <span>Typecheck-Blocker separat klassifizieren</span>
              <StatusBadge tone="backlog">Separat</StatusBadge>
            </div>
            <div className="lume-status-row">
              <span>Scoped Draft Commit nur ohne unrelated Files</span>
              <StatusBadge tone="blocked">Noch nicht</StatusBadge>
            </div>
          </div>
        </Card>

        <Card title="Was echt ist, was Attrappe" sub="Sicherheitsrahmen">
          <p className="text-[13px] leading-6 text-[var(--fg-muted)]">
            Dieses Dashboard ist ein Produktdraft mit Mock-Daten. Echt sind heute
            die Anmeldung (Supabase Auth), die Nutrition-Lesepfade und der
            Preferences-Schreibpfad — jede Zeile durch Zeilenschutz in der
            Datenbank begrenzt. Migrationen laufen ausschliesslich über die
            versionierte Kette, nie aus dieser Oberfläche.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge tone="mock">Dashboard: Mock-Daten</StatusBadge>
            <StatusBadge tone="candidate">Echt: Auth + Nutrition</StatusBadge>
            <StatusBadge tone="readonly">Writes nur RLS-begrenzt</StatusBadge>
          </div>
        </Card>
      </section>
    </div>
  )
}
