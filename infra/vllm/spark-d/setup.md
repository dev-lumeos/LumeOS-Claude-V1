# vLLM Setup - Spark D / DGX4

Stand: 14 May 2026

## Current Status

This repository no longer treats Spark D / GPT-OSS as an active governance
runtime route.

Current DGX4/5 direction:

- MiniMax M2.7 NVFP4 lab/runtime
- Hermes-test / lab-only
- not production routing
- not a default reviewer route

Exact DGX4/5 host, container, service, model id, and startup command are UNKLAR
in this repository until a verified MiniMax lab runtime report is written.

## Archived / Do Not Use

The old GPT-OSS launch path using:

```text
vllm serve openai/gpt-oss-120b
```

is historical only. Do not document GPT-OSS as active and do not use this route
for workflow routing unless a future task re-verifies it and Tom explicitly
accepts it.

## Required Verification Before Any Use

Create or update a MiniMax lab runtime report with:

- host and IP
- service name
- container name
- image
- served model id
- local endpoint
- smoke tests
- Hermes 65k test status
- explicit statement that it remains lab-only

Do not run live endpoint tests during documentation-only tasks unless explicitly
authorized.
