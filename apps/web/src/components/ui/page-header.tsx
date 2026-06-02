import { StatusBadge } from './status-badge'

type PageHeaderProps = {
  eyebrow: string
  title: string
  description: string
  badges?: Array<{ label: string; tone?: React.ComponentProps<typeof StatusBadge>['tone'] }>
}

export function PageHeader({ badges = [], description, eyebrow, title }: PageHeaderProps) {
  return (
    <header className="lume-page-header">
      <div>
        <p className="lume-eyebrow">{eyebrow}</p>
        <h1 className="lume-page-title">{title}</h1>
        <p className="lume-page-description">{description}</p>
      </div>
      {badges.length ? (
        <div className="lume-page-badges">
          {badges.map((badge) => (
            <StatusBadge key={badge.label} tone={badge.tone}>
              {badge.label}
            </StatusBadge>
          ))}
        </div>
      ) : null}
    </header>
  )
}

export function SectionHeader({ action, kicker, title }: { action?: React.ReactNode; kicker?: string; title: string }) {
  return (
    <div className="lume-section-header">
      <div>
        {kicker ? <div className="lume-small-label">{kicker}</div> : null}
        <h2 className="lume-section-title">{title}</h2>
      </div>
      {action}
    </div>
  )
}
