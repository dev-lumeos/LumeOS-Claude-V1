// Die Navigation der Oberflaeche v2.
//
// UEBERSETZT AUS shell.jsx (MODULES, APPS, resolveNav). Unterschiede
// zur Vorlage, jeder mit Grund:
//
// 1. `href` statt `id` als Ziel. Die Vorlage haelt das aktive Modul in
//    einem useState und schaltet mit `setActive` um — sie ist eine
//    einzelne HTML-Datei ohne Router. Hier gibt es Routen; eine
//    Zustandsvariable neben dem Router waere eine zweite Wahrheit
//    darueber, wo man ist.
//
// 2. Die Arbeitsbereiche (APPS) tragen in der Vorlage teils ein
//    `external`-Feld, teils nicht — Marketplace und Admin haben keins,
//    obwohl sie eigene Anwendungen sind. [cmd] In der bestehenden
//    Oberflaeche zeigen alle vier auf `https://<name>.lumeos.app`.
//    Hier deshalb einheitlich extern, mit `external: true`.
//
// 3. Der Bereich "System" der Vorlage loest zwei CustomEvents aus
//    ("open-onboarding-test", "open-profile-settings"). Das ist der
//    Ersatz fuer einen Router in einer Datei ohne Router. Uebernommen
//    wird nur "Settings" als echte Route; der Onboarding-Test ist ein
//    Vorfuehrknopf der Vorlage und gehoert nicht in die Anwendung.
import type { IconName } from '../icons'
import type { ModuleId } from '../module-accent'

export type NavEntry = {
  id: ModuleId
  label: string
  icon: IconName
  /** Ziel innerhalb der Anwendung, relativ zur v2-Wurzel. */
  href: string
  /** Tastenkuerzel aus der Vorlage. Noch nicht verdrahtet — siehe Bericht. */
  shortcut?: string
  sub?: NavSubEntry[]
}

export type NavSubEntry = {
  id: string
  label: string
  href: string
  /** Eigener Akzent, sonst erbt der Untereintrag den des Moduls. */
  accent?: ModuleId
}

export type WorkspaceEntry = {
  id: ModuleId
  label: string
  icon: IconName
  /** Arbeitsbereiche liegen ausserhalb dieser Anwendung. */
  url: string
}

/** Wurzel der Parallelroute. Faellt beim Umschalten (G-07) weg. */
export const V2_BASE = '/v2'

export const MODULES: NavEntry[] = [
  { id: 'dashboard',   label: 'Dashboard',    icon: 'dashboard',   href: `${V2_BASE}`,             shortcut: '1' },
  {
    // G-03: zwei Seiten, deshalb Untereintraege. Der Aufbau war schon
    // da (Coach), er wird hier zum zweiten Mal benutzt.
    id: 'nutrition', label: 'Nutrition', icon: 'nutrition',
    href: `${V2_BASE}/nutrition`, shortcut: '2',
    sub: [
      { id: 'nutrition-diary',  label: 'Tagebuch', href: `${V2_BASE}/nutrition` },
      { id: 'nutrition-search', label: 'Suche',    href: `${V2_BASE}/nutrition/suche` },
    ],
  },
  { id: 'training',    label: 'Training',     icon: 'training',    href: `${V2_BASE}/training`,    shortcut: '3' },
  { id: 'recovery',    label: 'Recovery',     icon: 'recovery',    href: `${V2_BASE}/recovery`,    shortcut: '4' },
  { id: 'supplements', label: 'Supplements',  icon: 'supplements', href: `${V2_BASE}/supplements`, shortcut: '5' },
  { id: 'goals',       label: 'Goals & Body', icon: 'goals',       href: `${V2_BASE}/goals`,       shortcut: '6' },
  { id: 'medical',     label: 'Medical',      icon: 'medical',     href: `${V2_BASE}/medical`,     shortcut: '7' },
  {
    id: 'coach', label: 'Coach', icon: 'coach', href: `${V2_BASE}/coach`, shortcut: '8',
    sub: [
      { id: 'coach-human', label: 'Human Coaches', href: `${V2_BASE}/coach/human` },
      { id: 'coach-ai',    label: 'AI Coach',      href: `${V2_BASE}/coach/ai`, accent: 'buddy' },
    ],
  },
]

export const WORKSPACES: WorkspaceEntry[] = [
  { id: 'coach',       label: 'Coach Portal', icon: 'coach',       url: 'https://coach.lumeos.app' },
  { id: 'marketplace', label: 'Marketplace',  icon: 'marketplace', url: 'https://marketplace.lumeos.app' },
  { id: 'admin',       label: 'Admin',        icon: 'admin',       url: 'https://admin.lumeos.app' },
]

export const SETTINGS_ENTRY: NavEntry = {
  id: 'settings',
  label: 'Settings',
  icon: 'settings',
  href: `${V2_BASE}/settings`,
}

/**
 * Welcher Eintrag ist bei diesem Pfad aktiv?
 *
 * Gegenueber der Vorlage (`resolveNav` ueber eine id) arbeitet das hier
 * auf dem Pfad. Die laengste passende Route gewinnt, damit
 * `/v2/coach/ai` den Untereintrag trifft und nicht das Modul.
 */
export function resolveNav(pathname: string): {
  entry: NavEntry
  sub?: NavSubEntry
} {
  let treffer: { entry: NavEntry; sub?: NavSubEntry } | undefined
  let laenge = -1

  const pruefe = (href: string, entry: NavEntry, sub?: NavSubEntry) => {
    const passt = pathname === href || pathname.startsWith(`${href}/`)
    if (passt && href.length > laenge) {
      laenge = href.length
      treffer = sub ? { entry, sub } : { entry }
    }
  }

  for (const m of MODULES) {
    pruefe(m.href, m)
    for (const s of m.sub ?? []) pruefe(s.href, m, s)
  }

  // `[cmd]` Settings gehoert dazu, steht aber nicht in MODULES — es
  // liegt in der Seitenleiste unter SYSTEM. Ohne diese Zeile fiel
  // /v2/settings auf das Dashboard zurueck: die Kopfzeile schrieb
  // "Dashboard", und die Seitenleiste hob den falschen Eintrag hervor.
  // Aufgefallen in GO-01, als Settings die erste echte Seite bekam.
  pruefe(SETTINGS_ENTRY.href, SETTINGS_ENTRY)

  // Kein Treffer: das Dashboard liegt auf der Wurzel und ist die
  // Voreinstellung — wie in der Vorlage (MODULES[0]).
  return treffer ?? { entry: MODULES[0] }
}
