# LUMEOS — Open TODOs

Stand: 29. April 2026 (nach V1 Review-Pipeline-Integration)

Diese Datei hält offene Action-Items fest die wir während/nach der Pipeline-Session
identifiziert aber nicht abgeschlossen haben. Alle 4 Sparks laufen aktuell als
manuelle Container — Persistenz ist der dringendste Punkt.

---

## Block 1 — Persistenz (KRITISCH, blockiert bei Reboot)

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

# Bestehenden Container/Prozess stoppen damit der Service ihn übernehmen kann
docker stop <container-name> 2>/dev/null
docker rm   <container-name> 2>/dev/null    # nur Spark 1+2
# oder für Spark 3+4: cd ~/spark-vllm-docker && ./launch-cluster.sh stop

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
Wenn Modell antwortet → Persistenz bewiesen.

---

## Block 2 — Markdown-Edit-Regeln für Claude (GELÖST via Regelwerk)

**Status: GELÖST.** Siehe `docs/project/CLAUDE_EDIT_RULES.md` für die vollständigen
Regeln. Pflichtlektüre für jede neue Claude-Session.

### Was war das Problem
Tabellen wurden in Markdown-Files mehrfach zerstört (Pipes verschwunden, Zeilen
zusammengezogen, URLs in `<...>` Brackets). Ursprüngliche Hypothese war IDE-Auto-
Format — Tom hat verifiziert: keine externen Tools sind involviert. Verursacher
ist Claude's eigenes Edit-Tooling (`edit_block`, `str_replace`).

### Pathologie
String-Replace-Semantik dieser Tools ist bei Markdown brüchig:
- Pipes (`|`) sind Tabellen-Syntax aber sehen wie Inline-Zeichen aus
- Whitespace in Tabellen variiert (`|---|` vs `| --- |`)
- Wenn `old_string` durch Whitespace-Drift nicht 1:1 matcht, fällt das Tool in
  einen best-effort-Modus → Pipes/Newlines verloren

### Regel ab jetzt
- **NIEMALS `edit_block` oder `str_replace` auf `.md` Files**
- Stattdessen: `read_file` → komplette Modifikation in der Antwort vorbereiten →
  `write_file` (komplette Überschreibung)
- Nach jedem Markdown-Write: `git diff` zur Verifikation
- TS, JSON, YAML, Python: `edit_block` weiter ok (deterministisches Whitespace)

### Bekannt fehlerhafte Files (wenn im Block 4 angefasst, NEU schreiben statt fixen)
- `docs/project/STACK_REFERENCE.md`
- `docs/reports/benchmark_spark_a_20260423.md`
- `docs/reports/benchmark_spark_b_20260423.md`
- `infra/vllm/spark-a/setup.md`
- `infra/vllm/spark-b/setup.md`

---

## Block 3 — Pre-existing Tech-Debt (während Session entdeckt, nicht von uns verursacht)

### 3.1 `services/scheduler-api/src/vllm-adapter.ts:184`
Toter Code: `node === 'qwen3.6'` kann nie true sein weil
`NodeId = 'spark-a' | 'spark-b' | 'nemotron'`. Branch entfernen ODER NodeId um
`'qwen3.6'` erweitern.

### 3.2 `system/control-plane/dispatcher.ts:304+324`
Event-Types `'governance_parse_error'` und `'governance_violation'` werden im
Code geschrieben, sind aber nicht in `audit-writer.ts` `EventType` registriert.
TS meldet `Type ... is not assignable to type 'EventType'`.

**Quick-Fix:** Beide Events in `audit-writer.ts` ergänzen analog zu den
`review_pipeline_*` Events:
```ts
| 'governance_parse_error' | 'governance_violation'
```
Plus in `VALID_EVENTS` Set.

### 3.3 `system/control-plane/__tests__/smoke-test.ts` — 3/9 failing
Tests 6, 7A, 7B scheitern alle mit `Unbekannter Agent: undefined`.
Pre-existing, nicht durch Pipeline-Integration verursacht (verifiziert via
`git stash` Test). Vermutung: agents.json oder model_routing.json hat Drift,
oder der Smoke-Test legt sein Test-Fixture nicht korrekt auf.

