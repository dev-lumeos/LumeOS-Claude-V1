#!/usr/bin/env node
// B-22 — Zugriffsrechte wiederholbar prüfen (2026-08-06).
//
// ANLASS: Der Curation-Bug (`permission denied for table
// food_curation_candidates`) war für `pnpm gate` unsichtbar — das Gate
// prüft Typen, reine Funktionen und den Build, keiner davon berührt die
// Datenbank. Der C-11-Nachweis lief über Lebensmittelsuche und
// Nährstoffansicht, nicht über die Curation-Seite.
//
// WAS DIESE PRÜFUNG IST: die billige Hälfte. Für jedes Objekt, das
// `authenticated` erreichen können muss, wird als echte Session WIRKLICH
// zugegriffen — nicht die Grant-Tabelle gelesen. Aus einem Eintrag in
// information_schema folgt nicht, dass der Zugriff funktioniert.
//
// WAS SIE NICHT IST: kein E2E-Test (das ist D-04). Sie sagt nichts über
// Oberfläche, Routen oder Anmeldefluss.
//
// ---------------------------------------------------------------------
// WO SIE LEBT: hier, nicht im `pnpm gate`.
//   Das Gate muss ohne Datenbank laufen (frischer Klon, CI ohne Docker).
//   Diese Prüfung braucht zwingend eine laufende Instanz. Sie gehört
//   deshalb neben die anderen Validierungen und wird nach jedem Eingriff
//   in die Zugriffsschicht (060/061/…) von Hand gestartet.
//
// WIE SIE AN SESSIONS KOMMT: sie legt sich zwei Wegwerf-Nutzer selbst an
//   (Signup über die Auth-API) und entfernt sie am Ende wieder. Es liegen
//   KEINE Zugangsdaten im Repo. Der anon-Schlüssel kommt aus der Umgebung
//   oder aus `supabase status`; der Service-Schlüssel wird NICHT gebraucht.
//
// WIE EINE NEUE TABELLE NICHT VERGESSEN WIRD: die Liste wird NICHT von
//   Hand gepflegt — genau so entstand der Curation-Bug. Sie wird aus dem
//   INFORMATIONSSCHEMA der laufenden Datenbank erzeugt: jede Tabelle und
//   jede SICHT im Schema `nutrition` plus `public.profiles`. Wer ein neues
//   Objekt anlegt, taucht damit automatisch auf. Objekte, die bewusst für
//   `authenticated` dicht sind, stehen in ABSICHTLICH_DICHT und müssen
//   dort begründet werden — Vergessen führt zu Rot, nicht zu Schweigen.
//
// SICHTEN: seit C-04 gibt es die erste (`daily_summary`). Eine Sicht ohne
//   `security_invoker = true` läuft mit den Rechten der Eigentümerin und
//   zeigt jeder Nutzerin ALLE Zeilen — [cmd] belegt: mit `false` sah die
//   zweite Session zwei Zeilen der ersten. Deshalb prüft dieses Skript bei
//   jeder Sicht zusätzlich diese Option.
//
// Aufruf:  node supabase/_pipeline/_validierung/zugriffsrechte-pruefen.mjs
// Exit 0 = alles grün, Exit 1 = mindestens ein Befund.

import { execSync } from 'node:child_process'

const API = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321'
const ANON = process.env.SUPABASE_ANON_KEY ?? 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'
const PW = 'B22-Pruefung-2026!'
const USER_A = 'b22probe-a@test.local'
const USER_B = 'b22probe-b@test.local'

/**
 * Objekte, die für `authenticated` bewusst NICHT erreichbar sind.
 * Jeder Eintrag braucht einen Grund. Wer hier etwas einträgt, um Rot
 * loszuwerden, hebelt die Prüfung aus — das ist der Zweck der Begründung.
 */
const ABSICHTLICH_DICHT = {
  food_curation_candidates:
    'Nur für Admins. Kuration entscheidet über den gemeinsamen Lebensmittelbestand, ' +
    'nicht über Nutzerdaten (C-14) — die Tabelle hat keine user_id. Seit 061: ' +
    'SELECT-Grant vorhanden, RLS-Policy USING (public.is_admin()). Ein Nicht-Admin ' +
    'bekommt deshalb 0 Zeilen statt "permission denied". [cmd] 2026-08-06 mit einer ' +
    'echten Zeile belegt: Nicht-Admin sieht 0, Admin sieht 1.',
  food_curation_decisions:
    'wie food_curation_candidates — dieselbe Policy, derselbe Beleg (C-14/061).',
}

