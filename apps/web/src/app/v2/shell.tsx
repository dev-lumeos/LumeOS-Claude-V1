'use client'

// Verbindet die Huelle aus @lumeos/ui mit dieser Anwendung.
//
// Was hier steht und nicht im Paket: alles, was next-spezifisch ist
// (usePathname, next/link) oder zur Anwendung gehoert (Modus-Cookie,
// angemeldete Person). packages/ui bleibt dadurch ohne
// Framework-Abhaengigkeit — dasselbe Muster wie @lumeos/shared.
import * as React from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import { usePathname } from 'next/navigation'
import { createClient } from '@lumeos/shared'
import { AppShell } from '@lumeos/ui'
import { Sprachwahl } from '../../components/shell/sprachwahl'
import { MODE_COOKIE } from '../../styles/themes/registry'

// next/link ist in dieser App typisiert (typedRoutes). Die Huelle im
// Paket kennt diese Typen nicht und reicht href als string. Der Cast
// sitzt hier an EINER Stelle statt in jedem Navigationseintrag.
const V2Link = ({ href, ...rest }: { href: string } & Record<string, unknown>) => (
  <Link href={href as Route} {...rest} />
)

export function V2Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mode, setMode] = React.useState<'light' | 'dark'>('dark')

  // Denselben Weg wie die bestehende Oberflaeche benutzen, nicht einen
  // zweiten daneben: das Attribut am <html> ist die Wahrheit, das
  // Cookie macht sie dauerhaft (siehe components/shell/theme-switcher).
  React.useEffect(() => {
    const attr = document.documentElement.getAttribute('data-mode')
    if (attr === 'light' || attr === 'dark') setMode(attr)
  }, [])

  const wechsleModus = React.useCallback((next: 'light' | 'dark') => {
    document.documentElement.setAttribute('data-mode', next)
    document.cookie = `${MODE_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`
    setMode(next)
  }, [])

  // Die angemeldete Person kommt aus der GETEILTEN Datenschicht
  // (@lumeos/shared), nicht aus einem zweiten Klienten. In der Vorlage
  // steht an dieser Stelle fest "Tom Müller · athlete · pro" — das ist
  // Vorfuehrmaterial und wird nicht uebernommen.
  const [email, setEmail] = React.useState<string>('')
  React.useEffect(() => {
    let aktiv = true
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (aktiv) setEmail(data.user?.email ?? '')
    })
    return () => { aktiv = false }
  }, [])

  return (
    <AppShell
      pathname={pathname}
      linkAs={V2Link}
      version="v0.9.4"
      userName={email}
      userStatus={email ? 'angemeldet' : undefined}
      mode={mode}
      onModeChange={wechsleModus}
      // A-14: die Sprachwahl sitzt neben Nachtmodus und Kontext.
      topbarActions={<Sprachwahl />}
      // Die Kontextspalte zeigt hier bewusst KEINE echten Inhalte:
      // Schnellaktionen und Erkenntnisse sind Moduldaten (G-03/G-06),
      // Buddys Text braeuchte einen Modellaufruf. Was die Vorlage dort
      // zeigt, ist erfundenes Vorfuehrmaterial.
      //
      // Statt einer leeren 340px-Spalte steht dort, was sie halten wird
      // — eine leere Flaeche saehe aus wie ein Fehler, und ein
      // erfundener Buddy-Text saehe aus wie eine Funktion.
      context={{
        buddyMessage: (
          <>
            Buddy ist in G-02 eine Attrappe. Die Flaeche steht, der
            Modellaufruf fehlt bewusst — er kostet je Seitenaufruf.
          </>
        ),
        details: [
          { label: 'Schnellaktionen', value: 'G-03' },
          { label: 'Erkenntnisse', value: 'G-03 / G-06' },
          { label: 'Moduldetails', value: 'je Modul' },
        ],
      }}
    >
      {children}
    </AppShell>
  )
}
