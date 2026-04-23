// Meals Routes — Meal Logs
// services/nutrition-api/src/routes/meals.ts

import { Hono } from 'hono'
import { z } from 'zod'

export const mealsRoutes = new Hono()

const MealItemSchema = z.object({
  food_id: z.string(),
  amount_g: z.number().positive(),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack'])
})

// GET /meals/:diary_date
mealsRoutes.get('/:diary_date', async (c) => {
  const date = c.req.param('diary_date')
  // TODO: fetch meal_logs for date
  return c.json({ diary_date: date, meals: [] })
})

// POST /meals — log a meal item
mealsRoutes.post('/', async (c) => {
  const body = await c.req.json()
  const parsed = MealItemSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Invalid input', details: parsed.error }, 400)
  }
  // TODO: insert meal_log + meal_items in Supabase
  return c.json({ success: true, data: parsed.data }, 201)
})

// DELETE /meals/:id
mealsRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id')
  // TODO: soft delete (set deleted_at)
  return c.json({ success: true, deleted_id: id })
})
