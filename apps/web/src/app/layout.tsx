import type { Metadata } from 'next'
import { cookies } from 'next/headers'
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

  return (
    <html lang={sprache} data-theme={theme} data-mode={mode}>
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
