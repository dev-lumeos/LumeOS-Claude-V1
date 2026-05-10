# Project Profiles

## Purpose

Project profiles make the governance/control-plane reusable across repositories and product domains. The governance core should read project-specific roots, forbidden paths, raw-data rules, product gates, and Codex Worker policy from configuration instead of hardcoding LumeOS or Nutrition assumptions.

The default active profile is `lumeos`.

## Profile Files

Profile schema:

```text
system/project-profiles/project-profile.schema.json
```

Default profile:

```text
system/project-profiles/profiles/lumeos.json
```

Future project placeholder:

```text
system/project-profiles/profiles/example-beauty-club.json.example
```

The Beauty Club file is a skeleton only. It is not active and does not assume a repo path.

## Required Fields

Each profile defines:

- `project_id`
- `display_name`
- `repo_root`
- `profile_version`
- `governance_root`
- `specs_root`
- `workorders_root`
- `reports_root`
- `memory_root`
- `learning_root`
- `runtime_state_root`
- `approval_root`
- `raw_data_paths`
- `ignored_local_paths`
- `product_gate`
- `forbidden_paths`
- `forbidden_commands`
- `required_checkers`
- `default_operator_batch`
- `default_branch_prefix`
- `promotion_policy`
- `codex_worker_policy`

## LumeOS Defaults

The LumeOS profile keeps the current governance behavior:

- `project_id`: `lumeos`
- `display_name`: `LumeOS`
- `repo_root`: `D:/GitHub/LumeOS-Claude-V1`
- `specs_root`: `docs/specs`
- `workorders_root`: `system/workorders`
- `reports_root`: `system/reports`
- raw local data: `docs/specs/Nutrition/00_raw/`
- Codex Worker: enabled only for `senior-coding-agent` with explicit workorder opt-in
- product gate: closed

## Product Gate

The profile owns the product-gate reason and whether conditional planning is allowed. For LumeOS:

- product work is not freely open
- BLS/Nutrition import execution remains blocked
- raw BLS files remain local-only
- Supabase `db push`, `db reset`, and migration execution remain forbidden

## Profile-Aware Commands

These commands now accept `--project <id>`:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\governance-invariant-check.ts --json --project lumeos
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\spec-source-chain-check.ts <workorder-file> --json --project lumeos
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\spec-source-chain-check.ts --batch <batch-file> --json --project lumeos
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\batch-dossier.ts --batch <batch-file> --json --project lumeos
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\promotion-governance.ts --review-branch <branch> --json --project lumeos
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts <batch-file> --status --project lumeos
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts <batch-file> --doctor --json --project lumeos
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workers\codex-worker.ts --workorder <workorder-file> --dry-run --project lumeos
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\governance-learning-check.ts --json --project lumeos
```

The Governance UI defaults to the LumeOS profile, includes `--project lumeos` for supported commands, and displays the active profile details in Settings.

## Global vs Profile-Specific

Profile-specific:

- repo roots and governance roots
- raw local paths
- forbidden paths and commands
- product gate wording and state
- default operator batch
- Codex Worker policy
- promotion artifact policy

Still global for now:

- agent registry structure
- model routing file locations
- runtime state JSON shape
- approval queue/token schema
- stop-rule semantics
- most operator lifecycle state

## Adding A Future Project

1. Copy `example-beauty-club.json.example` to a real profile JSON file.
2. Set `repo_root` to the actual repository.
3. Define project-specific raw data and forbidden paths.
4. Keep `product_gate.status` closed until Tom explicitly opens it.
5. Run the profile loader tests and profile-aware invariant/promotion checks.
6. Only then add UI selection or operator defaults for the new project.

## Migration Path

This first profile layer does not rewrite every governance tool. It introduces the loader and wires the safest read-only checks first:

- invariant checker raw/runtime artifact policy
- promotion forbidden/raw/product-gate policy
- spec-source checker product-gate reason
- batch dossier metadata and path classification
- batch operator and doctor profile reporting and profile-aware checker commands
- Codex Worker workorder path, forbidden path, raw local path, forbidden command, and prompt policy
- Governance UI Settings profile display and profile-aware command defaults
- governance learning checker project metadata

Remaining LumeOS/Nutrition references should be migrated incrementally when they affect portable governance behavior.

## Safety Rules

- Do not open a product gate by adding a profile.
- Do not make raw data commit-safe through a profile.
- Do not bypass runtime artifact protections.
- Do not use profiles to loosen Supabase or migration restrictions.
- Do not duplicate governance core for new projects.
