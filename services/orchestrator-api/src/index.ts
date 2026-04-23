// Orchestrator API — Entry Point
// services/orchestrator-api/src/index.ts

import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { graphRoutes } from './routes/graph'
import { schedulerRoutes } from './routes/scheduler'
import { retryRoutes } from './routes/retry'

const app = new Hono()

app.get('/health', (c) => c.json({ status: 'ok', service: 'orchestrator-api' }))

app.route('/graph', graphRoutes)
app.route('/scheduler', schedulerRoutes)
app.route('/retry', retryRoutes)

const PORT = Number(process.env.PORT) || 9000

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`Orchestrator API running on port ${PORT}`)
})

export default app
