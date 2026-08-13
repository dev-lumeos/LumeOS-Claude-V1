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
// DESHALB ABGELEITET, nicht gefuehrt. Was aus dem Repo kommt:
//   * Port je App        -> apps/<name>/package.json, Skript `dev`
//   * Callback-Pfad      -> Existenz von apps/<name>/src/app/auth/callback/
//   * Existenz einer App -> das Verzeichnis selbst
// Eine neue App bringt Port und Callback mit; die Liste waechst von selbst.
//
// WAS NICHT ABLEITBAR IST — die Domain. Aus einem Verzeichnisnamen folgt
// keine Subdomain. Sie steht deshalb unten als DOMAINS-Tabelle: eine
// Entscheidung, kein Fund. Herkunft ist vermerkt, damit sie nicht als
// Ableitung missverstanden wird.
//
// WAS DIESES SKRIPT NICHT TUT: es aendert nichts. Es schreibt nach stdout,
// damit die Werte in `supabase/config.toml` (lokal) oder ins
// Cloud-Dashboard uebernommen werden koennen. Fuer die Cloud bietet
// Supabase keine Datei im Repo — das bleibt Handarbeit im Dashboard.
//
// AUFRUF:
//   node scripts/redirect-urls-erzeugen.mjs              # lokal (localhost)
//   node scripts/redirect-urls-erzeugen.mjs --umgebung produktion
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HIER = path.dirname(fileURLToPath(import.meta.url))
const WURZEL = path.resolve(HIER, '..')

const args = process.argv.slice(2)
const umgIdx = args.indexOf('--umgebung')
const umgebung = umgIdx >= 0 ? args[umgIdx + 1] : 'lokal'

// =====================================================================
// DOMAINS — Entscheidung Tom, 2026-08-13. Keine Ableitung.
// =====================================================================
// Beantwortet zugleich die Altfrage "lumeos.app oder app.lumeos.app":
// WEDER noch. Die Webversion ist `web.lumeos.app`; `www.lumeos.app` ist
// die Landingpage und NICHT die App.
//
// `landing: true` heisst: keine App im Repo, kein Port, keine
// Callback-Route — nur eine Domain. Sie steht hier, damit sie nicht
// vergessen wird, erzeugt aber keinen Redirect-Eintrag.
const DOMAINS = {
  www:         { domain: 'www.lumeos.app',         landing: true },
  web:         { domain: 'web.lumeos.app' },
  admin:       { domain: 'admin.lumeos.app' },
  coach:       { domain: 'coach.lumeos.app' },
  marketplace: { domain: 'marketplace.lumeos.app' },
  buddy:       { domain: 'buddy.lumeos.app' },
  // Nachgetragen 2026-08-13 (Tom): kommen spaeter, Verzeichnisse
  // existieren noch nicht. Stehen hier, damit die Domain feststeht,
  // bevor jemand sie erfindet — sie erzeugen erst einen Eintrag, wenn
  // die App gebaut ist (Port + Callback-Route).
  gym:         { domain: 'gym.lumeos.app' },
  supplier:    { domain: 'supplier.lumeos.app' },
}

// Umgebungen. `main` gibt es heute NICHT — es entsteht erst mit Vercel.
// Der Parameter ist trotzdem da, damit spaeter nichts umgebaut werden
// muss; eingetragen wird nur, was existiert.
const UMGEBUNGEN = {
  lokal: {
    beschreibung: 'lokale Supabase-Instanz, Dev-Server auf localhost',
    url: (app) => `http://localhost:${app.port}/auth/callback`,
    siteUrl: (apps) => {
      const web = apps.find(a => a.name === 'web')
      return `http://localhost:${web ? web.port : 3200}`
    },
    existiert: true,
  },
  produktion: {
    beschreibung: 'Vercel + Cloud-Supabase (Branch main) — EXISTIERT NOCH NICHT',
    url: (app) => `https://${DOMAINS[app.name].domain}/auth/callback`,
    siteUrl: () => `https://${DOMAINS.web.domain}`,
    existiert: false,
  },
}

/**
 * Alle Apps aus dem Dateibaum, mit Port, Callback-Route und Domain.
 *
 * Ein Verzeichnis unter apps/ ohne package.json ist ein Geruest (nur
 * `src/.gitkeep`) — es zaehlt als GEPLANT, nicht als vorhanden.
 */
function apps() {
  const appsDir = path.join(WURZEL, 'apps')
  const gefunden = []

  for (const name of fs.readdirSync(appsDir)) {
    const appDir = path.join(appsDir, name)
    if (!fs.statSync(appDir).isDirectory()) continue

    const pkg = path.join(appDir, 'package.json')
    const hatPkg = fs.existsSync(pkg)
    let port = null
    if (hatPkg) {
      const j = JSON.parse(fs.readFileSync(pkg, 'utf8'))
      const m = (j.scripts?.dev ?? '').match(/-p\s+(\d+)/)
      if (m) port = Number(m[1])
    }

    const callback = fs.existsSync(
      path.join(appDir, 'src/app/auth/callback/route.ts'))

    gefunden.push({
      name,
      port,
      callback,
      // Gebaut = hat package.json UND Port. Alles andere ist Geruest.
      gebaut: hatPkg && port !== null,
      domain: DOMAINS[name]?.domain ?? null,
    })
  }

  // Domains ohne Verzeichnis (heute: www) mit aufnehmen.
  for (const [name, d] of Object.entries(DOMAINS)) {
    if (gefunden.some(a => a.name === name)) continue
    gefunden.push({
      name, port: null, callback: false, gebaut: false,
      domain: d.domain, landing: d.landing ?? false, ohneVerzeichnis: true,
    })
  }

  return gefunden.sort((a, b) => (a.port ?? 9999) - (b.port ?? 9999) ||
    a.name.localeCompare(b.name))
}

