import { NextRequest, NextResponse } from 'next/server'

import {
  LocalFoodSearchError,
  NUTRITION_SEARCH_SESSION_COOKIE,
  getLocalFoodSearch,
  recordFoodSearchEvent,
} from '../../../../lib/nutrition/food-search'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q') ?? ''
  const foodId = request.nextUrl.searchParams.get('food') ?? undefined
  const category = request.nextUrl.searchParams.get('category') ?? ''
  const categoryId = request.nextUrl.searchParams.get('category_id') ?? ''
  const tag = request.nextUrl.searchParams.get('tag') ?? ''
  const limit = Number.parseInt(request.nextUrl.searchParams.get('limit') ?? '', 10)
  const offset = Number.parseInt(request.nextUrl.searchParams.get('offset') ?? '', 10)
  const sort = request.nextUrl.searchParams.get('sort') ?? ''
  // Vorlieben anwenden (C-94) — `prefs=1` schaltet sie ein.
  //
  // `[read]` Die Kennung selbst steht NICHT in der Adresse: sie kommt
  // aus der Sitzung (getLocalFoodSearch). Dieser Schalter waehlt nur
  // zwischen „meine Vorlieben" und „ganzer Katalog" — er kann keine
  // fremden Vorlieben anfordern.
  //
  // `[read]` AUS ist die Vorgabe, weil dieselbe Route den Katalog im
  // Food-DB-Register bedient (G-73). Der Erfassungsdialog schaltet
  // ein; wer nichts sagt, bekommt weiter den ganzen Bestand.
  const applyPreferences = request.nextUrl.searchParams.get('prefs') === '1'

  // G-133: Tag-Codes, die aus der GESAMTMENGE fallen — `ohne=a,b`.
  //
  // `[cmd]` Seit C-164 kann `food_search` das (`p_filters`, SSOT 169).
  // Vorher blendete der Tab sie nur auf der geladenen Seite aus; bei
  // 143 Seiten standen sie auf Seite 2 wieder da.
  //
  // `[read]` Ein unbekannter Code schliesst nichts aus — die Datenbank
  // vergleicht gegen `tag_definitions.code`. Gemessen: `contains_laktose`
  // (Tippfehler) laesst `total` bei 7.140. Es braucht deshalb keine
  // Weissliste hier; sie waere eine zweite Wahrheit neben der Tabelle.
  const ohne = (request.nextUrl.searchParams.get('ohne') ?? '')
    .split(',').map(c => c.trim()).filter(Boolean)

  // G-112: die gewaehlten Filter-Tags — `tags=a,b`.
  //
  // `[cmd]` **`p_tag_code` ist Singular** (C-120), aber `p_filters`
  // traegt `tag_groups`: eine Liste von Gruppen, **ODER innerhalb,
  // UND zwischen**. `[cmd]` Gemessen 2026-08-29: `vegan` 1.377,
  // `high_protein` 1.400 — ODER 2.712, UND 65.
  //
  // `[read]` **`tag` bleibt fuer den Einzelfall** (Verweise von
  // aussen). Kommt beides, gewinnt die Liste.
  const tagListe = (request.nextUrl.searchParams.get('tags') ?? '')
    .split(',').map(c => c.trim()).filter(Boolean)

  // G-251: die Herkunfts-Filter — `herkunft=bevorzugt` bzw. `eigene`.
  //
  // `[cmd]` **Beide brauchen `p_user_id`**, und der kommt aus der
  // Sitzung, nie aus der Anfrage (siehe `p_user_id` in food-search.ts:
  // eine fremde Kennung liesse fremde Allergien aus den Trefferzahlen
  // ablesen). `[read]` **Deshalb setzt `herkunft` implizit `prefs`** —
  // ohne angewandte Vorlieben gaebe es kein `is_favorite`, und der
  // Filter liefe ins Leere, ohne dass jemand merkt warum.
  const herkunft = request.nextUrl.searchParams.get('herkunft') ?? ''
  const bevorzugt = herkunft === 'bevorzugt'
  const nurEigene = herkunft === 'eigene'

  try {
    const payload = await getLocalFoodSearch(query, foodId, {
      category, categoryId, tag, limit, offset, sort,
      applyPreferences: applyPreferences || bevorzugt,
      excludeTags: ohne,
      tags: tagListe,
      bevorzugt,
      nurEigene,
    })
    const selectedIndex = foodId
      ? payload.foods.findIndex(food => food.id === foodId)
      : -1
    await recordFoodSearchEvent({
      sessionId: request.cookies.get(NUTRITION_SEARCH_SESSION_COOKIE)?.value,
      query,
      normalizedQuery: payload.normalized_query,
      resultCount: payload.total,
      selectedFoodId: payload.selected_food?.id ?? null,
      selectedBlsCode: payload.selected_food?.bls_code ?? null,
      selectedRank: selectedIndex >= 0 ? payload.offset + selectedIndex + 1 : null,
    })
    return NextResponse.json(payload)
  } catch (error) {
    if (error instanceof LocalFoodSearchError) {
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
