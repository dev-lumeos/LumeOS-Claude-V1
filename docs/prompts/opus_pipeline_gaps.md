# LUMEOS — Pipeline Lücken 1-3 schliessen
# Classifier → Scheduler Verbindung + WO Schema Brücke + Echter E2E Test

---

## Kontext

Die drei letzten Lücken im kompletten WO Lifecycle:

1. **Lücke 1** — Classifier → Scheduler Verbindung fehlt
   Der Scheduler ignoriert routing.assigned_spark und dispatcht immer an Spark B
   
2. **Lücke 2** — WO Schema Brücke fehlt
   WOClassifierInput und WorkOrder (Supabase) haben unterschiedliche Felder
   Kein Mapping zwischen den zwei Schemas

3. **Lücke 3** — Kein echter End-to-End Flow
   test-first-real-wo.ts nutzt hartkodierten Dummy, kein echter klassifizierter WO

---

## WO-Pipeline-1: Classifier → Scheduler Verbindung

### Problem
`services/scheduler-api/src/workers.ts` hat aktuell:
```typescript
const endpoint = NODE_PROFILES['spark_b'].endpoint  // hardkodiert!
```

Der Scheduler weiss nicht welchen Spark der Classifier zugewiesen hat.

### Fix in `services/scheduler-api/src/workers.ts`

```typescript
// Lese assigned_spark aus WO routing
function getSparkEndpoint(wo: WorkOrder): string {
  const assignedSpark = wo.routing?.assigned_spark ?? 'spark_b'
  const profile = NODE_PROFILES[assignedSpark]
  if (!profile) {
    console.warn(`Unknown spark: ${assignedSpark}, fallback to spark_b`)
    return NODE_PROFILES['spark_b'].endpoint
  }
  return profile.endpoint
}
```

Passe `executeWorkOrder()` an um `getSparkEndpoint(wo)` zu nutzen statt hardkodiertem Spark B.

### Fix in `services/scheduler-api/src/dispatch-loop.ts`

Der Dispatch-Loop soll den Classifier aufrufen wenn ein WO noch kein routing hat:

```typescript
// Vor dem Dispatch:
if (!wo.routing?.assigned_spark) {
  const classified = await fetch('http://localhost:9000/classify', {
    method: 'POST',
    body: JSON.stringify(wo),
    headers: { 'Content-Type': 'application/json' }
  })
  const result = await classified.json()
  if (result.routing?.status === 'REJECTED') {
    // WO ablehnen, Fehler loggen
    continue
  }
  wo = { ...wo, ...result }
}
```

**Acceptance:** Scheduler dispatcht spark_a WOs an Spark A, spark_b an Spark B.

---

## WO-Pipeline-2: WO Schema Brücke

### Problem

```typescript
// WOClassifierInput (neu):
{ type: WOCategory, module: WOModule, complexity, risk, db_access, files_allowed, ... }

// WorkOrder (Supabase Schema):
{ wo_type: 'micro'|'macro', phase: number, dependencies: {...}, agent_type: string, ... }
```

Felder wie `module`, `complexity`, `risk`, `db_access`, `files_allowed`, `acceptance_criteria`
existieren nicht in der `workorders` Tabelle.

### Fix 1: Supabase Migration

Erstelle `supabase/migrations/20260424_002_wo_classifier_fields.sql`:

```sql
ALTER TABLE workorders
  ADD COLUMN IF NOT EXISTS wo_category    TEXT,
  ADD COLUMN IF NOT EXISTS wo_module      TEXT,
  ADD COLUMN IF NOT EXISTS wo_complexity  TEXT CHECK (wo_complexity IN ('low', 'medium', 'high')),
  ADD COLUMN IF NOT EXISTS wo_risk        TEXT CHECK (wo_risk IN ('low', 'medium', 'high')),
  ADD COLUMN IF NOT EXISTS db_access      TEXT CHECK (db_access IN ('none', 'read', 'write', 'migration')),
  ADD COLUMN IF NOT EXISTS files_allowed  TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS files_blocked  TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS assigned_spark TEXT,
  ADD COLUMN IF NOT EXISTS routing_reason TEXT,
  ADD COLUMN IF NOT EXISTS needs_db_check BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS requires_schema_change BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS wo_priority    INTEGER DEFAULT 2;
```

