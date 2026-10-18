#!/usr/bin/env node
// B-12 Weg B — belegen, dass die Sitzungen von apps/web und apps/admin
// GETRENNT sind (2026-08-12, Block 22).
//
// KERN DER PRUEFUNG: eine Anmeldung in der einen App darf in der anderen
// NICHT wirken. Bis Block 21 war das lokal umgekehrt — beide Apps
// leiteten denselben Cookienamen ab und teilten sich auf `localhost`
// die Sitzung, weil Cookies nach HOST getrennt werden und nicht nach
// Port. Das sah aus wie funktionierendes SSO und prueste die
// Produktionsannahme gerade nicht.
//
// DER NAME WIRD NICHT GERATEN. Er wird aus der `set-cookie`-Kopfzeile
// einer ECHTEN Anmeldung gelesen — also dem, was die App tatsaechlich
// setzt, nicht dem, was der Code zu setzen scheint. Aus der Existenz
// einer Konfiguration folgt nicht ihre Wirkung.
//
// WO SIE LEBT: hier, NICHT im `pnpm gate` — wie die beiden
// admin-sperre-Skripte daneben. Sie braucht zwei laufende Dev-Server
// und eine laufende Supabase-Instanz.
//
// KEINE IMPORTE ausser node-Bordmitteln, damit sie aus jedem
// Verzeichnis laeuft (`supabase/` ist kein pnpm-Paket).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HIER = path.dirname(fileURLToPath(import.meta.url))
const WURZEL = path.resolve(HIER, '../../..')

const WEB = process.env.LUMEOS_WEB_URL || 'http://localhost:3200'
const ADMIN = process.env.LUMEOS_ADMIN_URL || 'http://localhost:3210'
const API = process.env.SUPABASE_URL || 'http://127.0.0.1:54321'

