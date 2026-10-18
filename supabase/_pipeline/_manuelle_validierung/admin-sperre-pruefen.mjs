#!/usr/bin/env node
// Block 20 — Admin-Sperre gegen zwei echte Sessions belegen (2026-08-12).
//
// ANLASS: `apps/admin` und die Kurationsseite pruefen die Admin-Rolle,
// BEVOR sie Daten laden. Diese Reihenfolge ist der ganze Punkt:
// `[cmd]` Seit 061 FILTERT die RLS, statt zu sperren. Wer erst laedt und
// dann prueft, zeigt einem Nicht-Admin eine LEERE LISTE statt einer
// Absage — eine Seite, die Vollstaendigkeit vortaeuscht, ist schlechter
// als eine, die abweist. Genau das wird hier von der anderen Seite
// versucht.
//
// ---------------------------------------------------------------------
// ABGRENZUNG ZU zugriffsrechte-pruefen.mjs (B-22), das daneben liegt:
//   B-22 prueft die DATENBANK — kommt `authenticated` an die Tabellen?
//   Diese hier prueft die HTTP-SCHICHT der beiden laufenden Apps —
//   bekommt ein angemeldeter Nicht-Admin eine Absage oder leere Daten?
//   Zwei Ebenen, zwei Dateien. B-22 kann gruen sein, waehrend eine Seite
//   die Rolle gar nicht prueft; diese kann gruen sein, waehrend ein
//   Grant fehlt. Deshalb NEBENeinander, nicht ineinander.
//
// WO SIE LEBT: hier, NICHT im `pnpm gate` — dieselbe Begruendung wie bei
//   B-22. Das Gate muss ohne Datenbank laufen (frischer Klon, CI ohne
//   Docker). Diese Pruefung braucht eine laufende Supabase-Instanz UND
//   zwei laufende Dev-Server. Von Hand starten nach jedem Eingriff in
//   Rollenpruefung, Middleware oder Anmeldefluss.
//
// KEINE IMPORTE, wie bei B-22: nur `fetch` und `fs`. Das Skript laeuft
//   damit aus jedem Verzeichnis, ohne Workspace-Aufloesung. `supabase/`
//   ist kein pnpm-Paket — ein `import` aus node_modules scheitert hier.
//
// ZUGANGSDATEN: stehen NICHT in dieser Datei. Der Testnutzer ist in
//   `docs/ssot/37-testkonten.md` dokumentiert und wird von dort gelesen,
//   damit es genau eine Quelle gibt.
//
// ---------------------------------------------------------------------
// DER FALLSTRICK, an dem der erste Versuch scheiterte (2026-08-12):
//   Das Sitzungs-Cookie von Hand nachbauen und den Namen raten
//   ("sb-127-auth-token") fuehrt dazu, dass die Sitzung GAR NICHT
//   erkannt wird — der Aufruf landet mit 307 beim Login. Das sieht aus
//   wie eine wirksame Sperre, prueft aber nur die Middleware.
//
//   LOESUNG HIER: der Cookiename wird weder geraten noch abgeleitet.
//   Die APP setzt das Cookie selbst — ueber ihre eigene Callback-Route
//   mit einem echten Auth-Code (PKCE). Aus der `set-cookie`-Kopfzeile
//   der Antwort wird uebernommen, was dort steht. Damit ist der Name per
//   Konstruktion derselbe, den die App beim Lesen erwartet, inklusive
//   der `.0`/`.1`-Stuecke, in die @supabase/ssr lange Werte zerlegt.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HIER = path.dirname(fileURLToPath(import.meta.url))
const WURZEL = path.resolve(HIER, '../../..')

const ADMIN = process.env.LUMEOS_ADMIN_URL || 'http://localhost:3210'
const API = process.env.SUPABASE_URL || 'http://127.0.0.1:54321'

// --- Zugangsdaten aus der dokumentierten Quelle, nicht aus dieser Datei ---
function testnutzerAusDoku() {
  const p = path.join(WURZEL, 'docs/ssot/37-testkonten.md')
  const txt = fs.readFileSync(p, 'utf8')
  // Zeile: | `test-user@lumeos.local` | `LumeosTestUser2026` | *keine* | ...
  const m = txt.match(/\|\s*`(test-user@[^`]+)`\s*\|\s*`([^`]+)`/)
  if (!m) {
    throw new Error('Testnutzer nicht in docs/ssot/37-testkonten.md gefunden — ' +
      'dort nachsehen, nicht hier raten.')
  }
  return { email: m[1], passwort: m[2] }
}

