// Scheduler Core — Slot Manager
// packages/scheduler-core/src/slots.ts

import type { SlotState } from './types'

export class SlotManager {
  private slots: Record<string, SlotState>

  constructor(initialSlots: Record<string, SlotState>) {
    this.slots = { ...initialSlots }
  }

  getAvailable(nodeId: string): number {
    const s = this.slots[nodeId]
    if (!s) return 0
    return s.max_slots - s.current_slots - s.reserved_slots
  }

  /**
   * Atomic reserve — check + reserve in one step.
   * Returns true if slot was successfully reserved.
   */
  reserve(nodeId: string): boolean {
    const s = this.slots[nodeId]
    if (!s) return false
    if (this.getAvailable(nodeId) <= 0) return false
    s.current_slots++
    return true
  }

  release(nodeId: string): void {
    const s = this.slots[nodeId]
    if (!s) return
    if (s.current_slots > 0) s.current_slots--
  }

  getState(): Record<string, SlotState> {
    return { ...this.slots }
  }
}
