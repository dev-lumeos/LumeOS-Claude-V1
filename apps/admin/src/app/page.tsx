// Die einzige Seite von apps/admin (Block 19).
//
// Zweck: zeigen, dass Anmeldung und Admin-Pruefung wirken. KEINE Kuration
// (das ist C-14), keine weiteren Seiten, keine neuen Farben.
//
// DIE REIHENFOLGE IST DER PUNKT — C.3-Befund, 2026-08-06:
// `[cmd]` Seit 061 FILTERT die RLS, statt zu sperren. Wer erst Daten laedt
// und dann prueft, zeigt einem Nicht-Admin eine LEERE LISTE statt einer
// Absage. Er haelt das Werkzeug fuer kaputt, nicht fuer gesperrt, und
// niemand erfaehrt vom Zugriffsversuch.
// Deshalb: erst isCurrentUserAdmin(), dann — und nur dann — Datenzugriff.
// Diese Seite laedt bewusst gar keine Daten; die Reihenfolge steht hier
// trotzdem, weil sie die Vorlage fuer jede weitere Admin-Seite ist.
//
// Die Pruefung ist die ANZEIGE-Seite. Die Durchsetzung liegt in der
// Datenbank (public.is_admin() + RLS aus 061) — beide lesen denselben
// Claim, damit Anzeige und Wirkung nicht auseinanderlaufen.
// Konvention §12.5.
import { isCurrentUserAdmin } from '@lumeos/shared/auth'

// Immer frisch: eine Rollenpruefung darf nicht aus dem Cache kommen.
export const dynamic = 'force-dynamic'

export default async function AdminHome() {
  const istAdmin = await isCurrentUserAdmin()

  if (!istAdmin) {
    return (
      <main style={{ maxWidth: '34rem', margin: '4rem auto', padding: '0 1.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem' }}>Kein Zugang</h1>
        <p style={{ margin: '0 0 1rem' }}>
          Dieser Bereich ist Administratoren vorbehalten. Dein Konto hat
          diese Berechtigung nicht.
        </p>
        <p style={{ margin: 0, opacity: 0.7, fontSize: '0.875rem' }}>
          Das ist eine Absage, keine leere Liste — falls du hier etwas
          erwartet hast, fehlt dir die Rolle, nicht die Daten.
        </p>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: '34rem', margin: '4rem auto', padding: '0 1.5rem' }}>
      <h1 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem' }}>LumeOS Admin</h1>
      <p style={{ margin: '0 0 1rem' }}>
        Angemeldet und als Administrator erkannt.
      </p>
      <p style={{ margin: 0, opacity: 0.7, fontSize: '0.875rem' }}>
        Diese App ist ein Geruest. Die Kuration zieht mit C-14 hierher um;
        heute liegt sie noch uebergangsweise in <code>apps/web</code>.
      </p>
    </main>
  )
}