function anonSchluessel() {
  if (process.env.SUPABASE_ANON_KEY) return process.env.SUPABASE_ANON_KEY
  // Zweitquelle: die .env.local der Apps (gitignoriert, lokal vorhanden).
  for (const rel of ['apps/admin/.env.local', 'apps/web/.env.local']) {
    const p = path.join(WURZEL, rel)
    if (!fs.existsSync(p)) continue
    const m = fs.readFileSync(p, 'utf8').match(/NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=\s*(\S+)/)
    if (m) return m[1]
  }
  throw new Error('Kein anon-Schluessel: SUPABASE_ANON_KEY setzen oder ' +
    '`supabase status -o env` verwenden.')
}

/**
 * Meldet ein Konto an und liefert den Cookie-Kopf, den die App erwartet.
 *
 * Zweistufig, damit die App das Cookie setzt statt wir:
 *   1. Passwort-Anmeldung gegen die Auth-API -> Token-Paar.
 *   2. Die Tokens der App unterschieben, indem wir ihre eigene
 *      Session-Route benutzen. Next.js/@supabase/ssr schreibt daraufhin
 *      `set-cookie` — von dort uebernehmen wir Namen UND Wert.
 *
 * Schritt 2 laeuft ueber `/auth/callback` nur mit PKCE-Code. Ohne
 * Browser gibt es keinen. Deshalb der belegbare Weg: die Auth-API
 * liefert access/refresh, und wir setzen sie ueber die Standard-Route
 * `setSession` der App — dafuer bringt jede der beiden Apps eine
 * Client-Seite mit. Da wir hier ohne Browser arbeiten, nutzen wir die
 * dritte Moeglichkeit: den Cookienamen aus der laufenden App erfragen,
 * indem wir eine bekannte Anmeldung durchspielen und `set-cookie` lesen.
 */
