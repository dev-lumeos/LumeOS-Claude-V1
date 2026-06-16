# IMPORT INVENTORY — LumeOS

project_id: lumeos
imported_at: 2026-06-09T11:07:32.891Z

## What this project is

Imported via PDR-1c CLI.

## Top-level structure

- [dir]  _tmp_inventory
- [dir]  .agents
- [dir]  .claude
- [dir]  .codex
- [file] .codex-governance-ui.log
- [file] .cursorrules
- [file] .env
- [file] .env.bak.preservicekey
- [file] .env.example
- [dir]  .git
- [file] .gitattributes
- [dir]  .github
- [file] .gitignore
- [dir]  .serena
- [file] AGENTS.md
- [dir]  apps
- [file] artefakt.json
- [file] backup_system.zip
- [file] CLAUDE.md
- [file] CLAUDE.md.v1.bak
- [file] COMMANDS.md
- [dir]  db
- [dir]  docs
- [dir]  infra
- [file] LEAN-CTX.md
- [dir]  node_modules
- [file] nul
- [file] package.json
- [dir]  packages
- [file] playwright.governance.config.ts
- [file] pnpm-lock.yaml
- [file] pnpm-workspace.yaml
- [file] README.md
- [dir]  services
- [file] services.zip
- [file] SESSION_ONBOARDING.md
- [file] STACK_REFERENCE.md
- [dir]  supabase
- [dir]  system
- [file] system.zip
- [dir]  temp
- [dir]  tmp
- [dir]  tools
- [file] tsconfig.json
- [file] turbo.json

## Repo facts

- has_git: true
- has_package_json: true
- has_docs_dir: true
- has_specs_dir: true
- existing_project_profile_json: false
- existing_docs_governance_scaffold: false
- total_files: 27228
- total_dirs: 8309

## File-type counts (excluding node_modules, .git)

- .md: 10430
- .jpg: 3777
- .mp4: 2353
- .py: 1758
- .patch: 1298
- .ts: 1064
- .jpeg: 895
- .json: 855
- .js: 799
- .tsx: 768
- (no-ext): 754
- .xsd: 312
- .txt: 305
- .ttf: 270
- .gz: 209
- .sh: 196
- .sql: 146
- .csv: 108
- .pack: 98
- .map: 75
- .png: 73
- .zst: 60
- .yaml: 58
- .rtf: 52
- .log: 51
- .backup: 40
- .yml: 36
- .ps1: 31
- .old: 29
- .xml: 27
- .css: 25
- .html: 25
- .ini: 24
- .example: 21
- .bak: 19
- .template: 17
- .bak2: 17
- .go: 12
- .zip: 11
- .xlsx: 11
- .pdf: 8
- .jsonl: 8
- .pyc: 8
- .jsx: 8
- .tsbuildinfo: 7
- .svg: 6
- .swift: 6
- .env: 6
- .java: 6
- .gz_: 6
- .cjs: 5
- .service: 4
- .ico: 4
- .toml: 3
- .cpp: 3
- .h: 3
- .dot: 3
- .webmanifest: 2
- .mjs: 2
- .mp3: 2
- .gif: 2
- .cast: 2
- .tape: 2
- .bat: 2
- .local: 2
- .docx: 2
- .preservicekey: 1
- .disabled: 1
- .tmpl: 1
- .cloud: 1
- .dev: 1
- .development: 1
- .graphml: 1

## Next steps

- Review this inventory: does the layout match what the governance assumes?
- Decide whether existing docs/specs become part of the project memory
  (separate, deliberate step — not part of this import).
- Open the project gate when product work should resume (product_gate is closed by default).
- Promotion requires a typecheck: declare promotion_policy.typecheck_command
  (e.g. "pnpm run typecheck") before opening for promotion. Until then,
  checkPromotionTypecheck will report BLOCKED.
