import { Card, EmptyState } from '../../components/ui/cards'
import { PageHeader, SectionHeader } from '../../components/ui/page-header'
import { StatusBadge } from '../../components/ui/status-badge'

const medicalTabs = [
  'Overview',
  'Lab Results',
  'Medications',
  'History',
  'Documents',
  'Appointments',
]

const boundaryRows = [
  { label: 'Medical = Monitoring', text: 'Diese Fläche gibt keine Diagnose und keine Therapieempfehlung.', tone: 'blocked' as const, status: 'No advice' },
  { label: 'Sensitive Data', text: 'Verschlüsselung, RLS und Coach-Freigaben sind Pflicht für spätere echte Daten.', tone: 'candidate' as const, status: 'Security required' },
  { label: 'No Live Records', text: 'Keine Laborwerte, Medikamente, Termine oder Dokumente werden geladen oder gespeichert.', tone: 'readonly' as const, status: 'Read-only' },
]

export default function MedicalPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        badges={[
          { label: 'Sensitive', tone: 'blocked' },
          { label: 'Monitoring only', tone: 'readonly' },
          { label: 'Nicht live', tone: 'mock' },
        ]}
        description="Medical ist laut Source-Spec ein sensibles Core-Modul. Dieser Phase-1B-Placeholder zeigt nur die Modulgrenze: Monitoring, Datenschutz und keine medizinische Beratung."
        eyebrow="Medical"
        title="Medical Foundation"
      />

      <section className="lume-grid-3">
        {boundaryRows.map((row) => (
          <Card accent="var(--acc-medic)" key={row.label} title={row.label} sub="Boundary">
            <p className="text-[13px] leading-6 text-[var(--fg-muted)]">{row.text}</p>
            <div className="mt-4">
              <StatusBadge tone={row.tone}>{row.status}</StatusBadge>
            </div>
          </Card>
        ))}
      </section>

      <section>
        <SectionHeader kicker="Tabs laut Spec" title="Geplanter Medical-Umfang" />
        <Card>
          <div className="space-y-1">
            {medicalTabs.map((tab) => (
              <div className="lume-status-row" key={tab}>
                <span>{tab}</span>
                <StatusBadge tone="backlog">Backlog</StatusBadge>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section>
        <SectionHeader kicker="Safety" title="Keine Medical-Live-Daten" />
        <EmptyState
          description="Lab Results, Medications, Documents und Appointments bleiben leer, bis ein eigener sicherer Medical-Scope mit Datenschutz-, Security- und Permission-Review freigegeben ist."
          title="Monitoring only, not diagnosis"
        />
      </section>
    </div>
  )
}
