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
import { dispatchWorkorder, defaultExecuteTool } from '../../../system/control-plane/dispatcher'
import { DispatchLoop } from './dispatch-loop'
import { createVllmCallModel } from './vllm-adapter'
import { toDispatcherWorkorder } from './wo-adapter'
import { fetchReadyWOs, markDispatched, markCompleted } from './workorder-repository'
import type { NodeId } from './routing'

// ─── Slot Manager ─────────────────────────────────────────────────────────────

const initialSlots: Record<string, SlotState> = {
  'spark-a':  { node_id: 'spark-a',  max_slots: 8, current_slots: 0, reserved_slots: 0 },
  'spark-b':  { node_id: 'spark-b',  max_slots: 3, current_slots: 0, reserved_slots: 1 },
  'nemotron': { node_id: 'nemotron', max_slots: 2, current_slots: 0, reserved_slots: 0 },
}

const slotManager = new SlotManager(initialSlots)

// ─── Dispatch Loop ────────────────────────────────────────────────────────────

const dispatchLoop = new DispatchLoop(slotManager, {
  intervalMs: 5000,

  // ── DB-backed: WOs mit state='ready' aus Supabase ─────────────────────────
  fetchReadyWOs,

  // ── State-Update: in Supabase persistieren ────────────────────────────────
  onStateChange: async (wo, newState) => {
    console.log(`[Scheduler] ${wo.wo_id} → ${newState}`)
    if (newState === 'dispatched') {
      await markDispatched(wo.wo_id, wo.assigned_node ?? 'unknown')
    }
  },

  // ── Dispatch: durch Runtime-Dispatcher (Gateway + Audit + State) ──────────
  onDispatch: async (wo, node) => {
    const dispatcherWO = toDispatcherWorkorder(wo)
    const nodeId = node as NodeId

    const result = await dispatchWorkorder(dispatcherWO, {
      callModel:   createVllmCallModel(nodeId),
      executeTool: defaultExecuteTool,
    })

    const success = result.status === 'completed'
    await markCompleted(
      wo.wo_id,
      success,
      success ? undefined : (result.error ?? 'technical_transient')
    )

    console.log(`[Scheduler] ${wo.wo_id} → ${result.status} (run: ${result.run_id})`)

    // Slot freigeben — DispatchLoop released nur bei Dispatch-Fehler
    slotManager.release(node)

    if (result.status === 'failed') {
      throw new Error(result.error ?? 'Dispatch failed')
    }
  },
})

dispatchLoop.start()

// ─── Hono API ─────────────────────────────────────────────────────────────────

const app = new Hono()

app.get('/health', (c) => c.json({
  status:  'ok',
  service: 'scheduler-api',
  role:    'dispatch-controller',
}))

app.get('/status', (c) => {
  const slots = slotManager.getState()
  return c.json({
    state:            dispatchLoop.getState(),
    loop_interval_ms: 5000,
    slots: {
      'spark-a': { ...slots['spark-a'], available: slotManager.getAvailable('spark-a') },
      'spark-b': { ...slots['spark-b'], available: slotManager.getAvailable('spark-b') },
    },
  })
})

app.post('/dispatch', async (c) => {
  const { wo_id, node } = await c.req.json<{ wo_id: string; node: string }>()
  const reserved = slotManager.reserve(node)
  if (!reserved) return c.json({ dispatched: false, reason: 'No slots available' }, 409)
  return c.json({ dispatched: true, wo_id, node })
})

app.post('/release', async (c) => {
  const { node } = await c.req.json<{ node: string }>()
  slotManager.release(node)
  return c.json({ released: true, node })
})

app.post('/pause', (c) => {
  dispatchLoop.pause()
  return c.json({ state: 'paused' })
})

app.post('/resume', (c) => {
  dispatchLoop.resume()
  return c.json({ state: 'running' })
})

// ─── Start ────────────────────────────────────────────────────────────────────

const PORT = Number(process.env.SCHEDULER_PORT) || 9002

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`Scheduler API running on port ${PORT}`)
})

export { app, slotManager }
