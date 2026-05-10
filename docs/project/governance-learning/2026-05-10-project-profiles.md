# Project Profiles Summary

Date: 2026-05-10

## Summary

Project Profiles add the first reusable configuration layer for the governance/control-plane system. The active default profile is `lumeos`, stored at `system/project-profiles/profiles/lumeos.json`.

## What Changed

- Added a validated project profile schema and loader.
- Added helpers for profile path resolution, forbidden path detection, runtime artifact detection, raw local path detection, and product-gate checks.
- Added a LumeOS profile with governance roots, raw BLS local paths, ignored runtime paths, forbidden paths, forbidden commands, required checkers, promotion policy, and Codex Worker policy.
- Added an inactive Beauty Club example skeleton without assuming a real external repo path.
- Made invariant, promotion, dossier, and source-chain commands accept `--project lumeos`.
- Exposed the active LumeOS profile in the Governance UI settings surface.

## Safety

- Product work remains closed unless Tom explicitly opens it.
- Raw BLS files remain local-only and must not be committed.
- Supabase reset, push, migration execution, production DB commands, approval auto-grants, runtime state edits, and queue edits remain forbidden.
- The profile layer classifies paths and policy. It does not execute work or grant permissions.

## Remaining Work

- Generalize deeper source-chain semantics beyond the Nutrition-specific LumeOS rules.
- Extend project-profile awareness into more operator surfaces where useful.
- Add a real profile for a future project only after Tom supplies its repo path and safety policy.
