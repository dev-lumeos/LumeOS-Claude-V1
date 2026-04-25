# LumeOS — Commands & Startup Reference

> Alle wichtigen Befehle auf einen Blick.  
> Repo: `D:\GitHub\LumeOS-Claude-V1`

---

## 🚀 Alles starten (ein Befehl)

```powershell
powershell -ExecutionPolicy Bypass -File tools/scripts/start-all.ps1
```

Startet: Supabase · Grafana · Prometheus · WO Classifier · SAT-Check · Scheduler · Governance Compiler · windows_exporter · nvidia_metrics · claude-mem · LightRAG

---

## 📊 Status prüfen

```powershell
# Alle Services auf einmal
powershell -ExecutionPolicy Bypass -File tools/scripts/check-all-services.ps1

# Einzeln
curl http://localhost:9000/health   # WO Classifier
curl http://localhost:9001/health   # SAT-Check
curl http://localhost:9002/health   # Scheduler
curl http://localhost:9003/health   # Governance Compiler
curl http://localhost:9004/health   # LightRAG
```

---

## 🖥️ Dashboards

| Dashboard | URL | Login |
|-----------|-----|-------|
| Grafana WO Pipeline | http://localhost:3001 | admin / lumeos2026 |
| Grafana Hardware | http://localhost:3001 | admin / lumeos2026 |
| Supabase Studio | http://localhost:54323 | — |
| claude-mem Memory | http://localhost:37777 | — |

---

## ⚙️ Services einzeln starten

```powershell
# Control Plane (je in eigenem Terminal)
pnpm --filter @lumeos/wo-classifier dev        # Port 9000
pnpm --filter @lumeos/sat-check dev            # Port 9001
pnpm --filter @lumeos/scheduler-api dev        # Port 9002
pnpm --filter @lumeos/governance-compiler dev  # Port 9003

# Tools
powershell -ExecutionPolicy Bypass -File tools/scripts/start-claude-mem.ps1   # Port 37777
powershell -ExecutionPolicy Bypass -File tools/scripts/start-lightrag.ps1     # Port 9004
powershell -ExecutionPolicy Bypass -File tools/scripts/start-grafana.ps1      # Port 3001
powershell -ExecutionPolicy Bypass -File tools/scripts/start-monitoring.ps1   # Prometheus + Grafana

# Supabase
supabase start   # Port 54321/54322/54323
supabase stop
supabase status
```

---

## ⚡ Spark A / B

```powershell
# Status
curl http://192.168.0.128:8001/v1/models   # Spark A
curl http://192.168.0.188:8001/v1/models   # Spark B

# vLLM Metrics (Prometheus)
curl http://192.168.0.128:8001/metrics
curl http://192.168.0.188:8001/metrics

# Auf den Sparks (SSH mit NVIDIA Sync Key)
ssh -i "C:\Users\User\AppData\Local\NVIDIA Corporation\Sync\config\nvsync.key" admin@192.168.0.128
ssh -i "C:\Users\User\AppData\Local\NVIDIA Corporation\Sync\config\nvsync.key" admin@192.168.0.188

# GPU Status auf Spark
nvidia-smi
watch -n2 nvidia-smi

---

## 🧪 Tests ausführen

```powershell
# WO Classifier (5 Test Cases)
npx tsx tools/scripts/test-classifier.ts

# Control Plane E2E (SAT-Check + Token + Supabase + Scheduler)
npx tsx tools/scripts/test-control-plane-e2e.ts

# Voller Pipeline E2E (Classify → Compile → SAT → Token → Supabase)
npx tsx tools/scripts/test-e2e-full-pipeline.ts

# Voller Pipeline inkl. Spark B Execution + triple_hash
npx tsx tools/scripts/test-e2e-full-pipeline.ts --full

# Benchmark Spark B (10 parallele Requests)
powershell -ExecutionPolicy Bypass -File tools/scripts/benchmark-spark-b-10x.ps1
```

---

## 🔑 Ed25519 Keys generieren

```powershell
# Neue Keys generieren (für .env)
npx tsx tools/scripts/generate-ed25519-keys.ts

# Als shell export
npx tsx tools/scripts/generate-ed25519-keys.ts --shell

# Als JSON
npx tsx tools/scripts/generate-ed25519-keys.ts --json
```

---

## 🗃️ Supabase / Datenbank

```powershell
# Status
supabase status

# Reset (löscht alles + wendet alle Migrations neu an)
supabase db reset

# Migration anwenden
supabase migration up

# Neue Migration erstellen
supabase migration new <name>

# Direkt SQL ausführen
docker cp tools/scripts/seed.sql supabase_db_LumeOS-Claude-V1:/tmp/seed.sql
docker exec supabase_db_LumeOS-Claude-V1 psql -U postgres -d postgres -f /tmp/seed.sql
```

---

## 🧠 LightRAG Codebase Knowledge Graph

```powershell
# Codebase indexieren (naive/vector-only, ~5min)
python tools/lightrag/index_codebase.py

# Query ausführen
python tools/lightrag/query.py "Wie ist der SAT-Check implementiert?"
python tools/lightrag/query.py "Erkläre den WO Lifecycle" --mode hybrid

# Server starten (Port 9004)
powershell -ExecutionPolicy Bypass -File tools/scripts/start-lightrag.ps1

# HTTP Query
curl -X POST http://localhost:9004/query -H "Content-Type: application/json" -d "{\"question\":\"Was macht der Governance Compiler?\",\"mode\":\"naive\"}"
```

---

## 📦 Repo / Git

```powershell
# Status
git status
git log --oneline -10

# Commit + Push
git add .
git commit -m "feat: ..."
git push

# Alle Packages bauen
pnpm install
pnpm typecheck

# Workspace Status
pnpm --filter "*" list
```

---

## 🗂️ Wichtige Pfade

| Was | Pfad |
|-----|------|
| Alle Services starten | `tools/scripts/start-all.ps1` |
| Status prüfen | `tools/scripts/check-all-services.ps1` |
| Env Variables | `.env` (nicht im Git) |
| Env Vorlage | `.env.example` |
| Claude Instructions | `.claude/CLAUDE.md` |
| Hooks (Dangerous Ops) | `.claude/hooks/pre-tool.ps1` |
| Agents | `.claude/agents/*.md` |
| Prompts für Opus | `docs/prompts/` |
| TODOs | `docs/todos/` |
| Architecture Specs | `system/architecture/` |
| Governance Prompts | `system/prompts/governance/` |
| Grafana Dashboard JSON | `infra/grafana/` |
| Prometheus Config | `infra/prometheus/prometheus.yml` |
| vLLM Spark Setup | `infra/vllm/` |

---

## 🔴 Notfall-Befehle

```powershell
# Alle Docker Container stoppen (Supabase, Grafana, Prometheus)
docker stop $(docker ps -q)

# Nur Supabase stoppen
supabase stop

# vLLM auf Spark B stoppen (auf Spark B SSH)
docker stop spark-b-coder

# vLLM auf Spark A stoppen (auf Spark A SSH)
docker stop spark-a-governance

# Alle node Prozesse killen (Control Plane Services)
Get-Process node | Stop-Process -Force
```

---

*Zuletzt aktualisiert: 24. April 2026*
