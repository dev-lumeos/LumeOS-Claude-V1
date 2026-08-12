import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LumeOS Admin',
  description: 'Betrieb — nur fuer Admins',
}

// BEWUSST OHNE THEMESYSTEM, mit Begruendung (Block 19):
//
// apps/web traegt das Themesystem seit Block 4 (contract.ts, registry.ts,
// lume.css) — aber verwoben mit AppShell, QueryProvider und dem
// Cookie-SSR-Bootstrap im dortigen layout.tsx. Es ist kein Paket, das man
// importiert, sondern App-Bestandteil.
//
// Drei Wege standen offen:
//   1. Kopieren  -> zwei Wahrheiten, die driften. Ausgeschlossen: genau
//      das sollte laut Auftrag nicht passieren.
//   2. Jetzt nach packages/ heben -> waere eine Abstraktion aus EINEM
//      zweiten Anwendungsfall heraus, dessen Bedarf noch niemand kennt.
//      apps/admin hat heute eine Seite und keine Farbwahl.
//   3. Vorerst ohne -> gewaehlt.
//
// Der Auftrag verbietet ausdruecklich neue Farben und Tokens. Diese Seite
// nutzt deshalb nur Systemschrift und die zwei Farben, die eine Absage
// braucht. Sobald apps/admin echte Oberflaeche bekommt (C-14), ist Weg 2
// zu gehen — dann liegt ein zweiter echter Anwendungsfall vor und die
// Schnittstelle laesst sich an zwei Nutzern statt an einem entwerfen.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body
        style={{
          margin: 0,
          fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
          lineHeight: 1.5,
        }}
      >
        {children}
      </body>
    </html>
  )
}
