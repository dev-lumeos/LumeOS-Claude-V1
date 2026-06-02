'use client'

import Link from 'next/link'
import type { Route } from 'next'
import { usePathname } from 'next/navigation'

const moduleNav = [
  { href: '/dashboard', label: 'Dashboard', meta: 'Status', shortcut: '1', section: 'dashboard' },
  { href: '/nutrition', label: 'Nutrition', meta: 'BLS', shortcut: '2', section: 'nutrition' },
  { href: '/training', label: 'Training', meta: 'Plan', shortcut: '3', section: 'training' },
  { href: '/recovery', label: 'Recovery', meta: 'Score', shortcut: '4', section: 'recovery' },
  { href: '/supplements', label: 'Supplements', meta: 'Stack', shortcut: '5', section: 'supplements' },
  { href: '/goals', label: 'Goals & Body', meta: 'Body', shortcut: '6', section: 'goals' },
  { href: '/medical', label: 'Medical', meta: 'Monitoring', shortcut: '7', section: 'medical' },
]

const workspaceNav = [
  { href: 'https://coach.lumeos.app', label: 'Coach Portal', meta: 'SSO später', section: 'coach' },
  { href: 'https://buddy.lumeos.app', label: 'Buddy', meta: 'SSO später', section: 'buddy' },
  { href: 'https://marketplace.lumeos.app', label: 'Marketplace', meta: 'SSO später', section: 'marketplace' },
  { href: 'https://admin.lumeos.app', label: 'Admin', meta: 'Role-check später', section: 'admin' },
]

const systemNav = [
  { href: '/settings', label: 'Settings', meta: 'Prefs', section: 'settings' },
  { href: '/governance', label: 'Governance', meta: 'Ops', section: 'governance' },
]

const contextBySection: Record<string, { status: string; boundary: string; next: string; detail: string }> = {
  dashboard: {
    status: 'Draft landing',
    boundary: 'Cross-module Status ohne Live-Daten.',
    next: 'Review-Fokus und sichere nächste Schritte prüfen.',
    detail: 'Dashboard · 4 KPI-Flächen · Today Flow · Read-only',
  },
  nutrition: {
    status: 'Diary-first Draft',
    boundary: 'BLS-only, kein USDA/OFF, keine Diary Writes.',
    next: 'Food Search öffnen oder BLS-Grenzen prüfen.',
    detail: 'Nutrition · 117 Nährstoffe · BLS 10.840 · Candidate',
  },
  training: {
    status: 'Placeholder',
    boundary: 'Kein Workout-Logging, keine Live-Pläne.',
    next: 'Training-Spec als späteren Modulauftrag behandeln.',
    detail: 'Training · Today Plan · History · Library · Backlog',
  },
  recovery: {
    status: 'Placeholder',
    boundary: 'Kein HRV/Sleep-Live-Status.',
    next: 'Readiness- und Sleep-Flächen separat spezifizieren.',
    detail: 'Recovery · Readiness · Sleep · HRV · Backlog',
  },
  supplements: {
    status: 'Placeholder',
    boundary: 'Tracking only, keine medizinische Beratung.',
    next: 'Stack- und Compliance-Scope separat prüfen.',
    detail: 'Supplements · Stack · Compliance · Not medical advice',
  },
  goals: {
    status: 'Goals + Body Draft',
    boundary: 'Keine aktiven Ziele ohne Athlete Confirmation.',
    next: 'Tabs und Goal Cards als Follow-up umsetzen.',
    detail: 'Goals · Timeline · Body Metrics · Measurements · Mock',
  },
  medical: {
    status: 'Sensitive Placeholder',
    boundary: 'Monitoring only, keine Diagnose, keine Therapie.',
    next: 'Medical-Scope nur mit Privacy- und Security-Review.',
    detail: 'Medical · encrypted at rest later · No advice · No data',
  },
  settings: {
    status: 'System Draft',
    boundary: 'Theme, Sync und Density sind sichtbare Mock Controls.',
    next: 'Persistenz erst nach Product-Scope-Freigabe.',
    detail: 'Settings · Preferences · Workspace Links · Mock',
  },
  coach: {
    status: 'Workspace Link',
    boundary: 'Separate App, kein Embed in apps/web.',
    next: 'Coach Portal im neuen Tab öffnen, wenn Domain bereit ist.',
    detail: 'Coach · SSO handoff später · No iframe',
  },
}

