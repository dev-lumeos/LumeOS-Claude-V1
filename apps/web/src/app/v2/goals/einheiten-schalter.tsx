'use client'

// Der Einheitenschalter — G-565/A1, E-83.
//
// ══ EIN UMSCHALTER, KEIN ZWEITES FELD ══════════════════════════════
//
// `[read]` **E-83: „Zwei Eingabefelder fuer dieselbe Groesse waere
// die Fehlerklasse aus G-529"** — zwei Namen fuer eine Sache, die
// auseinanderlaufen.
//
// `[read]` **Deshalb ein Schalter neben EINEM Feld:** derselbe Wert,
// zwei Einheiten, ein gespeicherter Wert.
//
// `[cmd]` **Gespeichert wird die Rate** (`numeric(5,3)`), nicht die
// Kilokalorienzahl — sie haengt am Gewicht und waere beim naechsten
// Wiegen falsch (E-83).
import * as React from 'react'

import {
  EINHEITEN, EINHEIT_ZEICHEN, type Rateneinheit,
} from '../../../lib/goals/zielrate-einheit'

/**
 * Die zwei Knoepfe.
 *
 * @param gewichtKg  Ohne Gewicht keine Kilokalorien — dann ist der
 *   kcal-Knopf gesperrt, **mit einem Grund daneben.**
 */
export function EinheitenSchalter({ einheit, gewichtKg, onWechsel }: {
  einheit: Rateneinheit
  gewichtKg: number | null
  onWechsel: (e: Rateneinheit) => void
}) {
  const ohneGewicht = gewichtKg === null || !Number.isFinite(gewichtKg)

  return (
    <span data-einheiten-schalter={einheit}
          style={{ display: 'inline-flex', gap: 3, alignItems: 'center' }}>
      {EINHEITEN.map(e => {
        // `[read]` **Kilokalorien brauchen ein Gewicht** — ohne es
        // waere die Zahl erfunden (E-72).
        const gesperrt = e === 'kcal' && ohneGewicht
        const an = e === einheit
        return (
          <button key={e} type="button" data-einheit={e}
                  aria-pressed={an} disabled={gesperrt}
                  title={gesperrt
                    ? 'Ohne Koerpergewicht laesst sich kein Tagesbetrag rechnen.'
                    : `Als ${EINHEIT_ZEICHEN[e]} anzeigen`}
                  onClick={() => onWechsel(e)}
                  style={{
                    padding: '2px 7px', borderRadius: 5, fontSize: 10,
                    fontFamily: 'var(--font-mono)',
                    cursor: gesperrt ? 'not-allowed' : 'pointer',
                    opacity: gesperrt ? 0.45 : 1,
                    background: an
                      ? 'color-mix(in oklch, var(--acc-goals) 14%, var(--surface))'
                      : 'transparent',
                    border: `1px solid ${an
                      ? 'color-mix(in oklch, var(--acc-goals) 40%, var(--border))'
                      : 'var(--border)'}`,
                    color: 'var(--fg)',
                    fontWeight: an ? 600 : 400,
                  }}>
            {e === 'prozent' ? '%' : 'kcal'}
          </button>
        )
      })}
    </span>
  )
}

/**
 * Die Rate in der gewaehlten Einheit, als Text.
 *
 * `[read]` **Mit Vorzeichen** — `+0,3 %` und `-0,5 %` sind
 * verschiedene Absichten, und das Pluszeichen sagt das.
 */
export function rateText(
  wert: number | null, einheit: Rateneinheit,
): string {
  if (wert === null) return '—'
  const z = einheit === 'prozent' ? String(wert) : String(wert)
  return `${wert > 0 ? '+' : ''}${z} ${EINHEIT_ZEICHEN[einheit]}`
}
