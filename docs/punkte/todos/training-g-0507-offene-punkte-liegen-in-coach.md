---
nr: G-507
typ: befund
modul: training
schwere: niedrig
angelegt: 2026-09-08
braucht: []
kind_von: G-25
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/training/fehlende-kacheln.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-507 - die Kachel ,,Pending actions" zeigt auf ein fremdes Schema

## Die Kachel

`[cmd]` **`training/calendar`, *,,Pending actions"*.** **Drei
Zeilen aus einer festen Liste** (`OFFENE_PUNKTE`): zwei Saetze
ohne RPE, eine unbestaetigte Sitzung, ein offenes
Koerpergewicht.

## Der Vermerk ist fast richtig

`[cmd]` **Er lautet:** *,,eine Aufgabenliste je Nutzer - es
gibt sie in recovery, nicht in training."*

`[cmd]` **Gemessen 2026-09-08: die Tabelle liegt in COACH,
nicht in recovery** - `coach.pending_actions`. **Daneben
`coach.action_log` und `coach.pending_invites`.**

`[read]` **Ein Vermerk, der das falsche Schema nennt,
schickt den naechsten Leser an die falsche Stelle.**

## Was zu entscheiden ist

`[read]` **Nicht, ob die Tabelle gebaut wird - ob Training
sie MITBENUTZT.** `[cmd]` **`coach.pending_actions` gehoert
dem Coach-Modul; eine Trainingsaufgabe ist etwas anderes als
eine Coachaufgabe.**

`[read]` **Drei Wege:** Training liest mit, Training bekommt
eine eigene Tabelle, oder die Kachel entfaellt (E-70).

`[read]` **Und die drei Zeilen des Entwurfs sind ableitbar** -
Saetze ohne RPE stehen in `workout_sets.rpe IS NULL`, eine
unbestaetigte Sitzung in `status <> 'completed'`. **Das ist
keine Aufgabenliste, das ist eine Abfrage.**

## Abnahmebedingungen

    A1  der Vermerk nennt das richtige Schema.
    A2  eine Entscheidung: mitlesen, eigene Tabelle
        oder abgeleitet.
    A3  bei ,,abgeleitet": die drei Zeilen aus
        workout_sets/workout_sessions. Zahl.
