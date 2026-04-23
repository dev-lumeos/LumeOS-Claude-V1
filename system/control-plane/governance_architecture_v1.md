# Governance Architecture V1 — LumeOS
# Status: FESTGEZOGEN — 23. April 2026

---

## Das Compiler-Modell

```
Opus/Sonnet/Kimi (Cloud)    → Source Code  (Intent, nicht deterministisch)
Governance-Compiler (DGX A) → Bytecode     (Constraints, semi-deterministisch)
SAT-Check (Threadripper)    → Gate         (Validierung, vollständig deterministisch)
Micro-Executor (DGX B)      → CPU          (Ausführung, strikt deterministisch)
```

---

## Ebenen

| Ebene | Wer | Was | Determinismus |
|-------|-----|-----|---------------|
| Macro | Opus 4.6 / Sonnet / Kimi | Architektur, WO-Zerlegung, Governance-Regeln | Nicht deterministisch |
| Governance-Compiler | DGX A (LLM) | Constraint-Extraktion, Schema-Härtung | Semi-deterministisch |
| SAT-Check | Threadripper (kein LLM) | Pre-Execution Gate | Vollständig deterministisch |
| Micro | DGX B (LLM Temp 0.0) | Code-Generierung nach Constraint-Set | Strikt deterministisch |

---

## Architektur-Diagramm

```
┌──────────────────────────────────────────────────────────────┐
│                   CONTROL PLANE (Threadripper)                │
│                                                              │
│  Macro-Workorder (von Opus/Sonnet/Kimi)                      │
│         ↓                                                    │
│  ┌──────────────────────┐                                    │
│  │  DGX A               │                                    │
│  │  Governance-Compiler │                                    │
│  │  LLM: 35B (Standard) │                                    │
│  │      / 122B (Edge)   │                                    │
│  └──────────────────────┘                                    │
│         ↓ Governance-Artefakt v3.0                           │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Pre-Execution SAT-Check (TypeScript/Rust, kein LLM) │    │
│  │  • type_availability: AST-Scan + Symbol-Table        │    │
│  │  • scope_reachability: Line-Budget-Heuristik         │    │
│  │  • constraint_satisfiability: Statische Analyse      │    │
│  │  PASS  → Ed25519-signed Execution-Token              │    │
│  │  REJECT → Failure-Code + Constraint-Hint → DGX A    │    │
│  └──────────────────────────────────────────────────────┘    │
│         ↓ Execution-Token                                    │
│  ┌──────────────────────┐                                    │
│  │  DGX B               │                                    │
│  │  Micro-Executor      │                                    │
│  │  LLM: 30B AWQ        │                                    │
│  │  Temp=0.0, Seed=42   │                                    │
│  └──────────────────────┘                                    │
│         ↓ triple_hash + Acceptance-Gates                     │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Failure-Handling + Pattern-Detection                │    │
│  │  same_failures_3x   → DGX A: tighter constraints    │    │
│  │  mixed_failures_3x  → Escalate: Opus/Sonnet/Kimi    │    │
│  │  max_exceeded       → Human escalation              │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

---

## DGX Rollentrennung (UNVERÄNDERLICH)

### DGX A — Governance-Compiler
- Funktion: Macro-Workorder → Governance-Artefakt v3.0
- Modell: Qwen3.5-35B-A3B (Standard) / 122B (Edge-Cases) — TBD nach Benchmark
- Aufgaben: Constraint-Extraktion, Schema-Validierung, Artefakt-Generierung
- NICHT: Code ausführen, testen, direkt deployen

### DGX B — Micro-Executor
- Funktion: Governance-Artefakt + Execution-Token → Code
- Modell: Qwen3-Coder-30B-A3B (AWQ, 4-bit)
- Parameter: Temp=0.0, Seed=42, Top-P=1.0, Top-K=1
- NICHT: Kreative Entscheidungen, Architektur-Änderungen

**Regel: DGX A und DGX B werden NIE vertauscht.**

---

## SAT-Check — Implementierung (Threadripper)

```typescript
// Threadripper Control Plane — kein LLM, pure TypeScript
interface SATCheckInput {
  artefakt: GovernanceArtefaktV3
}

interface SATCheckOutput {
  result: 'pass' | 'reject'
  execution_token?: ExecutionToken   // nur bei pass
  failure_code?: string              // nur bei reject
  constraint_hint?: string           // nur bei reject
  checks: {
    type_availability: 'pass' | 'reject'
    scope_reachability: 'pass' | 'reject'
    constraint_satisfiability: 'pass' | 'reject'
  }
}
```

SAT-Check ist konservativ:
- Lieber false-reject als false-accept
- Nie "accept" bei unerfüllbaren Constraints
- Manchmal "reject" wenn eigentlich erfüllbar — das ist akzeptabel

---

## Offen bis Spark B Benchmark

| Parameter | Offene Frage | Test-Methode |
|-----------|-------------|--------------|
| DGX A Modell | 35B oder 122B? | 50 Macro-WOs, % manuell nachgebessert |
| KV-Cache Budget | Parallele Micro-WOs? | Load-Test bis Latenz-Degradation |
| Batch-Size | 1/2/4 parallel? | Throughput vs. triple_hash Determinismus |

*Governance Architecture V1 — FESTGEZOGEN*
