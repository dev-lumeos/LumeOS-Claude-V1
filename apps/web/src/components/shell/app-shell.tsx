'use client'

import Link from 'next/link'
import type { Route } from 'next'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

const moduleAccentMap = {
  dashboard: 'dash',
  nutrition: 'nutri',
  training: 'train',
  recovery: 'recov',
  supplements: 'suppl',
  goals: 'goals',
  medical: 'medic',
  coach: 'coach',
  buddy: 'buddy',
  marketplace: 'mkt',
  admin: 'admin',
  settings: 'dash',
} as const

const moduleNav = [
  { href: '/dashboard', icon: 'D', label: 'Dashboard', meta: 'Overview', shortcut: '1', section: 'dashboard', tag: 'DASH', accentKey: moduleAccentMap.dashboard },
  { href: '/nutrition', icon: 'N', label: 'Nutrition', meta: 'Diary', shortcut: '2', section: 'nutrition', tag: 'NUTRI', accentKey: moduleAccentMap.nutrition },
  { href: '/training', icon: 'T', label: 'Training', meta: 'Today', shortcut: '3', section: 'training', tag: 'TRAIN', accentKey: moduleAccentMap.training },
  { href: '/recovery', icon: 'R', label: 'Recovery', meta: 'Readiness', shortcut: '4', section: 'recovery', tag: 'RECOV', accentKey: moduleAccentMap.recovery },
  { href: '/supplements', icon: 'S', label: 'Supplements', meta: 'Stack', shortcut: '5', section: 'supplements', tag: 'SUPPL', accentKey: moduleAccentMap.supplements },
  { href: '/goals', icon: 'G', label: 'Goals & Body', meta: 'Body', shortcut: '6', section: 'goals', tag: 'GOALS', accentKey: moduleAccentMap.goals },
  { href: '/medical', icon: 'M', label: 'Medical', meta: 'Monitor', shortcut: '7', section: 'medical', tag: 'MEDIC', accentKey: moduleAccentMap.medical },
]

const workspaceNav = [
  { href: 'https://coach.lumeos.app', icon: 'C', label: 'Coach Portal', section: 'coach', accentKey: moduleAccentMap.coach },
  { href: 'https://buddy.lumeos.app', icon: 'B', label: 'Buddy', section: 'buddy', accentKey: moduleAccentMap.buddy },
  { href: 'https://marketplace.lumeos.app', icon: 'M', label: 'Marketplace', section: 'marketplace', accentKey: moduleAccentMap.marketplace },
  { href: 'https://admin.lumeos.app', icon: 'A', label: 'Admin', section: 'admin', accentKey: moduleAccentMap.admin },
]

const systemNav = [
  { href: '/settings', icon: 'S', label: 'Settings', section: 'settings' },
]

type Density = 'compact' | 'default' | 'comfortable'
type Theme = 'dark' | 'light'
type ContextTone = 'pos' | 'warn' | 'info'

const contextBySection: Record<
  string,
  {
    status: string
    boundary: string
    next: string
    detail: string
    buddy: string
    insights: Array<{ tone: ContextTone; text: string }>
    actions: string[]
  }
