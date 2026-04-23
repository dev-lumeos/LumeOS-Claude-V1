// Food Routes — Food Database
// services/nutrition-api/src/routes/food.ts

import { Hono } from 'hono'

export const foodRoutes = new Hono()

// GET /food/search?q=...
foodRoutes.get('/search', async (c) => {
  const query = c.req.query('q')
  if (!query) return c.json({ error: 'Missing query param q' }, 400)
  // TODO: search BLS database in Supabase
  return c.json({ results: [] })
})

// GET /food/:id
foodRoutes.get('/:id', async (c) => {
  const id = c.req.param('id')
  // TODO: fetch food by BLS key
  return c.json({ id, name: null, nutrients: {} })
})
