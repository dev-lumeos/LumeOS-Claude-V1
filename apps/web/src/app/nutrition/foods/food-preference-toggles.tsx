'use client'

// Favorit-/Ausschluss-Toggles je Food (C-02). react-hook-form + zod für die
// validierte Eingabe, TanStack Query für Bestand, Mutation und
// Invalidierung. Bewusst KEIN optimistisches Update: der Rückweg müsste
// Server-Umstufungen (insert vs. update) und RLS-Fehler spiegeln — erst
// Antwort abwarten, dann invalidieren, ist hier der saubere Weg.
// Farben: ausschliesslich die auf der Seite vorhandenen Klassen
// (emerald für Favorit, amber für Ausschluss) — A-06 ist offen.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import {
  foodPreferenceWriteSchema,
  parseStoredFoodPreferenceItems,
  type FoodPreferenceKind,
  type FoodPreferenceWrite,
} from '../../../lib/nutrition/preferences-model'
import { zodResolver } from '../../../lib/schemas/resolver'

const QUERY_KEY = ['nutrition', 'food-preferences'] as const

async function fetchOwnItems() {
  const response = await fetch('/api/nutrition/preferences', { cache: 'no-store' })
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { code?: string } | null
    throw new Error(body?.code ?? `HTTP ${response.status}`)
  }
  const body = (await response.json()) as { items?: unknown }
  return parseStoredFoodPreferenceItems(body.items)
}

export function FoodPreferenceToggles({ foodId }: { foodId: string }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [message, setMessage] = useState<string | null>(null)

  const { data: items } = useQuery({ queryKey: QUERY_KEY, queryFn: fetchOwnItems })
  const current: FoodPreferenceKind | null =
    items?.find(item => item.food_id === foodId)?.preference ?? null

  const { handleSubmit, setValue } = useForm<FoodPreferenceWrite>({
    resolver: zodResolver(foodPreferenceWriteSchema),
    defaultValues: { food_id: foodId, preference: 'liked' },
  })

  const mutation = useMutation({
    mutationFn: async (input: FoodPreferenceWrite) => {
      const isActive = current === input.preference
      const response = await fetch('/api/nutrition/preferences', {
        method: isActive ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isActive ? { food_id: input.food_id } : input),
      })
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string; code?: string } | null
        throw new Error(body?.error ?? `HTTP ${response.status}`)
      }
      return response.json()
    },
    onSuccess: async () => {
      setMessage(null)
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      // Server-Seite (Preview-Gewichtung) neu rendern.
      router.refresh()
    },
    onError: (error: unknown) => {
      setMessage(error instanceof Error ? error.message : 'Speichern fehlgeschlagen.')
    },
  })

  const submit = handleSubmit(values => mutation.mutate(values))

  function toggle(preference: FoodPreferenceKind) {
    setValue('preference', preference)
    void submit()
  }

  const buttonClass = (active: boolean, activeClass: string) =>
    `rounded-full border px-2.5 py-1 text-xs transition ${
      active ? activeClass : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500'
    }`

  return (
    <form className="mt-2 flex flex-wrap items-center gap-2" onSubmit={submit}>
      <button
        className={buttonClass(current === 'liked', 'border-emerald-400 bg-emerald-400 text-emerald-950')}
        disabled={mutation.isPending}
        onClick={() => toggle('liked')}
        type="button"
      >
        {current === 'liked' ? 'Favorit entfernen' : 'Favorit'}
      </button>
      <button
        className={buttonClass(current === 'hard_exclude', 'border-amber-300 bg-amber-300 text-amber-950')}
        disabled={mutation.isPending}
        onClick={() => toggle('hard_exclude')}
        type="button"
      >
        {current === 'hard_exclude' ? 'Ausschluss aufheben' : 'Ausschliessen'}
      </button>
      {message ? <span className="text-xs text-amber-200">{message}</span> : null}
    </form>
  )
}
