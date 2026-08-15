'use client'

// Buddys Kugel. Uebersetzt aus shared.jsx (BuddyOrb, useTime).
//
// [read] Der Auftrag: "Buddy bleibt eine Attrappe. Bau die Flaeche,
// nicht den Aufruf." Diese Datei ist genau das — eine Flaeche, die
// einen Zustand anzeigt, den ihr jemand gibt. Kein Modellaufruf.
//
// Zwei Aenderungen gegenueber der Vorlage, beide aus demselben Grund:
// die Vorlage laeuft in einer Vorfuehrung, diese Kugel laeuft in einer
// Anwendung, die den ganzen Tag offen ist.
//
// 1. prefers-reduced-motion wird beachtet. Wer Bewegung abgestellt hat,
//    bekommt ein ruhendes Bild. Eine dauernd pulsierende Kugel ist fuer
//    manche Menschen nicht nur unschoen, sondern unbenutzbar.
// 2. Im Zustand "idle" steht die Animation still. Die Vorlage laesst
//    requestAnimationFrame dauerhaft laufen — 60 Bilder je Sekunde,
//    damit sich eine Kugel langsam wiegt, auf jeder Seite, den ganzen
//    Tag. Das kostet Akku, ohne etwas zu sagen.
import * as React from 'react'

export type BuddyState = 'idle' | 'thinking' | 'responding' | 'alert' | 'celebrating'

const ZUSTANDSFARBE: Record<BuddyState, string> = {
  idle: 'var(--acc-buddy)',
  thinking: 'var(--acc-coach)',
  responding: 'var(--acc-recov)',
  alert: 'var(--warn)',
  celebrating: 'var(--acc-nutri)',
}

const TEMPO: Record<BuddyState, number> = {
  idle: 0.8, thinking: 2.4, responding: 1.6, alert: 0.8, celebrating: 3,
}

/**
 * Laufende Zeit in Sekunden, solange `aktiv`. Steht `aktiv` auf false,
 * bleibt der Wert stehen und es laeuft keine Bildschleife.
 */
function useTime(aktiv: boolean): number {
  const [t, setT] = React.useState(0)
  React.useEffect(() => {
    if (!aktiv) return
    let raf = 0
    let start: number | undefined
    const tick = (now: number) => {
      if (start === undefined) start = now
      setT((now - start) / 1000)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [aktiv])
  return t
}

function useReduzierteBewegung(): boolean {
  // Voreinstellung false, damit Server- und erstes Client-Bild
  // uebereinstimmen; die echte Antwort kommt nach dem Einhaengen.
  const [reduziert, setReduziert] = React.useState(false)
  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduziert(mq.matches)
    const auf = (e: MediaQueryListEvent) => setReduziert(e.matches)
    mq.addEventListener('change', auf)
    return () => mq.removeEventListener('change', auf)
  }, [])
  return reduziert
}

export type BuddyOrbProps = {
  state?: BuddyState
  size?: number
}

export function BuddyOrb({ state = 'idle', size = 72 }: BuddyOrbProps) {
  const reduziert = useReduzierteBewegung()
  const bewegt = !reduziert && state !== 'idle'
  const t = useTime(bewegt)

  const tempo = TEMPO[state]
  const farbe = ZUSTANDSFARBE[state]
  const a = Math.sin(t * tempo) * 0.5 + 0.5
  const b = Math.sin(t * tempo * 1.3 + 1.2) * 0.5 + 0.5
  const c = Math.sin(t * tempo * 0.7 + 2.4) * 0.5 + 0.5

  // Die Vorlage vergibt feste IDs ("orb-g", "blur"). Stehen zwei Kugeln
  // auf einer Seite, verweisen beide auf dieselbe Definition — und im
  // SVG gewinnt die letzte. useId gibt jeder ihre eigene.
  const id = React.useId().replace(/:/g, '')

  return (
    <svg width={size} height={size} viewBox="0 0 100 100"
         aria-hidden focusable="false">
      <defs>
        <radialGradient id={`orb-${id}`} cx="50%" cy="40%">
          <stop offset="0%" stopColor={farbe} stopOpacity="0.9" />
          <stop offset="100%" stopColor={farbe} stopOpacity="0.05" />
        </radialGradient>
        <filter id={`blur-${id}`}><feGaussianBlur stdDeviation="2" /></filter>
      </defs>
      <circle cx="50" cy="50" r="42" fill={`url(#orb-${id})`} opacity={0.5 + a * 0.4} />
      <circle cx={50 + (a - 0.5) * 18} cy={50 + (b - 0.5) * 18} r={18 + c * 6}
              fill={farbe} opacity="0.55" filter={`url(#blur-${id})`} />
      <circle cx={50 + (b - 0.5) * 12} cy={50 + (c - 0.5) * 12} r={12 + a * 4}
              fill={farbe} opacity="0.7" filter={`url(#blur-${id})`} />
      <circle cx="50" cy="50" r={6 + a * 2} fill={farbe} />
      <circle cx="50" cy="50" r={3} fill="var(--bg)" opacity="0.6" />
    </svg>
  )
}
