// Der Uhrensprung — G-586. **Keine Abhaengigkeit zu `next/headers`.**
//
// ══ DER BEFUND, GEMESSEN AM 2026-10-02 ════════════════════════════
//
// **Tom, 16:07, `localhost:3200`:**
//
//     Sitzung abgelaufen
//     user_goals: JWT issued at future
//
// `[cmd]` **Die Einordnung ist richtig** (G-553): das ist ein
// Sitzungsfehler. **Die Reaktion war falsch** — rausschmeissen statt
// einmal erneuern.
//
// ── Was NICHT stimmt, obwohl es im Punkt steht ────────────────────
//
// `[cmd]` **„PostgREST hat dafuer keine Toleranz — keine Sekunde."**
// **Gemessen: PostgREST toleriert genau 30 Sekunden.** Ein selbst
// gepraegtes Token mit vorgezogenem `iat` gegen
// `/rest/v1/user_goals`:
//
//     iat +30 s -> 200 ok
//     iat +31 s -> 401 JWT issued at future
//
// `[read]` **Damit ist die Ursache eingegrenzt:** Toms Fehler
// verlangt einen Ruecksprung der Uhr um **mehr als 30 Sekunden** —
// die 0,75 s Versatz aus dem Punkt reichen dafuer nicht.
//
// `[cmd]` **Und zwischen den Diensten driftet nichts.** Postgres,
// Auth und Kong teilen EINEN Kernel-Timer (Docker-VM): die
// Kreuzmessung `auth -> pg` (1790-2070 ms) liegt INNERHALB der
// Kontrollmessung `pg -> pg` (2037-2327 ms). **Was driftet, ist die
// VM gegen den Host** — und das trifft ein Token, das vor dem Sprung
// gepraegt wurde.
//
// ── Warum die Erneuerung ueberhaupt gehen kann ────────────────────
//
// `[cmd]` **GoTrue prueft `iat` NICHT:** `/auth/v1/user` antwortet
// auch bei `iat + 300 s` mit `200`. **Nur PostgREST faellt.**
// `[read]` **Deshalb sieht die Middleware den Fall nicht** — ihr
// `getUser()` ist zufrieden, und der Fehler entsteht erst an der
// Abfrage.
//
// `[cmd]` **Der Erneuerungsweg traegt kein `iat`:**
// `grant_type=refresh_token` ist ein eigener Wert, kein JWT — er
// faellt an keiner Uhr. **Gemessen: 200, mit frischem `iat`.**
// **Genau deshalb hilft einmal erneuern.**

/** Woran ein Uhrensprung erkennbar ist. */
const SPRUNGMERKMAL = 'jwt issued at future'

/**
 * Ist das der Uhrensprung — und nicht irgendein Sitzungsfehler?
 *
 * `[read]` **Eng gefasst mit Absicht.** Ein abgelaufenes Token
 * (`PGRST301`, `token is expired`) ist KEIN Uhrensprung: dort hilft
 * die Erneuerung zwar auch, aber sie laeuft bereits ueber die
 * Middleware. **Hier geht es um den einen Fall, den sie nicht
 * sieht.**
 */
export function istUhrensprung(meldung: string | null | undefined): boolean {
  if (!meldung) return false
  return meldung.toLowerCase().includes(SPRUNGMERKMAL)
}

/**
 * Was ein Uhrensprung-Vorfall festhaelt — A1.
 *
 * `[read]` **Zeiten, keine Inhalte.** `[cmd]` **Kein Token, kein
 * Geheimnis, keine Nutzerkennung** — der Auftrag verlangt das
 * ausdruecklich, und ein Protokoll mit Token waere ein zweiter
 * Schaden.
 */
export type Sprungbeleg = {
  /** Wann der Fehler auftrat, nach der Uhr des Servers (ISO). */
  gemessen: string
  /** Das `iat` des Tokens als ISO-Zeit, oder `null`. */
  iat: string | null
  /** Das `exp` des Tokens als ISO-Zeit, oder `null`. */
  exp: string | null
  /** `iat` minus Serveruhr, in Sekunden. Positiv = Token aus der Zukunft. */
  vorsprungSek: number | null
  /**
   * Die Toleranz, an der es gescheitert ist.
   *
   * `[cmd]` **30 s, gemessen 2026-10-02** — nachzuzaehlen, indem man
   * ein Token mit `iat + 30` und `iat + 31` gegen `/rest/v1/` haelt.
   */
  toleranzSek: 30
  /** Wurde einmal erneuert, und hat es getragen? */
  erneuert: 'ja' | 'nein' | 'erneut gefallen'
}

