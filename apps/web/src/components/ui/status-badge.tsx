type StatusTone =
  | 'neutral'
  | 'candidate'
  | 'mock'
  | 'readonly'
  | 'blocked'
  | 'ready'
  | 'backlog'
  | 'default'
  | 'pos'
  | 'warn'
  | 'neg'
  | 'accent'
  | 'outline'

const toneClass: Record<StatusTone, string> = {
  neutral: 'lume-pill-neutral',
  candidate: 'lume-pill-candidate',
  mock: 'lume-pill-mock',
  readonly: 'lume-pill-readonly',
  blocked: 'lume-pill-blocked',
  ready: 'lume-pill-ready',
  backlog: 'lume-pill-backlog',
  default: 'lume-pill-default',
  pos: 'lume-pill-pos',
  warn: 'lume-pill-warn',
  neg: 'lume-pill-neg',
  accent: 'lume-pill-accent',
  outline: 'lume-pill-outline',
}

export function StatusBadge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: StatusTone }) {
  return <span className={`lume-pill ${toneClass[tone]}`}>{children}</span>
}
