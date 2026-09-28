/**
 * Was dasteht, waehrend die Einstellungen laden — G-394.
 *
 * `[read]` Begruendung in `v2/supplements/loading.tsx`.
 *
 * `[cmd]` **KEINE Reiterreihe** — gemessen 2026-09-28: Settings hat
 * keine `Tabs`, sondern ein Formular und die Allergienkachel
 * (`formular.tsx`, `allergien-kachel.tsx`). `[read]` **Der
 * Platzhalter zeigt deshalb Formularbloecke, keine Reiter.**
 */
export default function Laedt() {
  return (
    <div className="v2-skel-seite" aria-busy="true" aria-live="polite">
      <span className="v2-sr-only">Einstellungen werden geladen</span>

      <div className="v2-skel v2-skel-hero" />

      <div className="v2-skel v2-skel-karte" />
      <div className="v2-skel v2-skel-karte v2-skel-karte-kurz" />
    </div>
  )
}
