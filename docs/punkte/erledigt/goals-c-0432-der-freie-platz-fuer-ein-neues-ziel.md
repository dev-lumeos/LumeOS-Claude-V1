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
erledigt: 2026-09-08
commit: 9a9a7564
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

**2026-09-08, Orchestrator.** **Sechs mit Zahlen.**

    A1  priority ohne DEFAULT, weiter NOT NULL
        active_goal_create vergab Platz 1
    A2  bei drei belegten: kein Fehler, sondern ein Satz
    A3  zwei parallele Anlagen -> Platz 1 und 2, keine Kollision
    A4  zweites is_primary scheitert mit 23505
    A5  Vollkette 168 Schritte, 564,0 s, gruen
    A6  RLS 5 -> 5 Policies, fremdes Konto 0 Zeilen

### A2 ist die beste Antwort im Auftrag

`[cmd]` **Bei drei aktiven Zielen kommt kein Fehler zurueck,
sondern:**

> *,,Drei aktive Ziele belegen die Plaetze 1-3. Waehle ein Ziel zum
> Pausieren, Abschliessen oder Umpriorisieren."*

`[cmd]` **Und `active_goals` liefert die drei mit ID, Titel, Platz
und Primary-Status.**

`[read]` **Die Oberflaeche kann fragen, welches weichen soll** ?
**statt eine Fehlermeldung anzuzeigen, die niemand versteht.**

`[read]` **E-69: der Nutzer entscheidet, aber er muss wissen,
worueber.**

### A3 — der Leerfall war der gefaehrliche

`[cmd]` **Zwei parallele Anlagen auf ein LEERES Konto bekamen Platz
1 und 2.**

`[read]` **Ohne Sperre haetten beide Platz 1 gesucht und gefunden**
? **der eindeutige Index haette einen abgewiesen, und der Nutzer
haette einen Fehler gesehen, obwohl Platz 2 frei war.**

`[cmd]` **Ein transaktionaler Advisory-Lock je Nutzer** ? **nicht
je Tabelle.** `[read]` **Zwei Nutzer blockieren sich nicht.**

### A4 — was beim Pausieren geschieht

`[cmd]` **Die pausierte Zeile behaelt ihr `is_primary`, aber es gibt
0 aktive primaere Ziele.**

`[read]` **Der eindeutige Index greift nur bei `status='active'`**
? **also ist das kein Fehler, sondern die Folge der Bedingung.**

`[read]` **Und es ist die schonende Wahl:** **wer sein Hauptziel
pausiert und wieder aufnimmt, hat es zurueck.**

### Nicht live

`[cmd]` **Nur auf Wegwerf-Datenbanken geprueft, beide danach
entfernt.**

**Abgenommen, Einspielen als C-433 beauftragt.**

