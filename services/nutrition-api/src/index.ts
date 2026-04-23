// Nutrition API — Entry Point
// services/nutrition-api/src/index.ts

import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { diaryRoutes } from './routes/diary'
import { foodRoutes } from './routes/food'
import { mealsRoutes } from './routes/meals'

const app = new Hono()

app.get('/health', (c) => c.json({ status: 'ok', service: 'nutrition-api' }))

app.route('/diary', diaryRoutes)
app.route('/food', foodRoutes)
app.route('/meals', mealsRoutes)

const PORT = Number(process.env.PORT) || 4200

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`Nutrition API running on port ${PORT}`)
})

export default app
