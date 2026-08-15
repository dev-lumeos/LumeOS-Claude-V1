// Geteilte Bausteine der Oberflaeche v2.
//
// UEBERSETZT AUS DER VORLAGE, nicht kopiert. Quelle:
// docs/spezifikation/10-plattform/design-system/theme-v1/shared.jsx
//
// Die Vorlage ist JSX ohne Typen, ohne Exporte, mit
// `Object.assign(window, ...)` am Ende. Hier: TypeScript, benannte
// Exporte, Requisiten mit Typen.
//
// [cmd] Diese Bausteine wiederholen sich in allen 55 Modulseiten der
// Vorlage. Wer sie im zweiten Modul nachbaut, baut sie falsch — und
// dann dreimal. Die Liste, an die sich G-03 zu halten hat, steht in
// docs/ssot/74-shell.md.
import * as React from 'react'
import { Icon, type IconName } from './icons'

// ---------------------------------------------------------------
// Card
// ---------------------------------------------------------------

export type CardProps = {
  title?: React.ReactNode
  sub?: React.ReactNode
  actions?: React.ReactNode
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
  /** Farbpunkt vor dem Titel, z. B. der Modulakzent. */
  accent?: string
  onClick?: () => void
}

export function Card({
  title, sub, actions, children, className = '', style, accent, onClick,
}: CardProps) {
  const hatKopf = title != null || actions != null
  return (
    <div className={`v2-card ${className}`.trim()} style={style} onClick={onClick}>
      {hatKopf && (
        <div className="v2-card-h">
          {accent && <span className="v2-dot" style={{ background: accent }} />}
          {title && <span className="v2-card-title">{title}</span>}
          {sub && <span className="v2-card-sub">{sub}</span>}
          <div className="v2-card-actions">{actions}</div>
        </div>
      )}
      {children}
    </div>
  )
}

// ---------------------------------------------------------------
// Pill
// ---------------------------------------------------------------

/** Die Varianten, fuer die v2.css eine Regel hat. */
export type PillVariant = 'pos' | 'warn' | 'neg' | 'acc'

export type PillProps = {
  children: React.ReactNode
  variant?: PillVariant
  className?: string
  style?: React.CSSProperties
}

export function Pill({ children, variant, className = '', style }: PillProps) {
  const v = variant ? ` v2-pill-${variant}` : ''
  return (
    <span className={`v2-pill${v} ${className}`.trim()} style={style}>
      {children}
    </span>
  )
}

// ---------------------------------------------------------------
// Sparkline
// ---------------------------------------------------------------

export type SparklineProps = {
  data: number[]
  color?: string
  w?: number
  h?: number
  strokeWidth?: number
  fill?: boolean
}

export function Sparkline({
  data, color = 'currentColor', w = 120, h = 30, strokeWidth = 1.4, fill = true,
}: SparklineProps) {
  // Die Vorlage prueft auf leere Daten. Zusaetzlich abgefangen: EIN
  // Punkt. Dort teilt die Vorlage durch (length - 1) = 0 und erzeugt
  // ein Infinity im Pfad — die Kurve verschwindet ohne Fehlermeldung.
  if (!data || data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const step = w / (data.length - 1)
  const punkte = data.map((v, i): [number, number] =>
    [i * step, h - ((v - min) / range) * (h - 4) - 2])
  const d = punkte
    .map((pt, i) => (i === 0 ? 'M' : 'L') + pt[0].toFixed(1) + ' ' + pt[1].toFixed(1))
    .join(' ')

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: h }}
         preserveAspectRatio="none" aria-hidden focusable="false">
      {fill && <path d={`${d} L ${w} ${h} L 0 ${h} Z`} fill={color} opacity="0.12" />}
      <path d={d} fill="none" stroke={color} strokeWidth={strokeWidth}
            vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

// ---------------------------------------------------------------
// KPI
// ---------------------------------------------------------------

export type KPIProps = {
  label: React.ReactNode
  value: React.ReactNode
  unit?: React.ReactNode
  delta?: React.ReactNode
  deltaVariant?: 'pos' | 'neg'
  spark?: number[]
  sparkColor?: string
}

