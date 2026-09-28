/**
 * Was dasteht, waehrend Coach laedt — G-394.
 *
 * `[read]` Begruendung in `v2/supplements/loading.tsx`.
 *
 * `[cmd]` **Neun Reiter** (`ansicht.tsx`).
 */
export default function Laedt() {
  return (
    <div className="v2-skel-seite" aria-busy="true" aria-live="polite">
      <span className="v2-sr-only">Coach wird geladen</span>

      <div className="v2-skel v2-skel-hero" />

      <div className="v2-skel-reihe">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="v2-skel v2-skel-reiter" />
        ))}
      </div>

      <div className="v2-skel v2-skel-karte" />
      <div className="v2-skel v2-skel-karte v2-skel-karte-kurz" />
    </div>
  )
}
