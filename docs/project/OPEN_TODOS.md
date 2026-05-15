# LUMEOS - Open TODOs

Stand: 15 May 2026

This file lists operationally open work only. Completed work is summarized for
orientation without re-opening historical blockers. The machine-readable source
is `docs/project/GOVERNANCE_TODO_REGISTER.json`; every open `GOV-TODO-*` ID
listed here must be open in that register.

## Current Milestone

Milestone cut: `LumeOS Nutrition Local Foundation V1 + Governance Workflow Baseline`

Primary milestone doc:
`docs/project/p1-005/P1-005-local-nutrition-foundation-v1-cut.md`

Current product state:

- Local Nutrition foundation is usable for further local product development.
- It is not complete and not DEV/LIVE-ready.
- Local data state: 7140 foods, 698092 food nutrient rows, 518 categories, 4903 categorized foods, 2237 unassigned foods.
- Visible local surfaces: `/nutrition`, `/nutrition/curation`, `/api/nutrition/foods`, `/api/nutrition/foods/categories`, `/api/nutrition/foods/smart-preview`, `/api/nutrition/curation`, `/api/nutrition/preferences/catalog`.
- No Supabase Cloud, DEV, LIVE, production DB, raw BLS commit, RDA value change, diary write flow, or MealItem creation is authorized.

## Product TODOs

### GOV-TODO-036: Remaining Human Layer category coverage

Status: open.

2237 foods remain unassigned after the completed deterministic V2 Wild/game
meat mapping. Remaining mappings require separate deterministic evidence from
SPEC_05, BLS code prefixes, explicit hints, or exact source-backed rules.

Required next step: run a governed analysis/apply batch for one candidate rule
at a time. Do not guess or bulk-assign ambiguous prepared dishes.

### GOV-TODO-037: Curated display names and aliases

Status: open.

Human-friendly display names and curated aliases are not implemented. Existing
aliases are source-backed deterministic aliases only.

Required next step: design a governed curation workflow for accepted display
names and curated aliases, with auditability and no invented labels.

### GOV-TODO-038: Deterministic metadata for `no_raw_fish` and `no_gluten`

Status: open.

`no_raw_fish` is unresolved because preparation/raw-state metadata is missing.
`no_gluten` is unresolved because deterministic ingredient/allergen tagging is
missing.

Required next step: create a local-only source-backed metadata candidate before
these exclusions can affect search.

### GOV-TODO-039: Preference persistence UI and persisted Smart Search

Status: open.

Preference catalog and Smart Preview exist, but preferences are not persisted
and Smart Search does not use saved user state.

Required next step: design a local-only preference write path and UI under a
separate governed boundary. Auth/user-state prerequisites must be resolved
before any non-local persistence.

### GOV-TODO-040: Diary, MealItem, serving, amount, and meal schedule foundations

Status: open.

Diary logging, MealItem creation, serving/portion model, food amount input, and
meal schedule persistence are not implemented.

Required next step: create a separate local-only foundation plan after Food
Search/Human Layer and Preferences prerequisites are stable.

### GOV-TODO-041: Daily nutrition summary and macro dashboard

Status: open.

Daily nutrition summaries and macro dashboard views are not implemented.

Required next step: wait until diary/MealItem/amount foundations exist, then
build read-only summary queries and UI under a governed local boundary.

### GOV-TODO-023: Nutrient reference-values / RDA source candidate

Status: open.

The local `nutrient_defs` seed is applied and UTF-8 corrected, but RDA fields
remain partial by design. Missing RDA values are not defects.

Required next step: create a separate verified source candidate for
`nutrient_reference_values` / RDA modeling before adding any additional values.

### GOV-TODO-046: Local-to-DEV/LIVE promotion blueprint

Status: blocked pending Tom decision.

DEV/LIVE are not set up for the current Nutrition foundation. Supabase Cloud is
not used. Local-only progress does not imply promotion readiness.

Required next step: Tom must explicitly open a promotion-planning boundary
before any DEV/LIVE or Supabase Cloud work is designed or executed.

## Governance TODOs

### GOV-TODO-042: Governance Frontdoor workflow

Status: open.

The desired Frontdoor flow is:
Brainstorm -> Summary -> Product Intent -> Spec -> Workorder Drafts -> Drift
Checker -> Approval -> Queue.

