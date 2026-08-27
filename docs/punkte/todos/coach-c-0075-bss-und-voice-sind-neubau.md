---
nr: C-75
typ: befund
modul: coach
schwere: mittel
angelegt: 2026-08-18
braucht: []
kind_von: G-42
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-75 - BSS und Voice sind Neubau

## Befund

(neu 2026-08-18). Befund aus
  G-42.

  `[cmd]` Das Vorgaengerrepo hat **sechs Buddy-Migrationen, 13 Tabellen,
  `buddy.ts` mit 1.647 Zeilen** — und `behavioral_signatures` deckt den
  Signature-Tab **bis zu den Musternamen.**

  `[cmd]` **Aber zwei Tabs haben dort kein Gegenstueck:**

  | | |
  |---|---|
  | **BSS** | `stability_score`, `behavior_stability` — **nichts gefunden** |
  | **Voice** | kein `whisper`, kein `speechSynthesis`, kein `parseGymCommand` |

  `[read]` **Das aendert den Aufwand:** Fuer die uebrigen 18 Tabs ist
  eine Anbindung eine Uebersetzung — **fuer diese beiden ein Neubau.**

  `[cmd]` **Und die Stufen weichen ab:** drei im Vorgaengerrepo
  (`free`/`premium`/`pro`) gegen **vier in der Vorlage.** `[read]` Das
  beruehrt C-71, wo die Autonomiestufen des menschlichen Coaches
  anstehen — **beide Male geht es um dieselbe Frage: wie fein wird
  abgestuft.**
