---
nr: C-432
typ: feature
modul: goals
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: C-425
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [goals.user_goals]
zahlen:
  gemessen: 2026-09-08
  plaetze: 3
---

# C-432 — der freie Platz fuer ein neues Ziel

## Befund

Aus C-425, Codex, 2026-09-08.

`[cmd]` **Variante c gilt: `priority` 1 bis 10, aktive Ziele 1 bis
3, `is_primary` fuer genau eines.**

`[cmd]` **Der einzige Mangel: `DEFAULT 5`** — **ohne ausdrueckliche
Prioritaet scheitert jedes neue aktive Ziel.**

## Auftrag

**Beauftragt am 2026-09-08.**

### 1 · Die Vorgabe

`[read]` **`DEFAULT 5` passt zu keiner der beiden Regeln.**

`[read]` **Miss, ob eine Vorgabe ueberhaupt sinnvoll ist** —
**oder ob `priority` zur Pflicht wird und der Schreibweg den Platz
sucht.**

### 2 · Die Platzsuche, atomar

`[cmd]` **Deine eigene Regel aus A3:** **niedrigster freier Platz
aus 1 bis 3. Sind alle drei belegt, entsteht kein viertes aktives
Ziel.**

`[cmd]` **Und dein eigener Nachsatz:** *,,Die Freiplatzsuche gehoert
atomar in den Schreibweg, damit kein Parallelzugriff den Slot
kollidieren laesst."*

`[read]` **Bau sie so** — **eine Funktion, die den Platz sucht und
einsetzt, nicht zwei Schritte.**

`[cmd]` **`uq_user_goals_active_slot` faengt die Kollision** —
**aber eine Fehlermeldung ist keine Antwort.**

### 3 · Wenn alle drei belegt sind

`[read]` **Der Schreibweg sagt, welche drei belegt sind** —
**damit die Oberflaeche fragen kann, welches weichen soll.**

`[read]` **Nicht einfach scheitern.** `[read]` **E-69: der Nutzer
entscheidet, aber er muss wissen, worueber.**

### 4 · `is_primary`

`[cmd]` **`uq_user_goals_one_primary` erlaubt genau eines je
Nutzer.**

`[read]` **Miss, was geschieht, wenn ein zweites gesetzt wird** —
**Fehler oder Umschaltung?**

`[read]` **Und was, wenn das primaere Ziel pausiert wird.**

### Abnahmebedingungen

    A1  ein aktives Ziel ohne Prioritaet angelegt. Welcher Platz?
        Zahl: vorher/nachher.
    A2  drei belegt, ein viertes versucht. Was kommt zurueck?
        Wortlaut nennen.
    A3  zwei gleichzeitige Anlagen. Kollidieren sie? Belegt.
    A4  is_primary zweimal gesetzt. Was geschieht?
    A5  Vollkette laeuft durch. Schritte und Sekunden.
    A6  RLS unveraendert, beide Richtungen.

### Was nicht zu tun ist

**Die Drei nicht antasten** — **sie ist gelebt und doppelt
gesichert.**
**Keine Oberflaeche** — **`Create goal` ist eine Attrappe, das ist
ein UI-Auftrag.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
