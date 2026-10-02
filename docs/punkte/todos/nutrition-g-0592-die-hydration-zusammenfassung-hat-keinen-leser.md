---
nr: G-592
typ: fehler
modul: nutrition
schwere: mittel
angelegt: 2026-10-02

braucht: [G-588]
kind_von: G-588

quellen:
  - docs/punkte/todos/quer-g-0588-sechs-serveraktionen-ohne-aufrufer.md
  - docs/punkte/erledigt/quer-g-0585-die-inventur-der-ausfuhren-ohne-aufrufer.md

beruehrt:
  tabellen: []
  dateien:
    - apps/web/src/lib/nutrition/water-write.ts
---

# Die Hydration-Zusammenfassung hat keinen Leser

## Der Befund

`[cmd]` **Aus G-585, von Tom unter G-588 entschieden.** Die sechste der
sechs, gemessen 2026-10-02:

    apps/web/src/lib/nutrition/water-write.ts:131
        getHydrationSummary(...) liest nutrition.hydration_summary
        ueber requireSession(), Spalten aus SUMMARY_COLUMNS

`[read]` **Berichtigung zu G-588:** der Punkt nennt alle sechs
„Serveraktionen". **Diese ist keine** — sie ist eine Leseabfrage, die in
einem Schreibmodul liegt. **Das aendert den Auftrag:** hier fehlt keine
Schreibnaht, hier fehlt eine Anzeige.

## Die Zusage, die im Code schon steht

`[cmd]` **Der Dateikopf sagt die Fachregel selbst** (`:127-129`):

    Gesamt-Hydration eines Tages: getrunkenes Wasser plus Wasser aus
    Nahrung. Kein Eintrag heisst nicht „0 getrunken", sondern „nichts
    erfasst" - deshalb ein leerer Tag mit `null`, nicht mit Nullen.

`[read]` **Das ist die Anforderung an die Oberflaeche, nicht nur an die
Abfrage:** ein Tag ohne Eintrag darf nicht als „0 ml" erscheinen.
**Wer hier eine Kachel baut, die `null` als 0 zeichnet, hat die eine
Regel verfehlt, die diese Funktion ueberhaupt traegt.**

## Vor dem Auftrag zu messen

`[cmd]` **Ist `nutrition.hydration_summary` eine Sicht oder eine
Tabelle, und liegt sie live?** Die Funktion existiert — daraus folgt
nicht, dass ihre Quelle existiert. `[cmd]` **Und wo ist der Ort:** liest
heute irgendeine Nutrition-Kachel Wasser, und wenn ja, woher? **Zwei
Lesewege auf dieselbe Tatsache sind der Fehler aus G-544.**

**Nicht Teil:** die drei Recovery-Aktionen (G-590), die zwei
Goals-Aktionen (G-591).
