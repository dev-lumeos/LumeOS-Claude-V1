import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import '@lumeos/ui/styles.css'
import './tokens.css'
import './portal.css'

// Schriften wie apps/web (G-18/G-56): beim Bauen geholt, vom eigenen
// Server ausgeliefert — keine fremde Abhaengigkeit im kritischen Pfad.
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--lumeos-inter',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--lumeos-mono',
})

export const metadata: Metadata = {
  title: 'LumeOS Coach',
  description: 'Coach-Portal — Arbeitsplatz der Trainerin',
}

// Modus vor dem ersten Paint aus prefers-color-scheme, wie apps/web.
const MODE_BOOTSTRAP = `(function(){try{var h=document.documentElement;if(!h.getAttribute('data-mode')){h.setAttribute('data-mode',window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');}}catch(e){}})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: data-mode setzt das Bootstrap-Skript vor
    // dem ersten Paint aus prefers-color-scheme — der Server kennt den
    // Wert nicht (kein Modus-Cookie in dieser App). Ohne die Angabe
    // meldet React in der Entwicklung je Seite einen Konsolenfehler
    // "Extra attributes from the server: data-mode".
    <html
      lang="de"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      data-theme="lume"
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: MODE_BOOTSTRAP }} />
        {children}
      </body>
    </html>
  )
}
