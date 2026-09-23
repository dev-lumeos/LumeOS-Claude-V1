// Das Etikettenbild eines Produkts — G-496.
//
// ══ WARUM ES DIESE ROUTE GIBT ═══════════════════════════════════════
//
// **Tom, 2026-09-08:** *„versuch mal die produktid auf diese url mit
// dieser logik zu binden"* — und dann, aus dem API-Guide des
// `nih-dsld-client`:
//
//     Bild   api.ods.od.nih.gov/dsld/s3/pdf/thumbnails/<id>.jpg
//     PDF    api.ods.od.nih.gov/dsld/s3/pdf/<id>.pdf
//
// `[read]` **Die Adresse geht aus der ID, NICHT aus dem blanken
// Dateinamen** — **darum fielen die sieben Versuche aus G-495.**
//
// ══ GEMESSEN, BEVOR HIER ETWAS ENTSTAND ═════════════════════════════
//
// `[cmd]` **`tools/_g496-messen.mjs`, 2026-09-23, zwanzig echte Ids:**
//
//                  trifft   Median      Median-Dauer
//     JPEG          20/20    21 KB          291 ms
//     PDF           20/20   274 KB          320 ms
//
// `[cmd]` **Das Bild ist DREIZEHNMAL kleiner** — und braucht keinen
// Betrachter, kein Rendern, kein fremdes Paket.
//
// `[cmd]` **Beide Wege aus dem Auftrag fallen damit weg:** weder ein
// `<iframe>` (die NIH schickt `X-Frame-Options: DENY`, gemessen) noch
// eine serverseitige Wandlung (weder `pdf*`/`sharp`/`canvas` im
// Projekt noch `pdftoppm`/`magick`/`gs`/`mutool` auf dem Rechner).
//
// ══ WARUM DIE API-ANGABE NICHT ZAEHLT ═══════════════════════════════
//
// `[cmd]` **`GET /v9/label/<id>` nennt bei 11 von 20 einen
// `thumbnail`-Dateinamen** — **das Bild gibt es aber bei 20 von 20.**
// `[read]` **Das Feld untertreibt.** `[cmd]` **Deshalb wird es NICHT
// gefragt**: die Adresse steht aus der `dsld_id` fest, und ein
// zusaetzlicher Abruf kostete 288 ms fuer eine Auskunft, die falsch
// waere.
//
// ══ DIE GRENZE DER QUELLE — A13 ═════════════════════════════════════
//
// `[cmd]` **Aus demselben Guide:** *„No API key needed for up to
// 1.000 requests/hour per IP"*, **darueber `429` mit `Retry-After`.**
//
// `[read]` **Fuer eine Tafel ist das viel** — ein Nutzer oeffnet in
// einer Stunde keine 1.000 Produkte. `[read]` **Fuer einen
// Stapellauf ist es wenig**, und deshalb steht `A8` im Bericht:
// **ein Zwischenspeicher waere noetig, sobald mehr als die Tafel das
// Bild nutzt.** `[cmd]` **Ein Speicher in der DATENBANK waere Codex**
// — gemeldet, nicht gebaut.
//
// `[cmd]` **`429` wird deshalb eigens behandelt** und nicht mit
// „kein Etikett" verwechselt.
//
// ══ DIE QUELLE — A14 ════════════════════════════════════════════════
//
// `[cmd]` **Die Daten sind gemeinfrei (CC0 1.0)**, die Quelle ist zu
// nennen: **National Institutes of Health, Office of Dietary
// Supplements.** `[read]` **Sie steht AM BILD**, nicht nur hier —
// siehe `EtikettReiter` in `produkt-tafel.tsx`.
import { NextRequest, NextResponse } from 'next/server'

import { createSessionClient } from '@lumeos/shared/session'

/** Das Etikettenbild, aus der DSLD-Kennung. */
const BILD_BASIS = 'https://api.ods.od.nih.gov/dsld/s3/pdf/thumbnails/'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * `[cmd]` **Gemessen: Median 291 ms, langsamster Abruf 1.543 ms.**
 * `[read]` **15 s ist reichlich** — und der Reiter zeigt bei einer
 * Zeitueberschreitung das Rueckfallfeld, keinen Fehler (A6).
 */
