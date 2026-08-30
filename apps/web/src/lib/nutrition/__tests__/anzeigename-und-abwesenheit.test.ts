// G-93 (Anzeigename im laufenden Dialog) und A-62 (Marken fuer
// Abwesenheiten).
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const lies = (f: string) => fs.readFileSync(path.join(process.cwd(), f), 'utf8')
const ohneKommentare = (f: string) => lies(f)
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

const DIALOG = 'src/app/v2/nutrition/mahlzeiten.tsx'

// ══ G-93 ═══════════════════════════════════════════════════════════
//
// **Tom, 2026-08-17:** *„richtige Begriffe wie weisser Reis anstatt
// Reis poliert."*
//
// `[cmd]` **Gemessen am 2026-08-30:** 5.014 von 7.140 Eintraegen
// tragen einen abweichenden `name_display_de`.
//
// `[read]` **Der Befund lag nicht dort, wo G-13 ihn suchte:** in
// `erfassen.tsx` war er behoben, **aber die Datei wird nicht
// ausgeliefert.** Ausgeliefert ist `mahlzeiten.tsx` (ansicht.tsx:49).

test('G-93: der laufende Dialog zeigt den Anzeigenamen', () => {
  const s = ohneKommentare(DIALOG)

  // `[read]` **Die Wirkung pruefen, nicht das Wort** — nicht "kommt
  // `name_display_de` vor", sondern: steht an der ANZEIGESTELLE der
  // Rueckfall? Ein blosses Vorkommen erfuellte auch ein Import.
  const treffer = /<span className="v2-wahl-titel">\{([^}]+)\}<\/span>/.exec(s)
  assert.ok(treffer, 'Die Trefferzeile wurde nicht gefunden (G-93).')
  assert.match(treffer[1], /name_display_de \|\| f\.name_de/,
    'Die Trefferliste zeigt den Rohnamen statt des Anzeigenamens (G-93).')

  // `[cmd]` **`v2-insight-title` kommt zweimal vor** — Zeile 204 traegt
  // eine Fehlermeldung, Zeile 773 den Namen. `[read]` **Die erste
  // Fassung nahm `exec` und traf die Fehlermeldung** — dieselbe Klasse
  // wie „im zu grossen Heuhaufen suchen". **Deshalb alle Vorkommen,
  // und eines muss den Namen zeigen.**
  const koepfe = Array.from(
    s.matchAll(/<div className="v2-insight-title">\{([^}]+)\}<\/div>/g))
  assert.ok(koepfe.length >= 1, 'Kein Auswahlkopf gefunden (G-93).')
  assert.ok(
    koepfe.some(m => /name_display_de \|\| gewaehlt\.name_de/.test(m[1])),
    'Kein Auswahlkopf zeigt den Anzeigenamen — nur der Rohname (G-93).')
})

test('G-93: das Suchfeld behaelt den Rohnamen', () => {
  // `[cmd]` **G-265, belegt in add-und-plaene.test.ts:38:**
  // `name_display_de` als Suchbegriff liefert **0 Treffer** — die
  // Klammerzusaetze stehen so nicht im Index.
  //
  // `[read]` **Deshalb ist hier der Rohname richtig.** Ein Waechter,
  // der ueberall `name_display_de` verlangt, wuerde die Suche
  // kaputtmachen — die Unterscheidung ist Anzeige gegen Suchbegriff.
  const s = ohneKommentare(DIALOG)
  assert.match(s, /setFrage\(f\.name_de\)/,
    'Das Suchfeld bekommt nicht mehr den Rohnamen — die Suche findet dann nichts (G-93/G-265).')
})

// ══ A-62 ═══════════════════════════════════════════════════════════
//
// `[read]` **Der Waechter selbst liegt in `tools/abwesenheit-pruefen.mjs`
// und laeuft im Gate.** Hier steht nur, dass es ihn gibt und dass er
// wirkt — sonst kann er still aus der Kette fallen.

test('A-62: der Abwesenheits-Waechter laeuft im Gate', () => {
  const pkg = JSON.parse(lies('../../package.json')) as {
    scripts?: Record<string, string>
  }
  assert.match(pkg.scripts?.gate ?? '',
    /(?<![a-z0-9_-])tools\/abwesenheit-pruefen\.mjs(?![a-z0-9_-])/,
    'abwesenheit-pruefen.mjs steht nicht mehr in der Gate-Kette (A-62).')
})

test('A-62: er faellt, wenn eine Abwesenheit endet', () => {
  // `[read]` **Die Wirkung messen, nicht die Datei lesen.** Eine
  // vorhandene, GETRACKTE Datei bekommt kurz eine Marke auf etwas, das
  // es nachweislich gibt — der Waechter muss fallen.
  //
  // `[cmd]` **Erst geprueft, dann so gebaut:** die erste Fassung legte
  // eine neue Datei an. Der Waechter liest ueber `git ls-files` und
  // **sieht Ungetracktes nicht** — er blieb gruen, und der Test haette
  // das fuer Erfolg gehalten. **Dieselbe Klasse wie die Sabotage aus
  // C-177, die den Code nie erreichte.**
  const wurzel = path.resolve(process.cwd(), '../..')
  const rel = 'apps/web/src/app/api/supplements/intake/route.ts'
  const voll = path.join(wurzel, rel)
  const vorher = fs.readFileSync(voll, 'utf8')
  assert.match(vorher, /@abwesend public\.user_inventory/,
    'Die Ankerdatei traegt die erwartete Marke nicht mehr (A-62).')
  try {
    fs.writeFileSync(voll,
      vorher.replace('@abwesend public.user_inventory',
        '@abwesend supplements.stack_items'), { encoding: 'utf8' })
    let fiel = false
    try {
      execFileSync('node', ['tools/abwesenheit-pruefen.mjs'],
        { cwd: wurzel, encoding: 'utf8', stdio: 'pipe' })
    } catch {
      fiel = true
    }
    assert.ok(fiel,
      'Der Waechter blieb gruen, obwohl supplements.stack_items existiert (A-62).')
  } finally {
    fs.writeFileSync(voll, vorher, { encoding: 'utf8' })
  }
  // Rueckbau belegen — ein Test, der die Datei veraendert zurueck-
  // laesst, waere schlimmer als kein Test.
  assert.equal(fs.readFileSync(voll, 'utf8'), vorher,
    'Die Ankerdatei kam nicht unveraendert zurueck (A-62).')
})
