'use client'

// Anmeldung fuer apps/coach — Bauart wie apps/admin (zwei Felder, kein
// signUp): ein Coach-Zugang wird eingerichtet, nicht selbst beantragt.
// Fehlertexte nach Konvention §6: keine internen Ausnahmetexte.
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Route } from 'next'
import { createClient } from '../lib/browser-client'

export function CoachLoginForm({ redirect }: { redirect: string }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [passwort, setPasswort] = useState('')
  const [fehler, setFehler] = useState<string | null>(null)
  const [laeuft, setLaeuft] = useState(false)

  async function anmelden(e: React.FormEvent) {
    e.preventDefault()
    setFehler(null)
    setLaeuft(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: passwort,
      })
      if (error) {
        setFehler(
          error.message.includes('Invalid login credentials')
            ? 'E-Mail oder Passwort ist falsch.'
            : 'Anmeldung derzeit nicht moeglich.',
        )
        return
      }
      router.push(redirect as Route)
      router.refresh()
    } catch {
      setFehler('Anmeldung derzeit nicht moeglich.')
    } finally {
      setLaeuft(false)
    }
  }

  return (
    <main className="coach-login">
      <h1>LumeOS Coach Portal</h1>
      <form onSubmit={anmelden}>
        <label>
          E-Mail
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label>
          Passwort
          <input
            type="password"
            value={passwort}
            onChange={(e) => setPasswort(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {fehler ? <p role="alert" className="coach-login-fehler">{fehler}</p> : null}
        <button type="submit" disabled={laeuft}>
          {laeuft ? 'Anmelden…' : 'Anmelden'}
        </button>
      </form>
      <p className="coach-login-hinweis">
        Kein Konto anlegbar — der Coach-Zugang wird eingerichtet, nicht beantragt.
      </p>
    </main>
  )
}
