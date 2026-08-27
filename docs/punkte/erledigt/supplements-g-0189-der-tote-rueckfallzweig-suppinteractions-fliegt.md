---
nr: G-189
typ: feature
modul: supplements
schwere: mittel
angelegt: 2026-08-25
braucht: []
kind_von: G-187
kinder: []
agent: claudecode
beauftragt: 2026-08-27
erledigt: 2026-08-27
commit: 4899dc5d
entscheidung: null
beruehrt:
  dateien: [docs/punkte/erledigt/supplements-g-0186-der-katalog-zeigt-noch-nicht-alles-was-drinsteht.md]
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

## Auftrag

**Zusammen mit G-186 beauftragt** — die drei Punkte betreffen
dieselbe Ansicht. **Der Auftragstext steht in
`supplements-g-0186-der-katalog-zeigt-noch-nicht-alles-was-drinsteht.md`,
der Bericht ebenfalls.**

## Abnahme

_(vom Orchestrator)_

**2026-08-27 abgenommen** — toter Zweig entfernt, der G-187-Satz in den erreichbaren Reiter geholt. Messung und Begruendung in der G-186-Datei.
