// services/wo-classifier/src/routes/classify.ts

import { Hono } from 'hono'
import type {
  WOClassifierInput,
  WOClassifierOutput,
  WOClassifierReject,
} from '@lumeos/wo-core'
import { checkRejectPreflight } from '../rules/reject'
import { classify } from '../rules'
import { checkDuplicate } from '../supabase'

export const classifyRoutes = new Hono()

classifyRoutes.post('/', async (c) => {
  let input: WOClassifierInput
  try {
    input = await c.req.json<WOClassifierInput>()
  } catch {
    const reject: WOClassifierReject = {
      status: 'REJECTED',
      error: 'INVALID_JSON',
      reason: 'request body is not valid JSON',
    }
    return c.json(reject, 400)
  }

  // Stage 0a: structural reject (missing fields, invalid scope, schema-change author)
  const preflight = checkRejectPreflight(input)
  if (preflight.rejected) {
    const reject: WOClassifierReject = {
      status: 'REJECTED',
      error: 'PREFLIGHT_REJECT',
      reason: preflight.reason ?? 'preflight rejection without reason',
      wo_id: input.id,
    }
    return c.json(reject, 422)
  }

  // Stage 0b: duplicate check against Supabase (last 24h). Soft-fails when
  // SUPABASE_URL is not configured — service stays usable without a DB.
  const dup = await checkDuplicate(input.id)
  if (dup.duplicate) {
    const reject: WOClassifierReject = {
      status: 'REJECTED',
      error: 'DUPLICATE_WO',
      reason: `Duplicate WO detected within last 24h: ${input.id}`,
      wo_id: input.id,
    }
    return c.json(reject, 409)
  }

  // Stages 1-4: deterministic routing
  const routing = classify(input)
  const output: WOClassifierOutput = { ...input, routing }
  return c.json(output)
})

classifyRoutes.get('/health', (c) => c.json({ ready: true }))
