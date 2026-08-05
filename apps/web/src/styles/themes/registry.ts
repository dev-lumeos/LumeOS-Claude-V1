// Theme-Registry (Block 4 B2, 2026-08-05).
// Ein neues Theme anzulegen heisst: CSS-Datei in diesem Verzeichnis anlegen
// (Basisblock + [data-mode='light']-Block, Vertrag siehe contract.ts) und
// HIER eintragen: ein `import './<id>.css'` plus ein Eintrag in THEMES.
// Genau zwei Dateien — mehr ist ein Fehler im System.
//
// Der Vertragstest (__tests__/theme-contract.test.ts) liest diese Datei als
// Text; die Eintraege muessen daher woertlich als `id: '<id>'` und
// `import './<id>.css'` erscheinen (keine dynamischen Konstruktionen).

import './lume.css'

export type ThemeMode = 'dark' | 'light'

export type ThemeDefinition = {
  id: string
  label: string
}

export const THEMES: readonly ThemeDefinition[] = [
  { id: 'lume', label: 'Lume' },
]

export const DEFAULT_THEME_ID = 'lume'
export const DEFAULT_MODE: ThemeMode = 'dark'

// Cookies statt localStorage: der Server kennt sie beim ersten Rendern und
// setzt data-theme/data-mode schon im HTML — kein Aufblitzen. localStorage
// waere erst clientseitig lesbar, nach dem ersten Paint.
export const THEME_COOKIE = 'lume-theme'
export const MODE_COOKIE = 'lume-mode'

export function isThemeId(value: string | undefined): value is string {
  return typeof value === 'string' && THEMES.some(theme => theme.id === value)
}

export function isThemeMode(value: string | undefined): value is ThemeMode {
  return value === 'dark' || value === 'light'
}
