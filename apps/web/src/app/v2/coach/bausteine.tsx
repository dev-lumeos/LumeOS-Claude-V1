'use client'

// Zwei Bausteine, die die Vorlage benutzt und `packages/ui` nicht hat.
//
// `[read]` Der Auftrag G-40: „packages/ui/ nicht anfassen — fehlt ein
// Symbol: melden." Beides ist gemeldet und steht im Bericht; hier
// stehen sie modul-lokal, damit die Vorlage 1:1 nachgebaut werden kann,
// ohne das geteilte Paket anzufassen.
//
// `[cmd]` `PunktPill` — die Vorlage schreibt `<Pill variant="pos" dot>`
// an vier Stellen (module-coach.jsx:324, module-coach-athlete.jsx:531
// u. a.). `PillProps` in packages/ui/src/primitives.tsx:82 kennt
// `children`, `variant`, `className`, `style` — kein `dot`.
//
// `[cmd]` `Leer` — die Vorlage schreibt `<Empty title sub icon/>` an
// zwei Stellen (module-coach.jsx:252, module-coach-athlete.jsx:283).
// Ein `Empty` gibt es in packages/ui nicht; `index.ts` fuehrt es nicht.
import { Icon, Pill, type IconName, type PillVariant } from '@lumeos/ui'

/** `<Pill variant="pos" dot>` der Vorlage: Punkt vor dem Text. */
export function PunktPill({ variant, children }: { variant?: PillVariant; children: React.ReactNode }) {
  return (
    <Pill variant={variant}>
      <span
        style={{
          width: 5, height: 5, borderRadius: 999, display: 'inline-block',
          marginRight: 4, background: 'currentColor',
        }}
      />
      {children}
    </Pill>
  )
}

/** `<Empty title sub icon/>` der Vorlage. */
export function Leer({ title, sub, icon }: { title: string; sub: string; icon: IconName }) {
  return (
    <div style={{ textAlign: 'center', padding: '32px 20px' }}>
      <Icon name={icon} className="v2-ic" style={{ width: 28, height: 28, color: 'var(--fg-dim)', margin: '0 auto 10px' }} />
      <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 4 }}>{title}</div>
      <div className="v2-dim" style={{ fontSize: 11.5 }}>{sub}</div>
    </div>
  )
}