/**
 * Die drei Zeiten aus A1, aus einem Token gelesen.
 *
 * `[read]` **Ohne Fremdabhaengigkeit** — der Rumpf eines JWT ist
 * base64url-kodiertes JSON, und mehr braucht es nicht. **Die
 * Signatur wird NICHT geprueft**: das hier ist ein Protokoll, keine
 * Pruefstelle.
 *
 * @param jwt   Das Zugangstoken, oder `null`.
 * @param jetzt Die Serveruhr in Millisekunden — von aussen, damit
 *              die Funktion pruefbar bleibt (kein `Date.now()`).
 */
export function sprungbeleg(
  jwt: string | null | undefined,
  jetzt: number,
  erneuert: Sprungbeleg['erneuert'] = 'nein',
): Sprungbeleg {
  const leer: Sprungbeleg = {
    gemessen: new Date(jetzt).toISOString(),
    iat: null, exp: null, vorsprungSek: null, toleranzSek: 30, erneuert,
  }
  if (!jwt) return leer
  const teile = jwt.split('.')
  if (teile.length !== 3) return leer
  try {
    const rumpf = JSON.parse(
      Buffer.from(teile[1], 'base64').toString('utf8')) as
      { iat?: number; exp?: number }
    const iat = typeof rumpf.iat === 'number' ? rumpf.iat : null
    const exp = typeof rumpf.exp === 'number' ? rumpf.exp : null
    return {
      ...leer,
      iat: iat === null ? null : new Date(iat * 1000).toISOString(),
      exp: exp === null ? null : new Date(exp * 1000).toISOString(),
      // `[read]` **Positiv heisst: das Token kommt aus der Zukunft.**
      vorsprungSek: iat === null ? null
        : Math.round((iat * 1000 - jetzt) / 100) / 10,
    }
  } catch {
    return leer
  }
}

/**
 * Der Satz fuers Protokoll — A1.
 *
 * `[cmd]` **Eine Zeile, ohne Debugger lesbar**, mit fester Marke
 * `[uhrensprung]`, damit sie sich aus einem Serverlog greppen laesst.
 */
export function sprungZeile(b: Sprungbeleg): string {
  return `[uhrensprung] gemessen=${b.gemessen} iat=${b.iat ?? '-'} `
    + `exp=${b.exp ?? '-'} vorsprung=${b.vorsprungSek ?? '-'}s `
    + `toleranz=${b.toleranzSek}s erneuert=${b.erneuert}`
}

// ══ G-586: einmal erneuern statt rausschmeissen ═══════════════════
//
// `[cmd]` **Tom sieht `JWT issued at future` zum dritten Mal.** Die
// Einordnung stimmt (G-553), die Reaktion nicht.
//
// `[cmd]` **Gemessen 2026-10-02 — drei Zahlen, die den Weg
// bestimmen:**
//
//     PostgREST toleriert  30 s (+30 ok, +31 faellt)
//     GoTrue prueft `iat`  gar nicht (+300 s -> 200)
//     refresh_token        traegt kein `iat`, faellt an keiner Uhr
//
// `[read]` **Daraus folgt der Ort.** Die Middleware sieht den Fall
// NICHT — ihr `getUser()` ist zufrieden. **Der Fehler entsteht erst
// an der Abfrage**, also muss die Erneuerung dort haengen.
//
// `[read]` **Und sie haengt am `fetch`, nicht an 256 Aufrufstellen.**
// Ein Wiederholen je Leseweg waere 256-mal dieselbe Entscheidung.
//
// ── Die Grenze: genau EINMAL ──────────────────────────────────────
//
// `[read]` **Eine Erneuerungsschleife ist schlimmer als die
// Fehlermeldung** (A3). **Der Merker haengt am CLIENT**, nicht am
// Modul: ein zweiter Uhrensprung in derselben Anfrage faellt durch
// zur Anmeldeaufforderung.

