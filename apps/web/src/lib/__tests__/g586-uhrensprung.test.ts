/**
 * G-586 — ein Uhrensprung wirft den Nutzer raus
 *
 * **Tom, 2026-10-02, 16:07:** *„Sitzung abgelaufen · user_goals: JWT
 * issued at future"* — zum dritten Mal.
 *
 * `[cmd]` **Die Einordnung stimmt** (G-553): Sitzungsfehler. **Die
 * Reaktion stimmte nicht:** rausschmeissen statt einmal erneuern.
 *
 * ══ DIE DREI GEMESSENEN ZAHLEN ══════════════════════════════════
 *
 * `[cmd]` **2026-10-02, gegen die laufende Instanz:**
 *
 *     PostgREST toleriert   30 s  (+30 -> 200, +31 -> 401)
 *     GoTrue prueft `iat`   gar nicht (+300 s -> 200)
 *     refresh_token         traegt kein `iat` -> 200 mit frischem iat
 *
 * `[read]` **Der Punkt sagte *„keine Toleranz — keine Sekunde"*** —
 * **gemessen sind es 30.** Damit verlangt Toms Fehler einen
 * Ruecksprung um MEHR als 30 s; die 0,75 s Versatz aus dem Punkt
 * reichen nicht.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// `[read]` **`uhrensprung.ts` haengt NICHT an `next/headers`** —
// deshalb direkt importierbar, auch aus einem Test. `[cmd]`
// **`session.ts` zieht `cookies()` mit** und laesst sich hier nicht
// laden; der erneuernde `fetch` kommt deshalb aus derselben Datei.
import {
  istUhrensprung, sprungbeleg, sprungZeile,
  fetchMitEinmaligerErneuerung,
} from '../../../../../packages/shared/src/supabase/uhrensprung'

const HIER = dirname(fileURLToPath(import.meta.url))
const WURZEL = join(HIER, '..', '..', '..', '..', '..')
const SESSION = join(WURZEL, 'packages', 'shared', 'src', 'supabase', 'session.ts')

const ohneKommentare = (q: string) => q
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

/** Ein Token mit frei gewaehltem `iat` — nur der Rumpf zaehlt hier. */
function token(iatSek: number, expSek = iatSek + 3600): string {
  const b64 = (o: unknown) =>
    Buffer.from(JSON.stringify(o)).toString('base64url')
  return `${b64({ alg: 'HS256' })}.${b64({ iat: iatSek, exp: expSek })}.sig`
}

// ════════════════════════════════════════════════════════════════
// A1 — der Beleg: drei Zeiten, keine Inhalte
// ════════════════════════════════════════════════════════════════

