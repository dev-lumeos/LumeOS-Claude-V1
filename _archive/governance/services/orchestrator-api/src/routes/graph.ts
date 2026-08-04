// Graph Routes
// services/orchestrator-api/src/routes/graph.ts

import { Hono } from 'hono'
import { validateGraph, detectCycles } from '@lumeos/graph-core'
import type { WOGraph } from '@lumeos/graph-core'

export const graphRoutes = new Hono()

// POST /graph/validate
graphRoutes.post('/validate', async (c) => {
  const graph = await c.req.json<WOGraph>()
  const result = validateGraph(graph)
  return c.json(result)
})

// POST /graph/repair
graphRoutes.post('/repair', async (c) => {
  const { wo_id, batch_id } = await c.req.json<{
    wo_id: string
    batch_id: string
  }>()
  // TODO: implement repair logic
  return c.json({
    status: 'graph_repair_pending',
    wo_id,
    batch_id
  })
})
