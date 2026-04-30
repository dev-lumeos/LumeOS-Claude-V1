# LUMEOS — Open TODOs

Stand: April 2026 (aktualisiert nach Governance-Implementierung)

---

## Block 1 — Persistenz (KRITISCH, blockiert bei Reboot)

**Status: offen — entspricht Block F in SESSION_ONBOARDING.md**

### 1.1 systemd-Services auf allen 4 Sparks deployen
Files liegen unter `infra/systemd/spark-{a,b,c,d}/` mit README.md.

**Pro Spark zu tun:**
```bash
# Vom Threadripper aus
scp infra/systemd/spark-X/start-spark-X.sh  admin@<IP>:/home/admin/
scp infra/systemd/spark-X/spark-X.service   admin@<IP>:/tmp/

# Auf dem Spark via SSH
chmod +x /home/admin/start-spark-X.sh
sudo mv /tmp/spark-X.service /etc/systemd/system/
sudo systemctl daemon-reload

sudo systemctl enable spark-X
sudo systemctl start  spark-X
```

**IPs + Container-Namen zur Referenz:**
- Spark A: 192.168.0.128, Container `vllm-qwen`
- Spark B: 192.168.0.188, Container `spark-b-coder`
- Spark C: 192.168.0.99,  Container `vllm_node` (managed by launch-cluster.sh)
- Spark D: 192.168.0.101, Container `vllm_node` (managed by launch-cluster.sh)

### 1.2 Reboot-Test pro Spark
Nach Setup einmalig pro Spark `sudo reboot`. Nach ~2min healthcheck:
```bash
curl http://<IP>:8001/v1/models
```

---

## Block 2 — Markdown-Edit-Regeln für Claude

**Status: ✅ GELÖST.** Regeln in `docs/project/CLAUDE_EDIT_RULES.md`.
Regel: NIEMALS `edit_block` oder `str_replace` auf `.md` Files.
Stattdessen: `read_file` → vollständige Modifikation → `write_file`.

---

## Block 3 — Pre-existing Tech-Debt (während Session entdeckt)

### 3.1 `services/scheduler-api/src/vllm-adapter.ts:184`
Toter Code: `node === 'qwen3.6'` kann nie true sein weil
`NodeId = 'spark-a' | 'spark-b' | 'nemotron'`. Branch entfernen ODER NodeId
aktualisieren (nemotron ist nicht mehr aktuell → Workorder nötig).

### 3.2 `system/control-plane/dispatcher.ts:304+324`
Event-Types `'governance_parse_error'` und `'governance_violation'` sind nicht in
`audit-writer.ts` `EventType` registriert. TS-Fehler.

### 3.3 `system/control-plane/__tests__/smoke-test.ts` — 3/9 failing
Tests 6, 7A, 7B scheitern mit `Unbekannter Agent: undefined`. Pre-existing.

---

## Block 4 — Doku-Sweep

### 4.1 ✅ `STACK_REFERENCE.md` — Phase 2 als LIVE, alle 4 Sparks dokumentiert.
### 4.2 `infra/vllm/spark-a/setup.md` — Gemma-4-4B-Block streichen (nicht aktiv).
### 4.3 `infra/vllm/spark-b/setup.md` — komplett neu (beschreibt alten Stack).
### 4.4 `infra/vllm/spark-b/spark-b-start.sh` — veraltet, nach systemd-Deploy entfernen.
### 4.5 `infra/vllm/spark-c/`, `infra/vllm/spark-d/` — Setup-Doku anlegen.
### 4.6 `docs/reports/benchmark_spark_b_20260423.md` — als historisch markieren.
### 4.7 `system/model-tiers/model_tiers_v2.md` — Spark 3+4 ergänzen (veraltet).
### 4.8 `system/model-tiers/model_registry_v2.md` — Spark C+D Sektionen ergänzen.

---

## Block 5 — Agent-Updates

### 5.1 `.claude/agents/fast-reviewer-agent.md` + `senior-reviewer-agent.md` anlegen.
### 5.2 `.claude/agents/senior-coding-agent.md` updaten.
### 5.3 `.claude/agents/pre-review-agent.md` / `post-review-agent.md` entscheiden.

---

## Block 6 — Review-Pipeline V2

**Status: ✅ ERLEDIGT** (Review-Pipeline V2 implementiert und verifiziert).

Alle Sub-Tasks (6.1–6.4) sind Teil der implementierten Review-Pipeline V2.
Details: `system/control-plane/review-pipeline.ts`

---

## Block 7 — Open Brainstorm-Items (kein klarer Action-Owner)

### 7.1 DeepSeek V4 Pro Eval via OpenRouter — nicht akut, Spark D füllt die Lücke.
### 7.2 End-to-End Real Run mit echtem Spark 1 Orchestrator — wartet auf systemd.
### 7.3 Pipeline-Run via dispatch-loop / Hono `/dispatch` — wartet auf WO-Tabelle.

---

## Was schon FERTIG ist (nicht nochmal anfassen)

- ✅ Review-Pipeline V2 (Auto-Retry, Metriken, Spark C/D Integration)
- ✅ Workorder-Schema (risk_category, files_blocked, rollback_hint)
- ✅ Risk-Categories zentralisiert (risk-categories.ts, 13 Kategorien)
- ✅ Files Enforcement (Post-Execution Scope Check)
- ✅ Scope-/DB-Migration-Locks
- ✅ WO-State-Machine (WO_TRANSITIONS formal erzwungen)
- ✅ Scheduler Preflight (12 Checks, GO/HOLD/REJECT)
- ✅ Kill-Switch / System Stop
- ✅ Automatische Stop-Trigger (5 Regeln)
- ✅ Approval Queue (State Machine + CLI)
- ✅ Night-Run-Policy V1
- ✅ Run Summary Generator
- ✅ Morning Report
- ✅ Failed WO Report
- ✅ Model Quality Report
- ✅ Completed WO Dossier Generator
- ✅ Docs-Governance V1 (SSOT-Matrix, Drift-Checker)
- ✅ USER_MANUAL.md, WORKORDER_CREATION_HANDBOOK.md, Masterprompts
- ✅ CLAUDE.md bereinigt (aktuelle Runtime-Anweisungen)
- ✅ SESSION_ONBOARDING.md auf aktuellem Stand
