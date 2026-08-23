'use client'

// Ein klappbarer Abschnitt — DAS generische Element, damit das
// Klappen nicht je Modul neu erfunden wird (C-229).
//
// `[cmd]` Vorbild ist die Mechanik aus
// apps/web/src/app/v2/nutrition/naehrstoff-ordnung-tab.tsx (G-121 ff.):
// der Start ist ZU, der Kopf traegt einen Chevron und aria-expanded,
// der Inhalt entsteht erst beim Aufklappen. Der ZUSTAND liegt beim
// Aufrufer (`offen`/`onToggle`) — ob er ihn im Speicher haelt oder wie
// die Nutrition-Sicht nach `user_display_preferences` schreibt, ist
// seine Entscheidung, nicht die dieser Komponente.
import * as React from 'react'

export type KlappeProps = {
  titel: React.ReactNode
  /** Rechts im Kopf, z. B. eine Feldzahl — sichtbar auch zugeklappt. */
  sub?: React.ReactNode
  offen: boolean
  onToggle: () => void
  children?: React.ReactNode
}

export function Klappe({ titel, sub, offen, onToggle, children }: KlappeProps) {
  return (
    <div style={{
      border: '1px solid var(--border)', borderRadius: 6,
      background: 'var(--surface)',
    }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={offen}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          padding: '8px 10px', background: 'none', border: 'none',
          cursor: 'pointer', color: 'var(--fg)', textAlign: 'left',
        }}
      >
        {/* Der Chevron ist Zeichen, nicht Bild — dreht mit. */}
        <span aria-hidden style={{
          display: 'inline-block', fontSize: 9, color: 'var(--fg-dim)',
          transform: offen ? 'rotate(90deg)' : 'none',
          transition: 'transform 120ms',
        }}>▶</span>
        <span style={{ fontSize: 11.5, fontWeight: 600, flex: 1 }}>{titel}</span>
        {sub && <span className="v2-dim v2-mono" style={{ fontSize: 9.5 }}>{sub}</span>}
      </button>
      {offen && (
        <div style={{ padding: '0 10px 10px' }}>
          {children}
        </div>
      )}
    </div>
  )
}
