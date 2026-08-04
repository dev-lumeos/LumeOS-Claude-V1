'use client'

// Anmelde-/Registrierformular (M3 Login). Nur E-Mail + Passwort —
// Apple, Google, Passkey kommen später (Spez. login §6).
// Fehlertexte nach Konvention §6: keine internen Ausnahmetexte nach aussen.
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Route } from 'next'
import { useForm } from 'react-hook-form'
import { createClient } from '@lumeos/shared'
import { loginSchema, type LoginValues } from '../../lib/schemas/login'
import { zodResolver } from '../../lib/schemas/resolver'

export function LoginForm({ redirect }: { redirect: string }) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [pending, setPending] = useState<'signin' | 'signup' | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  function finishLogin() {
    router.push(redirect as Route)
    router.refresh()
  }

  async function signIn(values: LoginValues) {
    setServerError(null)
    setNotice(null)
    setPending('signin')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })
      if (error) {
        setServerError(
          error.message.includes('Invalid login credentials')
            ? 'E-Mail oder Passwort ist falsch.'
            : 'Anmeldung derzeit nicht möglich.',
        )
        return
      }
      finishLogin()
    } catch {
      setServerError('Anmeldung derzeit nicht möglich.')
    } finally {
      setPending(null)
    }
  }

  async function signUp(values: LoginValues) {
    setServerError(null)
    setNotice(null)
    setPending('signup')
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
        },
      })
      if (error) {
        setServerError(
          error.message.includes('already registered')
            ? 'Für diese E-Mail existiert bereits ein Konto.'
            : 'Registrierung derzeit nicht möglich.',
        )
        return
      }
      if (data.session) {
        finishLogin()
        return
      }
      setNotice('Bestätigungs-E-Mail gesendet — bitte den Link darin öffnen.')
    } catch {
      setServerError('Registrierung derzeit nicht möglich.')
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="mx-auto mt-16 w-full max-w-sm rounded-token-lg border border-border bg-surface p-card">
      <h1 className="text-[16px] font-semibold text-fg">Anmelden</h1>
      <p className="mt-1 text-[12px] text-fg-muted">
        Mit E-Mail und Passwort. Weitere Verfahren folgen.
      </p>

      <form className="mt-4 grid gap-3" onSubmit={handleSubmit(signIn)} noValidate>
        <label className="grid gap-1">
          <span className="text-[12px] text-fg-muted">E-Mail</span>
          <input
            {...register('email')}
            autoComplete="email"
            className="rounded-token border border-border bg-bg-elev px-3 py-2 text-[13px] text-fg"
            type="email"
          />
          {errors.email ? (
            <span className="text-[12px] text-neg">{errors.email.message}</span>
          ) : null}
        </label>

        <label className="grid gap-1">
          <span className="text-[12px] text-fg-muted">Passwort</span>
          <input
            {...register('password')}
            autoComplete="current-password"
            className="rounded-token border border-border bg-bg-elev px-3 py-2 text-[13px] text-fg"
            type="password"
          />
          {errors.password ? (
            <span className="text-[12px] text-neg">{errors.password.message}</span>
          ) : null}
        </label>

        {serverError ? <p className="text-[12px] text-neg">{serverError}</p> : null}
        {notice ? <p className="text-[12px] text-pos">{notice}</p> : null}

        <button
          className="rounded-token bg-[var(--acc)] px-3 py-2 text-[13px] font-medium text-[var(--bg)] disabled:opacity-60"
          disabled={pending !== null}
          type="submit"
        >
          {pending === 'signin' ? 'Wird angemeldet …' : 'Anmelden'}
        </button>
        <button
          className="rounded-token border border-border px-3 py-2 text-[13px] text-fg disabled:opacity-60"
          disabled={pending !== null}
          onClick={handleSubmit(signUp)}
          type="button"
        >
          {pending === 'signup' ? 'Wird angelegt …' : 'Konto anlegen'}
        </button>
      </form>
    </div>
  )
}
