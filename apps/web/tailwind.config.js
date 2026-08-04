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
        acc: 'var(--acc)'
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
  plugins: []
}