const FRIST_MS = 15_000

export async function GET(request: NextRequest) {
  const roh = request.nextUrl.searchParams.get('dsld_id') ?? ''

  // ══ DIE KENNUNG WIRD GEPRUEFT, NICHT DURCHGEREICHT ════════════════
  //
  // `[read]` **Die Adresse wird aus Nutzereingabe gebaut** — ohne
  // Pruefung koennte jemand `../` oder eine fremde Adresse
  // unterschieben und diesen Server als Bote benutzen.
  //
  // `[cmd]` **`dsld_id` ist `bigint` in der Datenbank** — also
  // ausschliesslich Ziffern.
  if (!/^\d{1,12}$/.test(roh)) {
    return NextResponse.json(
      { error: 'dsld_id muss eine Zahl sein.', code: 'VALIDATION_FAILED' },
      { status: 400 })
  }

  // `[read]` **Angemeldet, wie jede andere Route hier** — der Abruf
  // kostet fremde Bandbreite gegen ein Stundenkontingent, und ein
  // offener Bote waere ein Angebot an jeden.
  const { data: { user } } = await createSessionClient().auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Keine Sitzung.', code: 'NO_SESSION' }, { status: 401 })
  }

  try {
    const antwort = await fetch(`${BILD_BASIS}${roh}.jpg`, {
      signal: AbortSignal.timeout(FRIST_MS),
    })

    // `[cmd]` **A13: die Grenze hat einen eigenen Zweig** — wer sie
    // reisst, soll das erfahren und nicht „kein Etikett" lesen.
    if (antwort.status === 429) {
      return NextResponse.json({
        error: 'Das Stundenkontingent der NIH ist erschöpft '
          + '(1.000 Abrufe je Stunde und IP).',
        code: 'RATE_LIMIT',
        retryAfter: antwort.headers.get('retry-after'),
      }, { status: 429 })
    }
    if (!antwort.ok) {
      return NextResponse.json(
        { error: `Die NIH antwortet mit ${antwort.status}.`, code: 'NOT_FOUND' },
        { status: 404 })
    }

    const bytes = await antwort.arrayBuffer()

    // ══ IST ES WIRKLICH EIN BILD? ════════════════════════════════════
    //
    // `[cmd]` **Die Falle aus G-495: die Schnittstelle antwortet auf
    // unbekannte Pfade mit 200 und ihrer eigenen Dokuseite**
    // (`text/html`), **und S3 mit 403 und XML.** `[read]` **Ein
    // Statuscode allein belegt nichts** — die ersten drei Bytes schon.
    const k = new Uint8Array(bytes.slice(0, 3))
    if (!(k[0] === 0xFF && k[1] === 0xD8 && k[2] === 0xFF)) {
      return NextResponse.json(
        { error: 'Die Antwort ist kein JPEG.', code: 'NOT_FOUND' },
        { status: 404 })
    }

    return new NextResponse(bytes, {
      headers: {
        'content-type': 'image/jpeg',
        // `[read]` **Eine Stunde im Browser** — dasselbe Etikett
        // zweimal zu holen kostet 291 ms und zaehlt gegen die 1.000.
        // `[cmd]` **Das ist KEIN Speicher in der Datenbank** (der
        // waere Codex), sondern der Zwischenspeicher, den jeder
        // Browser ohnehin hat.
        'cache-control': 'private, max-age=3600',
      },
    })
  } catch {
    // `[read]` **Stumm mit 404, nicht mit 500** — fuer die Oberflaeche
    // ist „kein Etikett" dasselbe, ob die NIH schweigt oder keines
    // hat. **Der Reiter zeigt beides gleich** (A6).
    return NextResponse.json(
      { error: 'Die NIH war nicht erreichbar.', code: 'NOT_FOUND' },
      { status: 404 })
  }
}