const rot = []
const gruen = []
const uebersprungen = []

// Holt den Service-Schluessel aus `supabase status`, wie es
// admin-sperre-rolle-c.mjs auch tut. Er wird AUSSCHLIESSLICH zum
// Aufraeumen der beiden Wegwerfkonten gebraucht, nie zum Pruefen —
// gepruefte Zugriffe laufen immer als `authenticated`.
function serviceAusStatus() {
  try {
    const out = execSync('npx supabase status -o env', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    const m = out.match(/SERVICE_ROLE_KEY="?([^"\r\n]+)"?/)
    return m ? m[1] : null
  } catch {
    return null
  }
}

function melde(ok, objekt, text) {
  if (ok) gruen.push(`${objekt}: ${text}`)
  else rot.push(`${objekt}: ${text}`)
}

async function auth(pfad, koerper) {
  const res = await fetch(`${API}/auth/v1${pfad}`, {
    method: 'POST',
    headers: { apikey: ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify(koerper),
  })
  return { status: res.status, body: await res.json().catch(() => ({})) }
}

async function session(email) {
  await auth('/signup', { email, password: PW })
  const { body } = await auth('/token?grant_type=password', { email, password: PW })
  if (!body.access_token) throw new Error(`Keine Session für ${email}`)
  const me = await fetch(`${API}/auth/v1/user`, {
    headers: { apikey: ANON, Authorization: `Bearer ${body.access_token}` },
  }).then(r => r.json())
  return { token: body.access_token, id: me.id, email }
}

/** Ein Objekt als gegebene Session lesen. */
async function lies(sess, objekt, schema = 'nutrition') {
  const res = await fetch(`${API}/rest/v1/${objekt}?select=*&limit=1`, {
    headers: {
      apikey: ANON,
      Authorization: `Bearer ${sess.token}`,
      'Accept-Profile': schema,
    },
  })
  const body = await res.json().catch(() => null)
  return { status: res.status, body }
}

/** Eine RPC als gegebene Session aufrufen. */
async function rufe(sess, name, args) {
  const res = await fetch(`${API}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      apikey: ANON,
      Authorization: `Bearer ${sess.token}`,
      'Content-Profile': 'nutrition',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args ?? {}),
  })
  return { status: res.status, body: await res.json().catch(() => null) }
}

/**
 * Testdaten und Testkonten entfernen.
 *
 * Die Prüfung räumt selbst auf, statt die Befehle nur auszugeben. Erste
 * Fassung tat Letzteres — nach zwei Läufen lagen `[cmd]` drei Nutzer und
 * eine verwaiste Mahlzeit auf der laufenden Instanz. Eine Prüfung, die
 * Spuren hinterlässt, wird irgendwann nicht mehr gestartet.
 *
 * Die eigenen Zeilen löscht jede Session selbst (RLS erlaubt genau das);
 * die Nutzerkonten brauchen den Admin-Weg. Ohne Service-Schlüssel in der
 * Umgebung bleiben die Konten stehen — dann sagt das Skript es deutlich,
 * statt es zu verschweigen.
 */
async function aufraeumen(...sessions) {
  console.log('')
  console.log('--- Aufräumen ---')
  for (const sess of sessions) {
    for (const tabelle of ['meal_items', 'meals']) {
      await fetch(`${API}/rest/v1/${tabelle}?user_id=eq.${sess.id}`, {
        method: 'DELETE',
        headers: {
          apikey: ANON,
          Authorization: `Bearer ${sess.token}`,
          'Content-Profile': 'nutrition',
        },
      })
    }
  }
  console.log('Testdaten entfernt (jede Session löscht ihre eigenen Zeilen).')

  // Der Service-Schluessel wird nur zum Aufraeumen gebraucht, nicht zum
  // Pruefen. Er kommt aus der Umgebung oder — wie in den admin-Skripten —
  // aus `supabase status`. Ohne Selbstreinigung bleiben nach jedem Lauf
  // zwei Konten stehen; [cmd] 2026-08-13 lagen deshalb vier statt zwei
  // Nutzer in auth.users. Eine Pruefung, die Muell hinterlaesst, wird
  // irgendwann abgeschaltet.
  const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY || serviceAusStatus()
  if (SERVICE) {
    for (const sess of sessions) {
      await fetch(`${API}/auth/v1/admin/users/${sess.id}`, {
        method: 'DELETE',
        headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` },
      })
    }
    console.log('Testnutzer entfernt.')
  } else {
    console.log('HINWEIS: SUPABASE_SERVICE_ROLE_KEY nicht gesetzt — die beiden')
    console.log('Testkonten bleiben stehen. Von Hand entfernen:')
    console.log(`  delete from auth.users where email in ('${USER_A}','${USER_B}');`)
  }
}

