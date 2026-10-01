/**
 * G-569 — G-520 prueft Kilogramm, der Katalog Prozent
 *
 * `[cmd]` **G-561 hat den Katalog umgestellt und die Anwendungsseite
 * gemeldet statt sie mitzunehmen** — `apps/` gehoert Codex nicht.
 *
 * `[read]` **Zwei Maßstaebe nebeneinander:** der Katalog relativ
 * (1,194 %), die Anwendung absolut (1,0 kg). **Bei 83,74 kg dieselbe
 * Grenze, bei 60 kg nicht** — dort greift der Katalog bei 0,716 kg
 * und die Anwendung erst bei 1,0.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import {
  SCHWELLE_PCT, tempoInProzent, schwelleInKg, schwelleGreift,
  schwelleUnterschritten, schwellenText,
} from '../waechter-schwellen'
import { pruefeWaechter, type Waechterlage } from '../uebergangswaechter'
import type { Wochendaten } from '../anpassung'

const HIER = dirname(fileURLToPath(import.meta.url))

const ohneKommentare = (q: string) => q
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')
const lies = (p: string) => ohneKommentare(readFileSync(p, 'utf8'))

// ════════════════════════════════════════════════════════════════
// A1 — keine absolute Schwelle bleibt stehen
// ════════════════════════════════════════════════════════════════

describe('G-569/A1 — nirgends mehr Kilogramm als Schwelle', () => {
  /**
   * `[cmd]` **Gezaehlt 2026-10-01: sieben Vergleiche in zwei
   * Dateien** — `anpassung.ts` vier, `uebergangswaechter.ts` drei.
   *
   * `[read]` **Die Falle, in die der Orchestrator bei G-561 lief:**
   * sein `git grep` suchte `1.0 kg` als TEXT und fand nichts — **die
   * Schwellen stehen als ZAHLEN** (`d.weightTrend < -1.0`).
   * **Deshalb sucht diese Pruefung die Zahlen.**
   */
  const ABSOLUT = [
    /weightTrend\s*<\s*-1\.0\b/,
    /weightTrend\s*>\s*-0\.1\b/,
    /weightTrend\s*>\s*0\.75\b/,
    /weightTrend\s*<\s*0\.1\b/,
  ]

  it('anpassung.ts vergleicht nicht mehr absolut', () => {
    const q = lies(join(HIER, '..', 'anpassung.ts'))
    for (const m of ABSOLUT) {
      assert.ok(!m.test(q),
        `anpassung.ts vergleicht wieder absolut (${m.source}) — dann `
        + 'greift die Grenze bei 60 kg erst bei 1,0 statt 0,717')
    }
  })

  it('uebergangswaechter.ts auch nicht', () => {
    const q = lies(join(HIER, '..', 'uebergangswaechter.ts'))
    for (const m of ABSOLUT) {
      assert.ok(!m.test(q),
        `uebergangswaechter.ts vergleicht wieder absolut (${m.source})`)
    }
  })

  it('beide rufen die relative Pruefung', () => {
    for (const datei of ['anpassung.ts', 'uebergangswaechter.ts']) {
      const q = lies(join(HIER, '..', datei))
      assert.match(q, /schwelleGreift\(|schwelleUnterschritten\(/,
        `${datei} nutzt die relativen Schwellen nicht`)
    }
  })

  it('keine Datei rechnet selbst in Prozent um', () => {
    // `[read]` **Eine Rechnung, nicht drei** — und sie rundet durch
    // `rundeWieDb`, weil `Math.round` die Haelfte anders legt als
    // Postgres (G-565).
    for (const datei of ['anpassung.ts', 'uebergangswaechter.ts']) {
      const q = lies(join(HIER, '..', datei))
      assert.ok(!/\/\s*gewichtAmStichtagKg\s*\*\s*100/.test(q),
        `${datei} rechnet selbst in Prozent um — zwei Rechnungen `
        + 'gehen auseinander')
    }
  })

  it('die Umrechnung rundet durch rundeWieDb', () => {
    const q = lies(join(HIER, '..', 'waechter-schwellen.ts'))
    assert.match(q, /import \{ rundeWieDb \} from '\.\/zielrate-einheit'/,
      'die Schwellen runden nicht ueber rundeWieDb')
    assert.ok(!/Math\.round/.test(q),
      'Math.round rundet die Haelfte nach oben, Postgres von der Null '
      + 'weg — bei negativen Werten laufen sie auseinander (G-565)')
  })
})

