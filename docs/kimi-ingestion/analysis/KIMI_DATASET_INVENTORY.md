# KIMI Dataset Inventory

| Dataset | Files | Archive Entries | Records | State | Target | Repo Comparison |
|---|---:|---:|---:|---|---|---|
| aliases | 2 | 10 | 12 | READY_WITH_NORMALIZATION | supplements.supplement_aliases | BOTH_REPO_RICHER |
| biomarker_explanations | 2 | 0 | 67 | SCHEMA_REQUIRED | medical biomarkers | KIMI_ONLY |
| cache_metadata | 26 | 0 | 0 | PROVENANCE_ONLY | provenance cache | KIMI_ONLY |
| conflicts | 9 | 20 | 96 | PROVENANCE_ONLY | conflict registry | CONFLICT |
| interactions | 3 | 7 | 148 | READY_WITH_NORMALIZATION | supplements.supplement_interactions | KIMI_ONLY |
| lab_markers | 1 | 4 | 5 | SCHEMA_REQUIRED | medical.lab_marker_catalog | BOTH_REPO_RICHER |
| lab_trigger_index | 1 | 5 | 6 | READY_WITH_NORMALIZATION | supplements.rule input / medical labs | KIMI_ONLY |
| medication_active_substances | 1 | 19 | 9960 | READY_WITH_NORMALIZATION | medical.medication_active_substances | BOTH_KIMI_RICHER |
| medication_formulations | 1 | 19 | 9060 | READY_WITH_NORMALIZATION | medical.medication_formulations | BOTH_KIMI_RICHER |
| medication_products | 6 | 46 | 10784 | READY_WITH_NORMALIZATION | medical.medication_products | BOTH_KIMI_RICHER |
| medication_rules | 1 | 5 | 120 | READY_WITH_NORMALIZATION | supplements.rule_catalog | BOTH_KIMI_RICHER |
| misc_. | 0 | 42 | 0 | REFERENCE_ONLY | reference | KIMI_ONLY |
| misc_crawl_038_ws_src | 4 | 0 | 0 | REFERENCE_ONLY | reference | KIMI_ONLY |
| misc_data | 14 | 28 | 0 | REFERENCE_ONLY | reference | KIMI_ONLY |
| misc_root | 19 | 0 | 0 | ARCHIVE_ONLY | reference | KIMI_ONLY |
| nutrient_gap_rules | 1 | 5 | 90 | READY_WITH_NORMALIZATION | supplements.rule_catalog | BOTH_KIMI_RICHER |
| peptides | 1 | 19 | 1219 | READY_WITH_NORMALIZATION | supplements.supplements | BOTH_KIMI_RICHER |
| performance_compounds | 1 | 23926 | 114934 | READY_WITH_NORMALIZATION | supplements.supplements | BOTH_KIMI_RICHER |
| reports_docs | 1696 | 617 | 21996 | REFERENCE_ONLY | reference docs | KIMI_ONLY |
| schemas | 24 | 61 | 77 | REFERENCE_ONLY | schema documentation | KIMI_ONLY |
| sources | 2 | 7 | 14631 | PROVENANCE_ONLY | provenance | KIMI_ONLY |
| supplements | 1 | 19 | 3080 | READY_WITH_NORMALIZATION | supplements.supplements | BOTH_KIMI_RICHER |
| symptom_biomarker_map | 2 | 0 | 103 | SCHEMA_REQUIRED | medical / recovery symptoms | KIMI_ONLY |
| tools_tests | 8211 | 12148 | 20641 | PROVENANCE_ONLY | tooling | KIMI_ONLY |
| warning_rules | 1 | 5 | 174 | READY_WITH_NORMALIZATION | supplements.rule_catalog | BOTH_KIMI_RICHER |

## Datasets

### aliases

- What: aliases / indexes
- Contains: 12 records across 2 filesystem files and 10 archive entries.
- Completeness: 1691 populated-field coverage entries calculated; see JSON for full field matrix.
- LumeOS owner: supplements.supplement_aliases
- Integration: READY_WITH_NORMALIZATION
- Repo comparison: BOTH_REPO_RICHER
- Knowledge layers: OBSERVATION COMPARISON

### biomarker_explanations