---

## Block 4 — Doku-Sweep (Phase 2 Cleanup)

**Wichtig:** Alle .md Files in diesem Block werden nach den Regeln aus
`CLAUDE_EDIT_RULES.md` editiert (write_file komplett, kein edit_block).

### 4.1 `docs/project/STACK_REFERENCE.md`
- Phase 2 als `LIVE` markieren statt `PENDING`
- Hardware-Tabelle um Spark 3 + 4 erweitern (Gemma 4, GPT-OSS)
- Spark 2 GPU-Util korrigieren: `0.80` → `0.88` (live-verifiziert)
- Image-Source-Inkonsistenz dokumentieren:
  - Spark 1: `vllm/vllm-openai:cu130-nightly` (Community)
  - Spark 2: `nvcr.io/nvidia/vllm:26.03-py3` (NGC)
  - Spark 3+4: `vllm-node` lokal (eugr Custom Build)
- Tool-Calling-Status pro Spark dokumentieren (Spark 1 hat keinen)
- senior-coding-agent Modell aktualisieren

### 4.2 `infra/vllm/spark-a/setup.md`
Gemma-4-4B-Block streichen (`spark-a-light-gemma`, Port 8011) — nicht aktiv,
verwirrend.

### 4.3 `infra/vllm/spark-b/setup.md` — komplett neu
Aktuell beschreibt Qwen3.5-122B + DeepSeek-R1-8B — ist 1-2 Iterationen alt.
Live ist Coder-Next-FP8 (siehe `infra/systemd/spark-b/start-spark-b.sh`).

### 4.4 `infra/vllm/spark-b/spark-b-start.sh` — komplett neu oder löschen
Startet alten Stack. Wird nach systemd-Deploy nicht mehr gebraucht aber sollte
nicht verwirren.

### 4.5 `infra/vllm/spark-c/`, `infra/vllm/spark-d/` neu anlegen
Setup-Doku für Gemma 4 / GPT-OSS basierend auf `infra/systemd/spark-{c,d}/`.

### 4.6 `docs/reports/benchmark_spark_b_20260423.md`
Misst `Qwen3-Coder-30B-A3B-Instruct-FP8` — nicht den heute laufenden
`Qwen3-Coder-Next-FP8`. Entweder neu messen oder als „historisch" markieren.

### 4.7 `system/model-tiers/model_tiers_v2.md`
Phase 2 Cleanup — Spark 3, 4 fehlen, alte Belegung mit Qwen3.5-122B etc steht
noch drin.

### 4.8 `system/model-tiers/model_registry_v2.md`
Spark 3 + 4 Sektionen ergänzen analog zu Spark A/B (mit Pflichtregeln-Block
für GPT-OSS analog zu Qwen3.6).

### 4.9 `system/agent-registry/model_routing.json`
- `_hardware` Notes für Spark 3 + 4 ergänzen
- `_qwen3.6_notes` ggf. erweitern um GPT-OSS-Reasoning-Filter
- Pre-existing Notes auf aktuellen Stand bringen

(JSON-Datei → `edit_block` ist hier ok laut CLAUDE_EDIT_RULES.md)

---

## Block 5 — Agent-Updates (Phase 2)

Mit nächstem Agent-Sweep wenn alle 4 Sparks stabil laufen:

### 5.1 `.claude/agents/` neue Definitionen
- `fast-reviewer-agent.md` — Spark 3 / Gemma 4
- `senior-reviewer-agent.md` — Spark 4 / GPT-OSS

### 5.2 `.claude/agents/senior-coding-agent.md` updaten
Trigger: nicht mehr „all senior tasks", sondern explizit
`spark_d_escalate_or_repeated_fail`.

### 5.3 `.claude/agents/pre-review-agent.md` / `post-review-agent.md`
Entscheiden: bleiben auf Spark 1 (Qwen3.6) oder zu Spark 3 (Gemma 4) verschieben?
RULES.md Sektion 2 hat das offen gelassen.

---

## Block 6 — Review-Pipeline V2 (nach V1-Stabilisierung)

