// `/v2` leitet auf das Dashboard um.
//
// `[read]` Der Auftrag legt `module-dashboard.jsx` auf `/v2/dashboard`.
// Die Wurzel bleibt erreichbar, damit alte Verweise und die Anmeldung
// (`redirect=%2Fv2`) nicht ins Leere laufen.
import { redirect } from 'next/navigation'

export default function V2Wurzel() {
  redirect('/v2/dashboard')
}
