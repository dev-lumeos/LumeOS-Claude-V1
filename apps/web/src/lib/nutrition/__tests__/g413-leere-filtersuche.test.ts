// G-413 — die reine Filtersuche und der Grund fuer eine Null.
//
// **Tom, 2026-09-08:** *„food db zeigt nichts mehr an, wenn nichts in
// der suche ist … sprich: reine filtersuche geht nicht."*
//
// ══ WAS GEMESSEN WURDE ═════════════════════════════════════════════
//
// `[cmd]` **Die Filtersuche GEHT** — am Schirm, alle vier Faelle des
// Auftrags zeigen Treffer:
//
//     leer oeffnen        50 Zeilen, total 1.294
//     Kategorie „Produce" 50 Zeilen, total   694
//     Tag „Vegan"         50 Zeilen, total 1.294
//     Wort und geloescht  50 -> 9 -> 50
//
// `[cmd]` **`dev@lumeos.app` steht auf `diet_type = 'vegan'`**
// (`nutrition.food_preferences`). **Damit ist die Null bei „Meat"
// richtig:**
//
//     Kategorie              ohne Vorlieben   mit Vorlieben
//     fleisch-gefluegel            1.449             0
//     fisch-meeresfruechte           520             0
//     milch-kaese                    279             0
//     gemuese                        717           694
//
// `[read]` **Der Fehler war der SATZ, nicht die Zahl.** *„Kein
// Lebensmittel passt zu dieser Auswahl"* zeigt auf die Auswahl — also
// aendert man die Auswahl, und es aendert sich nichts.
//
// `[cmd]` **Die Zahl lag bereit:** `preferences_hidden` wird seit C-94
// berechnet und kam im Browser an (1.449), **ohne dass sie jemand
// gelesen hat.**
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { LEER_SATZ, vorliebenLeerSatz } from '../herkunft-filter'

const HIER = dirname(fileURLToPath(import.meta.url))
const WEB = join(HIER, '..', '..', '..')
const NUT = join(WEB, 'app', 'v2', 'nutrition')

const ohneKommentar = (p: string) => readFileSync(p, 'utf8').split('\n')
  .filter(z => !z.trim().startsWith('//') && !z.trim().startsWith('*'))
  .join('\n')

test('der Satz nennt die Zahl der verborgenen Treffer', () => {
  // `[read]` **Die Wirkung aufrufen, nicht den Quelltext durchsuchen.**
  const satz = vorliebenLeerSatz(1449)
  assert.ok(satz, 'Bei 1.449 verborgenen Treffern muss ein Satz kommen')
  assert.match(satz, /1\.449/, 'Der Satz nennt die Zahl nicht')
  // `[read]` **Und WO sie sich aendern laesst** — sonst weiss der
  // Nutzer zwar den Grund, aber nicht, was er tun kann.
  assert.match(satz, /Preferences/,
    'Der Satz sagt nicht, wo die Vorlieben gepflegt werden')
})

test('ohne verborgene Treffer gibt es KEINEN Vorliebensatz', () => {
  // `[read]` **Die wichtigste Haelfte.** `[cmd]` **Verbergen die
  // Vorlieben nichts, ist die Auswahl wirklich leer** — ein Hinweis
  // auf Vorlieben waere dort eine Falschaussage, und der Nutzer
  // suchte an der falschen Stelle.
  assert.equal(vorliebenLeerSatz(0), null)
  assert.equal(vorliebenLeerSatz(null), null)
  assert.equal(vorliebenLeerSatz(undefined), null)
  // `[cmd]` **`preferences_hidden` ist `null`, wenn die Trefferzahl
  // ueber der Schwelle liegt** (`food-search.ts`, HINWEIS_SCHWELLE) —
  // auch dann darf nichts behauptet werden.
  assert.equal(vorliebenLeerSatz(-1), null)
})

test('die Kachel liest preferences_hidden auch wirklich', () => {
  // `[cmd]` **Der Wert kam seit C-94 im Browser an und wurde NICHT
  // gelesen** — gemessen: `VERBORGEN=1449`, Meldung trotzdem
  // *„Kein Lebensmittel passt zu dieser Auswahl."*
  //
  // `[read]` **Eine berechnete Zahl ohne Verbraucher ist wie eine
  // fehlende** — nur teurer, weil sie einen zweiten Aufruf kostet.
  const t = ohneKommentar(join(NUT, 'tab-foods.tsx'))
  assert.match(t, /vorliebenLeerSatz\(payload\?\.preferences_hidden\)/,
    'Die Kachel fragt die verborgenen Treffer nicht ab')
  // `[read]` **Und der allgemeine Satz bleibt der Rueckfall** — er
  // ist richtig, wenn die Auswahl wirklich leer ist.
  assert.match(t, /Kein Lebensmittel passt zu dieser Auswahl/,
    'Der allgemeine Leersatz ist verschwunden')
})

test('die drei Leerfaelle sagen VERSCHIEDENE Dinge', () => {
  // `[read]` **G-251: „leer ist nicht gleich leer."** `[cmd]`
  // **G-413 fuegt den dritten Fall hinzu.** `[read]` **Saehen zwei
  // gleich aus, traegt einer nichts bei.**
  const saetze = [
    LEER_SATZ.bevorzugt,
    LEER_SATZ.eigene,
    vorliebenLeerSatz(1449) ?? '',
    'Kein Lebensmittel passt zu dieser Auswahl.',
  ]
  assert.equal(new Set(saetze).size, 4,
    'Zwei der vier Leersaetze sind gleich — dann erklaert einer nichts')
  // Jeder nennt seinen eigenen Grund.
  assert.match(LEER_SATZ.eigene, /eigene/i)
  assert.match(LEER_SATZ.bevorzugt, /bevorzugt/i)
  assert.match(saetze[2], /vorlieb/i)
})

test('der Effekt laedt bei Kategorie und Tag neu', () => {
  // `[cmd]` **Der Auftrag verdaechtigte `ersterLauf`** — gemessen:
  // **`kategorie` und `tags` STEHEN in der Abhaengigkeitsliste**, und
  // am Schirm feuert die Abfrage (`&category=fleisch-gefluegel`).
  //
  // `[read]` **Der Waechter haelt das fest** — faellt eine der beiden
  // heraus, greift der Filter nur noch auf der geladenen Seite, und
  // `total` waere gelogen (die Lehre aus G-133 und G-251).
  const t = ohneKommentar(join(NUT, 'tab-foods.tsx'))
  const liste = t.match(/\}, \[suche, kategorie, tags, seite, sortierung, ohne, herkunft\]\)/)
  assert.ok(liste,
    'Die Abhaengigkeiten der Suche haben sich geaendert — greift der '
    + 'Filter noch auf die Datenbank?')
  // `[cmd]` **Und die Filter gehen an die ANFRAGE, nicht an eine
  // Auswahl auf der Seite.**
  assert.match(t, /params\.set\('category', kategorie\)/)
  assert.match(t, /params\.set\('tags'/)
})
