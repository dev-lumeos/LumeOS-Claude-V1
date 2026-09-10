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
    // ══ G-411/A4: die Anmeldung auf v2-Bausteinen ═══════════════
    //
    // **Tom, 2026-09-08:** *„und das login muss auf v2 normal
    // laufen. jetzt geht es den umweg ueber v1."*
    //
    // `[cmd]` **Vorher: Tailwind-Marken** (`rounded-token`,
    // `text-fg-muted`, `bg-bg-elev`, `bg-[var(--acc)]`) — **kein
    // einziger `v2-`-Baustein**, am Schirm gemessen: 0 gegen 8
    // Tailwind-Marken.
    //
    // `[cmd]` **Gemessen, was das Paket traegt:** `v2-card` (12
    // Regeln), `v2-btn` (15), `v2-btn-primary` (3), `v2-feld` (3).
    // `[read]` **`v2-input` gibt es NICHT** — das Feld heisst
    // `v2-feld`. **Der Auftrag nannte den falschen Namen; gebaut
    // ist der, den es gibt.**
    //
    // `[read]` **Die LOGIK bleibt unangetastet** — react-hook-form,
    // zod und `signUp` sind der Unterschied zu admin und coach, und
    // dieser Auftrag baut die Form um, nicht das Verhalten.
    <div className="v2-card v2-anmeldung">
      <h1 className="v2-card-title">Anmelden</h1>
      <p className="v2-dim v2-anmeldung-sub">
        Mit E-Mail und Passwort. Weitere Verfahren folgen.
      </p>

      <form className="v2-anmeldung-form" onSubmit={handleSubmit(signIn)} noValidate>
        <label className="v2-anmeldung-label">
          <span className="v2-eyebrow">E-Mail</span>
          <input
            {...register('email')}
            autoComplete="email"
            className="v2-feld"
            type="email"
          />
          {errors.email ? (
            <span className="v2-feldfehler">{errors.email.message}</span>
          ) : null}
        </label>

        <label className="v2-anmeldung-label">
          <span className="v2-eyebrow">Passwort</span>
          <input
            {...register('password')}
            autoComplete="current-password"
            className="v2-feld"
            type="password"
          />
          {errors.password ? (
            <span className="v2-feldfehler">{errors.password.message}</span>
          ) : null}
        </label>

        {serverError ? (
          <p role="alert" className="v2-feldfehler">{serverError}</p>
        ) : null}
        {notice ? <p className="v2-anmeldung-hinweis">{notice}</p> : null}

        <button
          className="v2-btn v2-btn-primary"
          disabled={pending !== null}
          type="submit"
        >
          {pending === 'signin' ? 'Wird angemeldet …' : 'Anmelden'}
        </button>
        <button
          className="v2-btn"
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
