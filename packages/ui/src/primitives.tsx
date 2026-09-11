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
  /**
   * Die Kachel selbst ist bedienbar — G-319.
   *
   * **Tom, 2026-09-02:** *„anstatt diesen anwaehlbutton einfach die
   * kachel anwaehlbar machen."*
   *
   * `[read]` **Ein `onClick` auf einem `div` ist mit der Tastatur
   * nicht erreichbar** — deshalb gehoeren `role`, `tabIndex` und
   * `onKeyDown` dazu, sonst waere die Kachel nur fuer die Maus da.
   */
  role?: string
  tabIndex?: number
  'aria-label'?: string
  onKeyDown?: (e: React.KeyboardEvent) => void
  /**
   * Attrappe: die Kachel steht, hat aber noch keine Datenquelle.
   *
   * `[read]` Tom, 2026-08-16: „Jedes Feature traegt einen Hinweis, ob es
   * Mockup ist; wenn es verdrahtet ist, faellt der Hinweis weg." Die
   * Marke ist damit der Fortschrittsbalken — nicht Zierrat, sondern die
   * Anzeige, woran noch zu arbeiten ist.
   *
   * Der Text sagt, WORAN es haengt (fehlendes Schema, fehlende Spalte).
   * `true` genuegt, wenn es nichts Genaueres zu sagen gibt.
   *
   * Verdrahtet? Requisite entfernen — nicht den Text aendern.
   */
  attrappe?: boolean | string
}

