import { NextRequest, NextResponse } from 'next/server'

import { LocalFoodSearchError, getLocalFoodSearch } from '../../../../lib/nutrition/food-search'

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

  try {
    const payload = await getLocalFoodSearch(query, foodId, { category, categoryId, tag, limit, offset, sort })
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