> = {
  dashboard: {
    status: 'Draft landing',
    boundary: 'Cross-module Status ohne Live-Daten.',
    next: 'Review-Fokus und sichere nächste Schritte prüfen.',
    detail: 'Dashboard · 4 KPI-Flächen · Today Flow · Read-only',
    buddy: 'Heute zählt nur Sichtprüfung: Shell, Module, Grenzen.',
    insights: [
      { tone: 'info', text: '3-Spalten-Shell aktiv, Context Panel sichtbar.' },
      { tone: 'warn', text: 'Dashboard-Daten sind Draft/Mock, nicht live.' },
      { tone: 'pos', text: 'Alle Core-Module sind erreichbar.' },
    ],
    actions: ['Route Smoke prüfen', 'Nutrition Boundary prüfen', 'Draft Commit nicht als Product Truth behandeln'],
  },
  nutrition: {
    status: 'Diary-first Draft',
    boundary: 'BLS-only, kein USDA/OFF, keine Diary Writes.',
    next: 'Food Search öffnen oder BLS-Grenzen prüfen.',
    detail: 'Nutrition · 117 Nährstoffe · BLS 10.840 · Candidate',
    buddy: 'Diary ist sichtbar, aber bewusst ohne Logging-Aktion.',
    insights: [
      { tone: 'info', text: 'Food Search bleibt unter /nutrition/foods erhalten.' },
      { tone: 'warn', text: 'Planner, Insights und MealCam sind nicht live.' },
      { tone: 'pos', text: 'BLS-only Boundary ist im Modul sichtbar.' },
    ],
    actions: ['Food Search öffnen', 'BLS Boundary lesen', 'Keine Writes ausführen'],
  },
  training: {
    status: 'Placeholder',
    boundary: 'Kein Workout-Logging, keine Live-Pläne.',
    next: 'Training-Spec als späteren Modulauftrag behandeln.',
    detail: 'Training · Today Plan · History · Library · Backlog',
    buddy: 'Training bleibt Shell-Placeholder für spätere Workouts.',
    insights: [
      { tone: 'info', text: 'Shortcut 3 und Accent-Token sind vorbereitet.' },
      { tone: 'warn', text: 'Keine Trainingsplanung oder History geladen.' },
    ],
    actions: ['Spec prüfen', 'No-live Boundary behalten'],
  },
  recovery: {
    status: 'Placeholder',
    boundary: 'Kein HRV/Sleep-Live-Status.',
    next: 'Readiness- und Sleep-Flächen separat spezifizieren.',
    detail: 'Recovery · Readiness · Sleep · HRV · Backlog',
    buddy: 'Recovery ist als Modulrahmen vorhanden, nicht als Score.',
    insights: [
      { tone: 'info', text: 'Recovery Accent und Navigation sind aktiv.' },
      { tone: 'warn', text: 'Kein Sleep-, HRV- oder Wearable-Signal.' },
    ],
    actions: ['Readiness später spezifizieren', 'Keine Live-Werte anzeigen'],
  },
  supplements: {
    status: 'Placeholder',
    boundary: 'Tracking only, keine medizinische Beratung.',
    next: 'Stack- und Compliance-Scope separat prüfen.',
    detail: 'Supplements · Stack · Compliance · Not medical advice',
    buddy: 'Supplements bleibt Tracking-Shell, nicht Beratung.',
    insights: [
      { tone: 'warn', text: 'Keine Dosierungs- oder Einnahmeempfehlung.' },
      { tone: 'info', text: 'Medical-Link bleibt späterer Safety-Kontext.' },
    ],
    actions: ['Stack Scope prüfen', 'Medical Advice vermeiden'],
  },
  goals: {
    status: 'Goals + Body Draft',
    boundary: 'Keine aktiven Ziele ohne Athlete Confirmation.',
    next: 'Tabs und Goal Cards als Follow-up umsetzen.',
    detail: 'Goals · Timeline · Body Metrics · Measurements · Mock',
    buddy: 'Goals sind sichtbar, aber keine echten Zielzustände.',
    insights: [
      { tone: 'info', text: 'Goals & Body ist ein Core-Modul mit Shortcut 6.' },
      { tone: 'warn', text: 'Keine Athlete Confirmation, keine aktiven Ziele.' },
    ],
    actions: ['Goal Tabs prüfen', 'No fake live goals'],
  },
  medical: {
    status: 'Sensitive Placeholder',
    boundary: 'Monitoring only, keine Diagnose, keine Therapie.',
    next: 'Medical-Scope nur mit Privacy- und Security-Review.',
    detail: 'Medical · encrypted at rest later · No advice · No data',
    buddy: 'Medical bleibt Monitoring-only. Keine Diagnose.',
    insights: [
      { tone: 'warn', text: 'Sensitive Modul: kein Live-Datum ohne Security Review.' },
      { tone: 'info', text: 'Shortcut 7 und rust Accent sind aktiv.' },
    ],
    actions: ['Privacy Boundary prüfen', 'Keine Advice-Texte ergänzen'],
  },
  settings: {
    status: 'System Draft',
    boundary: 'Theme, Sync und Density sind sichtbare Mock Controls.',
    next: 'Persistenz erst nach Product-Scope-Freigabe.',
    detail: 'Settings · Preferences · Workspace Links · Mock',
    buddy: 'Settings zeigt Systemzustand und Workspace-Handoff.',
    insights: [
      { tone: 'info', text: 'Theme und Density sind lokale UI-Präferenzen.' },
      { tone: 'warn', text: 'Sync ist Mock, kein Backend-Zustand.' },
    ],
    actions: ['Theme umschalten', 'Density prüfen', 'Workspace Links prüfen'],
  },
  coach: {
    status: 'Workspace Link',
    boundary: 'Separate App, kein Embed in apps/web.',
    next: 'Coach Portal im neuen Tab öffnen, wenn Domain bereit ist.',
    detail: 'Coach · SSO handoff später · No iframe',
    buddy: 'Coach ist Workspace-Handoff, nicht eingebettet.',
    insights: [
      { tone: 'info', text: 'Workspace Links öffnen extern im neuen Tab.' },
      { tone: 'warn', text: 'SSO und Role-Gates sind nicht implementiert.' },
    ],
    actions: ['Workspace Boundary prüfen', 'Kein Embed verwenden'],
  },
}

