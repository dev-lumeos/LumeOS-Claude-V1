import { NextResponse } from 'next/server'

import { runGovernanceCommand } from '../../../../lib/governance/command-runner'
import type { CommandRequest } from '../../../../lib/governance/command-allowlist'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json() as CommandRequest
    const result = await runGovernanceCommand(body)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    )
  }
}
