/// <reference types="node" />
// Agent Registry V1
// packages/agent-core/src/registry.ts

import type { AgentProfile, NodeProfile } from './types'

export const NODE_PROFILES: Record<string, NodeProfile> = {
  'spark-a': {
    node_id: 'spark-a',
    max_slots: 8,
    current_slots: 0,
    reserved_slots: 0,
    endpoint: process.env.SPARK_A_ENDPOINT ?? 'http://192.168.0.128:8001',
    tiers: ['fp8_bulk', 'fp4_light']
  },
  'spark-b': {
    node_id: 'spark-b',
    max_slots: 3,
    current_slots: 0,
    reserved_slots: 1,
    endpoint: process.env.SPARK_B_ENDPOINT ?? 'http://192.168.0.188:8001',
    tiers: ['quality', 'review']
  },
  // Nemotron 3 Super NVFP4 — Orchestrator, Port 8002 on same hardware as spark-a
  'nemotron': {
    node_id: 'nemotron',
    max_slots: 2,
    current_slots: 0,
    reserved_slots: 0,
    endpoint: process.env.NEMOTRON_ENDPOINT ?? 'http://192.168.0.128:8002',
    tiers: ['orchestration']
  }
}

export const TIER_ENDPOINTS: Record<string, string> = {
  fp8_bulk:        process.env.SPARK_A_ENDPOINT  ?? 'http://192.168.0.128:8001',
  fp4_light_gemma: 'http://192.168.0.128:8011',
  fp4_light_phi:   'http://192.168.0.128:8012',
  quality:         process.env.SPARK_B_ENDPOINT  ?? 'http://192.168.0.188:8001',
  review:          process.env.SPARK_B_ENDPOINT  ?? 'http://192.168.0.188:8001',
  orchestration:   process.env.NEMOTRON_ENDPOINT ?? 'http://192.168.0.128:8002'
}

export const AGENT_REGISTRY: AgentProfile[] = [
  {
    agent_id: 'ts-patch-agent',
    role: 'TypeScript patches and refactors',
    allowed_layers: ['types', 'service'],
    allowed_wo_types: ['TYPE_PATCH', 'SERVICE_PATCH', 'API_MAPPING_PATCH'],
    default_model_tier: 'fp8_bulk',
    escalation_model_tier: 'quality',
    node: 'spark-a',
    hard_limits: { max_scope_files: 3, no_schema_changes: true },
    allowed_retry_modes: ['extended_context', 'alternate_node', 'stronger_model'],
    failure_class_policy: {
      technical_transient: 'auto_retry',
      semantic_output: 'retry_attempt2_then_escalate',
      scope_violation: 'retry_stricter_scope',
      guardrail_violation: 'immediate_review'
    },
    scheduler_controlled: true
  },
  {
    agent_id: 'db-migration-agent',
    role: 'Schema and migration changes',
    allowed_layers: ['db'],
    allowed_wo_types: ['DB_MIGRATION', 'SCHEMA_PATCH', 'RLS_PATCH'],
    default_model_tier: 'quality',
    escalation_model_tier: 'review',
    node: 'spark-b',
    hard_limits: {
      max_scope_files: 2,
      no_destructive_migrations: true,
      requires_rollback_plan: true
    },
    allowed_retry_modes: ['extended_context', 'stronger_model'],
    failure_class_policy: {
      technical_transient: 'auto_retry',
      semantic_output: 'immediate_review',
      scope_violation: 'immediate_review',
      guardrail_violation: 'immediate_review',
      dependency_invalid: 'graph_repair'
    },
    scheduler_controlled: true
  }
]

export function getAgentById(agentId: string): AgentProfile | undefined {
  return AGENT_REGISTRY.find(a => a.agent_id === agentId)
}
