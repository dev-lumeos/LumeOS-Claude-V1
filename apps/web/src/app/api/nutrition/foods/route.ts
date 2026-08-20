import { NextRequest, NextResponse } from 'next/server'

import {
  LocalFoodSearchError,
  NUTRITION_SEARCH_SESSION_COOKIE,
  getLocalFoodSearch,
  recordFoodSearchEvent,
} from '../../../../lib/nutrition/food-search'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q') ?? ''
  const foodId = request.nextUrl.searchParams.get('food') ?? undefined
  const category = request.nextUrl.searchParams.get('category') ?? ''
  const categoryId = request.nextUrl.searchParams.get('category_id') ?? ''
  const tag = request.nextUrl.searchParams.get('tag') ?? ''
  const limit = Number.parseInt(request.nextUrl.searchParams.get('limit') ?? '', 10)
  const offset = Number.parseInt(request.nextUrl.searchParams.get('offset') ?? '', 10)
  const sort = request.nextUrl.searchParams.get('sort') ?? ''
  // Vorlieben anwenden (C-94) — `prefs=1` schaltet sie ein.
  //
  // `[read]` Die Kennung selbst steht NICHT in der Adresse: sie kommt
  // aus der Sitzung (getLocalFoodSearch). Dieser Schalter waehlt nur
  // zwischen „meine Vorlieben" und „ganzer Katalog" — er kann keine
  // fremden Vorlieben anfordern.
  //
  // `[read]` AUS ist die Vorgabe, weil dieselbe Route den Katalog im
  // Food-DB-Register bedient (G-73). Der Erfassungsdialog schaltet
  // ein; wer nichts sagt, bekommt weiter den ganzen Bestand.
  const applyPreferences = request.nextUrl.searchParams.get('prefs') === '1'

  try {
    const payload = await getLocalFoodSearch(query, foodId, {
      category, categoryId, tag, limit, offset, sort, applyPreferences,
    })
    const selectedIndex = foodId
      ? payload.foods.findIndex(food => food.id === foodId)
      : -1
    await recordFoodSearchEvent({
      sessionId: request.cookies.get(NUTRITION_SEARCH_SESSION_COOKIE)?.value,
      query,
      normalizedQuery: payload.normalized_query,
      resultCount: payload.total,
      selectedFoodId: payload.selected_food?.id ?? null,
      selectedBlsCode: payload.selected_food?.bls_code ?? null,
      selectedRank: selectedIndex >= 0 ? payload.offset + selectedIndex + 1 : null,
    })
    return NextResponse.json(payload)
  } catch (error) {
    if (error instanceof LocalFoodSearchError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.code === 'LOCAL_DB_UNAVAILABLE' ? 503 : 500 },
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
