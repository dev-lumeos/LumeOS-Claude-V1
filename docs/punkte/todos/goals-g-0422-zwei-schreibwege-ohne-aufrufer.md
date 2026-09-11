---
nr: G-422
typ: befund
modul: goals
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-421
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/goals/modale.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-422 — Schreibwege ohne Aufrufer

## Befund

Aus G-421, Claude Code, 2026-09-08.

`[cmd]` **`messungAnlegenAktion` (G-122) ist gebaut und hat
KEINEN Aufrufer.**

`[read]` **Dieselbe Lage wie das Fotomodal, bevor er den Knopf
nachgetragen hat:**

> *,,Das Modal war unerreichbar, nichts schickte
> `{ typ: 'logPhoto' }`. Die Vorlage hat den Knopf, die Attrappe
> hatte ihn nicht mitkopiert."*

## Warum das ein Muster ist

`[cmd]` **Zweimal an einem Tag:**

    logPhoto              Modal gebaut, kein Ausloeser
    messungAnlegenAktion  Funktion gebaut, kein Aufrufer

`[cmd]` **Und ein drittes Mal in G-413:**
`preferences_hidden` **berechnet, kein Leser.**

`[read]` **Drei Bauteile, die fertig sind und nie gerufen
werden.**

`[read]` **Kein Test faellt darueber** ? **eine Funktion, die
niemand ruft, ist syntaktisch einwandfrei.**

## Was zu messen ist

`[read]` **Wie viele solche Stellen gibt es?**

`[cmd]` **Ein Waechter waere: jede exportierte Aktion in
`apps/web/src/app/v2/*/aktionen.ts` muss mindestens einen
Aufrufer haben.**

`[read]` **Und jedes `typ:` in einer Modalschaltung muss irgendwo
geschickt werden.**

`[cmd]` **`tools/` hat schon Waechter dieser Art** ? **der
`new Date()`-Waechter, der Attrappen-Waechter.**

## Und der Phasenwechsel

`[cmd]` **G-421 hat den Vermerk berichtigt: nicht *,,G-357
fehlt"*, sondern *,,der Aufrufer fehlt"*.**

`[read]` **Dieselbe Klasse** ? **die Schreibfunktion steht, der
Knopf nicht.**
