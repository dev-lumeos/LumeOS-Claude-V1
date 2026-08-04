'use client'

// TanStack-Query-Provider (M2-Fundament, 2026-08-04).
// Bewusst ohne defaultOptions — Cache- und Retry-Politik sind eine spätere
// fachliche Entscheidung, keine Fundament-Voreinstellung.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import '../../lib/dates'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient())

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
