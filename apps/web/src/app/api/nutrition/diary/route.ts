// Schreibpfad ins Tagebuch (C-03). Session-basiert, RLS-konform.
// Fehlerformat nach Hausregel: { error, code } mit stabilem Code.
//
// `[cmd]` Der dritte Schreibpfad in apps/web — und der erste mit
// fachlichem Inhalt. Suchprotokoll (Insert ohne Nutzerbezug) und
// Profilpflege (eine Zeile je Nutzerin) waren die beiden davor. Hier
// entstehen Zeilen, die spaeter niemand mehr rekonstruieren kann:
// `[read]` die eingefrorenen Naehrwerte sind der Zustand von HEUTE, und
// wenn sie falsch sind, ist der Tag falsch.
//
// Die Logik liegt vollstaendig in lib/nutrition/diary-write.ts und
// diary-model.ts — diese Datei uebersetzt nur HTTP.
import { NextRequest, NextResponse } from 'next/server'

import {
  DiaryWriteError,
  httpStatusForDiaryError,
  mealCreateSchema,
  mealItemCreateSchema,
  mealItemUpdateSchema,
} from '../../../../lib/nutrition/diary-model'
import {
  addMealItem,
  createMeal,
  listOwnMealItems,
  listOwnMeals,
  listPortionsForFood,
  removeMealItem,
  updateMealItemAmount,
} from '../../../../lib/nutrition/diary-write'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function errorResponse(error: unknown) {
  if (error instanceof DiaryWriteError) {
    // Kuratierte Texte, keine internen Ausnahmetexte (Konvention §6).
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

function ungueltig(meldung: string, details?: unknown) {
  return NextResponse.json(
    { error: meldung, code: 'VALIDATION_FAILED', details },
    { status: 400 },
  )
}

/**
 * Mahlzeiten eines Tages samt Positionen.
 *
 * Zwei Abfragen statt einer verschachtelten: `listOwnMealItems` filtert
 * je Mahlzeit, und PostgREST-Einbettung ueber zwei Tabellen mit RLS
 * ist schwerer zu lesen als zwei klare Aufrufe. `[annahme]` Bei
 * Dutzenden Mahlzeiten je Tag unkritisch — heute sind es null.
 */
export async function GET(request: NextRequest) {
  // C-51: Portionen eines Lebensmittels — fuer die Auswahl beim
  // Hinzufuegen. Eigener Zweig statt eigener Route: dieselbe Sitzung,
  // dieselbe Fehlerbehandlung.
  const fuerFood = request.nextUrl.searchParams.get('portionen_fuer')
  if (fuerFood) {
    if (!/^[0-9a-f-]{36}$/i.test(fuerFood)) {
      return ungueltig('portionen_fuer muss eine UUID sein.')
    }
    try {
      return NextResponse.json({ portionen: await listPortionsForFood(fuerFood) })
    } catch (error) {
      return errorResponse(error)
    }
  }

  const datum = request.nextUrl.searchParams.get('datum') ?? ''
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) {
    return ungueltig('datum muss YYYY-MM-DD sein.')
  }

  try {
    const mahlzeiten = await listOwnMeals(datum)
    const mitPositionen = await Promise.all(
      mahlzeiten.map(async m => ({
        ...m,
        items: await listOwnMealItems(m.id),
      })),
    )
    return NextResponse.json({ datum, meals: mitPositionen })
  } catch (error) {
    return errorResponse(error)
  }
}

/**
 * Mahlzeit anlegen oder Position hinzufuegen.
 *
 * Eine Route, zwei Vorgaenge, unterschieden ueber `art`. Der Grund:
 * beide gehoeren zum selben Bildschirm und derselben Sitzung; zwei
 * Routen brauchten zweimal dieselbe Fehlerbehandlung.
 */
export async function POST(request: NextRequest) {
  let roh: unknown
  try {
    roh = await request.json()
  } catch {
    return ungueltig('Ungueltiger Anfragekoerper.')
  }

  const art = (roh as Record<string, unknown>)?.art

  if (art === 'mahlzeit') {
    const geprueft = mealCreateSchema.safeParse(roh)
    if (!geprueft.success) {
      return ungueltig(geprueft.error.issues[0]?.message ?? 'Eingabe ungueltig.',
        geprueft.error.issues.map(i => ({ feld: i.path.join('.'), meldung: i.message })))
    }
    try {
      return NextResponse.json(await createMeal(geprueft.data))
    } catch (error) {
      return errorResponse(error)
    }
  }

  if (art === 'position') {
    const geprueft = mealItemCreateSchema.safeParse(roh)
    if (!geprueft.success) {
      return ungueltig(geprueft.error.issues[0]?.message ?? 'Eingabe ungueltig.',
        geprueft.error.issues.map(i => ({ feld: i.path.join('.'), meldung: i.message })))
    }
    try {
      return NextResponse.json(await addMealItem(geprueft.data))
    } catch (error) {
      return errorResponse(error)
    }
  }

  return ungueltig('art muss "mahlzeit" oder "position" sein.')
}

/** Menge einer Position aendern — die Naehrwerte werden neu eingefroren. */
export async function PATCH(request: NextRequest) {
  let roh: unknown
  try {
    roh = await request.json()
  } catch {
    return ungueltig('Ungueltiger Anfragekoerper.')
  }

  const geprueft = mealItemUpdateSchema.safeParse(roh)
  if (!geprueft.success) {
    return ungueltig(geprueft.error.issues[0]?.message ?? 'Eingabe ungueltig.',
      geprueft.error.issues.map(i => ({ feld: i.path.join('.'), meldung: i.message })))
  }

  try {
    return NextResponse.json(await updateMealItemAmount(geprueft.data))
  } catch (error) {
    return errorResponse(error)
  }
}

/** Position entfernen. */
export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id') ?? ''
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return ungueltig('id muss eine UUID sein.')
  }

  try {
    return NextResponse.json(await removeMealItem(id))
  } catch (error) {
    return errorResponse(error)
  }
}
