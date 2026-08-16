// Schreibpfad fuer Wassereintraege. Session-basiert, RLS-konform.
// Fehlerformat nach Hausregel: { error, code } mit stabilem Code.
//
// Die Logik liegt in lib/nutrition/water-write.ts und water-model.ts
// (beide von Codex) — diese Datei uebersetzt nur HTTP, wie die
// Tagebuch-Route daneben.
import { NextRequest, NextResponse } from 'next/server'

import { httpStatusForDiaryError } from '../../../../lib/nutrition/diary-model'
import { WaterWriteError, waterLogCreateSchema } from '../../../../lib/nutrition/water-model'
import { addWaterLog } from '../../../../lib/nutrition/water-write'
import { getHydrationDay } from '../../../../lib/nutrition/hydration-day-read'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function errorResponse(error: unknown) {
  if (error instanceof WaterWriteError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: httpStatusForDiaryError(error.code) },
    )
  }
  return NextResponse.json(
    { error: error instanceof Error ? error.message : String(error), code: 'WRITE_FAILED' },
    { status: 500 },
  )
}

/** Der Wasserhaushalt eines Tages. */
export async function GET(request: NextRequest) {
  const datum = request.nextUrl.searchParams.get('datum') ?? ''
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) {
    return NextResponse.json(
      { error: 'datum muss YYYY-MM-DD sein.', code: 'VALIDATION_FAILED' },
      { status: 400 },
    )
  }
  try {
    return NextResponse.json({ tag: await getHydrationDay(datum) })
  } catch (error) {
    return errorResponse(error)
  }
}

/**
 * Einen Wassereintrag anlegen.
 *
 * Antwortet mit dem neu gerechneten Tag, damit die Kachel nicht
 * zweimal fragen muss — und damit die Zahlen aus derselben Quelle
 * kommen wie beim Laden.
 */
export async function POST(request: NextRequest) {
  let roh: unknown
  try {
    roh = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Ungueltiger JSON-Rumpf.', code: 'VALIDATION_FAILED' },
      { status: 400 },
    )
  }

  const geprueft = waterLogCreateSchema.safeParse(roh)
  if (!geprueft.success) {
    return NextResponse.json(
      { error: 'Eingabe ungueltig.', code: 'VALIDATION_FAILED', details: geprueft.error.flatten() },
      { status: 400 },
    )
  }

  try {
    await addWaterLog(geprueft.data)
    return NextResponse.json({ tag: await getHydrationDay(geprueft.data.entry_date) }, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}
