import type { Metadata } from 'next'
import { safeRedirect } from '@lumeos/shared/auth/safe-redirect'
import { CoachLoginForm } from '../../components/coach-login-form'

export const metadata: Metadata = {
  title: 'Anmelden — LumeOS Coach',
}

const COACH_DEFAULT = '/'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string }
}) {
  const redirect = safeRedirect(searchParams.redirect, COACH_DEFAULT)
  return <CoachLoginForm redirect={redirect} />
}
