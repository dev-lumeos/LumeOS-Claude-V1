#!/usr/bin/env node
// B-13 — Rueckleitadressen erzeugen statt pflegen (2026-08-13).
//
// ANLASS: Eine Liste erlaubter Redirect-Adressen, die jemand von Hand
// pflegt, veraltet. Das ist der B-22-Befund in anderer Gestalt: dort zog
// eine Rechtepruefung ihre Objektliste aus dem Prueflig und meldete
// Erfolg, weil sie nichts mehr fand. Hier waere es umgekehrt — eine neue
// App bekaeme keinen Eintrag, und niemand merkte es, bis eine Anmeldung
// scheitert.
//
// DESHALB ABGELEITET, nicht gefuehrt. Zwei Quellen, beide im Repo:
//   * Port je App        -> apps/<name>/package.json, Skript `dev`/`start`
//   * Callback-Pfad      -> Existenz von apps/<name>/src/app/auth/callback/
// Eine neue App bringt beides mit; die Liste waechst von selbst mit.
//
// WAS DIESES SKRIPT NICHT TUT: es aendert nichts. Es schreibt die Liste
// nach stdout, damit sie in `supabase/config.toml` oder ins
// Cloud-Dashboard uebernommen werden kann. Der Cloud-Teil ist Handarbeit
// im Dashboard — Supabase bietet dafuer keine Datei im Repo.
//
// AUFRUF:
//   node scripts/redirect-urls-erzeugen.mjs            # lokal (localhost)
//   node scripts/redirect-urls-erzeugen.mjs --basis https://lumeos.app
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HIER = path.dirname(fileURLToPath(import.meta.url))
const WURZEL = path.resolve(HIER, '..')

const args = process.argv.slice(2)
const basisIdx = args.indexOf('--basis')
const basis = basisIdx >= 0 ? args[basisIdx + 1] : null

/** Alle Apps mit Port und Callback-Route. */
function apps() {
  const appsDir = path.join(WURZEL, 'apps')
  const gefunden = []
  for (const name of fs.readdirSync(appsDir)) {
    const pkg = path.join(appsDir, name, 'package.json')
    if (!fs.existsSync(pkg)) continue

    const j = JSON.parse(fs.readFileSync(pkg, 'utf8'))
    const m = (j.scripts?.dev ?? '').match(/-p\s+(\d+)/)
    if (!m) continue

    const callback = fs.existsSync(
      path.join(appsDir, name, 'src/app/auth/callback/route.ts'))

    gefunden.push({ name, port: Number(m[1]), callback })
  }
  return gefunden.sort((a, b) => a.port - b.port)
}

const liste = apps()

console.log('# Rueckleitadressen — ERZEUGT, nicht von Hand gefuehrt')
console.log('# Quelle: apps/*/package.json (Port) + Existenz der Callback-Route')
console.log('# Erzeugt von scripts/redirect-urls-erzeugen.mjs')
console.log('')

console.log('# Apps im Repo:')
for (const a of liste) {
  console.log(`#   ${a.name.padEnd(12)} Port ${a.port}` +
    (a.callback ? '  mit /auth/callback' : '  OHNE Callback-Route'))
}
console.log('')

const mitCallback = liste.filter(a => a.callback)
const ohneCallback = liste.filter(a => !a.callback)

if (ohneCallback.length) {
  console.log('# HINWEIS: diese Apps haben KEINE Callback-Route und brauchen')
  console.log('# deshalb (noch) keinen Eintrag:')
  for (const a of ohneCallback) console.log(`#   ${a.name}`)
  console.log('')
}

function urls(praefix) {
  return mitCallback.map(a =>
    basis ? `${praefix}${a.name === 'web' ? '' : a.name + '.'}${basis.replace(/^https?:\/\//, '')}/auth/callback`
          : `http://localhost:${a.port}/auth/callback`)
}

if (basis) {
  console.log('# --- Fuer die Cloud (Dashboard: Authentication > URL Configuration) ---')
  console.log('# ACHTUNG: die Zuordnung App -> Subdomain ist eine ANNAHME dieses')
  console.log('# Skripts (web = Wurzeldomain, sonst <app>.<domain>). Sie stammt aus')
  console.log('# docs/spezifikation/10-plattform/auth-sso §4 und ist von Tom zu')
  console.log('# bestaetigen, bevor sie eingetragen wird.')
  console.log('')
  console.log('Site URL:')
  console.log('  ' + basis.replace(/\/$/, ''))
  console.log('Redirect URLs:')
  for (const u of urls('https://')) console.log('  ' + u)
} else {
  console.log('# --- Fuer supabase/config.toml ---')
  const web = liste.find(a => a.name === 'web')
  console.log(`site_url = "http://localhost:${web ? web.port : 3200}"`)
  console.log('additional_redirect_urls = [')
  for (const u of urls('http://')) console.log(`  "${u}",`)
  console.log(']')
}

// Der Abgleich gilt nur fuer den lokalen Fall: config.toml beschreibt die
// lokale Instanz. Gegen Cloud-Adressen verglichen ergaebe er Unsinn
// ("fehlt: https://…" in einer Datei, in die das nie gehoert).
if (basis) {
  console.log('')
  console.log('# Kein Abgleich mit config.toml — die Datei beschreibt die LOKALE')
  console.log('# Instanz. Die Cloud-Werte stehen nur im Dashboard; ein Vergleich')
  console.log('# waere ein Vergleich zweier verschiedener Dinge.')
  process.exit(0)
}

console.log('')
console.log('# --- Abgleich mit dem Ist-Zustand (lokal) ---')
const toml = fs.readFileSync(path.join(WURZEL, 'supabase/config.toml'), 'utf8')
const ist = toml.match(/^additional_redirect_urls\s*=\s*\[(.*?)\]/ms)
const istUrls = ist ? [...ist[1].matchAll(/"([^"]+)"/g)].map(m => m[1]) : []
const sollUrls = urls('http://')

const fehlend = sollUrls.filter(u => !istUrls.includes(u))
const ueberzaehlig = istUrls.filter(u => !sollUrls.includes(u))

console.log('# in config.toml eingetragen : ' + (istUrls.join(', ') || '(nichts)'))
console.log('# fehlt dort                 : ' + (fehlend.join(', ') || '(nichts)'))
console.log('# ueberzaehlig dort          : ' + (ueberzaehlig.join(', ') || '(nichts)'))

process.exit(fehlend.length || ueberzaehlig.length ? 1 : 0)