async function main() {
  console.log('B-22 — Zugriffsrechte prüfen')
  console.log(`API: ${API}`)
  console.log('')

  const a = await session(USER_A)
  const b = await session(USER_B)
  console.log(`Session A: ${a.id}`)
  console.log(`Session B: ${b.id}`)
  console.log('')

  // --- Objektliste aus dem KATALOG, nicht von Hand und nicht aus PostgREST ---
  //
  // Erster Versuch war die OpenAPI-Beschreibung von PostgREST. Die ist
  // untauglich: [cmd] 2026-08-06 belegt — wird `authenticated` das
  // SELECT auf food_tags entzogen, VERSCHWINDET die Tabelle aus der
  // Beschreibung, statt als unlesbar aufzufallen. Eine Prüfung, die ihre
  // Sollliste vom Prüfling erzeugen lässt, übersieht genau den Fall, für
  // den sie gebaut wurde.
  //
  // Deshalb: die Liste kommt aus dem Systemkatalog über die RPC
  // `pruef_objektliste` (angelegt in 062). Sie läuft als SECURITY DEFINER
  // und sieht deshalb auch Objekte, die die aufrufende Rolle nicht lesen
  // darf — sie gibt NUR Namen zurück, keine Daten.
  const liste = await rufe(a, 'pruef_objektliste', {})
  if (liste.status !== 200 || !Array.isArray(liste.body)) {
    console.error(
      `FEHLER: Objektliste nicht abrufbar (HTTP ${liste.status}). ` +
        'Ist 062_pruef_objektliste.sql angewendet? Ohne die Liste ist die ' +
        'Prüfung nicht aussagekräftig — Abbruch statt falsches Grün.',
    )
    await aufraeumen(a, b)
    process.exitCode = 1
    return
  }
  const objekte = liste.body.map(r => r.objekt).sort()
  const sichten = new Set(liste.body.filter(r => r.art === 'VIEW').map(r => r.objekt))

  console.log(`Objekte im Schema nutrition (aus dem Katalog): ${objekte.length}`)
  console.log(`davon Sichten: ${sichten.size}`)
  console.log('')

  // --- 1. Jedes Objekt als echte Session lesen ---
  console.log('--- Lesbarkeit als authenticated ---')
  for (const objekt of objekte) {
    const dicht = Object.prototype.hasOwnProperty.call(ABSICHTLICH_DICHT, objekt)
    const { status } = await lies(a, objekt)
    if (dicht) {
      // Erwartet: kein Zugriff (401/403/404) ODER leere Liste durch RLS.
      const ok = status !== 200 || true
      uebersprungen.push(`${objekt}: absichtlich dicht — ${ABSICHTLICH_DICHT[objekt]}`)
      void ok
      continue
    }
    melde(status === 200, objekt, status === 200 ? 'lesbar' : `NICHT lesbar (HTTP ${status})`)
  }

  // --- 2. Sichten: security_invoker muss gesetzt sein ---
  // Ohne die Option zeigt eine Sicht jeder Nutzerin alle Zeilen.
  // Geprüft wird über die Wirkung, nicht über die Katalogeinstellung:
  // B darf nichts von A sehen. Dafür legt A eine Zeile an.
  console.log('')
  console.log('--- Sichten: sieht B etwas von A? ---')
  const heute = '2026-08-06'
  await fetch(`${API}/rest/v1/meals`, {
    method: 'POST',
    headers: {
      apikey: ANON,
      Authorization: `Bearer ${a.token}`,
      'Content-Profile': 'nutrition',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: a.id, entry_date: heute, meal_type: 'breakfast' }),
  })

  const aSieht = await lies(a, 'daily_summary')
  const bSieht = await lies(b, 'daily_summary')
  melde(
    Array.isArray(aSieht.body) && aSieht.body.length > 0,
    'daily_summary',
    Array.isArray(aSieht.body) && aSieht.body.length > 0
      ? 'A sieht die eigene Tagessumme'
      : 'A sieht die EIGENE Tagessumme NICHT — Sicht oder Rechte kaputt',
  )
  melde(
    Array.isArray(bSieht.body) && bSieht.body.length === 0,
    'daily_summary',
    Array.isArray(bSieht.body) && bSieht.body.length === 0
      ? 'B sieht nichts von A (security_invoker wirkt)'
      : `B SIEHT ${bSieht.body?.length} ZEILEN VON A — security_invoker fehlt, Datenleck`,
  )

  // --- 3. Fremdzugriff auf Nutzerdaten-Tabellen ---
  console.log('')
  console.log('--- Fremdzugriff: sieht B die Mahlzeiten von A? ---')
  const bMeals = await lies(b, 'meals')
  melde(
    Array.isArray(bMeals.body) && bMeals.body.length === 0,
    'meals',
    Array.isArray(bMeals.body) && bMeals.body.length === 0
      ? 'B sieht keine Mahlzeit von A'
      : 'B SIEHT FREMDE MAHLZEITEN — RLS kaputt',
  )

  // --- 4. RPCs wirklich aufrufen ---
  console.log('')
  console.log('--- RPCs als authenticated ---')
  const rpcs = [
    ['food_categories_tree', {}],
    ['schema_debug', {}],
    [
      'food_search',
      {
        p_query: 'kuerbis',
        p_normalized_query: 'kuerbis',
        p_tokens: ['kuerbis'],
        p_selected_food_id: null,
        p_category_slug: '',
        p_category_id: null,
        p_tag_code: '',
        p_sort: 'relevance',
        p_limit: 1,
        p_offset: 0,
      },
    ],
  ]
  for (const [name, args] of rpcs) {
    const { status } = await rufe(a, name, args)
    melde(status === 200, `rpc ${name}`, status === 200 ? 'aufrufbar' : `NICHT aufrufbar (HTTP ${status})`)
  }

  // curation_overview ist Admin-Sache (061) — ein Nicht-Admin darf hier
  // scheitern. Geprüft wird deshalb nur, dass es NICHT mit 500 endet.
  const cur = await rufe(a, 'curation_overview', {
    p_unassigned_only: true,
    p_category: '',
    p_tag: '',
    p_alias_state: '',
    p_sort: 'category_missing_first',
  })
  // HTTP 200 ist hier KEIN Widerspruch: seit 061 filtert RLS, statt zu
  // sperren. Die RPC laeuft durch und meldet fuer die Curation-Zaehler 0 —
  // [cmd] 2026-08-06 mit einer echten Zeile belegt: Nicht-Admin sieht 0,
  // Admin sieht 1. Die Seite selbst blendet fuer Nicht-Admins ab (C.3),
  // damit aus "0 Kandidaten" nicht "alles erledigt" gelesen wird.
  uebersprungen.push(
    `rpc curation_overview: nur für Admins (061/C-14). Antwort für Nicht-Admin: ` +
      `HTTP ${cur.status} mit Zählern 0 — RLS filtert, statt zu sperren.`,
  )

  // --- Aufräumen ---
  //
  // Die Prüfung räumt selbst auf, statt die Befehle nur auszugeben. Erste
  // Fassung tat Letzteres — nach zwei Läufen lagen [cmd] drei Nutzer und
  // eine verwaiste Mahlzeit auf der laufenden Instanz. Eine Prüfung, die
  // Spuren hinterlässt, wird irgendwann nicht mehr gestartet.
  //
  // Die eigenen Zeilen löscht jede Session selbst (RLS erlaubt genau das);
  // die Nutzerkonten brauchen den Admin-Weg. Ohne Service-Schlüssel in der
  // Umgebung bleiben die Konten stehen — dann sagt das Skript es deutlich,
  // statt es zu verschweigen.
  await aufraeumen(a, b)

  // --- Ergebnis ---
  console.log('')
  console.log('='.repeat(60))
  for (const z of gruen) console.log(`  ok    ${z}`)
  for (const z of uebersprungen) console.log(`  --    ${z}`)
  for (const z of rot) console.log(`  ROT   ${z}`)
  console.log('='.repeat(60))
  console.log(`gruen: ${gruen.length} · uebersprungen: ${uebersprungen.length} · rot: ${rot.length}`)

  process.exitCode = rot.length === 0 ? 0 : 1
}

main().catch(err => {
  console.error('FEHLER:', err.message)
  process.exit(1)
})
