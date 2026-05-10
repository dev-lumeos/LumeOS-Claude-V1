# Codex Worker Bridge Smoke Test

This is a governance/docs-only smoke test for the Codex Worker Bridge.

No application feature work, Supabase command, migration execution, approval grant, runtime state edit, queue edit, or raw BLS commit was performed.

Generic bridge commands:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workers\codex-worker.ts --workorder <workorder-file> --dry-run
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workers\codex-worker.ts --workorder <workorder-file> --execute
```
