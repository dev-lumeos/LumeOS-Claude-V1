---
nr: A-23
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-08-19
braucht: []
kind_von: G-84
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# A-23 - `lint` bricht repoweit ab

## Befund

(neu 2026-08-19). Befund aus
  G-84.

  `[cmd]` **Fehlende ESLint-Konfiguration**, mit interaktiver
  Rueckfrage — in `@lumeos/web` wie in `@lumeos/admin`.

  `[read]` **Bestand vorher schon** — *„ging nur ueber den Turbo-Cache
  durch."* **Das ist dieselbe Klasse wie G-81:** Der Cache verdeckte
  einen Fehler, statt ihn zu zeigen.

  `[cmd]` **Der G-84-Agent hat Typecheck und Tests ohne Cache
  erzwungen** — 3 von 3, 393 gruen. **Das gehoert zur Nachweisregel.**
