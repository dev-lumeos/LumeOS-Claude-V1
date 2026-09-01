---
nr: C-373
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-31
braucht: []
kind_von: G-304
entscheidung: E-42
agent: claudecode
beauftragt: 2026-08-31
erledigt: 2026-09-01
commit: aae75918
beruehrt:
  tabellen: [nutrition.meal_plans]
zahlen:
  gemessen: 2026-08-31
  rollover_count: 0
---

# C-373 — der Lebenszyklus wird gespeichert und nie ausgefuehrt

## Befund

Aus G-304, Claude Code, 2026-08-31.

`[cmd]` **Die Lebenszykluswahl aus G-290 wird gespeichert.** `[cmd]`
**Ausgefuehrt wird sie nie: keine Funktion, kein Zeitplaner,
`rollover_count` steht auf 0.**

`[cmd]` **Und ein abgelaufener Plan kann nicht beendet werden** —
**kein Knopf setzt `completed`, `paused` oder `archived`.**

`[read]` **Damit laufen Flow 11–13 gar nicht.**

## Die Frage dahinter ist dieselbe wie in C-358

`[cmd]` **Bei den Coach-Aktionen war es genauso:** `expired` im CHECK
erlaubt, live 0 Zeilen, kein Schreiber.

`[read]` **Dort wurde entschieden: beim Anzeigevermerk bleiben** —
weil es keinen autoritativen Schreiber gibt.

`[read]` **Hier ist es anders:** `[cmd]` **`rollover` und `sequence`
sind Versprechen** — *,,startet automatisch neu"*, *,,geht in einen
Folgeplan ueber"*. `[read]` **Ein Versprechen ohne Ausfuehrung ist
schlimmer als ein Vermerk.**

`[read]` **Also entweder ein Schreiber, oder die zwei Zyklen werden
nicht angeboten, bis es einen gibt.**

## Auftrag

**Mitbeauftragt mit G-306 am 2026-08-31.** Bericht dort.

`[read]` **C-377 loest es: die Meldung beim Ablauf ist die
Ausfuehrung.** **Kein Zeitplaner noetig.**

## Ergebnis

**Gebaut in G-306, 2026-09-01. Roher Bericht dort.**

`[cmd]` **Der Lebenszyklus bestimmt den VORSCHLAG, nicht die
Handlung** -- `vorschlagFuer()` in `plan-werkbank.ts`:

    rollover   -> "Denselben Plan neu starten"
    sequence   -> "Einen anderen Plan aktivieren"  (der Folgeplan)
    once       -> "Einen anderen Plan aktivieren"  (die Bibliothek)
    NULL       -> kein Vorschlag, alle drei gleichwertig

`[cmd]` **Kein Zeitplaner gebaut.** In G-304 gemessen: kein `pg_cron`,
keine Lebenszyklus-Funktion. **Die Meldung IST die Ausfuehrung.**

`[cmd]` **Weg 1 im Browser gegangen, 2026-09-01:** `rollover_count`
0 -> 1, die Wochen wanderten vom Juli auf 01.--07.09.

`[read]` **Offen bleibt:** `once` und `sequence` teilen sich einen
Knopf, weil `meal_plans` keine Spalte fuer den Folgeplan hat
(gemessen 2026-09-01). **Soll spaeter eine Kette entstehen, gehoert
der Folgeplan benannt.**

## Abnahme

**2026-09-01, mit G-306 abgenommen: geloest.**

`[read]` **Die Meldung beim Ablauf ist die Ausfuehrung** — kein
Zeitplaner noetig.

`[cmd]` **`rollover` gegangen: der Vorschlag lautet *neu starten*,
`rollover_count` 0 auf 1, Wochen vom Juli auf 01.–07.09.**

`[cmd]` **Und ein Nebenbefund im Browser gefunden:** nach dem
Abschliessen stand der Plan auf `completed` **und die Ablauffrage
blieb stehen** — die Anzeige rechnete nur die Laufzeit, nicht den
Zustand. **Behoben.**

`[read]` **Was bleibt: `once` und `sequence` teilen einen Knopf**,
weil `meal_plans` keine Folgeplan-Spalte hat. **Als C-379.**