Required next step: design the governed Frontdoor workflow and connect it to the
existing workorder, approval, drift, and queue mechanisms.

### GOV-TODO-043: Project/topic archive structure

Status: open.

The project needs a durable archive structure with index files, project/topic
subdirectories, conversation notes, and TODO linkage.

Required next step: define the archive layout and migration rules without
rewriting historical evidence.

### GOV-TODO-044: Project onboarding / repo separation blueprint

Status: open.

Future projects need a clear onboarding and repository separation blueprint so
LumeOS-specific assumptions do not leak into other products.

Required next step: draft the blueprint using current project-profile and
source-chain constraints.

### GOV-TODO-045: Structure cleanup blueprint

Status: open.

The repo needs a cleanup plan for historical docs, generated artifacts, runtime
reports, and active SSOT files.

Required next step: produce a non-destructive structure cleanup blueprint before
moving or archiving files.

## Runtime TODOs

### GOV-TODO-012: MiniMax lab evaluation before routing decision

Status: open.

MiniMax is partially verified as a lab runtime, but it remains outside
productive governance routing. A benchmark/evaluation decision is still required
before any governance route can use MiniMax.

Required next step: define and run an explicitly authorized lab evaluation plan
before adding any MiniMax route.

### GOV-TODO-029: DGX3 / Nemotron route-role acceptance policy

Status: open.

The controlled `nemotron-review-agent` route works for explicit workflow tests.
It is not production routing by default.

Required next step: write the acceptance policy with pass/fail criteria, route
scope, fallback behavior, output contract, confidence thresholds, and explicit
non-goals.

### GOV-TODO-031: MiniMax Hermes 65k / service-autostart documentation

Status: open.

MiniMax remains lab-only. DGX4 lab runtime facts are partially verified, but
complete Hermes 65k evidence, service file state, and autostart state are still
open.

Required next step: document Hermes 65k evidence and exact DGX4/DGX5 service /
autostart facts after explicit verification.

Do not run these until Tom opens a runtime verification boundary:

```powershell
ssh edgexpert-0dc8 "systemctl is-enabled vllm.service; systemctl status vllm.service --no-pager; docker ps --format '{{.Names}}\t{{.Image}}\t{{.Status}}'"
ssh edgexpert-e5e3 "systemctl is-enabled vllm.service; systemctl status vllm.service --no-pager; docker ps --format '{{.Names}}\t{{.Image}}\t{{.Status}}'"
curl http://192.168.0.101:8001/v1/models
```

### GOV-TODO-032: infra/vLLM and systemd cleanup

Status: open.

Legacy Gemma4 and GPT-OSS launch blocks must remain archived / do-not-use only.
Any executable startup scripts that are no longer verified should be updated
from verified runtime facts or marked `UNKLAR` with exact verification commands.

Required next step: verify remote files on DGX3/DGX4/5 before using repository
startup scripts for service changes.

## Completed Product Work, Not Open

- P1-005 import-preparation planning outputs.
- Local Nutrition schema foundation.
- Thai i18n correction.
- Deterministic `nutrient_defs` seed.
- UTF-8 correction.
- Full local deterministic BLS food import.
- Local Food Search V1 and Food Detail.
- Human Layer category, tag, alias, and sort foundation.
- Preferences catalog foundation.
- Preference-aware Smart Preview.
- Read-only curation UI and preference mapping workbench.
- Curation persistence tables, with no rows inserted.
- Human Layer gap and alias analysis.
- V2 Wild/game meat category mapping for 49 `V2%` foods.

## Completed Governance Work, Not Open

- Spark1 handoff proven.
- Spark2 coding/docs worker path hardened.
- DGX3/Nemotron controlled reviewer path proven with review audit and dossiers.
- Mandatory `documentation_impact` lifecycle gate.
- `SSOT_SYNC_CHECK` and cross-file SSOT consistency checks.
- Dossier documentation/SSOT reporting.
- Stop-rule baseline mechanism.
- Bounded Nemotron review payloads.
- Codex Worker timeout/reporting mismatch fix.

## Deferred / Archived

- Historical DGX3/Gemma4 and DGX4/GPT-OSS paths are archived / do-not-use.
- Old broad Nutrition bootstrap commands are evidence only, not execution
  authority.
- Any DEV/LIVE, Supabase Cloud, production DB, MiniMax routing, or service
  restart work requires a new explicit boundary.