- What: biomarker explanations
- Contains: 67 records across 2 filesystem files and 0 archive entries.
- Completeness: 33 populated-field coverage entries calculated; see JSON for full field matrix.
- LumeOS owner: medical biomarkers
- Integration: SCHEMA_REQUIRED
- Repo comparison: KIMI_ONLY
- Knowledge layers: STATIC KNOWLEDGE, SCIENTIFIC EVIDENCE, OBSERVATION COMPARISON, RESEARCH/PROVENANCE

### cache_metadata

- What: cache/metadata
- Contains: 0 records across 26 filesystem files and 0 archive entries.
- Completeness: 0 populated-field coverage entries calculated; see JSON for full field matrix.
- LumeOS owner: provenance cache
- Integration: PROVENANCE_ONLY
- Repo comparison: KIMI_ONLY
- Knowledge layers: RESEARCH/PROVENANCE

### conflicts

- What: conflicts
- Contains: 96 records across 9 filesystem files and 20 archive entries.
- Completeness: 70 populated-field coverage entries calculated; see JSON for full field matrix.
- LumeOS owner: conflict registry
- Integration: PROVENANCE_ONLY
- Repo comparison: CONFLICT
- Knowledge layers: STATIC KNOWLEDGE, SCIENTIFIC EVIDENCE, COMMUNITY INTELLIGENCE, RESEARCH/PROVENANCE

### interactions

- What: interactions
- Contains: 148 records across 3 filesystem files and 7 archive entries.
- Completeness: 36 populated-field coverage entries calculated; see JSON for full field matrix.
- LumeOS owner: supplements.supplement_interactions
- Integration: READY_WITH_NORMALIZATION
- Repo comparison: KIMI_ONLY
- Knowledge layers: SCIENTIFIC EVIDENCE, COMMUNITY INTELLIGENCE, RULE/Safety KNOWLEDGE

### lab_markers

- What: lab markers
- Contains: 5 records across 1 filesystem files and 4 archive entries.
- Completeness: 383 populated-field coverage entries calculated; see JSON for full field matrix.
- LumeOS owner: medical.lab_marker_catalog
- Integration: SCHEMA_REQUIRED
- Repo comparison: BOTH_REPO_RICHER
- Knowledge layers: STATIC KNOWLEDGE, OBSERVATION COMPARISON, VISION KNOWLEDGE

### lab_trigger_index

- What: lab trigger index
- Contains: 6 records across 1 filesystem files and 5 archive entries.
- Completeness: 387 populated-field coverage entries calculated; see JSON for full field matrix.
- LumeOS owner: supplements.rule input / medical labs
- Integration: READY_WITH_NORMALIZATION
- Repo comparison: KIMI_ONLY
- Knowledge layers: STATIC KNOWLEDGE, PRODUCT IDENTITY, SCIENTIFIC EVIDENCE, OBSERVATION COMPARISON

### medication_active_substances

- What: medications
- Contains: 9960 records across 1 filesystem files and 19 archive entries.
- Completeness: 186 populated-field coverage entries calculated; see JSON for full field matrix.
- LumeOS owner: medical.medication_active_substances
- Integration: READY_WITH_NORMALIZATION
- Repo comparison: BOTH_KIMI_RICHER
- Knowledge layers: STATIC KNOWLEDGE, SCIENTIFIC EVIDENCE, POPULATION RESPONSE, APPLICABILITY, OBSERVATION COMPARISON, RULE/Safety KNOWLEDGE, RESEARCH/PROVENANCE

### medication_formulations

- What: medication formulations
- Contains: 9060 records across 1 filesystem files and 19 archive entries.
- Completeness: 13 populated-field coverage entries calculated; see JSON for full field matrix.
- LumeOS owner: medical.medication_formulations
- Integration: READY_WITH_NORMALIZATION
- Repo comparison: BOTH_KIMI_RICHER
- Knowledge layers: STATIC KNOWLEDGE, PRODUCT IDENTITY, SCIENTIFIC EVIDENCE, RESEARCH/PROVENANCE

### medication_products

