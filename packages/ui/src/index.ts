// @lumeos/ui — Bausteine der Oberflaeche v2.
//
// Muster wie @lumeos/shared: rohes TypeScript, kein Build. Die
// konsumierende App uebersetzt mit; deshalb traegt dieses Paket keine
// eigenen typecheck/test/build-Skripte und `pnpm gate` bleibt bei
// 8 Tasks.
//
// Was hier steht, wiederholt sich in allen Modulseiten. Die Liste, an
// die sich G-03 zu halten hat, steht in docs/ssot/74-shell.md,
// Abschnitt "Was in jedem Modul wiederkehrt".

/** Praefix aller v2-Klassen. Siehe src/styles/v2.css, Kopf. */
export const V2_PREFIX = 'v2-'

/**
 * Setzt das Praefix vor einen Klassennamen.
 * Fuer Modulseiten, damit das Praefix an einer Stelle steht und nicht
 * in jedem JSX wiederholt wird.
 */
export function v2(...namen: Array<string | false | null | undefined>): string {
  return namen
    .filter((n): n is string => typeof n === 'string' && n.length > 0)
    .map(n => `${V2_PREFIX}${n}`)
    .join(' ')
}

// --- Symbole ----------------------------------------------------
export { Icon, ICONS } from './icons'
export type { IconName, IconProps } from './icons'

// --- Modulakzent ------------------------------------------------
export { MODULE_ACCENT, accentVar } from './module-accent'
export type { ModuleId, ModuleAccentKey } from './module-accent'

// --- Koerperkarte (G-26) ----------------------------------------
// Drei Module brauchen sie: Recovery (Ermuedung), Training
// (Aktivierung), Supplements (Injektionspunkte). Deshalb hier und
// nicht je Modul.
export {
  Koerperkarte, ErmuedungsKarte, AktivierungsKarte, InjektionsKarte,
  ermuedungsFarbe, aktivierungsFarbe, injektionsFarbe, INJEKTIONS_ORTE,
} from './koerperkarte'
export type {
  KoerperkarteProps, KoerperSeite, MuskelWert, KoerperPunkt, LegendenEintrag,
} from './koerperkarte'
// Die Pfaddaten selbst — wer zuordnet, muss pruefen koennen, ob es
// eine Gruppe ueberhaupt gibt.
export { MUSKELN } from './koerperkarte-pfade'
export type { Muskel, InjektionsOrt } from './koerperkarte-pfade'

// --- Geteilte Bausteine -----------------------------------------
export {
  Card, Pill, Sparkline, LineChart, RadarChart, KPI, Ring, Meter, Row, ModuleHero, Tabs,
} from './primitives'
export type {
  CardProps, PillProps, PillVariant, SparklineProps, KPIProps,
  RingProps, MeterProps, RowProps, ModuleHeroProps, ModuleHeroStat,
  TabsProps, TabItem, LineChartProps, LineSeries, RadarChartProps, RadarPoint,
} from './primitives'

// --- Attrappen-Knoepfe -------------------------------------------
export { InEntwicklung, InEntwicklungKnopf } from './in-entwicklung'
export type { InEntwicklungProps } from './in-entwicklung'

// --- In G-03 dazugekommen ---------------------------------------
// Beide gehoeren hierher, nicht in die Seite: sie wiederholen sich in
// jedem Modul, das Werte gegen Ziele oder Referenzwerte zeigt.
export { ProgressRing } from './progress-ring'
export type { ProgressRingProps } from './progress-ring'
export { CoverageRow, bewerte } from './coverage-row'
export type {
  CoverageRowProps, ReferenceDirection, ReferenceStatus,
} from './coverage-row'

// --- Huelle -----------------------------------------------------
export { AppShell } from './shell/app-shell'
export type { AppShellProps } from './shell/app-shell'
export { Sidebar } from './shell/sidebar'
export type { SidebarProps, LinkComponent } from './shell/sidebar'
export { Topbar } from './shell/topbar'
export type { TopbarProps, SyncState } from './shell/topbar'
export { ContextPanel } from './shell/context-panel'
export type {
  ContextPanelProps, QuickAction, Insight, ContextDetail,
} from './shell/context-panel'
export { BuddyOrb } from './shell/buddy-orb'
export type { BuddyOrbProps, BuddyState } from './shell/buddy-orb'
export { MODULES, WORKSPACES, SETTINGS_ENTRY, resolveNav, V2_BASE } from './shell/nav'
export type { NavEntry, NavSubEntry, WorkspaceEntry } from './shell/nav'
