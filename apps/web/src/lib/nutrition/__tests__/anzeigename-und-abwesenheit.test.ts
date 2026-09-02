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

// G-331: die Trefferliste stand in `mahlzeiten.tsx` (`HinzufuegenModal`).
// Seit dem Umbau steht sie im geteilten Modal; `DIALOG` ist entfallen.
const MODAL = 'src/app/v2/nutrition/food-such-modal.tsx'

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
  // ══ BERICHTIGT IN G-331 ═════════════════════════
  //
  // `[cmd]` **Hier wurde `mahlzeiten.tsx` geprueft** — dort stand
  // `HinzufuegenModal` mit eigener Trefferliste.
  //
  // `[cmd]` **G-331 hat sie entfernt** (380 Zeilen, sechs von acht
  // Lehren fehlten) — **das Tagebuch ruft jetzt `FoodSuchModal`.**
  //
  // `[read]` **Was G-93 sichert, gilt unveraendert:** die Anzeige
  // zeigt `name_display_de`, **weil 5.014 von 7.140 Eintraegen einen
  // abweichenden tragen.** Nur die Datei hat gewechselt.
  const s = ohneKommentare(MODAL)

  // `[read]` **Die Wirkung, nicht das Wort** — an der ANZEIGESTELLE
  // muss der Rueckfall stehen. **Ein blosses Vorkommen erfuellte auch
  // ein Import.**
  const zeile = /\{f\.name_display_de \|\| f\.name_de\}/.exec(s)
  assert.ok(zeile, 'Die Trefferliste zeigt den Anzeigenamen nicht (G-93).')

  // Und der Kopf des gewaehlten Lebensmittels ebenso.
  assert.match(s, /\{gewaehlt\.name_display_de \|\| gewaehlt\.name_de\}/,
    'Der Auswahlkopf zeigt den Rohnamen statt des Anzeigenamens (G-93).')
})

test('G-93/G-265: der Anzeigename wird nicht zum Suchbegriff', () => {
  // `[cmd]` **G-265, belegt in add-und-plaene.test.ts:38:**
  // `name_display_de` als Suchbegriff liefert **0 Treffer** — die
  // Klammerzusaetze stehen so nicht im Index.
  //
  // ══ BERICHTIGT IN G-331 ═════════════════════════
  //
  // `[cmd]` **Hier stand `setFrage(f.name_de)`** — das alte Modal
  // schrieb den Namen ins Suchfeld zurueck, und der Waechter sicherte,
  // dass es der ROHNAME war.
  //
  // `[cmd]` **`FoodSuchModal` schreibt gar nichts zurueck** — die
  // Auswahl wechselt in den Mengenschritt, das Suchfeld bleibt
  // unberuehrt.
  //
  // `[read]` **Damit ist die Gefahr weg, nicht nur behoben:** ohne
  // Rueckschreiben kann kein Anzeigename zum Suchbegriff werden.
  // **Der Waechter prueft jetzt die Abwesenheit.**
  const s = ohneKommentare(MODAL)
  assert.doesNotMatch(s, /setLage\([^)]*suche: (f|gewaehlt)\.name/,
    'Das Modal schreibt einen Namen ins Suchfeld — mit dem '
    + 'Anzeigenamen faende die naechste Suche 0 Treffer (G-265).')
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
