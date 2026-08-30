---
nr: C-356
typ: messung
modul: nutrition
schwere: niedrig
angelegt: 2026-08-30
braucht: []
kind_von: C-353
entscheidung: null
beruehrt:
  dateien: [apps/web/src/app/v2/nutrition/naehrstoff-ordnung-tab.tsx]
zahlen:
  gemessen: 2026-08-30
  html_ms: 1620
  html_kb_1tag: 164
  html_kb_90tage: 700
---

# C-356 — woraus die 1.620 ms HTML bestehen

## Befund

Aus C-353, Claude Code, 2026-08-30.

`[cmd]` **Der Nutrients-Reiter braucht bei 90 Tagen 6.730 ms**, davon
**2.148 ms Datenbank** und **rund 1.620 ms HTML.**

`[cmd]` **Die Ursache ist gefunden: die Sparkline** — 90 Punkte je
Pfad statt einem, bei gleichen 102 Pfaden. **164 auf 700 kB.**

`[cmd]` **Ausgeschlossen:** die Zeilenzahl (konstant ~220 ms seit dem
nebenlaeufigen Laden) und die sichtbaren Zeilen (`tbody tr` bleibt bei
17).

## Was offen ist

`[read]` **Wie sich die 1.620 ms auf Serverrendering und Uebertragung
aufteilen.** `[read]` **Die Menge ist gemessen, ihre Aufteilung
nicht** — und er hat es so gesagt, statt zu schaetzen.

`[read]` **`schwere: niedrig`, weil der Reiter benutzbar ist** und
die Ursache bekannt. **Erst messen, wenn jemand die Sparkline aendern
will.**

## Auftrag

**Vorbereitet mit G-102 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.
