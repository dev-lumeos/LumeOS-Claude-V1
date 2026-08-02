# Codex Senior Runtime Integration

## Purpose

Record the runtime routing correction that makes Codex CLI with GPT-5.5 the productive senior engineering and repo-aware review runtime.

## Decision

- `senior-coding-agent` uses `model: gpt-5.5`.
- Runtime type is `codex-cli`.
- Healthcheck is config/manual, not HTTP endpoint probing.
- Codex CLI must not be treated as a vLLM/OpenAI-compatible endpoint.
- Spark D remains the local Tier 2 senior reviewer route using `openai/gpt-oss-120b`.
- Escalation from Spark senior review goes to Codex/GPT-5.5 as Tom's productive senior repo-aware reviewer.
- Spark 4/5 remain lab/premium local model experiments and do not replace Codex production authority.

## Guardrails

- Do not invent a Codex HTTP endpoint.
- Do not mark `senior-coding-agent` high solely because endpoint is absent.
- Required local HTTP/vLLM routes without endpoints remain high findings.
- Optional MealCam/Vision runtime remains non-blocking unless explicitly targeted.

## Regression Coverage

- `system/control-plane/__tests__/model-runtime-check.test.ts`
  - codex-cli runtime does not require endpoint
  - required HTTP runtime without endpoint is high
  - optional MealCam offline remains non-blocking

## Product Gate

Product work remains blocked unless Tom explicitly opens it.
