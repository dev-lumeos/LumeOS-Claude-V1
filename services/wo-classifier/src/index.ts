// WO Classifier Service — Deterministic Pre-Router
// services/wo-classifier/src/index.ts
// Port: 9000 (sits before Governance Compiler in the control plane)

import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { classifyRoutes } from './routes/classify'
import { getAllRules } from './rules'

const app = new Hono()

app.get('/health', (c) =>
  c.json({
    status: 'ok',
    service: 'wo-classifier',
    role: 'pre-router',
    version: '1.0.0',
  })
)

app.get('/rules', (c) => c.json(getAllRules()))

app.route('/classify', classifyRoutes)

const PORT = Number(process.env.WO_CLASSIFIER_PORT) || 9000

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`WO-Classifier Service running on port ${PORT}`)
})

export default app
