# LumeOS Canonical Memory

> **CURRENT TRUTH** — Stand: April 2026
> Diese Datei enthält nur aktuelle, belegte Aussagen.
> Historische Designentscheidungen: `docs/BrainstormDocs/` (ARCHIVE — not current truth)

---

## System

**Architecture:** Brain / Law / Muscle

- Brain: Claude Code (planning, specs, WOs)
- Law: Deterministisches System (Scheduler, Governance, Preflight, Reports)
- Muscle: DGX Sparks A+B+C+D (vLLM Execution)

**Repo:** https://github.com/dev-lumeos/LumeOS-Claude-V1
**Stack:** pnpm / Turborepo / Hono / Supabase / vLLM / TypeScript

---

## Hardware — Phase 2 LIVE (alle 4 Sparks aktiv)

| Node | IP | Port | Modell | Rolle | Status |
|---|---|---|---|---|---|
| Spark A | 192.168.0.128 | 8001 | Qwen3.6-35B-A3B FP8 | Orchestrator + WO-Validator | ✅ LIVE |
| Spark B | 192.168.0.188 | 8001 | Qwen3-Coder-Next FP8 | Coding Worker | ✅ LIVE |
| Spark C | 192.168.0.99 | 8001 | Gemma-4-26B-A4B-it FP8 | Fast Reviewer (Pipeline Tier 1) | ✅ LIVE |
| Spark D | 192.168.0.101 | 8001 | GPT-OSS-120B MXFP4 | Senior Reviewer (Pipeline Tier 2) | ✅ LIVE |
| RTX 5090 | localhost | 8001 | Qwen3-VL-30B FP8 | MealCam Vision | geplant |
| Escalation | — | — | Claude Code Max 200 | Senior Coding (selten) | aktiv |

---

## Governance-System — Implementierungsstand

Alle Blöcke A–E implementiert und verifiziert:

| Block | Thema | Status |
|---|---|---|
| Block 6 | Review-Pipeline V2 | ✅ |
| A.1–A.4 | Workorder-Schema, Risk-Categories, Files Enforcement, Locks | ✅ |
| B.1–B.4 | Run Summary, Morning Report, Failed WO Report, Model Quality Report | ✅ |
| C.1–C.3 | Kill-Switch, Stop Rules, Approval Queue, Night-Run-Policy | ✅ |
| D.1–D.2 | WO-State-Machine, Scheduler Preflight (12 Checks) | ✅ |
| E.1–E.2 | WO Dossier Generator, Docs-Governance V1 | ✅ |
| F | Spark Runtime Hardening | ⏳ offen |

---

## Agent Routing (aktueller Stand)

| Agent | Node | Modell | Zweck |
|---|---|---|---|
| orchestrator-agent | Spark A | qwen3.6-35b-fp8 | Dispatch + Monitor |
| pre-review-agent | Spark A | qwen3.6-35b-fp8 | Vollständigkeit prüfen |
| post-review-agent | Spark A | qwen3.6-35b-fp8 | Output validieren |
| micro-executor | Spark B | qwen3-coder-next-fp8 | TypeScript Patches |
| test-agent | Spark B | qwen3-coder-next-fp8 | Tests |
| fast-reviewer-agent | Spark C | gemma-4-26B-A4B-it | Pipeline Tier 1 |
| senior-reviewer-agent | Spark D | gpt-oss-120b | Pipeline Tier 2 |
| senior-coding-agent | Claude Code | claude-opus-4-5 | Escalation only |

---

## Services (laufend auf Threadripper, lokal)

| Port | Service | Status |
|---|---|---|
| 9000 | wo-classifier | deterministisches Routing |
| 9001 | sat-check | 3 deterministische Checks |
| 9002 | scheduler-api | WO Queue + Spark-Dispatch |
| 9003 | governance-compiler | Macro-WO → GovernanceArtefaktV3 |
| 9004 | lightrag | Codebase Knowledge Graph |
| 54321 | supabase | Control Plane DB (lokal, niemals Cloud) |

---

## Festgezogene Entscheidungen

- WO Classifier: deterministisch, regelbasiert, kein LLM
- Control Plane DB: lokal auf Threadripper — NIEMALS in Cloud
- Qwen3.6 Pflicht: `enable_thinking: false`, `temperature: 0.0`
- Reasoning-Filter: `extractContentOnly()` für alle Reasoning-Modelle
- Scope Enforcement: `scope_files` + `files_blocked` erzwungen
- Review Pipeline: Spark C → Spark D → ESCALATE → Claude Code

---

## Qwen3.6 Pflichtregeln

```json
{
  "chat_template_kwargs": { "enable_thinking": false },
  "temperature": 0.0
}
```

`/no_think` im Prompt funktioniert NICHT — nur `chat_template_kwargs`.

---

## Offene Punkte (einzige echte Offene)

- **F — Spark Runtime Hardening:** systemd Services, HTTP Healthcheck-Timer, Reboot-Tests, Auto-Restart bei hängendem vLLM
- **Block 3 Tech-Debt:** 3 TS-Fehler + 3 failing Smoke-Tests (pre-existing, nicht durch Governance-Arbeit verursacht)

---

## Veraltete / nicht mehr gültige Annahmen (NICHT als Wahrheit lesen)

Die folgenden Punkte waren in früheren Versionen dieser Datei enthalten und
wurden als veraltet entfernt. Sie stehen nur hier zur Referenz:

- ~~Phase 2 PENDING — Spark 3+4 unterwegs~~ → Phase 2 ist LIVE
- ~~Nemotron als Orchestrator (Port 9005)~~ → Orchestrator ist Qwen3.6 auf Spark A
- ~~MiniMax M2.7 als Spark 3+4 Modelle~~ → Spark C = Gemma 4, Spark D = GPT-OSS
- ~~Nutrition-API wartet auf Supabase Cloud~~ → noch kein aktueller Implementierungsstand
- ~~Port 9005 Orchestrator wartet auf Nemotron Deployment~~ → Port 9005 nicht aktiv
- ~~triple_hash Verifikation~~ → nicht Teil des aktuellen Governance-Systems
- ~~Ed25519 Token~~ → nicht Teil des aktuellen Governance-Systems
