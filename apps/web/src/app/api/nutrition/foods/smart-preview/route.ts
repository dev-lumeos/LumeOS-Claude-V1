import { NextRequest, NextResponse } from 'next/server'

import { getPreferenceSearchPreview } from '../../../../../lib/nutrition/preference-search-preview'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  try {
    // Seit C-02 kommen die Präferenzen aus der Datenbank (RLS-Session);
    // die früheren URL-Parameter dafür entfallen.
    const payload = await getPreferenceSearchPreview({
      query: searchParams.get('q') ?? '',
      limit: Number.parseInt(searchParams.get('limit') ?? '25', 10),
      offset: Number.parseInt(searchParams.get('offset') ?? '0', 10),
      sort: searchParams.get('sort') ?? 'relevance',
    })

    return NextResponse.json(payload)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: 'LOCAL_PREFERENCE_PREVIEW_FAILED', message },
      { status: 500 },
    )
  }
}
