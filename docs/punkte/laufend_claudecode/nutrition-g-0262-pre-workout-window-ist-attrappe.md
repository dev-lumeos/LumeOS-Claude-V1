---
nr: G-262
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-29
braucht: []
kind_von: G-254
entscheidung: null
agent: claudecode
beauftragt: 2026-08-30
beruehrt:
  dateien: [apps/web/src/app/v2/nutrition/ansicht.tsx]
zahlen: null
---
# G-262 — Pre-workout window ist Attrappe

## Befund

**Tom, 2026-08-29**, beim Durchgehen des Nutrition-Moduls.

`[read]` **Eine der Kacheln aus G-254, von Tom benannt.**

## Vor dem Bauen zu klaeren

`[read]` **Woraus soll die Zahl entstehen?** Ein Pre-Workout-Fenster
setzt voraus, dass bekannt ist, wann trainiert wird.

`[cmd]` **`training.workout_sessions` traegt Sitzungen mit Zeit.**
`[read]` **Ob das Tagebuch daraus liest, ist eine Modulgrenze** —
dieselbe Frage wie bei G-258 und `coach.pending_actions`, dort mit
E-29 zugunsten einer Funktion entschieden.

## Auftrag — die letzten zwei Kacheln aus G-254

**Mitbeauftragt: G-263.** Bericht in diese Datei.

**Beauftragt am 2026-08-30.**

`[read]` **Von den sechs Kacheln aus G-254 sind vier erledigt.**
`[cmd]` Pending actions (E-29, wartet auf C-354), Nutrition score
(E-25, blockiert), Micronutrient trend (laeuft), **und diese zwei
sind uebrig.**

### 1 · G-262 — Pre-workout window

`[read]` **Ein Pre-Workout-Fenster setzt voraus, dass bekannt ist,
wann trainiert wird.**

`[cmd]` **`training.workout_sessions` traegt Sitzungen mit Zeit.**
`[read]` **Ob das Tagebuch daraus liest, ist eine Modulgrenze** —
dieselbe Frage wie bei `coach.pending_actions`, dort mit E-29
zugunsten einer Funktion entschieden.

`[read]` **Miss, was da ist. Wenn es eine Funktion braucht: melden,
nicht direkt lesen.**

### 2 · G-263 — Smart suggestions

`[cmd]` **Die Kachel sagt selbst: *,,Die Zahlen sind erfunden, bis die
Kachel eine Quelle hat."***

`[read]` **Die Vorfrage ist inhaltlich, nicht technisch: was ist ein
Vorschlag?**

`[cmd]` **Und die Grenze aus C-108/F-02 gilt: *Nennen ja, bewerten
nein.*** `[read]` **Ein Vorschlag ist eine Bewertung** — er sagt, was
jemand tun soll.

`[read]` **Miss, ob es eine Datenlage gibt, aus der ein Vorschlag
entstehen koennte, ohne die Grenze zu verletzen.** `[read]` **Wenn
nicht: sag es, und die Kachel wird entfernt statt gefuellt.**

### Was nicht zu tun ist

**Nichts erfinden, wo Daten fehlen.**
**Keine Bewertung ausgeben** — C-108/F-02.
**Nicht direkt aus `training.*` lesen**, wenn eine Funktion noetig
waere — melden.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Trainingszeiten         da? erreichbar?
    Vorschlagsquelle        gibt es eine? welche
    Grenze C-108/F-02       eingehalten, belegt
    je Kachel ein Urteil    gebaut / entfernt / braucht Entscheidung
    Attrappen               vorher / nachher, am Schirm

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