// ════════════════════════════════════════════════════════════════
// A2 — die Umrechnung, gegen Codex nachgerechnet
// ════════════════════════════════════════════════════════════════

describe('G-569/A2 — dieselben Zahlen wie G-561', () => {
  it('die vier Umrechnungen von Codex kommen heraus', () => {
    // `[cmd]` **G-561, Bezug 83,74 kg** — selbst nachgerechnet:
    //
    //     1,00 kg / 83,74 = 1,1942 %  ->  1,194
    //     0,75 kg / 83,74 = 0,8956 %  ->  0,896
    //     0,50 kg / 83,74 = 0,5971 %  ->  0,597
    //     0,10 kg / 83,74 = 0,1194 %  ->  0,119
    assert.equal(tempoInProzent(1.00, 83.74), 1.194)
    assert.equal(tempoInProzent(0.75, 83.74), 0.896)
    assert.equal(tempoInProzent(0.50, 83.74), 0.597)
    assert.equal(tempoInProzent(0.10, 83.74), 0.119)
  })

  it('die Schwellen sind genau die des Katalogs', () => {
    // `[cmd]` **`536_goal_strategies_seed.sql`:** `1.194` fuenfmal,
    // `0.597` einmal.
    assert.equal(SCHWELLE_PCT.verlustZuSchnell, 1.194)
    assert.equal(SCHWELLE_PCT.zunahmeZuSchnell, 0.896)
    assert.equal(SCHWELLE_PCT.verlustZuLangsam, 0.119)
  })

  it('das Vorzeichen bleibt erhalten', () => {
    // `[read]` **Die Richtung ist Teil der Aussage** — -1,0 kg ist
    // nicht dasselbe wie +1,0 kg.
    assert.equal(tempoInProzent(-1.00, 83.74), -1.194)
  })

  it('die Rueckrichtung: Codex rechnet 1,194 % von 60 kg', () => {
    // `[cmd]` **G-561:** 1,194 % von 60 kg = 0,7164 kg,
    // von 100 kg = 1,1940 kg.
    assert.equal(schwelleInKg('verlustZuSchnell', 60), 0.716)
    assert.equal(schwelleInKg('verlustZuSchnell', 100), 1.194)
  })

  it('ohne Gewicht keine Zahl, kein Rueckfall', () => {
    // `[read]` **A2/G-561: fehlt am Stichtag ein Gewicht, ist das ein
    // Hindernis** — kein Rueckfall auf Profil- oder Startgewicht.
    assert.equal(tempoInProzent(1.0, null), null)
    assert.equal(tempoInProzent(1.0, 0), null)
    assert.equal(schwelleGreift('verlustZuSchnell', -1.0, null), null)
    assert.equal(schwelleInKg('verlustZuSchnell', null), null)
  })
})

// ════════════════════════════════════════════════════════════════
// A3 — die Strenge verschiebt sich nicht
// ════════════════════════════════════════════════════════════════

