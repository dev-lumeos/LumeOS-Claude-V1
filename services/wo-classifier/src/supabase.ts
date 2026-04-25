// services/wo-classifier/src/supabase.ts
//
// Optional Supabase integration for the duplicate-WO check. The classifier
// stays runnable without Supabase — when SUPABASE_URL or the service key is
// missing, checkDuplicate() returns { duplicate: false, configured: false } and
// logs a single warning per process.

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

interface DuplicateResult {
  duplicate: boolean
  configured: boolean
}

let client: SupabaseClient | null | undefined
let warned = false

function getClient(): SupabaseClient | null {
  if (client !== undefined) return client
  const url = process.env.SUPABASE_URL?.trim()
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY)?.trim()
  if (!url || !key) {
    if (!warned) {
      console.warn(
        '[wo-classifier] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set — duplicate-WO check disabled'
      )
      warned = true
    }
    client = null
    return null
  }
  client = createClient(url, key, { auth: { persistSession: false } })
  return client
}

export async function checkDuplicate(woId: string): Promise<DuplicateResult> {
  const c = getClient()
  if (!c) return { duplicate: false, configured: false }

  const since = new Date(Date.now() - 86_400_000).toISOString()
  const { data, error } = await c
    .from('workorders')
    .select('wo_id')
    .eq('wo_id', woId)
    .gt('created_at', since)
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error(`[wo-classifier] supabase duplicate check failed: ${error.message}`)
    return { duplicate: false, configured: true }
  }
  return { duplicate: data !== null, configured: true }
}
