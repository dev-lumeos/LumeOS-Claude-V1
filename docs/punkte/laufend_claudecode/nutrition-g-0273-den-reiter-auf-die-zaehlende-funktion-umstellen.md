---
nr: G-273
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-29
braucht: []
kind_von: C-348
entscheidung: null
agent: claudecode
beauftragt: 2026-08-29
beruehrt:
  dateien: [apps/web/src/app/v2/nutrition/naehrstoff-ordnung-tab.tsx]
zahlen:
  gemessen: 2026-08-29
  bytes_vorher: 8298086
  bytes_nachher: 1814
  reiter_ms: 6393
---

# G-273 — den Reiter auf die zaehlende Funktion umstellen

## Befund

Aus C-239/C-348, Codex, 2026-08-29.

`[cmd]` **Die zaehlende Funktion liefert dieselben zehn Flags mit
1.814 statt 8.298.086 Byte** — minus 99,98 Prozent.

`[cmd]` **Der UI-Aufrufer ist unangetastet** — die Funktion liegt
bereit, der Reiter nutzt sie nicht.

## Was daran haengt

`[cmd]` **Der Reiter steht bei 6.393 ms**, davon rund 895 ms
Uebertragung.

`[read]` **Tom hat sich in G-260 fuer die Flags entschieden und die
Ladezeit in Kauf genommen.** **Diese Umstellung macht die
Entscheidung billiger, ohne sie zu aendern.**

`[read]` **Der Nachweis ist Ergebnisgleichheit:** dieselben Flags,
dieselben Tageszaehlungen. **Eine schnellere Anzeige mit anderen
Zahlen waere keine Verbesserung.**

## Auftrag

**Mitbeauftragt mit G-272 am 2026-08-29.** Der Auftragstext
und der Bericht stehen dort.
