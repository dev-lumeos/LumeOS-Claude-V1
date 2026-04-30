# Current Truth Cleanup Report

**Stand:** April 2026
**Zweck:** Bereinigung veralteter Aussagen in Current-Truth-Dateien

---

## Scope

Untersucht wurden:
- `system/memory/canonical/`
- `docs/project/`
- `docs/BrainstormDocs/` (stichprobenartig)
- `README.md`
- `CLAUDE.md`
- `SESSION_ONBOARDING.md`
- `STACK_REFERENCE.md`
- `tools/onyx/seed/lumeos-governance-current-truth/`

---

## Files Audited

| Datei | Altlasten gefunden | Aktion |
|---|---|---|
| `system/memory/canonical/lumeos_canonical.md` | JA — kritisch | UPDATE_CURRENT_TRUTH ✅ |
| `README.md` | JA — Kimi K2.6, Spark A+B only | UPDATE_CURRENT_TRUTH ✅ |
| `docs/project/OPEN_TODOS.md` | JA — Block 6 als offen markiert obwohl erledigt | UPDATE_CURRENT_TRUTH ✅ |
| `docs/BrainstormDocs/` (alle Unterordner) | STRUKTURELL — historische Inhalte ohne Archive-Kennzeichnung | MARK_DEPRECATED ✅ |
| `tools/onyx/seed/lumeos-governance-current-truth/README.md` | JA — Kimi K2.6 | UPDATE_CURRENT_TRUTH ✅ |
| `tools/onyx/seed/lumeos-governance-current-truth/CLAUDE.md` | NEIN — bereits aktuell | NO_CHANGE |
| `CLAUDE.md` | NEIN — frisch bereinigt | NO_CHANGE |
| `SESSION_ONBOARDING.md` | NEIN — frisch aktualisiert | NO_CHANGE |
| `STACK_REFERENCE.md` | NEIN — aktuell | NO_CHANGE |
| `docs/project/USER_MANUAL.md` | NEIN — neu erstellt | NO_CHANGE |
| `docs/project/WORKORDER_CREATION_HANDBOOK.md` | NEIN — neu erstellt | NO_CHANGE |

---

## Confirmed Current Truth Files

Diese Dateien sind verified current truth und können in Onyx Current-Truth Sets verwendet werden:

- `CLAUDE.md`
- `SESSION_ONBOARDING.md`
- `STACK_REFERENCE.md`
- `AGENTS.md`
- `docs/project/USER_MANUAL.md`
- `docs/project/WORKORDER_CREATION_HANDBOOK.md`
- `docs/project/DOCS_GOVERNANCE.md`
- `system/memory/canonical/lumeos_canonical.md` (nach Update)
- `system/control-plane/risk-categories.ts`
- `system/control-plane/scheduler-preflight.ts`
- `system/control-plane/night-run-policy.ts`
- `system/control-plane/stop-rules.ts`
- `system/control-plane/docs-drift-checker.ts`
- `system/workorders/schemas/workorder.schema.json`
- `system/agent-registry/agents.json`
- `system/agent-registry/model_routing.json`
- `system/approval/approval-queue.ts`
- `system/approval/approval-cli.ts`
- `system/reports/morning-report.ts`
- `system/reports/failed-wo-report.ts`
- `system/reports/model-quality-report.ts`
- `system/reports/wo-dossier.ts`
- `README.md` (nach Update)

---

## Deprecated / Historical Files

Diese Dateien sind historisch und dürfen NICHT als Current Truth verwendet werden:

- `docs/BrainstormDocs/**` — Alle Dateien: historische Design-Entscheidungen, keine Runtime-Wahrheit
- `docs/prompts/**` — einmalige historische Prompts
- `system/prompts/**` — falls vorhanden: historische Prompts
- `system/memory/archive/**` — falls angelegt: archivierte Inhalte
- `tools/onyx/seed/lumeos-governance-seed/**` — ältere Seed-Version
- `tools/onyx/seed/lumeos-governance-seed-expanded/**` — ältere erweiterte Seed-Version

---

## Gefundene Altlasten (Detail)

### 1. `lumeos_canonical.md` — Kritisch

