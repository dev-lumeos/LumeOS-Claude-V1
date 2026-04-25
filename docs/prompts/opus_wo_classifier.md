# LUMEOS — WO Classifier Implementation
# Deterministischer Pre-Router vor dem Scheduler
# Basis: WO_CLASSIFIER_V1.md + WO_SCHEMA_V1.md

---

## Kontext

Der WO Classifier ist der einzige fehlende Baustein zwischen Brain und Law.
Heute dispatched der Scheduler ohne zu wissen welcher Spark der richtige ist.
Der Classifier löst das deterministisch — regelbasiert, kein LLM.

Bestehende Services:
- SAT-Check:            Port 9001 ✅
- Scheduler:            Port 9002 ✅
- Governance Compiler:  Port 9003 ✅

Der Classifier wird Port 9000 — er steht VOR dem Scheduler.

---

## Flow nach Implementation

```
Tom / Brain erstellt Macro-WO
  ↓
POST /classify  (Port 9000)   ← NEU
  ↓ routing annotiert
POST /compile   (Port 9003)   Governance Compiler → Artefakt
  ↓
POST /check     (Port 9001)   SAT-Check
  ↓
POST /dispatch  (Port 9002)   Scheduler → Spark A oder B
  ↓
triple_hash + Ed25519
  ↓
Supabase Audit
```

---

## WO Schema Erweiterung

Erweitere `packages/wo-core/src/schema.ts` um folgende Pflichtfelder:

```typescript
export type WOType =
  | 'implementation' | 'review' | 'migration'
  | 'docs' | 'test' | 'analysis' | 'planning' | 'governance'

export type WOModule =
  | 'nutrition' | 'training' | 'coach' | 'supplement'
  | 'medical' | 'auth' | 'infra' | 'marketplace' | 'cross'

export type WOComplexity = 'low' | 'medium' | 'high'
export type WORisk       = 'low' | 'medium' | 'high'
export type DBAccess     = 'none' | 'read' | 'write' | 'migration'

export interface WOClassifierInput {
  id:                    string
  title:                 string
  type:                  WOType
  module:                WOModule
  complexity:            WOComplexity
  risk:                  WORisk
  requires_reasoning:    boolean
  requires_schema_change: boolean
  db_access:             DBAccess
  files_allowed:         string[]   // min 1, kein reines "*"
  files_blocked?:        string[]
  acceptance_criteria:   string[]   // min 1
  created_by:            'human' | 'spark1' | 'spark4'
}

export type SparkTarget = 'spark_a' | 'spark_b' | 'spark_c' | 'spark_d'

export interface WORouting {
  assigned_spark:  SparkTarget
  assigned_by:     'classifier'
  routing_reason:  string
  needs_db_check:  boolean
  priority:        0 | 1 | 2 | 3   // 0=CRITICAL, 1=HIGH, 2=NORMAL, 3=LOW
  status:          'QUEUED' | 'REJECTED'
}

export interface WOClassifierOutput extends WOClassifierInput {
  routing: WORouting
}
```

---

## Classifier Service

Erstelle `services/wo-classifier/` als Hono Service auf Port 9000.

### Dateistruktur

```
services/wo-classifier/
  src/
    index.ts          → Hono App, Port 9000
    routes/
      classify.ts     → POST /classify
    rules/
      reject.ts       → Stufe 0: Reject-Regeln
      spark_a.ts      → Stufe 1: Spark A (Governance)
      spark_b.ts      → Stufe 2: Spark B (Precision)
      spark_c.ts      → Stufe 3: Spark C (Bulk) — Stub bis Hardware da
      spark_d.ts      → Stufe 4: Spark D (Specialist) — Stub bis Hardware da
  package.json
  tsconfig.json
```

### Routing-Regeln (aus WO_CLASSIFIER_V1.md)

**Stufe 0 — REJECT:**
```typescript
// Pflichtfelder fehlen
// files_allowed enthält "*" als einzigen Eintrag
// requires_schema_change = true AND created_by != 'human'
// Duplicate WO (gleicher wo_id in letzten 24h in Supabase)
```

**Stufe 1 → spark_a (Governance):**
```typescript
type === 'planning' || type === 'governance'
type === 'analysis' && risk === 'high'
requires_reasoning === true && risk === 'high'
module === 'cross' && complexity === 'high'
requires_schema_change === true && risk === 'high'
// Fallback: keine Regel greift → spark_a
```

