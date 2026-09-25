---
nr: C-545
typ: befund
modul: training
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: E-90
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [training.exercises]
zahlen:
  gemessen: 2026-09-08
---

# C-545 - difficulty ist ein Wert fuer alles

## Toms Idee

Tom, 2026-09-08:

> jede exercise kriegt ein erfahrungslevel, dass wir fuer
> anfaenger anderst sortieren koennen als fuer pros, sprich
> kriegt eine spalte mehr und die sortierung wird dann
> abhaengig von dem erfahrungswert

## Der Befund: die Spalte gibt es, und sie ist leer

`[cmd]` **`training.exercises.difficulty`:**

    intermediate   1.416 von 1.416

`[read]` **Ein Wert fuer alles ist keine Einstufung, sondern
eine Vorgabe, die nie gesetzt wurde.**

`[cmd]` **Dieselbe Sorte wie `faktor 1.00/0.50` (C-547) und
`is_prepared_dish false` (C-534)** ? **eine Spalte, die
aussieht wie Daten.**

## Und die zweite Haelfte

`[cmd]` **`public.profiles.experience_level` ist seit C-541
NOT NULL und traegt vier Stufen: `beginner`, `advanced`, `pro`,
`elite`.**

`[read]` **`difficulty` muss dieselben Stufen sprechen, sonst
passt die Sortierung nie.**

## Die Falle

`[read]` **1.416 Uebungen einstufen heisst: eine Quelle finden
oder raten.** **Raten waere dasselbe wie die
`faktor`-Pauschale, nur sichtbarer.**

## Zu messen, VOR dem Bauen

    A  woher kommt eine Einstufung? Traegt das
       Vorgaengerrepo etwas? Eine Quelle im Netz?
    B  laesst sie sich ableiten? Geraet, Bewegungsart,
       Zahl der belasteten Muskeln, freies Gewicht
       gegen Maschine.
    C  wie viele lassen sich SICHER einstufen, wie
       viele nicht?
    D  vier Stufen wie beim Nutzer -- oder braucht eine
       Uebung eine SPANNE (ab advanced)?

`[read]` **MESSEN und EMPFEHLEN, nicht einstufen.**

## Abnahmebedingungen

    A1  woher koennte eine Einstufung kommen? Gemessen.
    A2  laesst sie sich ableiten? Zahl, an einer
        Stichprobe belegt.
    A3  wie viele bleiben unsicher?
    A4  Stufe oder Spanne? Empfohlen, begruendet.
    A5  KEINE Umsetzung.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