- What: medication products
- Contains: 10784 records across 6 filesystem files and 46 archive entries.
- Completeness: 156 populated-field coverage entries calculated; see JSON for full field matrix.
- LumeOS owner: medical.medication_products
- Integration: READY_WITH_NORMALIZATION
- Repo comparison: BOTH_KIMI_RICHER
- Knowledge layers: PRODUCT IDENTITY, SCIENTIFIC EVIDENCE, OBSERVATION COMPARISON, RULE/Safety KNOWLEDGE, VISION KNOWLEDGE, RESEARCH/PROVENANCE

### medication_rules

- What: medication rules
- Contains: 120 records across 1 filesystem files and 5 archive entries.
- Completeness: 38 populated-field coverage entries calculated; see JSON for full field matrix.
- LumeOS owner: supplements.rule_catalog
- Integration: READY_WITH_NORMALIZATION
- Repo comparison: BOTH_KIMI_RICHER
- Knowledge layers: STATIC KNOWLEDGE, SCIENTIFIC EVIDENCE, APPLICABILITY, RULE/Safety KNOWLEDGE, RESEARCH/PROVENANCE

### misc_.

- What: misc
- Contains: 0 records across 0 filesystem files and 42 archive entries.
- Completeness: 0 populated-field coverage entries calculated; see JSON for full field matrix.
- LumeOS owner: reference
- Integration: REFERENCE_ONLY
- Repo comparison: KIMI_ONLY
- Knowledge layers: RESEARCH/PROVENANCE

### misc_crawl_038_ws_src

- What: misc
- Contains: 0 records across 4 filesystem files and 0 archive entries.
- Completeness: 0 populated-field coverage entries calculated; see JSON for full field matrix.
- LumeOS owner: reference
- Integration: REFERENCE_ONLY
- Repo comparison: KIMI_ONLY
- Knowledge layers: RESEARCH/PROVENANCE

### misc_data

- What: misc
- Contains: 0 records across 14 filesystem files and 28 archive entries.
- Completeness: 0 populated-field coverage entries calculated; see JSON for full field matrix.
- LumeOS owner: reference
- Integration: REFERENCE_ONLY
- Repo comparison: KIMI_ONLY
- Knowledge layers: RESEARCH/PROVENANCE

### misc_root

- What: misc
- Contains: 0 records across 19 filesystem files and 0 archive entries.
- Completeness: 0 populated-field coverage entries calculated; see JSON for full field matrix.
- LumeOS owner: reference
- Integration: ARCHIVE_ONLY
- Repo comparison: KIMI_ONLY
- Knowledge layers: RESEARCH/PROVENANCE

### nutrient_gap_rules

- What: nutrient gap rules
- Contains: 90 records across 1 filesystem files and 5 archive entries.
- Completeness: 18 populated-field coverage entries calculated; see JSON for full field matrix.
- LumeOS owner: supplements.rule_catalog
- Integration: READY_WITH_NORMALIZATION
- Repo comparison: BOTH_KIMI_RICHER
- Knowledge layers: APPLICABILITY, OBSERVATION COMPARISON, RULE/Safety KNOWLEDGE

### peptides

- What: peptides
- Contains: 1219 records across 1 filesystem files and 19 archive entries.
- Completeness: 253 populated-field coverage entries calculated; see JSON for full field matrix.
- LumeOS owner: supplements.supplements
- Integration: READY_WITH_NORMALIZATION
- Repo comparison: BOTH_KIMI_RICHER
- Knowledge layers: STATIC KNOWLEDGE, SCIENTIFIC EVIDENCE, APPLICABILITY, OBSERVATION COMPARISON, RULE/Safety KNOWLEDGE, RESEARCH/PROVENANCE

### performance_compounds

- What: performance/enhanced compounds
- Contains: 114934 records across 1 filesystem files and 23926 archive entries.
- Completeness: 266 populated-field coverage entries calculated; see JSON for full field matrix.
- LumeOS owner: supplements.supplements
- Integration: READY_WITH_NORMALIZATION
- Repo comparison: BOTH_KIMI_RICHER
- Knowledge layers: STATIC KNOWLEDGE, SCIENTIFIC EVIDENCE, APPLICABILITY, OBSERVATION COMPARISON, RULE/Safety KNOWLEDGE, RESEARCH/PROVENANCE

### reports_docs

