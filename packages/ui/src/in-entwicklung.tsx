'use client'

// Das Modal fuer Knoepfe, die es noch nicht gibt.
//
// `[read]` Der Auftrag: „Jeder Knopf, der nichts tut, oeffnet ein Modal
// ‚in Entwicklung' im Stil des Themes. Einmal in `packages/ui`, nicht je
// Knopf."
//
// Warum ein Modal und nicht ein toter Knopf: Ein Knopf, der auf Klick
// nichts tut, ist von einem kaputten Knopf nicht zu unterscheiden. Das
// Modal sagt, dass die Flaeche Absicht ist — und woran es haengt, wenn
// das bekannt ist.
//
// Die Klassen (`v2-modal-veil`, `v2-modal`, `v2-modal-h`, …) stammen aus
// der Vorlage und liegen bereits in v2.css.
import * as React from 'react'

import { Icon } from './icons'
import { Pill } from './primitives'

export type InEntwicklungProps = {
  /** Beschriftung des Knopfes, der das Modal geoeffnet hat. */
  titel: string
  /** Woran es haengt. Ohne Angabe bleibt es beim allgemeinen Satz. */
  grund?: string
  onClose: () => void
}

export function InEntwicklung({ titel, grund, onClose }: InEntwicklungProps) {
  // Escape schliesst — sonst ist das Modal per Tastatur eine Sackgasse.
  React.useEffect(() => {
    const auf = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', auf)
    return () => window.removeEventListener('keydown', auf)
  }, [onClose])

  return (
    <div className="v2-modal-veil" onClick={onClose} role="presentation">
      <div
        className="v2-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${titel} — in Entwicklung`}
        onClick={e => e.stopPropagation()}
      >
        <div className="v2-modal-h">
          <Icon name="sparkles" className="v2-ic v2-ic-sm" />
          <span className="v2-card-title">{titel}</span>
          <Pill variant="warn">in Entwicklung</Pill>
          <div className="v2-spacer" />
          <button type="button" className="v2-icon-btn" onClick={onClose} aria-label="Schliessen">
            <Icon name="x" className="v2-ic v2-ic-sm" />
          </button>
        </div>
        <div className="v2-modal-body">
          <p style={{ fontSize: 12.5, lineHeight: 1.6, color: 'var(--fg-muted)', margin: 0 }}>
            Diese Flaeche stammt aus dem Entwurf und ist noch nicht
            angebunden. Der Knopf steht hier, damit das Gesamtbild
            vollstaendig ist — er tut noch nichts.
          </p>
          {grund && (
            <p style={{ fontSize: 12, lineHeight: 1.55, color: 'var(--fg-dim)', marginTop: 10 }}>
              {grund}
            </p>
          )}
        </div>
        <div className="v2-modal-f">
          <button type="button" className="v2-btn" onClick={onClose}>Schliessen</button>
        </div>
      </div>
    </div>
  )
}

/**
 * Knopf, der das Modal oeffnet. Spart je Knopf einen eigenen Zustand.
 *
 * `className` bleibt offen, damit der Knopf so aussieht wie in der
 * Vorlage (`v2-btn`, `v2-btn-primary`, `v2-icon-btn`).
 */
export function InEntwicklungKnopf({
  titel, grund, className = 'v2-btn', children, style,
}: {
  titel: string
  grund?: string
  className?: string
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  const [offen, setOffen] = React.useState(false)
  return (
    <>
      <button type="button" className={className} style={style} onClick={() => setOffen(true)}>
        {children}
      </button>
      {offen && <InEntwicklung titel={titel} grund={grund} onClose={() => setOffen(false)} />}
    </>
  )
}