const liste = apps()
const umg = UMGEBUNGEN[umgebung]
if (!umg) {
  console.error(`Unbekannte Umgebung "${umgebung}". Bekannt: ` +
    Object.keys(UMGEBUNGEN).join(', '))
  process.exit(2)
}

console.log('# Rueckleitadressen — ERZEUGT, nicht von Hand gefuehrt')
console.log('# Port + Callback-Route aus dem Dateibaum, Domain aus der')
console.log('# Entscheidung vom 2026-08-13 (siehe DOMAINS im Skript).')
console.log(`# Umgebung: ${umgebung} — ${umg.beschreibung}`)
console.log('')

console.log('# Bestand:')
for (const a of liste) {
  const zustand = a.landing ? 'Landingpage, keine App'
    : a.ohneVerzeichnis ? 'GEPLANT (kein Verzeichnis)'
    : !a.gebaut ? 'GERUEST (kein package.json/Port)'
    : a.callback ? 'gebaut, mit /auth/callback'
    : 'gebaut, OHNE Callback-Route'
  console.log(`#   ${a.name.padEnd(12)} ${(a.domain ?? '(keine Domain)').padEnd(24)} ` +
    `${a.port ? 'Port ' + a.port : '        '}  ${zustand}`)
}
console.log('')

// Nur gebaute Apps MIT Callback-Route erzeugen einen Eintrag. Geruest und
// Landingpage nicht — sonst erwartete die Pruefung Adressen fuer etwas,
// das es nicht gibt, und waere dauerhaft rot.
const relevant = liste.filter(a => a.gebaut && a.callback)
const geplant = liste.filter(a => !a.gebaut && !a.landing)

if (geplant.length) {
  console.log('# Noch KEIN Eintrag — geplant, aber nicht gebaut:')
  for (const a of geplant) {
    console.log(`#   ${a.name.padEnd(12)} ${a.domain ?? '(Domain offen)'}`)
  }
  console.log('# Sobald eine davon package.json, Port und Callback-Route')
  console.log('# bekommt, erscheint sie hier von selbst.')
  console.log('')
}

if (!umg.existiert) {
  console.log('# ACHTUNG: Diese Umgebung existiert noch nicht.')
  console.log('# `main` entsteht erst mit Vercel. Die Adressen unten sind')
  console.log('# eine Vorschau — nichts davon ist heute einzutragen.')
  console.log('')
}

const sollUrls = relevant.map(a => umg.url(a))

if (umgebung === 'lokal') {
  console.log('# --- Fuer supabase/config.toml ---')
  console.log(`site_url = "${umg.siteUrl(liste)}"`)
  console.log('additional_redirect_urls = [')
  for (const u of sollUrls) console.log(`  "${u}",`)
  console.log(']')
} else {
  console.log('# --- Fuer das Cloud-Dashboard (Authentication > URL Configuration) ---')
  console.log('Site URL:')
  console.log('  ' + umg.siteUrl(liste))
  console.log('Redirect URLs:')
  for (const u of sollUrls) console.log('  ' + u)
  console.log('')
  console.log('# KEINE Vercel-Vorschauadressen eintragen.')
  console.log('# Vorschau-Deployments bekommen je eine eigene URL')
  console.log('# (<projekt>-<hash>.vercel.app). Ein Platzhalter `*.vercel.app`')
  console.log('# waere bequem und OEFFNET DIE LISTE FUER JEDES FREMDE')
  console.log('# VERCEL-PROJEKT — ein Angreifer legt dort ein Projekt an und')
  console.log('# faengt den Rueckweg ab. Wenn Vorschauen anmelden koennen')
  console.log('# muessen: je Adresse einzeln eintragen, nie mit Platzhalter.')
}

// --- Abgleich nur fuer die lokale Umgebung -----------------------------
// config.toml beschreibt die LOKALE Instanz. Gegen Cloud-Adressen
// verglichen ergaebe der Abgleich Unsinn.
if (umgebung !== 'lokal') {
  console.log('')
  console.log('# Kein Abgleich mit config.toml — die Datei beschreibt die')
  console.log('# LOKALE Instanz. Cloud-Werte stehen nur im Dashboard.')
  process.exit(0)
}

console.log('')
console.log('# --- Abgleich mit dem Ist-Zustand (lokal) ---')
const toml = fs.readFileSync(path.join(WURZEL, 'supabase/config.toml'), 'utf8')
const ist = toml.match(/^additional_redirect_urls\s*=\s*\[(.*?)\]/ms)
const istUrls = ist ? [...ist[1].matchAll(/"([^"]+)"/g)].map(m => m[1]) : []

const fehlend = sollUrls.filter(u => !istUrls.includes(u))
const ueberzaehlig = istUrls.filter(u => !sollUrls.includes(u))

console.log('# eingetragen  : ' + (istUrls.join(', ') || '(nichts)'))
console.log('# fehlt        : ' + (fehlend.join(', ') || '(nichts)'))
console.log('# ueberzaehlig : ' + (ueberzaehlig.join(', ') || '(nichts)'))

const istSite = toml.match(/^site_url\s*=\s*"([^"]+)"/m)?.[1] ?? null
const sollSite = umg.siteUrl(liste)
if (istSite !== sollSite) {
  console.log(`# site_url     : "${istSite}" statt "${sollSite}"`)
}

process.exit(fehlend.length || ueberzaehlig.length || istSite !== sollSite ? 1 : 0)
