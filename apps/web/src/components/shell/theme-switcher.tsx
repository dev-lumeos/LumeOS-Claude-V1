'use client'

// Umschalter fuer Theme und Modus (Block 4 B4). Bewusst schlicht.
// Schreibt Cookies (der Server rendert daraus data-theme/data-mode beim
// naechsten Request — kein Aufblitzen) und setzt die Attribute sofort am
// <html>-Element fuer den laufenden Besuch.
import { useEffect, useState } from 'react'

import { Button } from '../ui/button'
import {
  DEFAULT_MODE,
  DEFAULT_THEME_ID,
  MODE_COOKIE,
  THEME_COOKIE,
  THEMES,
  isThemeMode,
  type ThemeMode,
} from '../../styles/themes/registry'

function persist(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Lax`
}

export function ThemeSwitcher() {
  const [theme, setTheme] = useState(DEFAULT_THEME_ID)
  const [mode, setMode] = useState<ThemeMode>(DEFAULT_MODE)

  useEffect(() => {
    const root = document.documentElement
    const attrTheme = root.getAttribute('data-theme')
    if (attrTheme) setTheme(attrTheme)
    const attrMode = root.getAttribute('data-mode')
    if (isThemeMode(attrMode ?? undefined)) setMode(attrMode as ThemeMode)
  }, [])

  function applyTheme(id: string) {
    document.documentElement.setAttribute('data-theme', id)
    persist(THEME_COOKIE, id)
    setTheme(id)
  }

  function toggleMode() {
    const next: ThemeMode = mode === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-mode', next)
    persist(MODE_COOKIE, next)
    setMode(next)
  }

  return (
    <>
      <select
        aria-label="Theme"
        className="lume-topbar-control"
        onChange={event => applyTheme(event.target.value)}
        value={theme}
      >
        {THEMES.map(item => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
      {/* shadcn-Probe (Schritt A): tatsaechlich gerenderte Stelle, auf der
          sich Theme- UND Moduswechsel zeigen muessen — bezieht alle Farben
          ueber das Token-Mapping (primary/input/background/accent). */}
      <Button onClick={toggleMode} size="sm" type="button" variant="outline">
        {mode === 'dark' ? 'Tagmodus' : 'Nachtmodus'}
      </Button>
    </>
  )
}