**Stufe 2 → spark_b (Precision):**
```typescript
db_access === 'migration'                                    // + needs_db_check: true
db_access === 'write' && (risk === 'medium' || risk === 'high')  // + needs_db_check: true
type === 'implementation' && complexity === 'high' && risk === 'high'
module === 'auth' && type === 'implementation'
requires_schema_change === true && risk === 'medium'         // + needs_db_check: true
```

**Stufe 3 → spark_c (Bulk) — heute: fallback zu spark_b:**
```typescript
type === 'implementation' && complexity === 'low' && risk === 'low'
type === 'implementation' && complexity === 'medium' && risk === 'low' && db_access === 'none'
type === 'docs' && module !== 'cross'
type === 'test' && complexity === 'low'
```

**Stufe 4 → spark_d (Specialist) — heute: fallback zu spark_b:**
```typescript
type === 'test' && (complexity === 'medium' || complexity === 'high')
type === 'review' && ['nutrition','supplement','medical'].includes(module)
type === 'review' && db_access !== 'none'
type === 'docs' && module === 'cross'
requires_schema_change === true   // immer parallel zu Spark B
```

### Spark C/D Fallback (bis Hardware da)

Da Spark C und D noch nicht verfügbar sind:
- `spark_c` Assignments → umleiten auf `spark_b`
- `spark_d` Assignments → umleiten auf `spark_b`
- In routing_reason vermerken: `"→ spark_b (spark_c not yet available)"`

Das macht den Classifier forward-compatible — wenn Spark C/D ankommen
nur den Fallback entfernen, Rest bleibt.

### Priority Mapping

```typescript
function getPriority(wo: WOClassifierInput): 0 | 1 | 2 | 3 {
  if (wo.risk === 'high' || wo.requires_schema_change) return 1  // HIGH
  if (wo.risk === 'medium') return 2                              // NORMAL
  if (wo.type === 'docs' || wo.type === 'i18n') return 3         // LOW
  return 2                                                        // NORMAL
}
```

### Endpoints

```
POST /classify
  Input:  WOClassifierInput
  Output: WOClassifierOutput (mit routing) oder { error, reason } bei REJECT

GET /health
  Output: { status: 'ok', service: 'wo-classifier', version: '1.0.0' }

GET /rules
  Output: Liste aller aktiven Routing-Regeln mit Beschreibung
```

---

## Supabase Integration

Der Classifier prüft auf Duplicate WOs:
```typescript
// Vor dem Routing:
const existing = await supabase
  .from('workorders')
  .select('wo_id')
  .eq('wo_id', input.id)
  .gt('created_at', new Date(Date.now() - 86400000).toISOString())
  .single()

if (existing.data) {
  return REJECT('Duplicate WO detected: ' + existing.data.wo_id)
}
```

---

## Test

Erstelle `tools/scripts/test-classifier.ts`:

5 Test-WOs aus WO_CLASSIFIER_V1.md:
1. `type=implementation, complexity=low, risk=low` → spark_b (via spark_c fallback)
2. `type=migration, requires_schema_change=true, created_by=human` → spark_b + needs_db_check
3. `type=governance` → spark_a
4. Fehlende Pflichtfelder → REJECT
5. `type=implementation, complexity=low` → spark_b (via spark_c), dann manuell FAIL simulieren

```bash
WORKSPACE_ROOT=D:/GitHub/LumeOS-Claude-V1 npx tsx tools/scripts/test-classifier.ts
```

Erwartete Ausgabe:
```
WO-001  → spark_b (bulk: low impl → spark_c not available)  ✅
WO-002  → spark_b (db_access=migration) + needs_db_check    ✅
WO-003  → spark_a (type=governance)                         ✅
WO-004  → REJECT (Missing fields: module, complexity, ...)   ✅
WO-005  → spark_b (bulk: low impl → spark_c not available)  ✅
```

---

## pnpm-workspace.yaml updaten

Füge hinzu:
```yaml
- services/wo-classifier
```

---

## CLAUDE.md updaten

Füge unter Services hinzu:
```
WO-Classifier:  Port 9000 — deterministic pre-router, classify before dispatch
```

---

## Reihenfolge

```
1. packages/wo-core/src/schema.ts erweitern
2. services/wo-classifier/ aufbauen
3. Alle Routing-Regeln implementieren
4. Spark C/D Fallback einbauen
5. test-classifier.ts schreiben + ausführen
6. pnpm-workspace.yaml + CLAUDE.md updaten
```

Starte mit Schritt 1. Frage wenn unklar.
