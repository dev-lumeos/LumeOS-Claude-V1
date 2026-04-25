// SAT-Check Service — Pre-Execution Gate
// services/sat-check/src/index.ts
// Port: 9001 (Threadripper Control Plane)

import { config as loadEnv } from 'dotenv'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
loadEnv({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../../../.env') })

import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { checkRoutes } from './routes/check'

const app = new Hono()

app.get('/health', (c) => c.json({
  status: 'ok',
  service: 'sat-check',
  role: 'pre-execution-gate'
}))

app.route('/check', checkRoutes)

const PORT = Number(process.env.SAT_CHECK_PORT) || 9001

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`SAT-Check Service running on port ${PORT}`)
})

export default app