export function KPI({
  label, value, unit, delta, deltaVariant, spark, sparkColor,
}: KPIProps) {
  return (
    <div className="v2-kpi">
      <span className="v2-kpi-acc-bar" />
      <div className="v2-kpi-label">{label}</div>
      <div className="v2-kpi-value v2-num">
        {value}
        {unit && <span className="v2-unit">{unit}</span>}
      </div>
      {delta != null && (
        <div className={`v2-kpi-delta ${deltaVariant ? `v2-${deltaVariant}` : ''}`.trim()}>
          {deltaVariant === 'pos' && <Icon name="arrow_up" className="v2-ic v2-ic-sm" />}
          {deltaVariant === 'neg' && <Icon name="arrow_down" className="v2-ic v2-ic-sm" />}
          {delta}
        </div>
      )}
      {spark && (
        <div className="v2-kpi-spark">
          <Sparkline data={spark} color={sparkColor ?? 'var(--acc)'} h={30} />
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------
// Ring
// ---------------------------------------------------------------

export type RingProps = {
  value: number
  max?: number
  size?: number
  stroke?: number
  color?: string
  track?: string
  label?: React.ReactNode
}

export function Ring({
  value, max = 100, size = 120, stroke = 8,
  color = 'var(--acc)', track = 'var(--surface-2)', label = '',
}: RingProps) {
  const r = (size - stroke) / 2
  const umfang = 2 * Math.PI * r
  // Die Vorlage deckelt nur nach oben. Ein negativer Wert erzeugte dort
  // einen Versatz groesser als der Umfang — der Ring fuellt sich
  // rueckwaerts. Hier beidseitig geklemmt.
  const anteil = Math.max(0, Math.min(max === 0 ? 0 : value / max, 1))
  return (
    <div className="v2-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden focusable="false">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track}
                strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={umfang}
          strokeDashoffset={umfang * (1 - anteil)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="v2-ring-label">
        <span className="v2-v">{value}</span>
        <span className="v2-l">{label}</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------
// Meter
// ---------------------------------------------------------------

export type MeterProps = {
  value: number
  max?: number
  color?: string
  tall?: boolean
}

export function Meter({ value, max = 100, color = 'var(--acc)', tall = false }: MeterProps) {
  const prozent = max === 0 ? 0 : Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className={`v2-meter ${tall ? 'v2-meter-tall' : ''}`.trim()}>
      <i style={{ width: `${prozent}%`, background: color }} />
    </div>
  )
}

// ---------------------------------------------------------------
// Row
// ---------------------------------------------------------------

export type RowProps = {
  label: React.ReactNode
  value: React.ReactNode
  icon?: React.ReactNode
  sub?: React.ReactNode
}

export function Row({ label, value, icon, sub }: RowProps) {
  return (
    <div className="v2-row">
      <span className="v2-row-l">
        {icon}
        {label}
        {sub && <span className="v2-dim" style={{ fontSize: 11 }}>{sub}</span>}
      </span>
      <span className="v2-row-r v2-num">{value}</span>
    </div>
  )
}

// ---------------------------------------------------------------
// ModuleHero
// ---------------------------------------------------------------

export type ModuleHeroStat = {
  label: React.ReactNode
  value: React.ReactNode
  sub?: React.ReactNode
}

export type ModuleHeroProps = {
  icon: IconName
  title: React.ReactNode
  sub?: React.ReactNode
  pills?: React.ReactNode
  actions?: React.ReactNode
  stats?: ModuleHeroStat[]
}

export function ModuleHero({ icon, title, sub, pills, actions, stats }: ModuleHeroProps) {
  return (
    <div className="v2-module-hero">
      <div className="v2-mh-medallion"><Icon name={icon} className="v2-ic" /></div>
      <div className="v2-mh-body">
        <div className="v2-mh-title-row">
          <span className="v2-mh-title">{title}</span>
          {pills}
        </div>
        {sub && <div className="v2-mh-sub">{sub}</div>}
      </div>
      {stats && (
        <div className="v2-mh-stats">
          {stats.map((s, i) => (
            <div key={i} className="v2-mh-stat">
              <div className="v2-mh-stat-l">{s.label}</div>
              <div className="v2-mh-stat-v">{s.value}</div>
              {s.sub && <div className="v2-mh-stat-s">{s.sub}</div>}
            </div>
          ))}
        </div>
      )}
      {actions && <div className="v2-mh-actions">{actions}</div>}
    </div>
  )
}

// ---------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------

export type TabItem = {
  id: string
  label: React.ReactNode
  icon?: IconName
  count?: number
}

export type TabsProps = {
  items: TabItem[]
  active: string
  onChange: (id: string) => void
}

export function Tabs({ items, active, onChange }: TabsProps) {
  // Gegenueber der Vorlage: <button> statt <div>. Ein div mit onClick
  // ist per Tastatur nicht erreichbar und fuer Hilfsmittel kein
  // Bedienelement. role/aria-selected machen die Auswahl vorlesbar.
  return (
    <div className="v2-tabs v2-tabs-rail" role="tablist">
      {items.map(t => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={active === t.id}
          className={`v2-tab ${active === t.id ? 'v2-active' : ''}`.trim()}
          onClick={() => onChange(t.id)}
        >
          {t.icon && <Icon name={t.icon} className="v2-ic v2-ic-sm" />}
          {t.label}
          {t.count != null && <span className="v2-count v2-num">{t.count}</span>}
        </button>
      ))}
    </div>
  )
}
