'use client'

// Die Huelle der Oberflaeche v2: Seitenleiste, Kopfzeile, Inhalt,
// Kontextspalte.
//
// In der Vorlage steckt diese Zusammensetzung in app.jsx und haelt
// nebenbei den gesamten Anwendungszustand (aktives Modul, Thema,
// Kontextspalte). Hier traegt sie nur, was die Huelle selbst angeht;
// das aktive Modul kommt aus dem Pfad, der Modus von aussen.
import * as React from 'react'
import { accentVar } from '../module-accent'
import { resolveNav } from './nav'
import { Sidebar, type LinkComponent, type SidebarGruppe } from './sidebar'
import { Topbar, type SyncState } from './topbar'
import { ContextPanel, type ContextPanelProps } from './context-panel'

export type AppShellProps = {
  pathname: string
  linkAs: LinkComponent
  children?: React.ReactNode

  userName?: string
  userStatus?: string
  userInitials?: string
  userMenu?: React.ReactNode
  version?: string

  // ══ G-402: an die Seitenleiste durchgereicht ═════════════════
  //
  // `[read]` **Wahlfrei** — ohne sie zeigt die Leiste wie bisher
  // Modules/Workspaces/System.
  gruppen?: SidebarGruppe[]
  marke?: { kuerzel: string, name: string }
  ohneSuche?: boolean
  /**
   * Ueberschreibt die Brotkrume — G-402/A12.
   *
   * `[cmd]` **Ohne sie leitet `resolveNav(pathname)` sie ab**, und
   * das kennt nur die Module von `apps/web`. `[read]` **Im Portal
   * stand deshalb „DASHBOARD / Dashboard" ueber jedem Bereich** —
   * gemessen am Schirm.
   */
  bereich?: { tag: string, label: string }

  syncState?: SyncState
  mode?: 'light' | 'dark'
  onModeChange?: (mode: 'light' | 'dark') => void

  /**
   * Inhalt der Kontextspalte. Fehlt er, entfaellt die Spalte ganz —
   * das Raster wird zweispaltig.
   */
  context?: Omit<ContextPanelProps, 'label'> & { label?: string }
  /** Dichte der Karten: compact | default | comfortable. */
  density?: 'compact' | 'default' | 'comfortable'
  /** Zusaetzliche Bedienelemente in der Kopfzeile (A-14: Sprachwahl). */
  topbarActions?: React.ReactNode
}

export function AppShell({
  pathname, linkAs, children,
  userName, userStatus, userInitials, userMenu, version,
  syncState, mode, onModeChange, context, density = 'default', topbarActions,
  gruppen, marke, ohneSuche, bereich,
}: AppShellProps) {
  const [kontextOffen, setKontextOffen] = React.useState(true)

  const aktiv = resolveNav(pathname)
  const eintrag = aktiv.sub ?? aktiv.entry
  const label = eintrag.label
  const akzentId = aktiv.sub?.accent ?? aktiv.entry.id

  const zeigeKontext = context != null && kontextOffen

  return (
    <div
      className="v2-app"
      data-rightpanel={zeigeKontext ? undefined : 'hidden'}
      data-pad={density === 'default' ? undefined : density}
      // Der Modulakzent. Alles darunter benutzt var(--acc) — deshalb
      // reicht es, ihn hier einmal zu setzen.
      style={{ ['--acc' as string]: accentVar(akzentId) }}
    >
      <Sidebar
        pathname={pathname}
        linkAs={linkAs}
        userName={userName}
        userStatus={userStatus}
        userInitials={userInitials}
        userMenu={userMenu}
        version={version}
        gruppen={gruppen}
        marke={marke}
        ohneSuche={ohneSuche}
      />

      <main className="v2-main">
        <Topbar
          moduleTag={bereich?.tag ?? aktiv.entry.id.toUpperCase()}
          moduleLabel={bereich?.label ?? label}
          parentLabel={aktiv.sub ? aktiv.entry.label : undefined}
          syncState={syncState}
          mode={mode}
          onModeChange={onModeChange}
          onToggleContext={context ? () => setKontextOffen(o => !o) : undefined}
          contextOpen={zeigeKontext}
          actions={topbarActions}
        />
        <div className="v2-content">{children}</div>
      </main>

      {zeigeKontext && <ContextPanel label={context.label ?? label} {...context} />}
    </div>
  )
}
