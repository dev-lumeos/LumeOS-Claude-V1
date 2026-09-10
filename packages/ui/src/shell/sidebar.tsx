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
import { Icon, type IconName } from '../icons'
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

/**
 * Ein Eintrag einer eingespeisten Gruppe — G-402.
 *
 * `[read]` **Bewusst schmaler als `NavEntry`:** eine fremde Anwendung
 * bringt Pfad, Beschriftung, Symbol und hoechstens eine Zahl mit.
 * **Untereintraege und Kuerzel bleiben der Modulnavigation
 * vorbehalten.**
 */
export type SidebarEintrag = {
  id: string
  label: string
  icon: IconName
  href: string
  /** Rechts im Eintrag, nur wenn groesser null (E-72). */
  zahl?: number
  /** Faerbt die Zahl — `warn` gelb, `critical` rot. */
  stufe?: 'warn' | 'critical'
  /**
   * Ein Ziel AUSSERHALB dieser Anwendung — G-404.
   *
   * `[cmd]` **Gemessen an der Workspaces-Gruppe** (`:214-229`): sie
   * nimmt ein schlichtes `<a>` statt `linkAs`, dazu
   * `target="_blank"` und `rel="noopener noreferrer"` — **ohne
   * `noopener` kann die Zielseite auf `window.opener` zugreifen** —
   * und einen Akzentpunkt statt `aria-current`.
   *
   * `[read]` **Ein fremder Server ist keine Seite dieser Anwendung**:
   * `next/link` wuerde ihn vorab laden wollen und den Verlauf
   * uebernehmen. **Deshalb die andere Form, nicht nur ein anderes
   * Ziel.**
   */
  extern?: boolean
}

/** Eine Gruppe. Ohne `label` bleibt die Beschriftung weg. */
export type SidebarGruppe = {
  label: string | null
  eintraege: SidebarEintrag[]
}

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

  // ══ G-402: einspeisbar statt fest verdrahtet ═══════════════════
  //
  // **Der Vorschlag stammt aus G-401**, wo gemessen wurde: `Sidebar`
  // rendert `MODULES.map(...)`, und `SidebarProps` nahm keine
  // Navigationsliste. **Das Coach-Portal bekam dadurch die Module
  // des Athleten** — Nutrition, Training, Recovery.
  //
  // `[read]` **Beide Requisiten sind wahlfrei, und ohne sie bleibt
  // alles wie bisher.** `apps/web` uebergibt sie nicht und rendert
  // Zeichen fuer Zeichen dasselbe wie vorher (Gegenprobe im
  // Bericht).
  /**
   * Ersetzt Modules/Workspaces/System durch eigene Gruppen.
   *
   * `[read]` **Ganz oder gar nicht** — eine Anwendung, die eigene
   * Gruppen mitbringt, will nicht die Module einer anderen daneben.
   */
  gruppen?: SidebarGruppe[]
  /** Ersetzt „L / LumeOS" im Kopf der Leiste. */
  marke?: { kuerzel: string, name: string }
  /**
   * Das Suchfeld ausblenden.
   *
   * `[read]` **Es ist eine Attrappe ohne Ziel** (die Befehlspalette
   * gibt es nicht). **Wer eigene Gruppen einspeist, will das
   * Versprechen meist nicht mitnehmen.**
   */
  ohneSuche?: boolean
}

function initialen(name: string): string {
  const teile = name.trim().split(/\s+/).filter(Boolean)
  if (teile.length === 0) return '?'
  if (teile.length === 1) return teile[0].slice(0, 2).toUpperCase()
  return (teile[0][0] + teile[teile.length - 1][0]).toUpperCase()
}

export function Sidebar({
  pathname, linkAs: Link, userName = '', userStatus, userInitials,
  userMenu, version, gruppen, marke, ohneSuche,
}: SidebarProps) {
  const aktiv = resolveNav(pathname)

  return (
    <aside className="v2-sidebar">
      <div className="v2-sidebar-brand">
        <div className="v2-brand-mark">{marke?.kuerzel ?? 'L'}</div>
        <div className="v2-brand-name">{marke?.name ?? 'LumeOS'}</div>
        {version && <span className="v2-brand-meta">{version}</span>}
      </div>

      {/* Die Vorlage zeigt hier ein Suchfeld mit ⌘K. Es ist eine
          Attrappe ohne Ziel — die Befehlspalette gibt es nicht. Als
          Knopf ohne Funktion waere es ein Versprechen; deshalb bleibt
          die Flaeche, aber deaktiviert und als solche erkennbar. */}
      {!ohneSuche && (
        <div className="v2-sidebar-search">
          <input placeholder="Search or jump to…" disabled aria-label="Suche (noch nicht verfuegbar)" />
          <span className="v2-kbd">⌘K</span>
        </div>
      )}

      {/* ══ G-402: eingespeiste Gruppen ═══════════════════════════
          `[read]` **Ganz oder gar nicht** — wer eigene Gruppen
          mitbringt, bekommt nur diese. **Ohne `gruppen` bleibt der
          Zweig darunter unveraendert**, und `apps/web` merkt von
          dieser Aenderung nichts. */}
      {gruppen ? (
        <nav className="v2-sidebar-nav" aria-label="Hauptnavigation">
          {gruppen.map((g, i) => (
            <div className="v2-nav-group" key={g.label ?? `g${i}`}>
              {g.label && <div className="v2-nav-group-label">{g.label}</div>}
              {g.eintraege.map(e => {
                // `[read]` **Ein Aussenlink ist nie „aktiv"** — er
                // fuehrt aus der Anwendung heraus, also kann er nicht
                // die Seite sein, auf der man steht.
                const istAktiv = !e.extern
                  && (pathname === e.href || pathname.startsWith(`${e.href}?`))
                const inhalt = (
                  <>
                    <span className="v2-nav-icon"><Icon name={e.icon} /></span>
                    {e.label}
                    {/* E-72: eine Null wird nicht gezeichnet — sie
                        saehe aus wie ein Ergebnis. */}
                    {typeof e.zahl === 'number' && e.zahl > 0 && (
                      <span className="v2-nav-zahl" data-stufe={e.stufe ?? undefined}>
                        {e.zahl}
                      </span>
                    )}
                    {/* Der Punkt zeigt: das Ziel liegt ausserhalb —
                        dieselbe Form wie die Workspaces-Gruppe. */}
                    {e.extern && <span className="v2-accent-dot" />}
                  </>
                )
                // `[cmd]` **Schlichtes `<a>` statt `linkAs`** — genau
                // wie `:214-229`. **`next/link` wuerde einen fremden
                // Server vorab laden wollen.**
                return e.extern ? (
                  <a
                    key={e.id}
                    href={e.href}
                    className="v2-nav-item"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {inhalt}
                  </a>
                ) : (
                  <Link
                    key={e.id}
                    href={e.href}
                    className={`v2-nav-item ${istAktiv ? 'v2-active' : ''}`.trim()}
                    aria-current={istAktiv ? 'page' : undefined}
                  >
                    {inhalt}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>
      ) : (
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
      )}

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
