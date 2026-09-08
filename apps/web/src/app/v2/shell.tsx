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
import { usePathname, useSearchParams } from 'next/navigation'
import { createClient } from '@lumeos/shared'
import { AppShell } from '@lumeos/ui'
import { Sprachwahl } from '../../components/shell/sprachwahl'
import { MODE_COOKIE } from '../../styles/themes/registry'

// ══ G-17: das Datum reist mit ══════════════════════════
//
// `[cmd]` **Gemessen 2026-09-08:** im Tagebuch auf gestern
// geblaettert (`?tab=diary&datum=2026-09-07`), aufs Dashboard
// gewechselt — **kein Parameter, kein Datum.** Zurueck ins
// Tagebuch: **wieder heute.**
//
// `[read]` **Kein Cookie, kein Browser-Kontext** — der Punkt hat
// beides geprueft und verworfen: Serverkomponenten je Route wuessten
// von einem Browser-Zustand nichts, und *,,ein Datum, das sich ueber
// Tage merkt, ist eines, das man vergisst."*
//
// `[read]` **Der Suchparameter ist der Weg**, und `V2Link` ist die
// EINE Stelle, durch die jeder Modul-Link der Huelle laeuft — die
// Liste selbst steht in `@lumeos/ui` und gehoert allen Anwendungen.

/** Nur ein Datum in der Form `2026-09-07` reist mit. */
function sauberesDatum(v: string | null): string | null {
  return v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null
}

/**
 * Haengt das aktuelle Datum an einen Modul-Link.
 *
 * `[read]` **Nur an Links OHNE eigenes `datum=`** — wer schon eines
 * mitbringt, meint es auch. **Und nur an interne `/v2/`-Ziele**, ein
 * Datum an `https://coach.lumeos.app` waere sinnlos.
 */
function mitDatum(href: string, datum: string | null): string {
  if (!datum) return href
  if (!href.startsWith('/v2/')) return href
  if (href.includes('datum=')) return href
  return href + (href.includes('?') ? '&' : '?') + `datum=${datum}`
}

// next/link ist in dieser App typisiert (typedRoutes). Die Huelle im
// Paket kennt diese Typen nicht und reicht href als string. Der Cast
// sitzt hier an EINER Stelle statt in jedem Navigationseintrag.
function V2Link({ href, ...rest }: { href: string } & Record<string, unknown>) {
  const params = useSearchParams()
  const datum = sauberesDatum(params.get('datum'))
  return <Link href={mitDatum(href, datum) as Route} {...rest} />
}

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
