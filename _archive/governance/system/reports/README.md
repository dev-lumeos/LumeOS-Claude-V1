# system/reports

Status: ACTIVE_CORE GENERATORS / GENERATED_EVIDENCE OUTPUTS

This folder mixes report generator code with generated report evidence. Keep
those roles separate.

## Active Report Generators

The TypeScript scripts at this level are `ACTIVE_CORE` governance tooling.
Examples:

- `batch-dossier.ts`
- `governance-learning-check.ts`
- `governance-learning-suggest.ts`
- `report-retention-summarizer.ts`
- `run-summary-generator.ts`
- `failed-wo-report.ts`
- `model-quality-report.ts`
- `morning-report.ts`
- `wo-dossier.ts`

These can be cited as active tooling and are covered by governance checks/tests.

## Generated Evidence

These folders contain generated outputs:

- `batches/`: batch dossiers and JSON/Markdown report outputs.
- `dossiers/`: generated dossier evidence.
- `runs/`: generated run summaries.
- `model-runtime-history/`: runtime check history.
- `codex-worker/`: Codex Worker reports.

Generated evidence can be useful for audit trails, but new generated outputs are
not automatically source files. Many are ignored by policy and should not be
committed unless a governed task explicitly promotes a redacted/durable report.

## Evidence Use

Safe to cite:

- committed dossiers or reports that are intentionally retained;
- generated ignored reports by path in a local handover when they support a
  current run;
- report generator scripts as active governance code.

Do not manually edit generated report outputs to change history. Regenerate
through official tools or create a separate correction note.

## Retention

See `docs/project/REPORT_RETENTION_POLICY.md` and
`docs/project/system-structure/SYSTEM_CLEANUP_PROPOSAL.md` before changing
retention or commit policy.
