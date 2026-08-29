---
nr: C-121
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-19
braucht: []
kind_von: G-73
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-08-28
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-121 - Die Suche ist langsamer geworden

## Befund

(neu 2026-08-19).
  Befund aus G-73.

  `[cmd]` **330–492 ms gegen 199–304 ms in G-66** — **aber nicht durch
  den Umbau.** In SQL gemessen braucht die RPC allein **366–406 ms**,
  und **bei `limit 25` genauso lange wie bei `limit 50`.**

  `[annahme]` *„Die Funktion ist seit G-66 um die Presets (C-93) und die
  Vorlieben-Auswertung (C-94) gewachsen; das zu belegen hiesse sie zu
  zerlegen — eigener Auftrag."*

  `[read]` **Dass `limit 25` und `limit 50` gleich lange brauchen, ist
  der Hinweis:** Die Arbeit faellt vor dem Begrenzen an. **Zum
  Vergleich:** Uebungen 142–172 ms ueber 1.416, Biomarker 130–160 ms
  ueber 11.676.

## Auftrag

**Mitbeauftragt mit C-20 am 2026-08-28.** Der Auftragstext
und der Bericht stehen dort.

## Bericht

Ueberholt gemessen am 2026-08-29. Die historische Laufzeitspanne ist im Live-Snapshot nicht reproduzierbar; die Messreihe vor und nach C-338 steht in C-20, `docs/punkte/laufend_codex/nutrition-c-0020-treffer-am-wortanfang-schlagt-treffer-in-der-wortmitte.md`.