describe('G-569/A3 — die Randprobe, zwei Gewichte', () => {
  /**
   * **Der Auftrag woertlich:** *„bei 83,74 kg muss 1,000 kg greifen
   * und 0,999 nicht; bei 60 kg 0,717 greifen und 0,716 nicht."*
   *
   * `[cmd]` **Von Hand:**
   *
   *     1,000 / 83,74 = 1,1942 %  >= 1,194  ->  greift
   *     0,999 / 83,74 = 1,1930 %  <  1,194  ->  greift nicht
   *     0,717 / 60,00 = 1,1950 %  >= 1,194  ->  greift
   *     0,716 / 60,00 = 1,1933 %  <  1,194  ->  greift nicht
   */
  it('bei 83,74 kg: 1,000 greift, 0,999 nicht', () => {
    assert.equal(schwelleGreift('verlustZuSchnell', -1.000, 83.74), true,
      '1,000 kg bei 83,74 kg sind 1,194 % — das MUSS greifen')
    assert.equal(schwelleGreift('verlustZuSchnell', -0.999, 83.74), false,
      '0,999 kg bei 83,74 kg sind 1,193 % — das darf NICHT greifen')
  })

  it('bei 60 kg: 0,717 greift, 0,716 nicht', () => {
    // `[read]` **Hier laufen absolut und relativ auseinander** — die
    // alte Grenze griff erst bei 1,0 kg.
    assert.equal(schwelleGreift('verlustZuSchnell', -0.717, 60), true,
      '0,717 kg bei 60 kg sind 1,195 % — das MUSS greifen')
    assert.equal(schwelleGreift('verlustZuSchnell', -0.716, 60), false,
      '0,716 kg bei 60 kg sind 1,193 % — das darf NICHT greifen')
  })

  it('der Vergleich ist >=, nicht >', () => {
    // `[cmd]` **Bei 83,74 kg sind 1,194 % genau 0,9999 kg** — mit `>`
    // griffe 1,000 kg nicht, und die Randprobe fiele.
    const q = lies(join(HIER, '..', 'waechter-schwellen.ts'))
    assert.match(q, /Math\.abs\(p\) >= SCHWELLE_PCT\[name\]/,
      'der Vergleich ist strikt — dann faellt der Randfall aus A3')
  })

  it('die Gegenrichtung hat ihre eigene Grenze', () => {
    assert.equal(schwelleUnterschritten('verlustZuLangsam', -0.05, 83.74), true,
      '0,05 kg bei 83,74 kg sind 0,060 % — unter 0,119, also Stillstand')
    assert.equal(schwelleUnterschritten('verlustZuLangsam', -0.5, 83.74), false,
      '0,5 kg sind 0,597 % — kein Stillstand')
  })

  it('die Strenge ist bei beiden Gewichten dieselbe', () => {
    // `[read]` **Das ist die eigentliche Zusage:** derselbe ANTEIL,
    // verschiedene Kilogramm.
    const a = schwelleInKg('verlustZuSchnell', 83.74)
    const b = schwelleInKg('verlustZuSchnell', 60)
    assert.ok(a !== null && b !== null && a > b,
      'die Grenze haengt nicht am Gewicht — dann ist sie nicht relativ')
    // `[read]` **Nicht auf Gleichheit pruefen** — die Kilogrammzahl
    // ist auf drei Stellen gerundet (0,716 statt 0,7164), und der
    // Rueckweg landet deshalb bei 1,193 statt 1,194. **Gemessen
    // wird, dass beide DICHT an der Schwelle liegen**, nicht dass
    // die Rundung verlustfrei ist.
    for (const [kg, g] of [[a, 83.74], [b, 60]] as Array<[number, number]>) {
      const p = tempoInProzent(kg, g)
      assert.ok(p !== null
        && Math.abs(p - SCHWELLE_PCT.verlustZuSchnell) <= 0.002,
        `${kg} kg bei ${g} kg ergibt ${p} % — das liegt nicht an der `
        + `Schwelle ${SCHWELLE_PCT.verlustZuSchnell}`)
    }
  })
})

// ════════════════════════════════════════════════════════════════
// A4 — die Texte in beiden Einheiten
// ════════════════════════════════════════════════════════════════

