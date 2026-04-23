// Scheduler — Dispatch Loop
// services/scheduler-api/src/dispatch-loop.ts
// 5-second loop per scheduler_dispatch_v1.md

import { sortByPriority, SlotManager } from '@lumeos/scheduler-core'
import { getAgentById, NODE_PROFILES } from '@lumeos/agent-core'
import type { WorkOrder } from '@lumeos/wo-core'
import type { SlotState, DispatchResult } from '@lumeos/scheduler-core'

export type SchedulerState = 'idle' | 'running' | 'paused' | 'night_run' | 'draining'

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

      for (const wo of sorted) {
        // Determine target node from agent_type
        const targetNode = this.getTargetNode(wo.agent_type)

        if (!targetNode) {
          console.warn(`[Scheduler] No node for agent ${wo.agent_type}`)
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

          console.log(`[Scheduler] Dispatched ${wo.wo_id} to ${targetNode}`)
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

  private getTargetNode(agentType: string): string | null {
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

  private async hasActiveConflict(wo: WorkOrder): Promise<boolean> {
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
