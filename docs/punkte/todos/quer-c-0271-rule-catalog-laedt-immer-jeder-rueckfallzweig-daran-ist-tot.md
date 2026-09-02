---
nr: C-271
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-08-25
braucht: []
kind_von: G-187
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-271 - `rule_catalog` laedt immer — jeder Rueckfallzweig daran ist tot

## Befund

(neu 2026-08-25). Aus G-187, vom Orchestrator ergaenzt.

  `[cmd]` **64 Zeilen, `{authenticated}`-Policy, kein Nutzerfilter.**

  `[read]` **Das ist bei einem Regelkatalog vermutlich richtig** —
  Regeln sind nicht nutzerspezifisch. **Aber es heisst, dass
  `regeln.length` nie 0 wird**, und jeder Zweig, der darauf wartet,
  erscheint nie.

  `[read]` **Claude Code ist in G-187 darauf gestossen**, ohne dass es
  im Auftrag stand. **Bevor jemand einen weiteren solchen Zweig baut,
  gehoert gemessen, wie viele es schon gibt.**

  **Zu tun:** alle Stellen finden, die auf `regeln.length === 0` oder
  Vergleichbares warten. **Wo der Zweig tot ist: melden.** `[read]`
  Ob er weg soll, ist je Fall zu entscheiden — **die Zahl zuerst.**

## Auftrag

**Mitbeauftragt mit C-159 am 2026-09-02.** Der Auftragstext
und der Bericht stehen dort.

## Gemessen am 2026-09-02: gemessen und entkraeftet.

`[cmd]` **`rule_catalog` laedt bei jedem eingeloggten Aufruf mit.**
`[cmd]` **64 Zeilen kosten lokal median 0,117 ms.**

`[read]` **Der Punkt behauptete einen Engpass** — **es ist keiner.**
`[read]` **Und der Beleg ist ein Median, kein Einzelwert.**
