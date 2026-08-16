// ProgressRing — Ist-Wert gegen ein Ziel, als Kreis.
//
// UEBERSETZT AUS DER VORLAGE (module-nutrition.jsx), wo derselbe Baustein
// ZWEIMAL steht: `DualRing` und `MacroRing`. Die beiden unterscheiden
// sich in Schriftgroessen und darin, ob ein Prozentwert unter dem Wert
// steht — sonst sind sie gleich. Hier ist es einer mit Requisiten.
//
// [read] G-02 hat `Ring` bereits uebernommen. Der zeigt EINEN Wert auf
// einer Bahn. Dieser hier zeigt zwei Dinge zugleich: was erreicht ist
// und was noch fehlt, mit einem eigenen Bogen fuer den Rest. Das ist
// ein anderer Baustein, kein Aufsatz auf `Ring`.
//
// DIE WICHTIGE ABWEICHUNG: `target` darf fehlen.
// In der Vorlage ist ein Ziel immer da (`tgt={2700}`), weil die Zahlen
// erfunden sind. [cmd] In diesem Repo gibt es keine Zieltabelle und
// kein ausgefuelltes Profil — ein Ring, der gegen ein erfundenes Ziel
// fuellt, behauptet etwas, das die Daten nicht hergeben. Ohne Ziel
// zeigt dieser Ring den Wert und sagt, dass es kein Ziel gibt.
import * as React from 'react'

export type ProgressRingProps = {
  /** Der erreichte Wert. `null` heisst: nichts gemessen. */
  value: number | null
  /** Das Ziel. Fehlt es, zeigt der Ring nur den Wert. */
  target?: number | null
  unit?: string
  size?: number
  stroke?: number
  color?: string
  /** Zeile unter dem Wert. Ohne Angabe: "von <target> <unit>". */
  label?: React.ReactNode
  /** Prozentwert unter der Beschriftung anzeigen. */
  showPercent?: boolean
  /**
   * Die Summe ist eine Untergrenze — einzelne Positionen hatten keinen
   * Wert. Der Ring zeichnet dann gestrichelt statt durchgezogen.
   */
  incomplete?: boolean
}

export function ProgressRing({
  value, target, unit = '', size = 92, stroke = 7,
  color = 'var(--acc)', label, showPercent = false, incomplete = false,
}: ProgressRingProps) {
  const r = (size - stroke) / 2
  const umfang = 2 * Math.PI * r

  const hatZiel = typeof target === 'number' && Number.isFinite(target) && target > 0
  const hatWert = typeof value === 'number' && Number.isFinite(value)

  const anteil = hatZiel && hatWert
    ? Math.max(0, Math.min(value / target, 1))
    : 0
  const darueber = hatZiel && hatWert && value > target

  const prozent = hatZiel && hatWert ? Math.round((value / target) * 100) : null

  return (
    <div className="v2-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden focusable="false">
        {/* Bahn */}
        <circle cx={size / 2} cy={size / 2} r={r}
                stroke="var(--surface-2)" strokeWidth={stroke} fill="none" />

        {/* Was noch fehlt — nur wenn es ein Ziel gibt, sonst waere
            "fehlt" eine Aussage ohne Grundlage. */}
        {hatZiel && anteil < 1 && (
          <circle cx={size / 2} cy={size / 2} r={r}
                  stroke={`color-mix(in oklch, ${color} 22%, transparent)`}
                  strokeWidth={stroke} fill="none"
                  strokeDasharray={`${umfang * (1 - anteil)} ${umfang}`}
                  strokeDashoffset={-umfang * anteil}
                  strokeLinecap="butt" />
        )}

        {/* Was erreicht ist */}
        {hatZiel && hatWert && (
          <circle cx={size / 2} cy={size / 2} r={r}
                  stroke={darueber ? 'var(--warn)' : color}
                  strokeWidth={stroke} fill="none"
                  strokeDasharray={incomplete ? `4 3` : umfang}
                  strokeDashoffset={incomplete ? 0 : umfang * (1 - anteil)}
                  strokeLinecap={incomplete ? 'butt' : 'round'}
                  style={{
                    transition: 'stroke-dashoffset 0.5s ease',
                    transform: 'rotate(-90deg)',
                    transformOrigin: '50% 50%',
                    opacity: incomplete ? 0.7 : 1,
                  }} />
        )}
      </svg>

      <div className="v2-ring-label">
        <span className="v2-v" style={{ fontSize: size >= 92 ? 21 : 19, lineHeight: 1 }}>
          {hatWert ? value.toLocaleString('de-DE') : '—'}
        </span>
        <span className="v2-l" style={{
          fontSize: 9, marginTop: 2, letterSpacing: '0.02em', textTransform: 'none',
        }}>
          {label ?? (hatZiel
            ? `/ ${target.toLocaleString('de-DE')}${unit}`
            : unit || 'kein Ziel')}
        </span>
        {showPercent && prozent !== null && (
          <span className="v2-num" style={{
            fontSize: 9, marginTop: 1,
            color: darueber ? 'var(--warn)' : 'var(--fg-dim)',
          }}>
            {prozent}%
          </span>
        )}
      </div>
    </div>
  )
}
