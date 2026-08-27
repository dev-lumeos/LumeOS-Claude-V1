---
nr: C-199
typ: entscheidung
modul: supplements
schwere: mittel
angelegt: 2026-08-22
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-199 - `medication_regulatory` als eigene Entitaet

## Befund

(neu 2026-08-22). **Zu entscheiden.**

  `[cmd]` Kimi fuehrt 498 Saetze mit `wada.status`, `wada.tue_context`
  und `change_history`. Im Repo liegt das als `regulatory_state jsonb`
  in `active_substances` — **es gibt keine vierte Tabelle.**

  `[cmd]` **WADA ist nur zu 11 % bewertet** (56 von 498).

  `[read]` **Fuer Wettkampfsportler ist WADA-Status eine Abfrage, kein
  Anhaengsel.** Als `jsonb` ist er nicht filterbar.

### Was gar kein Schema hat