function isActive(pathname: string, href: string) {
  if (href === '/dashboard') {
    return pathname === '/' || pathname === '/dashboard'
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === '/governance' || pathname.startsWith('/governance/')) {
    return <>{children}</>
  }

  const active =
    moduleNav.find((item) => isActive(pathname, item.href)) ??
    systemNav.find((item) => isActive(pathname, item.href)) ??
    (isActive(pathname, '/coach') ? { href: '/coach', label: 'Coach Draft', meta: 'Workspace', section: 'coach' } : undefined)
  const activeLabel = active?.label ?? 'Workspace'
  const activeSection = active?.section ?? 'dashboard'
  const activeMeta = active?.meta ?? 'Draft'
  const context = contextBySection[activeSection] ?? contextBySection.dashboard

  return (
    <div className={`lume-shell lume-shell-${activeSection}`}>
      <aside className="lume-sidebar">
        <Link className="lume-brand" href="/dashboard">
          <div className="lume-brand-mark">L</div>
          <div>
            <div className="lume-brand-title">LumeOS</div>
            <div className="lume-brand-sub">Athlete Operating System</div>
          </div>
        </Link>

        <div className="lume-sidebar-status">
          <span>Foundation Draft</span>
          <strong>Read-only</strong>
        </div>

        <button className="lume-search-trigger" type="button" aria-label="Suche und Command Placeholder">
          <span>Suche / Command später</span>
          <kbd>⌘K</kbd>
        </button>

        <nav className="lume-nav">
          <div>
            <div className="lume-nav-label">Module</div>
            <div className="mt-2 space-y-1">
              {moduleNav.map((item) => (
                <Link className={`lume-nav-item ${isActive(pathname, item.href) ? 'lume-nav-item-active' : ''}`} href={item.href as Route} key={item.href}>
                  <span>
                    <span className="lume-nav-title">{item.label}</span>
                    <span className="lume-nav-meta">{item.meta}</span>
                  </span>
                  <span className="lume-nav-key">{item.shortcut}</span>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="lume-nav-label">Workspaces</div>
            <div className="mt-2 space-y-1">
              {workspaceNav.map((item) => (
                <a className="lume-nav-item lume-nav-item-workspace" href={item.href} key={item.href} rel="noreferrer" target="_blank">
                  <span>
                    <span className="lume-nav-title">{item.label}</span>
                    <span className="lume-nav-meta">{item.meta}</span>
                  </span>
                  <span className="lume-nav-key">↗</span>
                </a>
              ))}
              <Link className={`lume-nav-item ${isActive(pathname, '/coach') ? 'lume-nav-item-active' : ''}`} href={'/coach' as Route}>
                <span>
                  <span className="lume-nav-title">Coach Draft</span>
                  <span className="lume-nav-meta">Local placeholder</span>
                </span>
              </Link>
            </div>
          </div>

          <div>
            <div className="lume-nav-label">System</div>
            <div className="mt-2 space-y-1">
              {systemNav.map((item) => (
                <Link className={`lume-nav-item ${isActive(pathname, item.href) ? 'lume-nav-item-active' : ''}`} href={item.href as Route} key={item.href}>
                  <span>
                    <span className="lume-nav-title">{item.label}</span>
                    <span className="lume-nav-meta">{item.meta}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className="lume-operator">
          <div className="lume-operator-dot" />
          <div>
            <div className="font-medium text-[var(--fg)]">Tom</div>
            <div className="mt-0.5 text-[11px] text-[var(--fg-subtle)]">Athlet / Operator</div>
          </div>
        </div>
      </aside>

      <div className="lume-main">
        <header className="lume-topbar">
          <div>
            <div className="lume-topbar-kicker">{activeMeta}</div>
            <div className="lume-topbar-title">{activeLabel}</div>
          </div>
          <div className="lume-topbar-strip">
            <span className="lume-sync-pill">Sync Mock · nicht live</span>
            <button className="lume-topbar-control" type="button">Theme Demo</button>
            <button className="lume-topbar-control" type="button">Context sichtbar</button>
            <button className="lume-topbar-control" type="button">Commands später</button>
          </div>
        </header>
        <main className="lume-content">{children}</main>
      </div>
      <aside className="lume-context-panel">
        <div className="lume-context-header">
          <div>
            <div className="lume-small-label">Context · {activeLabel}</div>
            <h2>{context.status}</h2>
          </div>
          <span className="lume-accent-dot" />
        </div>
        <div className="lume-buddy-widget">
          <div className="lume-buddy-orb" />
          <div>
            <div className="font-semibold text-[var(--fg)]">Buddy Placeholder</div>
            <p>{context.boundary}</p>
          </div>
        </div>
        <div className="lume-context-card">
          <div className="lume-small-label">Next safe action</div>
          <p>{context.next}</p>
        </div>
        <div className="lume-context-card">
          <div className="lume-small-label">Module detail</div>
          <p>{context.detail}</p>
        </div>
        <div className="lume-context-actions">
          <button type="button">Quick Actions Mock</button>
          <button type="button">Keine Writes</button>
        </div>
      </aside>
    </div>
  )
}