function accentVar(accentKey: string) {
  return `var(--acc-${accentKey})`
}

function isActive(pathname: string, href: string) {
  if (href === '/dashboard') {
    return pathname === '/' || pathname === '/dashboard'
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [rightPanel, setRightPanel] = useState<'visible' | 'hidden'>('visible')
  const [theme, setTheme] = useState<Theme>('dark')
  const [density, setDensity] = useState<Density>('default')

  const activeModule = moduleNav.find((item) => isActive(pathname, item.href))
  const activeSystem = systemNav.find((item) => isActive(pathname, item.href))
  const activeCoach = isActive(pathname, '/coach') ? { href: '/coach', label: 'Coach Draft', meta: 'Workspace', section: 'coach' } : undefined
  const active = activeModule ?? activeSystem ?? activeCoach
  const activeLabel = active?.label ?? 'Workspace'
  const activeSection = active?.section ?? 'dashboard'
  const activeMeta = active && 'meta' in active ? active.meta : 'Draft'
  const activeTag = activeModule?.tag ?? activeSection.toUpperCase()
  const activeAccentKey = activeModule?.accentKey ?? moduleAccentMap[activeSection as keyof typeof moduleAccentMap] ?? moduleAccentMap.dashboard
  const context = contextBySection[activeSection] ?? contextBySection.dashboard
  useEffect(() => {
    const storedTheme = window.localStorage.getItem('lumeos-theme')
    const storedPanel = window.localStorage.getItem('lumeos-right-panel')
    const storedDensity = window.localStorage.getItem('lumeos-density')

    if (storedTheme === 'light' || storedTheme === 'dark') {
      setTheme(storedTheme)
    }

    if (storedPanel === 'hidden' || storedPanel === 'visible') {
      setRightPanel(storedPanel)
    }

    if (storedDensity === 'compact' || storedDensity === 'default' || storedDensity === 'comfortable') {
      setDensity(storedDensity)
    }
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem('lumeos-theme', theme)
  }, [theme])

  useEffect(() => {
    window.localStorage.setItem('lumeos-right-panel', rightPanel)
  }, [rightPanel])

  useEffect(() => {
    window.localStorage.setItem('lumeos-density', density)
  }, [density])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
        return
      }

      const target = event.target as HTMLElement | null
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) {
        return
      }

      const item = moduleNav.find((navItem) => navItem.shortcut === event.key)
      if (item) {
        event.preventDefault()
        router.push(item.href as Route)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [router])

  return (
    <div
      className={`lume-shell lume-shell-${activeSection}`}
      data-density={density}
      data-right-panel={rightPanel}
      style={{ '--acc': accentVar(activeAccentKey) } as React.CSSProperties}
    >
      <aside className="lume-sidebar">
        <Link className="lume-brand" href="/dashboard">
          <div className="lume-brand-mark">L</div>
          <div>
            <div className="lume-brand-row">
              <div className="lume-brand-title">LumeOS</div>
              <span className="lume-version-tag">v0.9.4</span>
            </div>
            <div className="lume-brand-sub">Athlete OS</div>
          </div>
        </Link>

        <button className="lume-search-trigger" type="button" aria-label="Search or jump placeholder">
          <span>Search or jump to...</span>
          <kbd>⌘K</kbd>
        </button>

        <nav className="lume-nav">
          <div>
            <div className="lume-nav-label">Modules</div>
            <div className="mt-2 space-y-1">
              {moduleNav.map((item) => (
                <Link
                  className={`lume-nav-item ${isActive(pathname, item.href) ? 'lume-nav-item-active' : ''}`}
                  href={item.href as Route}
                  key={item.href}
                  style={{ '--item-acc': accentVar(item.accentKey) } as React.CSSProperties}
                >
                  <span className="lume-nav-main">
                    <span className="lume-nav-icon">{item.icon}</span>
                    <span className="lume-nav-copy">
                      <span className="lume-nav-title">{item.label}</span>
                      <span className="lume-nav-meta">{item.meta}</span>
                    </span>
                  </span>
                  <span className="lume-nav-key" aria-label={`Shortcut ${item.shortcut}`}>{item.shortcut}</span>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="lume-nav-label">Workspaces</div>
            <div className="mt-2 space-y-1">
              {workspaceNav.map((item) => (
                <a
                  className="lume-nav-item lume-nav-item-workspace"
                  href={item.href}
                  key={item.href}
                  rel="noreferrer"
                  target="_blank"
                  style={{ '--item-acc': accentVar(item.accentKey) } as React.CSSProperties}
                >
                  <span>
                    <span className="lume-nav-icon lume-nav-icon-secondary">{item.icon}</span>
                    <span className="lume-nav-title">{item.label}</span>
                  </span>
                  <span className="lume-nav-key" aria-label="External workspace">↗</span>
                </a>
              ))}
              <Link
                className={`lume-nav-item ${isActive(pathname, '/coach') ? 'lume-nav-item-active' : ''}`}
                href={'/coach' as Route}
                style={{ '--item-acc': accentVar(moduleAccentMap.coach) } as React.CSSProperties}
              >
                <span>
                  <span className="lume-nav-icon lume-nav-icon-secondary">C</span>
                  <span className="lume-nav-title">Coach Draft</span>
                </span>
              </Link>
            </div>
          </div>

          <div>
            <div className="lume-nav-label">System</div>
            <div className="mt-2 space-y-1">
              {systemNav.map((item) => (
                <Link
                  className={`lume-nav-item ${isActive(pathname, item.href) ? 'lume-nav-item-active' : ''}`}
                  href={item.href as Route}
                  key={item.href}
                  style={{ '--item-acc': accentVar(moduleAccentMap.settings) } as React.CSSProperties}
                >
                  <span>
                    <span className="lume-nav-icon lume-nav-icon-secondary">{item.icon}</span>
                    <span className="lume-nav-title">{item.label}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className="lume-operator">
          <button className="lume-avatar-button" type="button" aria-label="Profile Settings Placeholder">TM</button>
          <div>
            <div className="font-medium text-[var(--fg)]">Tom</div>
            <div className="mt-0.5 text-[11px] text-[var(--fg-subtle)]">Athlet · Draft Tier</div>
          </div>
          <button className="lume-user-more" type="button" aria-label="More profile options">...</button>
        </div>
      </aside>

      <div className="lume-main">
        <header className="lume-topbar">
          <div className="lume-topbar-title-group">
            <div className="lume-module-tag">
              <span className="lume-accent-dot" />
              <span>{activeTag}</span>
            </div>
            <div className="lume-topbar-copy">
              <div className="lume-topbar-title">Workspace / {activeLabel}</div>
              <div className="lume-topbar-kicker">{activeMeta}</div>
            </div>
          </div>
          <div className="lume-topbar-strip">
            <span className="lume-sync-pill"><span className="lume-status-dot" />Offline · 0 queued</span>
            <button className="lume-topbar-icon lume-topbar-secondary" type="button" aria-label="Notifications Placeholder">Bell 0</button>
            <button className="lume-topbar-control" type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              Theme
            </button>
            <button className="lume-topbar-control" type="button" onClick={() => setRightPanel(rightPanel === 'visible' ? 'hidden' : 'visible')}>
              Context
            </button>
            <button className="lume-topbar-control" type="button">Commands ⌘K</button>
          </div>
        </header>
        <main className="lume-content">{children}</main>
      </div>
      {rightPanel === 'visible' ? <aside className="lume-context-panel">
        <div className="lume-context-header">
          <div>
            <div className="lume-small-label">Context · {activeLabel}</div>
            <h2>{activeLabel}</h2>
            <p>{context.status}</p>
          </div>
          <span className="lume-accent-dot" />
        </div>
        <section className="lume-buddy-widget">
          <div className="lume-buddy-orb" />
          <div>
            <div className="font-semibold text-[var(--fg)]">Buddy</div>
            <p>{context.buddy}</p>
          </div>
        </section>
        <section className="lume-context-section">
          <div className="lume-context-section-title">Insights</div>
          <div className="lume-context-stack">
          {context.insights.map((insight) => (
            <div className={`lume-insight-card lume-insight-${insight.tone}`} key={insight.text}>
              <span />
              <p>{insight.text}</p>
            </div>
          ))}
          </div>
        </section>
        <section className="lume-context-section">
          <div className="lume-context-section-title">Quick Actions</div>
          <div className="lume-context-actions">
          {context.actions.map((action) => (
            <button type="button" key={action}>
              <span>{action}</span>
              <span>Read-only</span>
            </button>
          ))}
          </div>
        </section>
        <section className="lume-context-card">
          <div className="lume-small-label">Module details</div>
          <p>{context.detail}</p>
          <div className="lume-context-rule" />
          <div className="lume-small-label">Boundary</div>
          <p>{context.boundary}</p>
          <div className="lume-context-rule" />
          <div className="lume-small-label">Next safe action</div>
          <p>{context.next}</p>
        </section>
      </aside> : null}
    </div>
  )
}
