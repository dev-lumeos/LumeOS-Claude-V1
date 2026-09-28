/**
 * Was dasteht, waehrend Training laedt — G-394.
 *
 * `[read]` Begruendung und Messung stehen in
 * `v2/supplements/loading.tsx` und `v2/goals/loading.tsx`: die Seite
 * laedt serverseitig, `loading.tsx` ist die Stelle, die Next.js
 * dafuer vorsieht.
 *
 * `[cmd]` **Zehn Reiter** (`ansicht.tsx`), derselbe Kopf.
 */
export default function Laedt() {
  return (
    <div className="v2-skel-seite" aria-busy="true" aria-live="polite">
      <span className="v2-sr-only">Training wird geladen</span>

      <div className="v2-skel v2-skel-hero" />

      <div className="v2-skel-reihe">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="v2-skel v2-skel-reiter" />
        ))}
      </div>

      <div className="v2-skel v2-skel-karte" />
      <div className="v2-skel v2-skel-karte v2-skel-karte-kurz" />
    </div>
  )
}