describe('G-586/A1 — der Beleg haelt die drei Zeiten fest', () => {
  it('die Wurzelmarke stimmt — sonst misst der Rest nichts', () => {
    assert.ok(existsSync(SESSION), 'session.ts nicht gefunden')
  })

  it('iat, exp und der Vorsprung stehen drin', () => {
    const jetzt = 1_790_000_000_000
    const b = sprungbeleg(token(1_790_000_060, 1_790_003_660), jetzt)
    assert.equal(b.iat, new Date(1_790_000_060_000).toISOString())
    assert.equal(b.exp, new Date(1_790_003_660_000).toISOString())
    // `[read]` **Positiv heisst: das Token kommt aus der Zukunft.**
    assert.equal(b.vorsprungSek, 60)
    assert.equal(b.gemessen, new Date(jetzt).toISOString())
  })

  it('die Toleranz steht als gemessene Zahl drin', () => {
    // `[cmd]` **30 s, gemessen** — nicht geraten, und nicht die
    // „keine Sekunde" aus dem Punkt.
    assert.equal(sprungbeleg(token(1), 1000).toleranzSek, 30)

    // `[read]` **Der TYP haelt die Zahl fest, nicht nur der Wert.**
    // `[cmd]` **Eine Sabotage auf `toleranzSek: 30 | 0` blieb
    // gruen** — zur Laufzeit stand weiter 30 da. **Eine gemessene
    // Zahl, die der Typ aufweicht, ist beim naechsten Mal eine
    // beliebige.**
    const q = ohneKommentare(readFileSync(
      join(WURZEL, 'packages', 'shared', 'src', 'supabase', 'uhrensprung.ts'),
      'utf8'))
    assert.match(q, /toleranzSek:\s*30\s*$/m,
      'der Typ von toleranzSek ist nicht mehr die gemessene 30')
  })

  it('ohne Token bleibt der Beleg leer, statt zu werfen', () => {
    for (const w of [null, undefined, '', 'kaputt', 'a.b']) {
      const b = sprungbeleg(w as string | null, 1000)
      assert.equal(b.iat, null, `${w}`)
      assert.equal(b.vorsprungSek, null)
    }
  })

  it('die Protokollzeile traegt KEIN Token und kein Geheimnis', () => {
    // `[cmd]` **Der Auftrag: Zeiten, keine Inhalte.**
    const jwt = token(1_790_000_060)
    const z = sprungZeile(sprungbeleg(jwt, 1_790_000_000_000))
    assert.ok(!z.includes(jwt), 'die Zeile enthaelt das Token')
    assert.ok(!z.includes('sig'), 'die Zeile enthaelt die Signatur')
    assert.match(z, /\[uhrensprung\]/, 'die Marke fehlt — nicht greppbar')
    assert.match(z, /iat=/, 'das iat fehlt')
    assert.match(z, /vorsprung=60s/, 'der Vorsprung fehlt')
    assert.match(z, /toleranz=30s/, 'die Toleranz fehlt')
  })

  it('der Beleg rechnet NICHT mit Date.now()', () => {
    // `[read]` **Die Uhr kommt von aussen** — sonst ist die Funktion
    // nicht pruefbar, und genau darum geht es hier.
    // `[read]` **Die Zusicherung gilt dem BELEG, nicht der Datei.**
    // `[cmd]` **Der `fetch`-Mantel in derselben Datei MUSS
    // `Date.now()` rufen** — er protokolliert den Augenblick des
    // Fehlers. `[read]` **Deshalb der Rumpf von `sprungbeleg`,
    // abgegrenzt, statt der ganzen Datei** (sonst misst der Waechter
    // die falsche Sache).
    const q = ohneKommentare(readFileSync(
      join(WURZEL, 'packages', 'shared', 'src', 'supabase', 'uhrensprung.ts'),
      'utf8'))
    const von = q.indexOf('export function sprungbeleg')
    assert.ok(von > 0, 'sprungbeleg nicht gefunden')
    const bis = q.indexOf('\nexport ', von + 10)
    const rumpf = q.slice(von, bis === -1 ? undefined : bis)
    assert.ok(!/Date\.now\(\)/.test(rumpf),
      'sprungbeleg liest die Uhr selbst — dann ist der Beleg nicht pruefbar')
    assert.match(rumpf, /jetzt: number/,
      'die Uhr kommt nicht von aussen')
  })
})

// ════════════════════════════════════════════════════════════════
// A2/A3 — einmal erneuern, und nur einmal
// ════════════════════════════════════════════════════════════════

/** Eine Antwort, wie PostgREST sie bei einem Uhrensprung schickt. */
const sprung = () => new Response(
  JSON.stringify({ message: 'JWT issued at future' }),
  { status: 401, headers: { 'content-type': 'application/json' } })
const gut = () => new Response('[]', { status: 200 })

