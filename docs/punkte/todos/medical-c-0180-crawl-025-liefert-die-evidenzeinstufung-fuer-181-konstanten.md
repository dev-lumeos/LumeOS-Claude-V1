---
nr: C-180
typ: befund
modul: medical
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-180 - `crawl_025` liefert die Evidenzeinstufung fuer 181 Konstanten

## Befund

(neu 2026-08-20). **Der Rechercheweg hat geliefert.**

  `[cmd]` **`backup/kimi-research/.../data/evidence/` — fuenf
  Registries:**

  | | |
  |---|---|
  | `constant_evidence_registry.json` | **181 Konstanten** |
  | `recovery_modality_evidence.json` | 32 |
  | `formula_evidence_registry.json` | 22 |
  | `fatigue_signal_evidence.json` | 17 |
  | `training_structure_registry.json` | 13 |
  | **`symptom_ontology_seed.json`** | **21 Symptome** |
  | `research_hold_registry.json` | 256 |

  ### Die Einstufung ist ernuechternd — und brauchbar

  | Klasse | |
  |---|---|
  | `SUPPORTED_DIRECTION_ONLY` | **104** |
  | `CONTEXT_DEPENDENT` | 45 |
  | `INSUFFICIENT_EVIDENCE` | 11 |
  | `HEURISTIC` | 9 |
  | **`SUPPORTED_NUMERIC_THRESHOLD`** | **7** |
  | `CONFLICTING_EVIDENCE` | 4 |
  | `REPO_DEPENDENCY` | 1 |

  `[read]` **Nur sieben von 181 Zahlen duerfen hart eingebaut werden.**

  ### Je Eintrag steht die Handlungsanweisung

  `[cmd]` **`recommended_product_handling`:** `KEEP_NUMERIC` ·
  `USE_RANGE` · `USE_DIRECTIONAL_GUIDANCE` · `LABEL_HEURISTIC` ·
  **`DO_NOT_IMPLEMENT`** · `REMOVE_NUMERIC_VALUE`.

  `[read]` **Damit ist je Kachel entschieden, was gezeigt werden
  darf** — genau das, was der Auftrag verlangt hat.
