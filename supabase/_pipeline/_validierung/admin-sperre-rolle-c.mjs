#!/usr/bin/env node
// Block 20 — Zustand C der Admin-Sperre: angemeldet ALS ADMIN.
// Ergaenzung zu admin-sperre-pruefen.mjs (A und B), das daneben liegt.
//
// WARUM EIGENE DATEI: dieses Skript AENDERT auth.users — es vergibt dem
// Testkonto voruebergehend die Admin-Rolle und nimmt sie zurueck. Eine
// Pruefung, die nur liest, und eine, die schreibt, gehoeren nicht in
// dieselbe Datei: sonst aendert jemand die Datenbank, der nur pruefen
// wollte. A und B laufen ohne jede Aenderung.
//
// WARUM DIESER WEG statt eines Admin-Passworts:
//   * Fuer dev@lumeos.app liegt kein Passwort im Repo, und es soll auch
//     keines dorthin.
//   * Der Rollentausch ist der STAERKERE Beleg: B und C laufen dann auf
//     DEMSELBEN Konto, mit denselben Daten — es unterscheidet sie
//     ausschliesslich die Rolle. Ein zweites Konto koennte sich auch in
//     anderer Hinsicht unterscheiden.
//
// ROLLE SETZEN geht NUR ueber die Admin-API mit dem Service-Schluessel:
// `[cmd]` die Nutzer-API lehnt app_metadata mit 403 not_admin ab. Das
// ist Absicht — user_metadata waere vom Nutzer selbst setzbar und darf
// deshalb nie fuer Rechte gelesen werden (siehe admin-role.ts).
//
// ---------------------------------------------------------------------
// DIE FALLE BEI DER RUECKNAHME, am 2026-08-12 hineingelaufen:
// `[cmd]` Die Admin-API MERGED app_metadata, sie ERSETZT es nicht.
// Ein PUT mit {provider, providers} laesst ein vorhandenes `role`
// unberuehrt — die Rolle blieb stehen, obwohl die Antwort wie ein
// Zuruecksetzen aussah. Richtig ist `{"role": null}`: beim Merge
// entfernt null den Schluessel.
// Deshalb prueft dieses Skript die Ruecknahme am Ende NACH, statt sie
// anzunehmen, und meldet Exit 1, wenn die Rolle noch da ist.
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const HIER = path.dirname(fileURLToPath(import.meta.url))
const WURZEL = path.resolve(HIER, '../../..')

const API = process.env.SUPABASE_URL || 'http://127.0.0.1:54321'
const ADMIN = process.env.LUMEOS_ADMIN_URL || 'http://localhost:3210'

function ausDoku() {
  const txt = fs.readFileSync(path.join(WURZEL, 'docs/ssot/37-testkonten.md'), 'utf8')
  const konto = txt.match(/\|\s*`(test-user@[^`]+)`\s*\|\s*`([^`]+)`/)
  const uid = txt.match(/Nutzer-ID\s+`([0-9a-f-]{36})`/)
  if (!konto || !uid) {
    throw new Error('Testkonto oder Nutzer-ID nicht in docs/ssot/37-testkonten.md gefunden.')
  }
  return { email: konto[1], passwort: konto[2], uid: uid[1] }
}

function anonSchluessel() {
  if (process.env.SUPABASE_ANON_KEY) return process.env.SUPABASE_ANON_KEY
  for (const rel of ['apps/web/.env.local', 'apps/admin/.env.local']) {
    const p = path.join(WURZEL, rel)
    if (!fs.existsSync(p)) continue
    const m = fs.readFileSync(p, 'utf8').match(/NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=\s*(\S+)/)
    if (m) return m[1]
  }
  throw new Error('Kein anon-Schluessel gefunden.')
}

// Der Service-Schluessel kommt NICHT aus dem Repo, sondern aus der
// laufenden Instanz — dieselbe Linie wie bei B-22.
function serviceSchluessel() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) return process.env.SUPABASE_SERVICE_ROLE_KEY
  const out = execSync('npx supabase status -o env', { encoding: 'utf8' })
  const m = out.match(/SERVICE_ROLE_KEY="?([^"\r\n]+)"?/)
  if (!m) throw new Error('Service-Schluessel nicht gefunden (supabase status).')
  return m[1]
}

const { email, passwort, uid } = ausDoku()
const anon = anonSchluessel()
const service = serviceSchluessel()
const adminKopf = {
  apikey: service,
  authorization: `Bearer ${service}`,
  'content-type': 'application/json',
}

async function nutzer() {
  const r = await fetch(`${API}/auth/v1/admin/users/${uid}`, { headers: adminKopf })
  if (!r.ok) throw new Error(`Nutzer lesen: HTTP ${r.status}`)
  return r.json()
}

