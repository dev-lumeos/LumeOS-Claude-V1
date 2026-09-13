---
nr: G-443
typ: fehler
modul: recovery
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: C-482
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/recovery/muskel-ebenen.ts
zahlen:
  gemessen: 2026-09-08
  muskeln: 10
---

# G-443 — zehn Muskeln ohne Flaechenziel

## Befund

`[cmd]` **`muskel-ebenen.test.ts`, zwei rote Proben:**

    "99 Beziehungen statt 89"
    zehn Muskeln ohne Flaechenziel

`[cmd]` **Claude Code hat sie durch Stashen geprueft** ?
**dieselben zwei Fehler ohne seine Aenderung.**

`[read]` **Die Ursache: C-482 hat zehn Namen in
`muscle_groups` angelegt (Serratus, drei Trizepskoepfe, zwei
Vastus, zwei Gastrocnemius, External Oblique, Posterior Neck
Muscles).**

`[cmd]` **Neun davon haben seit G-438 eine Flaeche** ? **nur
`Posterior Neck Muscles` nicht.**

`[read]` **Die Waechterzahl 89 stammt von VOR C-482.**

## Was zu tun ist

`[read]` **Die Zahl auf 99 setzen** ? **aber ERST messen, ob 99
richtig ist.**

`[cmd]` **Die Regel aus Toms Waechteransage:** *,,wer einen
waechter anfasst, laesst ihn GRUEN zurueck."*

`[cmd]` **C-482 hat zehn Namen gebaut und den Waechter rot
gelassen** ? **derselbe Fall wie G-439 (`fiber_g`).**

## Und die zehn einzeln

`[read]` **Miss je Name, ob er eine Flaeche BRAUCHT.**

`[cmd]` **`Posterior Neck Muscles` ist eine Gruppe, kein
Einzelmuskel** ? **Codex hat sie in C-482 bewusst so benannt,
*,,statt faelschlich nur Scalenes oder Splenius zu
behaupten"*.**

`[read]` **Eine Gruppe ohne eigene Flaeche ist kein Fehler.**

## Abnahmebedingungen

    A1  je der zehn: Flaeche noetig oder nicht?
        Begruendet.
    A2  die Waechterzahl stimmt mit der Wirklichkeit.
        Gemessen, nicht geschaetzt.
    A3  beide Proben GRUEN.
    A4  Gegenprobe: ein elfter Name ohne Flaeche
        -> faellt sie?

