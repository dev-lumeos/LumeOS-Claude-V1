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
  { kicker: 'Grenze', title: 'Keine Writes', text: 'Keine Datenbankaktion, keine Migration, keine Live-Userdaten.' },
]

export default function DashboardPage() {
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
        <MetricCard accent="var(--acc-dash)" label="Shell" note="App Shell, Topbar, Context Panel und Navigation sind sichtbar." unit="Routes" value="11" />
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

        <Card title="Grenzen / Nicht live" sub="Sicherheitsrahmen">
          <p className="text-[13px] leading-6 text-[var(--fg-muted)]">
            Diese WebPlatform-Fläche ist ein sichtbarer Produktdraft. Sie erzeugt keine Daten, liest keine Secrets, führt keine Migrationen aus und ist keine Governance-Entscheidung.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge tone="readonly">Read-only UI</StatusBadge>
            <StatusBadge tone="mock">Mock Boundaries</StatusBadge>
            <StatusBadge tone="blocked">Keine DB-Writes</StatusBadge>
          </div>
        </Card>
      </section>
    </div>
  )
}
