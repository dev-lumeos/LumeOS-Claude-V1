# Agents & Skills — Konzept für Endstand
# Status: Analyse + Roadmap
# Erstellt: 25. April 2026

---

## Aktueller Stand

### Agents (.claude/agents/) — 5 vorhanden

| Agent | Spark | Modell | Status |
|-------|-------|--------|--------|
| governance-compiler | A | Qwen3.6-35B-FP8 | ✅ korrekt |
| micro-executor | B | Qwen3-Coder-30B-FP8 | ✅ korrekt |
| review-agent | B | Qwen3-Coder-30B-FP8 | ✅ OK |
| context-builder | B | Qwen3-Coder-30B-FP8 | ✅ OK |
| security-specialist | B | Qwen3-Coder-30B-FP8 | ✅ OK |

### Skills (.claude/skills/) — 22 vorhanden

**Control Plane / Workflow:**
- gsd-v2 ✅
- wo-writer ✅
- decomposition-to-workorders ✅
- spec-to-decomposition ✅
- rawdata-to-spec ✅
- chat-to-rawdata ✅
- spec-analyst ✅
- review-wo-batch ✅

**Technical Specialists:**
- backend-specialist ✅
- frontend-specialist ✅
- typescript-specialist ✅
- supabase-specialist ✅
- security-specialist ✅
- test-specialist ✅
- github-specialist ✅
- doc-specialist ✅

**Domain Specialists (LumeOS App):**
- nutrition-specialist ✅
- training-specialist ✅
- coach-specialist ✅
- recovery-specialist ✅
- medical-specialist ✅
- marketplace-specialist ✅

---

## Was fehlt für den Endstand

### Agents — 4 fehlen (alle Spark C+D)

| Agent | Spark | Modell | Rolle | Wann |
|-------|-------|--------|-------|------|
| **orchestrator** | C | Qwen3.5-122B | Automatischer WO Loop, Routing, System Health | Spark C |
| **bulk-executor** | C | Qwen3.5-122B | Low/Medium WOs, max 8 parallel | Spark C |
| **db-checker** | D | Qwen3-Coder-Next | Schema Validation, RLS, Migration Safety | Spark D |
| **acceptance-verifier** | D | Qwen3-Coder-Next | Acceptance Criteria Check nach Execution | Spark D |

### Skills — 5 fehlen

| Skill | Beschreibung | Wann |
|-------|-------------|------|
| **vllm-specialist** | vLLM Konfiguration, Modell-Load, Performance-Tuning | Jetzt sinnvoll |
| **wo-classifier-specialist** | WO Classifier Regeln debuggen und erweitern | Jetzt sinnvoll |
| **orchestrator-specialist** | Orchestrator Service konfigurieren, Loops debuggen | Spark C |
| **grafana-specialist** | Grafana Dashboards, Prometheus Queries, Alerting | Jetzt sinnvoll |
| **supplements-specialist** | LumeOS Supplement Domäne | LumeOS App Phase |

---

## Agents — Konzept Endstand (wenn Spark C+D da)

### orchestrator.md (Spark C)
```
endpoint: http://<spark-c>:8001
model: qwen3.5-122b
temperature: 0.3

Aufgabe:
- Überwacht workorders Tabelle via Supabase Realtime
- Dispatcht WOs automatisch durch die Pipeline
- Health Check aller Services
- Eskalations-Entscheidungen

Erlaubt: Alle Services aufrufen (9000-9003), Supabase lesen/schreiben
Verboten: Direkt Code generieren, Governance-Artefakte erstellen
```

### bulk-executor.md (Spark C)
```
endpoint: http://<spark-c>:8001
model: qwen3.5-122b
temperature: 0.0
seed: 42
max_concurrent: 8

Aufgabe:
- Low/Medium complexity WOs parallel ausführen
- type=implementation, complexity=low/medium, risk=low

Verboten: High-risk WOs, Schema-Changes, Auth-Module
```

### db-checker.md (Spark D)
```
endpoint: http://<spark-d>:8001
model: qwen3-coder-next
temperature: 0.0

Aufgabe:
- Schema Validation (ALTER TABLE, ADD COLUMN Safety)
- RLS Policy Check (kein ungesicherter Zugriff)
- Migration Safety (reversibel, keine Datenverluste)
- DB_CHECK_PASS oder DB_CHECK_FAIL zurückgeben

Modus: Read-only auf DB Schema, kein Schreibzugriff
```

### acceptance-verifier.md (Spark D)
```
endpoint: http://<spark-d>:8001
model: qwen3-coder-next
temperature: 0.0

Aufgabe:
- Prüft jeden Acceptance Criterion eines WOs
- Liest generierte Files und vergleicht mit Criteria
- acceptance_verified=true nur dieser Agent darf das setzen
- ACCEPTANCE_PASS oder ACCEPTANCE_FAIL zurückgeben

Verboten: Code ändern, Files schreiben
```

---

## Skills — Konzept fehlende Skills

### vllm-specialist/SKILL.md
```
Spezialist für vLLM Konfiguration auf GB10 Sparks.
- VLLM_FLASHINFER_MOE_BACKEND=latency (IMMER)
- gpu_memory_utilization korrekt setzen
- max_model_len vs KV Cache Balance
- CUDA Forward Compatibility (reboot nach Updates)
- Performance Tuning (prefix caching, tool-call-parser)
```

### wo-classifier-specialist/SKILL.md
```
Spezialist für WO Classifier Regeln.
- Routing-Regeln in services/wo-classifier/src/rules/ erweitern
- SPARK_C_AVAILABLE / SPARK_D_AVAILABLE Flags
- Neue WO Types / Modules hinzufügen
- Classifier Tests in tools/scripts/test-classifier.ts
```

### grafana-specialist/SKILL.md
```
Spezialist für Grafana + Prometheus.
- Dashboard JSON via Grafana API importieren
- Prometheus Query Syntax (rate, histogram_quantile)
- Panel Types (Stat, Time Series, Gauge, Table)
- Alert Rules konfigurieren
- Dashboard für neue Services erweitern
```

---

## Priorisierung

### Sofort sinnvoll (heute machen)
- vllm-specialist SKILL
- wo-classifier-specialist SKILL
- grafana-specialist SKILL

### Wenn Spark C+D ankommen
- orchestrator.md Agent
- bulk-executor.md Agent
- db-checker.md Agent
- acceptance-verifier.md Agent
- orchestrator-specialist SKILL

### LumeOS App Phase
- supplements-specialist SKILL (fehlt noch)

---

## Bestehende Skills die geupdated werden sollten

| Skill | Problem | Fix |
|-------|---------|-----|
| decomposition-to-workorders | Referenziert altes WO Format | Neues WOClassifierInput Format verwenden |
| wo-writer | Kimi K2.6 Macro Executor nicht implementiert | Notiz: kommt mit Spark D |
| supabase-specialist | Keine Control Plane Tabellen erwähnt | workorders, governance_artefacts etc. ergänzen |
| backend-specialist | Neue Services (wo-classifier, sat-check etc.) nicht bekannt | Port Liste ergänzen |
