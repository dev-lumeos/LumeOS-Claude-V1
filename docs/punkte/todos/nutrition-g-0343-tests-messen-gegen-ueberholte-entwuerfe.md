---
nr: G-343
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-09-07
braucht: []
kind_von: G-342
entscheidung: E-58
beruehrt:
  dateien:
    - apps/web/src/components/shell/__tests__/v2-attrappen.test.ts
zahlen:
  gemessen: 2026-09-07
---

# G-343 — Tests messen gegen ueberholte Entwuerfe

## Befund

Aus G-342, Claude Code, 2026-09-07.

`[cmd]` **`v2-attrappen.test.ts` prueft Vorlagentreue gegen einen
Entwurf von vor E-58.**

`[read]` **Er hat eine Zusage berichtigt und gemeldet, dass eine
Durchsicht lohnt.**

## Zu messen

`[read]` **Welche Tests messen noch gegen Staende, die seit dem
02.09. ueberholt sind?**

`[cmd]` **Neunzehn Entscheidungen an einem Tag** — E-45 bis E-63.
`[cmd]` **Darunter E-58 (Mahlzeitenstruktur), E-59 (Planstruktur),
E-61 (Vitamin A), E-63 (Sonstige faellt weg).**

`[read]` **Ein Test, der eine ueberholte Vorlage sichert, wird gruen
und schuetzt den falschen Zustand.**

`[read]` **Dieselbe Klasse wie die vier Waechter aus G-342:** **sie
hielten toten Code am Leben, weil sie seine Existenz massen.**
