---
nr: G-501
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-541
entscheidung: C-541
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/settings/formular.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-501 - der Ruecknahmeklick beim Erfahrungsgrad

## Die Entscheidung (C-541)

Tom: *,,dieser zustand kann gar nicht sein"*

`[read]` **Der Grad ist AENDERBAR, nicht LOESCHBAR** ? **wie
ein Geburtsdatum: man korrigiert es, man leert es nicht.**

## Der Befund

Claude Code in G-117:

> *,,*Nicht angegeben* ist ein VORGESEHENER Zustand: der zweite
Klick in den Settings schreibt `''`, und
`z.preprocess(leerZuNull, ...)` macht NULL daraus."*

Codex in C-541:

> *,,Der zweite Klick in `settings/formular.tsx` darf den Grad
nicht mehr leeren; auch der Formularpfad darf NULL nicht mehr
speichern."*

## Was jetzt passiert, wenn niemand nachzieht

`[cmd]` **`experience_level` ist NOT NULL, live.**

`[read]` **Der zweite Klick schreibt weiter NULL** ? **und die
Datenbank weist es ab.** **Der Nutzer sieht einen Fehler, wo
er einen Knopf gedrueckt hat.**

`[cmd]` **MISS das zuerst: was zeigt die Flaeche heute beim
zweiten Klick?**

## Zu bauen

`[read]` **Der zweite Klick waehlt nur um, er leert nicht.**

`[cmd]` **Und `z.preprocess(leerZuNull, ...)` faellt fuer
dieses Feld weg** ? **MISS, ob es andere Felder traegt,
bevor du es anfasst.**

## Abnahmebedingungen

    A1  was passiert heute beim zweiten Klick?
        Gemessen, Foto.
    A2  danach: der Klick waehlt um, leert nicht. Foto.
    A3  der Schreibweg speichert nie NULL. Belegt.
    A4  leerZuNull: welche anderen Felder? Gemessen.
    A5  ein Waechter faengt einen NULL-Schreibweg.
        Sabotageprobe.
    A6  vier Module unveraendert.
    A7  apps/web 2000 oder mehr, apps/coach 65.

## Die Stelle, gemessen 2026-09-08

    formular.tsx:64   experience_level: p.experience_level ?? ''
    formular.tsx:399  onClick={() => setze('ex...')}
    formular.tsx:353  der Vermerk zur Spalte
    formular.tsx:411  profiles.experience_level

`[cmd]` **Zeile 64 macht aus NULL einen Leerstring, Zeile 399
schreibt ihn zurueck.**

`[cmd]` **Und seit C-541 ist die Spalte NOT NULL** ? **die
Datenbank weist es ab.**

`[read]` **Der Nutzer sieht einen Fehler, wo er einen Knopf
gedrueckt hat** ? **das ist heute so, nicht irgendwann.**


## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

