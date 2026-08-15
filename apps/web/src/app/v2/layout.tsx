// Huelle der Oberflaeche v2 (G-01).
//
// PARALLEL, NICHT ERSATZ. [read] Tom, 2026-08-15: "Was ich nicht will
// ist die bestehende Variante loeschen, ich will die neue Variante
// parallel haben." Umgeschaltet wird in G-07, nicht hier.
//
// Diese Datei bringt nur das Stylesheet mit. Sidebar, Topbar und
// Kontextspalte sind G-02 — hier steht bewusst keine Komponente.
//
// Das Wurzel-Layout (app/layout.tsx) bleibt unangetastet: es setzt
// data-theme/data-mode und laedt die Tokens. Beide Oberflaechen teilen
// sich diese Tokens; v2 bringt nur eigene KLASSEN mit (Praefix v2-).
import '@lumeos/ui/styles.css'

// BEWUSST OHNE .v2-app: diese Klasse ist ein dreispaltiges Raster
// (240px / 1fr / 340px) und erwartet Sidebar und Kontextspalte. Solange
// die in G-02 nicht existieren, presste sie den Inhalt in die erste
// Spalte. Die Huelle bekommt sie, wenn es etwas zu halten gibt.
export default function V2Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="v2-root">{children}</div>
}
