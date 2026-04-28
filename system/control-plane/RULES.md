# LUMEOS Review-Pipeline Rules

**Single Source of Truth** für Review-State-Machine, Routing und Reasoning-Filter.
Stand: April 2026 — Phase 2 (alle 4 Sparks live).

Diese Regeln gelten für die Review-Pipeline (Spark 3 → Spark 4 → Claude).
Sie sind **orthogonal** zu den bestehenden Governance-Regeln in `governance-validator.ts`,
die weiterhin den Orchestrator-Output (Spark 1 / Qwen3.6) validieren.

---

## 1. State-Enum

Globaler Output-State für **alle** Reviewer (Spark 3, Spark 4, Claude):

| State | Bedeutung | Routing-Wirkung |
|---|---|---|
| `PASS` | Review erfolgreich, Output akzeptiert | Pipeline beendet, weiter im Dispatcher |
| `REWRITE` | Output korrigierbar, zurück an Worker | Spark 2 (max 2× pro Reviewer-Stufe) |
| `ESCALATE` | Reviewer kann nicht abschließend entscheiden | Nächsthöhere Instanz (Spark 4 → Claude) |
| `FAIL` | Terminal blockiert, Human nötig | Pipeline-Stopp, Audit-Log |

**Kritische Unterscheidung:**

```text
PASS = Review-State / Routing-Signal (erlaubt)
passed / granted / success / approved / completed = verboten als Stop-Condition
```

Diese Wörter bleiben in `governance-validator.ts` als verbotene Stop-Conditions
markiert. `PASS` als Output-State ist eine andere Domäne und nicht betroffen.

---

## 2. Routing-Pipeline

```text
Worker (Spark 2) produziert Output
       │
       ▼
  Spark 3 (Fast Quality, Gemma 4 26B)
       │
       ├── PASS     → done
       ├── REWRITE  → Spark 2 (max 2×)
       └── ESCALATE → Spark 4

  Spark 4 (Senior Review, GPT-OSS 120B)
       │
       ├── PASS     → done
       ├── REWRITE  → Spark 2 (max 2×)
       └── ESCALATE → Claude (Max 200)

  Claude (Senior Coding Agent)
       │
       └── final decision / FAIL
```

**Spark 1 (Orchestrator/Qwen3.6) ist NICHT in dieser Pipeline.**
Spark 1 bleibt Dispatcher, WO-Validator, Routing-Entscheider, State-Manager.

---

## 3. High-Risk Hard Gate

Wenn ein Workorder eine der folgenden Kategorien hat:

```text
- auth
- rls
- migration
- security
```

**dann gilt der folgende 5-Punkte-Flow (sequenziell, NICHT parallel):**

```text
1. Spark 3 may run first as non-blocking fast sanity check.
2. Spark 3 result is logged.
3. Spark 3 PASS does NOT approve the task.
4. Spark 3 REWRITE may still provide useful findings (forwarded to Spark 4).
5. Spark 4 is always mandatory and blocking.
```

**Konkrete Implikationen:**

| Aspekt | Verhalten |
|---|---|
| Spark 3 | optional, non-blocking, sequenziell vor Spark 4 |
| Spark 3 PASS | wird geloggt, hat aber keinen Approval-Charakter |
| Spark 3 REWRITE | Findings werden als Kontext an Spark 4 weitergereicht |
| Spark 3 ESCALATE/FAIL | egal — Spark 4 läuft trotzdem |
| Spark 4 | mandatory, blocking — Pipeline kann nicht ohne Spark-4-PASS abschließen |
| Race/Parallel | NICHT in V1 — zu komplex, keine Konkurrenz-Reads auf Worker-Output |

Implementiert via `requiresSeniorReview(woType)` Helper.

**Workorder-Typ-Inferenz** (analog `inferWorkorderType()` in governance-validator.ts):
- `auth` keywords: `auth`, `login`, `session`, `token`, `jwt`
- `rls` keywords: `rls`, `policy`, `row-level-security`, `policies`
- `migration` keywords: `migration`, `schema`, `alter table`, `supabase/migrations/`
- `security` keywords: `security`, `permission`, `medical`, `admin`, `middleware`

---

## 4. Escalation Triggers

Konsolidierte Trigger-Liste pro Tier. Jede Bedingung führt zur nächsten Stufe.

### Spark 3 → Spark 4

```text
- status = ESCALATE
- confidence < 0.75
- invalid JSON / schema violation
- REWRITE limit exceeded (2× erreicht)
- high-risk category requires mandatory Spark 4
```

