import { NextResponse } from 'next/server'

import { LocalSchemaDebugError, getLocalNutritionSchemaDebug } from '../../../../lib/nutrition/local-schema-debug'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const snapshot = await getLocalNutritionSchemaDebug()
    return NextResponse.json(snapshot)
  } catch (error) {
    if (error instanceof LocalSchemaDebugError) {
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