describe('G-586/A2 — bei einem Uhrensprung wird einmal erneuert', () => {
  it('erkennt den Uhrensprung, und nur ihn', () => {
    assert.equal(istUhrensprung('JWT issued at future'), true)
    assert.equal(istUhrensprung('jwt issued at future'), true)
    // `[read]` **Abgelaufen ist KEIN Uhrensprung** — dort erneuert
    // die Middleware schon.
    assert.equal(istUhrensprung('JWT expired'), false)
    assert.equal(istUhrensprung('token is expired'), false)
    assert.equal(istUhrensprung(null), false)
  })

  it('wiederholt die Abfrage nach erfolgreicher Erneuerung', async () => {
    const antworten = [sprung(), gut()]
    const echt = globalThis.fetch
    let rufe = 0
    globalThis.fetch = (async () => { rufe++; return antworten.shift()! }) as typeof fetch
    try {
      let erneuert = 0
      const f = fetchMitEinmaligerErneuerung(
        async () => { erneuert++; return true }, () => {})
      const a = await f('http://x/rest/v1/user_goals')
      assert.equal(erneuert, 1, 'es wurde nicht erneuert')
      assert.equal(rufe, 2, 'die Abfrage wurde nicht wiederholt')
      assert.equal(a.status, 200, 'die zweite Antwort kam nicht durch')
    } finally { globalThis.fetch = echt }
  })

  it('die Wiederholung traegt das FRISCHE Token im Kopf', async () => {
    // ══ DER FEHLER, DEN DER ECHTLAUF AUFGEDECKT HAT ═════════════
    //
    // `[cmd]` **Gegen die laufende Instanz, 2026-10-02:** die
    // Erneuerung holte ein gueltiges Token, **die Wiederholung kam
    // trotzdem mit `401`** — sie schickte das alte `init` erneut.
    //
    // `[read]` **Im Betrieb faellt das nicht auf**, weil
    // `supabase-js` den Kopf je Aufruf neu baut. **Ein Mantel, der
    // nur unter dieser Annahme traegt, ist kein Mantel.**
    const echt = globalThis.fetch
    const gesehen: Array<string | null> = []
    let ruf = 0
    globalThis.fetch = (async (_e: unknown, i: RequestInit | undefined) => {
      gesehen.push(new Headers(i?.headers).get('Authorization'))
      return ++ruf === 1 ? sprung() : gut()
    }) as unknown as typeof fetch
    try {
      const f = fetchMitEinmaligerErneuerung(async () => 'FRISCH', () => {})
      await f('http://x', { headers: { Authorization: 'Bearer ALT' } })
      assert.deepEqual(gesehen, ['Bearer ALT', 'Bearer FRISCH'],
        'die Wiederholung laeuft mit dem alten Token — dann war die '
        + 'Erneuerung wirkungslos')
    } finally { globalThis.fetch = echt }
  })

  it('ein anderer 401 wird NICHT wiederholt', async () => {
    const echt = globalThis.fetch
    let rufe = 0
    globalThis.fetch = (async () => {
      rufe++
      return new Response(JSON.stringify({ message: 'JWT expired' }),
        { status: 401, headers: { 'content-type': 'application/json' } })
    }) as typeof fetch
    try {
      let erneuert = 0
      const f = fetchMitEinmaligerErneuerung(
        async () => { erneuert++; return true }, () => {})
      await f('http://x/rest/v1/user_goals')
      assert.equal(erneuert, 0, 'ein abgelaufenes Token loeste die Erneuerung aus')
      assert.equal(rufe, 1)
    } finally { globalThis.fetch = echt }
  })

  it('auch bei einem 401 bleibt der Rumpf lesbar', async () => {
    // ══ DIE EIGENTLICHE clone()-FALLE ═══════════════════════════
    //
    // `[read]` **Beim 200 kehrt der Mantel frueh zurueck** — dort
    // kann er den Rumpf gar nicht verbrauchen. **Die Gefahr steckt
    // im 401:** dort LIEST er ihn, um die Meldung zu sehen.
    // `[cmd]` **Ohne `clone()` kaeme beim Aufrufer ein leerer Strom
    // an** — und die Sabotage blieb gruen, weil nur der 200-Fall
    // geprueft war.
    const echt = globalThis.fetch
    globalThis.fetch = (async () => new Response(
      JSON.stringify({ message: 'JWT expired' }),
      { status: 401, headers: { 'content-type': 'application/json' } },
    )) as typeof fetch
    try {
      const f = fetchMitEinmaligerErneuerung(async () => 'X', () => {})
      const a = await f('http://x')
      const k = await a.json() as { message?: string }
      assert.equal(k.message, 'JWT expired',
        'der Rumpf ist verbraucht — der Aufrufer sieht keine Meldung mehr')
    } finally { globalThis.fetch = echt }
  })

  it('ein 500 laeuft NICHT in die Erneuerung', async () => {
    // `[read]` **401 ist die Grenze.** Ein Serverfehler ist keine
    // Sitzungsfrage, und ihn zu wiederholen verdoppelte nur die Last.
    const echt = globalThis.fetch
    let rufe = 0
    globalThis.fetch = (async () => {
      rufe++
      return new Response(JSON.stringify({ message: 'JWT issued at future' }),
        { status: 500, headers: { 'content-type': 'application/json' } })
    }) as typeof fetch
    try {
      let erneuert = 0
      const f = fetchMitEinmaligerErneuerung(
        async () => { erneuert++; return 'X' }, () => {})
      const a = await f('http://x')
      assert.equal(erneuert, 0, 'ein 500 loeste die Erneuerung aus')
      assert.equal(rufe, 1, 'ein 500 wurde wiederholt')
      assert.equal(a.status, 500)
    } finally { globalThis.fetch = echt }
  })

  it('ein 200 wird nicht angefasst — der Rumpf bleibt lesbar', async () => {
    const echt = globalThis.fetch
    globalThis.fetch = (async () => new Response('[{"id":1}]',
      { status: 200 })) as typeof fetch
    try {
      const f = fetchMitEinmaligerErneuerung(async () => true, () => {})
      const a = await f('http://x/rest/v1/user_goals')
      // `[read]` **Ohne `clone()` waere der Strom hier leer** — und
      // jede Abfrage im Produkt kaeme ohne Daten zurueck.
      assert.equal(await a.text(), '[{"id":1}]')
    } finally { globalThis.fetch = echt }
  })
})

