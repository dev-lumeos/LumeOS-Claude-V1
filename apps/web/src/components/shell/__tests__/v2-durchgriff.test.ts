// G-01: Zwei Zusagen dieses Auftrags, ausfuehrbar festgehalten.
//
//   1. Der /v2-Durchgriff in AppShell trifft KEINE bestehende Route.
//      Das ist die eigentliche Pruefung: die Parallelstruktur ist nur
//      dann eine, wenn die alte Oberflaeche unveraendert bleibt.
//   2. Das v2-Stylesheet definiert KEINE Tokens und traegt jede Klasse
//      unter dem Praefix. Ohne das koennte es bestehende Seiten treffen.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'

// ---------------------------------------------------------------
// 1. Der Durchgriff
// ---------------------------------------------------------------

// Die Bedingung wird aus app-shell.tsx GELESEN, nicht abgeschrieben.
// Eine Kopie wuerde auseinanderlaufen, sobald jemand die Quelle aendert
// — und der Test bestaetigte dann eine Bedingung, die es nicht mehr gibt.
const SHELL = readFileSync(
  path.join(process.cwd(), 'src', 'components', 'shell', 'app-shell.tsx'),
  'utf8')

test('der Durchgriff steht ueberhaupt noch in app-shell.tsx', () => {
  assert.match(SHELL, /pathname === '\/v2' \|\| pathname\.startsWith\('\/v2\/'\)/,
    'Die v2-Bedingung fehlt oder wurde umformuliert — dieser Test prueft sie ' +
    'dann nicht mehr. Bedingung und Test gemeinsam anpassen.')
})

/** Wortgleich mit der oben geprueften Bedingung. */
function istV2(pathname: string): boolean {
  return pathname === '/v2' || pathname.startsWith('/v2/')
}

// Die bestehenden Modul- und Systemrouten, dazu die Unterseiten, die es
// [cmd] heute wirklich gibt (aus der Build-Routenliste).
const BESTAND = [
  '/',
  '/dashboard',
  '/nutrition',
  '/nutrition/foods',
  '/nutrition/preferences',
  '/nutrition/local-schema',
  '/training',
  '/recovery',
  '/supplements',
  '/goals',
  '/medical',
  '/coach',
  '/settings',
  '/login',
  '/auth/callback',
]

test('keine bestehende Route faellt in den v2-Durchgriff', () => {
  for (const p of BESTAND) {
    assert.equal(istV2(p), false, `${p} wuerde die alte Huelle verlieren`)
  }
})

test('/v2 und seine Unterseiten greifen durch', () => {
  assert.equal(istV2('/v2'), true)
  assert.equal(istV2('/v2/'), true)
  assert.equal(istV2('/v2/nutrition'), true)
  assert.equal(istV2('/v2/nutrition/foods'), true)
})

// Der Fehler, den ein blosses startsWith('/v2') machen wuerde: eine
// spaetere Route /v2beta oder /v2-alt bekaeme den Durchgriff, ohne dass
// es jemand merkt.
test('aehnlich benannte Routen greifen NICHT durch', () => {
  assert.equal(istV2('/v2beta'), false)
  assert.equal(istV2('/v2-alt'), false)
  assert.equal(istV2('/v20'), false)
  assert.equal(istV2('/nutrition/v2'), false)
})

// ---------------------------------------------------------------
// 2. Das Stylesheet
// ---------------------------------------------------------------

const V2CSS = readFileSync(
  path.join(process.cwd(), '..', '..', 'packages', 'ui', 'src', 'styles', 'v2.css'),
  'utf8')

test('v2.css definiert keine Tokens', () => {
  // Eine Tokendefinition am Zeilenanfang ("  --bg: ..."). Verweise
  // (var(--bg)) sind erwuenscht und werden nicht getroffen.
  const definitionen = V2CSS.match(/^\s*--[a-z][\w-]*\s*:/gm) ?? []
  assert.deepEqual(definitionen, [],
    'v2.css darf keine Tokens definieren — sie stehen in ' +
    'src/styles/themes/lume.css und sind dort im Hellmodus repariert ' +
    '(--pos/--warn/--neg, d19e651). Eine Kopie hier holte den Fehler zurueck.')
})

