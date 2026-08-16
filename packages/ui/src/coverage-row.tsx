// CoverageRow — ein Naehrstoff gegen seinen Referenzwert.
//
// NEU, NICHT AUS DER VORLAGE. Der Entwurf zeigt Naehrstoffe als Zeile
// mit Balken und Prozentwert (module-nutrition-nutrients.jsx), aber
// immer als "so viel Prozent des Ziels" — eine einzige Leserichtung.
//
// [read] Das geht hier nicht. C-48 gibt vier Regeln vor, und drei davon
// betreffen genau diese Zeile:
//
//   1. Fehlzaehler duerfen nicht zu Nullen werden. Steht `missing` > 0,
//      liefert die Datenbank `reference_pct = NULL` — dann steht hier
//      KEIN Prozentwert, sondern der Hinweis, dass die Summe eine
//      Untergrenze ist.
//   2. Die Wertart entscheidet die Leserichtung. 80 % eines PRI ist zu
//      WENIG, 80 % eines UL ist gut, 110 % eines UL ist zu VIEL.
//      Dieselbe Zahl, entgegengesetzte Bedeutung.
//   3. NO_REFERENCE und NO_STANDALONE_REFERENCE sind kein "0 %".
//      [cmd] 57 Naehrstoffe gehen in einem Sammelwert auf, 21 haben
//      keinen Wert. Ein leerer Balken waere dort eine Falschaussage.
import * as React from 'react'

/** Die Leserichtung, wie sie die Datenbank liefert. */
export type ReferenceDirection = 'target' | 'upper_limit' | 'range' | 'not_applicable'

/** Der Zustand, wie ihn nutrition.daily_reference_assessment liefert. */
export type ReferenceStatus =
  | 'complete' | 'incomplete' | 'no_value'
  | 'not_applicable' | 'no_applicable_reference' | 'missing_profile'

export type CoverageRowProps = {
  name: React.ReactNode
  unit?: string
  /** Tagessumme. `null` heisst: nichts gemessen. */
  value: number | null
  /** Positionen ohne Wert fuer diesen Naehrstoff. */
  missing?: number
  status: ReferenceStatus
  direction?: ReferenceDirection
  /** Prozent des Referenzwerts. `null`, wenn die Datenbank keinen liefert. */
  percent?: number | null
  referenceMin?: number | null
  referenceMax?: number | null
  referenceKind?: string | null
  onClick?: () => void
}

/**
 * Wie ist der Prozentwert zu lesen?
 *
 * Bei `target` (PRI, AI): mehr ist besser, bis 100 %.
 * Bei `upper_limit` (UL, ALAP): weniger ist besser, ab 100 % zu viel.
 * Bei `range` (RI): dazwischen ist richtig.
 */
export function bewerte(
  direction: ReferenceDirection | undefined,
  percent: number | null | undefined,
): { ton: 'pos' | 'warn' | 'neg' | 'neutral'; text: string } {
  if (percent === null || percent === undefined) {
    return { ton: 'neutral', text: '' }
  }
  switch (direction) {
    case 'upper_limit':
      if (percent > 100) return { ton: 'neg', text: 'ueber der Obergrenze' }
      if (percent > 80) return { ton: 'warn', text: 'nahe der Obergrenze' }
      return { ton: 'pos', text: 'unter der Obergrenze' }
    case 'range':
      if (percent < 100) return { ton: 'warn', text: 'unter dem Bereich' }
      return { ton: 'pos', text: 'im Bereich' }
    case 'target':
      if (percent >= 100) return { ton: 'pos', text: 'erreicht' }
      if (percent >= 70) return { ton: 'warn', text: 'darunter' }
      return { ton: 'neg', text: 'deutlich darunter' }
    default:
      return { ton: 'neutral', text: '' }
  }
}

/** Was steht rechts, wenn kein Prozentwert zulaessig ist? */
function ersatztext(status: ReferenceStatus): string {
  switch (status) {
    case 'incomplete': return 'unvollstaendig'
    case 'no_value': return 'nicht erfasst'
    case 'not_applicable': return 'kein Einzelwert'
    case 'no_applicable_reference': return 'kein Referenzwert'
    case 'missing_profile': return 'Profil fehlt'
    default: return ''
  }
}

export function CoverageRow({
  name, unit = '', value, missing = 0, status, direction,
  percent, referenceMin, referenceMax, referenceKind, onClick,
}: CoverageRowProps) {
  const zeigtProzent = status === 'complete' && percent !== null && percent !== undefined
  const { ton, text } = bewerte(direction, zeigtProzent ? percent : null)

  // Der Balken laeuft nur, wenn es etwas zu fuellen gibt. Bei
  // "kein Einzelwert" bleibt die Bahn leer statt bei 0 % zu stehen —
  // 0 % hiesse "nichts davon gegessen", und das ist nicht gemeint.
  const balken = zeigtProzent ? Math.max(0, Math.min(percent, 150)) : null

  const tonFarbe =
    ton === 'pos' ? 'var(--pos)' :
    ton === 'warn' ? 'var(--warn)' :
    ton === 'neg' ? 'var(--neg)' : 'var(--fg-dim)'

  const Wrapper = onClick ? 'button' : 'div'

  return (
    <Wrapper
      className="v2-coverage-row"
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      <span className="v2-coverage-name">{name}</span>

      <span className="v2-coverage-value v2-num">
        {value === null ? '—' : value.toLocaleString('de-DE', { maximumFractionDigits: 1 })}
        {value !== null && unit && (
          <span className="v2-unit">{unit}</span>
        )}
      </span>

      <span className="v2-coverage-bar">
        {balken !== null ? (
          <span
            className="v2-coverage-fill"
            style={{
              width: `${Math.min(balken, 100)}%`,
              background: tonFarbe,
            }}
          />
        ) : null}
        {/* Bei einer Obergrenze markiert ein Strich die 100 % — sonst
            liest sich ein voller Balken wie ein Erfolg. */}
        {direction === 'upper_limit' && balken !== null && (
          <span className="v2-coverage-limit" />
        )}
      </span>

      <span
        className="v2-coverage-pct v2-num"
        style={{ color: zeigtProzent ? tonFarbe : 'var(--fg-dim)' }}
        title={
          zeigtProzent
            ? `${text}${referenceKind ? ` · ${referenceKind}` : ''}` +
              (referenceMin != null ? ` · Referenz ${referenceMin}${unit}` : '') +
              (referenceMax != null && referenceMax !== referenceMin ? `–${referenceMax}${unit}` : '')
            : ersatztext(status)
        }
      >
        {zeigtProzent
          ? `${percent!.toLocaleString('de-DE', { maximumFractionDigits: 0 })}%`
          : ersatztext(status)}
      </span>

      {missing > 0 && (
        <span className="v2-coverage-missing" title={`${missing} Position(en) ohne Wert`}>
          {missing} ohne Wert
        </span>
      )}
    </Wrapper>
  )
}
