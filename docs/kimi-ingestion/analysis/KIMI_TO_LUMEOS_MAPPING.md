# KIMI to LumeOS Mapping

| Dataset | Entity | Records | Target | State | Priority | Repo |
|---|---|---:|---|---|---|---|
| aliases | aliases / indexes | 12 | supplements.supplement_aliases | READY_WITH_NORMALIZATION | high | BOTH_REPO_RICHER |
| biomarker_explanations | biomarker explanations | 67 | medical biomarkers | SCHEMA_REQUIRED | medium | KIMI_ONLY |
| cache_metadata | cache/metadata | 0 | provenance cache | PROVENANCE_ONLY | low | KIMI_ONLY |
| conflicts | conflicts | 96 | conflict registry | PROVENANCE_ONLY | low | CONFLICT |
| interactions | interactions | 148 | supplements.supplement_interactions | READY_WITH_NORMALIZATION | low | KIMI_ONLY |
| lab_markers | lab markers | 5 | medical.lab_marker_catalog | SCHEMA_REQUIRED | medium | BOTH_REPO_RICHER |
| lab_trigger_index | lab trigger index | 6 | supplements.rule input / medical labs | READY_WITH_NORMALIZATION | low | KIMI_ONLY |
| medication_active_substances | medications | 9960 | medical.medication_active_substances | READY_WITH_NORMALIZATION | high | BOTH_KIMI_RICHER |
| medication_formulations | medication formulations | 9060 | medical.medication_formulations | READY_WITH_NORMALIZATION | low | BOTH_KIMI_RICHER |
| medication_products | medication products | 10784 | medical.medication_products | READY_WITH_NORMALIZATION | low | BOTH_KIMI_RICHER |
| medication_rules | medication rules | 120 | supplements.rule_catalog | READY_WITH_NORMALIZATION | low | BOTH_KIMI_RICHER |
| misc_. | misc | 0 | reference | REFERENCE_ONLY | low | KIMI_ONLY |
| misc_crawl_038_ws_src | misc | 0 | reference | REFERENCE_ONLY | low | KIMI_ONLY |
| misc_data | misc | 0 | reference | REFERENCE_ONLY | low | KIMI_ONLY |
| misc_root | misc | 0 | reference | ARCHIVE_ONLY | low | KIMI_ONLY |
| nutrient_gap_rules | nutrient gap rules | 90 | supplements.rule_catalog | READY_WITH_NORMALIZATION | low | BOTH_KIMI_RICHER |
| peptides | peptides | 1219 | supplements.supplements | READY_WITH_NORMALIZATION | high | BOTH_KIMI_RICHER |
| performance_compounds | performance/enhanced compounds | 114934 | supplements.supplements | READY_WITH_NORMALIZATION | high | BOTH_KIMI_RICHER |
| reports_docs | reports/specs | 21996 | reference docs | REFERENCE_ONLY | low | KIMI_ONLY |
| schemas | schemas | 77 | schema documentation | REFERENCE_ONLY | low | KIMI_ONLY |
| sources | sources / provenance | 14631 | provenance | PROVENANCE_ONLY | high | KIMI_ONLY |
| supplements | supplements | 3080 | supplements.supplements | READY_WITH_NORMALIZATION | high | BOTH_KIMI_RICHER |
| symptom_biomarker_map | symptom-biomarker map | 103 | medical / recovery symptoms | SCHEMA_REQUIRED | medium | KIMI_ONLY |
| tools_tests | tools/tests | 20641 | tooling | PROVENANCE_ONLY | low | KIMI_ONLY |
| warning_rules | warning rules | 174 | supplements.rule_catalog | READY_WITH_NORMALIZATION | low | BOTH_KIMI_RICHER |
