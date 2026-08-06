import { NextResponse } from 'next/server'

import { isCurrentUserAdmin } from '../../../../lib/auth/admin-session'
import { getNutritionCurationData } from '../../../../lib/nutrition/curation'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  // Dieselbe Rollenprüfung wie in der Seite (C.3, 2026-08-06). Ohne sie
  // wäre die Route der Umweg um die Seite — die Seite verweigert, die
  // Route liefert. Die Datenbank hielte zwar dicht (RLS aus 061), aber
  // die Antwort sähe vollständig aus und trüge stillschweigend Nullwerte.
  if (!(await isCurrentUserAdmin())) {
    return NextResponse.json(
      { error: 'FORBIDDEN', message: 'Kuration ist der Verwaltung vorbehalten.' },
      { status: 403 },
    )
  }
  try {
    const url = new URL(request.url)
    return NextResponse.json(await getNutritionCurationData({
      unassignedOnly: url.searchParams.get('unassigned') !== 'false',
      category: url.searchParams.get('category') ?? '',
      tag: url.searchParams.get('tag') ?? '',
      aliasState: url.searchParams.get('alias') === 'has' || url.searchParams.get('alias') === 'missing'
        ? url.searchParams.get('alias') as 'has' | 'missing'
        : '',
      sort: ['sort_weight_desc', 'name_asc', 'macro_relevance', 'category_missing_first'].includes(url.searchParams.get('sort') ?? '')
        ? url.searchParams.get('sort') as 'sort_weight_desc' | 'name_asc' | 'macro_relevance' | 'category_missing_first'
        : 'category_missing_first',
    }))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: 'LOCAL_NUTRITION_CURATION_FAILED', message },
      { status: 500 },
    )
  }
}
