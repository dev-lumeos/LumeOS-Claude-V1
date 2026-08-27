---
nr: C-201
typ: befund
modul: quer
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

# C-201 - Der Populations-Atlas hat kein Schema

## Befund

(neu 2026-08-22). **Der groesste ungenutzte Posten.**

  `[cmd]` `population_response_atlas` **425** (39 Felder je Satz) ·
  `population_response_synthesis` 277 · `population_applicability_atlas`
  277 · `response_confounder_graph` **799 Kanten** ·
  `response_modifier_graph` 453 · `response_resolver_index` 277 ·
  `context_requirement_index` 277 · `exposure_response_summary` 182 ·
  `personal_response_readiness_model` 66. **Im Repo: nichts davon.**

  `[cmd]` Ein Satz traegt: `dose_response`, `magnitude` mit
  Konfidenzintervall und `missing_reason`, `confounders[]` je mit
  `status` (`demonstrated` / `strongly_supported`), `population` nach
  Geschlecht, Alter, Gesundheits- und Trainingsstand, `evidence_grade`,
  `inference_type`, PMIDs.

  `[read]` **Das ist der Rohstoff fuer „wirkt das bei mir?"** — eine
  belegte Richtung je Endpunkt fuer die passende Population, statt
  einer erfundenen Zahl.