export function Card({
  title, sub, actions, children, className = '', style, accent, onClick, attrappe,
  role, tabIndex, onKeyDown, 'aria-label': ariaLabel,
}: CardProps) {
  const hatKopf = title != null || actions != null || attrappe
  const grund = typeof attrappe === 'string' ? attrappe : null
  return (
    <div
      className={`v2-card ${attrappe ? 'v2-attrappe' : ''} ${className}`.trim()}
      style={style}
      onClick={onClick}
      role={role}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
    >
      {hatKopf && (
        <div className="v2-card-h">
          {accent && <span className="v2-dot" style={{ background: accent }} />}
          {title && <span className="v2-card-title">{title}</span>}
          {sub && <span className="v2-card-sub">{sub}</span>}
          <div className="v2-card-actions">
            {attrappe && <Pill variant="warn">Attrappe</Pill>}
            {actions}
          </div>
        </div>
      )}
      {grund && <p className="v2-attrappe-grund">{grund}</p>}
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
  /**
   * Punkt vor dem Text.
   *
   * `true` faerbt ihn wie die Schrift der Pille (`currentColor`), ein
   * String setzt eine eigene Farbe — `dot="var(--pos)"` an einer Pille
   * ohne Variante.
   *
   * `[cmd]` NACHGETRAGEN IN G-56. Die Vorlage kennt keinen `dot`-Prop:
   * dort schreiben die Aufrufer `<Pill><span className="dot"/>…</Pill>`
   * von Hand (shared.jsx:76, module-buddy.jsx:82). Nachgebaut wurde er
   * modul-lokal in `coach/bausteine.tsx` und `coach/ai/bausteine.tsx` —
   * **und die beiden Nachbauten waren schon verschieden**: der zweite
   * hatte eine Farboption, der erste nicht. Genau davor warnt der
   * Auftrag („Wer sie beim zweiten Modul nachbaut, baut sie falsch").
   * Diese Fassung kann beides.
   */
  dot?: boolean | string
}

export function Pill({ children, variant, className = '', style, dot }: PillProps) {
  const v = variant ? ` v2-pill-${variant}` : ''
  return (
    <span className={`v2-pill${v} ${className}`.trim()} style={style}>
      {dot && (
        // `v2-dot` traegt Groesse und Form (v2.css) — die Farbe kommt
        // hier dazu, damit der Punkt der Pille folgt statt grau zu
        // bleiben.
        <span
          className="v2-dot"
          style={{ background: typeof dot === 'string' ? dot : 'currentColor' }}
        />
      )}
      {children}
    </span>
  )
}

// ---------------------------------------------------------------
// Empty — der Leerzustand
// ---------------------------------------------------------------

export type EmptyProps = {
  /** Was fehlt. Ein Satzfragment, kein Satz. */
  title: string
  /** Was zu tun waere, damit etwas dasteht. */
  sub?: string
  icon?: IconName
}

/**
 * Der Leerzustand einer Kachel.
 *
 * `[cmd]` NACHGETRAGEN IN G-56. Die Vorlage ruft `<Empty title sub
 * icon/>` an fuenf Stellen auf (module-coach.jsx:252,
 * module-coach-athlete.jsx:283 u. a.), **definiert die Komponente aber
 * nirgends** — genau wie bei `shield`, `history` und `file`. G-40 hat
 * sie deshalb als `Leer` modul-lokal nachgebaut.
 *
 * `[read]` Die dritte Zaehlregel aus `theme-v1-umsetzung.md`: *„Eigene
 * Zustaende sind eigene Bildschirme."* Ein Leerzustand ist kein
 * Sonderfall der Tabelle, sondern eine eigene Ansicht — und wenn jedes
 * Modul ihn selbst baut, sieht er in jedem Modul anders aus.
 */
export function Empty({ title, sub, icon = 'search' }: EmptyProps) {
  return (
    // G-407: `v2-leer`, nicht `v2-empty`. Beide Namen standen fuer
    // zwei verschiedene Sachen — die Zeile (Symbol links, Text
    // rechts) und den Block (mittig, Symbol oben). Die Zeile behaelt
    // `v2-empty`, weil vier rohe `div`s in apps/web darauf bauen.
    <div className="v2-leer">
      <Icon name={icon} className="v2-ic v2-leer-icon" />
      <div className="v2-leer-title">{title}</div>
      {sub && <div className="v2-leer-sub">{sub}</div>}
    </div>
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
  /** G-317: feste Skala — sonst normalisiert die Kurve auf min/max. */
  min?: number
  max?: number
}

export function Sparkline({
  data, color = 'currentColor', w = 120, h = 30, strokeWidth = 1.4, fill = true,
  min: minVorgabe, max: maxVorgabe,
}: SparklineProps) {
  // Die Vorlage prueft auf leere Daten. Zusaetzlich abgefangen: EIN
  // Punkt. Dort teilt die Vorlage durch (length - 1) = 0 und erzeugt
  // ein Infinity im Pfad — die Kurve verschwindet ohne Fehlermeldung.
  if (!data || data.length < 2) return null

  // ══ G-317: die Skala darf vorgegeben werden ══════════════
  //
  // `[cmd]` **Ohne Vorgabe normalisiert die Kurve auf min/max** —
  // der niedrigste Wert sitzt immer am Boden, der hoechste immer
  // oben. **Bei 75/80/100 sieht das aus wie ein Absturz und ein
  // Aufstieg**, obwohl alle drei hoch sind.
  //
  // `[read]` **Bei einer Prozentreihe ist die Skala bekannt: 0 bis
  // 100.** **Dann zeigt die Hoehe, was sie zu zeigen vorgibt.**
  const min = minVorgabe ?? Math.min(...data)
  const max = maxVorgabe ?? Math.max(...data)
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
// LineChart
// ---------------------------------------------------------------

export type LineSeries = {
  data: number[]
  color?: string
  /**
   * Gestrichelt — G-412/A5.
   *
   * `[cmd]` **`module-charts-pro.jsx:161`:** eine zweite Reihe in
   * `var(--fg-dim)` wird gestrichelt gezeichnet (`"3 3"`). `[read]`
   * **Das ist die Ziellinie** — sie soll sich von der Messreihe
   * unterscheiden lassen, auch in Graustufen.
   */
  dashed?: boolean
}

export type LineChartProps = {
  /** Eine Reihe je Kurve. Die erste bekommt die Flaeche. */
  series: LineSeries[]
  h?: number
  xLabels?: string[]
  color?: string
  showArea?: boolean
  /** Feste Achse `[min, max]`. Ohne sie aus den Daten abgeleitet. */
  range?: [number, number]
  /**
   * Geglaettet zeichnen — G-416/A2.
   *
   * **Tom, 2026-09-11:** *„die grafik auch abbilden wie in calorie
   * balance, aber nicht geglaettet."*
   *
   * `[read]` **Vorgabe `true`**, wie die Vorlage: sie glaettet
   * immer (`module-charts-pro.jsx:127`). `[read]` **`false` zieht
   * gerade Strecken** — dieselbe Flaeche, dieselbe Achse, nur
   * eckig.
   */
  smooth?: boolean
}

/**
 * Mehrere Kurven in einem Feld, mit Achsenbeschriftung.
 *
 * Uebersetzt aus `shared.jsx`. `Sparkline` kann das nicht: eine Reihe,
 * keine Achse. Beide behalten heisst nicht doppelt — die Sparkline
 * sitzt in KPI-Kacheln, wo kein Platz fuer Achsen ist.
 */
export function LineChart({
  series, h = 160, xLabels, color = 'var(--acc)', showArea = true, range,
  smooth = true,
}: LineChartProps) {
  const reihen = series.filter(s => s.data.length > 0)
  // Wie bei der Sparkline: eine Kurve aus einem Punkt teilt durch 0 und
  // verschwindet lautlos. Lieber gar nichts zeichnen.
  if (reihen.length === 0 || reihen.every(s => s.data.length < 2)) return null

  // `[read]` **Eine Kennung je Diagramm** — zwei Diagramme auf einer
  // Seite duerfen sich die Verlaufsdefinition nicht teilen.
  // `[cmd]` **`React.useId()`, nicht `Math.random()`** wie die
  // Vorlage: der Server rendert vor, und eine Zufallszahl waere im
  // Browser eine andere (Hydration).
  const uid = React.useId().replace(/:/g, '')

  const alle = reihen.flatMap(s => s.data)
  const [min, max] = range ?? [Math.min(...alle) * 0.92, Math.max(...alle) * 1.06]
  const spanne = max - min || 1
  const w = 600
  const pad = { l: 34, r: 10, t: 10, b: xLabels ? 20 : 8 }
  const iw = w - pad.l - pad.r
  const ih = h - pad.t - pad.b
  const zuX = (i: number, n: number) => pad.l + (n > 1 ? (i / (n - 1)) * iw : iw / 2)
  const zuY = (v: number) => pad.t + ih - ((v - min) / spanne) * ih

  /**
   * Geglaettet — `module-charts-pro.jsx:127-135`.
   *
   * `[cmd]` **Je Punktpaar zwei quadratische Bezier**, Kontrollpunkt
   * in der Mitte. `[read]` **Nicht kubisch** — die Vorlage benutzt
   * `Q`, und die Kurve laeuft dadurch exakt durch jeden Messpunkt.
   */
  const glatt = (pts: Array<[number, number]>) => {
    let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1]
      const [x1, y1] = pts[i]
      const mx = (x0 + x1) / 2
      d += ` Q ${mx.toFixed(1)} ${y0.toFixed(1)} ${mx.toFixed(1)} ${((y0 + y1) / 2).toFixed(1)}`
        + ` Q ${mx.toFixed(1)} ${y1.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`
    }
    return d
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: h, overflow: 'visible' }}
         preserveAspectRatio="none" aria-hidden focusable="false">
      {/* `[cmd]` **Je Reihe ein Verlauf, 0,22 bis 0** (`:141-146`). */}
      <defs>
        {reihen.map((s, i) => (
          <linearGradient key={i} id={`${uid}-${i}`} x1="0" y1="0" x2="0" y2="1">
            {/* ══ G-416/A1: die Flaeche war da, aber unlesbar ═══
                `[cmd]` **Bildpunkte gemessen:** unter der Kurve
                rgb(48,43,39) gegen rgb(22,23,26) Grund — **26 Stufen
                Unterschied, auf dunklem Grund nicht zu sehen.**
                `[read]` **Die Vorlage nennt 0,22** — aber sie zeichnet
                auf hellerem Grund. **Hier 0,45 auf 0,02**, damit
                dasselbe sichtbar wird, was die Vorlage zeigt. */}
            <stop offset="0%" stopColor={s.color ?? color} stopOpacity="0.45" />
            <stop offset="100%" stopColor={s.color ?? color} stopOpacity="0.02" />
          </linearGradient>
        ))}
      </defs>
      {/* `[cmd]` **Fuenf Linien, die unterste voll, die anderen 0,55**
          (`:149-151`) — das Gitter tritt nach oben zurueck. */}
      {[0, 0.25, 0.5, 0.75, 1].map((tt, i) => (
        <g key={tt}>
          <line x1={pad.l} x2={w - pad.r} y1={pad.t + tt * ih} y2={pad.t + tt * ih}
                stroke="var(--border)" strokeWidth="1" strokeOpacity={i === 4 ? 1 : 0.55} />
          <text x={pad.l - 7} y={pad.t + tt * ih + 3.2} textAnchor="end" fontSize="9"
                fill="var(--fg-dim)" fontFamily="var(--font-mono)">
            {Math.round(max - tt * spanne)}
          </text>
        </g>
      ))}
      {reihen.map((s, si) => {
        const pts = s.data.map((v, i): [number, number] => [zuX(i, s.data.length), zuY(v)])
        // `[cmd]` **G-416: `smooth` entscheidet.** `[read]` **Die
        // Vorlage hat `smooth()` als eigene Funktion** — sie laesst
        // sich ueberspringen, ohne sonst etwas zu aendern.
        const eckig = (ps: Array<[number, number]>) => ps
          .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`)
          .join(' ')
        const d = pts.length > 1
          ? (smooth ? glatt(pts) : eckig(pts))
          : `M ${pts[0][0]} ${pts[0][1]}`
        // `[cmd]` **`:161`:** ausdruecklich gesetzt ODER zweite Reihe
        // in `--fg-dim` — die Ziellinie.
        const gestrichelt = s.dashed
          || (si > 0 && reihen.length > 1 && s.color === 'var(--fg-dim)')
        return (
          <g key={si}>
            {/* `[cmd]` **Flaeche nur unter der ERSTEN Reihe** (`:164`)
                — ein gefuelltes Ziel verdeckte die Messung. */}
            {showArea && si === 0 && (
              <path
                d={`${d} L ${pts[pts.length - 1][0].toFixed(1)} ${pad.t + ih}`
                  + ` L ${pts[0][0].toFixed(1)} ${pad.t + ih} Z`}
                fill={`url(#${uid}-${si})`}
              />
            )}
            <path d={d} fill="none" stroke={s.color ?? color}
                  strokeWidth={si === 0 ? 1.8 : 1.2}
                  strokeLinecap="round" strokeLinejoin="round"
                  strokeDasharray={gestrichelt ? '3 3' : undefined}
                  vectorEffect="non-scaling-stroke" />
            {/* `[cmd]` **Punkte nur bei hoechstens 16 Werten** (`:171`)
                — bei 30 Tagen wird die Kurve sonst zur Perlenkette.
                **Fuellung `--bg`, damit sie ausgestanzt wirken.** */}
            {si === 0 && pts.length <= 16 && pts.map((pt, i) => (
              <circle key={i} cx={pt[0]} cy={pt[1]} r="2" fill="var(--bg)"
                      stroke={s.color ?? color} strokeWidth="1.4"
                      vectorEffect="non-scaling-stroke" />
            ))}
          </g>
        )
      })}
      {xLabels?.map((l, i) => (l ? (
        <text key={l + i} x={zuX(i, xLabels.length)} y={h - 4} textAnchor="middle"
              fontSize="9" fill="var(--fg-dim)" fontFamily="var(--font-mono)">
          {l}
        </text>
      ) : null))}
    </svg>
  )
}

