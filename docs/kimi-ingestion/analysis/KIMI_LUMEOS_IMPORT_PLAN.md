# KIMI LumeOS Import Plan

## WAVE 0 — prerequisites
- `sources` → provenance (PROVENANCE_ONLY, 14631 records).
- `schemas` → schema documentation (REFERENCE_ONLY, 77 records).
- `reports_docs` → reference docs (REFERENCE_ONLY, 21996 records).
- `conflicts` → conflict registry (PROVENANCE_ONLY, 96 records).

## WAVE 1 — safe existing-schema imports
- `aliases` → supplements.supplement_aliases (READY_WITH_NORMALIZATION, 12 records).
- `medication_active_substances` → medical.medication_active_substances (READY_WITH_NORMALIZATION, 9960 records).
- `medication_formulations` → medical.medication_formulations (READY_WITH_NORMALIZATION, 9060 records).
- `medication_products` → medical.medication_products (READY_WITH_NORMALIZATION, 10784 records).
- `supplements` → supplements.supplements (READY_WITH_NORMALIZATION, 3080 records).
- `peptides` → supplements.supplements (READY_WITH_NORMALIZATION, 1219 records).
- `performance_compounds` → supplements.supplements (READY_WITH_NORMALIZATION, 114934 records).

## WAVE 2 — Knowledge Core schema additions
- `lab_markers` → medical.lab_marker_catalog (SCHEMA_REQUIRED, 5 records).
- `biomarker_explanations` → medical biomarkers (SCHEMA_REQUIRED, 67 records).
- `symptom_biomarker_map` → medical / recovery symptoms (SCHEMA_REQUIRED, 103 records).

## WAVE 3 — Response/Graph layers
- `warning_rules` → supplements.rule_catalog (READY_WITH_NORMALIZATION, 174 records).
- `medication_rules` → supplements.rule_catalog (READY_WITH_NORMALIZATION, 120 records).
- `nutrient_gap_rules` → supplements.rule_catalog (READY_WITH_NORMALIZATION, 90 records).
- `interactions` → supplements.supplement_interactions (READY_WITH_NORMALIZATION, 148 records).
- `lab_trigger_index` → supplements.rule input / medical labs (READY_WITH_NORMALIZATION, 6 records).

## WAVE 4 — Vision/Product layers
- `medication_products` → medical.medication_products (READY_WITH_NORMALIZATION, 10784 records).
- `misc_.` → reference (REFERENCE_ONLY, 0 records).
- `misc_crawl_038_ws_src` → reference (REFERENCE_ONLY, 0 records).
- `misc_data` → reference (REFERENCE_ONLY, 0 records).
- `misc_root` → reference (ARCHIVE_ONLY, 0 records).
- `cache_metadata` → provenance cache (PROVENANCE_ONLY, 0 records).

## WAVE 5 — Community/Admin layer
- `tools_tests` → tooling (PROVENANCE_ONLY, 20641 records).
- `reports_docs` → reference docs (REFERENCE_ONLY, 21996 records).

No import is executed by this analysis.
