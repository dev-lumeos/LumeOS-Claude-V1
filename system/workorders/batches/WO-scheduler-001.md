# WORKORDER: Dispatcher Integration in scheduler-api
# WO-ID: WO-scheduler-001
# Agent: Claude Code (senior)
# Status: READY FOR EXECUTION

---

## CONTEXT

Wir haben einen neuen Runtime-Dispatcher gebaut der alle Tool Calls durch einen
Permission Gateway, Approval Gate, Audit Log und State Manager führt.

Der Dispatcher liegt in:
  system/control-plane/dispatcher.ts

Er wurde mit npx tsx system/control-plane/__tests__/smoke-test.ts
vollständig getestet — 9/9 Tests grün.

Das Problem: der bestehende Scheduler (services/scheduler-api) ruft
`onDispatch(wo, node)` auf, welches dann direkt `workers.ts → executeWorkOrder()`
aufruft — ohne unseren neuen Dispatcher zu nutzen.

Ziel dieser Workorder: einen vLLM-Adapter bauen und den onDispatch-Callback in
index.ts so anpassen dass er unseren Dispatcher verwendet.

---

## AUFGABE

### Teil 1 — vllm-adapter.ts (NEUE DATEI)

Erstelle: services/scheduler-api/src/vllm-adapter.ts

Dieser Adapter verbindet die bestehenden VLLMClient Funktionen aus
@lumeos/vllm-client mit dem DispatcherDeps interface aus unserem Dispatcher.

```typescript
// services/scheduler-api/src/vllm-adapter.ts

import {
  createSparkAClient,
  createSparkBClient,
  generateWithVerification,
  TripleHashMismatchError
} from '@lumeos/vllm-client'
import type { NodeId } from './routing'

interface ModelRoutingEntry {
  node: string
  model: string
  temperature: number
  max_context: number
}

/**
 * Erstellt eine callModel() Funktion für den Dispatcher,
 * die den passenden vLLM Client für den gegebenen Node nutzt.
 *
 * Spark B: generateWithVerification() mit triple_hash
 * Spark A: direkter chat() Call ohne triple_hash
 */
export function createVllmCallModel(node: NodeId) {
  return async function callModel(
    routing: ModelRoutingEntry,
    systemPrompt: string,
    userMessage: string
  ): Promise<string> {

    if (node === 'spark-b') {
      const client = createSparkBClient()
      return generateWithVerification(client, [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ])
    }

    const client = createSparkAClient()
    const response = await client.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ])
    return response.choices[0]?.message?.content ?? ''
  }
}
```

---

### Teil 2 — wo-adapter.ts (NEUE DATEI)

Erstelle: services/scheduler-api/src/wo-adapter.ts

Konvertiert den WorkOrder Type aus @lumeos/wo-core in das Workorder Interface
unseres Dispatchers (system/control-plane/dispatcher.ts).

Die Types sind ähnlich aber nicht identisch:
- wo-core WorkOrder hat: task: string[] (Array)
- Unser Dispatcher Workorder hat: task: string (einzelner String)
- wo-core WorkOrder hat: scope_files: string[]
- Unser Dispatcher hat: scope_files, context_files, acceptance_files, etc.

```typescript
// services/scheduler-api/src/wo-adapter.ts

import type { WorkOrder as WOCoreWorkOrder } from '@lumeos/wo-core'
import type { Workorder as DispatcherWorkorder } from '../../../system/control-plane/dispatcher'

/**
 * Konvertiert einen WorkOrder aus wo-core in das Dispatcher-Format.
 * Fehlende Felder werden mit sinnvollen Defaults gefüllt.
 */
export function toDispatcherWorkorder(wo: WOCoreWorkOrder): DispatcherWorkorder {
  return {
    workorder_id:         wo.wo_id,
    agent_id:             wo.agent_type,
    // task ist im wo-core ein string[], wir joinen für den Dispatcher
    task:                 Array.isArray(wo.task) ? wo.task.join('\n') : String(wo.task),
    scope_files:          wo.scope_files ?? [],
    context_files:        wo.files_allowed ?? [],
    acceptance_files:     wo.acceptance?.auto_checks ?? [],
    acceptance_criteria:  wo.acceptance?.auto_checks ?? [],
    negative_constraints: [
      'NIEMALS Dateien außerhalb scope_files ändern',
      'NIEMALS ENV-Dateien lesen oder schreiben',
      'NIEMALS Migrations ohne Human Approval',
    ],
    required_skills:      [],
    optional_skills:      [],
    blocked_by:           wo.dependencies?.blocked_by ?? [],
    phase:                wo.dependencies?.phase ?? 1,
    requires_approval:    wo.routing?.needs_db_check ?? false,
    quality_critical:     wo.routing?.wo_risk === 'high',
    priority:             mapPriority(wo.routing?.wo_priority),
    correlation_id:       wo.wo_id,
  }
}

function mapPriority(woPriority?: string): 'low' | 'normal' | 'high' | 'critical' {
  switch (woPriority) {
    case '0': return 'critical'
    case '1': return 'high'
    case '3': return 'low'
    default:  return 'normal'
  }
}
```

---

### Teil 3 — index.ts anpassen (BESTEHENDE DATEI ÄNDERN)