/**
 * Ein `fetch`, der bei einem Uhrensprung EINMAL erneuert.
 *
 * `[read]` **Nur bei `JWT issued at future`** — ein abgelaufenes
 * Token erneuert die Middleware bereits, und jeder andere Fehler
 * geht unveraendert durch.
 *
 * @param erneuern Holt ein frisches Token und gibt es zurueck —
 *                 `null` oder `false`, wenn das nicht geht.
 *                 `[read]` **Das TOKEN, nicht nur `true`:** die
 *                 Wiederholung muss es in den `Authorization`-Kopf
 *                 setzen, sonst laeuft sie mit dem alten (gemessen
 *                 2026-10-02: erneuert `ja`, Abfrage trotzdem 401).
 */
export function fetchMitEinmaligerErneuerung(
  erneuern: () => Promise<string | boolean | null>,
  protokoll: (zeile: string) => void = (z) => console.warn(z),
): typeof fetch {
  // `[read]` **Je Client EIN Versuch.** Der Merker lebt so lange wie
  // der Client — also die eine Anfrage.
  let schonErneuert = false

  return async (eingabe, start) => {
    const antwort = await fetch(eingabe as RequestInfo, start)
    // `[read]` **Nur 401 wird angefasst** — alles andere ist nicht
    // unsere Sache, und der Rumpf bleibt unberuehrt.
    if (antwort.status !== 401) return antwort

    // `[read]` **Den Rumpf KOPIEREN** — wer ihn liest, verbraucht
    // ihn. Ohne `clone()` kaeme beim Aufrufer ein leerer Strom an.
    let meldung: string | null = null
    try {
      const k = await antwort.clone().json() as { message?: string }
      meldung = typeof k?.message === 'string' ? k.message : null
    } catch { /* kein JSON — dann ist es auch kein Uhrensprung */ }

    if (!istUhrensprung(meldung)) return antwort

    const jwt = kopfToken(start)
    if (schonErneuert) {
      // `[cmd]` **A3: der zweite faellt durch.** `[read]` **Mit der
      // Anmeldeaufforderung, wie bisher** — die Einordnung bleibt
      // ein Sitzungsfehler.
      protokoll(sprungZeile(sprungbeleg(jwt, Date.now(), 'erneut gefallen')))
      return antwort
    }
    schonErneuert = true
    protokoll(sprungZeile(sprungbeleg(jwt, Date.now(), 'nein')))

    const frisch = await erneuern()
    if (!frisch) return antwort

    // ══ DAS FRISCHE TOKEN MUSS IN DEN KOPF ════════════════════════
    //
    // `[cmd]` **Gegen die laufende Instanz gemessen, 2026-10-02:**
    // die Erneuerung holte ein gueltiges Token (`200`, wenn man es
    // von Hand einsetzt) — **die Wiederholung kam trotzdem mit
    // `401`**, weil sie das ALTE `init` erneut schickte.
    //
    // `[read]` **Im Betrieb faellt das nicht auf**, weil
    // `supabase-js` den Kopf je Aufruf neu baut. **In einem Aufrufer,
    // der `headers` fest mitgibt, schon** — und ein Mantel, der nur
    // unter einer Annahme traegt, ist kein Mantel.
    const kopfNeu = new Headers(
      (start?.headers ?? (eingabe instanceof Request
        ? eingabe.headers : undefined)) as HeadersInit | undefined)
    if (typeof frisch === 'string') kopfNeu.set('Authorization', `Bearer ${frisch}`)

    const zweite = await fetch(eingabe as RequestInfo,
      { ...start, headers: kopfNeu })
    protokoll(sprungZeile(sprungbeleg(
      typeof frisch === 'string' ? frisch : kopfToken(start),
      Date.now(), zweite.ok ? 'ja' : 'erneut gefallen')))
    return zweite
  }
}

/** Das Zugangstoken aus dem `Authorization`-Kopf, oder `null`. */
function kopfToken(start: RequestInit | undefined): string | null {
  const kopf = start?.headers
  if (!kopf) return null
  const wert = kopf instanceof Headers
    ? kopf.get('Authorization')
    : Array.isArray(kopf)
      ? kopf.find(([k]) => k.toLowerCase() === 'authorization')?.[1]
      : (kopf as Record<string, string>).Authorization
        ?? (kopf as Record<string, string>).authorization
  return typeof wert === 'string' && wert.startsWith('Bearer ')
    ? wert.slice(7) : null
}
