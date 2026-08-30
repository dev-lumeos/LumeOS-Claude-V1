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
erledigt: 2026-08-30
commit: OFFEN
beruehrt:
  dateien:
    - apps/web/src/lib/training/naechste-sitzung.ts
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

**Claude Code, 2026-08-30.** Mitbeauftragt mit G-277. **Der
vollstaendige Bericht steht in [G-277](coach-g-0277-der-rechte-reiter-nennt-einen-grund-den-es-nicht-gibt.md#bericht).**

### Die Modulgrenze liegt anders als bei `coach`

`[cmd]` **E-29 begruendet sich aus Protokollen und Rechtetabellen —
`coach` hat je vier, `training` keine.** `[cmd]` Ausserdem fuehrt
`training` keine Lesefunktion (nur Trigger-Helfer), RLS ist an
(5 Policies), und `lib/dashboard/lesen.ts:229` liest dieselbe Tabelle
bereits direkt aus einem fremden Modul.

`[read]` **Also direkt gelesen** — die Abwaegung steht in
`lib/training/naechste-sitzung.ts`.

### Die Daten tragen, die Empfehlungen nicht

`[cmd]` **dev: 14 geplante Sitzungen, 13 ab heute, alle 17:30.** Die
17:30 der Vorlage sind die 17:30 der Seeds.

**Gebaut ist der Zeitpunkt und der Abstand dazu.** `[read]`
**Entfernt sind Score 68, „Eat by 16:00", die Makrovorgaben und die
drei Mahlzeitenkombinationen** — vier von sechs Teilen waren genau
das, was C-108/F-02 verbietet (C-113: keine Dosierungsempfehlung,
kein Kombinationsvorschlag).

**Drei Zustaende:** `geplant` / `ohne_zeit` / `keine`.

## Abnahme

_(vom Orchestrator)_

## Abnahme

**2026-08-30, mit G-277 abgenommen:** gebaut als Tatsache: Zeitpunkt und Abstand; vier von sechs Teilen
waren Empfehlungen und sind entfernt.
