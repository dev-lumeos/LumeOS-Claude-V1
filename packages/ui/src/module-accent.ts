// Die elf Modulakzente der Oberflaeche v2.
//
// ENTSCHEIDUNG (G-02): eigene Liste in packages/ui, NICHT geteilt mit
// apps/web/src/components/shell/app-shell.tsx.
//
// Der Auftrag laesst die Wahl und verlangt eine Begruendung. Sie hat
// zwei Teile, einen zwingenden und einen inhaltlichen.
//
// ZWINGEND: [cmd] `moduleAccentMap` steht in app-shell.tsx auf
// Modulebene OHNE `export` — die Datei exportiert genau ein Symbol,
// `AppShell`. Teilen hiesse, app-shell.tsx zu aendern. Der Auftrag
// verbietet das ausdruecklich ("Nicht die alte app-shell.tsx
// anfassen"). Die Frage ist damit schon entschieden, bevor man ueber
// Kopplung nachdenkt.
//
// INHALTLICH, falls sie spaeter neu gestellt wird: Eine geteilte Liste
// bindet zwei Oberflaechen aneinander, die sich gerade absichtlich
// auseinander entwickeln. Der Preis der zweiten Liste ist Drift — der
// ist hier klein, weil die Liste keine Logik traegt, sondern elf feste
// Zuordnungen von Modul zu Token, und die Tokens selbst [cmd] geteilt
// bleiben (styles/themes/lume.css). Weicht eine Farbe ab, faellt es im
// Nebeneinander sofort auf. Ein Test haelt beide Listen gegeneinander,
// damit "faellt auf" nicht "faellt jemandem auf" heisst.
//
// BEIM UMSCHALTEN (G-07): Diese Liste ueberlebt, die in app-shell.tsx
// faellt mit der Datei weg.

/** Die Modulschluessel, fuer die ein Akzenttoken existiert. */
export type ModuleAccentKey =
  | 'dash' | 'nutri' | 'train' | 'recov' | 'suppl' | 'goals'
  | 'medic' | 'coach' | 'buddy' | 'mkt' | 'admin'

/**
 * Modul-Kennung -> Akzentschluessel.
 * Die Kennungen folgen der Vorlage (shell.jsx, MODULES/APPS).
 */
export const MODULE_ACCENT = {
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
} as const satisfies Record<string, ModuleAccentKey>

export type ModuleId = keyof typeof MODULE_ACCENT

/**
 * Der CSS-Ausdruck fuer den Akzent eines Moduls.
 *
 * [read] Es bleibt bei `var(--acc-*)` als Inline-Wert, wie in der
 * bestehenden Oberflaeche. Der Grund steht im Auftrag: die einzelnen
 * `--acc-nutri` sind NICHT in tailwind.config.js gespiegelt, deshalb
 * gibt es `bg-acc`, aber kein `bg-acc-nutri`. Die Huelle setzt `--acc`
 * einmal, alles darunter benutzt `var(--acc)`.
 */
export function accentVar(id: ModuleId): string {
  return `var(--acc-${MODULE_ACCENT[id]})`
}
