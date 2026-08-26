/**
 * Was dasteht, waehrend die Seite laedt.
 *
 * ══ DER BEFUND ═════════════════════════════════════════════════════
 *
 * `[cmd]` **Gemessen 2026-08-25:** die Seite braucht **1,9–2,9 s** bis
 * `networkidle` (`schuss.mjs`, zwei Laeufe, beide Konten). In dieser
 * Zeit gab es **keinen einzigen Ladezustand im Produkt** — 0
 * Skeletons, 0 Spinner, und **keine einzige `loading.tsx`** im ganzen
 * Projekt.
 *
 * `[read]` **Ein Skeleton IN der Komponente haette hier nichts
 * genuetzt.** `page.tsx` laedt serverseitig; die Seite wird erst
 * ausgeliefert, wenn alle Abfragen durch sind. Der Nutzer sieht
 * solange die *alte* Seite und einen wartenden Browser — es sieht aus,
 * als haette der Klick nicht gewirkt.
 *
 * **`loading.tsx` ist die Stelle, die Next.js dafuer vorsieht:** sie
 * erscheint sofort beim Klick, ohne auf Daten zu warten.
 *
 * ══ WARUM ES DEM ECHTEN AUFBAU FOLGT ══════════════════════════════
 *
 * `[read]` **Ein Skeleton, das anders aussieht als das Ergebnis, ist
 * schlimmer als keines** — der Inhalt springt beim Eintreffen. Die
 * Kaesten hier tragen dieselben Klassen und Hoehen wie der Kopfbereich
 * und die erste Kachelreihe.
 *
 * **Kein Schimmern.** Eine dauernd laufende Animation kostet Bilder,
 * und bei zwei Sekunden ist sie eher Unruhe als Information. Die
 * Flaechen stehen still.
 */
export default function Laedt() {
  return (
    <div className="v2-skel-seite" aria-busy="true" aria-live="polite">
      {/* Fuer Screenreader: die Flaechen selbst sagen nichts. */}
      <span className="v2-sr-only">Supplements werden geladen</span>

      <div className="v2-skel v2-skel-hero" />

      <div className="v2-skel-reihe">
        <div className="v2-skel v2-skel-reiter" />
        <div className="v2-skel v2-skel-reiter" />
        <div className="v2-skel v2-skel-reiter" />
        <div className="v2-skel v2-skel-reiter" />
      </div>

      <div className="v2-skel v2-skel-karte" />
      <div className="v2-skel v2-skel-karte v2-skel-karte-kurz" />
    </div>
  )
}