describe('G-569/A4 — der Text nennt die Grenze zum Gewicht', () => {
  it('in Prozent steht die Katalogzahl', () => {
    assert.equal(schwellenText('verlustZuSchnell', 83.74, 'prozent'),
      '1.194 % KG/Woche')
  })

  it('in Kilogramm steht die Grenze ZU SEINEM Gewicht', () => {
    // `[read]` **A4: „nicht eine pauschale Zahl."**
    const t = schwellenText('verlustZuSchnell', 60, 'kcal')
    assert.match(t, /0\.716 kg\/Woche/,
      'der Text nennt nicht die Grenze zum Gewicht des Nutzers')
    assert.match(t, /1\.194 % bei 60 kg/,
      'der Text nennt den Bezug nicht — dann ist die Zahl nicht '
      + 'nachvollziehbar')
  })

  it('ohne Gewicht steht die Prozentzahl, keine erfundene', () => {
    assert.equal(schwellenText('verlustZuSchnell', null, 'kcal'),
      '1.194 % KG/Woche',
      'ohne Gewicht wird eine Kilogrammgrenze behauptet')
  })

  it('der Waechtersatz nutzt die gewaehlte Einheit', () => {
    const lage: Waechterlage = {
      art: 'fat_loss', wochen: 4, maxDauerWochen: null,
      koerperfettPct: 15, biologischesGeschlecht: 'male',
      hrvTageUnterGrenze: 0,
    }
    const d: Wochendaten = {
      weightTrend: -1.5, calorieAdherence: 90, gewichtAmStichtagKg: 60,
      strengthTrend: 0, hrv7d: 60, hrvBaseline: 60,
    }
    const inProzent = pruefeWaechter(lage, d, 'prozent')
      .find(b => b.kennung === 'verlust_zu_schnell')
    const inKg = pruefeWaechter(lage, d, 'kcal')
      .find(b => b.kennung === 'verlust_zu_schnell')
    assert.equal(inProzent?.greift, true, '1,5 kg bei 60 kg sind 2,5 %')
    assert.match(inProzent?.satz ?? '', /1\.194 % KG\/Woche/,
      'der Prozentsatz nennt die Schwelle nicht')
    assert.match(inKg?.satz ?? '', /0\.716 kg\/Woche/,
      'die Kilogrammfassung nennt die Grenze nicht zum Gewicht')
  })
})

// ════════════════════════════════════════════════════════════════
// A2 — fehlendes Gewicht ist ein Hindernis
// ════════════════════════════════════════════════════════════════

describe('G-569/A2 — ohne Gewicht ein Hindernis, keine stille Null', () => {
  const lage: Waechterlage = {
    art: 'fat_loss', wochen: 4, maxDauerWochen: null,
    koerperfettPct: 15, biologischesGeschlecht: 'male',
    hrvTageUnterGrenze: 0,
  }

  it('die drei Waechter melden das Hindernis', () => {
    const d: Wochendaten = {
      weightTrend: -1.5, calorieAdherence: 90, gewichtAmStichtagKg: null,
      strengthTrend: 0, hrv7d: 60, hrvBaseline: 60,
    }
    for (const kennung of ['verlust_zu_schnell', 'verlust_zu_langsam',
      'masse_zu_schnell']) {
      const b = pruefeWaechter(lage, d).find(x => x.kennung === kennung)
      assert.equal(b?.greift, false,
        `„${kennung}" greift ohne Gewicht — dann ist die Schwelle `
        + 'nicht relativ')
      assert.match(b?.hindernis ?? '', /Gewicht am Stichtag/,
        `„${kennung}" nennt das fehlende Gewicht nicht als Hindernis`)
    }
  })

  it('mit Gewicht greifen sie wieder', () => {
    // `[read]` **Die Gegenrichtung** — sonst waere „ohne Gewicht kein
    // Befund" erfuellt, indem nie einer kommt.
    const d: Wochendaten = {
      weightTrend: -1.5, calorieAdherence: 90, gewichtAmStichtagKg: 60,
      strengthTrend: 0, hrv7d: 60, hrvBaseline: 60,
    }
    const b = pruefeWaechter(lage, d).find(x => x.kennung === 'verlust_zu_schnell')
    assert.equal(b?.greift, true, '1,5 kg bei 60 kg sind 2,5 % — das greift')
    assert.equal(b?.hindernis, undefined, 'mit Gewicht bleibt ein Hindernis')
  })

  it('das Gewicht am Stichtag steht im Typ, nicht am Phasenbeginn', () => {
    // `[cmd]` **G-561/A2, von Codex gegen die Vorgabe entschieden:**
    // die Zielrate ist die Absicht der Phase, **der Waechter bewertet
    // einen gegenwaertigen Vorgang.**
    const q = lies(join(HIER, '..', 'anpassung.ts'))
    assert.match(q, /gewichtAmStichtagKg: number \| null/,
      'das Gewicht am Stichtag fehlt im Typ')
    assert.ok(!/gewichtAmPhasenbeginn|startGewicht/.test(q),
      'es wird das Startgewicht genommen — G-561/A2 hat das '
      + 'ausdruecklich verworfen')
  })
})
