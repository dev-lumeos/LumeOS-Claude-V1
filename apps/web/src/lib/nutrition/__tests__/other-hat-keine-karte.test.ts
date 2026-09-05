/**
 * G-351 — `other` hat keine Karte
 *
 * `[cmd]` **Gemessen am 2026-09-05, was `other` ueberhaupt erzeugt:**
 *
 *     Quick-Add          NEIN  - waehlt `meal_id`, eine Zeile
 *     freies Formular    JA    - `kat:other` steht in der Auswahl
 *     ErfassenModal      JA    - `kategorieAuswahl()`
 *     Rezept-Formular    JA    - `kategorieAuswahl()`
 *     rasterQuelle       JA    - `ordnung[i] ?? 'other'`
 *
 * `[read]` **Die letzte ist die schlimmste** — **sie ist keine Wahl.**
 * **Wer fuenf Slots hat und vier benutzte Kategorien, bekommt eine
 * Zeile `other`, ohne sie zu waehlen.**
 *
 * `[cmd]` **Und `dev@lumeos.app` hat genau diesen Fall:** **fuenf
 * `meal_slots`, ein Plan mit fuenf `meal_plan_slots`.**
 *
 * `[read]` **Die Zusage dieser Datei: `other` entsteht nirgends mehr.**
 * **Weder gewaehlt noch gerechnet.**
 *
 * `[read]` **Warum nicht die Sammelreihe (E-63):** eine Karte
 * *Sonstiges* ist die Aussage *,,wir wissen nicht, wohin damit"*.
 * **Der Slot ist die Ordnung (E-58), und es gibt keine Obergrenze** —
 * wer keinen passenden hat, legt einen an.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { kategorieAuswahl, rasterQuelle, KATEGORIE_TEXT } from '../slots-lage'

// `[read]` **Der Pfad kommt aus der Datei, nicht aus `cwd`** — sonst
// ist die Probe aus der Wurzel gruen und faellt im Gate.
const HIER = dirname(fileURLToPath(import.meta.url))
const WURZEL = join(HIER, '..', '..', '..', '..', '..', '..')
const V2 = join(WURZEL, 'apps', 'web', 'src', 'app', 'v2', 'nutrition')

const lies = (p: string) => readFileSync(p, 'utf8')

describe('G-351 — `other` wird nirgends gesetzt', () => {
  it('die Wurzelmarke stimmt — sonst misst der Rest nichts', () => {
    assert.ok(
      lies(join(V2, 'mahlzeiten.tsx')).length > 1000,
      'mahlzeiten.tsx nicht gefunden — der Pfad stimmt nicht',
    )
  })

  // ── 1 · Die Auswahl bietet es nicht mehr an ──────────────────────
  it('kategorieAuswahl fuehrt `other` nicht', () => {
    const codes = kategorieAuswahl().map(k => k.code)
    assert.ok(codes.length > 0, 'die Auswahl ist leer')
    assert.ok(
      !codes.includes('other'),
      `\`other\` steht noch in der Auswahl: ${codes.join(', ')}`,
    )
  })

  it('und die uebrigen sechs stehen alle drin', () => {
    // `[read]` **Eine Untergrenze erlaubt Verlust** — deshalb die
    // gemessene Zahl fest, nicht `>= 6`.
    const codes = kategorieAuswahl().map(k => k.code)
    assert.equal(codes.length, 6, `sechs erwartet, ${codes.length} da`)
    for (const c of ['breakfast', 'lunch', 'dinner', 'snack',
      'pre_workout', 'post_workout']) {
      assert.ok(codes.includes(c), `${c} fehlt in der Auswahl`)
    }
  })

  // ── 2 · Der Name bleibt lesbar ───────────────────────────────────
  it('KATEGORIE_TEXT kennt `other` weiter — Bestand bleibt lesbar', () => {
    // `[read]` **Die Auswahl bietet es nicht mehr an, aber wer eine
    // alte Zeile hat, soll ihren Namen sehen** — nicht den Rohcode.
    assert.equal(KATEGORIE_TEXT.other, 'Sonstiges')
  })

  // ── 3 · rasterQuelle rechnet es nicht mehr herbei ────────────────
  it('fuenf Slots gegen vier Kategorien erzeugen kein `other`', () => {
    const fuenf = [1, 2, 3, 4, 5].map(p => ({
      position: p, name: `Slot ${p}`, planned_time: '08:00',
    }))
    const { zeilen } = rasterQuelle({
      planSlots: fuenf,
      reihen: ['breakfast', 'lunch', 'dinner', 'snack'],
    })

    assert.equal(zeilen.length, 5, 'fuenf Slots, fuenf Zeilen')
    const other = zeilen.filter(z => z.kategorie === 'other')
    assert.equal(
      other.length, 0,
      `rasterQuelle erzeugt \`other\`: ${JSON.stringify(zeilen)}`,
    )
  })

  it('die fuenfte Zeile traegt die letzte Kategorie, nicht `other`', () => {
    // `[read]` **Der Slot ordnet (E-58)** — wer ueber die Reihe
    // hinausgeht, gehoert zur letzten, nicht in eine Sammelgruppe.
    const fuenf = [1, 2, 3, 4, 5].map(p => ({
      position: p, name: `Slot ${p}`, planned_time: '08:00',
    }))
    const { zeilen } = rasterQuelle({
      planSlots: fuenf,
      reihen: ['breakfast', 'lunch', 'dinner', 'snack'],
    })
    assert.equal(zeilen[4].kategorie, 'snack')
    assert.equal(zeilen[3].kategorie, 'snack')
  })

  it('acht Slots gegen vier: alle vier bleiben zugeordnet', () => {
    const acht = [1, 2, 3, 4, 5, 6, 7, 8].map(p => ({
      position: p, name: `Slot ${p}`, planned_time: '08:00',
    }))
    const { zeilen } = rasterQuelle({
      planSlots: acht,
      reihen: ['breakfast', 'lunch', 'dinner', 'snack'],
    })
    assert.equal(zeilen.length, 8)
    assert.equal(
      zeilen.filter(z => z.kategorie === 'other').length, 0,
      'auch bei acht Slots kein `other`',
    )
  })

  it('ohne Reihen faellt es nicht auf `other` zurueck', () => {
    const { zeilen } = rasterQuelle({
      planSlots: [{ position: 1, name: 'A', planned_time: '08:00' }],
      reihen: [],
    })
    assert.equal(
      zeilen.filter(z => z.kategorie === 'other').length, 0,
      'leere Reihen erzeugen `other`',
    )
  })

  // ── 4 · Keine Sammelreihe (E-63) ─────────────────────────────────
  it('rasterZeilen kennt keine Sammelreihe', () => {
    const t = lies(join(WURZEL, 'apps', 'web', 'src', 'lib',
      'nutrition', 'plan-model.ts'))
    assert.ok(
      !/(?<![a-z0-9_])other(?![a-z0-9_])/.test(t),
      'plan-model.ts nennt `other` — E-63: keine Sammelgruppe',
    )
  })

  // ── 5 · Die drei Formulare stehen an der einen Quelle ────────────
  for (const datei of ['mahlzeiten.tsx', 'erfassen-modal.tsx',
    'rezepte-echt.tsx']) {
    it(`${datei} baut keine eigene Liste mit \`other\``, () => {
      const t = lies(join(V2, datei))
      // `[read]` **Nicht der Feldname, die Wirkung:** eine
      // Zeichenkette `'other'` in einer Auswahlliste.
      assert.ok(
        !/['"]other['"]/.test(t),
        `${datei} traegt \`other\` als eigenen Wert — die Auswahl ` +
        'kommt aus kategorieAuswahl(), nicht aus einer zweiten Liste',
      )
    })
  }
})