### Fix 2: Mapping Funktion

Erstelle `packages/wo-core/src/classifier-bridge.ts`:

```typescript
import type { WOClassifierOutput } from './classifier'
import type { WorkOrder } from './schema'

export function classifierOutputToWorkOrder(
  classified: WOClassifierOutput,
  existingWO?: Partial<WorkOrder>
): Partial<WorkOrder> {
  return {
    ...existingWO,
    wo_id:                classified.id,
    wo_type:              classified.complexity === 'low' ? 'micro' : 'macro',
    wo_category:          classified.type,
    wo_module:            classified.module,
    wo_complexity:        classified.complexity,
    wo_risk:              classified.risk,
    db_access:            classified.db_access,
    files_allowed:        classified.files_allowed,
    files_blocked:        classified.files_blocked ?? [],
    assigned_spark:       classified.routing.assigned_spark,
    routing_reason:       classified.routing.routing_reason,
    needs_db_check:       classified.routing.needs_db_check,
    requires_schema_change: classified.requires_schema_change,
    wo_priority:          classified.routing.priority,
    state:                'ready',
    agent_type:           classified.routing.assigned_spark,
  }
}
```

**Acceptance:**
- Migration läuft: `supabase db reset` oder `supabase migration up`
- `classifierOutputToWorkOrder()` produziert valides WorkOrder Objekt
- TypeScript kein Compile Error

---

## WO-Pipeline-3: Echter End-to-End Flow

Erstelle `tools/scripts/test-e2e-full-pipeline.ts`:

```typescript
/**
 * LumeOS — Voller E2E Pipeline Test
 * 
 * Flow:
 * 1. WO definieren (mit Classifier-kompatiblen Feldern)
 * 2. POST /classify (Port 9000) → routing
 * 3. classifierOutputToWorkOrder() → WorkOrder Objekt
 * 4. POST /compile (Port 9003, Spark A) → GovernanceArtefaktV3
 * 5. POST /check (Port 9001) → SAT-Check PASS
 * 6. createExecutionToken() → Ed25519 Token
 * 7. Supabase INSERT workorders
 * 8. vLLM Call auf assigned_spark (Spark A oder B)
 * 9. triple_hash Verification
 * 10. Supabase UPDATE state → done
 */

const TEST_WO = {
  id: `WO-e2e-${Date.now()}`,
  title: 'Add environment variable support to NODE_PROFILES',
  type: 'implementation',
  module: 'infra',
  complexity: 'low',
  risk: 'low',
  requires_reasoning: false,
  requires_schema_change: false,
  db_access: 'none',
  files_allowed: ['packages/agent-core/src/**'],
  acceptance_criteria: [
    'NODE_PROFILES nutzt process.env statt hardkodierten Strings',
    'TypeScript kompiliert ohne Fehler'
  ],
  created_by: 'human'
}
```

Testschritte mit ✅/❌ Ausgabe und klarem Fehler-Kontext.

**Acceptance:**
```
[Step 1] ✅ WO classified → spark_b
[Step 2] ✅ WO mapped to WorkOrder schema
[Step 3] ✅ Governance Artefakt compiled
[Step 4] ✅ SAT-Check: PASS
[Step 5] ✅ Execution Token: VERIFIED
[Step 6] ✅ WO written to Supabase
[Step 7] ✅ Execution on correct spark
[Step 8] ✅ triple_hash: PASS
[Step 9] ✅ WO state → done
9/9 steps passed
```

---

## Reihenfolge

```
WO-Pipeline-1: Scheduler Fix          (workers.ts + dispatch-loop.ts)
WO-Pipeline-2: Schema Brücke          (migration + classifier-bridge.ts)
WO-Pipeline-3: E2E Test               (test-e2e-full-pipeline.ts)
```

Alle Services müssen laufen:
```
pnpm --filter @lumeos/wo-classifier dev       # Port 9000
pnpm --filter @lumeos/sat-check dev           # Port 9001
pnpm --filter @lumeos/scheduler-api dev       # Port 9002
pnpm --filter @lumeos/governance-compiler dev # Port 9003
```

Starte mit WO-Pipeline-1.
