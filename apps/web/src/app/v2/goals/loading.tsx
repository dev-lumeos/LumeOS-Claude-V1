/**
 * Was dasteht, waehrend Goals laedt — G-394.
 *
 * `[cmd]` **Gemessen 2026-09-28:** von neun Modulen hatte nur
 * `supplements` eine `loading.tsx`. **In den 1,2 bis 3,4 s bis
 * `networkidle` sieht der Nutzer die ALTE Seite und einen wartenden
 * Browser** — es sieht aus, als haette der Klick nicht gewirkt.
 *
 * `[read]` **Ein Skeleton IN der Komponente hilft hier nicht:**
 * `page.tsx` laedt serverseitig, die Seite wird erst ausgeliefert,
 * wenn alle Abfragen durch sind. **`loading.tsx` erscheint sofort
 * beim Klick.**
 *
 * `[read]` **Die Form folgt dem echten Aufbau** — Kopf, zehn Reiter
 * (`ansicht.tsx:113-125`), dann Kacheln. **Ein Platzhalter, der
 * anders aussieht als das Ergebnis, laesst den Inhalt springen.**
 */
export default function Laedt() {
  return (
    <div className="v2-skel-seite" aria-busy="true" aria-live="polite">
      <span className="v2-sr-only">Goals werden geladen</span>

      <div className="v2-skel v2-skel-hero" />

      {/* [cmd] Zehn Reiter: Goals · Phase engine · Adaptive TDEE ·
          Cross-module · Timeline · Body metrics · Measurements ·
          Composition · Physique ratios · Pose sessions */}
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
