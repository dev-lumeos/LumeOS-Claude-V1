import { Card, EmptyState } from './cards'
import { PageHeader, SectionHeader } from './page-header'
import { StatusBadge } from './status-badge'

const moduleNotes: Record<string, { accent: string; coming: string[]; relation: string }> = {
  Coach: {
    accent: 'var(--acc-coach)',
    coming: ['Coach Portal Link', 'Athlete Freigaben', 'Proposal Review'],
    relation: 'Coach bleibt als Workspace-Handoff sichtbar, aber nicht als eingebettetes Portal.',
  },
  Recovery: {
    accent: 'var(--acc-recov)',
    coming: ['Readiness Score', 'Sleep / HRV', 'Recovery-Protokolle'],
    relation: 'Recovery liefert später Signale für Training und Tagesplanung.',
  },
  Settings: {
    accent: 'var(--acc-dash)',
    coming: ['Theme / Density Mock', 'Sync Controls Mock', 'Workspace Links'],
    relation: 'Settings ist Systemfläche, nicht Gesundheitsdaten-Modul. Theme, Sync und Workspace-Handoff sind sichtbar, aber nicht persistent.',
  },
  Supplements: {
    accent: 'var(--acc-suppl)',
    coming: ['Today Stack', 'Compliance', 'Interactions'],
    relation: 'Supplements bleibt ohne Dosierungs- oder Einnahme-Claims im Draft.',
  },
  Training: {
    accent: 'var(--acc-train)',
    coming: ['Today Plan', 'LiveWorkout', 'History / Library'],
    relation: 'Training ist späterer Downstream-Partner für Goals und Recovery.',
  },
}

export function PlaceholderPage({ moduleName }: { moduleName: string }) {
  const note = moduleNotes[moduleName] ?? moduleNotes.Settings

  return (
    <div className="space-y-4">
      <PageHeader
        badges={[
          { label: 'Backlog', tone: 'backlog' },
          { label: 'Nicht live', tone: 'mock' },
        ]}
        description={`${moduleName} ist in der Shell sichtbar, bleibt in Phase 1 aber bewusst read-only. Die Fläche zeigt Orientierung, keine Live-Daten und keine Aktionen.`}
        eyebrow={moduleName}
        title={`${moduleName} Foundation`}
      />

      <section className="lume-grid-2">
        <Card accent={note.accent} title="Modulgrenze" sub="Foundation Draft">
          <p className="text-[13px] leading-6 text-[var(--fg-muted)]">{note.relation}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge tone="readonly">Keine Writes</StatusBadge>
            <StatusBadge tone="candidate">Spec-Kontext</StatusBadge>
          </div>
        </Card>

        <Card title="Späterer Ausbau" sub="Nicht implementiert">
          <div className="space-y-2">
            {note.coming.map((item) => (
              <div className="lume-status-row" key={item}>
                <span>{item}</span>
                <StatusBadge tone="backlog">Backlog</StatusBadge>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section>
        <SectionHeader kicker="Boundary" title="Warum diese Seite leer bleibt" />
        <EmptyState
          description="Die Navigation soll vollständig sein, ohne Funktionen vorzutäuschen. Sobald ein Modul governance-korrekt freigegeben wird, kann diese Platzhalterfläche durch echte UI ersetzt werden."
          title="Keine Fake-Live-Daten"
        />
      </section>

      {moduleName === 'Settings' ? (
        <section>
          <SectionHeader kicker="Workspaces" title="Externe Apps laut Source-Spec" />
          <Card title="Workspace Links" sub="Neuer Tab / SSO später">
            <div className="space-y-2">
              {['Coach Portal · coach.lumeos.app', 'Buddy · buddy.lumeos.app', 'Marketplace · marketplace.lumeos.app', 'Admin · admin.lumeos.app'].map((item) => (
                <div className="lume-status-row" key={item}>
                  <span>{item}</span>
                  <StatusBadge tone="mock">Link Mock</StatusBadge>
                </div>
              ))}
            </div>
          </Card>
        </section>
      ) : null}
    </div>
  )
}
