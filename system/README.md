# system

Status: MIXED ACTIVE CORE / SUPPORT / GENERATED EVIDENCE / PLACEHOLDER / ARCHIVE

This tree contains the governed execution system for LumeOS plus historical
reference material and generated evidence. Do not treat every folder here as
equally active.

Authoritative structure audit:

- `docs/project/system-structure/SYSTEM_TREE_AUDIT.md`
- `docs/project/system-structure/SYSTEM_DIRECTORY_CLASSIFICATION.json`
- `docs/project/system-structure/SYSTEM_CLEANUP_PROPOSAL.md`

## Active Core

- `agent-registry/`: agent definitions, routing, permissions, and tool
  authorization.
- `approval/`: approval queue and approval lifecycle tooling.
- `control-plane/`: dispatcher, validators, stop rules, SSOT checks, review
  pipeline, runtime checks, and governance gates.
- `project-profiles/`: project profile schema and LumeOS runtime/workorder
  configuration.
- `state/`: tool-managed runtime state, audit logs, and pipeline metrics.
- `workers/`: Codex Worker bridge and worker reports integration.
- `workorders/`: governed workorder schema, CLI, templates, and active or
  historical workorders.

## Active Support

- `memory/canonical/`: compact continuity memory used by governance checks.
- `model-tiers/`: runtime/model tier SSOT docs checked by SSOT consistency
  tooling.
- `policies/`, `prompts/`, `decomposition/`: policy, prompt, and decomposition
  references used by docs, factories, or governance design.

## Generated Evidence

- `reports/batches/`, `reports/dossiers/`, `reports/runs/`,
  `reports/codex-worker/`, and `reports/model-runtime-history/` contain
  generated outputs. Some generated files are useful evidence; new generated
  outputs should not be committed unless a governed task explicitly promotes
  them.

## Placeholder Or Historical Areas

- Placeholder examples include `graph/` and several `.gitkeep`-only
  subfolders under `memory/`, `prompts/`, `policies/`, and `decomposition/`.
- Historical/reference examples include older architecture, scheduler,
  branch-policy, file-group, workorder draft, and example folders.

## Cleanup Rule

No file move, delete, archive move, or runtime behavior change is authorized by
this README. Cleanup must follow the phased proposal and an explicit Tom
approval for any move/delete list.
