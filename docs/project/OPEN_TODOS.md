# LUMEOS - Open TODOs

Stand: 14 May 2026

This file lists only operationally open items. Completed historical blocks are not
kept as active work. Use `docs/project/GOVERNANCE_TODO_REGISTER.json` for the
machine-readable register.

---

## Current Runtime Baseline

| Node | Current state |
|---|---|
| DGX1 / Spark1 | `edgexpert-1116`, `192.168.0.128`, `vllm.service`, container `vllm-qwen`, model `qwen3.6-35b-fp8`, role `orchestrator-agent`, workflow-ready. Spark1 handoff is proven. |
| DGX2 / Spark2 | `edgexpert-5862`, `192.168.0.188`, `vllm.service`, container `spark-b-coder`, model `qwen3-coder-next-fp8`, role coding/docs worker, workflow-ready. |
| DGX3 / Spark3 | `edgexpert-509d`, `192.168.0.99`, `vllm.service`, container `vllm_node`, image `vllm/vllm-openai:v0.20.0-aarch64-cu130-ubuntu2404`, model `nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4`, controlled reviewer/specialist candidate only. Gemma4 is retired and must not be used. |
| DGX4/5 | MiniMax M2.7 NVFP4 lab/runtime only. Hermes-test/lab work is not production routing. Do not document GPT-OSS as active unless it is re-verified and explicitly re-accepted. |
| Codex | Bootstrap/senior/fallback. Codex is not the default orchestrator when `spark1_orchestrated` is requested. |

---

## Open Items

### TODO-1: DGX3 / Nemotron route-role acceptance policy

Status: open.

The controlled `nemotron-review-agent` route works for explicit workflow tests.
It is not production routing by default. A separate acceptance decision is still
needed before DGX3/Nemotron can replace any default reviewer route or be used for
specialist multimodal / OCR / FoodCam work.

Required next step: write the acceptance policy with pass/fail criteria, route
scope, fallback behavior, output contract, and explicit non-goals.

### TODO-2: MiniMax lab / Hermes 65k test documentation

Status: open.

MiniMax remains lab-only. Documentation should describe current DGX4/5 lab
runtime facts, Hermes-test status, known command(s), and verification commands.
Do not add MiniMax to production routing.

Required next step: update `docs/project/MINIMAX_LAB_RUNTIME.md` and related
runtime docs after the lab state is explicitly verified.

### TODO-3: infra/vLLM and systemd cleanup

Status: open.

The active Spark C/D runtime state has changed. Legacy Gemma4 and GPT-OSS launch
blocks must remain archived / do-not-use only. Any executable startup scripts
that are no longer verified should be either updated from verified runtime facts
or marked `UNKLAR` with the exact verification command required.

Required next step: verify remote files on DGX3/DGX4/5 before using repository
startup scripts for service changes.

---

## Recently Completed, Not Open

- Spark1 systemd/runtime is workflow-ready and Spark1 handoff is proven.
- Spark2 docs/coding worker is workflow-ready after completion-health hardening.
- DGX3 Gemma4 route is retired; DGX3 now runs Nemotron Omni NVFP4.
- Full Spark1 -> worker -> Nemotron reviewer workflow proof completed with
  `review_started`, `review_completed`, `PASS`, confidence `0.95`, and a dossier.
- Codex Worker timeout/reporting mismatch is fixed in dossier reporting:
  raw subprocess timeout remains visible as `worker_runtime_status`, but a
  completed scoped output plus configured reviewer PASS classifies the batch as
  `DONE` instead of misleading `FIX_REQUIRED`.
- `SSOT_SYNC_CHECK` is implemented and wired into governance invariants so
  runtime/model routing, workflow/operator/governance, product-gate, infra, and
  completed-TODO changes must update mapped SSOT docs or declare a structured
  auditable N/A reason.
- Review Pipeline V2, workorder schema, scope enforcement, approval queue,
  stop rules, governance dossiers, runtime history semantics, and project
  profiles are implemented.
