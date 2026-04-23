# Memory Schemas V1

---

## Event Schema

```typescript
type MemoryEvent = {
  id: string
  event_type: 'wo_completed' | 'wo_failed' | 'rule_added' | 'skill_used'
             | 'wo_created' | 'wo_started' | 'retry_triggered' | 'memory_promotion'
  wo_id?: string
  agent: string
  node: 'spark-a' | 'spark-b' | 'openrouter' | 'external'
  duration_ms?: number
  result: 'success' | 'failure'
  changed_files?: string[]
  failure_class?: string
  timestamp: string
}
```

## Learning Schema

```typescript
type LearningMemory = {
  id: string
  trigger: string           // was den Learning-Entry ausgelöst hat
  pattern: string           // erkanntes Pattern
  action: string            // neue Regel/Skill/Guardrail
  scope: string             // welches Modul/Layer betroffen
  created_at: string
  promoted_to?: 'rule' | 'skill' | 'guardrail' | 'canonical'
}
```

## Promotion Schema

```typescript
type PromotionArtifact = {
  id: string
  source_wo_id: string
  source_event_id: string
  artifact_type: 'rule_artifact' | 'skill_artifact' | 'decision_artifact'
  content: string
  target_path: string       // wo im Repo gespeichert
  created_at: string
  status: 'pending' | 'applied' | 'rejected'
}
```
