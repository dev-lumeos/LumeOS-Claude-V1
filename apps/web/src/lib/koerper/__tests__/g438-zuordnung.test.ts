// G-438/A1 + A2 - Karte und Liste duerfen sich nicht widersprechen.
//
// **Tom:** *„das ist unlogisches ghetto. beispiel arms triceps ist
// orange, zeigt aber keine werte in der liste."*
//
// ══ DIE URSACHE, GEMESSEN ═══════════════════════════════════════
//
//     Karte faerbt   triceps-longum, -lateralis, -mediale
//                    -> die drei KOEPFE
//     Wert haengt an `Triceps` (dem ELTERNTEIL)
//     Uebersetzung   fehlt
//
// `[read]` **Diese Probe haelt fest, dass keine Flaeche gefaerbt
// ist, waehrend ihre Listenzeile leer bleibt.**
//
// `[cmd]` **Importieren statt Textsuche** — `RECOVERY_ZU_KARTE`
// und `KARTE_ZU_RECOVERY` werden zur Laufzeit gerechnet, ein Regex
// darueber liest Unsinn (die Lehre aus G-436).
import { test } from 'node:test'
import assert from 'node:assert/strict'

import { MUSCLE_STATE, MUSCLE_GROUPS_BODYMAP } from '../../../app/v2/recovery/motor'
import {
  RECOVERY_ZU_KARTE, KARTE_ZU_RECOVERY, flaechenFuer, alsErmuedung,
} from '../../../app/v2/recovery/muskel-zuordnung'
import { EBENEN } from '../ebenen'
import { SCHLUESSEL_ZU_GRUPPE, OHNE_GRUPPE } from '../schluessel-gruppe'

test('G-438/A1: jeder der 18 Schluessel ist zugeordnet oder gemeldet', () => {
  // `[read]` **Keine stille Luecke** — wer einen Schluessel
  // weglaesst, faellt hier auf.
  for (const slug of MUSCLE_GROUPS_BODYMAP) {
    const zugeordnet = slug in SCHLUESSEL_ZU_GRUPPE
    const gemeldet = OHNE_GRUPPE.some(m => m.slug === slug)
    assert.ok(zugeordnet !== gemeldet,
      `"${slug}" ist ${zugeordnet && gemeldet ? 'DOPPELT' : 'WEDER'} `
      + 'zugeordnet noch gemeldet. Jeder Schluessel gehoert in genau '
      + 'eine der beiden Listen.')
  }
  assert.equal(
    Object.keys(SCHLUESSEL_ZU_GRUPPE).length + OHNE_GRUPPE.length,
    MUSCLE_GROUPS_BODYMAP.length,
    'Die beiden Listen decken zusammen genau die 18 Schluessel.')
})

test('G-438/A1: jeder Gegenpart steht WIRKLICH in muscle_groups', () => {
  // ══ Gegen die gezeichneten Namen, nicht gegen eine Liste im Kopf
  //
  // `[read]` **`EBENEN` nennt je Flaeche den Muskel, den sie zeigt**
  // — jeder Gegenpart muss entweder dort vorkommen oder ein
  // Elternteil davon sein. `[cmd]` **Sonst waere es ein erfundener
  // Name** (das verbietet der Auftrag ausdruecklich).
  const gezeichnet = new Set(
    Object.values(EBENEN).map(e => e.name).filter(Boolean)
      .map(n => (n as string).toLowerCase()))
  const eltern = new Set(
    Object.values(EBENEN).flatMap(e => e.weg ?? []).map(w => w.toLowerCase()))
  // `[cmd]` **Auch die KINDER zaehlen** — die Flaeche `deltoids`
  // zeigt die Gruppe `Deltoids` und fuehrt `Front Shoulders` /
  // `Rear Deltoids` als ihre Kinder. `[read]` **Die beiden sind
  // benannt und bekannt, nur nicht einzeln gezeichnet** — ein
  // Waechter, der nur `name` und `weg` liest, haelt sie faelschlich
  // fuer erfunden.
  const kinder = new Set(
    Object.values(EBENEN).flatMap(e => e.kinder ?? []).map(k => k.toLowerCase()))

  for (const [slug, gruppe] of Object.entries(SCHLUESSEL_ZU_GRUPPE)) {
    const g = gruppe.toLowerCase()
    assert.ok(gezeichnet.has(g) || eltern.has(g) || kinder.has(g),
      `"${slug}" -> "${gruppe}": dieser Name kommt weder als `
      + 'gezeichneter Muskel noch als Elternteil in `ebenen.ts` vor. '
      + 'Erfunden? Dann gehoert er in OHNE_GRUPPE.')
  }
})

