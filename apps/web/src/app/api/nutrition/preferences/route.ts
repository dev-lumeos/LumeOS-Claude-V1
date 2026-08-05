// Schreibpfad für Food-Präferenzen (C-02). Session-basiert, RLS-konform.
// Fehlerformat nach Hausregel: { error, code } mit stabilem Code.
// GET ist eine notwendige Ergänzung über den Auftragstext hinaus: die
// Toggles brauchen den eigenen Bestand für ihren Anfangszustand.
import { NextRequest, NextResponse } from 'next/server'

import {
  PreferenceWriteError,
  foodPreferenceDeleteSchema,
  foodPreferenceWriteSchema,
  httpStatusForPreferenceError,
} from '../../../../lib/nutrition/preferences-model'
import {
  listOwnFoodPreferenceItems,
  removeFoodPreference,
  setFoodPreference,
} from '../../../../lib/nutrition/preferences-write'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function errorResponse(error: unknown) {
  if (error instanceof PreferenceWriteError) {
    // Meldungen der PreferenceWriteError sind kuratierte Texte, keine
    // internen Ausnahmetexte (Konvention §6).
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: httpStatusForPreferenceError(error.code) },
    )
  }
  // Unerwartete Fehler nicht nach aussen durchreichen (Konvention §6).
  console.error('nutrition/preferences route failed:', error)
  return NextResponse.json(
    { error: 'Präferenz-Anfrage fehlgeschlagen.', code: 'WRITE_FAILED' },
    { status: 500 },
  )
}

export async function GET() {
  try {
    const items = await listOwnFoodPreferenceItems()
    return NextResponse.json({ ok: true, items })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Body ist kein gültiges JSON.', code: 'VALIDATION_FAILED' },
      { status: 400 },
    )
  }
  const parsed = foodPreferenceWriteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.', code: 'VALIDATION_FAILED' },
      { status: 400 },
    )
  }
  try {
    const result = await setFoodPreference(parsed.data)
    return NextResponse.json({ ok: true, ...result }, { status: result.action === 'insert' ? 201 : 200 })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function DELETE(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Body ist kein gültiges JSON.', code: 'VALIDATION_FAILED' },
      { status: 400 },
    )
  }
  const parsed = foodPreferenceDeleteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.', code: 'VALIDATION_FAILED' },
      { status: 400 },
    )
  }
  try {
    const result = await removeFoodPreference(parsed.data.food_id)
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    return errorResponse(error)
  }
}
