---
nr: C-415
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: C-414
entscheidung: null
agent: codex
beauftragt: 2026-09-07
beruehrt:
  tabellen: [nutrition.food_tags]
zahlen:
  gemessen: 2026-09-07
  schritt: 75
---

# C-415 — der Vollkettenlauf scheitert in Schritt 075

## Befund

Aus C-414, Codex, 2026-09-07, als Hinweis gemeldet.

`[cmd]` **Der Vollkettenlauf scheitert vor Schritt 412 in Schritt
075** — **`food_tags_effective` fehlt dort.**

`[read]` **Das ist die Gegenrichtung von C-410:** `[cmd]` **dort
ueberschrieb Schritt 075 eine spaetere Aenderung.** `[read]` **Jetzt
verlangt 075 etwas, das erst spaeter entsteht.**

`[cmd]` **`food_tags_effective` kommt aus C-366** — **die Sicht ueber
`food_tags` und `food_tags_kuriert`.**

## Warum es zaehlt

`[read]` **Der Zustand entsteht aus der Kette.** `[read]` **Eine
Kette, die nicht durchlaeuft, kann den Zustand nicht erzeugen** —
**nur der Bestand, der zufaellig da ist, traegt weiter.**

`[cmd]` **Codex hat die Sicht separat auf einem Klon geprueft** —
**richtig, aber es ersetzt den Vollauf nicht.**

`[read]` **Und niemand hat es gemerkt, weil alle Aenderungen live
eingespielt wurden.**

## Zu messen

`[read]` **Seit wann scheitert der Lauf?** `[cmd]` **C-366 legte die
Sicht an, C-405 lief die Kette neu** — **dazwischen liegt der
Bruch.**

`[read]` **Und in welcher Reihenfolge die Schritte stehen
muessten:** `[cmd]` **wer die Sicht anlegt, muss vor 075 laufen.**

`[read]` **Ein Waechter waere richtig** — **aber erst, wenn der Lauf
wieder durchgeht.**

## Auftrag — die Kette wieder durchlaufen lassen

**Mitbeauftragt: C-389.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · C-415 — der Bruch in Schritt 075

`[cmd]` **Du hast es gemeldet** — richtig, **statt es im Hinweis zu
lassen.**

`[read]` **Miss, seit wann der Lauf scheitert** — `[cmd]` **C-366
legte `food_tags_effective` an, C-405 lief die Kette neu.**

`[read]` **Und stell die Reihenfolge her:** **wer die Sicht anlegt,
muss vor 075 laufen.**

`[read]` **Das ist der wichtigste offene Punkt heute:** **eine Kette,
die nicht durchlaeuft, kann den Zustand nicht erzeugen** — **und
alles, was seit dem Bruch live eingespielt wurde, steht auf keinem
Fundament.**

`[cmd]` **Nachweis: ein Vollkettenlauf auf einer Wegwerf-Datenbank,
der bis zum Ende geht.**

### 2 · Ein Waechter danach

`[read]` **Erst wenn der Lauf durchgeht.**

`[cmd]` **`pnpm gate` prueft heute Encoding, Punkte, Nummern,
Datenlogik** — **aber nicht, ob die Kette laeuft.**

`[read]` **Miss, was ein solcher Waechter kosten wuerde** — **ein
Vollauf je Commit waere zu teuer, einer je Tag vielleicht nicht.**

### 3 · C-389 — die drei Saftfamilien

`[cmd]` **Vier Zeilen berichtigt, drei Smoothies bleiben `raw`,
keine 53er-Regel.**

`[read]` **Miss, ob der Punkt zu ist.**

### Was nicht zu tun ist

**Keine Datenlogik in `migrations/`.**
**Nie gegen die laufende Datenbank testen** — Wegwerf-Datenbank.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    Vollauf     geht bis zum Ende, auf Wegwerf-Datenbank
    seit wann   der Bruch, mit Fundstelle
    Waechter    was er kosten wuerde, gemessen
    C-389       zu / was offen

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
