'use client'

// Anmeldung fuer apps/admin.
//
// BEWUSST NICHT das Formular aus apps/web wiederverwendet, und das ist
// keine Doppelung, sondern ein Unterschied:
//   * apps/web kann sich REGISTRIEREN (signUp). Admin nicht — eine
//     Admin-Rolle vergibt 061 ueber app_metadata, sie ist nicht
//     selbst zu beantragen. Ein Registrierknopf hier waere irrefuehrend.
//   * Das web-Formular haengt an react-hook-form und zod. Fuer zwei
//     Feldern waeren das zwei Abhaengigkeiten ohne Gegenwert.
// Gemeinsam bleibt, was gemeinsam sein muss: der Supabase-Client aus
// packages/shared und die Redirect-Pruefung.
//
// Fehlertexte nach Konvention §6: keine internen Ausnahmetexte nach aussen.
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Route } from 'next'
import { createClient } from '@lumeos/shared'

const feld: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '0.5rem',
  marginTop: '0.25rem',
  font: 'inherit',
  boxSizing: 'border-box',
}

export function AdminLoginForm({ redirect }: { redirect: string }) {
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
    <main style={{ maxWidth: '22rem', margin: '4rem auto', padding: '0 1.5rem' }}>
      <h1 style={{ fontSize: '1.25rem', margin: '0 0 1rem' }}>LumeOS Admin</h1>
      <form onSubmit={anmelden}>
        <label style={{ display: 'block', marginBottom: '0.75rem' }}>
          E-Mail
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
            style={feld}
          />
        </label>
        <label style={{ display: 'block', marginBottom: '1rem' }}>
          Passwort
          <input
            type="password"
            value={passwort}
            onChange={(e) => setPasswort(e.target.value)}
            autoComplete="current-password"
            required
            style={feld}
          />
        </label>
        {fehler ? (
          <p role="alert" style={{ margin: '0 0 0.75rem', color: '#b00020' }}>
            {fehler}
          </p>
        ) : null}
        <button type="submit" disabled={laeuft} style={{ ...feld, cursor: 'pointer' }}>
          {laeuft ? 'Anmelden…' : 'Anmelden'}
        </button>
      </form>
      <p style={{ marginTop: '1rem', opacity: 0.7, fontSize: '0.875rem' }}>
        Kein Konto anlegbar — die Admin-Rolle wird vergeben, nicht beantragt.
      </p>
    </main>
  )
}
