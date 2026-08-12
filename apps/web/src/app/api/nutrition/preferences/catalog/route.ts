import { NextResponse } from 'next/server'

import { getNutritionPreferenceCatalog, summarizePreferenceCatalog } from '@lumeos/shared/nutrition/preferences-catalog'

export const dynamic = 'force-dynamic'

export async function GET() {
  const catalog = getNutritionPreferenceCatalog()
  return NextResponse.json({
    ok: true,
    catalog,
    summary: summarizePreferenceCatalog(catalog),
  })
}
