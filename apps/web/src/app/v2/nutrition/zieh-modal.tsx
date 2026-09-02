'use client'
// ════════════════════════════════════════════════════════════════════
// DIE ZIEHBARE MODALHUELLE — G-336
// ════════════════════════════════════════════════════════════════════
//
// **Der Auftrag, 2026-09-02:** *,,Es gibt schon eins: FoodSuchModal aus
// G-320, ziehbar seit G-321. Dieselbe Machart, keine neue."*
//
// `[read]` **Dieselbe Machart heisst hier: derselbe Code.** `[cmd]`
// **Die Huelle war 80 Zeilen Ziehlogik in `food-such-modal.tsx`** —
// Versatz, Griffpunkt, `mousemove`/`mouseup`, Escape, der
// Zuruecksetzen-Knopf und die Ausnahme fuer die Kopfknoepfe.
//
// `[read]` **Eine Kopie waere eine zweite Wahrheit gewesen** — und
// beim naechsten Befund haette jemand nur eine der beiden berichtigt.
// **Deshalb steht sie einmal hier, und beide benutzen sie.**
import * as React from 'react'

import { Icon } from '@lumeos/ui'

export function ZiehModal({
  titel, aria, breite = 760, probe, onClose, children,
}: {
  /** Steht in der Titelleiste und ist der Griff zum Ziehen. */
  titel: React.ReactNode
  /** Die Vorlesebezeichnung des Dialogs. */
  aria: string
  /** Hoechstbreite in Pixeln. */
  breite?: number
  /** Marke fuer den Waechter, auf dem Kasten. */
  probe?: string
  onClose: () => void
  children: React.ReactNode
}) {
  // ══ G-321: die verschobene Lage ═══════════════════════════════════
  //
  // **Tom, 2026-09-02:** *„das modal muss bewegbar werden."*
  //
  // `[read]` **Ein Versatz, keine Position** — die Hülle zentriert
  // per Flex, und `top`/`left` würden das aufheben. **`{0,0}` heisst
  // also: da, wo es von selbst steht.**
  const [versatz, setVersatz] = React.useState({ x: 0, y: 0 })
  const [zieht, setZieht] = React.useState(false)
  // `[read]` **Der Griffpunkt in einer Ref, nicht im Zustand** — er
  // ändert sich bei jeder Mausbewegung, und ein `setState` je Pixel
  // wäre ein Neuzeichnen je Pixel.
  const griff = React.useRef<{ mx: number; my: number; x: number; y: number } | null>(null)

  const zugStart = React.useCallback((e: React.MouseEvent) => {
    // `[read]` **Nur die linke Taste** — ein Rechtsklick öffnet das
    // Kontextmenü und liesse das Modal danach an der Maus kleben.
    if (e.button !== 0) return
    griff.current = { mx: e.clientX, my: e.clientY, x: versatz.x, y: versatz.y }
    setZieht(true)
  }, [versatz])

  React.useEffect(() => {
    if (!zieht) return
    const bewegen = (e: MouseEvent) => {
      const g = griff.current
      if (!g) return
      setVersatz({ x: g.x + (e.clientX - g.mx), y: g.y + (e.clientY - g.my) })
    }
    const los = () => { setZieht(false); griff.current = null }
    window.addEventListener('mousemove', bewegen)
    window.addEventListener('mouseup', los)
    return () => {
      window.removeEventListener('mousemove', bewegen)
      window.removeEventListener('mouseup', los)
    }
  }, [zieht])

  React.useEffect(() => {
    const auf = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', auf)
    return () => window.removeEventListener('keydown', auf)
  }, [onClose])

  return (
    <div
      role="dialog" aria-modal="true" aria-label={aria}
      // `[cmd]` **G-321: `zieht` bricht das Schliessen ab.**
      // `[read]` **Endet ein Zug auf der Huelle** — was bei schnellem
      // Schieben nach aussen passiert — **kaeme sonst ein Klick an,
      // und das Modal schloesse mitten in der Bewegung.**
      onClick={e => {
        if (!zieht && e.target === e.currentTarget) onClose()
      }}
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '5vh 16px', overflowY: 'auto',
      }}
    >
      <div
        data-probe={probe ?? 'modal-kasten'}
        style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 8, width: '100%', maxWidth: breite, padding: 16,
          // `[read]` **`translate`, nicht `top`/`left`** — die Hülle
          // zentriert per Flex; ein Positionswechsel würde das
          // aufheben und das Modal beim ersten Zug springen lassen.
          transform: `translate(${versatz.x}px, ${versatz.y}px)`,
        }}
      >
        <div
          data-probe="titelleiste"
          onMouseDown={zugStart}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
            cursor: zieht ? 'grabbing' : 'grab',
            // `[read]` **Kein Textmarkieren beim Ziehen** — sonst
            // färbt sich der Titel blau, während man schiebt.
            userSelect: 'none',
          }}
        >
          <Icon name="more" className="v2-ic v2-ic-sm" />
          <span style={{ fontSize: 14, fontWeight: 600 }}>{titel}</span>
          <div style={{ flex: 1 }} />
          {/* `[read]` **Zurücksetzen erscheint erst, wenn verschoben
              wurde** — ein Knopf, der nichts tut, ist keiner. */}
          {(versatz.x !== 0 || versatz.y !== 0) && (
            <button type="button" className="v2-btn v2-btn-sm"
                    onMouseDown={e => e.stopPropagation()}
                    onClick={() => setVersatz({ x: 0, y: 0 })}
                    title="Wieder in die Mitte">
              Zurücksetzen
            </button>
          )}
          {/* `[read]` **Der Schliessen-Knopf ist vom Zug ausgenommen**,
              sonst wäre jeder Klick darauf ein Zug von 0 px und das
              Modal bliebe offen. */}
          <button type="button" className="v2-btn v2-btn-sm"
                  onMouseDown={e => e.stopPropagation()}
                  onClick={onClose} aria-label="Schliessen">
            <Icon name="x" className="v2-ic v2-ic-sm" />
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}
