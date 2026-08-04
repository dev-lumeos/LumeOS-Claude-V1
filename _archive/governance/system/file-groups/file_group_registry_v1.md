# File Group Registry V1

Jede Gruppe ist ein valider Wert für `known_file_groups` in der Decomposition Spec.
Freier Text ist verboten. Jede Gruppe wird genau einmal definiert.

---

## apps/

| Group ID | Pfad |
|----------|------|
| `apps/web-root` | `apps/web/src/app/` |
| `apps/web/features/nutrition` | `apps/web/src/features/nutrition/` |
| `apps/web/features/training` | `apps/web/src/features/training/` |
| `apps/web/features/supplements` | `apps/web/src/features/supplements/` |
| `apps/web/features/recovery` | `apps/web/src/features/recovery/` |
| `apps/web/features/goals` | `apps/web/src/features/goals/` |
| `apps/web/features/coach` | `apps/web/src/features/coach/` |
| `apps/web/features/medical` | `apps/web/src/features/medical/` |
| `apps/web/features/marketplace` | `apps/web/src/features/marketplace/` |
| `apps/web/components` | `apps/web/src/components/` |
| `apps/web/hooks` | `apps/web/src/hooks/` |
| `apps/admin` | `apps/admin/src/` |
| `apps/buddy` | `apps/buddy/src/` |
| `apps/coach` | `apps/coach/src/` |
| `apps/staff` | `apps/staff/src/` |

> Regel: `apps/web-root` NICHT für Feature-WOs. Feature-Arbeit über `apps/web/features/*`.

---

## services/

| Group ID | Pfad |
|----------|------|
| `services/nutrition-api` | `services/nutrition-api/src/` |
| `services/training-api` | `services/training-api/src/` |
| `services/supplements-api` | `services/supplements-api/src/` |
| `services/recovery-api` | `services/recovery-api/src/` |
| `services/coach-api` | `services/coach-api/src/` |
| `services/medical-api` | `services/medical-api/src/` |
| `services/goals-api` | `services/goals-api/src/` |
| `services/marketplace-api` | `services/marketplace-api/src/` |
| `services/memory-api` | `services/memory-api/src/` |
| `services/analytics-api` | `services/analytics-api/src/` |
| `services/auth-api` | `services/auth-api/src/` |
| `services/admin-api` | `services/admin-api/src/` |
| `services/retrieval-api` | `services/retrieval-api/src/` |
| `services/orchestrator-api` | `services/orchestrator-api/src/` |

---

## packages/

| Group ID | Pfad |
|----------|------|
| `packages/types` | `packages/types/src/` |
| `packages/contracts` | `packages/contracts/src/` |
| `packages/shared` | `packages/shared/src/` |
| `packages/config` | `packages/config/src/` |
| `packages/ui` | `packages/ui/src/` |
| `packages/rules` | `packages/rules/src/` |
| `packages/wo-core` | `packages/wo-core/src/` |
| `packages/graph-core` | `packages/graph-core/src/` |
| `packages/scheduler-core` | `packages/scheduler-core/src/` |
| `packages/agent-core` | `packages/agent-core/src/` |
| `packages/memory-core` | `packages/memory-core/src/` |
| `packages/retrieval-core` | `packages/retrieval-core/src/` |
| `packages/tool-adapters` | `packages/tool-adapters/src/` |
| `packages/branch-db-core` | `packages/branch-db-core/src/` |

---

## db/ / system/ / infra/

| Group ID | Pfad |
|----------|------|
| `db/migrations` | `db/migrations/` |
| `db/schema` | `db/schema/` |
| `db/seeds` | `db/seeds/` |
| `system/workorders` | `system/workorders/` |
| `system/agent-registry` | `system/agent-registry/` |
| `system/memory/canonical` | `system/memory/canonical/` |
| `system/memory/events` | `system/memory/events/` |
| `system/memory/learning` | `system/memory/learning/` |
| `system/policies/gsd-v2` | `system/policies/gsd-v2/` |
| `infra/vllm` | `infra/vllm/` |
| `infra/qdrant` | `infra/qdrant/` |
| `infra/supabase` | `infra/supabase/` |

> Infra-Gruppen: nur mit `infra_override_approved: true`

---

## Layer → Group Mapping

| Layer | Erlaubte Prefixes | Einschränkung |
|-------|------------------|---------------|
| `types` | `packages/types`, `packages/contracts` | — |
| `service` | `services/*`, `packages/shared` | — |
| `ui` | `apps/*/features/*`, `apps/*/components` | web-root nicht für Features |
| `tests` | beliebige + `/__tests__/` | Nur Testpfade |
| `docs` | `docs/*` | — |
| `config` | `packages/config`, `services/*/config`, `.env.*` | — |
| `db` | `db/*` | Nur db-migration-agent |
| `meta` | `system/*` | Nur Orchestrator |
| `infra` | `infra/*` | Override Pflicht |

---

## WO-Level Konflikt-Regel

Wenn zwei WOs dieselbe Datei in `scope_files` haben → `conflicts_with` Pflicht.
Sonst: Validation Error in Stage 5 WO Factory.

---

*File Group Registry V1 — festgezogen*
