# Model Tiers V2 - LumeOS

Status: current as of 14 May 2026.

## Current Tier Assignment

| Tier | Model | Node | Role | Status |
|---|---|---|---|---|
| `orchestrator` | `qwen3.6-35b-fp8` | DGX1 / Spark1 | Spark1 orchestrator-agent and governance/reasoning runtime | workflow-ready |
| `worker_coding_docs` | `qwen3-coder-next-fp8` | DGX2 / Spark2 | coding/docs/test worker | workflow-ready |
| `controlled_reviewer_candidate` | `nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4` | DGX3 / Spark3 | explicit `nemotron-review-agent` workflow tests; specialist/multimodal candidate | controlled only, not default production routing |
| `lab_runtime` | `nvidia-MiniMax-M2.7-NVFP4` | DGX4/5 | lab-only / Hermes-test | partially verified lab runtime; not production routing |
| `senior_fallback` | Codex bridge | local/API | bootstrap/senior/fallback | not default orchestrator in Spark1 mode |

## Deterministic Runtime Rules

### Spark1 / Qwen3.6

- `enable_thinking=false` is mandatory through chat-template configuration.
- `temperature=0.0`.
- Use only `message.content`; ignore reasoning fields.

### Spark2 / Qwen3-Coder-Next

- Coding/docs worker route.
- Completion-health probe is required before governed runtime-dependent dispatch.

### Spark3 / Nemotron

- Use `content.trim()`.
- Ignore separate `reasoning`.
- Empty content is invalid.
- Long-context prompts need enough `max_tokens` because reasoning can consume
  completion budget.
- Use only under explicit controlled route toggle such as
  `LUMEOS_FAST_REVIEWER_ROUTE=nemotron-review-agent`.

## Review Routing

Current proven test path:

```text
Spark1 orchestrator -> assigned worker -> nemotron-review-agent -> checks -> dossier
```

This path is proven for harmless local workflow tests. It does not make
Nemotron default production routing.

Archived review paths:

- DGX3 Gemma4 fast-review route: retired / do not use.
- DGX4 GPT-OSS senior-review route: historical / do not use as active routing.

## MiniMax Lab Runtime

DGX4 / Spark4 is partially verified as a MiniMax lab runtime:

- Host/IP: `edgexpert-0dc8` / `192.168.0.101`.
- Container/image/model: `vllm_node` / `vllm-node-minimax` /
  `nvidia-MiniMax-M2.7-NVFP4`.
- `/v1/models` showed `max_model_len=65536`.
- Completion produced `content.trim() = ok` and JSON after trim.

DGX5 host is `edgexpert-e5e3` and is a MiniMax worker/lab node, not a standalone
production route. DGX4 and DGX5 both showed `RayWorkerProc` with about
`98006 MiB` reserved and about `50C` idle.

Still UNKLAR: exact service/autostart state, repository wrapper parity, and
complete Hermes 65k evidence.

## Adapter Functions

| Function | Current use |
|---|---|
| `callQwen36Orchestrator()` | Spark1 orchestration/governance route |
| `callCoderNext()` | Spark2 coding/docs worker route |
| `callNemotronReviewer()` | controlled DGX3 reviewer route |
| `callGemmaReviewer()` | legacy adapter; do not use for active DGX3 routing |
| `callGPTOSSReviewer()` | legacy/historical Spark D route unless re-verified |

All active routes must use content-only normalization and must not fall back to
reasoning fields.
