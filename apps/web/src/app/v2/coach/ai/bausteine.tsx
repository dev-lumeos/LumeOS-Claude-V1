'use client'

// Bausteine, die die Vorlage benutzt und `packages/ui` nicht hat.
//
// `[read]` Der Auftrag G-42: „packages/ui/ nicht anfassen. Bekannt
// fehlend: history, shield (zweimal), Pill ohne dot, kein
// Empty-Baustein — G-43. In bausteine.tsx modul-lokal nachbauen, wie
// G-40 es getan hat."
//
// `[cmd]` `PunktPill` — die Vorlage schreibt `<Pill variant="pos" dot>`
// (module-buddy.jsx:203) und einmal einen frei gefaerbten Punkt
// (module-buddy.jsx:82, `<span className="dot" style={{background:
// "var(--pos)"}}/>`). `PillProps` in packages/ui/src/primitives.tsx:82
// kennt kein `dot`. Diese Fassung kann beides: `variant` faerbt ueber
// die Pille, `farbe` faerbt nur den Punkt.
//
// `[cmd]` Ein `Empty` braucht dieses Modul nicht — anders als Coach
// (G-40) fuehrt die Buddy-Vorlage keinen Leerzustand.
import { Pill, type PillVariant } from '@lumeos/ui'

export function PunktPill({
  variant, farbe, children,
}: {
  variant?: PillVariant
  /** Punktfarbe, wenn die Pille selbst ungefaerbt bleibt. */
  farbe?: string
  children: React.ReactNode
}) {
  return (
    <Pill variant={variant}>
      <span
        style={{
          width: 5, height: 5, borderRadius: 999, display: 'inline-block',
          marginRight: 4, background: farbe ?? 'currentColor',
        }}
      />
      {children}
    </Pill>
  )
}