describe('G-586/A3 — genau einmal, der zweite faellt durch', () => {
  it('der zweite Uhrensprung erneuert NICHT noch einmal', async () => {
    // `[read]` **Eine Erneuerungsschleife ist schlimmer als die
    // Fehlermeldung.** `[cmd]` **Der Merker haengt am Client** — hier
    // also an dieser einen `f`.
    const echt = globalThis.fetch
    let rufe = 0
    globalThis.fetch = (async () => { rufe++; return sprung() }) as typeof fetch
    try {
      let erneuert = 0
      const f = fetchMitEinmaligerErneuerung(
        async () => { erneuert++; return true }, () => {})
      const a = await f('http://x/1')
      const b = await f('http://x/2')
      assert.equal(erneuert, 1,
        `${erneuert}x erneuert — genau einmal ist die Grenze (A3)`)
      assert.equal(a.status, 401, 'die erste Antwort bleibt 401')
      assert.equal(b.status, 401,
        'der zweite Uhrensprung muss durchfallen — mit der '
        + 'Anmeldeaufforderung, wie bisher')
      // 1. Aufruf + 1 Wiederholung + 2. Aufruf = 3
      assert.equal(rufe, 3, 'die Zahl der Abfragen stimmt nicht')
    } finally { globalThis.fetch = echt }
  })

  it('scheitert die Erneuerung, faellt der Fehler durch', async () => {
    const echt = globalThis.fetch
    let rufe = 0
    globalThis.fetch = (async () => { rufe++; return sprung() }) as typeof fetch
    try {
      const f = fetchMitEinmaligerErneuerung(async () => false, () => {})
      const a = await f('http://x/1')
      assert.equal(a.status, 401)
      // `[read]` **Keine Wiederholung ohne frisches Token** — sonst
      // liefe dieselbe Abfrage mit demselben Token.
      assert.equal(rufe, 1, 'es wurde ohne Erneuerung wiederholt')
    } finally { globalThis.fetch = echt }
  })

  it('jeder neue Client bekommt seinen eigenen Versuch', async () => {
    // `[read]` **Der Merker darf nicht global sein** — sonst hat der
    // naechste Seitenaufruf seinen Versuch schon verbraucht.
    const echt = globalThis.fetch
    globalThis.fetch = (async () => sprung()) as typeof fetch
    try {
      let a = 0, b = 0
      await fetchMitEinmaligerErneuerung(async () => { a++; return true }, () => {})('http://x')
      await fetchMitEinmaligerErneuerung(async () => { b++; return true }, () => {})('http://x')
      assert.equal(a, 1, 'der erste Client hat nicht erneuert')
      assert.equal(b, 1, 'der zweite Client hat seinen Versuch verloren')
    } finally { globalThis.fetch = echt }
  })

  it('der Vorfall wird protokolliert, einmal je Versuch', async () => {
    const echt = globalThis.fetch
    globalThis.fetch = (async () => sprung()) as typeof fetch
    try {
      const zeilen: string[] = []
      const f = fetchMitEinmaligerErneuerung(
        async () => true, (z) => zeilen.push(z))
      await f('http://x/1')
      await f('http://x/2')
      assert.ok(zeilen.length >= 2, `nur ${zeilen.length} Zeilen protokolliert`)
      assert.ok(zeilen.every(z => z.includes('[uhrensprung]')),
        'eine Zeile traegt die Marke nicht')
      assert.ok(zeilen.some(z => z.includes('erneut gefallen')),
        'der zweite Fehlschlag steht nicht im Protokoll')
    } finally { globalThis.fetch = echt }
  })
})

// ════════════════════════════════════════════════════════════════
// Der Ort — warum nicht in der Middleware
// ════════════════════════════════════════════════════════════════

describe('G-586 — die Erneuerung haengt am Client, nicht an 256 Stellen', () => {
  it('session.ts verdrahtet den fetch', () => {
    const q = ohneKommentare(readFileSync(SESSION, 'utf8'))
    assert.match(q, /fetch: fetchMitEinmaligerErneuerung\(/,
      'der Client benutzt den erneuernden fetch nicht')
    assert.match(q, /refreshSession\(\)/,
      'die Erneuerung geht nicht ueber refreshSession')
  })

  it('die Middleware bleibt unberuehrt', () => {
    // `[cmd]` **GoTrue prueft `iat` nicht** (+300 s -> 200) — die
    // Middleware SIEHT den Fall nicht. `[read]` **Dort etwas
    // einzubauen waere eine Zusicherung ohne Wirkung.**
    const m = ohneKommentare(readFileSync(
      join(WURZEL, 'apps', 'web', 'src', 'middleware.ts'), 'utf8'))
    assert.ok(!/istUhrensprung|fetchMitEinmaliger/.test(m),
      'die Middleware prueft den Uhrensprung — sie kann ihn nicht sehen')
  })
})
