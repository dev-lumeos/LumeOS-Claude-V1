// Huelle der Oberflaeche v2 (G-01, Shell in G-02).
//
// PARALLEL, NICHT ERSATZ. [read] Tom, 2026-08-15: "Was ich nicht will
// ist die bestehende Variante loeschen, ich will die neue Variante
// parallel haben." Umgeschaltet wird in G-07, nicht hier.
//
// Das Wurzel-Layout (app/layout.tsx) bleibt unangetastet: es setzt
// data-theme/data-mode und laedt die Tokens. Beide Oberflaechen teilen
// sich diese Tokens; v2 bringt nur eigene KLASSEN mit (Praefix v2-).
import '@lumeos/ui/styles.css'
import { V2Shell } from './shell'

export default function V2Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <V2Shell>{children}</V2Shell>
}
