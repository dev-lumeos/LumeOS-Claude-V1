// ════════════════════════════════════════════════════════════════════
// DIESES MODAL IST ABGELOEST — G-480
// ════════════════════════════════════════════════════════════════════
//
// **Tom, 2026-09-08:** *„wo kann der tom das eingeben? auf diesem
// laecherlichen modal? wo nicht mal fuer nutrition passt? lass dieses
// modal besser bauen (fooddb suche like) und supplement mit
// einbinden"*
//
// ══ WARUM ES FALSCH WAR ═════════════════════════════════════════════
//
// `[cmd]` **`module-nutrition.jsx:557` listet die Filterpillen der
// Food-DB-Suche:**
//
//     ["All", "Favorites", "Recent", "Meat", "Fish", "Grains",
//      "Dairy", "Produce", "Beverages", "Supplements"]
//
// `[cmd]` **Und Zeile 581 zeigt die Quelle je Zeile:**
// `<Pill>{f.src}</Pill>`.
//
// `[read]` **Die Vorlage hat den EINEN Weg immer schon gezeigt.**
// `[cmd]` **G-475 und G-478 haben daneben ein zweites Modal gebaut** —
// Freitextfeld, keine Sortierung, keine Trefferzahl, keine Vorschau.
//
// `[read]` **Der Fehler war, die dritte Quelle zu ueberspringen**
// (E-83): `00-QUELLEN.md` nennt die Mockupdatei, sie wurde nicht
// gelesen.
//
// ══ WO ES JETZT STEHT ═══════════════════════════════════════════════
//
// `[cmd]` **`food-such-modal.tsx`** — dieselbe Suche, dieselbe
// Sortierleiste, dieselbe Tabelle, **plus die Filterpille
// `Supplemente` und die Quelle je Zeile.**
//
// `[read]` **Der Weg fuer einen Menschen:** Plus an einer Mahlzeit ->
// suchen -> Pille `Supplemente`.
//
// ══ WARUM DIE DATEI NOCH DASTEHT ════════════════════════════════════
//
// `[cmd]` **Sie hat keinen Aufrufer mehr** — `modale.tsx` verteilt
// nicht mehr darauf, der Knopf in `kopfknoepfe.tsx` ist weg, und der
// Typ `'supplement'` ist aus `NutritionModalTyp` entfernt.
//
// `[read]` **Das Loeschen gehoert Tom** — in `backup/` und bei
// entfernten Dateien entscheidet er. **Bis dahin traegt die Datei
// ihren Nachfolger im Kopf**, damit niemand sie fuer verloren haelt
// und ein drittes Modal baut.
//
// `[read]` **A-59: entfernt, nicht auskommentiert** — der Rumpf ist
// weg, nicht stillgelegt.

export {}
