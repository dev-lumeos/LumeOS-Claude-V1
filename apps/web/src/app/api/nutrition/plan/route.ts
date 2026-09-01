// Schreibpfad fuer Essensplaene (G-267 / G-268). Session-basiert,
// RLS-konform. Fehlerformat nach Hausregel: { error, code }.
//
// Die Logik liegt vollstaendig in `lib/nutrition/plan-write.ts` —
// diese Datei uebersetzt nur HTTP, wie `api/nutrition/diary`.
import { NextRequest, NextResponse } from 'next/server'

import {
  DiaryWriteError,
  httpStatusForDiaryError,
} from '../../../../lib/nutrition/diary-model'
import {
  planAendern,
  planAendernSchema,
  planAnlegen,
  planAnlegenSchema,
  // G-298: die Positionen - hinzufuegen, aendern, entfernen.
  eintragAnlegenSchema,
  eintragAendernSchema,
  eintragLoeschenSchema,
  planEintragAnlegen,
  planEintragAendern,
  planEintragLoeschen,
  // C-372: die Werkbank - ein Plan mit Wochen.
  planMitWochenAnlegen,
  planMitWochenSchema,
  // C-377/C-373: der abgelaufene Plan wird geklaert.
  ablaufKlaeren,
  ablaufKlaerenSchema,
} from '../../../../lib/nutrition/plan-write'
// G-309: die Ghost Entries eines Tages — Flow 3, Schritt 7.
import { ladeGhostEintraege } from '../../../../lib/nutrition/plan-lesen'
// G-274: der Bestaetigungsweg — Flow 4.
import {
  bestaetigenSchema,
  planEintragBestaetigen,
  planEintragUeberspringen,
  ueberspringenSchema,
} from '../../../../lib/nutrition/plan-log-write'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function errorResponse(error: unknown) {
  if (error instanceof DiaryWriteError) {
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
 * Die Ghost Entries eines Tages — G-309.
 *
 * **`SPEC_03` Flow 3, Schritt 7:** *,,Ab Startdatum: Ghost Entries
 * erscheinen im Diary."*
 *
 * `[read]` **Lesend, deshalb GET** — ein Ghost Entry entsteht durch
 * Anzeigen, nicht durch Schreiben. **Geschrieben wird erst beim
 * Bestaetigen**, und dafuer gibt es `POST art=bestaetigen` (G-274).
 */
export async function GET(request: NextRequest) {
  const datum = request.nextUrl.searchParams.get('datum')
  if (!datum || !/^\d{4}-\d{2}-\d{2}$/.test(datum)) {
    return ungueltig('Erwartet ?datum=YYYY-MM-DD.')
  }
  try {
    return NextResponse.json({ eintraege: await ladeGhostEintraege(datum) })
  } catch (error) {
    return errorResponse(error)
  }
}

/**
 * Plan anlegen oder aendern.
 *
 * Eine Route, zwei Vorgaenge, unterschieden ueber `art` — dieselbe
 * Form wie im Tagebuch.
 */
export async function POST(request: NextRequest) {
  let roh: unknown
  try {
    roh = await request.json()
  } catch {
    return ungueltig('Ungueltiger Anfragekoerper.')
  }

  const art = (roh as Record<string, unknown>)?.art

  if (art === 'plan') {
    const geprueft = planAnlegenSchema.safeParse(roh)
    if (!geprueft.success) {
      return ungueltig(geprueft.error.issues[0]?.message ?? 'Eingabe ungueltig.',
        geprueft.error.issues.map(i => ({ feld: i.path.join('.'), meldung: i.message })))
    }
    try {
      return NextResponse.json(await planAnlegen(geprueft.data))
    } catch (error) {
      return errorResponse(error)
    }
  }

  if (art === 'plan_aendern') {
    const geprueft = planAendernSchema.safeParse(roh)
    if (!geprueft.success) {
      return ungueltig(geprueft.error.issues[0]?.message ?? 'Eingabe ungueltig.',
        geprueft.error.issues.map(i => ({ feld: i.path.join('.'), meldung: i.message })))
    }
    try {
      return NextResponse.json(await planAendern(geprueft.data))
    } catch (error) {
      return errorResponse(error)
    }
  }

  // G-274: Flow 4 — bestaetigen und ueberspringen.
  if (art === 'bestaetigen') {
    const geprueft = bestaetigenSchema.safeParse(roh)
    if (!geprueft.success) {
      return ungueltig(geprueft.error.issues[0]?.message ?? 'Eingabe ungueltig.',
        geprueft.error.issues.map(i => ({ feld: i.path.join('.'), meldung: i.message })))
    }
    try {
      return NextResponse.json(await planEintragBestaetigen(geprueft.data))
    } catch (error) {
      return errorResponse(error)
    }
  }

  if (art === 'ueberspringen') {
    const geprueft = ueberspringenSchema.safeParse(roh)
    if (!geprueft.success) {
      return ungueltig(geprueft.error.issues[0]?.message ?? 'Eingabe ungueltig.',
        geprueft.error.issues.map(i => ({ feld: i.path.join('.'), meldung: i.message })))
    }
    try {
      return NextResponse.json(await planEintragUeberspringen(geprueft.data))
    } catch (error) {
      return errorResponse(error)
    }
  }

  // ── G-298: die Eintraege ────────────────────────────────────
  //
  // `[read]` **Dieselbe Form wie oben** - eine Route, ein `art`.
  // Drei eigene Routen waeren drei Stellen mit derselben
  // Fehlerbehandlung.
  if (art === 'eintrag') {
    const geprueft = eintragAnlegenSchema.safeParse(roh)
    if (!geprueft.success) {
      return ungueltig(geprueft.error.issues[0]?.message ?? 'Eingabe ungueltig.',
        geprueft.error.issues.map(i => ({ feld: i.path.join('.'), meldung: i.message })))
    }
    try {
      return NextResponse.json(await planEintragAnlegen(geprueft.data))
    } catch (error) {
      return errorResponse(error)
    }
  }

  if (art === 'eintrag_aendern') {
    const geprueft = eintragAendernSchema.safeParse(roh)
    if (!geprueft.success) {
      return ungueltig(geprueft.error.issues[0]?.message ?? 'Eingabe ungueltig.',
        geprueft.error.issues.map(i => ({ feld: i.path.join('.'), meldung: i.message })))
    }
    try {
      return NextResponse.json(await planEintragAendern(geprueft.data))
    } catch (error) {
      return errorResponse(error)
    }
  }

  if (art === 'eintrag_loeschen') {
    const geprueft = eintragLoeschenSchema.safeParse(roh)
    if (!geprueft.success) {
      return ungueltig(geprueft.error.issues[0]?.message ?? 'Eingabe ungueltig.',
        geprueft.error.issues.map(i => ({ feld: i.path.join('.'), meldung: i.message })))
    }
    try {
      return NextResponse.json(await planEintragLoeschen(geprueft.data))
    } catch (error) {
      return errorResponse(error)
    }
  }

  // ── C-372: ein Plan MIT Wochen (die Werkbank) ───────────────
  if (art === 'plan_werkbank') {
    const g = planMitWochenSchema.safeParse(roh)
    if (!g.success) {
      return ungueltig(g.error.issues[0]?.message ?? 'Eingabe ungueltig.',
        g.error.issues.map(i => ({ feld: i.path.join('.'), meldung: i.message })))
    }
    try {
      return NextResponse.json(await planMitWochenAnlegen(g.data))
    } catch (error) {
      return errorResponse(error)
    }
  }

  // ── C-377/C-373: den abgelaufenen Plan klaeren ──────────────
  if (art === 'ablauf_klaeren') {
    const g = ablaufKlaerenSchema.safeParse(roh)
    if (!g.success) {
      return ungueltig(g.error.issues[0]?.message ?? 'Eingabe ungueltig.',
        g.error.issues.map(i => ({ feld: i.path.join('.'), meldung: i.message })))
    }
    try {
      return NextResponse.json(await ablaufKlaeren(g.data))
    } catch (error) {
      return errorResponse(error)
    }
  }

  return ungueltig(
    'Unbekannte Art. Erlaubt: plan, plan_aendern, bestaetigen, ueberspringen, '
    + 'eintrag, eintrag_aendern, eintrag_loeschen, plan_werkbank, '
    + 'ablauf_klaeren.')
}
