// Scheduler — Dispatch Loop
// services/scheduler-api/src/dispatch-loop.ts
// 5-second loop per scheduler_dispatch_v1.md

import { sortByPriority, SlotManager } from '@lumeos/scheduler-core'
import { getAgentById } from '@lumeos/agent-core'
import type { WorkOrder, WOClassifierOutput, WOClassifierReject } from '@lumeos/wo-core'
import { resolveNodeFromRouting, type NodeId } from './routing'

export type SchedulerState = 'idle' | 'running' | 'paused' | 'night_run' | 'draining'

const CLASSIFIER_URL = process.env.WO_CLASSIFIER_URL ?? 'http://localhost:9000'

export interface DispatchLoopConfig {
  intervalMs: number
  onDispatch: (wo: WorkOrder, node: string) => Promise<void>
  onStateChange: (wo: WorkOrder, newState: string) => Promise<void>
  fetchReadyWOs: () => Promise<WorkOrder[]>
}

export class DispatchLoop {
  private state: SchedulerState = 'idle'
  private slotManager: SlotManager
  private config: DispatchLoopConfig
  private intervalHandle: ReturnType<typeof setInterval> | null = null
  private loopCount = 0
  private starvationCounter: Record<string, number> = {}

  constructor(slotManager: SlotManager, config: DispatchLoopConfig) {
    this.slotManager = slotManager
    this.config = config
  }

  start(): void {
    if (this.state === 'running') return

    this.state = 'running'
    console.log('[Scheduler] Dispatch loop started')

    this.intervalHandle = setInterval(
      () => this.tick(),
      this.config.intervalMs
    )
  }

  pause(): void {
    this.state = 'paused'
    console.log('[Scheduler] Dispatch loop paused')
  }

  resume(): void {
    if (this.state === 'paused') {
      this.state = 'running'
      console.log('[Scheduler] Dispatch loop resumed')
    }
  }

  stop(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle)
      this.intervalHandle = null
    }
    this.state = 'idle'
    console.log('[Scheduler] Dispatch loop stopped')
  }

  getState(): SchedulerState {
    return this.state
  }

  private async tick(): Promise<void> {
    if (this.state !== 'running') return

    this.loopCount++
    console.log(`[Scheduler] Tick #${this.loopCount}`)

    try {
      // 1. Fetch all ready WOs
      const readyWOs = await this.config.fetchReadyWOs()

      if (readyWOs.length === 0) {
        console.log('[Scheduler] No ready WOs')
        return
      }

      // 2. Sort by priority
      const sorted = sortByPriority(readyWOs)
      console.log(`[Scheduler] ${sorted.length} WOs ready, sorted by priority`)

      // 3. Dispatch loop
      let dispatchedThisTick = 0

      for (const original of sorted) {
        // 3a. If WO has no routing yet, ask the classifier (best-effort).
        const wo = await this.classifyIfNeeded(original)
        if (wo === null) {
          // Classifier rejected — already logged. Skip this WO.
          continue
        }

        // 3b. Determine target node — prefer routing, fall back to legacy heuristic.
        const targetNode = resolveNodeFromRouting(wo) ?? this.getTargetNode(wo.agent_type)

        if (!targetNode) {
          console.warn(`[Scheduler] No node for ${wo.wo_id} (agent_type=${wo.agent_type})`)
          continue
        }

        // Check conflicts_with
        if (await this.hasActiveConflict(wo)) {
          console.log(`[Scheduler] ${wo.wo_id} blocked by conflict`)
          continue
        }

        // Atomic slot reserve
        const reserved = this.slotManager.reserve(targetNode)

        if (!reserved) {
          console.log(`[Scheduler] No slots on ${targetNode} for ${wo.wo_id}`)
          this.trackStarvation(wo.wo_id)
          continue
        }

        // Dispatch
        try {
          await this.config.onStateChange(wo, 'dispatched')
          await this.config.onDispatch(wo, targetNode)

          dispatchedThisTick++
          this.clearStarvation(wo.wo_id)

          const reasonSuffix = wo.routing
            ? ` (routing: ${wo.routing.routing_reason})`
            : ' (legacy: agent_type heuristic)'
          console.log(`[Scheduler] Dispatched ${wo.wo_id} to ${targetNode}${reasonSuffix}`)
        } catch (err) {
          // Dispatch failed — release slot
          this.slotManager.release(targetNode)
          console.error(`[Scheduler] Dispatch failed for ${wo.wo_id}:`, err)
        }
      }

      console.log(`[Scheduler] Tick complete: ${dispatchedThisTick} dispatched`)

    } catch (err) {
      console.error('[Scheduler] Tick error:', err)
    }
  }

  /**
   * If a WO arrives without a routing block, call the WO-Classifier service
   * to populate it. Returns the (possibly augmented) WO, or null when the
   * classifier explicitly rejects.
   *
   * Best-effort: if the classifier is unreachable, returns the WO unchanged
   * — the caller will fall back to legacy `getTargetNode(agent_type)`.
   */
  private async classifyIfNeeded(wo: WorkOrder): Promise<WorkOrder | null> {
    if (wo.routing?.assigned_spark) return wo

    try {
      const res = await fetch(`${CLASSIFIER_URL}/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wo),
      })
      const result = (await res.json()) as WOClassifierOutput | WOClassifierReject

      if ('routing' in result && result.routing) {
        return { ...wo, routing: result.routing }
      }

      if ('status' in result && result.status === 'REJECTED') {
        const r = result as WOClassifierReject
        console.warn(`[Scheduler] Classifier REJECTED ${wo.wo_id}: ${r.error} — ${r.reason}`)
        // Soft-fail: WOs missing classifier-only fields (added by Pipeline-2's
        // bridge migration) should not block dispatch. Fall back to legacy.
        if (r.error === 'PREFLIGHT_REJECT') return wo
        return null
      }

      return wo
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.warn(`[Scheduler] Classifier unreachable for ${wo.wo_id}: ${msg} — falling back to legacy routing`)
      return wo
    }
  }

  private getTargetNode(agentType: string): NodeId | null {
    const agent = getAgentById(agentType)
    if (!agent) return null

    // Map model_tier to node
    const tier = agent.default_model_tier

    switch (tier) {
      case 'fp4_light':
      case 'fp8_bulk':
        return 'spark-a'
      case 'quality':
      case 'review':
        return 'spark-b'
      default:
        return null
    }
  }

  private async hasActiveConflict(_wo: WorkOrder): Promise<boolean> {
    // TODO: Check conflicts_with against running/dispatched WOs
    // For now, return false (no conflict checking)
    return false
  }

  private trackStarvation(woId: string): void {
    this.starvationCounter[woId] = (this.starvationCounter[woId] || 0) + 1

    // After 3 loops without dispatch, bump priority
    if (this.starvationCounter[woId] >= 3) {
      console.warn(`[Scheduler] ${woId} starving — will bump priority`)
    }
  }

  private clearStarvation(woId: string): void {
    delete this.starvationCounter[woId]
  }
}
