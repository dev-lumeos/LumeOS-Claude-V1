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

const accentProof = [
  { label: 'Dashboard', token: '--acc-dash', color: 'var(--acc-dash)', note: 'Shell landing, status, neutral steel orientation.' },
  { label: 'Nutrition', token: '--acc-nutri', color: 'var(--acc-nutri)', note: 'Diary, BLS Food Search, nutrition boundaries.' },
  { label: 'Training', token: '--acc-train', color: 'var(--acc-train)', note: 'Training plan, today, history, library.' },
  { label: 'Recovery', token: '--acc-recov', color: 'var(--acc-recov)', note: 'Readiness, sleep, HRV, recovery signals.' },
  { label: 'Supplements', token: '--acc-suppl', color: 'var(--acc-suppl)', note: 'Stack tracking, compliance, interactions.' },
  { label: 'Goals & Body', token: '--acc-goals', color: 'var(--acc-goals)', note: 'Goals, body metrics, timeline, composition.' },
  { label: 'Medical', token: '--acc-medic', color: 'var(--acc-medic)', note: 'Sensitive monitoring only, no diagnosis.' },
  { label: 'Coach', token: '--acc-coach', color: 'var(--acc-coach)', note: 'Coach workspace handoff and local draft route.' },
  { label: 'Buddy', token: '--acc-buddy', color: 'var(--acc-buddy)', note: 'Buddy workspace accent, external app link.' },
  { label: 'Marketplace', token: '--acc-mkt', color: 'var(--acc-mkt)', note: 'Marketplace workspace accent, external app link.' },
  { label: 'Admin', token: '--acc-admin', color: 'var(--acc-admin)', note: 'Admin workspace accent, role-gated external app.' },
]

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
          description="Die Navigation soll vollständig sein, ohne Funktionen vorzutäuschen. Sobald ein Modul freigegeben wird, kann diese Platzhalterfläche durch echte UI ersetzt werden."
          title="Keine Fake-Live-Daten"
        />
      </section>

      {moduleName === 'Settings' ? (
        <>
          <section>
            <SectionHeader kicker="Workspaces" title="Externe Apps laut Source-Spec" />
            <Card title="Workspace Links" sub="Neuer Tab / SSO später">
              <div className="space-y-2">
                {[
                  { label: 'Coach Portal · coach.lumeos.app', accent: 'var(--acc-coach)' },
                  { label: 'Buddy · buddy.lumeos.app', accent: 'var(--acc-buddy)' },
                  { label: 'Marketplace · marketplace.lumeos.app', accent: 'var(--acc-mkt)' },
                  { label: 'Admin · admin.lumeos.app', accent: 'var(--acc-admin)' },
                ].map((item) => (
                  <div className="lume-status-row" key={item.label}>
                    <span className="inline-flex items-center gap-2">
                      <span className="lume-proof-swatch" style={{ background: item.accent }} />
                      {item.label}
                    </span>
                    <StatusBadge tone="mock">Link Mock</StatusBadge>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          <section>
            <SectionHeader kicker="Design System" title="Module Accent Proof" />
            <Card title="SPEC_02 Accent Tokens" sub="Draft-only compliance proof">
              <div className="lume-accent-proof-grid">
                {accentProof.map((item) => (
                  <div className="lume-accent-proof-row" key={item.token} style={{ '--proof-acc': item.color } as React.CSSProperties}>
                    <span className="lume-proof-swatch" />
                    <div>
                      <div className="font-semibold text-[var(--fg)]">{item.label}</div>
                      <div className="num mt-1 text-[12px] text-[var(--proof-acc)]">{item.token}</div>
                    </div>
                    <p>{item.note}</p>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        </>
      ) : null}
    </div>
  )
}