### Spark 4 → Claude

```text
- status = ESCALATE
- confidence < 0.75
- invalid JSON / schema violation
- REWRITE limit exceeded (2× erreicht)
- cannot decide safely
```

### Claude → HUMAN_NEEDED (terminal)

```text
- invalid JSON
- FAIL
- cannot decide
→ automated pipeline stops
→ run status = HUMAN_NEEDED
→ no merge, no deployment
```

**Wichtig:** Auch wenn `status: PASS` zurückkommt, aber `confidence < 0.75`,
wird der State auf `ESCALATE` umgeschrieben. Das verhindert false positives
bei unsicheren Reviewern.

Detaillierte Regeln zu den einzelnen Triggern:
- High-Risk Hard Gate: Sektion 3
- Output-Contract / Schema-Verletzung: Sektion 7
- Rewrite-Counter pro Tier: Sektion 11

---

## 5. Claude Usage Rule

Claude (Senior Coding Agent, Max 200 Plan) darf **nur** aufgerufen werden bei:

```text
1. Spark 4 → ESCALATE
2. Mehrfacher FAIL in der Review-Pipeline
   (Spark 3 REWRITE×2 → Spark 4 → REWRITE×2 → Claude)
3. Architektur unklar (= Pre-Review-Verdict, manuell triggerbar)
```

**Sonst: Verboten.** Default ist `claudeAllowed = false`.

Implementierungs-Hinweis: Im Dispatcher als Cost-Gate — jeder Claude-Call
muss einen der drei Trigger als Reason im Audit-Log eintragen, sonst BLOCKED.

**Claude FAIL ist terminal für die automatisierte Pipeline:**

```text
Claude FAIL → run status = HUMAN_NEEDED
            → keine weiteren automatisierten Retries
            → kein Merge
            → kein Deployment
```

Claude ist der **letzte automatisierte Entscheider**. Nach Claude FAIL läuft
nur noch Mensch. Im Audit-Log wird `human_review_required` geschrieben.

---

## 6. Reasoning-Filter (HARTE REGEL)

Globaler Output-Extractor für **alle** vLLM-Calls:

```typescript
function extractContentOnly(response: any): string {
  const msg = response?.choices?.[0]?.message
  if (!msg) return ''
  return (msg.content ?? '').trim()
}
```

**Strikt verboten:**
- `choices[].message.reasoning`
- `choices[].message.reasoning_content`

**Erlaubt:**
- `choices[].message.content` only

**Keine Fallbacks.** Wenn `content` leer → leerer String → upstream Fehler.

**Modelle die Reasoning produzieren:**
- Spark 1 (Qwen3.6) — bereits via `chat_template_kwargs.enable_thinking=false` neutralisiert
- Spark 4 (GPT-OSS 120B) — Reasoning bleibt aktiv, wird aber gedroppt
- Spark 2 (Coder-Next) — kein Reasoning
- Spark 3 (Gemma 4) — Reasoning-Parser aktiv, aber Output via `content`

---

## 7. Output-Contract für Reviewer (Spark 3 + Spark 4)

Beide Reviewer müssen **strikt** dieses JSON-Schema einhalten:

```json
{
  "status":           "PASS | REWRITE | ESCALATE",
  "risk":             "LOW | MEDIUM | HIGH",
  "confidence":       0.0,
  "violations":       ["string"],
  "recommendations":  ["string"],
  "summary":          "string",
  "requires_claude":  false
}
```

**Validierung via `validateReviewOutput()`** — nur im Pipeline-Kontext aufrufen,
nicht im bestehenden Governance-Validator-Flow.

Bei Schema-Verletzung:
- `status` nicht im Enum → REWRITE-Request an Reviewer (max 2×)
- `confidence` keine Number 0–1 → REWRITE
- `risk` nicht im Enum → REWRITE
- Nach 2 Rewrites: ESCALATE zur nächsten Stufe (nicht FAIL — der Reviewer ist fehlerhaft, nicht der Worker-Output)

**Tiered Escalation bei invalid JSON / Schema-Verletzung:**

```text
Spark 3 invalid JSON   → ESCALATE to Spark 4
Spark 4 invalid JSON   → ESCALATE to Claude
Claude invalid JSON    → HUMAN_NEEDED (terminal)
```

Niemals pauschal „Schema-Verletzung → Claude". Jede Tier eskaliert nur eine Stufe weiter.

---

## 8. Strict JSON Parsing

