# C-253 — Codex, 2026-08-23

Bericht: `docs/berichte/c-253-codex.md`

**Der Fund stammt von Claude Code, ungefragt, aus C-252.** Er stand in
keiner Vorgabe.

---

## WAS ICH GEMESSEN HABE

`[cmd]` **Die IDs der beiden Kataloge sind nicht vergleichbar:**
`supplements.substance_catalog.id` ist `text`,
`supplements.supplements.id` ist `uuid`.

`[cmd]` **Drei Stellen haetten nach der Umstellung nie mehr
getroffen:** Stack-Anker, Add-Knopf, Detailkopf.

`[cmd]` **`slug` ist die alte ID** und bei allen 566 identisch —
darueber ist die Bruecke sauber. Ueber den Namen waeren **26
mehrdeutig** gewesen.

`[cmd]` **Live haengt heute nichts daran:** 0 von 11 `stack_items`
tragen einen Anker.

`[read]` **Genau deshalb ist es gefaehrlich.** Der Fehler waere erst in
Wochen aufgefallen — bei einem Nutzer, nicht bei einem Test. Keine
bestehende Pruefung findet ihn: es ist keine geloeschte Spalte, sondern
**zwei Spalten gleichen Zwecks mit unvergleichbarem Typ.**

`[read]` **A-50 steht seit Wochen im Register** — *„ein `DROP COLUMN`
prueft die Lesepfade nicht"* — und hat den Fall trotzdem nicht
verhindert. **Als Merksatz notiert, nicht als Pruefung gebaut.** Das
ist der eigentliche Auftrag.

## WAS ZU TUN IST

1. **Die drei Stellen belegen und schliessen.** Erst messen, welche es
   sind und ob sie heute schon falsch sind — dann korrigieren.

2. **Eine Gate-Pruefung bauen, die Anker- und Verweisfelder gegen den
   Typ der Zielspalte haelt.** Wo im Code ein Wert als Verweis auf eine
   Katalogzeile benutzt wird, muss der Typ zur Zielspalte passen.

   `[read]` **Zuschnitt ist deine Entscheidung** — die Pruefung muss
   diesen Fall finden und darf nicht bei jedem harmlosen String
   anschlagen. **Wenn du keinen Zuschnitt findest, der beides schafft:
   melden mit Begruendung, statt eine Pruefung zu bauen, die umgangen
   wird.** Eine dauerhaft rote Pruefung ist gefaehrlicher als keine.

3. Die Pruefung gehoert in `pnpm gate`, wie
   `schema-vollstaendigkeit-pruefen.ts` und
   `serverimport-pruefen.mjs`.

## WAS NICHT ZU TUN IST

`supplement_catalog` und `substance_catalog` **nicht loeschen.** Das
ist Schritt 5 und kommt erst, wenn C-253 und C-254 durch sind.

`apps/web/src/app/v2/nutrition` und `.../recovery` **nicht anfassen** —
andere Agenten.

`supabase/_pipeline/_testdaten/` **nicht anfassen** — dort arbeitet
Fable an G-175.

Nicht committen, nicht stagen, nicht pushen.
Nichts in `docs/todo/` oder `docs/ssot/` schreiben.

## NACHWEIS — Erwartung VOR dem Lauf, beide Richtungen

**Wie viele Stellen die Pruefung findet, bevor du sie korrigierst** —
Zahl hinschreiben. Erwartung nach der Korrektur: 0.

**Negativprobe:** eine absichtlich falsch typisierte Verweisstelle
einbauen; die Pruefung muss rot werden **und die richtige Stelle
nennen.** `[read]` Eine Pruefung, die beim Selbsttest die falsche
Ursache meldet, ist nicht belegt — das steht so im Kopf von
`tools/nummern-pruefen.mjs`.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.
Wegwerf-Datenbank zum Pruefen, danach verwerfen.
Pruefschleifen als Skript-Datei, nicht als Shell-Einzeiler mit `$(...)`.
Repo-Text mit Sonderzeichen nicht ueber die Standardeingabe einer
interaktiven Sitzung schreiben — das war am 2026-08-23 dein Weg und hat
das Gate fuer alle blockiert.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
