'use client'

// Der Buddy-Orb — fuenf Zustaende, vier Bewegungen.
//
// QUELLE: theme-v1/module-buddy.jsx:139-171 (`BuddyOrbModule`).
//
// `[cmd]` **Die Bewegung ist SVG-SMIL, kein JavaScript.** Vier
// `<animate>`-Elemente mit `repeatCount="indefinite"`. Das ist
// server- wie browserseitig identisch — keine Hydrationsabweichung,
// anders als bei einem Zeitgeber oder `Math.random()`.
//
// `[cmd]` **EINE ABWEICHUNG, und sie ist noetig:** die Vorlage
// vergibt feste Kennungen `borb-${state}` und `bblur-${state}`. Der
// Tab „Avatar states" zeigt alle fuenf Zustaende gleichzeitig, und der
// Chat zeigt zusaetzlich `responding` — **zwei Elemente mit derselben
// Kennung `borb-responding` auf einer Seite.** Dieselbe Falle wie die
// `clipPath`-Kollision der Koerperkarte in G-21; dieselbe Loesung:
// `React.useId()`.
import * as React from 'react'

const ZUSTANDSFARBE: Record<string, string> = {
  idle: 'var(--acc-buddy)',
  thinking: 'var(--acc-coach)',
  responding: 'var(--acc-recov)',
  alert: 'var(--warn)',
  celebrating: 'var(--acc-nutri)',
}

export function BuddyOrb({ state = 'idle', size = 96 }: { state?: string; size?: number }) {
  const eigen = React.useId()
  const farbe = ZUSTANDSFARBE[state] ?? 'var(--acc-buddy)'
  const orb = `borb-${eigen}`
  const blur = `bblur-${eigen}`

  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size }} aria-hidden="true">
      <defs>
        <radialGradient id={orb} cx="50%" cy="40%">
          <stop offset="0%" stopColor={farbe} stopOpacity="0.95" />
          <stop offset="100%" stopColor={farbe} stopOpacity="0.05" />
        </radialGradient>
        <filter id={blur}>
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>

      <circle cx="50" cy="50" r="42" fill={`url(#${orb})`} opacity="0.85">
        {state !== 'idle' && (
          <animate attributeName="r" values="40;44;40" dur="2.4s" repeatCount="indefinite" />
        )}
      </circle>

      <circle cx="50" cy="50" r="18" fill={farbe} opacity="0.7" filter={`url(#${blur})`}>
        {state === 'thinking' && (
          <animate attributeName="cx" values="45;55;45" dur="1.4s" repeatCount="indefinite" />
        )}
        {state === 'responding' && (
          <animate attributeName="r" values="14;22;14" dur="1s" repeatCount="indefinite" />
        )}
        {state === 'celebrating' && (
          <animate attributeName="cy" values="50;42;58;50" dur="1.2s" repeatCount="indefinite" />
        )}
      </circle>

      <circle cx="50" cy="50" r="8" fill={farbe}>
        {state === 'alert' && (
          <animate attributeName="fill-opacity" values="1;0.4;1" dur="0.6s" repeatCount="indefinite" />
        )}
      </circle>

      <circle cx="50" cy="50" r="3" fill="var(--bg)" opacity="0.7" />
    </svg>
  )
}
