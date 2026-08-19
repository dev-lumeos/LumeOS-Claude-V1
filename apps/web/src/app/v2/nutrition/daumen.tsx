'use client'

// Der Daumen: zwei Knoepfe, ein Zyklus, eine Sicherheitsabfrage (G-67).
//
// `[cmd]` DIE SYMBOLE: `packages/ui` fuehrt kein `thumb_up`/`thumb_down`
// und darf in diesem Auftrag nicht angefasst werden. Genommen sind
// `check` und `x` — **dieselben Zeichen, die das Vorgaengerrepo
// benutzt** (`FoodPreferences.tsx:709`: `rating === 'like' ? '✓' :
// '✕'`, gruen bzw. rot). Keine Erfindung, sondern die dort getroffene
// Produktentscheidung.
//
// `[read]` DIE ABFRAGE NUR ABWAERTS: Tom, 2026-08-18 —
// „Sicherheitsabfrage, dann weg." Eine Zustimmung ist folgenlos
// umkehrbar, ein Ausschluss nicht; und wenn die Zeile nach dem
// Abwerten verschwindet, ist sie zum Korrigieren nicht mehr da. Die
// Abfrage nennt deshalb das Lebensmittel beim Namen und sagt, wo es
// rueckgaengig geht.
import * as React from 'react'
import { Icon } from '@lumeos/ui'

import { daumenSpeichern } from './daumen-aktion'
import { naechsterDaumen, type Daumen } from '../../../lib/nutrition/daumen-schreiben'

export type { Daumen }

export function DaumenKnoepfe({
  foodId, name, zustand, onGesetzt, gross = false,
}: {
  foodId: string
  /** Fuer die Abfrage und die Vorlesehilfe. */
  name: string
  zustand: Daumen
  /** Meldet den neuen Zustand nach oben — die Liste blendet dann aus. */
  onGesetzt: (neu: Daumen) => void
  /** Detailansicht: groessere Flaeche. */
  gross?: boolean
}) {
  const [frage, setFrage] = React.useState(false)
  const [laeuft, setLaeuft] = React.useState(false)

  const setzen = React.useCallback(async (neu: Daumen) => {
    setLaeuft(true)
    const a = await daumenSpeichern(foodId, neu)
    setLaeuft(false)
    setFrage(false)
    if (a.ok) onGesetzt(a.zustand)
  }, [foodId, onGesetzt])

  // Ein Klick auf einen der beiden Knoepfe: derselbe Zyklus wie im
  // Vorgaengerrepo, aber je Richtung erreichbar.
  const klick = (richtung: 'liked' | 'disliked') => {
    const neu: Daumen = zustand === richtung ? 'neutral' : richtung
    // Nur die entfernende Richtung fragt nach.
    if (neu === 'disliked') { setFrage(true); return }
    void setzen(neu)
  }

  const groesse = gross ? 28 : 22
  const knopf = (richtung: 'liked' | 'disliked') => {
    const aktiv = zustand === richtung
    const farbe = richtung === 'liked' ? 'var(--pos)' : 'var(--neg)'
    return (
      <button
        type="button"
        disabled={laeuft}
        aria-pressed={aktiv}
        aria-label={richtung === 'liked'
          ? `${name} mag ich${aktiv ? ' — Bewertung aufheben' : ''}`
          : `${name} mag ich nicht${aktiv ? ' — Bewertung aufheben' : ''}`}
        title={richtung === 'liked' ? 'Mag ich' : 'Mag ich nicht'}
        onClick={e => {
          // `[read]` Die Zeile fuehrt ins Detail, der Daumen nicht.
          // Ohne das bewertet man versehentlich, was man ansehen wollte.
          e.stopPropagation()
          e.preventDefault()
          klick(richtung)
        }}
        style={{
          width: groesse, height: groesse, padding: 0,
          display: 'grid', placeItems: 'center',
          borderRadius: 6, cursor: laeuft ? 'default' : 'pointer',
          background: aktiv ? `color-mix(in oklch, ${farbe} 16%, transparent)` : 'transparent',
          border: `1px solid ${aktiv ? farbe : 'var(--border)'}`,
          color: aktiv ? farbe : 'var(--fg-dim)',
          opacity: laeuft ? 0.5 : 1,
        }}
      >
        <Icon name={richtung === 'liked' ? 'check' : 'x'} className="v2-ic v2-ic-sm" />
      </button>
    )
  }

  return (
    <>
      <span style={{ display: 'inline-flex', gap: 4 }}
            onClick={e => e.stopPropagation()}>
        {knopf('liked')}
        {knopf('disliked')}
      </span>

      {frage && (
        <DaumenAbfrage
          name={name}
          laeuft={laeuft}
          onAbbruch={() => setFrage(false)}
          onBestaetigt={() => void setzen('disliked')}
        />
      )}
    </>
  )
}

/**
 * Die Sicherheitsabfrage.
 *
 * `[read]` Sie sagt, WAS sie tut — nicht „Sind Sie sicher?", sondern
 * „Rosenkohl kuenftig nicht mehr anzeigen?" — und wo es rueckgaengig
 * geht. Tom hat beides ausdruecklich verlangt.
 */
function DaumenAbfrage({
  name, laeuft, onAbbruch, onBestaetigt,
}: {
  name: string
  laeuft: boolean
  onAbbruch: () => void
  onBestaetigt: () => void
}) {
  // Escape schliesst, wie bei den uebrigen Fenstern des Moduls.
  React.useEffect(() => {
    const auf = (e: KeyboardEvent) => { if (e.key === 'Escape') onAbbruch() }
    window.addEventListener('keydown', auf)
    return () => window.removeEventListener('keydown', auf)
  }, [onAbbruch])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Lebensmittel ausblenden"
      onClick={e => { e.stopPropagation(); onAbbruch() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'color-mix(in oklch, var(--bg) 70%, transparent)',
        display: 'grid', placeItems: 'center', padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: 20, maxWidth: 420, width: '100%',
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
          {name} künftig nicht mehr anzeigen?
        </div>
        <div className="v2-muted" style={{ fontSize: 12, lineHeight: 1.55, marginBottom: 16 }}>
          Das Lebensmittel verschwindet aus dieser Liste. Rückgängig geht es
          unter <strong>Preferences · Individual foods</strong>.
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" className="v2-btn v2-btn-ghost"
                  disabled={laeuft} onClick={onAbbruch}>
            Abbrechen
          </button>
          <button type="button" className="v2-btn v2-btn-primary"
                  disabled={laeuft} onClick={onBestaetigt}>
            Nicht mehr anzeigen
          </button>
        </div>
      </div>
    </div>
  )
}