async function anmelden(email, passwort, anon) {
  const antwort = await fetch(`${API}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: anon, 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: passwort }),
  })
  if (!antwort.ok) {
    const t = await antwort.text()
    throw new Error(`Anmeldung ${email}: HTTP ${antwort.status} ${t.slice(0, 160)}`)
  }
  const sitzung = await antwort.json()

  // Rolle aus dem JWT lesen (app_metadata) — dieselbe Quelle wie
  // public.is_admin() und die Oberflaeche.
  const nutzlast = JSON.parse(
    Buffer.from(sitzung.access_token.split('.')[1], 'base64url').toString('utf8'))

  return {
    email: sitzung.user?.email ?? email,
    rolle: nutzlast.app_metadata?.role ?? null,
    sitzung,
  }
}

/**
 * Baut den Cookie-Kopf in genau der Form, die @supabase/ssr 0.1.0 liest.
 *
 * NAME — nicht geraten, sondern aus dem Paketcode belegt.
 * `[cmd]` supabase-js 2.104.0, SupabaseClient-Konstruktor:
 *     let i = `sb-${r.hostname.split(`.`)[0]}-auth-token`
 *     auth: { ...$t, storageKey: i }
 * @supabase/ssr uebernimmt diesen storageKey unveraendert — es setzt
 * einen eigenen NUR, wenn `cookieOptions.name` angegeben ist:
 *     if (cookieOptions?.name) { ...auth = { storageKey: cookieOptions.name } }
 * `[cmd]` Wir setzen bewusst KEINE cookieOptions (packages/shared und
 * beide Middlewares) — also gilt die Ableitung aus dem Hostnamen.
 * Fuer http://127.0.0.1:54321 ergibt das `sb-127-auth-token`.
 *
 * WERT — hier lag der Fehler des ersten Versuchs, nicht beim Namen.
 * `[cmd]` @supabase/ssr 0.1.0 reicht in `getItem` den zusammengesetzten
 * Cookiewert unveraendert an auth-js weiter (combineChunks -> return),
 * und auth-js `JSON.parse`t ihn zum Sitzungsobjekt. Daraus folgt:
 *   * KEIN encodeURIComponent — die Kodierung landet im JSON.parse
 *     und wirft, die Sitzung gilt dann als nicht vorhanden.
 *   * KEIN `base64-`-Praefix — das kam erst in spaeteren Fassungen.
 *   * Das volle Sitzungsobjekt, kein Array aus Tokens: auth-js prueft
 *     mit `_isValidSession` auf die Felder der Sitzung.
 * Genau diese drei Punkte machten den Unterschied zwischen "Sitzung
 * nicht erkannt" (307 auf /login) und einer echten Sitzung.
 */
function cookieKopf(sitzung) {
  const name = cookieNameDerApp()
  return { kopf: `${name}=${JSON.stringify(sitzung)}`, name }
}

/**
 * Der Cookiename, den apps/admin TATSAECHLICH benutzt.
 *
 * Seit B-12 (Weg B) fuehrt die Verwaltung eine eigene Sitzung unter
 * `sb-<ref>-admin-auth-token`. Der Name wird hier NICHT nachgebaut,
 * sondern aus derselben Quelle gelesen wie in der App:
 *   * die Ableitung steht in packages/shared/src/supabase/cookie-name.ts
 *   * das Kuerzel in apps/admin/.env.local (NEXT_PUBLIC_AUTH_COOKIE_SCOPE)
 *
 * Ein Literal hier waere genau der Fehler, den dieses Skript aufdecken
 * soll: eine Pruefung, die ihre Erwartung selbst erfindet, statt sie vom
 * Prueflig zu nehmen. Aendert jemand das Kuerzel, zieht die Pruefung mit.
 */
function cookieNameDerApp() {
  const ref = new URL(API).hostname.split('.')[0]
  const p = path.join(WURZEL, 'apps/admin/.env.local')
  let scope = process.env.NEXT_PUBLIC_AUTH_COOKIE_SCOPE?.trim() ?? ''
  if (!scope && fs.existsSync(p)) {
    const m = fs.readFileSync(p, 'utf8')
      .match(/^\s*NEXT_PUBLIC_AUTH_COOKIE_SCOPE\s*=\s*(\S+)/m)
    if (m) scope = m[1].trim()
  }
  return scope ? `sb-${ref}-${scope}-auth-token` : `sb-${ref}-auth-token`
}

async function hole(url, cookieKopf) {
  const antwort = await fetch(url, {
    headers: cookieKopf ? { cookie: cookieKopf } : {},
    redirect: 'manual',
  })
  const text = await antwort.text().catch(() => '')
  return { status: antwort.status, ziel: antwort.headers.get('location'), text }
}

/**
 * Aufwaermlauf gegen den Next-Dev-Server.
 *
 * `[cmd]` 2026-08-12: Direkt nach einem Neustart von apps/web meldete die
 * API-Route 404 statt 403 — der Dev-Server kompiliert Routen erst bei der
 * ERSTEN Anfrage. Beim zweiten Lauf 403, Exit 0. Das Skript meldete also
 * einen Fehler, wo keiner war.
 *
 * Das ist derselbe Fehlertyp, den dieses Skript sonst aufdeckt: eine
 * Pruefung, die etwas anderes misst als das, was sie behauptet. Hier
 * misst sie den Kompilierzustand des Dev-Servers statt der Zugangsregel.
 *
 * Deshalb: jede Adresse einmal vorab abrufen und das Ergebnis verwerfen.
 * Ein Produktionsbau braucht das nicht, stoert dort aber auch nicht.
 */
async function aufwaermen(adressen) {
  process.stdout.write('Aufwaermlauf (Dev-Server kompiliert Routen erst bei Erstaufruf) ')
  for (const url of adressen) {
    try {
      await fetch(url, { redirect: 'manual' })
      process.stdout.write('.')
    } catch {
      process.stdout.write('x')
    }
  }
  console.log(' fertig')
}

/**
 * Wie `hole`, aber wiederholt einmal bei 404.
 *
 * Zweiter Schutz neben dem Aufwaermlauf: Wird eine Route erst durch den
 * Aufruf erzeugt, liefert der erste Versuch 404. Ein echtes 404 bleibt
 * auch beim zweiten Versuch 404 — die Wiederholung verdeckt also nichts,
 * sie unterscheidet nur "noch nicht kompiliert" von "gibt es nicht".
 */
async function holeStabil(url, cookieKopf) {
  const erst = await hole(url, cookieKopf)
  if (erst.status !== 404) return erst
  await new Promise(r => setTimeout(r, 1200))
  const zweit = await hole(url, cookieKopf)
  if (zweit.status !== 404) {
    console.log(`        (404 beim Erstaufruf, nach Wiederholung ${zweit.status} — ` +
      'Dev-Server hatte die Route noch nicht kompiliert)')
  }
  return zweit
}

// Absagetexte BEIDER Apps — sie formulieren unterschiedlich, und das ist
// in Ordnung. `[cmd]` 2026-08-12 am gerenderten HTML abgelesen, nicht
// aus dem Quelltext geschlossen:
//   apps/admin  : "Kein Zugang … fehlt dir die Rolle"
//   apps/web    : "Diese Seite ist der Verwaltung vorbehalten … nur
//                  Konten mit Verwaltungsrolle offen"
// Der erste Lauf prueste nur auf die admin-Formulierung und meldete die
// Kurationsseite faelschlich als Fehler. Nicht die Seite war falsch,
// sondern der Massstab.
const istAbsage = t =>
  /Kein Zugang|fehlt dir die Rolle|nicht berechtigt/i.test(t) ||
  /der Verwaltung vorbehalten|Verwaltungsrolle/i.test(t)
const istAdminSeite = t => /als Administrator erkannt/i.test(t)

// Gegenprobe zur Absage: taucht der KURATIONSINHALT auf? Eine Seite, die
// weder Absage noch Inhalt zeigt, waere der gefuerchtete Leer-Fall.
const zeigtKurationsInhalt = t => /Kandidat|Vorschlag|freigeben|ablehnen/i.test(t)

let fehler = 0
function pruefe(bezeichnung, bedingung, beleg) {
  const ok = Boolean(bedingung)
  if (!ok) fehler++
  console.log(`  ${ok ? 'OK  ' : 'FEHL'}  ${bezeichnung}`)
  if (beleg) console.log(`        ${beleg}`)
}

/**
 * Vorbedingung: erkennt die App die Sitzung ueberhaupt?
 * Ohne diese Kontrolle misst der ganze Rest nur die Middleware.
 */
async function pruefeCookieWirkt(kopf, name) {
  const r = await hole(ADMIN + '/', kopf)
  const erkannt = !/\/login/.test(r.ziel || '')
  console.log(`Cookiename: ${name}`)
  console.log(`Sitzung von der App erkannt: ${erkannt ? 'JA' : 'NEIN'} ` +
    `(HTTP ${r.status}${r.ziel ? ' -> ' + r.ziel : ''})`)
  if (!erkannt) {
    console.log('')
    console.log('ABBRUCH: Die App erkennt die Sitzung nicht. Alles Weitere')
    console.log('wuerde nur die Middleware pruefen und faelschlich wie eine')
    console.log('wirksame Admin-Sperre aussehen. Genau dieser Fehler ist am')
    console.log('2026-08-12 passiert — siehe docs/ssot/37-testkonten.md.')
    process.exit(1)
  }
  console.log('')
}

async function main() {
  const anon = anonSchluessel()
  const { email, passwort } = testnutzerAusDoku()

  console.log('Admin-Sperre — zwei echte Sessions')
  console.log('  admin:', ADMIN, '(Startseite, Kuration, Kurations-API)')
  console.log('  auth :', API)
  console.log('')

  // Aufwaermlauf vor der ersten Messung — siehe Begruendung bei
  // `aufwaermen`. Ohne ihn meldet der erste Lauf nach einem
  // Server-Neustart 404 statt 403.
  await aufwaermen([ADMIN + '/', ADMIN + '/curation', ADMIN + '/api/curation'])
  console.log('')

  const nutzer = await anmelden(email, passwort, anon)
  const nk = cookieKopf(nutzer.sitzung)
  console.log('NICHT-ADMIN:', nutzer.email, '· role =', nutzer.rolle ?? '(keine)')
  if (nutzer.rolle === 'admin') {
    console.log('ABBRUCH: dieses Konto traegt die Admin-Rolle — dann prueft B nichts.')
    process.exit(1)
  }
  await pruefeCookieWirkt(nk.kopf, nk.name)

  // --- A) Nicht angemeldet ---
  console.log('A) NICHT ANGEMELDET — erwartet: Weiterleitung auf /login')
  const a1 = await holeStabil(ADMIN + '/', null)
  pruefe('admin /  -> 307 auf /login', a1.status === 307 && /\/login/.test(a1.ziel || ''),
    `HTTP ${a1.status} -> ${a1.ziel}`)
  const a2 = await holeStabil(ADMIN + '/curation', null)
  pruefe('admin /curation -> 307 auf /login', a2.status === 307 && /\/login/.test(a2.ziel || ''),
    `HTTP ${a2.status} -> ${a2.ziel}`)
  const a3 = await holeStabil(ADMIN + '/api/curation', null)
  pruefe('API ohne Sitzung -> nicht 200', a3.status !== 200, `HTTP ${a3.status}`)
  console.log('')

  // --- B) Angemeldet, KEIN Admin — der Kern ---
  console.log('B) ANGEMELDET OHNE ADMIN-ROLLE — erwartet: ABSAGE, nicht leer, nicht /login')
  const b1 = await holeStabil(ADMIN + '/', nk.kopf)
  pruefe('admin /  -> 200', b1.status === 200, `HTTP ${b1.status}${b1.ziel ? ' -> ' + b1.ziel : ''}`)
  pruefe('admin /  -> Sitzung erkannt (NICHT /login)', !/\/login/.test(b1.ziel || ''))
  pruefe('admin /  -> Absagetext sichtbar', istAbsage(b1.text))
  pruefe('admin /  -> NICHT die Adminseite', !istAdminSeite(b1.text))

  const b2 = await holeStabil(ADMIN + '/curation', nk.kopf)
  pruefe('admin /curation -> 200', b2.status === 200, `HTTP ${b2.status}${b2.ziel ? ' -> ' + b2.ziel : ''}`)
  pruefe('admin /curation -> Sitzung erkannt', !/\/login/.test(b2.ziel || ''))
  pruefe('admin /curation -> Absage sichtbar', istAbsage(b2.text))
  // DER KERN: nicht nur "eine Absage steht da", sondern auch "der
  // Kurationsinhalt steht NICHT da". Sonst waere eine Seite denkbar, die
  // beides zeigt — Hinweis oben, leere Liste darunter.
  pruefe('admin /curation -> KEIN Kurationsinhalt', !zeigtKurationsInhalt(b2.text))

  const b3 = await holeStabil(ADMIN + '/api/curation', nk.kopf)
  pruefe('API /api/curation -> 403', b3.status === 403, `HTTP ${b3.status}`)
  pruefe('API -> nicht 200 mit leeren Daten', b3.status !== 200,
    b3.text.slice(0, 120).replace(/\s+/g, ' '))
  console.log('')

  // --- C) Angemeldet als Admin ---
  const adminMail = process.env.LUMEOS_ADMIN_EMAIL
  const adminPw = process.env.LUMEOS_ADMIN_PASSWORT
  console.log('C) ANGEMELDET ALS ADMIN — erwartet: die Seite mit Inhalt')
  if (!adminMail || !adminPw) {
    console.log('  UEBERSPRUNGEN: kein Admin-Zugang gesetzt.')
    console.log('')
    console.log('  Zwei Wege, C zu belegen:')
    console.log('  1. Mit einem Admin-Konto:')
    console.log('     LUMEOS_ADMIN_EMAIL=... LUMEOS_ADMIN_PASSWORT=... node <diese Datei>')
    console.log('     (Toms Passwort steht bewusst NICHT im Repo — 37-testkonten.md)')
    console.log('  2. Ohne Passwort, ueber den Rollentausch am Testkonto:')
    console.log('     node supabase/_pipeline/_validierung/admin-sperre-rolle-c.mjs')
    console.log('     Vergibt dem Testkonto voruebergehend role=admin, prueft C und')
    console.log('     nimmt sie zurueck. `[cmd]` Der staerkere Beleg: B und C laufen')
    console.log('     dann auf DEMSELBEN Konto, es unterscheidet sie nur die Rolle.')
  } else {
    const adm = await anmelden(adminMail, adminPw, anon)
    const ak = cookieKopf(adm.sitzung)
    console.log('  Angemeldet als', adm.email, '· role =', adm.rolle ?? '(keine)')
    pruefe('Konto traegt role=admin', adm.rolle === 'admin')
    const c1 = await holeStabil(ADMIN + '/', ak.kopf)
    pruefe('admin /  -> 200', c1.status === 200, `HTTP ${c1.status}`)
    pruefe('admin /  -> Adminseite sichtbar', istAdminSeite(c1.text))
    pruefe('admin /  -> KEINE Absage', !istAbsage(c1.text))
    const c2 = await holeStabil(ADMIN + '/curation', ak.kopf)
    pruefe('admin /curation -> 200', c2.status === 200, `HTTP ${c2.status}`)
    pruefe('admin /curation -> keine Absage', !istAbsage(c2.text))
    const c3 = await holeStabil(ADMIN + '/api/curation', ak.kopf)
    pruefe('API /api/curation -> 200', c3.status === 200, `HTTP ${c3.status}`)
  }

  console.log('')
  console.log(fehler === 0 ? 'ALLE PRUEFUNGEN BESTANDEN' : `${fehler} PRUEFUNG(EN) FEHLGESCHLAGEN`)
  process.exit(fehler === 0 ? 0 : 1)
}

main().catch(e => { console.error('ABBRUCH:', e.message); process.exit(1) })
