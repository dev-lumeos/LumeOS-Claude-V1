/** @type {import('tailwindcss').Config} */

// BEWUSST OHNE THEME-TOKENS — Entscheidung C-14, 2026-08-12.
//
// apps/web spiegelt in seiner tailwind.config.js die semantischen Tokens
// (--bg, --fg, --acc, shadcn-Aliase). Diese App tut das NICHT, und das
// ist am tatsaechlichen Bedarf entschieden, nicht grundsaetzlich:
//
// `[cmd]` Die umgezogene Kurationsseite nutzt 100 className-Stellen, aber
// KEINE einzige Theme-Token-Klasse (bg-bg, text-fg, border-border, …) —
// sie kommt vollstaendig mit der Standard-Palette aus (slate, emerald,
// amber). Das Themesystem zu uebernehmen haette also nichts gestylt, was
// nicht ohnehin gestylt ist, und dafuer contract.ts, registry.ts,
// lume.css und den Cookie-SSR-Bootstrap nach sich gezogen.
//
// Wenn apps/admin eigene Oberflaeche mit Markenfarben bekommt, ist der
// Zeitpunkt gekommen, das Themesystem nach packages/ zu heben — dann mit
// zwei echten Nutzern statt einem. Bis dahin waere es verfruehte
// Abstraktion, und eine Kopie waere Drift.
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {}
  },
  plugins: []
}
