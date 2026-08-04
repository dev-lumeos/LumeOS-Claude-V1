// Scheduler Routes
// services/orchestrator-api/src/routes/scheduler.ts

import { Hono } from 'hono'
import { sortByPriority } from '@lumeos/scheduler-core'
import type { WorkOrder } from '@lumeos/wo-core'

export const schedulerRoutes = new Hono()

// GET /scheduler/status
schedulerRoutes.get('/status', (c) => {
  return c.json({
    state: 'idle',
    spark_a: { max_slots: 8, current_slots: 0, available: 8 },
    spark_b: { max_slots: 3, current_slots: 0, available: 2 }
  })
})

// POST /scheduler/prioritize — sort WO batch by priority
schedulerRoutes.post('/prioritize', async (c) => {
  const { workorders } = await c.req.json<{ workorders: WorkOrder[] }>()
  const sorted = sortByPriority(workorders)
  return c.json({ workorders: sorted })
})
