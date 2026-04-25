// Scheduler API — Dispatch Service
// services/scheduler-api/src/index.ts
// Port: 9002 (Threadripper)

import { config as loadEnv } from 'dotenv'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
loadEnv({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../../../.env') })

import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { SlotManager } from '@lumeos/scheduler-core'
import type { SlotState } from '@lumeos/scheduler-core'

// Initialize slot states
const initialSlots: Record<string, SlotState> = {
  'spark-a': {
    node_id: 'spark-a',
    max_slots: 8,
    current_slots: 0,
    reserved_slots: 0
  },
  'spark-b': {
    node_id: 'spark-b',
    max_slots: 3,
    current_slots: 0,
    reserved_slots: 1 // Reserved for orchestrator
  }
}

const slotManager = new SlotManager(initialSlots)

const app = new Hono()

// Health check
app.get('/health', (c) => c.json({
  status: 'ok',
  service: 'scheduler-api',
  role: 'dispatch-controller'
}))

// GET /status — Current scheduler state
app.get('/status', (c) => {
  const slots = slotManager.getState()
  return c.json({
    state: 'running',
    loop_interval_ms: 5000,
    slots: {
      'spark-a': {
        ...slots['spark-a'],
        available: slotManager.getAvailable('spark-a')
      },
      'spark-b': {
        ...slots['spark-b'],
        available: slotManager.getAvailable('spark-b')
      }
    }
  })
})

// POST /dispatch — Manual dispatch trigger (for testing)
app.post('/dispatch', async (c) => {
  const { wo_id, node } = await c.req.json<{ wo_id: string; node: string }>()

  const reserved = slotManager.reserve(node)
  if (!reserved) {
    return c.json({ dispatched: false, reason: 'No slots available' }, 409)
  }

  return c.json({ dispatched: true, wo_id, node })
})

// POST /release — Release a slot after WO completion
app.post('/release', async (c) => {
  const { node } = await c.req.json<{ node: string }>()
  slotManager.release(node)
  return c.json({ released: true, node })
})

// POST /pause — Pause the scheduler
app.post('/pause', (c) => {
  // TODO: Implement pause logic in dispatch loop
  return c.json({ state: 'paused' })
})

// POST /resume — Resume the scheduler
app.post('/resume', (c) => {
  // TODO: Implement resume logic in dispatch loop
  return c.json({ state: 'running' })
})

const PORT = Number(process.env.SCHEDULER_PORT) || 9002

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`Scheduler API running on port ${PORT}`)
})

export { app, slotManager }