test('v2.css nutzt die geteilten Tokens', () => {
  const verweise = (V2CSS.match(/var\(--/g) ?? []).length
  assert.ok(verweise > 100,
    `nur ${verweise} Tokenverweise — sitzt das Stylesheet noch auf der ` +
    'geteilten Tokenschicht?')
})

test('jede Klasse in v2.css traegt das Praefix', () => {
  // Kommentare und URLs zuerst entfernen: der Kopf dieser Datei NENNT
  // die Klassennamen des Entwurfs (.card, .sidebar …), und ein
  // @import-URL enthaelt Punkte. Beides sind keine Selektoren.
  const nurCode = V2CSS
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/url\([^)]*\)/g, '')
    .replace(/@import[^;]*;/g, '')
  // Nur Selektoren betrachten, nicht Deklarationen.
  // Bewusst ohne Spread ueber Iteratoren: das tsconfig-Ziel der App ist
  // es5, dort braeuchte das --downlevelIteration.
  const selektoren: string[] = []
  nurCode.replace(/(^|\})([^{}]*)\{/g, (_m, _a, sel: string) => {
    selektoren.push(sel)
    return ''
  })
  const ohnePraefix: string[] = []
  selektoren.join(',').replace(/\.(-?[_a-zA-Z][\w-]*)/g, (_m, name: string) => {
    if (!name.startsWith('v2-') && ohnePraefix.indexOf(name) === -1) {
      ohnePraefix.push(name)
    }
    return ''
  })
  assert.deepEqual(ohnePraefix, [],
    'Klassen ohne Praefix koennen bestehende Seiten treffen')
})

test('v2.css laedt nichts von fremden Hosts', () => {
  // Ohne Kommentare: der Kopf der Datei ERWAEHNT den entfernten Import.
  const nurCode = V2CSS.replace(/\/\*[\s\S]*?\*\//g, '')
  assert.deepEqual(nurCode.match(/@import/g) ?? [], [],
    'Der Entwurf laedt Schriften von fonts.googleapis.com. apps/web tut ' +
    'das [cmd] nicht — ein Import hier brauchte eine Abhaengigkeit zu ' +
    'einem fremden Host im kritischen Pfad auf.')
})

test('v2.css bringt keine Hex-Farben mit', () => {
  assert.deepEqual(V2CSS.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [], [],
    'Hex-Farben umgehen die Tokenschicht und kennen keinen Hellmodus')
})

// [cmd] Der Entwurf trug fuenf rgba()-Werte. In G-02 ist einer auf
// einen Token gefallen: rgba(255,255,255,0.75) auf .v2-mh-stat stand
// unter [data-theme="light"] fuer "helle Flaeche" — dafuer gibt es
// --surface (im Hellmodus oklch(1 0 0), also genau Weiss).
//
// Die restlichen VIER bleiben, und zwar mit Absicht: drei Schatten
// (0,03 / 0,05 Schwarz) und der Modal-Schleier (0,5 Schwarz). Fuer
// beides gibt es [cmd] keinen Token — die 32 kennen weder Schatten
// noch Ueberlagerung. Einen zu erfinden waere eine Token-Entscheidung,
// und die gehoert Tom, nicht diesem Auftrag.
// Der Test friert die Zahl ein, damit nicht unbemerkt weitere dazukommen.
test('v2.css bringt keine NEUEN rgba-Werte mit', () => {
  const treffer = V2CSS.match(/rgba?\(/g) ?? []
  assert.equal(treffer.length, 4,
    `${treffer.length} rgba()-Werte statt der erwarteten 4 (drei Schatten, ` +
    'ein Modal-Schleier). Neue Festfarben gehoeren nicht hinzu; wo ein ' +
    'Token passt, gehoert er benutzt.')
})

test('die helle Flaeche laeuft ueber einen Token', () => {
  assert.match(V2CSS, /\.v2-mh-stat\s*\{\s*background:\s*var\(--surface\)/,
    'Die Ersetzung von rgba(255,255,255,0.75) durch var(--surface) fehlt — ' +
    'sonst bricht die Flaeche, sobald ein helles Thema nicht weiss ist.')
})
