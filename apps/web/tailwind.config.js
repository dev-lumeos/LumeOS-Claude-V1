/** @type {import('tailwindcss').Config} */
// theme.extend spiegelt die semantischen Tokens aus src/app/globals.css.
// Werte leben ausschliesslich dort — hier stehen nur var()-Verweise.
// Die elf Modul-/App-Akzente (--acc-*) sind bewusst nicht gespiegelt (TODO A-06);
// erreichbar ist nur der aktive Akzent --acc.
// Radien unter eigenen Schlüsseln (rounded-token*): ein Spiegeln auf
// sm/DEFAULT/lg würde bestehende rounded-*-Nutzungen stillschweigend umstylen.
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-elev': 'var(--bg-elev)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        'surface-hover': 'var(--surface-hover)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        fg: 'var(--fg)',
        'fg-muted': 'var(--fg-muted)',
        'fg-subtle': 'var(--fg-subtle)',
        'fg-dim': 'var(--fg-dim)',
        pos: 'var(--pos)',
        warn: 'var(--warn)',
        neg: 'var(--neg)',
        acc: 'var(--acc)',
        // shadcn-Namensraum (Schritt A, 2026-08-05): reine ALIASE auf die
        // bestehenden Tokens — kein zweiter Farbsatz, keine neuen CSS-
        // Variablen, der Theme-Vertrag bleibt unveraendert.
        // 'border' erwartet shadcn unter demselben Namen wie oben — identisch.
        // Achtung Semantik: shadcns 'accent' ist die Hover-Flaeche
        // (--surface-hover), NICHT der Markenakzent --acc (der ist 'primary').
        background: 'var(--bg)',
        foreground: 'var(--fg)',
        card: { DEFAULT: 'var(--surface)', foreground: 'var(--fg)' },
        popover: { DEFAULT: 'var(--bg-elev)', foreground: 'var(--fg)' },
        primary: { DEFAULT: 'var(--acc)', foreground: 'var(--bg)' },
        secondary: { DEFAULT: 'var(--surface-2)', foreground: 'var(--fg)' },
        muted: { DEFAULT: 'var(--surface-2)', foreground: 'var(--fg-muted)' },
        accent: { DEFAULT: 'var(--surface-hover)', foreground: 'var(--fg)' },
        destructive: { DEFAULT: 'var(--neg)', foreground: 'var(--bg)' },
        input: 'var(--border)',
        ring: 'var(--acc)'
      },
      borderRadius: {
        token: 'var(--radius)',
        'token-sm': 'var(--radius-sm)',
        'token-lg': 'var(--radius-lg)'
      },
      spacing: {
        card: 'var(--pad-card)'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
}
