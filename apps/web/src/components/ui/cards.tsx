import Link from 'next/link'
import type { Route } from 'next'

import { StatusBadge } from './status-badge'

type CardProps = {
  accent?: string
  children: React.ReactNode
  className?: string
  sub?: string
  title?: string
}

export function Card({ accent, children, className = '', sub, title }: CardProps) {
  return (
    <section className={`lume-card ${className}`}>
      {title ? (
        <div className="lume-card-head">
          <div className="flex min-w-0 items-center gap-2">
            {accent ? <span className="lume-accent-dot" style={{ background: accent }} /> : null}
            <h2 className="lume-card-title">{title}</h2>
          </div>
          {sub ? <p className="lume-card-sub">{sub}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  )
}

export function ModuleCard({
  description,
  href,
  meta,
  status,
  title,
  tone = 'neutral',
}: {
  title: string
  description: string
  href: string
  meta?: string
  status: string
  tone?: React.ComponentProps<typeof StatusBadge>['tone']
}) {
  return (
    <Link className="lume-module-card" href={href as Route}>
      <div className="flex items-start justify-between gap-3">
        <div>
          {meta ? <div className="lume-small-label">{meta}</div> : null}
          <h3 className="mt-1 text-[15px] font-semibold text-[var(--fg)]">{title}</h3>
        </div>
        <StatusBadge tone={tone}>{status}</StatusBadge>
      </div>
      <p className="mt-3 text-[13px] leading-6 text-[var(--fg-muted)]">{description}</p>
    </Link>
  )
}

export function EmptyState({ description, title }: { title: string; description: string }) {
  return (
    <div className="lume-empty-state">
      <h3 className="text-[13px] font-semibold text-[var(--fg)]">{title}</h3>
      <p className="mt-2 text-[13px] leading-6 text-[var(--fg-muted)]">{description}</p>
    </div>
  )
}

export function MetricCard({
  accent,
  label,
  note,
  unit,
  value,
}: {
  accent: string
  label: string
  note: string
  unit: string
  value: string
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="lume-small-label">{label}</div>
        <span className="lume-accent-dot" style={{ background: accent }} />
      </div>
      <div className="mt-3">
        <span className="num text-[28px] font-semibold leading-none text-[var(--fg)]">{value}</span>
        <span className="ml-1 text-[12px] text-[var(--fg-subtle)]">{unit}</span>
      </div>
      <p className="mt-3 text-[13px] leading-6 text-[var(--fg-muted)]">{note}</p>
    </Card>
  )
}
