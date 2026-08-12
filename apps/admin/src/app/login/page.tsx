import type { Metadata } from 'next'
import { safeRedirect } from '@lumeos/shared/auth/safe-redirect'
import { AdminLoginForm } from '../../components/admin-login-form'

export const metadata: Metadata = {
  title: 'Anmelden — LumeOS Admin',
}

/** Standardziel dieser App. apps/web nutzt /dashboard, admin die Startseite. */
const ADMIN_DEFAULT = '/'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string }
}) {
  // Nur interne Ziele — sonst waere ?redirect= ein offener Redirect.
  // Dieselbe Pruefung wie in apps/web, aus packages/shared: `//evil.com`
  // besteht ein blosses startsWith('/') und fuehrt auf einen fremden Host
  // ([cmd] belegt, D-04-Fund 2026-08-06).
  const redirect = safeRedirect(searchParams.redirect, ADMIN_DEFAULT)

  return <AdminLoginForm redirect={redirect} />
}
