# Operator Profile Integration Summary

Date: 2026-05-10

## Summary

Operator/Profile Deep Integration extends Project Profiles from read-only checker defaults into the core operator, doctor, Codex Worker, learning, and Governance UI surfaces.

## What Changed

- Batch Operator accepts and reports the active project profile when invoked with `--project lumeos`.
- Operator Doctor uses the profile for invariant/source-chain checks, product-gate reason, and JSON/Markdown profile metadata.
- Codex Worker accepts `--project`, validates workorders against the profile workorders root, blocks profile-forbidden/raw output paths, and includes profile identity, product gate, forbidden paths, raw local paths, and forbidden commands in generated prompts.
- Governance Learning Check can include active project profile metadata.
- Governance UI sends `--project lumeos` to supported commands and shows profile roots, product gate, raw data paths, forbidden commands, and Codex Worker policy in Settings.

## Safety

- Product work remains closed.
- Raw BLS files remain local-only.
- Supabase reset, push, migration execution, production DB commands, approval auto-grants, runtime state edits, and queue edits remain forbidden.
- Profiles can add restrictions and context. They cannot weaken global governance safety rules.

## Remaining Work

- Generalize deeper Nutrition-specific source-chain and factory semantics.
- Add safe project selection only when another real project profile exists.
- Continue removing LumeOS-specific documentation examples from generic operator docs where useful.
