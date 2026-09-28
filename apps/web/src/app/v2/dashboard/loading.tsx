/**
 * Was dasteht, waehrend das Dashboard laedt — G-394.
 *
 * `[read]` Begruendung in `v2/supplements/loading.tsx`.
 *
 * `[cmd]` **KEINE Reiterreihe** — gemessen 2026-09-28: das Dashboard
 * hat keine `Tabs` (`page.tsx`, `dashboard-echt.tsx`). `[read]`
 * **Deshalb steht hier auch keine** — ein Platzhalter, der eine
 * Reiterzeile zeigt, die danach verschwindet, laesst den Inhalt
 * springen. **Das waere schlimmer als gar keiner.**
 */
export default function Laedt() {
  return (
    <div className="v2-skel-seite" aria-busy="true" aria-live="polite">
      <span className="v2-sr-only">Dashboard wird geladen</span>

      <div className="v2-skel v2-skel-hero" />

      <div className="v2-skel v2-skel-karte" />
      <div className="v2-skel v2-skel-karte" />
      <div className="v2-skel v2-skel-karte v2-skel-karte-kurz" />
    </div>
  )
}