test('G-438/A2: keine Flaeche ist gefaerbt und in der Liste leer', () => {
  // ══ DER KERN DES AUFTRAGS ═════════════════════════════════════
  //
  // **Tom:** *„triceps ist orange, zeigt aber keine werte."*
  //
  // `[cmd]` **Gemessen an ALLEN Flaechen, die ein Kuerzel faerbt** —
  // nicht an einer Stichprobe.
  const werte = Object.fromEntries(MUSCLE_GROUPS_BODYMAP.map(s => [s, 50]))
  const gefaerbt = alsErmuedung(werte).map(e => e.id)
  assert.ok(gefaerbt.length > 0, 'Es wird ueberhaupt nichts gefaerbt.')

  const stumm: string[] = []
  for (const code of gefaerbt) {
    const name = EBENEN[code]?.name
    if (!name) continue // nicht gezeichnet — kein Widerspruch
    // Bekommt dieser Muskel in der Liste einen Wert?
    const slug = KARTE_ZU_RECOVERY[code]
    const eigener = slug ? MUSCLE_STATE[slug] : null
    // Oder erbt er sichtbar von seiner Gruppe?
    const vonGruppe = SCHLUESSEL_ZU_GRUPPE[slug ?? '']
    if (!eigener && !vonGruppe) stumm.push(`${code} (${name})`)
  }

  assert.deepEqual(stumm, [],
    `Diese Flaechen sind gefaerbt, aber ihre Listenzeile bleibt `
    + `leer:\n    ${stumm.join('\n    ')}\n`
    + 'Genau das war Toms Befund: orange auf der Karte, „--" in '
    + 'der Liste. Entweder die Liste nennt die Herkunft des Werts, '
    + 'oder die Karte faerbt nicht.')
})

test('G-438: der Wert wird NICHT nach unten vererbt', () => {
  // ══ Die Gegenrichtung ═════════════════════════════════════════
  //
  // `[cmd]` **Der Auftrag verbietet es ausdruecklich:** *„KEINEN
  // Wert nach unten vererben."*
  //
  // `[read]` **Die Zuordnung sagt nur, WOHER ein Wert kaeme** — sie
  // schreibt ihn nicht in den Knoten. **Ein Kopf ohne eigene
  // Messung hat weiter keinen eigenen Wert.**
  for (const gruppe of Object.values(SCHLUESSEL_ZU_GRUPPE)) {
    assert.ok(!(gruppe in MUSCLE_STATE),
      `"${gruppe}" ist als Gruppenname zugleich ein Schluessel in `
      + 'MUSCLE_STATE — dann waere unklar, ob der Wert gemessen '
      + 'oder geerbt ist.')
  }
})

test('G-438/A2: die neun C-482-Namen stehen in ebenen.ts', () => {
  // ══ Der blinde Fleck, den die Gegenprobe fand ═════════════════
  //
  // `[cmd]` **Die Sabotage „`triceps-longum` faellt auf `name:
  // null` zurueck" blieb GRUEN** — die A2-Probe haelt eine Flaeche
  // ohne Namen fuer „nicht gezeichnet", also fuer keinen
  // Widerspruch.
  //
  // `[read]` **Genau so entstand Toms Befund:** die Flaeche ist
  // gefaerbt, traegt aber keinen Namen, also keine Listenzeile —
  // **orange auf der Karte, gar nichts in der Liste.**
  //
  // `[cmd]` **C-482 hat diese neun Namen geliefert** (gemessen
  // `tools/_g438-zuordnung.mjs`, 2026-09-12). **Wer sie wieder auf
  // `null` setzt, baut den Widerspruch zurueck.**
  const NEUN: Record<string, string> = {
    'triceps-longum': 'Triceps Brachii Long Head',
    'triceps-lateralis': 'Triceps Brachii Lateral Head',
    'triceps-mediale': 'Triceps Brachii Medial Head',
    'vastus-lateralis': 'Vastus Lateralis',
    'vastus-medialis': 'Vastus Medialis',
    'gastrocnemius-lateralis': 'Gastrocnemius Lateral Head',
    'gastrocnemius-medialis': 'Gastrocnemius Medial Head',
    'serratus-anterior': 'Serratus Anterior',
    'external-oblique': 'External Oblique',
  }
  for (const [code, name] of Object.entries(NEUN)) {
    assert.equal(EBENEN[code]?.name, name,
      `"${code}" traegt nicht mehr den Namen "${name}". `
      + 'C-482 hat ihn geliefert — faellt er auf `null` zurueck, ist '
      + 'die Flaeche gefaerbt und hat KEINE Listenzeile. Das war '
      + 'Toms Befund.')
    // `[read]` **Und der Weg muss dazu passen** — sonst steht der
    // Name ohne Ort im Baum.
    assert.ok((EBENEN[code]?.weg ?? []).length >= 2,
      `"${code}" hat einen Namen, aber keinen Weg.`)
  }
})

test('G-438: die Meldungen nennen ihren Grund', () => {
  // `[read]` **Eine Meldung ohne Grund ist eine Luecke mit Etikett.**
  for (const m of OHNE_GRUPPE) {
    assert.ok(m.grund && m.grund.length > 20,
      `"${m.slug}" ist gemeldet, aber ohne brauchbaren Grund.`)
    assert.ok(MUSCLE_GROUPS_BODYMAP.includes(m.slug as never),
      `"${m.slug}" ist gar kein motor.ts-Schluessel.`)
  }
})

test('G-438: flaechenFuer und die Zuordnung widersprechen sich nicht', () => {
  // `[read]` **Beide Richtungen** — ein Schluessel mit Gruppe muss
  // auch Flaechen faerben, sonst ist die Zuordnung folgenlos.
  for (const slug of Object.keys(SCHLUESSEL_ZU_GRUPPE)) {
    assert.ok(flaechenFuer(slug).length > 0,
      `"${slug}" hat einen Gruppen-Gegenpart, faerbt aber keine `
      + 'Flaeche — dann ist die Zuordnung wirkungslos.')
    assert.ok(slug in RECOVERY_ZU_KARTE,
      `"${slug}" steht nicht in RECOVERY_ZU_KARTE.`)
  }
})
