import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import './globals.css'
import '../lib/dates'
import { AppShell } from '../components/shell/app-shell'
import { QueryProvider } from '../components/providers/query-provider'
import {
  DEFAULT_THEME_ID,
  MODE_COOKIE,
  THEME_COOKIE,
  isThemeId,
  isThemeMode,
} from '../styles/themes/registry'
import { SPRACH_COOKIE, STANDARD_SPRACHE, istSprache } from '../i18n/sprachen'

/**
 * G-18: Inter, die Schrift der Vorlage.
 *
 * `[cmd]` `next/font/google` laedt sie BEIM BAUEN herunter und legt sie
 * neben die eigenen Dateien. Zur Laufzeit geht keine Anfrage an
 * `fonts.googleapis.com` — im Netzwerkprotokoll belegt.
 *
 * `[read]` G-01 hatte den `@import` der Vorlage bewusst weggelassen
 * („keine fremde Abhaengigkeit im kritischen Pfad"). Die Begruendung
 * bleibt richtig; dieser Weg erfuellt sie und liefert die Schrift
 * trotzdem.
 *
 * `display: 'swap'` wie in der Vorlage (`&display=swap`): der Text
 * steht sofort da und wird ersetzt, sobald die Schrift geladen ist —
 * statt fuer einen Moment unsichtbar zu bleiben.
 *
 * Die Gewichte sind die der Vorlage: 400, 500, 600, 700.
 */
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--lumeos-inter',
})

export const metadata: Metadata = {
  title: 'LumeOS',
  description: 'Health & Performance Operating System'
}

// Setzt den Modus vor dem ersten Paint, wenn KEIN Cookie existiert:
// prefers-color-scheme als Startwert; die explizite Wahl (Cookie ->
// serverseitig gerendertes data-mode) gewinnt, dann tut das Skript nichts.
const MODE_BOOTSTRAP = `(function(){try{var h=document.documentElement;if(!h.getAttribute('data-mode')){h.setAttribute('data-mode',window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');}}catch(e){}})();`

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  // Cookie statt localStorage: der Server kennt den Wert beim ersten
  // Rendern und schreibt data-theme/data-mode direkt ins HTML — kein
  // Aufblitzen (Begruendung auch in styles/themes/registry.ts).
  const store = cookies()
  const themeCookie = store.get(THEME_COOKIE)?.value
  const modeCookie = store.get(MODE_COOKIE)?.value
  const theme = isThemeId(themeCookie) ? themeCookie : DEFAULT_THEME_ID
  const mode = isThemeMode(modeCookie) ? modeCookie : undefined

  // A-14: dieselbe Herkunft wie Theme und Modus — ein Cookie, das der
  // Server beim ersten Rendern schon kennt. `lang` folgt der Wahl:
  // davon haengen Datumsfelder, Silbentrennung und Vorlesehilfen ab.
  const sprache = istSprache(store.get(SPRACH_COOKIE)?.value)
    ? (store.get(SPRACH_COOKIE)!.value as string)
    : STANDARD_SPRACHE
  const nachrichten = await getMessages()

  // G-18: `inter.variable` setzt `--lumeos-inter` auf den Namen der
  // geladenen Schriftfamilie. `lume.css` reicht sie an `--font-sans`
  // weiter — die Tokens bleiben an einer Stelle, `v2.css` muss nichts
  // wissen.
  return (
    <html lang={sprache} className={inter.variable} data-theme={theme} data-mode={mode}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: MODE_BOOTSTRAP }} />
        <NextIntlClientProvider messages={nachrichten} locale={sprache}>
          <QueryProvider>
            <AppShell>{children}</AppShell>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
