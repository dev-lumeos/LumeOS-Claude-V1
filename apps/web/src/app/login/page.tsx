// ══ G-411/A4: die Anmeldung traegt die v2-Bausteine ════════════════
//
// `[cmd]` **`@lumeos/ui/styles.css` wird bisher NUR in
// `app/v2/layout.tsx` geladen** — und `/login` liegt ausserhalb von
// `/v2/`. `[cmd]` **Am Schirm gemessen: die Klassen standen da, die
// Regeln fehlten** — kein Kasten, Felder als nackte Rahmen.
//
// `[read]` **Nicht ins Wurzel-Layout geholt** — dort wuerde v2 auf
// JEDE v1-Seite wirken, und `app/v2/layout.tsx` sagt ausdruecklich:
// *„Das Wurzel-Layout bleibt unangetastet … v2 bringt nur eigene
// KLASSEN mit."* `[read]` **Also hier, wo die Seite es braucht.**
import '@lumeos/ui/styles.css'
import type { Metadata } from 'next'
import { LoginForm } from '../../components/auth/login-form'
import { safeRedirect } from '../../lib/auth/safe-redirect'

export const metadata: Metadata = {
  title: 'Anmelden — LumeOS',
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string }
}) {
  // Nur interne Ziele — sonst wäre ?redirect= ein offener Redirect.
  // Die Prüfung stand hier und in auth/callback zweimal inline als
  // `raw.startsWith('/')` und liess `//evil.com` durch ([cmd] belegt,
  // D-04-Fund 2026-08-06). Jetzt eine Stelle, mit Tests.
  const redirect = safeRedirect(searchParams.redirect)

  return <LoginForm redirect={redirect} />
}
