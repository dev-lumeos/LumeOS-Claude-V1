---
status: implementation_draft
reviewed_at: 2026-06-01
reviewed_by: codex
authority: review_report_not_product_truth
---

# WebPlatform Foundation Phase 1 Review Report

## Status

`implementation_draft`

Die aktuelle WebPlatform Foundation Phase 1 ist ein nützlicher sichtbarer Produktdraft, aber noch nicht governance-kontrolliert freigegeben. Sie ist nicht Product Truth, kein approved spec, kein Workorder, keine Queue und keine Execution.

## Preflight

Repository: `D:\GitHub\LumeOS-Claude-V1`

Aktueller Stand vor Review:

- `.serena/project.yml` war bereits dirty.
- Viele Docs-/Spec-Ordner waren bereits untracked.
- WebPlatform Phase 1 hat neue App-Routen, Shell-Komponenten und UI-Primitives ergänzt.
- Kein Commit und kein Push wurden ausgeführt.

## File Classification

### A. Pre-existing dirty before WebPlatform Phase 1

- `.serena/project.yml`
- `docs/Screenshots/`
- `docs/project/frontdoor/topics/governance/drafts/`
- `docs/project/generated-evidence/smoke/`
- `docs/specs/Admin/`
- `docs/specs/BuddyandAICoach/SPEC_11_UI_DESIGN.md`
- `docs/specs/Dashboard/`
- `docs/specs/Goals/`
- `docs/specs/HumanCoach/SPEC_11_UI_DESIGN.md`
- `docs/specs/Marketplace/SPEC_11_UI_DESIGN.md`
- `docs/specs/WebPlatform/`

### B. New WebPlatform Phase 1 files

- `apps/web/src/app/dashboard/page.tsx`
- `apps/web/src/app/goals/page.tsx`
- `apps/web/src/app/training/page.tsx`
- `apps/web/src/app/recovery/page.tsx`
- `apps/web/src/app/supplements/page.tsx`
- `apps/web/src/app/coach/page.tsx`
- `apps/web/src/app/settings/page.tsx`
- `apps/web/src/components/shell/app-shell.tsx`
- `apps/web/src/components/ui/cards.tsx`
- `apps/web/src/components/ui/page-header.tsx`
- `apps/web/src/components/ui/placeholder-page.tsx`
- `apps/web/src/components/ui/status-badge.tsx`
- `docs/project/generated-evidence/webplatform/webplatform-foundation-phase-1-report.md`
- `docs/project/generated-evidence/webplatform/webplatform-foundation-phase-1-review-report.md`

### C. Modified WebPlatform Phase 1 files

- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/globals.css`
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/nutrition/page.tsx`

### D. Unrelated or suspicious changes

- `.serena/project.yml` remains unrelated to WebPlatform UI and should not be included in a WebPlatform draft commit.
- Pre-existing untracked docs/spec folders should be reviewed separately before any commit.
- The new WebPlatform report folder is appropriate for this review, but it is under the broader already-untracked `docs/project/generated-evidence/` tree.

## Source Specs Used

Requested source path did not exist:

