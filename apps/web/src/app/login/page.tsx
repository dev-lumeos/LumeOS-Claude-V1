import type { Metadata } from 'next'
import { LoginForm } from '../../components/auth/login-form'

export const metadata: Metadata = {
  title: 'Anmelden — LumeOS',
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string }
}) {
  // Nur interne Ziele — sonst wäre ?redirect= ein offener Redirect.
  const raw = searchParams.redirect
  const redirect = raw && raw.startsWith('/') ? raw : '/dashboard'

  return <LoginForm redirect={redirect} />
}
