// Scheduler Core Types V1
// packages/scheduler-core/src/types.ts

export type SchedulerState =
  | 'idle'
  | 'running'
  | 'paused'
  | 'night_run'
  | 'draining'

export type DispatchResult =
  | { dispatched: true; wo_id: string; node: string }
  | { dispatched: false; reason: string }

export interface SlotState {
  node_id: string
  max_slots: number
  current_slots: number
  reserved_slots: number
}

export interface SchedulerConfig {
  loop_interval_ms: number
  night_run_start: string
  night_run_max_spark_a_slots: number
  night_run_max_spark_b_slots: number
  openrouter_budget_usd: number
  error_threshold_global: number
  error_threshold_per_agent: number
  error_threshold_per_wo_type: number
  starvation_loops_before_bump: number
}