Ändere: services/scheduler-api/src/index.ts

GENAU EINE ÄNDERUNG: Die onDispatch Implementierung in der DispatchLoop Konfiguration
soll jetzt unseren Dispatcher aufrufen statt (oder zusätzlich zu) executeWorkOrder().

WICHTIG: executeWorkOrder() in workers.ts NICHT löschen — sie wird noch für
checkWorkerHealth() und für den Fallback benötigt.

Füge am Anfang der Datei hinzu (nach den bestehenden Imports):
```typescript
import { dispatchWorkorder } from '../../../system/control-plane/dispatcher'
import { createVllmCallModel } from './vllm-adapter'
import { toDispatcherWorkorder } from './wo-adapter'
import { defaultExecuteTool } from '../../../system/control-plane/dispatcher'
```

Ersetze die DispatchLoop Instanziierung / onDispatch Implementierung.

Aktuell gibt es in index.ts KEINE DispatchLoop Instanziierung — die ist noch
als TODO drin. Du musst sie hinzufügen.

Füge nach `const slotManager = new SlotManager(initialSlots)` ein:

```typescript
import { DispatchLoop } from './dispatch-loop'
import { executeWorkOrder } from './workers'

const dispatchLoop = new DispatchLoop(slotManager, {
  intervalMs: 5000,

  fetchReadyWOs: async () => {
    // TODO: Aus Supabase laden — vorerst leeres Array
    // Wird in separatem WO implementiert wenn Supabase-Integration ready ist
    return []
  },

  onStateChange: async (wo, newState) => {
    // TODO: Supabase State Update
    console.log(`[Scheduler] ${wo.wo_id} → ${newState}`)
  },

  onDispatch: async (wo, node) => {
    // NEU: Dispatcher mit Permission Gateway, Approval, Audit
    const dispatcherWO = toDispatcherWorkorder(wo)
    const nodeId = node as 'spark-a' | 'spark-b'

    const result = await dispatchWorkorder(dispatcherWO, {
      callModel:   createVllmCallModel(nodeId),
      executeTool: defaultExecuteTool,
    })

    console.log(`[Scheduler] ${wo.wo_id} → ${result.status} (run: ${result.run_id})`)

    // Slot nach Completion freigeben
    slotManager.release(node)

    if (result.status === 'failed') {
      throw new Error(result.error ?? 'Dispatch failed')
    }
  },
})

// Loop starten
dispatchLoop.start()
```

---

## SCOPE FILES (nur diese Files anfassen)

- services/scheduler-api/src/vllm-adapter.ts       (NEU)
- services/scheduler-api/src/wo-adapter.ts          (NEU)
- services/scheduler-api/src/index.ts               (ÄNDERN)

## NICHT ANFASSEN

- services/scheduler-api/src/dispatch-loop.ts       (unverändert)
- services/scheduler-api/src/workers.ts             (unverändert)
- services/scheduler-api/src/routing.ts             (unverändert)
- system/control-plane/dispatcher.ts                (unverändert)
- Alle anderen system/ Files                         (unverändert)

---

## NEGATIVE CONSTRAINTS

- NIEMALS workers.ts löschen oder executeWorkOrder() entfernen
- NIEMALS dispatch-loop.ts Logik ändern
- NIEMALS TypeScript strict mode deaktivieren
- NIEMALS Imports ohne type-check einfügen
- NIEMALS Supabase Calls hinzufügen (fetchReadyWOs bleibt leeres Array vorerst)

---

## ACCEPTANCE CRITERIA

1. pnpm tsc --noEmit im services/scheduler-api Verzeichnis: kein Fehler
2. Die zwei neuen Files existieren mit korrekten Types
3. index.ts importiert dispatchWorkorder und startet dispatchLoop
4. dispatch-loop.ts, workers.ts, routing.ts sind unverändert
5. npx tsx system/control-plane/__tests__/smoke-test.ts: weiterhin 9/9 grün

---

## TECHNISCHER KONTEXT

WorkOrder Type (wo-core):
  wo_id: string
  wo_type: 'micro' | 'macro'
  agent_type: string
  scope_files: string[]
  task: string[]                ← Array
  acceptance: { auto_checks, review_checks, human_checks }
  dependencies: { phase, blocked_by, conflicts_with }
  routing?: WORouting
  state: WOState

Dispatcher Workorder Interface (system/control-plane/dispatcher.ts):
  workorder_id: string
  agent_id: string
  task: string                  ← einzelner String
  scope_files: string[]
  context_files: string[]
  acceptance_files: string[]
  acceptance_criteria: string[]
  negative_constraints: string[]
  required_skills: string[]
  optional_skills: string[]
  blocked_by: string[]

DispatcherDeps Interface:
  callModel: (routing: ModelRoutingEntry, system: string, user: string) => Promise<string>
  executeTool: (req: ToolRequest) => Promise<ToolResult>

VLLMClient (vllm-client package):
  createSparkAClient() → VLLMClient für spark-a (192.168.0.128:8001)
  createSparkBClient() → VLLMClient für spark-b (192.168.0.188:8001)
  generateWithVerification(client, messages) → string (triple_hash, Spark B)
  client.chat(messages) → response (Spark A)
