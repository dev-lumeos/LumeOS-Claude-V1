// Governance Compiler Service
// services/governance-compiler/src/index.ts
// Port: 9003 (Threadripper Control Plane)

import { config as loadEnv } from 'dotenv'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
loadEnv({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../../../.env') })

import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { compileRoutes } from './routes/compile'

const app = new Hono()

app.get('/health', (c) => c.json({
  status: 'ok',
  service: 'governance-compiler',
  role: 'macro-wo-to-governance-artefakt',
  spark_endpoint: process.env.SPARK_A_ENDPOINT || 'http://192.168.0.128:8001'
}))

app.route('/compile', compileRoutes)

const PORT = Number(process.env.GOVERNANCE_COMPILER_PORT) || 9003

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`Governance Compiler running on port ${PORT}`)
})

export default app