- What: reports/specs
- Contains: 21996 records across 1696 filesystem files and 617 archive entries.
- Completeness: 31682 populated-field coverage entries calculated; see JSON for full field matrix.
- LumeOS owner: reference docs
- Integration: REFERENCE_ONLY
- Repo comparison: KIMI_ONLY
- Knowledge layers: STATIC KNOWLEDGE, PRODUCT IDENTITY, SCIENTIFIC EVIDENCE, POPULATION RESPONSE, APPLICABILITY, OBSERVATION COMPARISON, COMMUNITY INTELLIGENCE, RULE/Safety KNOWLEDGE, VISION KNOWLEDGE, RESEARCH/PROVENANCE

### schemas

- What: schemas
- Contains: 77 records across 24 filesystem files and 61 archive entries.
- Completeness: 807 populated-field coverage entries calculated; see JSON for full field matrix.
- LumeOS owner: schema documentation
- Integration: REFERENCE_ONLY
- Repo comparison: KIMI_ONLY
- Knowledge layers: STATIC KNOWLEDGE, PRODUCT IDENTITY, SCIENTIFIC EVIDENCE, POPULATION RESPONSE, APPLICABILITY, OBSERVATION COMPARISON, COMMUNITY INTELLIGENCE, RULE/Safety KNOWLEDGE, VISION KNOWLEDGE, RESEARCH/PROVENANCE

### sources

- What: sources / provenance
- Contains: 14631 records across 2 filesystem files and 7 archive entries.
- Completeness: 24 populated-field coverage entries calculated; see JSON for full field matrix.
- LumeOS owner: provenance
- Integration: PROVENANCE_ONLY
- Repo comparison: KIMI_ONLY
- Knowledge layers: STATIC KNOWLEDGE, SCIENTIFIC EVIDENCE, COMMUNITY INTELLIGENCE, RESEARCH/PROVENANCE

### supplements

- What: supplements
- Contains: 3080 records across 1 filesystem files and 19 archive entries.
- Completeness: 299 populated-field coverage entries calculated; see JSON for full field matrix.
- LumeOS owner: supplements.supplements
- Integration: READY_WITH_NORMALIZATION
- Repo comparison: BOTH_KIMI_RICHER
- Knowledge layers: STATIC KNOWLEDGE, SCIENTIFIC EVIDENCE, APPLICABILITY, OBSERVATION COMPARISON, RULE/Safety KNOWLEDGE, RESEARCH/PROVENANCE

### symptom_biomarker_map

- What: symptom-biomarker map
- Contains: 103 records across 2 filesystem files and 0 archive entries.
- Completeness: 62 populated-field coverage entries calculated; see JSON for full field matrix.
- LumeOS owner: medical / recovery symptoms
- Integration: SCHEMA_REQUIRED
- Repo comparison: KIMI_ONLY
- Knowledge layers: STATIC KNOWLEDGE, SCIENTIFIC EVIDENCE, OBSERVATION COMPARISON, RESEARCH/PROVENANCE

### tools_tests

- What: tools/tests
- Contains: 20641 records across 8211 filesystem files and 12148 archive entries.
- Completeness: 7874 populated-field coverage entries calculated; see JSON for full field matrix.
- LumeOS owner: tooling
- Integration: PROVENANCE_ONLY
- Repo comparison: KIMI_ONLY
- Knowledge layers: STATIC KNOWLEDGE, PRODUCT IDENTITY, SCIENTIFIC EVIDENCE, POPULATION RESPONSE, APPLICABILITY, OBSERVATION COMPARISON, COMMUNITY INTELLIGENCE, RULE/Safety KNOWLEDGE, VISION KNOWLEDGE, RESEARCH/PROVENANCE

### warning_rules

- What: warning rules
- Contains: 174 records across 1 filesystem files and 5 archive entries.
- Completeness: 34 populated-field coverage entries calculated; see JSON for full field matrix.
- LumeOS owner: supplements.rule_catalog
- Integration: READY_WITH_NORMALIZATION
- Repo comparison: BOTH_KIMI_RICHER
- Knowledge layers: STATIC KNOWLEDGE, SCIENTIFIC EVIDENCE, APPLICABILITY, RULE/Safety KNOWLEDGE
