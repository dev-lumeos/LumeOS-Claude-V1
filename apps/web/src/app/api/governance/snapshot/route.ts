import { NextResponse } from 'next/server'

import { DEFAULT_BATCH_PATH } from '../../../../lib/governance/command-allowlist'
import { buildGovernanceSnapshot } from '../../../../lib/governance/snapshot'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const batchPath = url.searchParams.get('batch') ?? DEFAULT_BATCH_PATH
  try {
    const snapshot = await buildGovernanceSnapshot(batchPath)
    return NextResponse.json(snapshot)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    )
  }
}
