---
nr: G-462
typ: fehler
modul: quer
schwere: niedrig
angelegt: 2026-09-08
braucht: []
kind_von: C-503
entscheidung: null
erledigt: 2026-09-08
commit: 96e80560
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

## Erledigt durch G-461, 2026-09-08

`[cmd]` **Claude Code hat ihn beim Aufraeumen der
Anfuehrungszeichen gefunden:**

> *,,Nach der Behebung stand ein vierter Fehler allein da:
`React.useId` nach einem fruehen Return (aus G-416)."*

`[read]` **Zwei Wege, dieselbe Stelle** ? **Codex meldete ihn
aus dem Gate-Lauf, Claude Code fand ihn beim Beheben.**

`[cmd]` **Lint gruen in beiden Apps.**