GPT-OSS-Output muss als JSON parsebar sein:

```typescript
const content = extractContentOnly(response)
if (!content) throw new Error('GPT_OSS_EMPTY_CONTENT')
const review = JSON.parse(content)  // wirft bei kaputtem JSON — kein silent fallback
```

Kein Try/Catch mit Recovery, keine Partial-Parses, keine Regex-Extraktion.
Wenn Spark 4 kaputtes JSON liefert: REWRITE-Request mit explizitem Schema-Reminder.

---

## 9. Was NICHT geändert wird

Diese Regeln sind **bewusst out of scope** für die Review-Pipeline:

| Bereich | Status |
|---|---|
| `parseToolRequest()` in dispatcher.ts | unangetastet |
| `MAX_REWRITE_LOOPS = 2` für Governance-Violations | unangetastet (andere Loop) |
| `validateOrchestratorIntent()` für Spark-1-Output | unangetastet |
| `authorizeToolCall()` Permission Gateway | unangetastet |
| `approval-gate.ts` | unangetastet |

Die Review-Pipeline ist eine **eigenständige Schicht**, die VOR oder NACH
der existierenden Dispatcher-Logik laufen kann (Tom entscheidet später,
wo sie integriert wird).

---

## 10. Mapping: Agent-ID → Spark-Node

Ergänzung für `model_routing.json`:

| Agent-ID | Node | Modell | Endpoint |
|---|---|---|---|
| `fast-reviewer-agent` | spark-c | google/gemma-4-26B-A4B-it | http://192.168.0.99:8001 |
| `senior-reviewer-agent` | spark-d | openai/gpt-oss-120b | http://192.168.0.101:8001 |
| `senior-coding-agent` | claude_code | claude-opus / claude-sonnet | Max 200 Plan |

Bestehende Agents bleiben unverändert.

---

## 11. Rewrite-Counter pro Reviewer-Tier

Jede Review-Tier zählt **eigene Rewrite-Versuche** pro Workorder/Run:

```text
Spark 3:
- max 2 REWRITE cycles
- after 2 failed rewrites → ESCALATE to Spark 4

Spark 4:
- max 2 REWRITE cycles
- after 2 failed rewrites → ESCALATE to Claude
```

**Wichtig:** Counter sind **per Tier isoliert**. Ein Spark-3-REWRITE-Limit
löst keinen Spark-4-REWRITE-Limit aus — das sind zwei separate Zähler.

Storage-Location ist **implementation-specific** und gehört in den `run state`
(z.B. `state.getRewriteCount(runId, tier)` / `state.incrementRewriteCount(runId, tier)`).
Dieses Detail ist nicht Teil dieser Rules.

**Beziehung zu MAX_REWRITE_LOOPS in `governance-validator.ts`:**
Das ist ein **anderer Counter** — der gilt für Governance-Violations beim
Orchestrator-Output (Spark 1). Verwechslung verboten.

| Counter | Domäne | Max | Datei |
|---|---|---|---|
| `MAX_REWRITE_LOOPS` | Spark 1 Orchestrator-Output | 2 | dispatcher.ts |
| `Tier Rewrite Counter` | Spark 3 / Spark 4 Review-Output | 2 | runReviewPipeline() |

---

## 12. Audit-Trail

Jeder Pipeline-Schritt muss auditiert werden:

```text
review_started        → reviewer, run_id, workorder_id, woType
review_completed      → status, risk, confidence, violations_count
review_escalated      → from (spark-c/spark-d), to (spark-d/claude), reason
review_rewrite_loop   → loop_count, reviewer
claude_call_allowed   → trigger (escalate | repeated_fail | architecture_unclear)
claude_call_blocked   → reason (no valid trigger)
```

Verwendet `audit-writer.ts` analog zur bestehenden Logik.

---

## 13. Implementierungs-Reihenfolge

```text
1. RULES.md           ← du liest gerade
2. governance-validator.ts  → ReviewState Enum + validateReviewOutput()
3. vllm-adapter.ts     → extractContentOnly() global + callGPTOSSReviewer()
4. model_routing.json  → fast-reviewer-agent + senior-reviewer-agent
5. dispatcher.ts       → runReviewPipeline() (separat, nicht integriert)
6. STACK_REFERENCE.md  → Routing-Sektion ergänzen
```

Jeder Schritt = ein Commit. Pipeline-Integration in `dispatchWorkorder()`
erfolgt erst nach isoliertem Test der Pipeline.
