type StatusTone = 'neutral' | 'candidate' | 'mock' | 'readonly' | 'blocked' | 'ready' | 'backlog'

const toneClass: Record<StatusTone, string> = {
  neutral: 'lume-pill-neutral',
  candidate: 'lume-pill-candidate',
  mock: 'lume-pill-mock',
  readonly: 'lume-pill-readonly',
  blocked: 'lume-pill-blocked',
  ready: 'lume-pill-ready',
  backlog: 'lume-pill-backlog',
}

export function StatusBadge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: StatusTone }) {
  return <span className={`lume-pill ${toneClass[tone]}`}>{children}</span>
}
