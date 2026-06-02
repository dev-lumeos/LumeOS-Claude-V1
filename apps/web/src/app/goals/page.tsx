import { Card, EmptyState } from '../../components/ui/cards'
import { PageHeader, SectionHeader } from '../../components/ui/page-header'
import { StatusBadge } from '../../components/ui/status-badge'

const goalBlocks = [
  { title: 'Active Goal', description: 'Zielkarten mit Progress, Deadline und verknüpften Modulen bleiben Platzhalter.', meta: 'Goal Card' },
  { title: 'Body Metrics', description: 'Gewicht, Körperfett, Muskelmasse und Maße werden nur als spätere Flächen markiert.', meta: 'Body' },
  { title: 'Coach Proposal', description: 'Coach-Vorschläge sind Entwurf, keine Autorität und keine automatische Umsetzung.', meta: 'Coach' },
  { title: 'Athlete Confirmation', description: 'Tom/Athlet bestätigt Ziele später explizit; keine Auto-Akzeptanz.', meta: 'Approval' },
  { title: 'Nutrition Relation', description: 'Nutrition kann später Targets ableiten, aber diese Phase erzeugt keine Zielwerte.', meta: 'Downstream' },
  { title: 'Training Relation', description: 'Training kann später mit Goals verknüpft werden; hier nur Kontext.', meta: 'Downstream' },
]

const tabRows = [
  { label: 'Goals', text: 'Aktive Ziele als Cards, Progress-Bars und Linked Modules.', status: 'Mock' },
  { label: 'Timeline', text: 'Gantt-ähnliche Ziel-Timeline bleibt späterer Ausbau.', status: 'Backlog' },
  { label: 'Body Metrics', text: 'Gewicht-Chart, Körperfett und Muskelmasse ohne Live-Daten.', status: 'Mock' },
  { label: 'Measurements', text: 'Körpermaße und Foto-Progression bleiben privat und nicht live.', status: 'Backlog' },
  { label: 'Composition', text: 'BMI, FFMI, BMR und TDEE als spätere Kalkulatorflächen.', status: 'Backlog' },
]

export default function GoalsPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        badges={[
          { label: 'Mock', tone: 'mock' },
          { label: 'Nicht live', tone: 'blocked' },
        ]}
        description="Goals & Body bündelt Ziel-Tracking, Körperdaten und Downstream-Beziehungen zu Nutrition und Training. Diese Phase zeigt Struktur und Grenzen, aber keine aktiven Ziele."
        eyebrow="Goals"
        title="Goals & Body Foundation"
      />

      <section className="lume-grid-2">
        <Card accent="var(--acc-goals)" title="Foundation Concept" sub="Goals / Body">
          <p className="text-[13px] leading-6 text-[var(--fg-muted)]">
            Ziele steuern spätere Nutrition- und Training-Beziehungen. Ohne Tom/Athlet-Bestätigung wird kein Ziel als aktiv behandelt.
          </p>
          <div className="mt-4 lume-progress">
            <span style={{ width: '0%' }} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge tone="candidate">Candidate</StatusBadge>
            <StatusBadge tone="readonly">No active goal</StatusBadge>
          </div>
        </Card>

        <Card title="Ownership Note" sub="Privacy / Boundary">
          <p className="text-[13px] leading-6 text-[var(--fg-muted)]">
            Body Metrics und Profile/Core Ownership müssen sauber abgegrenzt werden. Diese Seite speichert keine Körperdaten und zeigt keine privaten Fotos.
          </p>
          <div className="mt-4 space-y-2">
            <div className="lume-status-row">
              <span>Athlete Confirmation erforderlich</span>
              <StatusBadge tone="blocked">Nicht live</StatusBadge>
            </div>
            <div className="lume-status-row">
              <span>Coach darf nichts automatisch übernehmen</span>
              <StatusBadge tone="readonly">Guardrail</StatusBadge>
            </div>
          </div>
        </Card>
      </section>

      <section>
        <SectionHeader kicker="Tabs laut Spec" title="Geplanter Modulumfang" />
        <Card>
          <div className="space-y-1">
            {tabRows.map(({ label, status, text }) => (
              <div className="lume-status-row" key={label}>
                <div>
                  <div className="font-medium text-[var(--fg)]">{label}</div>
                  <div className="mt-1 text-[12px] text-[var(--fg-subtle)]">{text}</div>
                </div>
                <StatusBadge tone={status === 'Mock' ? 'mock' : 'backlog'}>{status}</StatusBadge>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section>
        <SectionHeader kicker="Foundation Blocks" title="Sichtbare Platzhalter" />
        <div className="lume-grid-3">
          {goalBlocks.map(({ description, meta, title }) => (
            <Card key={title}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="lume-small-label">{meta}</div>
                  <h3 className="mt-1 text-[15px] font-semibold text-[var(--fg)]">{title}</h3>
                </div>
                <StatusBadge tone="mock">Mock</StatusBadge>
              </div>
              <p className="mt-3 text-[13px] leading-6 text-[var(--fg-muted)]">{description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader kicker="Next Action" title="Noch keine Live-Ziele" />
        <EmptyState
          description="Goal Creator Modal, Timeline, Body Metrics und Measurements bleiben spätere Implementierung. Diese Oberfläche enthält keine Fake-Live-Daten."
          title="Read-only Goals Draft"
        />
      </section>
    </div>
  )
}
