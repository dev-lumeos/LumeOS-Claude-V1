# KIMI Orchestrator Backlog

## KIMI-INGEST-001 — Import provenance and source IDs
- Class: CODEX
- WHY: Provenance must exist before replacing or enriching Kimi facts.
- INPUTS: sources/conflicts datasets
- OUTPUTS: source tables or field-source rows
- DEPENDENCIES: None
- ACCEPTANCE CRITERIA: deterministic output, no silent drops, counts match manifest-derived expectations.

## KIMI-INGEST-002 — Normalize substance aliases and identifiers
- Class: CODEX
- WHY: Entity resolution depends on aliases, CAS, UNII, PubChem and InChIKey.
- INPUTS: substances + indexes
- OUTPUTS: deterministic alias/identifier import
- DEPENDENCIES: KIMI-INGEST-001
- ACCEPTANCE CRITERIA: deterministic output, no silent drops, counts match manifest-derived expectations.

## KIMI-INGEST-003 — Medication catalog widening
- Class: CODEX
- WHY: 498 medication substances exceed earlier imported subset.
- INPUTS: medications/*.jsonl
- OUTPUTS: active substances/formulations/products import plan
- DEPENDENCIES: KIMI-INGEST-001
- ACCEPTANCE CRITERIA: deterministic output, no silent drops, counts match manifest-derived expectations.

## KIMI-INGEST-004 — Lab marker and symptom graph schema
- Class: CODEX
- WHY: Lab markers, symptoms and biomarker explanations require a graph owner.
- INPUTS: evidence/lab/platform files
- OUTPUTS: schema proposal and importer
- DEPENDENCIES: KIMI-INGEST-001
- ACCEPTANCE CRITERIA: deterministic output, no silent drops, counts match manifest-derived expectations.

## KIMI-INGEST-005 — Rule runtime missing-input contract
- Class: CLAUDE
- WHY: Rules must surface missing input, not silently fail.
- INPUTS: platform rules and lab trigger index
- OUTPUTS: runtime contract updates
- DEPENDENCIES: KIMI-INGEST-002
- ACCEPTANCE CRITERIA: deterministic output, no silent drops, counts match manifest-derived expectations.

## KIMI-INGEST-006 — User-facing text layer from Kimi descriptions
- Class: FABLE
- WHY: Kimi has research; UI needs readable presentation.
- INPUTS: substance data and generated mapping
- OUTPUTS: UI-ready read model
- DEPENDENCIES: KIMI-INGEST-002
- ACCEPTANCE CRITERIA: deterministic output, no silent drops, counts match manifest-derived expectations.

## KIMI-INGEST-007 — Manual decisions for enhanced/legal display
- Class: MANUAL_DECISION
- WHY: Enhanced/PED legal and harm-reduction tone needs product decision.
- INPUTS: WADA/regulatory/enhanced datasets
- OUTPUTS: approved display boundary
- DEPENDENCIES: KIMI-INGEST-004
- ACCEPTANCE CRITERIA: deterministic output, no silent drops, counts match manifest-derived expectations.

## KIMI-INGEST-008 — Research follow-up for true gaps
- Class: KIMI
- WHY: Remaining null/unknown facts need external research, not guessing.
- INPUTS: KIMI_KNOWLEDGE_GAPS.md
- OUTPUTS: new crawl package
- DEPENDENCIES: KIMI-INGEST-001
- ACCEPTANCE CRITERIA: deterministic output, no silent drops, counts match manifest-derived expectations.
