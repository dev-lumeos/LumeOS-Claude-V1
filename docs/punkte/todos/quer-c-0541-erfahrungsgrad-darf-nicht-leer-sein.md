---
nr: C-541
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: E-86
entscheidung: E-86
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
