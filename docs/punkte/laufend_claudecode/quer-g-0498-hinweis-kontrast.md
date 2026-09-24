---
nr: G-498
typ: fehler
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-468
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - packages/ui/src/styles/v2.css
zahlen:
  gemessen: 2026-09-08
---

# G-498 - .v2-hinweis liegt unter 4,5:1

## Befund

Aus G-468, Claude Code, 2026-09-08:

> *,,`.v2-hinweis` traegt ueberall sonst `--fg-dim` und liegt
unter 4,5:1 ? das ist eine `packages/ui`-Aenderung, die alle
vier Module betrifft, also gehoert sie in einen eigenen
Auftrag."*

`[cmd]` **Er hat sie lokal ueberschrieben, nicht global** ?
**richtig, das war nicht sein Auftrag.**

## Dieselbe Sache wie G-479

`[cmd]` **Dort waren es `.v2-dim`, `.v2-eyebrow` und
`.v2-tbl th`: 2,88:1 hell, 2,12:1 dunkel** ? **jetzt 9,19:1
und 7,20:1.**

`[read]` **Die Lehre daraus gilt hier: die KLASSE anheben,
nicht das Token** ? **`--fg-dim` traegt vier Dekorationen, wo
2,88:1 richtig ist.**

`[read]` **Und die zweite: eine Messung an EINEM Thema sagt
nichts ueber das andere.**

## Abnahmebedingungen

    A1  wo wird .v2-hinweis benutzt? Je Modul eine Zahl.
    A2  Fliesstext oder Beiwerk? Je Stelle.
    A3  berichtigt, wo es Text ist -- hell UND dunkel
        gemessen.
    A4  die lokale Ueberschreibung aus G-468 faellt weg,
        wenn sie ueberfluessig wird.
    A5  vier Module: der Unterschied benannt, nicht
        versteckt.
    A6  ein Waechter faengt einen Rueckfall unter 4,5:1.
    A7  apps/web 1982 oder mehr, apps/coach 65.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

