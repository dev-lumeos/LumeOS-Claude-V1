---
nr: G-462
typ: fehler
modul: quer
schwere: niedrig
angelegt: 2026-09-08
braucht: []
kind_von: C-503
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/insights-kacheln.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-462 - bedingtes React.useId

## Befund

Aus C-503, Codex, 2026-09-08:

> *,,Web-Lint: bedingtes `React.useId` in
`insights-kacheln.tsx`."*

`[read]` **Ein Hook in einer Bedingung bricht die
Hook-Reihenfolge** ? **React verlaesst sich darauf, dass sie je
Aufruf gleich ist.**

`[cmd]` **Der Lint faengt es, die Proben nicht** ? **es
faellt erst auf, wenn die Bedingung wechselt.**

## Was zu tun ist

`[read]` **Den Hook nach oben ziehen, unbedingt.**

`[cmd]` **Und messen, ob es weitere bedingte Hooks gibt** ?
**der Lint nennt nur den ersten.**

## Warum es zaehlt

`[read]` **Dieselbe Klasse wie der Vorgabewert in G-450:**
**kein Typfehler, keine Meldung, falsches Verhalten.**
