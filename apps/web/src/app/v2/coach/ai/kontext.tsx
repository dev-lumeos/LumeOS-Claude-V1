'use client'

// Der Zustandskontext des AI-Coach-Moduls.
//
// QUELLE: theme-v1/module-buddy.jsx:65 (`BuddyCtx`) und :72.
//
// `[cmd]` Anders als bei Human Coaches ist das KEIN Modalkontext: die
// Vorlage reicht vier Zustandswerte durch (`persona`, `autonomy`,
// `tier` und ihre Setzer), keine Fensterverwaltung. Das ganze Modul
// fuehrt genau ein Fenster — den Regeleditor in `tab-wissen.tsx` —
// und das haelt seinen Zustand selbst.
import * as React from 'react'

export type BuddyKontextWert = {
  persona: string
  setPersona: (p: string) => void
  autonomy: number
  setAutonomy: (a: number) => void
  tier: string
  setTier: (t: string) => void
}

export const BuddyKontext = React.createContext<BuddyKontextWert | null>(null)

export function useBuddy(): BuddyKontextWert {
  const v = React.useContext(BuddyKontext)
  if (!v) throw new Error('BuddyKontext fehlt — Tab ausserhalb des Providers gerendert.')
  return v
}