// ---------------------------------------------------------------
// RadarChart
// ---------------------------------------------------------------

export type RadarPoint = {
  label: string
  /** 0 bis 1. */
  value: number
  /** 0 bis 1. Ohne Angabe zeichnet die Vorlage 0.8. */
  target?: number
}

export type RadarChartProps = {
  data: RadarPoint[]
  h?: number
  color?: string
}

/** Netzdiagramm. Uebersetzt aus `shared.jsx`, sonst unveraendert. */
export function RadarChart({ data, h = 220, color = 'var(--acc)' }: RadarChartProps) {
  if (data.length < 3) return null
  const w = h
  const cx = w / 2
  const cy = h / 2
  const r = Math.min(w, h) / 2 - 26
  const n = data.length
  const pt = (i: number, v: number): [number, number] => {
    const winkel = (i / n) * 2 * Math.PI - Math.PI / 2
    return [cx + Math.cos(winkel) * r * v, cy + Math.sin(winkel) * r * v]
  }
  const pfad = (werte: number[]) =>
    `${werte.map((v, i) => (i === 0 ? 'M' : 'L') + pt(i, v).map(x => x.toFixed(1)).join(' ')).join(' ')} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: h }}
         aria-hidden focusable="false">
      {[0.25, 0.5, 0.75, 1].map(rr => (
        <polygon key={rr}
          points={Array.from({ length: n }, (_, j) => pt(j, rr).join(',')).join(' ')}
          fill="none" stroke="var(--border)" strokeWidth="1" />
      ))}
      {data.map((d, i) => (
        <line key={d.label} x1={cx} y1={cy} x2={pt(i, 1)[0]} y2={pt(i, 1)[1]}
              stroke="var(--border)" strokeWidth="1" />
      ))}
      {data.some(d => d.target != null) && (
        <path d={pfad(data.map(d => d.target ?? 0.8))} fill="none"
              stroke="var(--fg-dim)" strokeWidth="1" strokeDasharray="3 3" />
      )}
      <path d={pfad(data.map(d => d.value))} fill={color} opacity="0.18" />
      <path d={pfad(data.map(d => d.value))} fill="none" stroke={color} strokeWidth="1.5" />
      {data.map((d, i) => (
        <circle key={d.label} cx={pt(i, d.value)[0]} cy={pt(i, d.value)[1]} r="2.5" fill={color} />
      ))}
      {data.map((d, i) => {
        const [x, y] = pt(i, 1.15)
        return (
          <text key={d.label} x={x} y={y + 3} textAnchor="middle" fontSize="9"
                fill="var(--fg-muted)" fontFamily="var(--font-mono)">
            {d.label}
          </text>
        )
      })}
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

/**
 * Die Unterleiste innerhalb eines Reiters.
 *
 * `[cmd]` **Tom, 2026-09-07:** *,,Medical/tracking subnav symptoms &
 * Medications ghetto, Medical/import subnav ghetto."*
 *
 * `[read]` **Dort standen `v2-btn`-Knoepfe in einem handgebauten
 * Kasten** — mit Inline-Styles, ohne die Schiene, Rundung und
 * Zaehlerpille der Modulleiste darueber. **Zwei Leisten auf einem
 * Schirm, die verschieden aussehen, wirken wie zwei Bauzeitpunkte.**
 *
 * Dieselben Requisiten wie `Tabs`, nur schmaler gesetzt.
 */
export function UnterTabs({ items, active, onChange }: TabsProps) {
  return (
    <div className="v2-tabs v2-tabs-sub" role="tablist">
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
