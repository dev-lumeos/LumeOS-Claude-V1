---
nr: G-499
typ: fehler
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: E-88
entscheidung: E-88
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/mockup-referenz.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-499 - die Entwurfsreferenz hinter die Gradpruefung

## Die Entscheidung (E-88)

`[read]` **Die Referenz zeigt Extended-Inhalt, also folgt sie
Extendeds Regel.**

## Der Befund

Aus G-117, Claude Code:

> *,,`mockup-referenz.tsx` zeigt unter der Trennlinie dieselben
Wirkstoffe mit DOSIS und SCHEMA ? fuer jeden, ohne
Gradpruefung."*

> *,,Isolationsprobe: haengt man sie aus, verschwindet
`physician-supervised` aus dem Manifest ? sie ist die URSACHE,
kein Rest."*

`[cmd]` **Selbst nachgemessen, `page-ef08b4bb9df16c11.js`,
315 KB: `ReferenzTrenner` JA, Mockup-Marken 6 von 6,
`physician-supervised` JA, `EXTENDED_STACK` nein.**

## Zu bauen

`[cmd]` **Dieselbe Pruefung wie `tab-extended.tsx`, dasselbe
`dynamic({ ssr: true })`.**

`[read]` **NUR der Teil unter der Trennlinie, der Extended
zeigt** ? **die uebrigen Entwurfsreferenzen bleiben, wie E-68
und E-70 es verlangen.**

`[read]` **Und was ohne Grad dort steht: eine Erklaerung, kein
leeres Feld.**

## Abnahmebedingungen

    A1  vorher/nachher: steht physician-supervised im
        Manifest? Gemessen.
    A2  mit Grad: die Referenz steht wie bisher. Foto.
    A3  ohne Grad: eine Erklaerung. Foto.
    A4  die uebrigen Entwurfsreferenzen im Modul
        unveraendert. Zahl.
    A5  der Waechter aus G-117 deckt sie jetzt mit ab.
        Sabotageprobe.
    A6  die zwoelf anderen Reiter unveraendert.
    A7  apps/web 1987 oder mehr, apps/coach 65.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

