---
nr: G-117
typ: feature
modul: supplements
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: G-110
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# G-117 - Der Extended-Code liegt im Buendel, auch ohne Erfahrungsgrad

## Befund

(neu 2026-08-20, aus G-110).

  `[cmd]` **Das Gate haelt die Daten, nicht den Code.** Gemessen: bei
  statischem Import steht „Active protocols" in **einem von sieben**
  JS-Chunks der Seite — auch fuer jemanden, dessen Grad nicht reicht.

  `[cmd]` **Ein `dynamic({ ssr: false })` behebt es** (der Chunk war
  danach nicht mehr im Seitenmanifest) — **und macht den Tab leer:** er
  zeigte gar nichts mehr, auch nicht den Ladehinweis. **Zurueckgenommen.**

  `[read]` **Wie schwer es wiegt:** Die Protokolle selbst kommen NICHT
  mit — nur die Attrappenzahlen des Entwurfs. Wer den Code liest,
  erfaehrt nichts ueber den Nutzer. **Sobald Extended echte Daten
  fuehrt, wird es ernst.**
