// Supabase Clients
// packages/supabase-clients/src/index.ts
// Provides authenticated Supabase clients for Control Plane

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Singleton instances
let serviceClient: SupabaseClient | null = null
let anonClient: SupabaseClient | null = null

/**
 * Get Supabase client with Service Role (full access).
 * Use for Control Plane operations (scheduler, orchestrator, sat-check).
 */
export function getServiceClient(): SupabaseClient {
  if (serviceClient) return serviceClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
    )
  }

  serviceClient = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  return serviceClient
}

/**
 * Get Supabase client with Anon Key (RLS-protected).
 * Use for user-facing API endpoints.
 */
export function getAnonClient(): SupabaseClient {
  if (anonClient) return anonClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  anonClient = createClient(url, key)

  return anonClient
}

/**
 * Get Supabase client with user JWT for authenticated requests.
 * Pass the Authorization header from the request.
 */
export function getUserClient(authHeader: string): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  // Extract JWT from "Bearer <token>"
  const token = authHeader.replace('Bearer ', '')

  return createClient(url, key, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  })
}

/**
 * Reset singleton instances (for testing).
 */
export function resetClients(): void {
  serviceClient = null
  anonClient = null
}
