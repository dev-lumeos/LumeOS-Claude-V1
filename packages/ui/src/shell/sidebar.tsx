'use client'

// Seitenleiste der Oberflaeche v2. Uebersetzt aus shell.jsx.
//
// Unterschiede zur Vorlage:
//
// * Navigation ueber Verweise (`href`), nicht ueber `setActive`. Wer
//   mit der mittleren Maustaste klickt, bekommt einen neuen Reiter;
//   das kann ein div mit onClick nicht.
// * Der Verweiskomponente wird von aussen gereicht (`linkAs`), damit
//   packages/ui nichts von next/link weiss. So bleibt das Paket ohne
//   Framework-Abhaengigkeit — wie @lumeos/shared.
// * Nutzername und -status kommen als Requisiten. In der Vorlage steht
//   dort fest "Tom Müller / athlete · pro". Das sind Beispieldaten,
//   keine Bausteine.
// * `<nav>`/`<button>` statt `<div onClick>`, `aria-current` fuer die
//   aktive Seite.
import * as React from 'react'
import { Icon } from '../icons'
import { accentVar, type ModuleId } from '../module-accent'
import { MODULES, WORKSPACES, SETTINGS_ENTRY, resolveNav } from './nav'

/**
 * Die Verweiskomponente der einbettenden Anwendung (in Next.js:
 * `next/link`). Bewusst keine feste Abhaengigkeit: packages/ui soll
 * ohne Framework uebersetzbar bleiben.
 */
export type LinkComponent = React.ComponentType<{
  href: string
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  'aria-current'?: 'page'
  title?: string
}>

export type SidebarProps = {
  /** Aktueller Pfad, z. B. aus `usePathname()`. */
  pathname: string
  linkAs: LinkComponent
  /** Anzeigename der angemeldeten Person. */
  userName?: string
  /** Zeile unter dem Namen, z. B. Rolle. */
  userStatus?: string
  /** Kuerzel im Kreis. Ohne Angabe aus dem Namen gebildet. */
  userInitials?: string
  /** Menue rechts unten, z. B. Abmelden. Ohne Angabe fehlt der Knopf. */
  userMenu?: React.ReactNode
  version?: string
}

function initialen(name: string): string {
  const teile = name.trim().split(/\s+/).filter(Boolean)
  if (teile.length === 0) return '?'
  if (teile.length === 1) return teile[0].slice(0, 2).toUpperCase()
  return (teile[0][0] + teile[teile.length - 1][0]).toUpperCase()
}

export function Sidebar({
  pathname, linkAs: Link, userName = '', userStatus, userInitials,
  userMenu, version,
}: SidebarProps) {
  const aktiv = resolveNav(pathname)

  return (
    <aside className="v2-sidebar">
      <div className="v2-sidebar-brand">
        <div className="v2-brand-mark">L</div>
        <div className="v2-brand-name">LumeOS</div>
        {version && <span className="v2-brand-meta">{version}</span>}
      </div>

      {/* Die Vorlage zeigt hier ein Suchfeld mit ⌘K. Es ist eine
          Attrappe ohne Ziel — die Befehlspalette gibt es nicht. Als
          Knopf ohne Funktion waere es ein Versprechen; deshalb bleibt
          die Flaeche, aber deaktiviert und als solche erkennbar. */}
      <div className="v2-sidebar-search">
        <input placeholder="Search or jump to…" disabled aria-label="Suche (noch nicht verfuegbar)" />
        <span className="v2-kbd">⌘K</span>
      </div>

      <nav className="v2-sidebar-nav" aria-label="Hauptnavigation">
        <div className="v2-nav-group">
          <div className="v2-nav-group-label">Modules</div>
          {MODULES.map(m => {
            const istAktiv = aktiv.entry.id === m.id
            return (
              <React.Fragment key={m.id}>
                <Link
                  href={m.href}
                  className={`v2-nav-item ${istAktiv && !aktiv.sub ? 'v2-active' : ''}`.trim()}
                  style={{ ['--mod-acc' as string]: accentVar(m.id) }}
                  aria-current={istAktiv && !aktiv.sub ? 'page' : undefined}
                >
                  <span className="v2-nav-icon"><Icon name={m.icon} /></span>
                  {m.label}
                  {!istAktiv && <span className="v2-accent-dot" />}
                  {m.shortcut && <kbd>{m.shortcut}</kbd>}
                </Link>

                {m.sub && istAktiv && (
                  <div className="v2-nav-sub-group">
                    {m.sub.map(s => (
                      <Link
                        key={s.id}
                        href={s.href}
                        className={`v2-nav-item v2-nav-sub ${aktiv.sub?.id === s.id ? 'v2-active' : ''}`.trim()}
                        style={{ ['--mod-acc' as string]: accentVar(s.accent ?? m.id) }}
                        aria-current={aktiv.sub?.id === s.id ? 'page' : undefined}
                      >
                        {s.label}
                      </Link>
                    ))}
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>

        <div className="v2-nav-group">
          <div className="v2-nav-group-label">Workspaces</div>
          {WORKSPACES.map(w => (
            <a
              key={w.id}
              href={w.url}
              className="v2-nav-item"
              style={{ ['--mod-acc' as string]: accentVar(w.id) }}
              // Fremde Herkunft: ohne noopener kann die Zielseite auf
              // window.opener zugreifen.
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="v2-nav-icon"><Icon name={w.icon} /></span>
              {w.label}
              <span className="v2-accent-dot" />
            </a>
          ))}
        </div>

        <div className="v2-nav-group">
          <div className="v2-nav-group-label">System</div>
          <Link
            href={SETTINGS_ENTRY.href}
            className={`v2-nav-item ${pathname === SETTINGS_ENTRY.href ? 'v2-active' : ''}`.trim()}
            style={{ ['--mod-acc' as string]: accentVar('settings' as ModuleId) }}
            aria-current={pathname === SETTINGS_ENTRY.href ? 'page' : undefined}
          >
            <span className="v2-nav-icon"><Icon name={SETTINGS_ENTRY.icon} /></span>
            {SETTINGS_ENTRY.label}
          </Link>
        </div>
      </nav>

      <div className="v2-sidebar-user">
        <div className="v2-avatar">{userInitials ?? initialen(userName)}</div>
        <div className="v2-user-meta">
          <div className="v2-user-name">{userName || '—'}</div>
          {userStatus && <div className="v2-user-status">{userStatus}</div>}
        </div>
        {userMenu}
      </div>
    </aside>
  )
}
