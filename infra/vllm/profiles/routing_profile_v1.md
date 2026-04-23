# vLLM Profiles — LumeOS

## Routing Übersicht

| Tier | Modell | Node | Port | Max Slots |
|------|--------|------|------|-----------|
| fp8_bulk | qwen3.6-35b-fp8 | Spark A | 8001 | 6 |
| fp4_light | gemma4-4b | Spark A | 8011 | - |
| fp4_light | phi4-mini | Spark A | 8012 | - |
| quality | qwen35-122b-quality | Spark B | 8002 | 2 (Slot 3 = Orchestrator) |
| review | deepseek-r1-8b-review | Spark B | 8013 | - |

## Agent → Endpoint Mapping

```yaml
agent_endpoints:
  ts-patch-agent:       http://spark-a:8001
  api-mapping-agent:    http://spark-a:8001
  ui-restore-agent:     http://spark-a:8001
  test-agent:           http://spark-a:8001
  config-patch-agent:   http://spark-a:8012
  docs-agent:           http://spark-a:8012
  i18n-agent:           http://spark-a:8011
  boilerplate-agent:    http://spark-a:8012
  db-migration-agent:   http://spark-b:8002
  review-agent:         http://spark-b:8013
  context-builder-agent: http://spark-b:8013
  orchestrator:         http://spark-b:8002
```

## OpenRouter Fallback

```yaml
openrouter_base_url: https://openrouter.ai/api/v1
escalation_models:
  - qwen/qwen3.6-plus-preview
  - minimax/minimax-m2.5
  - google/gemini-3.1-pro
  - anthropic/claude-opus-4-6
  - moonshot/kimi-k2.6  # Macro Executor
```