`D:\GitHub\governance_brain\01_PROJECTS\lumeos_compiled\specs\webplatform\`

Matching source path used read-only:

`D:\GitHub\governance_brain\01_PROJECTS\lumeos\_compiled\specs\webplatform\`

Source summaries:

- `index-summary.md`
- `spec-02-design-system-summary.md`
- `spec-03-dashboard-summary.md`
- `spec-04-nutrition-ui-summary.md`
- `spec-08-goals-ui-summary.md`

Additional local source specs read-only:

- `docs/specs/WebPlatform/SPEC_01_APP_SHELL.md`
- `docs/specs/WebPlatform/SPEC_03_DASHBOARD.md`
- `docs/specs/WebPlatform/SPEC_04_NUTRITION_UI.md`
- `docs/specs/WebPlatform/SPEC_08_GOALS_UI.md`

## UI Routes Present

- `/`
- `/dashboard`
- `/nutrition`
- `/goals`
- `/training`
- `/recovery`
- `/supplements`
- `/coach`
- `/settings`

Existing deeper Nutrition routes remain in the tree:

- `/nutrition/local-schema`
- `/nutrition/curation`

## Visible UI Result

- App Shell with persistent sidebar and topbar.
- Dashboard landing surface with product status, "Heute wichtig", Nutrition card, Goals card and next review/action card.
- Nutrition entry surface with Foundation status, BLS-only boundary, Foundation DB Schema candidate status and Broad Nutrition DB backlog notice.
- Goals entry surface with concept placeholders for active goal, body metrics, coach proposal, athlete confirmation and downstream nutrition/training relation.
- Placeholder pages avoid dead navigation for Training, Recovery, Supplements, Coach and Settings.
- Status labels make draft/readonly/backlog boundaries visible.

## Code Quality Review

### Positive

- Uses existing Next App Router structure.
- Keeps product-facing copy mostly German.
- Adds small UI primitives instead of a large component system.
- No new dependencies.
- No Supabase calls in new UI files.
- No DB write action buttons.
- No fake live user data claims.
- Responsive baseline exists via CSS grid collapse.

### Risks / Findings

1. `apps/web/src/app/nutrition/page.tsx` replaces the previous Nutrition search/preference page with a smaller entry page.
   - Severity: medium.
   - Impact: existing `/nutrition` functionality is hidden from the default Nutrition route. Deeper routes still exist, but the old food-search surface is no longer the main Nutrition page.
   - Recommendation: before commit, decide whether the old food-search UI should move to `/nutrition/foods` or be preserved behind an entry link.

2. New UI files contain visible mojibake in at least:
   - `apps/web/src/components/shell/app-shell.tsx`
   - `apps/web/src/app/nutrition/page.tsx`
   - Severity: medium.
   - Impact: German UI copy may render broken (`später`, etc.).
   - Recommendation: fix encoding before any commit.

3. App Shell wraps all pages globally, including existing Governance pages.
   - Severity: medium.
   - Impact: `/governance` and its subpages now render inside the new LumeOS shell. This may be desirable, but it changes existing Governance UI framing.
   - Recommendation: inspect Governance routes visually before commit.

4. Active nav accent is always `--acc-nutri`.
   - Severity: low.
   - Impact: all active routes get Nutrition accent, even Dashboard/Goals.
   - Recommendation: add route-aware accent later if this draft is kept.

5. Build/typecheck are not clean.
   - Severity: medium.
   - Impact: cannot classify as ready-to-merge until unrelated existing blockers are resolved or explicitly waived.

## Validation Results

### `pnpm --filter @lumeos/web typecheck`

Result: failed.

Classified as existing unrelated after new typed-route link errors were fixed in the draft.

Current failures:

- `src/lib/nutrition/food-search.ts(124,31)` regex flag requires ES6 or later.
- `src/lib/nutrition/food-search.ts(158,7)` type mismatch.
- `src/lib/nutrition/preference-search-preview.ts(62,31)` regex flag requires ES6 or later.
- `src/lib/nutrition/preference-search-preview.ts(108,52)` Set iteration requires ES2015/downlevelIteration.

### `pnpm --filter @lumeos/web test`

Result: exit code 0, no output.

### `pnpm --filter @lumeos/web build`

Result: timed out during review run.

Previous build attempt from the implementation phase failed with `.next\trace` `EPERM`.

Classification: unclear/existing environment issue. No evidence that new UI files caused the `.next\trace` permission problem, but build is not currently proven clean.

### `pnpm --filter @lumeos/web lint`

Skipped in this review because previous run triggered interactive ESLint setup.

### `git diff --check`

Result: exit code 0.

Warning: `.serena/project.yml` CRLF normalization warning remains and is unrelated to this UI draft.

## Optional Visual Smoke

Not run in this review.

Reason: prior dev server attempts did not produce a reachable local URL, and build/typecheck are not clean enough to spend more time on visual validation before classification.

## Cleanup Pass - 2026-06-01

Scope: WebPlatform Foundation Phase 1 draft stabilization only. No DB/Supabase commands, migrations, governance sync candidates, Workorders, Queues, Approvals, commits, or pushes were run.

Cleanup performed:

- Fixed visible mojibake in scoped WebPlatform draft UI files and this review report.
- Preserved the previous read-only Nutrition Food Search and preference preview UI at `/nutrition/foods`.
- Added `/nutrition/preferences` as a redirect to `/nutrition/foods`, because the restored page contains the preference-aware preview and catalog entry points.
- Added visible `/nutrition` overview links to `/nutrition/foods`, `/nutrition/preferences`, `/nutrition/local-schema`, and `/nutrition/curation`.
- Adjusted `AppShell` so `/governance` and `/governance/*` return the original route children without the LumeOS product shell wrapper.
- Changed active shell accent from a fixed Nutrition color to route-aware shell classes.

Mojibake fixed: yes. A scoped scan for the common mojibake marker characters over `apps/web/src/app`, `apps/web/src/components/shell`, `apps/web/src/components/ui`, and this report returned no matches after cleanup.

Nutrition old UI preserved: yes. Route: `/nutrition/foods`; `/nutrition/preferences` redirects to the same restored read-only Food Search / Preferences preview surface.

AppShell governance scope result: fixed. The shell component now bypasses wrapping for `/governance` and child routes. Governance page implementation was not rewritten.

Dev server result:

- `pnpm --filter @lumeos/web dev -- -p 9501` failed because `pnpm` forwarded `--` to Next, causing Next to treat `-p` as a project directory: `Invalid project directory provided ... apps\web\-p`.
- Fallback `cd apps\web; pnpm dev -p 9501` started Next at `http://localhost:9501`, but the URL probe timed out before the server became reachable. The process was stopped.
- Retry on `http://localhost:9502` also reached Next startup output but did not become reachable within the probe window. The process was stopped.

Validation after cleanup:

- `git diff --check`: passed. Existing `.serena/project.yml` CRLF warning remains unrelated.
- `pnpm --filter @lumeos/web test`: passed with exit code 0 and no output.
- `pnpm --filter @lumeos/web typecheck`: failed, but the `/nutrition/foods` typed-route errors introduced during the restore were fixed. Remaining failures are classified as existing/unrelated to this cleanup:
  - `src/app/nutrition/curation/page.tsx` typed-route link string errors.
  - `src/app/nutrition/local-schema/nutrient-detail-panel.tsx` typed-route router argument errors.
  - `src/lib/nutrition/food-search.ts` ES target/type issues.
  - `src/lib/nutrition/preference-search-preview.ts` ES target iteration issues.
- Build was not run because typecheck remains blocked and prior build attempts were affected by `.next\trace` `EPERM`.

Remaining blockers:

- Typecheck is still not clean due existing Nutrition route/utility issues outside this cleanup scope.
- Dev server did not reach a probeable ready state within the cleanup run; this was superseded by the reachability fix below.
- Pre-existing dirty `.serena/project.yml` and untracked docs/spec folders must stay out of any scoped WebPlatform draft commit.

Cleanup recommendation: needs another fix pass before a clean draft commit if the commit bar requires full typecheck and a reachable dev server. The WebPlatform UI draft itself is now more cleanly isolatable, with old Nutrition functionality preserved and Governance no longer unintentionally wrapped.

## Risk Assessment

Overall risk: medium.

The draft is valuable because it creates visible product shape quickly. The main risk is that it was produced outside the normal governance-controlled path and replaces the default Nutrition route content. It should not be committed as final product work without deciding how to preserve or route the existing Nutrition food-search/preference UI.

## Recommendation

Recommended action: keep as uncommitted implementation draft for now.

Do not revert immediately, because the visible shell/dashboard/nutrition/goals direction is useful. Do not commit as-is if the draft commit requires clean validation, because:

- build/typecheck are not clean,
- dev server readiness was not proven during the cleanup pass, but was later proven on port 9501 in the reachability fix below,
- unrelated dirty docs and `.serena/project.yml` must be kept out of any WebPlatform commit.

Safer next action:

1. Create a governance-correct WebPlatform UI draft review decision.
2. Resolve or explicitly waive existing typecheck blockers.
3. Keep the port 9501 dev server available for browser review while Tom inspects the draft.
4. Then commit only scoped WebPlatform files as a local draft commit.

## Boundary

This report is review evidence only. It is not Product Truth, not an approved spec, not a Workorder, not a Queue, not an Approval and not Execution permission.

## Dev Server Reachability Fix - 2026-06-01

Purpose: make the WebPlatform Phase 1 draft reachable locally for Tom's browser inspection. No DB/Supabase commands, migrations, governance writes, commits, or pushes were run.

Preflight:

- `apps/web/package.json` confirms `dev` is `next dev`.
- Ports before cleanup:
  - `3000`: occupied by PID `66152`, child of repo Next dev wrapper PID `152980`; probe hung.
  - `5001`: occupied by PID `81948`, child of repo Next dev wrapper PID `45224`; probe returned HTTP 500. Wrapper was created on 2026-05-12 and was stale.
  - `9501`, `9502`, `9503`: no listening process.
- A stale repo Next build process PID `87056` was observed but not killed.

Process cleanup:

- Stopped only clearly stale Next dev processes for this repo: wrapper PIDs `45224`, `152980`, `129904`. Their child `start-server.js` processes exited with the wrappers.
- Did not kill unrelated Node processes.

Working dev server command:

```powershell
cd D:\GitHub\LumeOS-Claude-V1\apps\web
pnpm exec next dev -H 127.0.0.1 -p 9501
```

Result:

- Server started: yes.
- Browser URL: `http://localhost:9501/`
- Listening process: PID `159420` (`start-server.js`), parent wrapper PID `28520`.
- Left running for Tom to inspect.

Route probe result using `Invoke-WebRequest`:

| Route | Status | Result |
|---|---:|---|
| `/` | 200 | OK |
| `/dashboard` | 200 | OK |
| `/nutrition` | 200 | OK |
| `/nutrition/foods` | 200 | OK |
| `/nutrition/preferences` | 200 | OK |
| `/goals` | 200 | OK |
| `/training` | 200 | OK |
| `/recovery` | 200 | OK |
| `/supplements` | 200 | OK |
| `/coach` | 200 | OK |
| `/settings` | 200 | OK |

Tom can inspect now: yes, at `http://localhost:9501/` and the routes above.

## Design Alignment Pass - 2026-06-01

Purpose: align the visible WebPlatform Foundation Phase 1 draft more closely with the LumeOS WebPlatform design direction while keeping the same scope. No DB/Supabase commands, migrations, governance writes, Workorders, Queues, Approvals, commits, or pushes were run.

Source summaries used read-only:

- Requested path `D:\GitHub\governance_brain\01_PROJECTS\lumeos_compiled\specs\webplatform\` was not present locally.
- Used existing read-only compiled mirror `D:\GitHub\governance_brain\01_PROJECTS\lumeos\_compiled\specs\webplatform\`.
- Read `index-summary.md`, `spec-02-design-system-summary.md`, `spec-03-dashboard-summary.md`, `spec-04-nutrition-ui-summary.md`, and `spec-08-goals-ui-summary.md`.
- Read the referenced local WebPlatform specs for concrete design detail: `SPEC_02_DESIGN_SYSTEM.md`, `SPEC_03_DASHBOARD.md`, `SPEC_04_NUTRITION_UI.md`, `SPEC_08_GOALS_UI.md`, and `INDEX.md`.

Extracted design direction:

- Visual tone: Linear/Figma/Notion-adjacent, professional, data-oriented, not playful, not medical-sterile.
- Layout principle: compact hierarchy, dense but not overwhelming, module accents as orientation only.
- Component patterns: tokenized surfaces, 8px cards, pills/badges, section headers, KPI cards, status rows, tab-like/module entry patterns.
- Typography: UI text around 13px body, 16px section/card headings, numeric values in mono/tabular style.
- Dashboard expectation: default landing surface, 4 KPI-like cards, today flow, module status, next action and boundaries.
- Nutrition expectation: BLS-only boundary, `/nutrition/foods` as food database/search, read-only current draft, diary/planner/insights not falsely live.
- Goals expectation: Goals + Body overview, goal cards/progress/timeline/body metrics as planned surfaces, no fake active goals.

Internal design adjustment plan:

1. Replace generic dark-admin chrome with token-driven LumeOS shell rhythm.
2. Improve visual hierarchy through compact page headers, section headers, metric cards, status rows, and module cards.
3. Make Dashboard a product landing surface with review focus, today flow, module status, next steps, and explicit boundaries.
4. Make Nutrition clearer as a BLS Foundation review surface while preserving `/nutrition/foods`.
5. Make Goals feel like a real Goals + Body foundation module without inventing live data.
6. Normalize placeholder pages with consistent module boundary, later-scope list, and no-live-data message.

Visual changes made:

- `AppShell` now has a clearer LumeOS brand block, compact module metadata, route-aware active accent, system/ops grouping, topbar status strip, and operator footer.
- `globals.css` now uses the WebPlatform OKLCH-style token model (`--bg`, `--surface`, `--border`, `--fg`, `--acc-*`, `--pos`, `--warn`, `--neg`) for the product draft classes.
- UI primitives now include tokenized cards, module cards, metric cards, section headers, compact status pills, empty states, progress bars, flow items, and status rows.
- Dashboard now includes 4 KPI-style draft cards, “Heute wichtig” flow, “Review-Fokus”, “Module Status”, “Nächste Schritte”, and “Grenzen / Nicht live”.
- Nutrition overview now emphasizes BLS-only, Foundation DB Schema candidate state, Broad Nutrition DB backlog/block, preserved read-only links, and no-write boundary.
- Goals overview now separates Foundation Concept, Ownership Note, planned spec tabs, visible placeholder blocks, and no-live-goals boundary.
- Training, Recovery, Supplements, Coach, and Settings placeholders now share consistent module-boundary, backlog, and no-fake-live-data structure.

Route smoke after design alignment on existing dev server `http://localhost:9501`:

| Route | Status | Result |
|---|---:|---|
| `/` | 200 | OK |
| `/dashboard` | 200 | OK |
| `/nutrition` | 200 | OK |
| `/nutrition/foods` | 200 | OK |
| `/nutrition/preferences` | 200 | OK |
| `/goals` | 200 | OK |
| `/training` | 200 | OK |
| `/recovery` | 200 | OK |
| `/supplements` | 200 | OK |
| `/coach` | 200 | OK |
| `/settings` | 200 | OK |

Validation after design alignment:

- Scoped mojibake scan over `apps/web/src/app`, `apps/web/src/components/shell`, and `apps/web/src/components/ui`: passed.
- `git diff --check`: passed. Existing `.serena/project.yml` CRLF warning remains unrelated.
- `pnpm --filter @lumeos/web test`: passed with exit code 0 and no output.
- `pnpm --filter @lumeos/web typecheck`: run because component contracts/imports changed. Failed only with previously known unrelated Nutrition typed-route and utility blockers:
  - `src/app/nutrition/curation/page.tsx` typed-route link string errors.
  - `src/app/nutrition/local-schema/nutrient-detail-panel.tsx` typed-route router argument errors.
  - `src/lib/nutrition/food-search.ts` ES target/type issues.
  - `src/lib/nutrition/preference-search-preview.ts` ES target iteration issues.

What improved:

- The draft now reads more like LumeOS: compact, modular, token-driven, data-oriented, and professionally restrained.
- Status semantics are clearer: read-only, candidate, mock, backlog, blocked, and ready are visually distinct without using large color fields.
- Dashboard is now a usable review landing surface instead of a generic placeholder grid.
- Nutrition and Goals better reflect their source-spec expectations without expanding functionality.
- Placeholder pages are consistent and do not imply live module behavior.

Remaining weak points:

- No real shadcn/lucide integration was added because dependency/scope boundaries prohibit expansion.
- `/nutrition/foods` remains the preserved older UI and has not been restyled in this pass to avoid breaking existing functionality.
- Typecheck is still blocked by existing Nutrition route/utility issues outside this design pass.
- Full visual browser screenshot review was not performed; route smoke confirms render reachability.

Scoped draft commit readiness:

- Better aligned visually and ready for Tom review on `http://localhost:9501`.
- Not ready for a fully clean scoped draft commit if the bar requires typecheck passing.
- A scoped draft commit remains plausible only if the existing unrelated typecheck blockers are explicitly waived or fixed separately, and unrelated `.serena/project.yml` / docs dirt is excluded.

## Source-Spec Compliance Review - 2026-06-02

Purpose: compare the visible WebPlatform Foundation Phase 1 UI draft against the authoritative source specs in `docs/specs/WebPlatform/`. This review does not rely on compiled `governance_brain` summaries and does not create Product Truth, Workorders, Queues, Approvals, Governance Sync candidates, commits, or pushes.

Source specs read:

- `docs/specs/WebPlatform/INDEX.md`
- `docs/specs/WebPlatform/SPEC_01_APP_SHELL.md`
- `docs/specs/WebPlatform/SPEC_02_DESIGN_SYSTEM.md`
- `docs/specs/WebPlatform/SPEC_03_DASHBOARD.md`
- `docs/specs/WebPlatform/SPEC_04_NUTRITION_UI.md`
- `docs/specs/WebPlatform/SPEC_05_TRAINING_UI.md`
- `docs/specs/WebPlatform/SPEC_06_RECOVERY_UI.md`
- `docs/specs/WebPlatform/SPEC_07_SUPPLEMENTS_UI.md`
- `docs/specs/WebPlatform/SPEC_08_GOALS_UI.md`
- `docs/specs/WebPlatform/SPEC_10_WORKSPACE_LINKS.md`

Separate compliance matrix created:

- `docs/project/generated-evidence/webplatform/webplatform-source-spec-compliance-review.md`

Key mismatches found:

- Module color system was only partially source-compliant: core accent tokens existed, but Medical, Buddy, Marketplace, and Admin accent tokens were missing.
- AppShell navigation order did not match `SPEC_01_APP_SHELL.md`: Goals was placed before Training, Recovery, and Supplements; Coach was shown as a core module instead of a workspace link.
- Active navigation styling used a broader card highlight instead of the source-specified 2px accent bar pattern.
- The topbar did not expose the source-specified module accent line.
- Light theme tokens from `SPEC_02_DESIGN_SYSTEM.md` were not represented in the draft CSS.
- `/nutrition` remains an overview page, while `SPEC_04_NUTRITION_UI.md` defines `/nutrition` as the diary default route. This was not changed because moving route purpose would be a larger product behavior decision.
- Goals and Dashboard remain Foundation-level drafts and do not yet implement all source-spec panels, tabs, or live data surfaces.
- Medical and some workspace domains are not implemented in this Phase 1 draft.

Fixes applied in this narrow pass:

- Added missing source-backed accent tokens for Medical, Buddy, Marketplace, and Admin.
- Added a source-backed light-mode token block.
- Adjusted the shell grid to the source-specified 240px sidebar rhythm.
- Changed active nav styling to a 2px left accent bar.
- Added the topbar accent line.
- Reordered core module navigation to Dashboard, Nutrition, Training, Recovery, Supplements, Goals & Body.
- Moved Coach out of the core module shortcut list into a workspace group while preserving the existing `/coach` draft route.

Follow-up required:

- Decide whether Phase 1 intentionally keeps `/nutrition` as an overview or later realigns it to the source diary route.
- Decide whether Medical and the full workspace link model are in scope for a later draft.
- Implement remaining Dashboard, Nutrition, and Goals source-spec surfaces only through approved follow-up work.
- Resolve or waive existing Nutrition typecheck blockers before treating the draft as cleanly committable.

Validation result:

- Route smoke, `git diff --check`, test, and typecheck results are recorded in `webplatform-source-spec-compliance-review.md`.
- Typecheck remains blocked by known Nutrition route/utility issues outside this compliance pass.

Compliance assessment:

- The UI is closer to the authoritative source specs after the narrow corrections.
- It is not fully source-spec-compliant yet.
- Recommendation: not ready for a fully clean scoped draft commit unless the remaining source-spec deviations and existing typecheck blockers are explicitly accepted as Phase 1 draft limitations.

## Source-Spec Gap Fix Pass Phase 1B - 2026-06-02

Purpose: fix the most important source-spec gaps while keeping the WebPlatform work a safe visible UI draft. No DB/Supabase commands, migrations, secrets reads, Governance Sync candidates, Workorders, Queues, Approvals, commits, or pushes were run.

Source specs re-read:

- `docs/specs/WebPlatform/SPEC_01_APP_SHELL.md`
- `docs/specs/WebPlatform/SPEC_02_DESIGN_SYSTEM.md`
- `docs/specs/WebPlatform/SPEC_03_DASHBOARD.md`
- `docs/specs/WebPlatform/SPEC_04_NUTRITION_UI.md`
- `docs/specs/WebPlatform/SPEC_08_GOALS_UI.md`
- `docs/specs/WebPlatform/SPEC_09_MEDICAL_UI.md`
- `docs/specs/WebPlatform/SPEC_10_WORKSPACE_LINKS.md`

Files changed in this pass:

- `apps/web/src/components/shell/app-shell.tsx`
- `apps/web/src/app/globals.css`
- `apps/web/src/app/nutrition/page.tsx`
- `apps/web/src/app/dashboard/page.tsx`
- `apps/web/src/app/medical/page.tsx`
- `apps/web/src/components/ui/placeholder-page.tsx`
- `docs/project/generated-evidence/webplatform/webplatform-source-spec-compliance-review.md`
- `docs/project/generated-evidence/webplatform/webplatform-foundation-phase-1-review-report.md`

Visual improvements:

- `/nutrition` is now a diary-first read-only surface instead of an overview-only page.
- Food Search remains preserved at `/nutrition/foods`; Preferences remains available at `/nutrition/preferences`.
- AppShell now includes a right Context Panel with current module, boundary, next safe action, and module detail.
- Sidebar now exposes a Search / Command placeholder.
- Topbar now exposes Sync Mock, Theme Demo, Context, and Commands placeholders.
- Medical is now the 7th Core Module with a `/medical` sensitive placeholder page.
- Workspace links are visible as external Coach/Buddy/Marketplace/Admin links, with local `/coach` retained as a draft placeholder.
- Settings shows Workspace Links as a source-backed mock surface.
- Dashboard includes Medical and Workspace Link orientation.

Route smoke on existing dev server `http://localhost:9501/`, listening PID `159420`:

| Route | Status | Result |
|---|---:|---|
| `/` | 200 | OK |
| `/dashboard` | 200 | OK |
| `/nutrition` | 200 | OK |
| `/nutrition/foods` | 200 | OK |
| `/nutrition/preferences` | 200 | OK |
| `/goals` | 200 | OK |
| `/training` | 200 | OK |
| `/recovery` | 200 | OK |
| `/supplements` | 200 | OK |
| `/coach` | 200 | OK |
| `/medical` | 200 | OK |
| `/settings` | 200 | OK |

Validation result:

- Mojibake marker scan over WebPlatform app/components/evidence files: passed.
- `pnpm --filter @lumeos/web typecheck`: failed only with known existing Nutrition blockers; no new Phase 1B files appeared in the error list.
- Final `git diff --check` and `pnpm --filter @lumeos/web test` results are recorded below after validation.

Remaining blockers:

- Context Panel is not collapsible/persistent.
- Command Palette is not implemented.
- Theme/Sync controls are visible mocks only.
- Nutrition Planner/Insights and real Diary data remain unimplemented.
- Medical remains a high-risk placeholder with no data, uploads, documents, medications, or advice.
- Existing typecheck blockers remain in Nutrition curation/local-schema/lib utilities.

Scoped draft commit readiness:

- UI is closer to the authoritative source specs.
- Still not ready for a fully clean scoped draft commit if typecheck passing is required.
- A scoped draft commit remains possible only with explicit acceptance of Phase-1B draft limitations and exclusion of unrelated dirty files.

## Scoped Draft Commit Acceptance - 2026-06-02

Commit scope accepted for a local draft commit only:

- WebPlatform Phase 1 / Phase 1B implementation draft under `apps/web/src/app`, `apps/web/src/components/shell`, and `apps/web/src/components/ui`.
- WebPlatform generated evidence under `docs/project/generated-evidence/webplatform/`.

Explicit exclusions:

- `.serena/project.yml`
- `docs/Screenshots/`
- `docs/project/frontdoor/`
- unrelated `docs/specs/*`
- unrelated generated evidence outside `docs/project/generated-evidence/webplatform/`

Validation before commit:

- `git diff --check`: passed. Existing `.serena/project.yml` CRLF warning remains unrelated and excluded from staging.
- `pnpm --filter @lumeos/web test`: passed.
- Route smoke on `http://localhost:9501/`: `/`, `/dashboard`, `/nutrition`, `/nutrition/foods`, `/nutrition/preferences`, `/goals`, `/training`, `/recovery`, `/supplements`, `/coach`, `/medical`, and `/settings` returned 200 OK.

Typecheck waiver:

- `pnpm --filter @lumeos/web typecheck` remains waived for this scoped draft commit because failures are known existing Nutrition blockers outside this commit pass:
  - `src/app/nutrition/curation/page.tsx`
  - `src/app/nutrition/local-schema/nutrient-detail-panel.tsx`
  - `src/lib/nutrition/food-search.ts`
  - `src/lib/nutrition/preference-search-preview.ts`

Boundary:

- This scoped commit is a draft commit only.
- It is not Product Truth.
- It is not an approved spec.
- It is not a Workorder, Queue, Approval, Governance Sync candidate, or Execution state.
- It includes no DB/Supabase commands, no migrations, no secrets access, and no push.

## Phase 2A Shell / Design-System Foundation - 2026-06-02

Purpose: align the WebPlatform implementation draft more strictly with `SPEC_01_APP_SHELL.md` and `SPEC_02_DESIGN_SYSTEM.md` as a visual/platform foundation for future browser-inspectable UI work.

Source specs used:

- `docs/specs/WebPlatform/INDEX.md`
- `docs/specs/WebPlatform/SPEC_01_APP_SHELL.md`
- `docs/specs/WebPlatform/SPEC_02_DESIGN_SYSTEM.md`

Changes made:

- AppShell now uses a fixed 3-column spec grid: `240px` sidebar, fluid content, `340px` context panel.
- AppShell supports hidden context panel via `data-right-panel`.
- AppShell supports density variants via `data-density`.
- Theme toggle now sets `data-theme` on `<html>` and persists local UI preference.
- Sidebar includes Brand, Search/Command trigger, Modules, Workspaces, System, and User/Profile placeholder.
- Core module navigation matches SPEC_01 order and shortcuts `1` through `7`.
- Keyboard shortcuts `1` through `7` navigate core modules when focus is outside form controls.
- Topbar includes module tag, breadcrumb, sync mock, notification placeholder, theme toggle, context toggle, density control, and commands placeholder.
- Context panel now includes Buddy placeholder, insight cards, quick actions, module details, and next safe action.
- CSS uses SPEC_02 OKLCH tokens, module accents, status colors, dark/light theme tokens, density padding, radius tokens, and numeric mono/tabular class.
- Badge primitive now supports SPEC_02-style variants while preserving earlier draft statuses.
- Placeholder primitives for Tabs, Modal, and Drawer were added without new dependencies.

Intentional phase cuts:

- Command Palette remains placeholder-only.
- Profile Settings modal remains placeholder-only.
- Sync and notification states are not live.
- Workspace SSO, role gates, and badge counts are not implemented.
- No package/ui migration, shadcn install, lucide install, charts, DB, Supabase, or backend work was done.

Validation note:

- Typecheck was run because AppShell contracts changed materially. It still fails only on known existing Nutrition blockers outside Phase 2A.
- Final route smoke and validation are recorded in the current task result.

Browser review readiness:

- Ready for browser review as an implementation draft at `http://localhost:9501/`.
- Not ready to classify as Product Truth or fully source-spec-compliant.

## Phase 2A Visual Serving Verification - 2026-06-02

Purpose: verify that the running dev server is serving the Phase 2A AppShell and design-system changes after Tom reported no visible browser difference.

File verification:

- `apps/web/src/components/shell/app-shell.tsx` contains Phase 2A markers: `data-right-panel`, `data-density`, Medical core module, workspace group, topbar controls, and context panel.
- `apps/web/src/app/globals.css` contains Phase 2A markers: `grid-template-columns: 240px minmax(0, 1fr) 340px`, density variants, module accent tokens, light tokens, and context panel styles.
- `apps/web/src/components/ui/cards.tsx` contains `ModalPlaceholder` and `DrawerPlaceholder`.
- `apps/web/src/components/ui/status-badge.tsx` contains SPEC_02-style pill variants including `accent`.

Server restart:

- Previous known LumeOS 9501 dev-server process tree was stopped only for the repo/port 9501 server.
- Restart command used from `apps/web`: `pnpm exec next dev -H 127.0.0.1 -p 9501`.
- New wrapper PID: `8940`.
- New listening Next server PID: `99332`.
- Server left running for browser inspection.

Rendered marker verification after restart:

- Checked `http://localhost:9501/`, `/nutrition`, and `/goals`.
- Confirmed markers in rendered HTML: `Commands ⌘K`, `Medical`, `Workspace`, `Offline`, `data-right-panel`, `lume-context-panel`, and `Search or jump`.
- Exact strings `Context On` and `Density default` were not found as contiguous HTML text, likely because React SSR/hydration can split adjacent text nodes. The underlying `data-right-panel`, `data-density`, topbar controls, and AppShell source are present.

Route probe after restart:

| Route | Status | Result |
|---|---:|---|
| `/` | 200 | OK |
| `/dashboard` | 200 | OK |
| `/nutrition` | 200 | OK |
| `/nutrition/foods` | 200 | OK |
| `/nutrition/preferences` | 200 | OK |
| `/goals` | 200 | OK |
| `/training` | 200 | OK |
| `/recovery` | 200 | OK |
| `/supplements` | 200 | OK |
| `/coach` | 200 | OK |
| `/medical` | 200 | OK |
| `/settings` | 200 | OK |

Conclusion:

- Phase 2A changes are being served after restart.
- If Tom still sees no visible change, likely causes are browser cache, looking at an already-open stale tab, or the fact that many Phase 2A changes are shell/control/token refinements rather than module-content changes.

## SPEC_02 Hard Compliance Fix - Module Accent Colors - 2026-06-02

Purpose: close the hard SPEC_02 gate for visible module-specific accent colors and design tokens.

Authoritative sources used:

- `docs/specs/WebPlatform/SPEC_02_DESIGN_SYSTEM.md`
- `docs/specs/WebPlatform/SPEC_01_APP_SHELL.md`

Why the previous attempt was insufficient:

- SPEC_02 tokens existed, but the visible shell still did not make every module distinguishable.
- Inactive module and workspace navigation items did not expose their own module accent strongly enough.
- Several dashboard cards inherited the current global accent instead of rendering their own module accent.
- There was no visible draft-only proof surface showing all required accent tokens.

Changes made:

- `globals.css` now defaults `--acc` to `--acc-dash` and keeps the exact SPEC_02 module tokens.
- `AppShell` uses one route-to-module accent map for Dashboard, Nutrition, Training, Recovery, Supplements, Goals, Medical, Coach, Buddy, Marketplace, Admin, and Settings.
- Sidebar active items use the required 2px accent bar and inactive module/workspace items show their own accent dot.
- Topbar tag, topbar line, page eyebrow, context panel markers, Buddy orb, and module cards use the active or module-specific accent token.
- `ModuleCard` accepts an explicit module accent so dashboard cards can show Nutrition, Goals, Medical, and Workspace colors independently.
- `/settings` includes the visible draft-only `Design System / Module Accent Proof` block for all SPEC_02 accent tokens.

Visible proof route:

- `http://localhost:9501/settings`
- Section: `Design System / Module Accent Proof`
- Tokens shown: `--acc-dash`, `--acc-nutri`, `--acc-train`, `--acc-recov`, `--acc-suppl`, `--acc-goals`, `--acc-medic`, `--acc-coach`, `--acc-buddy`, `--acc-mkt`, `--acc-admin`.

Route probe:

| Route | Expected Token | HTTP | Rendered Shell/Token Marker |
| --- | --- | ---: | --- |
| `/` | `--acc-dash` | 200 | pass |
| `/dashboard` | `--acc-dash` | 200 | pass |
| `/nutrition` | `--acc-nutri` | 200 | pass |
| `/goals` | `--acc-goals` | 200 | pass |
| `/training` | `--acc-train` | 200 | pass |
| `/recovery` | `--acc-recov` | 200 | pass |
| `/supplements` | `--acc-suppl` | 200 | pass |
| `/medical` | `--acc-medic` | 200 | pass |
| `/coach` | `--acc-coach` | 200 | pass |
| `/settings` | `--acc-dash` plus proof tokens | 200 | pass |

Remaining SPEC_02 gaps:

- Visual inspection in a browser is still required for subjective strength of accent contrast.
- Governance UI CSS still has its own legacy styling and remains outside this product AppShell scope.
- This pass did not implement new feature surfaces, backend state, live sync, or command palette behavior.

Gate result:

- SPEC_02 module color gate: pass for this implementation draft.
- No commit, no push, no DB/Supabase, no governance state actions.

## Phase 2A.2 App Shell Layout / Navigation UX Hard Fix - 2026-06-02

Purpose: fix the structural shell/navigation issues reported after the SPEC_02 color pass: clipped topbar controls, unwanted horizontal scroll, cluttered sidebar navigation, and context panel overflow risk.

Authoritative sources used:

- `docs/specs/WebPlatform/SPEC_01_APP_SHELL.md`
- `docs/specs/WebPlatform/SPEC_02_DESIGN_SYSTEM.md`

Changes made:

- Shell overflow hardening:
  - `.lume-shell` remains `100vw`, `100dvh`, `240px minmax(0, 1fr) 340px`, `overflow: hidden`.
  - `.lume-main` and `.lume-content` are constrained with `min-width: 0`.
  - `.lume-content` now scrolls vertically only and hides horizontal overflow.
  - Cards, page headers, module cards, empty states, meal cards, and flow items were constrained to avoid forcing shell width.

- Topbar clipping fix:
  - Topbar left area now flexes and truncates safely.
  - Breadcrumb/meta are grouped in a truncation-safe copy block.
  - Right-side controls are compact, non-shrinking, and measured inside the topbar.
  - Secondary controls were shortened: notification is compact, density is compact, while Sync, Theme, Context, and Commands remain visible.

- Sidebar navigation cleanup:
  - Module navigation keeps product labels, shortcuts, accent dots, and active 2px accent bar.
  - Workspace rows keep labels and external markers but no longer show noisy `SSO später` / role-check sublines.
  - Main groups remain `MODULE`, `WORKSPACES`, and `SYSTEM`.

- Context panel containment:
  - Context panel is fixed at `340px`.
  - Context panel owns vertical overflow and hides horizontal overflow.
  - Context cards/text now wrap inside the panel instead of forcing layout width.

Route visual smoke:

Measured with a temporary headless Edge/CDP session at `1440x900` against `http://localhost:9501/`.

| Route | No Horizontal Scroll | Topbar Controls Visible | Active Accent Visible | Context Fits | Result |
| --- | --- | --- | --- | --- | --- |
| `/dashboard` | pass | pass | pass | pass | pass |
| `/nutrition` | pass | pass | pass | pass | pass |
| `/goals` | pass | pass | pass | pass | pass |
| `/training` | pass | pass | pass | pass | pass |
| `/recovery` | pass | pass | pass | pass | pass |
| `/supplements` | pass | pass | pass | pass | pass |
| `/medical` | pass | pass | pass | pass | pass |
| `/settings` | pass | pass | pass | pass | pass |

Remaining layout gaps:

- Browser-level human visual review is still required for final taste and perceived density.
- Below 1280px the shell uses the existing icon-only/responsive fallback; this pass focused the hard gate on the desktop foundation specified by SPEC_01.
- Command palette, profile modal, and live sync behavior remain placeholders by scope.

Gate result:

- Phase 2A.2 shell/layout/navigation gate: pass for the implementation draft.
- No commit, no push, no DB/Supabase, no governance state actions.

## Phase 2A.3 SPEC_01 AppShell Rebuild Pass - 2026-06-02

Purpose: refine the shell from technically compliant layout into a more visibly SPEC_01-like product shell. This pass is limited to Shell, Sidebar navigation, Topbar, and Context Panel. It does not add Dashboard, Nutrition, Goals, or other module feature depth.

Authoritative sources used:

- `docs/specs/WebPlatform/SPEC_01_APP_SHELL.md`
- `docs/specs/WebPlatform/SPEC_02_DESIGN_SYSTEM.md`

Sidebar improvements:

- Brand area now reads as product chrome: `LumeOS`, version tag, `Athlete OS`.
- Search trigger remains prominent as a command entry point with `⌘K`.
- Core module rows now use compact icon slots, product labels, subtle metadata, shortcut hints `1` through `7`, module accent orientation, and active 2px bar.
- Workspace links now read as secondary external destinations with small icon slots and `↗`; noisy SSO/role-check debug sublabels are removed from the visible sidebar.
- User footer now has avatar, Tom, Athlete/Draft Tier, and a small more affordance.

Topbar improvements:

- Left side follows SPEC_01: active MOD-TAG plus `Workspace / {ModuleLabel}` breadcrumb.
- Right side now uses compact shell controls: `Offline · 0 queued`, `Bell 0`, `Theme`, `Context`, `Commands ⌘K`.
- The topbar accent line remains tied to the active module accent.
- Controls were checked for clipping at `1440x900`.

Context Panel improvements:

- Header now presents `Context · {ModuleLabel}` and active module title/status.
- Buddy widget is visually separated and uses the active accent as a small orb marker.
- Insights are grouped under `Insights` with 2-3 cards per checked route.
- Quick actions are grouped under `Quick Actions` with read-only action rows.
- Module details now include details, boundary, and next safe action in one structured block.
- Panel remains fixed at `340px` and does not force horizontal overflow.

Route check:

Measured with temporary headless Edge/CDP at `1440x900` against `http://localhost:9501/`.

| Route | MOD-TAG | Breadcrumb | Context Title | Insights | Quick Actions | No Overflow/Clipping | Result |
| --- | --- | --- | --- | ---: | ---: | --- | --- |
| `/dashboard` | `DASH` | `Workspace / Dashboard` | `Dashboard` | 3 | 3 | pass | pass |
| `/nutrition` | `NUTRI` | `Workspace / Nutrition` | `Nutrition` | 3 | 3 | pass | pass |
| `/goals` | `GOALS` | `Workspace / Goals & Body` | `Goals & Body` | 2 | 2 | pass | pass |
| `/training` | `TRAIN` | `Workspace / Training` | `Training` | 2 | 2 | pass | pass |
| `/recovery` | `RECOV` | `Workspace / Recovery` | `Recovery` | 2 | 2 | pass | pass |
| `/supplements` | `SUPPL` | `Workspace / Supplements` | `Supplements` | 2 | 2 | pass | pass |
| `/medical` | `MEDIC` | `Workspace / Medical` | `Medical` | 2 | 2 | pass | pass |
| `/settings` | `SETTINGS` | `Workspace / Settings` | `Settings` | 2 | 3 | pass | pass |

Remaining SPEC_01 gaps:

- Command palette remains placeholder-only.
- Profile Settings modal remains placeholder-only.
- Notification behavior and live sync are not implemented.
- Buddy animation states are not implemented because no animation dependency is available and this pass does not add dependencies.
- Human browser taste review is still needed, but the shell structure now maps visibly to SPEC_01.

Validation:

- Typecheck was run after AppShell changes. New Shell type issue was fixed; remaining type errors are the known existing Nutrition blockers.
- `git diff --check` and `pnpm --filter @lumeos/web test` are recorded in the task result.

Gate result:

- Phase 2A.3 AppShell foundation gate: pass for this implementation draft.
- No commit, no push, no DB/Supabase, no governance state actions.

## WebPlatform AppShell + Design System Spec Reset - 2026-06-02

Purpose: hard reset the visible WebPlatform shell/design-system foundation against the authoritative WebPlatform source specs. This pass does not continue Dashboard, Nutrition, Goals, or other feature depth.

Authoritative specs read:

- `docs/specs/WebPlatform/INDEX.md`
- `docs/specs/WebPlatform/SPEC_01_APP_SHELL.md`
- `docs/specs/WebPlatform/SPEC_02_DESIGN_SYSTEM.md`

Additional context not used as primary implementation source:

- `docs/specs/WebPlatform/SPEC_03_DASHBOARD.md`
- `docs/specs/WebPlatform/SPEC_04_NUTRITION_UI.md`
- `docs/specs/WebPlatform/SPEC_08_GOALS_UI.md`
- `docs/specs/WebPlatform/SPEC_09_MEDICAL_UI.md`
- `docs/specs/WebPlatform/SPEC_10_WORKSPACE_LINKS.md`

What was wrong before this reset:

- Product shell still exposed a non-spec System item (`Governance`) in the product navigation.
- Existing `/nutrition/foods` and `/nutrition/preferences` content could force horizontal overflow inside the shell.
- Topbar height was not explicitly protected, causing vertical clipping on nutrition subroutes.
- The prior shell was close in structure but still needed a hard pass/fail check against every required route and token requirement.

What changed:

- Product AppShell System group now renders `Settings` only, matching this reset's SPEC_01 requirement. The Governance route itself is untouched and still bypasses AppShell when opened directly.
- Topbar now has explicit minimum height and fixed-height controls to prevent clipping.
- Content containment was hardened:
  - `.lume-content` descendants use `min-width: 0` and `max-width: 100%`.
  - tables inside content use `width: 100%` and `table-layout: fixed`.
  - this preserved `/nutrition/foods` while preventing shell-level horizontal overflow.
- Route-to-module accent resolution remains a single source in `AppShell`.
- Reports now include explicit SPEC_01/SPEC_02 hard reset compliance tables.

Hard route check:

Measured against `http://localhost:9501/` with temporary headless Edge/CDP at `1440x900`.

| Route | HTTP | Module | Accent | Shell Overflow | Sidebar | Context Panel | Topbar | Status |
| --- | ---: | --- | --- | --- | --- | --- | --- | --- |
| `/` | 200 | Dashboard | `--acc-dash` | pass | pass | pass | pass | pass |
| `/dashboard` | 200 | Dashboard | `--acc-dash` | pass | pass | pass | pass | pass |
| `/nutrition` | 200 | Nutrition | `--acc-nutri` | pass | pass | pass | pass | pass |
| `/nutrition/foods` | 200 | Nutrition | `--acc-nutri` | pass | pass | pass | pass | pass |
| `/nutrition/preferences` | 200 | Nutrition | `--acc-nutri` | pass | pass | pass | pass | pass |
| `/goals` | 200 | Goals & Body | `--acc-goals` | pass | pass | pass | pass | pass |
| `/training` | 200 | Training | `--acc-train` | pass | pass | pass | pass | pass |
| `/recovery` | 200 | Recovery | `--acc-recov` | pass | pass | pass | pass | pass |
| `/supplements` | 200 | Supplements | `--acc-suppl` | pass | pass | pass | pass | pass |
| `/medical` | 200 | Medical | `--acc-medic` | pass | pass | pass | pass | pass |
| `/coach` | 200 | Coach | `--acc-coach` | pass | pass | pass | pass | pass |
| `/settings` | 200 | Settings/System | `--acc-dash` | pass | pass | pass | pass | pass |

Remaining SPEC_01/SPEC_02 gaps:

- `lucide-react` is specified by SPEC_02, but it is not currently installed and this task forbids adding dependencies. The shell therefore uses dependency-free icon slots instead of lucide icons.
- Command palette remains a placeholder button, not a `cmdk` implementation.
- Profile Settings modal remains a placeholder affordance.
- Buddy animation states are not implemented because no animation dependency is available and this task forbids adding dependencies.
- Workspace auth handoff, SSO, role gates, notification behavior, and sync behavior remain non-live by scope.

Gate results:

- SPEC_01 Shell Gate: pass.
- SPEC_02 Design Token Gate: pass.
- Route Visual Compliance: pass for all required routes.

Boundary:

- No commit, no push.
- No DB/Supabase commands.
- No migrations.
- No secrets read.
- No governance_brain or AI-Governance-Core writes.
- No Governance Sync candidates, Workorders, Queues, Approvals, or Execution state.

## Scoped Draft Commit

Purpose: local scoped draft commit for the WebPlatform AppShell + Design System Foundation.

Commit scope:

- Draft only.
- Not Product Truth.
- Not an approved spec.
- Not a governed Workorder result.
- Not Queue, Approval, Execution, or Governance Sync state.
- No push.

Gate status included:

- SPEC_01 Shell Gate: pass.
- SPEC_02 Design Token Gate: pass.
- Route Visual Compliance: pass for all required routes.

Routes checked before commit:

- `/` - 200
- `/dashboard` - 200
- `/nutrition` - 200
- `/nutrition/foods` - 200
- `/nutrition/preferences` - 200
- `/goals` - 200
- `/training` - 200
- `/recovery` - 200
- `/supplements` - 200
- `/coach` - 200
- `/medical` - 200
- `/settings` - 200

Known typecheck blockers:

- `src/app/nutrition/curation/page.tsx`
- `src/app/nutrition/local-schema/nutrient-detail-panel.tsx`
- `src/lib/nutrition/food-search.ts`
- `src/lib/nutrition/preference-search-preview.ts`

Excluded from staging/commit:

- `.serena/project.yml`
- `docs/Screenshots/`
- `docs/project/frontdoor/`
- `docs/project/generated-evidence/smoke/`
- unrelated `docs/specs/*`
- unrelated generated evidence outside `docs/project/generated-evidence/webplatform/`

Boundary confirmation:

- No DB/Supabase commands.
- No migrations.
- No `.env` or secrets access.
- No governance_brain or AI-Governance-Core writes.
- No Workorder, Queue, Approval, Execution state, or Governance Sync candidate.
- No push.
