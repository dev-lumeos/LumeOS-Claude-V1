---
nr: G-206
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-08-27
braucht: []
kind_von: G-203
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# G-206 - PostgREST antwortet ohne Kompression

## Befund

(neu
  2026-08-27). Aus G-203.

  `[cmd]` **Kein `content-encoding`, auch mit `Accept-Encoding:
  gzip`.** Die Antwort von `rule_assessment` ist **40.828 B** auf dev,
  36.698 B auf test-user.

  `[read]` **Nicht die Ursache der 700 ms** — die Zeit fehlt auch bei
  fast gleicher Groesse auf test-user. **Aber ein eigener kleiner
  Posten**, weil je Seitenaufbau mehrere solcher Antworten laufen.
