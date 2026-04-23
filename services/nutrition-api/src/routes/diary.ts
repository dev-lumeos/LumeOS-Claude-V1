// Diary Routes — Nutrition Diary
// services/nutrition-api/src/routes/diary.ts

import { Hono } from 'hono'
import { z } from 'zod'

export const diaryRoutes = new Hono()

const DiaryDaySchema = z.object({
  entry_date: z.string().date(),
  target_calories: z.number().optional(),
  target_protein_g: z.number().optional(),
  target_fat_g: z.number().optional(),
  target_carbs_g: z.number().optional()
})

// GET /diary/:date
diaryRoutes.get('/:date', async (c) => {
  const date = c.req.param('date')
  // TODO: fetch from Supabase
  return c.json({ entry_date: date, meals: [] })
})

// GET /diary — list diary days
diaryRoutes.get('/', async (c) => {
  // TODO: fetch from Supabase with pagination
  return c.json({ days: [] })
})

// POST /diary — create or update diary day
diaryRoutes.post('/', async (c) => {
  const body = await c.req.json()
  const parsed = DiaryDaySchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Invalid input', details: parsed.error }, 400)
  }
  // TODO: upsert in Supabase
  return c.json({ success: true, data: parsed.data }, 201)
})
