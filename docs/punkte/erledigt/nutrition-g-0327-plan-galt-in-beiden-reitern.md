---
nr: G-327
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
agent: claudecode
beauftragt: 2026-09-02
erledigt: 2026-09-02
commit: 0dfa6788
braucht: []
kind_von: G-311
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/page.tsx
zahlen:
  gemessen: 2026-09-02
---

# G-327 — `?plan=` galt in beiden Reitern

## Befund

Tom, 2026-09-02: *,,wenn ich im planer einen anderen plan anwaehle
und anschaue wechselt der plan in meal plans."*

`[cmd]` **Gemessen auf `dev@lumeos.app`: mit `?plan=` zeigte Meal
plans den angewaehlten statt des aktiven** — **in vier Bereichen
gleichzeitig:**

    Kopfkarte        Tag 1 von 28   ->  Tag 2 von 7
    Plan settings    Days count 21  ->  Days count 7
    Lifecycle types  aktiv          ->  zugewiesen
    Bibliothek       ohne Aufbau-Wochenplan -> ohne Buddy

`[read]` **Die Ursache lag in G-311:** dort bekam der
Werkbank-Sprung `?plan=`, **und beide Reiter lasen denselben
Parameter.**

## Warum es zaehlt

`[read]` **Die beiden Reiter haben verschiedene Fragen:** der
Planner zeigt, **was gerade bearbeitet wird**; Meal plans zeigt,
**welcher Plan laeuft** — **und der wechselt nicht, solange man in
der Werkbank blaettert.**

`[read]` **Das ist E-40 in einer Zeile:** Werkbank gegen Bibliothek.

## Abnahme

**2026-09-02, Orchestrator.**

`[cmd]` **`?plan=` gilt jetzt nur im Planner.** `[cmd]`
**`ladePlan(null)` nimmt `liste[0]` aus einer nach `is_active DESC`
sortierten Abfrage** — also den aktiven.

`[read]` **Kein zweiter Leseweg, nur ein anderes Argument.**

`[cmd]` **Und die Bibliothek folgt mit:** sie laesst den Plan aus,
der oben steht (`aktivId`) — **deshalb verschwand dort der
falsche.**

`[read]` **Ein Befund, den Tom gefunden hat und der Agent ohne
Auftrag behoben hat.** **Der Punkt wurde nachgetragen.**
