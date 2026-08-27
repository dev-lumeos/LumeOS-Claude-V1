---
nr: G-189
typ: entscheidung
modul: supplements
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

# G-189 - Der tote Rueckfallzweig `SuppInteractions` fliegt

## Befund

(neu
  2026-08-25). Aus G-187, Entscheidung des Orchestrators.

  `[cmd]` `ansicht.tsx:309-313` rendert ihn nur bei
  `regeln.length === 0`. `[cmd]` `rule_catalog` hat **64 Zeilen mit
  `{authenticated}`-Policy ohne Nutzerfilter** — es laedt immer.
  **Der Zweig ist tot.**

  `[read]` **G-163-Beschluss, unveraendert:** Rueckfallfassungen
  bleiben nicht als Notfallanzeige stehen. **Ein Zweig, der nur bei
  einem Datenbankfehler erscheint und dann eine erfundene Bewertung
  zeigt, ist genau der Fall, fuer den die Regel geschrieben wurde.**
