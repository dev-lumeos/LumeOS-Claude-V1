// Token-Vertrag des Theme-Systems (Block 4 B1, 2026-08-05).
//
// Mittel der Wahl: Konstantenliste + node:test-Pruefung
// (__tests__/theme-contract.test.ts). Begruendung: ein TypeScript-Typ kann
// CSS-Dateien nicht pruefen; die Testpruefung laeuft in `pnpm test` — dem
// bestehenden Gate — und laesst ein unvollstaendiges Theme auffallen,
// statt es still halb wirken zu lassen.
//
// Ein Theme MUSS im Basisblock ([data-theme='<id>']) alle BASE-Tokens
// definieren und im Tagmodus-Block ([data-theme='<id>'][data-mode='light'])
// alle LIGHT-Tokens. Status-Farben (--pos/--warn/--neg) sind im Tagmodus
// optional — der Bestand (Lume) laesst sie in beiden Modi identisch.

/** Muss im Tagmodus-Block ueberschrieben werden (22 Farb-Tokens). */
export const THEME_TOKENS_LIGHT = [
  '--bg',
  '--bg-elev',
  '--surface',
  '--surface-2',
  '--surface-hover',
  '--border',
  '--border-strong',
  '--fg',
  '--fg-muted',
  '--fg-subtle',
  '--fg-dim',
  '--acc-dash',
  '--acc-nutri',
  '--acc-train',
  '--acc-recov',
  '--acc-suppl',
  '--acc-goals',
  '--acc-medic',
  '--acc-coach',
  '--acc-buddy',
  '--acc-mkt',
  '--acc-admin',
] as const

/** Muss im Basisblock stehen: alle Farb-Tokens plus Status und Struktur. */
export const THEME_TOKENS_BASE = [
  ...THEME_TOKENS_LIGHT,
  '--pos',
  '--warn',
  '--neg',
  '--acc',
  '--pad-card',
  '--radius',
  '--radius-sm',
  '--radius-lg',
  // G-18: `--font-sans` stand hier NICHT — und fehlte deshalb neun
  // Tage lang unbemerkt in lume.css, obwohl v2.css sie benutzt. Die
  // Seite lief auf die Browservorgabe (unter Windows eine
  // Serifenschrift). Ein Vertrag, der die eine Schriftvariable prueft
  // und die andere nicht, prueft die Haelfte.
  '--font-sans',
  '--font-mono',
] as const

export type ThemeToken = (typeof THEME_TOKENS_BASE)[number]