function testnutzerAusDoku() {
  const txt = fs.readFileSync(path.join(WURZEL, 'docs/ssot/37-testkonten.md'), 'utf8')
  const m = txt.match(/\|\s*`(test-user@[^`]+)`\s*\|\s*`([^`]+)`/)
  if (!m) throw new Error('Testnutzer nicht in docs/ssot/37-testkonten.md gefunden.')
  return { email: m[1], passwort: m[2] }
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

/** Cookiename einer App, aus ihrer eigenen Konfiguration abgeleitet. */
function erwarteterName(envDatei) {
  const ref = new URL(API).hostname.split('.')[0]
  const p = path.join(WURZEL, envDatei)
  let scope = ''
  if (fs.existsSync(p)) {
    const m = fs.readFileSync(p, 'utf8')
      .match(/^\s*NEXT_PUBLIC_AUTH_COOKIE_SCOPE\s*=\s*(\S+)/m)
    if (m) scope = m[1].trim()
  }
  return scope ? `sb-${ref}-${scope}-auth-token` : `sb-${ref}-auth-token`
}

const { email, passwort } = testnutzerAusDoku()
const anon = anonSchluessel()

async function anmelden() {
  const r = await fetch(`${API}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: anon, 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: passwort }),
  })
  if (!r.ok) throw new Error(`Anmeldung: HTTP ${r.status}`)
  return r.json()
}

/**
 * Liest den Cookienamen, den die App TATSAECHLICH setzt, aus ihrer
 * `set-cookie`-Kopfzeile.
 *
 * Der Trick: eine frische Sitzung loest keine Erneuerung aus, also auch
 * kein `set-cookie` — der erste Anlauf dieser Pruefung lieferte deshalb
 * nichts. Hier wird die Sitzung darum als ABGELAUFEN uebergeben
 * (`expires_at` in der Vergangenheit). Dann MUSS die Middleware ueber
 * den refresh_token erneuern und schreibt dabei das Cookie — unter
 * genau dem Namen, den die App konfiguriert hat.
 *
 * Das ist der Unterschied zwischen "aus dem Code geschlossen" und
 * "gemessen": die Formel steht in cookie-name.ts, aber ob sie ankommt,
 * sagt nur die Kopfzeile.
 */
async function gesetzterName(basis, sitzung, name, pfad) {
  const abgelaufen = { ...sitzung, expires_at: Math.floor(Date.now() / 1000) - 60 }
  const r = await fetch(basis + pfad, {
    headers: { cookie: `${name}=${JSON.stringify(abgelaufen)}` },
    redirect: 'manual',
  })
  const sc = r.headers.getSetCookie?.() ?? []
  return [...new Set(sc
    .map(z => z.split('=')[0].trim())
    .filter(n => n.startsWith('sb-')))]
}

async function hole(url, kopf) {
  const r = await fetch(url, {
    headers: kopf ? { cookie: kopf } : {},
    redirect: 'manual',
  })
  return { status: r.status, ziel: r.headers.get('location'), text: await r.text() }
}

// Ein Next-Dev-Server kompiliert eine Route erst beim ersten Aufruf und
// antwortet bis dahin mit 404. Wer direkt nach einem Neustart prueft, misst
// also die Kompilierung und nicht das Verhalten.
// [cmd] 2026-08-12 beobachtet: die Gegenprobe gegen admin / lieferte im
// ersten Lauf 404, im zweiten 200. Das Kriterium ("nicht auf /login") blieb
// zufaellig richtig — ein Kriterium wie "liefert 200" waere falsch rot
// geworden. Deshalb einmal vorab abrufen und das Ergebnis verwerfen.
async function aufwaermen(adressen) {
  for (const a of adressen) {
    try {
      await fetch(a, { redirect: 'manual' })
    } catch {
      // Ein nicht erreichbarer Server faellt in den eigentlichen Pruefungen
      // auf, nicht hier.
    }
  }
}

let fehler = 0
function pruefe(bezeichnung, bedingung, beleg) {
  const ok = Boolean(bedingung)
  if (!ok) fehler++
  console.log(`  ${ok ? 'OK  ' : 'FEHL'}  ${bezeichnung}`)
  if (beleg) console.log(`        ${beleg}`)
}

async function main() {
  console.log('B-12 Weg B — getrennte Sitzungen')
  console.log('  web  :', WEB)
  console.log('  admin:', ADMIN)
  await aufwaermen([WEB + '/', WEB + '/dashboard', ADMIN + '/', ADMIN + '/curation'])
  console.log('')

  const webName = erwarteterName('apps/web/.env.local')
  const adminName = erwarteterName('apps/admin/.env.local')
  console.log('Erwartete Namen aus der Konfiguration:')
  console.log('  apps/web  :', webName)
  console.log('  apps/admin:', adminName)
  console.log('')

  pruefe('Die beiden Namen sind verschieden', webName !== adminName,
    `${webName}  vs  ${adminName}`)
  pruefe('Beide tragen den Umgebungsteil (Projekt-Referenz)',
    webName.startsWith('sb-') && adminName.startsWith('sb-') &&
    adminName.includes(new URL(API).hostname.split('.')[0]),
    'lokal und Cloud kollidieren dadurch nicht')
  console.log('')

  const sitzung = await anmelden()

  // --- DER KERN: wirkt die Sitzung in der jeweils anderen App? ---
  console.log('KERN: Anmeldung in einer App darf in der anderen NICHT wirken')

  // Sitzung unter dem WEB-Namen -> admin darf sie nicht kennen
  const webKopf = `${webName}=${JSON.stringify(sitzung)}`
  const a1 = await hole(ADMIN + '/', webKopf)
  pruefe('web-Sitzung wirkt NICHT in admin (307 auf /login)',
    a1.status === 307 && /\/login/.test(a1.ziel || ''),
    `HTTP ${a1.status}${a1.ziel ? ' -> ' + a1.ziel : ''}`)

  // Sitzung unter dem ADMIN-Namen -> web darf sie nicht kennen
  const adminKopf = `${adminName}=${JSON.stringify(sitzung)}`
  const a2 = await hole(WEB + '/dashboard', adminKopf)
  pruefe('admin-Sitzung wirkt NICHT in web (307 auf /login)',
    a2.status === 307 && /\/login/.test(a2.ziel || ''),
    `HTTP ${a2.status}${a2.ziel ? ' -> ' + a2.ziel : ''}`)
  console.log('')

  // --- Gegenprobe: unter dem EIGENEN Namen wirkt sie sehr wohl ---
  console.log('GEGENPROBE: unter dem eigenen Namen wird die Sitzung erkannt')
  const b1 = await hole(ADMIN + '/', adminKopf)
  pruefe('admin erkennt die Sitzung unter seinem Namen',
    !/\/login/.test(b1.ziel || ''),
    `HTTP ${b1.status}${b1.ziel ? ' -> ' + b1.ziel : ''}`)
  const b2 = await hole(WEB + '/dashboard', webKopf)
  pruefe('web erkennt die Sitzung unter seinem Namen',
    !/\/login/.test(b2.ziel || ''),
    `HTTP ${b2.status}${b2.ziel ? ' -> ' + b2.ziel : ''}`)
  console.log('')

  // --- Was setzt die App wirklich? set-cookie statt Codelektuere ---
  console.log('BELEG aus set-cookie (gemessen, nicht aus dem Code geschlossen):')
  // Je eine FRISCHE Sitzung, sonst ist der refresh_token schon verbraucht.
  const webGesetzt = await gesetzterName(WEB, await anmelden(), webName, '/dashboard')
  const adminGesetzt = await gesetzterName(ADMIN, await anmelden(), adminName, '/')
  console.log('  apps/web   setzt:', webGesetzt.join(', ') || '(keins)')
  console.log('  apps/admin setzt:', adminGesetzt.join(', ') || '(keins)')
  pruefe('apps/web setzt seinen eigenen Namen', webGesetzt.includes(webName))
  pruefe('apps/admin setzt seinen eigenen Namen', adminGesetzt.includes(adminName))
  pruefe('gesetzte Namen sind disjunkt',
    webGesetzt.length > 0 && adminGesetzt.length > 0 &&
    !webGesetzt.some(n => adminGesetzt.includes(n)))

  console.log('')
  console.log(fehler === 0 ? 'ALLE PRUEFUNGEN BESTANDEN' : `${fehler} PRUEFUNG(EN) FEHLGESCHLAGEN`)
  process.exit(fehler === 0 ? 0 : 1)
}

main().catch(e => { console.error('ABBRUCH:', e.message); process.exit(1) })
