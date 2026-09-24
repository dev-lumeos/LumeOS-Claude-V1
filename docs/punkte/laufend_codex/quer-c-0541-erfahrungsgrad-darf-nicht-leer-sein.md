---
nr: C-541
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: E-86
entscheidung: E-86
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [public.profiles]
zahlen:
  gemessen: 2026-09-08
---

# C-541 - der Erfahrungsgrad darf nicht leer sein

## Toms Befund

Tom, 2026-09-08:

> wenn bestehende nutzer keinen erfahrungsgrad haben, ist das
> ein FEHLER, dieser zustand kann gar nicht sein

> wenn alles fertig ist, registriert sich ein user mit einem
> onboarding, und diese frage ist bestandteil davon

## Gemessen

    dev@lumeos.app          pro
    test-user@lumeos.local  pro
    coach@lumeos.app        LEER
    max.seed@example.com    LEER
    sarah.seed@example.com  LEER
    coach.seed@example.com  LEER
    tom.seed@example.com    LEER

`[cmd]` **`public.profiles.experience_level`: `nullable`, keine
Vorgabe.**

`[read]` **Die beiden ECHTEN Konten tragen einen Grad** ?
**leer sind Saatkonten und das Coachkonto.**

`[read]` **Aber die Spalte ERLAUBT leer, und das ist der
Fehler** ? **wer sie liest, muss einen Fall behandeln, den es
nicht geben darf.**

## Wer sie liest

    supplements/extended-gate.tsx   blendet Extended ein
    nutrition/score-echt.tsx
    coach/rechte-echt.tsx
    settings/formular.tsx
    coach/tab-autonomie.tsx

`[cmd]` **MISS, was jeder von ihnen bei NULL tut** ? **das
sagt, welche Vorgabe stimmt.**

## Zu klaeren, VOR dem Bauen

    A  was tut jeder Leser bei NULL heute?
    B  welcher Grad ist die richtige Vorgabe? Die
       Leser sagen es -- wer Extended ausblendet,
       meint beginner.
    C  die vier Saatkonten und coach@lumeos.app:
       welcher Grad? Gemeldet, nicht geraten.
    D  vertraegt ein NOT NULL die bestehenden Zeilen?

## Und das Onboarding

`[cmd]` **`coach/tab-onboarding.tsx` existiert** ? **ein
COACH-Onboarding.**

`[cmd]` **Das Nutzer-Onboarding fehlt, das steht in
`docs/todo`.**

`[read]` **Dieser Punkt macht die Spalte dicht; die Frage im
Onboarding kommt mit ihm.**

## Abnahmebedingungen

    A1  was tut jeder Leser bei NULL? Je Stelle.
    A2  die Vorgabe, begruendet aus den Lesern.
    A3  die leeren Zeilen gefuellt -- welche, womit,
        warum.
    A4  die Spalte ist NOT NULL.
    A5  Gegenprobe: ein INSERT ohne Grad faellt.
    A6  die fuenf Leser unveraendert oder benannt.
    A7  Sicherung, Vollkette, ALLE Waechter.

## Entschieden, 2026-09-08, Orchestrator

`[cmd]` **Claude Code hat in G-117 gemessen:**

> *,,*Nicht angegeben* ist ein VORGESEHENER Zustand: der
zweite Klick in den Settings schreibt `''`, und
`z.preprocess(leerZuNull, ...)` macht NULL daraus."*

`[read]` **Die Leere ist nicht nur ein Datenfehler** ? **sie
ist ein KNOPF.**

### Die Entscheidung

`[read]` **Der Ruecknahmeklick verschwindet.**

Tom: *,,dieser zustand kann gar nicht sein"* ? **dann darf
ihn auch kein Knopf herstellen.**

`[read]` **Der Grad ist AENDERBAR, nicht LOESCHBAR** ? **wie
ein Geburtsdatum: man korrigiert es, man leert es nicht.**

### Was das fuer den Auftrag heisst

    A8  der zweite Klick leert nicht mehr, er waehlt
        nur um. GEMELDET an Claude Code, der
        settings/formular.tsx aendert.
    A9  die Vorgabe fuer die bestehenden Zeilen folgt
        aus den Lesern: wer Extended ausblendet,
        meint beginner.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
