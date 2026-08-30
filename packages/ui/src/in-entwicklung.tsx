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
  /**
   * Die Flaeche TUT etwas — nur nicht vollstaendig. Dann faellt der
   * Satz „…er tut noch nichts" weg und `grund` traegt allein.
   *
   * `[cmd]` NACHGETRAGEN IN C-177. `[read]` **Der Anlass:** die
   * Sprachwahl setzt Thai wirklich — Cookie `lumeos-sprache=th`,
   * gemessen am 2026-08-30, die Oberflaeche uebersetzt sich. **Nur die
   * Lebensmittelsuche findet nichts**, weil `food_aliases` 0 `th`-Zeilen
   * fuehrt.
   *
   * `[read]` **Der Standardsatz waere dort schlicht falsch** — und ein
   * falscher Satz im gemeinsamen Baustein ist schlimmer als in einem
   * Einzelfall, weil ihn niemand mehr nachliest. Die 39 uebrigen
   * Aufrufer bleiben unberuehrt: ohne das Prop steht der Satz wie
   * bisher.
   */
  teilweise?: boolean
  onClose: () => void
}

export function InEntwicklung({ titel, grund, teilweise = false, onClose }: InEntwicklungProps) {
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
        aria-label={`${titel} — ${teilweise ? 'teilweise gedeckt' : 'in Entwicklung'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="v2-modal-h">
          <Icon name="sparkles" className="v2-ic v2-ic-sm" />
          <span className="v2-card-title">{titel}</span>
          <Pill variant="warn">{teilweise ? 'teilweise gedeckt' : 'in Entwicklung'}</Pill>
          <div className="v2-spacer" />
          <button type="button" className="v2-icon-btn" onClick={onClose} aria-label="Schliessen">
            <Icon name="x" className="v2-ic v2-ic-sm" />
          </button>
        </div>
        <div className="v2-modal-body">
          {!teilweise && (
            <p style={{ fontSize: 12.5, lineHeight: 1.6, color: 'var(--fg-muted)', margin: 0 }}>
              Diese Flaeche stammt aus dem Entwurf und ist noch nicht
              angebunden. Der Knopf steht hier, damit das Gesamtbild
              vollstaendig ist — er tut noch nichts.
            </p>
          )}
          {grund && (
            <p style={{
              fontSize: teilweise ? 12.5 : 12,
              lineHeight: teilweise ? 1.6 : 1.55,
              color: teilweise ? 'var(--fg-muted)' : 'var(--fg-dim)',
              marginTop: teilweise ? 0 : 10,
            }}>
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
  titel, grund, className = 'v2-btn', children, style, disabled = false,
}: {
  titel: string
  grund?: string
  className?: string
  children: React.ReactNode
  style?: React.CSSProperties
  /**
   * Der Knopf ist gesperrt — er oeffnet dann NICHTS, auch nicht das
   * Attrappenfenster.
   *
   * `[cmd]` NACHGETRAGEN IN G-56. `[read]` Der Auftrag: *„Ein Knopf,
   * der eine Grenze nicht durchsetzt, sieht aus wie eine Sicherung und
   * ist keine."* Im Log-Fenster von Supplements sperrt die Vorlage den
   * Speichern-Knopf bei ueberschrittener Menge oder laufendem
   * Ruhefenster. Weil `packages/ui` in G-29/G-45 gesperrt war, steht
   * dort heute ein doppelter Zweig: ein echter `<button disabled>` fuer
   * den gesperrten Fall, dieser Knopf nur fuer den freigegebenen
   * (`supplements/modale.tsx:298-306`). Mit diesem Prop faellt der
   * Zweig weg.
   *
   * Wichtig ist die Reihenfolge: `disabled` schlaegt das Fenster. Ein
   * gesperrter Knopf, der noch ein Fenster oeffnet, waere genau die
   * Sicherung, die keine ist.
   */
  disabled?: boolean
}) {
  const [offen, setOffen] = React.useState(false)
  return (
    <>
      <button
        type="button"
        className={className}
        style={style}
        disabled={disabled}
        onClick={disabled ? undefined : () => setOffen(true)}
      >
        {children}
      </button>
      {offen && !disabled
        && <InEntwicklung titel={titel} grund={grund} onClose={() => setOffen(false)} />}
    </>
  )
}