V1 ist verifiziert (alle 3 Outcomes real getestet, 19/19 Mock-Tests). V2 sind
echte Verbesserungen, keine Bugfixes.

### 6.1 State-persisted Rewrite-Counter
V1: Counter sind lokal in `runReviewPipeline()`. Bei jedem Aufruf neu auf 0.
V2: `state.getRewriteCount(runId, tier)` + `state.incrementRewriteCount(...)`.
Ermöglicht Loop-Tracking über mehrere Worker-Re-Runs hinweg.

### 6.2 Auto-Retry im Dispatcher
V1: REWRITE → `status: failed`, Caller muss separat retriggern.
V2: Dispatcher startet Worker neu, max N Mal, dann eskalieren.
Tom hatte explizit gesagt: kein Auto-Retry in V1 wegen Chaos-Risiko.

### 6.3 Pipeline-Metrics
- Latency pro Tier (Spark 3 vs Spark 4)
- Escalation Rate (% Workorders die zu Spark 4 / Claude eskalieren)
- Confidence-Distribution
- Pipeline-Hit-Rate vs Direct-Pass

Würde in `system/state/metrics.jsonl` oder via Prometheus-Endpoint laufen.

### 6.4 HTTP-Level Healthcheck
systemd merkt nur ob der Prozess lebt. Wenn vLLM hängt aber Prozess da bleibt,
kein Restart.

Lösung: separater systemd timer (`spark-X-healthcheck.timer`) der alle 60s
`curl http://<spark>:8001/v1/models` macht und bei Fehler `systemctl restart
spark-X` triggert.

---

## Block 7 — Open Brainstorm-Items (kein klarer Action-Owner)

### 7.1 DeepSeek V4 Pro Eval via OpenRouter
- Als senior-coder Cloud-Fallback Kandidat
- Discount $0.435/$0.87 in (bis 5.5.2026)
- Vergleichstest gegen Kimi Code auf 10–20 echten LUMEOS Workorders
- Aktuell nicht akut weil Spark 4 (GPT-OSS) lokal die Senior-Lücke füllt

### 7.2 End-to-End Real Run mit echtem Spark 1 Orchestrator
`dispatcher-real-run.ts` stubbt aktuell `callModel` (Spark 1 Orchestrator) und
`executeTool` (Spark 2 Worker). Echter E2E-Test mit allen 4 Sparks im Loop wäre
„Skript B" — wartet auf stabile systemd-Setups + funktionalen Test-WO-Generator.

### 7.3 Pipeline-Run via dispatch-loop / Hono `/dispatch`
Nicht direkt `dispatchWorkorder()` aufrufen sondern via:
- Test-WO mit `state: ready` in Supabase einfügen
- Loop pickt nach 5s
- Vollständiger Service-Pfad

Setzt funktionale Supabase-WO-Tabelle voraus. Phase 3 / nach Permission Gateway V0.3.

---

## Was schon FERTIG ist (nicht nochmal anfassen)

- ✅ RULES.md als Single Source of Truth (`system/control-plane/RULES.md`)
- ✅ CLAUDE_EDIT_RULES.md als Markdown-Edit-Regelwerk
- ✅ governance-validator.ts Review-Types
- ✅ vllm-adapter.ts mit `extractContentOnly`, `callGemmaReviewer`, `callGPTOSSReviewer`
- ✅ model_routing.json mit fast-reviewer-agent + senior-reviewer-agent
- ✅ review-pipeline.ts mit allen Routing-Regeln
- ✅ pipeline-audit.ts (eigenes JSONL)
- ✅ audit-writer.ts mit 4 review_pipeline_* Events
- ✅ Dispatcher-Hook integriert (write-only, status-mapping)
- ✅ 19/19 Mock-Tests
- ✅ Live-Smoke + dispatcher-real-run (PASS path) verifiziert
- ✅ dispatcher-negative-runs (REWRITE + HUMAN_NEEDED) verifiziert
- ✅ systemd Service-Files für alle 4 Sparks generiert (in `infra/systemd/`)

V1 der Review-Pipeline ist abgeschlossen und ready zum Deployment.
