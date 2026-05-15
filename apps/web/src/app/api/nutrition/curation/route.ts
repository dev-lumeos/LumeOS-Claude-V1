import { NextResponse } from 'next/server'

import { getNutritionCurationData } from '../../../../lib/nutrition/curation'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    return NextResponse.json(await getNutritionCurationData())
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: 'LOCAL_NUTRITION_CURATION_FAILED', message },
      { status: 500 },
    )
  }
}