| Altlast | Warum veraltet |
|---|---|
| Phase 2 PENDING — Spark 3+4 unterwegs | Phase 2 ist LIVE, alle 4 Sparks aktiv |
| Nemotron als Orchestrator (Phase 2 Zielstack) | Orchestrator ist Qwen3.6 auf Spark A |
| MiniMax M2.7 als Spark 3+4 Modelle | Spark C = Gemma 4, Spark D = GPT-OSS |
| Port 9005 Orchestrator wartet auf Nemotron | Port 9005 nicht aktiv |
| Nutrition-API wartet auf Supabase Cloud | Kein aktueller Implementierungsstand |
| triple_hash Verifikation | Nicht Teil des aktuellen Governance-Systems |
| Ed25519 Token | Nicht Teil des aktuellen Governance-Systems |

### 2. `README.md`

| Altlast | Warum veraltet |
|---|---|
| Kimi K2.6 (macro executor + escalation) | Nicht mehr Teil des Stacks |
| Muscle — DGX Spark A+B | Es sind jetzt 4 Sparks (A+B+C+D) |
| Key Docs zeigen alte system/-Pfade | Neue Docs unter docs/project/ |

### 3. `docs/project/OPEN_TODOS.md`

| Altlast | Warum veraltet |
|---|---|
| Block 6 als offen gelistet | Review-Pipeline V2 ist implementiert ✅ |
| Viele Governance-Blöcke nicht als done | A–E sind alle implementiert ✅ |

---

## Updated Files

| Datei | Was geändert |
|---|---|
| `system/memory/canonical/lumeos_canonical.md` | Vollständig auf Phase 2 LIVE aktualisiert, veraltete Annahmen entfernt, CURRENT TRUTH Header hinzugefügt |
| `README.md` | Kimi K2.6 entfernt, alle 4 Sparks, aktuelle Key Docs |
| `docs/project/OPEN_TODOS.md` | Block 6 als erledigt markiert, alle implementierten Governance-Blöcke als ✅ done |
| `docs/BrainstormDocs/_ARCHIVE_NOTICE.md` | Neu: Archive-Notice für gesamten BrainstormDocs-Ordner |
| `tools/onyx/seed/lumeos-governance-current-truth/README.md` | Kimi K2.6 entfernt, alle 4 Sparks |

---

## Remaining Review Required

| Datei | Problem | Empfehlung |
|---|---|---|
| `system/model-tiers/model_tiers_v2.md` | Spark 3+4 fehlen, alte Belegung | Workorder für Update erstellen |
| `system/model-tiers/model_registry_v2.md` | Spark C+D Sektionen fehlen | Workorder für Update erstellen |
| `infra/vllm/spark-b/setup.md` | Beschreibt alten Stack | Als historisch markieren oder neu schreiben |
| `infra/vllm/spark-b/spark-b-start.sh` | Startet alten Stack | Nach systemd-Deploy entfernen |
| `docs/reports/benchmark_spark_b_20260423.md` | Misst nicht-aktuelles Modell | Als historisch markieren |
| `services/scheduler-api/src/vllm-adapter.ts:184` | `NodeId` enthält 'nemotron' als toten Branch | Tech-Debt Workorder (Block 3.1) |
| `tools/onyx/seed/lumeos-governance-seed/` | Ältere Seed-Version mit veralteten Inhalten | Nicht für Current-Truth verwenden |
| `tools/onyx/seed/lumeos-governance-seed-expanded/` | Erweiterte ältere Version | Nicht für Current-Truth verwenden |

---

## Onyx Document Set Regeln

### Current-Truth Document Sets dürfen NICHT enthalten

```
docs/BrainstormDocs/**
docs/prompts/**
system/prompts/**
system/memory/archive/**
tools/onyx/seed/lumeos-governance-seed/**
tools/onyx/seed/lumeos-governance-seed-expanded/**
node_modules/**
```

### Current-Truth Document Sets dürfen enthalten

```
CLAUDE.md
README.md
SESSION_ONBOARDING.md
STACK_REFERENCE.md
AGENTS.md
docs/project/**
system/control-plane/**
system/approval/**
system/reports/**
system/workorders/schemas/**
system/agent-registry/**
system/memory/canonical/lumeos_canonical.md
```

### Onyx POC Hinweis

- Onyx läuft als Research Core V1 unter `tools/onyx/onyx_data/`
- UI: http://localhost:3100
- Onyx nutzt LM Studio auf RTX 5090 — NICHT die DGX Sparks
- DGX Sparks bleiben für Onyx unangetastet

---

## Zusammenfassung

| Kategorie | Anzahl |
|---|---|
| Dateien auditiert | 12 |
| Aktualisiert | 5 |
| Keine Änderung nötig | 7 |
| Noch Review erforderlich | 8 |
| Kritische Altlasten beseitigt | 7 |
