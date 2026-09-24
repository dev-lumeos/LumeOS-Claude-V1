---
nr: E-86
typ: entscheidung
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-507
entscheidung: C-507
erledigt: 2026-09-08
commit: entschieden
beruehrt:
  tabellen: [public.profiles]
zahlen:
  gemessen: 2026-09-08
---

# E-86 - gilt die Suchtiefe modulweit?

## Die Frage

`[read]` **Steuert der Erfahrungsgrad die Suchtiefe nur in
Nutrition, oder ueberall?**

## Der Anlass

`[cmd]` **Aus C-507:** *,,Dieselbe Frage stellt sich bei den
214.780 Supplementprodukten ? ein Anfaenger braucht nicht
4.907 Marken. Und bei den 1.416 Uebungen."*

`[read]` **Wenn der Erfahrungsgrad die Suchtiefe steuert, ist
das eine Entscheidung, kein Nutrition-Feature.**

## Was dagegen spricht

`[cmd]` **Supplements hat schon Filter und Lieblingsmarken
(C-504, C-511)** ? **der Nutzer waehlt selbst, statt dass der
Grad fuer ihn waehlt.**

`[read]` **Zwei Wege, dieselbe Menge zu verkleinern** ?
**einer vom Nutzer, einer vom System.**

## Was zu klaeren ist

    A  Supplements: Filter ODER Erfahrungsgrad?
    B  Training: 1.416 Uebungen -- braucht ein
       Anfaenger alle?
    C  wenn beides: was gewinnt, wenn sie sich
       widersprechen?

`[read]` **Zu entscheiden, nicht zu bauen.**

## Entschieden, 2026-09-08

Tom:

> wenn bestehende nutzer keinen erfahrungsgrad haben, ist das
> ein FEHLER, dieser zustand kann gar nicht sein. wenn alles
> fertig ist, registriert sich ein user mit einem onboarding,
> und diese frage ist bestandteil davon

> damit steuern wir im moment nur das einblenden von extended

### Die Antwort auf E-86

`[read]` **Der Erfahrungsgrad steuert VORERST nur das
Einblenden von Extended** ? **keine modulweite Suchtiefe.**

`[cmd]` **Wer ihn liest: `supplements/extended-gate.tsx`,
`nutrition/score-echt.tsx`, `coach/rechte-echt.tsx`,
`settings/formular.tsx`, `coach/tab-autonomie.tsx`.**

### Und mein Argument war falsch

`[read]` **Ich hatte geschrieben: *,,bei 5 von 7 Nutzern leer,
also entscheidet ein System darauf zufaellig"*.**

Tom: *,,dieser zustand kann gar nicht sein"*

`[read]` **Ein Befund ist kein Argument** ? **die Leere ist ein
Fehler, kein Zustand, mit dem man plant.**

`[cmd]` **Selbst nachgemessen: die beiden ECHTEN Konten tragen
`pro`. Leer sind vier Saatkonten und `coach@lumeos.app`.**

`[cmd]` **Und die Spalte ist `nullable` ohne Vorgabe** ? **das
ist der eigentliche Fehler, als C-541.**

