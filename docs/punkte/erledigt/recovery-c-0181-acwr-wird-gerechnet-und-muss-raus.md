---
nr: C-181
typ: feature
modul: recovery
schwere: mittel
angelegt: 2026-08-22
braucht: []
kind_von: null
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-08-29
erledigt: 2026-08-29
commit: d2f692b2
beruehrt:
  tabellen: [recovery.scores]
zahlen: null
---

# C-181 - ACWR wird gerechnet und muss raus

## Befund

(neu gefasst
  2026-08-22, vorher *„nicht implementieren"*). Aus C-180.

  `[cmd]` **Kimi-Kernentscheidung 1:** *„Safe-Zone 0,8–1,3 / >1,5 als
  HEURISTIC entfernt."* `formula_evidence_registry` fuehrt
  `acwr_decision = implement:no` mit drei Quellen.

  **Der Punkt sagte bis heute das Gegenteil der Lage.** `[read]` Er
  behauptete, *„ACWR werde nirgends gerechnet — gut so"*. `[cmd]` Es
  wird gerechnet, und der Wert steht in der Oberflaeche:

  | Fundstelle | |
  |---|---|
  | `motor.ts:335` | `ACWR_DATA = { acute_7d: 2142, chronic_28d: 1980, acwr: 1.08 }` |
  | `motor.ts:337` | `export function calcTrainingLoadScore(acwr: number)` |
  | `motor.ts:338` | `if (acwr >= 0.8 && acwr <= 1.3) return 1.0` |
  | `motor.ts:431` | `const tls = calcTrainingLoadScore(ACWR_DATA.acwr)` |
  | `ansicht.tsx:262` | `['ACWR', String(ACWR_DATA.acwr), 'load ...']` |

  `[cmd]` **56 Treffer auf `ACWR` im Baum.** Die Zahlen sind Attrappen,
  die Formel ist echt, und der Score gewichtet sie.

  `[read]` **Woher der Irrtum kam:** gesucht wurde nach
  `training.load_spike`, dem Namen aus dem Feldvertrag. `[cmd]` Der
  findet drei Treffer, alle in der Regel-Engine, keinen im
  Recovery-Motor — die Umsetzung heisst `ACWR_DATA`. **Der Name im
  Vertrag ist nicht der Name im Code.** Dieselbe Falle wie `tree_nuts`
  gegen `contains_nuts` und `SE` gegen `SER`.

  `[read]` **Das ist dieselbe Klasse wie die Modalitaets-Boni aus
  C-124:** eine unbelegte Zahl, die in einen Score einfliesst und
  angezeigt wird. C-124 ist erledigt, das hier nicht.

## Auftrag

**Mitbeauftragt mit C-143 am 2026-08-29.** Der Auftragstext
und der Bericht stehen dort.

## Abnahme

**2026-08-29, mit C-143 abgenommen.** Messung und Urteil stehen
dort.
