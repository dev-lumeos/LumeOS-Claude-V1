// Supabase Client — Browser
// packages/shared/src/supabase/client.ts

import { createBrowserClient } from '@supabase/ssr'

import { authCookieOptions } from './cookie-name'

export function createClient() {
  // cookieOptions nur, wenn diese App einen eigenen Namen führt (B-12,
  // Weg B). Ohne die Variable bleibt es bei der Ableitung von
  // supabase-js — siehe cookie-name.ts.
  const cookieOptions = authCookieOptions()

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    cookieOptions ? { cookieOptions } : undefined
  )
}