async function setzeAppMetadata(metadata) {
  const r = await fetch(`${API}/auth/v1/admin/users/${uid}`, {
    method: 'PUT',
    headers: adminKopf,
    body: JSON.stringify({ app_metadata: metadata }),
  })
  if (!r.ok) throw new Error(`app_metadata setzen: HTTP ${r.status} ${await r.text()}`)
  return (await r.json()).app_metadata
}

async function anmelden() {
  const r = await fetch(`${API}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: anon, 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: passwort }),
  })
  if (!r.ok) throw new Error(`Anmeldung: HTTP ${r.status}`)
  const s = await r.json()
  const p = JSON.parse(Buffer.from(s.access_token.split('.')[1], 'base64url').toString('utf8'))
  // Cookieform: siehe ausfuehrliche Begruendung in admin-sperre-pruefen.mjs
  const ref = new URL(API).hostname.split('.')[0]
  return { kopf: `sb-${ref}-auth-token=${JSON.stringify(s)}`, rolle: p.app_metadata?.role ?? null }
}

async function hole(url, kopf) {
  const a = await fetch(url, { headers: { cookie: kopf }, redirect: 'manual' })
  return { status: a.status, ziel: a.headers.get('location'), text: await a.text() }
}

const sichtbar = h => h
  .replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim()

let fehler = 0
function pruefe(bezeichnung, bedingung, beleg) {
  const ok = Boolean(bedingung)
  if (!ok) fehler++
  console.log(`  ${ok ? 'OK  ' : 'FEHL'}  ${bezeichnung}`)
  if (beleg) console.log(`        ${beleg}`)
}

async function main() {
  const vorher = (await nutzer()).app_metadata
  console.log('Zustand C — angemeldet als Admin')
  console.log('  Konto      :', email)
  console.log('  VORHER     :', JSON.stringify(vorher))
  if (vorher.role === 'admin') {
    console.log('ABBRUCH: Konto traegt bereits role=admin. Dann ist unklar, ob')
    console.log('dieses Skript die Rolle vergeben hat — und die Ruecknahme')
    console.log('wuerde einen Zustand herstellen, der so nicht war.')
    process.exit(1)
  }

  try {
    const mit = await setzeAppMetadata({ ...vorher, role: 'admin' })
    console.log('  ROLLE GESETZT:', JSON.stringify(mit))

    const s = await anmelden()
    console.log('  role im JWT  :', s.rolle)
    console.log('')
    pruefe('Rolle im JWT angekommen', s.rolle === 'admin')

    const c1 = await hole(ADMIN + '/', s.kopf)
    const t1 = sichtbar(c1.text)
    pruefe('admin /  -> 200', c1.status === 200, `HTTP ${c1.status}`)
    pruefe('admin /  -> Adminseite sichtbar', /als Administrator erkannt/i.test(t1),
      t1.slice(0, 110))
    pruefe('admin /  -> KEINE Absage', !/Kein Zugang/i.test(t1))

    const c2 = await hole(ADMIN + '/curation', s.kopf)
    const t2 = sichtbar(c2.text)
    pruefe('admin /curation -> 200', c2.status === 200, `HTTP ${c2.status}`)
    pruefe('admin /curation -> KEINE Absage',
      !/der Verwaltung vorbehalten|Verwaltungsrolle/i.test(t2))

    const c3 = await hole(ADMIN + '/api/curation', s.kopf)
    pruefe('API /api/curation -> 200', c3.status === 200, `HTTP ${c3.status}`)
    pruefe('API -> liefert Daten, nicht leer', c3.text.length > 50,
      c3.text.slice(0, 120))
  } finally {
    // IMMER zuruecknehmen, auch wenn oben etwas wirft.
    // `{role: null}` statt des Ausgangsobjekts — die API merged.
    console.log('')
    console.log('=== RUECKNAHME ===')
    await setzeAppMetadata({ role: null })
    const danach = (await nutzer()).app_metadata
    console.log('  NACHHER    :', JSON.stringify(danach))
    const sauber = danach.role === undefined &&
      JSON.stringify(danach) === JSON.stringify(vorher)
    pruefe('Rolle zurueckgenommen, Ausgangszustand wiederhergestellt', sauber,
      sauber ? null : `erwartet ${JSON.stringify(vorher)}`)
    if (!sauber) {
      console.log('  ACHTUNG: Rolle NICHT sauber entfernt — von Hand pruefen:')
      console.log('  SELECT email, raw_app_meta_data FROM auth.users;')
    }
  }

  console.log('')
  console.log(fehler === 0 ? 'ALLE PRUEFUNGEN BESTANDEN' : `${fehler} PRUEFUNG(EN) FEHLGESCHLAGEN`)
  process.exit(fehler === 0 ? 0 : 1)
}

main().catch(e => { console.error('ABBRUCH:', e.message); process.exit(1) })
