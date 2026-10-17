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
// G-376: der Modulkopf mit drei Spalten — Titel links, Wechsler
// mittig, Aktionen rechts. Die Regeln greifen nur, wo ein Modul
// den Platz stellt (`data-tageswechsler`).
import './kopf.css'
import { V2Shell } from './shell'
import { ladeKontextOffen } from './kontextleiste'

export default async function V2Layout({
  children,
}: {
  children: React.ReactNode
}) {
  // G-657: serverseitig gelesen, damit die Leiste nicht erst nach dem
  // ersten Anstrich auf- oder zuspringt.
  return <V2Shell kontextOffen={await ladeKontextOffen()}>{children}</V2Shell>
}
