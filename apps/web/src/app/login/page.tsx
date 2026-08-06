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
