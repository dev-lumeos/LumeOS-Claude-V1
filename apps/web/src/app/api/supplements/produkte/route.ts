// Die Produktsuche (G-452).
//
// `[read]` **Dasselbe Muster wie `api/supplements/substanz`** —
// Session-Client, kein Service-Client. Der Katalog ist nicht
// nutzergebunden, die Zeilenrechte entscheiden trotzdem.
//
// `[read]` **Warum eine Route und nicht nur die Seite:** bei 214.780
// Zeilen sucht die Datenbank, nicht der Browser. Jeder Tastendruck
// braucht deshalb einen Weg zum Server, und der Reiter blaettert
// serverseitig weiter.
import { NextRequest, NextResponse } from 'next/server'

import { createSessionClient } from '@lumeos/shared/session'

import { sucheProdukte, SEITE } from '../../../../lib/supplements/produkte-read'
// G-455: der harte Allergiefilter — die Trefferfunktion aus C-498.
import { ladeAllergieTreffer } from '../../../../lib/allergien/allergie-read'
import { harteIds as ids } from '../../../../lib/allergien/allergie-lage'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams
  const frage = p.get('q') ?? ''
  // ══ G-455: MEHRERE MARKEN ═══════════════════════════════════════
  //
  // **Tom (G-453):** *„dass ein user seine filtermasken mit marken
  // setzen kann und nicht nur eine marke waehlen."*
  //
  // `[read]` **Kommagetrennt und sortiert** — dieselbe Form wie die
  // Tags in `food-suche-hook.ts` (G-112): **sortiert, damit dieselbe
  // Auswahl immer dieselbe Adresse ergibt.** Sonst waeren zwei
  // gleichwertige Links verschieden und der Zwischenspeicher liefe
  // doppelt.
  //
  // `[cmd]` **`marke` bleibt als Einzelwert erlaubt** — alte Links
  // (`?marke=NOW`) sollen nicht ins Leere zeigen.
  const marken = Array.from(new Set([
    ...(p.get('marken') ?? '').split(',').map(m => m.trim()).filter(Boolean),
    ...[p.get('marke')?.trim()].filter((m): m is string => !!m),
  ])).sort()
  // `[read]` **`status=alle` schaltet den Filter ab, alles andere ist
  // ein Wert.** Toms Vorgabe ist „On Market" als Standard — die Route
  // setzt ihn deshalb, wenn nichts kommt, statt ungefiltert zu suchen.
  const rohStatus = p.get('status')
  const status = rohStatus === 'alle' ? null : (rohStatus?.trim() || 'On Market')
  const seiteRoh = Number(p.get('seite') ?? '0')
  const seite = Number.isFinite(seiteRoh) && seiteRoh > 0 ? Math.trunc(seiteRoh) : 0
  // G-453: die Kategorie filtert PRODUKTE (Toms Antwort vom 2026-09-14).
  // `[read]` **Nicht gegen die Liste der 19 geprueft** — die Datenbank
  // vergleicht gegen `ingredient_category`, ein unbekannter Wert
  // liefert schlicht keinen Treffer. Dasselbe Muster wie `p_groups`
  // in `food-search.ts`.
  const kategorie = p.get('kategorie')?.trim() || null
  // G-453: die Darreichungsform, MIT E-Code — die Spalte traegt ihn.
  const form = p.get('form')?.trim() || null

  // ══ G-455: der harte Allergiefilter ═══════════════════════════════
  //
  // **Tom:** *„Eine Nussallergie gilt ueberall."*
  //
  // `[read]` **Die Kennung kommt aus der SITZUNG, nie aus der
  // Anfrage** — dieselbe Regel wie bei `p_user_id` in
  // `food-search.ts`: **Allergien sind Gesundheitsdaten.** Wer sie
  // durchreichen liesse, koennte eine fremde Kennung schicken und aus
  // der Differenz der Trefferzahlen fremde Allergien ablesen.
  //
  // `[cmd]` **`an=0` schaltet ihn ab** — fuer die Gegenprobe und fuer
  // den Nutzer, der bewusst alles sehen will.
  const allergienAn = p.get('allergien') !== '0'
  let harteIds: string[] = []
  let allergieFehler: string | null = null
  if (allergienAn) {
    try {
      const c = createSessionClient()
      const { data: { user } } = await c.auth.getUser()
      if (user) {
        const t = await ladeAllergieTreffer(user.id)
        harteIds = ids(t.treffer)
        allergieFehler = t.fehler
      }
    } catch (e) {
      // `[read]` **Ein Fehler hier darf die Suche NICHT umwerfen** —
      // aber er darf auch nicht als „keine Allergien" durchgehen.
      // **Die Oberflaeche bekommt ihn und sagt es.**
      allergieFehler = e instanceof Error ? e.message : String(e)
    }
  }

  try {
    const liste = await sucheProdukte(
      frage, marken, status, seite, kategorie, form, harteIds)
    return NextResponse.json({
      ...liste, seite, seiteGroesse: SEITE,
      allergienAn, allergieFehler,
      // `[read]` **Wie viele Produkte der Filter ueberhaupt kennt** —
      // `[cmd]` **0 ist eine echte Auskunft:** die Trefferfunktion
      // braucht einen Alias oder einen exakt gleichen Zutatnamen, und
      // gemessen 2026-09-15 hat `lactose` keinen Alias.
      allergieProdukte: harteIds.length,
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e), code: 'READ_FAILED' },
      { status: 500 },
    )
  }
}
