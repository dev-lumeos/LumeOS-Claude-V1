import { NextResponse } from 'next/server'

import { LocalFoodSearchError, getLocalFoodCategories } from '../../../../../lib/nutrition/food-search'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const data = await getLocalFoodCategories()
    return NextResponse.json({ ok: true, data })
  } catch (error) {
    if (error instanceof LocalFoodSearchError) {
      return NextResponse.json(
        { ok: false, error: error.message, code: error.code },
        { status: error.code === 'LOCAL_DB_UNAVAILABLE' ? 503 : 500 },
      )
    }

    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
