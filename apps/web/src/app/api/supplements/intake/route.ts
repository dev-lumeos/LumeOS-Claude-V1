// Schreibpfad fuer Einnahmen und Stack-Positionen (G-148).
// Session-basiert, RLS-konform. Fehlerformat nach Hausregel:
// { error, code } mit stabilem Code.
//
// Die Logik liegt in `lib/supplements/stack-write.ts` — diese Datei
// uebersetzt nur HTTP, wie die Wasser-Route daneben
// (`api/nutrition/water/route.ts`).
import { NextRequest, NextResponse } from 'next/server'

import {
  SupplementSchreibFehler,
  entferneEinnahme,
  entfernePosition,
  erfasseEinnahme,
  ergaenzePosition,
  setzeBestand,
} from '../../../../lib/supplements/stack-write'
import { getStackDaten } from '../../../../lib/supplements/stack-read'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function status(code: SupplementSchreibFehler['code']): number {
  switch (code) {
    case 'NO_SESSION': return 401
    case 'VALIDATION_FAILED': return 400
    case 'NOT_FOUND': return 404
    default: return 500
  }
}

function fehler(e: unknown) {
  if (e instanceof SupplementSchreibFehler) {
    return NextResponse.json({ error: e.message, code: e.code }, { status: status(e.code) })
  }
  return NextResponse.json(
    { error: e instanceof Error ? e.message : String(e), code: 'WRITE_FAILED' },
    { status: 500 },
  )
}

async function rumpf(request: NextRequest): Promise<Record<string, unknown>> {
  try {
    return (await request.json()) as Record<string, unknown>
  } catch {
    throw new SupplementSchreibFehler('VALIDATION_FAILED', 'Ungueltiger JSON-Rumpf.')
  }
}

/**
 * Eine Einnahme erfassen oder eine Position ergaenzen.
 *
 * `?was=einnahme` (Vorgabe) schreibt nach `intake_logs`,
 * `?was=position` nach `stack_items`.
 *
 * `[read]` **Die Antwort traegt den neu gelesenen Stack mit** — dieselbe
 * Quelle wie beim Laden, damit die Oberflaeche nicht zweimal fragt und
 * die Compliance aus derselben Rechnung kommt (Muster aus G-117).
 */
export async function POST(request: NextRequest) {
  const was = request.nextUrl.searchParams.get('was') ?? 'einnahme'
  try {
    const b = await rumpf(request)

    if (was === 'position') {
      const angelegt = await ergaenzePosition({
        supplement_id: (b.supplement_id as string | null) ?? null,
        custom_name: (b.custom_name as string | null) ?? null,
        dose: Number(b.dose),
        dose_unit: String(b.dose_unit ?? ''),
        timing: String(b.timing ?? 'morning'),
        frequency: b.frequency ? String(b.frequency) : undefined,
      })
      return NextResponse.json({ angelegt, daten: await getStackDaten() }, { status: 201 })
    }

    if (was !== 'einnahme') {
      return NextResponse.json(
        { error: 'was muss `einnahme` oder `position` sein.', code: 'VALIDATION_FAILED' },
        { status: 400 },
      )
    }

    const roh = b.status
    if (roh !== 'taken' && roh !== 'skipped') {
      return NextResponse.json(
        { error: 'status muss `taken` oder `skipped` sein.', code: 'VALIDATION_FAILED' },
        { status: 400 },
      )
    }
    const eintrag = await erfasseEinnahme({
      stack_item_id: String(b.stack_item_id ?? ''),
      intake_date: String(b.intake_date ?? ''),
      intake_time: (b.intake_time as string | null) ?? null,
      status: roh,
      actual_dose: b.actual_dose == null ? null : Number(b.actual_dose),
      notes: (b.notes as string | null) ?? null,
    })
    return NextResponse.json({ eintrag, daten: await getStackDaten() }, { status: 201 })
  } catch (e) {
    return fehler(e)
  }
}

/**
 * Den Bestand einer Position setzen — der Nachbestellweg.
 *
 * `[cmd]` Es gibt keine `user_inventory`-Tabelle; der Bestand steht in
 * `stack_items.stock_remaining`.
 */
export async function PATCH(request: NextRequest) {
  try {
    const b = await rumpf(request)
    const id = String(b.id ?? '')
    if (!id) {
      return NextResponse.json(
        { error: 'id ist Pflicht.', code: 'VALIDATION_FAILED' }, { status: 400 })
    }
    const gesetzt = await setzeBestand(
      id,
      Number(b.stock_remaining),
      b.low_stock_threshold === undefined ? undefined
        : (b.low_stock_threshold === null ? null : Number(b.low_stock_threshold)),
    )
    return NextResponse.json({ gesetzt, daten: await getStackDaten() })
  } catch (e) {
    return fehler(e)
  }
}

/**
 * Eine Einnahme oder eine Position entfernen.
 *
 * `[cmd]` **Beide Wege pruefen auf null Zeilen** (G-79) — eine fremde
 * Id gibt 404, nicht `ok`.
 */
export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id') ?? ''
  const was = request.nextUrl.searchParams.get('was') ?? 'einnahme'
  if (!id) {
    return NextResponse.json(
      { error: 'id ist Pflicht.', code: 'VALIDATION_FAILED' }, { status: 400 })
  }
  try {
    if (was === 'position') await entfernePosition(id)
    else await entferneEinnahme(id)
    return NextResponse.json({ daten: await getStackDaten() })
  } catch (e) {
    return fehler(e)
  }
}
