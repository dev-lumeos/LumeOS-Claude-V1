// Der Preferences-Tab: die Entscheidungen von G-65, festgehalten.
//
// `[read]` Warum als Quelltextpruefung und nicht als Rechnung: der Tab
// hat keine eigene Rechenlogik — er liest `food_preferences_read` und
// schreibt `food_preferences_write`. Was hier schiefgehen kann, sind
// **Entscheidungen**, die beim naechsten Auftrag stillschweigend
// zurueckgedreht werden.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const TAB = path.join(process.cwd(), 'src/app/v2/nutrition/tab-vorlieben.tsx')
const LESEN = path.join(process.cwd(), 'src/lib/nutrition/vorlieben-lesen.ts')
const AKTION = path.join(process.cwd(), 'src/app/v2/nutrition/vorlieben-aktionen.ts')

const ohneKommentar = (s: string) => s
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n').filter(z => !/^\s*(\/\/|\*)/.test(z)).join('\n')

test('die Allergiekachel fuehrt 20 Eintraege in drei Stufen', () => {
  // `[read]` Mit Tom entschieden: das Mockup zeigt 14 Pillen mit
  // an/aus, die Datenbank trennt aber `allergies[]` und
  // `intolerances[]`. **Mit An/Aus waere die halbe Spalte nicht
  // bedienbar** und die Laktose-Testdaten unsichtbar.
  const q = fs.readFileSync(TAB, 'utf8')
  const liste = /const ALLERGENE[\s\S]*?\n\]/.exec(q)
  assert.ok(liste, 'ALLERGENE nicht gefunden.')
  const eintraege = (liste![0].match(/\{ id: '/g) ?? []).length
  assert.equal(eintraege, 20, `ALLERGENE hat ${eintraege} Eintraege, erwartet 20.`)

  // `[read]` Milcheiweiss und Laktose stehen getrennt — eine
  // Kuhmilchallergie richtet sich gegen das Eiweiss, eine
  // Laktoseintoleranz gegen den Zucker. Fachwissen, keine Liste.
  assert.ok(/id: 'milk_protein'/.test(liste![0]), 'Milcheiweiss fehlt.')
  assert.ok(/id: 'lactose'/.test(liste![0]), 'Laktose fehlt.')

  // Die drei Stufen und ihr Rundlauf.
  assert.ok(/'neutral' \| 'sensibel' \| 'allergie'/.test(q), 'Die drei Stufen fehlen.')
  const weiter = /const allergenWeiter[\s\S]*?\n  \}/.exec(q)
  assert.ok(weiter, 'allergenWeiter nicht gefunden.')
  assert.ok(/intolerances/.test(weiter![0]) && /allergies/.test(weiter![0]),
    'Der Rundlauf fasst nur eine der beiden Spalten an.')
})

test('gesetzte Unterkategorien bleiben sichtbar', () => {
  // `[cmd]` **Der Fall, der es noetig macht:** die Testdaten setzen
  // „Kekse & Plätzchen" — ein Enkel von „SÜSSES & SNACKS". Die Kachel
  // zeigt die 13 Wurzeln; ohne diese Zeile waere die Vorliebe
  // unsichtbar und wuerde beim naechsten Speichern **still
  // geloescht**, weil `food_preferences_write` die Items ersetzt.
  const q = fs.readFileSync(TAB, 'utf8')
  assert.ok(/const tiefeKategorien/.test(q),
    'Gesetzte Unterkategorien werden nicht herausgefiltert.')
  assert.ok(/!wurzelIds\.has\(i\.category_id\)/.test(q),
    'Die Abgrenzung gegen die Wurzeln fehlt.')
})

test('die Vorlieben werden immer vollstaendig geschrieben', () => {
  // `[cmd]` `food_preferences_write` **ersetzt** die Items atomar. Wer
  // nur die Aenderung schickt, loescht den Rest — deshalb haelt der Tab
  // den ganzen Stand und sendet ihn als Ganzes.
  const a = fs.readFileSync(AKTION, 'utf8')
  assert.ok(/food_preferences_write/.test(a), 'Die Schreibfunktion wird nicht benutzt.')
  // Kein direkter Tabellenzugriff daneben — sonst gaebe es zwei Wege
  // zu denselben Zeilen.
  const ohne = ohneKommentar(a)
  for (const weg of [/\.from\('food_preference_items'\)/, /\.from\('food_preferences'\)/]) {
    assert.ok(!weg.test(ohne),
      `${weg.source}: zweiter Schreibweg neben der Funktion.`)
  }

  const tab = fs.readFileSync(TAB, 'utf8')
  assert.ok(/speichern\(naechsterGrund, naechsteItems\)|speichern\(g, naechste\)/.test(tab),
    'Es wird nicht der ganze Stand geschickt.')
})

test('der Lesepfad baut die Funktion nicht nach', () => {
  // `[read]` `food_preferences_read` gibt es seit C-87 und liefert die
  // Beschriftungen mit. Eine zweite Leseroutine waere eine zweite
  // Wahrheit.
  const l = fs.readFileSync(LESEN, 'utf8')
  assert.ok(/food_preferences_read/.test(l), 'Die Lesefunktion wird nicht benutzt.')
  const ohne = ohneKommentar(l)
  assert.ok(!/\.from\('food_preference_items'\)/.test(ohne),
    'Die Items werden an der Funktion vorbei gelesen.')
})

test('die Rangfolge verspricht keine Wirkung, die es nicht gibt', () => {
  // `[cmd]` `nutrition.food_search` hat **keinen Nutzerparameter** —
  // die Rangfolge ist gespeichert, wirkt aber nicht. Das muss in der
  // Kachel stehen, sonst verspricht sie etwas.
  const q = fs.readFileSync(TAB, 'utf8')
  assert.ok(/wirkt aber noch nicht in/.test(q),
    'Die Kachel sagt nicht, dass die Rangfolge noch nicht wirkt.')
})

test('der Schlachtungs-Vorbehalt steht in der Anzeige', () => {
  // `[read]` Der Auftrag: „Echtes Halal und Koscher haengen an der
  // Schlachtung, die BLS-Daten kennen sie nicht. Das Preset schliesst
  // die Zutat aus, es prueft keine Zubereitung."
  const q = fs.readFileSync(TAB, 'utf8')
  assert.ok(/Schlachtung/.test(q), 'Der Vorbehalt fehlt.')
  assert.ok(/Zubereitung wird nicht gepr/.test(q),
    'Es steht nicht da, dass die Zubereitung ungeprueft bleibt.')
})

test('die Ausschlusskachel erfindet keinen Katalog', () => {
  // `[read]` Mit Tom entschieden: **kein fest verdrahteter Preset-Satz.**
  // `[cmd]` C-93 ist waehrend G-65 fertig geworden — die Presets kommen
  // aus `nutrition.exclusion_presets`, nicht aus dem Code.
  const q = fs.readFileSync(TAB, 'utf8')
  assert.ok(/general_exclusions/.test(q), 'Die Kachel liest die Spalte nicht.')
  assert.ok(/d\.presets/.test(q), 'Die Presets kommen nicht aus dem Katalog.')
  // Keine erfundene Presetliste im Code — weder die acht des
  // Vorgaengers noch die elf von C-93.
  assert.ok(!/no_organ_meat|no_processed_meat|no_red_meat/.test(q),
    'Die acht Presets des Vorgaengers sind fest verdrahtet.')
  const ohne = ohneKommentar(q)
  assert.ok(!/'no_offal'|'no_lamb'|'halal'.*'kosher'.*'no_beef'/.test(ohne),
    'Die Presets von C-93 sind fest verdrahtet statt gelesen.')

  // Der Leerzustand bleibt als Rueckfall, ohne Punktnummer in der
  // Anzeige — der Nutzer liest keine TODO-Liste.
  assert.ok(/werden gerade erstellt/.test(q), 'Der Rueckfall-Hinweis fehlt.')
  assert.ok(!/C-93/.test(ohne), 'Die Punktnummer steht in der Anzeige.')

  // Der Vorbehalt je Preset kommt aus der Spalte, nicht aus dem Code.
  assert.ok(/caveat_de/.test(q), 'Der Vorbehalt wird nicht aus caveat_de gelesen.')

  // Und gesetzte Codes ohne Katalogeintrag verschwinden nicht:
  // `ultra_processed` der Testdaten ist kein Preset.
  assert.ok(/ausschluesseOhnePreset/.test(q),
    'Gesetzte Codes ohne Preset wuerden unsichtbar.')
})

test('die angebundene Kachel traegt keine Attrappenmarke', () => {
  const q = fs.readFileSync(TAB, 'utf8')
  assert.ok((q.match(/<Card\b/g) ?? []).length >= 6, 'Weniger als sechs Karten.')
  assert.ok(!/attrappe=/.test(q),
    'tab-vorlieben.tsx traegt eine Marke, liest aber echte Daten.')
})
