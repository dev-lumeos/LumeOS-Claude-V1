'use client'

// Kopfzeile der Oberflaeche v2. Uebersetzt aus shell.jsx.
//
// Unterschiede zur Vorlage:
//
// * Der Modus-Umschalter der Vorlage haelt `theme` als eigenen Zustand.
//   Hier wird er als Requisite gereicht: [cmd] apps/web hat bereits
//   einen Modusmechanismus ueber Cookie und `data-mode` am <html>
//   (layout.tsx, styles/themes/registry.ts). Ein zweiter Zustand
//   danebem waere eine zweite Wahrheit und wuerde beim ersten Laden
//   flackern.
// * Die Vorlage baut den Umschalter aus zwei Knoepfen mit
//   Inline-Stilen. Uebernommen, aber mit `aria-pressed`, damit
//   Hilfsmittel den Zustand vorlesen koennen.
// * "Commands" bleibt ohne Funktion — die Befehlspalette existiert
//   nicht. Deshalb `disabled`, statt einen toten Knopf anzubieten.
import * as React from 'react'
import { Icon } from '../icons'

export type SyncState = 'synced' | 'offline'

export type TopbarProps = {
  /** Grossgeschriebene Modulkennung links, z. B. NUTRITION. */
  moduleTag: string
  moduleLabel: string
  /** Zwischenstufe im Brotkrumenpfad, z. B. der Modulname bei Unterseiten. */
  parentLabel?: string
  syncState?: SyncState
  mode?: 'light' | 'dark'
  onModeChange?: (mode: 'light' | 'dark') => void
  /** Kontextspalte ein-/ausblenden. */
  onToggleContext?: () => void
  contextOpen?: boolean
  /**
   * Zusaetzliche Bedienelemente links neben dem Modus-Umschalter.
   *
   * A-14: die Sprachwahl haengt an `next-intl` und damit an `apps/web`
   * — `packages/ui` kennt die Bibliothek nicht und soll sie nicht
   * kennen. Deshalb ein Platz statt eines eigenen Bausteins.
   */
  actions?: React.ReactNode
}

export function Topbar({
  moduleTag, moduleLabel, parentLabel, syncState = 'synced',
  mode, onModeChange, onToggleContext, contextOpen, actions,
}: TopbarProps) {
  return (
    <header className="v2-topbar">
      <nav className="v2-breadcrumb" aria-label="Brotkrumenpfad">
        <span className="v2-mod-tag">{moduleTag}</span>
        <span className="v2-crumb">Workspace</span>
        <span className="v2-sep">/</span>
        {parentLabel && (
          <>
            <span className="v2-crumb">{parentLabel}</span>
            <span className="v2-sep">/</span>
          </>
        )}
        <span className="v2-crumb v2-current">{moduleLabel}</span>
      </nav>

      <div className="v2-topbar-actions">
        <span className="v2-pill">
          <span
            className="v2-dot"
            style={{ background: syncState === 'synced' ? 'var(--pos)' : 'var(--warn)' }}
          />
          {syncState === 'synced' ? 'Synced' : 'Offline · queued'}
        </span>

        <button type="button" className="v2-icon-btn" title="Notifications" disabled>
          <Icon name="bell" title="Benachrichtigungen" />
        </button>

        {actions}

        {onModeChange && (
          <div
            className="v2-mode-switch"
            role="group"
            aria-label="Hell- oder Dunkelmodus"
          >
            <button
              type="button"
              onClick={() => mode !== 'light' && onModeChange('light')}
              aria-pressed={mode === 'light'}
              data-on={mode === 'light' ? 'true' : undefined}
              title="Light mode"
            >
              <Icon name="sun" className="v2-ic v2-ic-sm" title="Hellmodus" />
            </button>
            <button
              type="button"
              onClick={() => mode !== 'dark' && onModeChange('dark')}
              aria-pressed={mode === 'dark'}
              data-on={mode === 'dark' ? 'true' : undefined}
              title="Dark mode"
            >
              <Icon name="moon" className="v2-ic v2-ic-sm" title="Dunkelmodus" />
            </button>
          </div>
        )}

        {onToggleContext && (
          <button
            type="button"
            className="v2-icon-btn"
            title="Kontextspalte umschalten"
            aria-expanded={contextOpen}
            onClick={onToggleContext}
          >
            <Icon name="layers" title="Kontextspalte" />
          </button>
        )}

        <button type="button" className="v2-btn" disabled title="Noch nicht verfuegbar">
          <Icon name="command" className="v2-ic v2-ic-sm" /> Commands
        </button>
      </div>
    </header>
  )
}
