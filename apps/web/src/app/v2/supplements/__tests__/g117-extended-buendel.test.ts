// G-117 — der Extended-Code soll nicht im Seitenbuendel liegen.
//
// ══ WAS HIER BEWACHT WIRD ══════════════════════════════════════════
//
// `[cmd]` **Gemessen am 2026-09-24 (Produktionsbau):** die
// Kennzeichen aus `tab-extended.tsx` standen in **einem von zehn**
// JS-Chunks der Seite — auch fuer jemanden, dessen Grad nicht
// reicht. **Nachher: in einem eigenen Chunk, der NICHT im
// Seitenmanifest steht.**
//
// `[read]` **Drei Wege fuehrten den Code ins Buendel, nicht einer:**
//
//     1  der statische Import von `tab-extended.tsx`  (behoben:
//        `dynamic`, Lademarke bleibt)
//     2  `EXTENDED_STACK` in `ansicht.tsx` fuer EINE Zahl
//        (behoben: Konstante)
//     3  ein TOTER Import in `tabs.tsx` — nie benutzt, trotzdem
//        ausgeliefert (behoben: entfernt)
//
// ══ G-499: DER VIERTE UND DER FUENFTE WEG ══════════════════════════
//
// `[cmd]` **Der vierte Weg war die Entwurfsreferenz** — sie zeigte
// dieselben Wirkstoffe unter der Trennlinie, fuer JEDEN. **Tom hat
// ihn mit E-88 entschieden:** *„Die Referenz zeigt
// Extended-INHALT, also folgt sie Extendeds Regel."*
//
// `[read]` **E-68/E-70 lassen die Mockup-Fassung stehen, bis das
// Modul fertig ist — sie verlangen nicht, dass JEDER sie sieht.**
// Deshalb bewacht diese Datei sie jetzt MIT (A5 aus G-499); der
// Satz „bewacht sie ausdruecklich nicht" ist damit ueberholt.
//
// `[cmd]` **Und beim Bauen kam ein FUENFTER Weg zum Vorschein:**
// `EXTENDED_STACK` stand in `daten.ts` neben `STACK`, das vier
// statisch importierte Dateien brauchen. **Ein Modul ist
// unteilbar** — gemessen: `HCG (Human Chorionic …)` samt
// `sideEffectScore` und `nextLab` lag weiter im Seitenchunk,
// obwohl beide Verbraucher schon dynamisch waren. **Deshalb
// `daten-extended.ts`.**
//
// ══ WARUM NICHT NUR NACH `dynamic` GESUCHT WIRD ════════════════════
//
// `[read]` **Ein Waechter, der das Wort `dynamic` findet, bleibt
// gruen, wenn jemand `ssr: false` daraus macht** — und genau das war
// der zurueckgenommene erste Versuch von 2026-08-20, der den Reiter
// leer machte. **Die Probe fragt deshalb nach der WIRKUNG:** kein
// statischer Wert-Import, `dynamic` vorhanden, `ssr` nicht `false`,
// und ein Ladehinweis.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const HIER = path.join(process.cwd(), 'src', 'app', 'v2', 'supplements')
const lies = (n: string) => fs.readFileSync(path.join(HIER, n), 'utf8')

/** Kommentare raus — sonst faengt die Probe ihre eigene Begruendung.
 *  `[cmd]` Genau das ist am 2026-09-24 passiert: ein Kommentar in
 *  `ansicht.tsx` zitierte die Kennzeichen, und die Browserprobe
 *  fand sie im Entwicklungsbau in `page.js`. */
function ohneKommentare(s: string): string {
  return s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
}

/**
 * Der `dynamic(...)`-Block zu EINEM Modul — von seinem `import(...)`
 * bis zur schliessenden Klammer.
 *
 * `[cmd]` **Seit G-499 stehen zwei `dynamic`-Bloecke untereinander.**
 * Ein Fenster aus Zeichenzahl (vorher 900) reichte vom ersten in den
 * zweiten hinein: **eine Sabotage an der REFERENZ machte die
 * REITER-Probe rot** — richtig rot, aber am falschen Ort. `[read]`
 * **Und Kommentare wegzuschneiden macht es schlimmer**, weil sie zu
 * Leerzeilen werden und das Fenster noch weiter reicht.
 *
 * `[read]` **Eine gezaehlte Grenze ist keine Blockgrenze** — hier
 * zaehlt die Klammertiefe.
 */
function dynamikBlock(code: string, modul: string): string {
  const von = code.indexOf(`import('${modul}')`)
  assert.ok(von >= 0, `Kein dynamic-Import fuer ${modul} gefunden.`)
  let tiefe = 0
  for (let i = von; i < code.length; i += 1) {
    if (code[i] === '(') tiefe += 1
    else if (code[i] === ')') {
      tiefe -= 1
      // Die Klammer von `dynamic(` selbst wurde vor `von` geoeffnet;
      // sie schliesst, wenn wir unter null fallen.
      if (tiefe < 0) return code.slice(von, i)
    }
  }
  return code.slice(von)
}

test('G-117: `tab-extended` wird NICHT statisch importiert', () => {
  const code = ohneKommentare(lies('ansicht.tsx'))
  const statisch = /import\s*\{[^}]*\}\s*from\s*'\.\/tab-extended'/.test(code)
  assert.equal(statisch, false,
    'ansicht.tsx importiert tab-extended.tsx wieder statisch — damit '
    + 'liegt der Extended-Code fuer JEDEN im Seitenbuendel (G-117).')
})

test('G-117: der Reiter kommt ueber `dynamic` und bleibt serverseitig', () => {
  const code = ohneKommentare(lies('ansicht.tsx'))

  assert.match(code, /dynamic\(\s*\(\)\s*=>\s*import\('\.\/tab-extended'\)/,
    'Der dynamische Import von tab-extended.tsx fehlt.')

  // `[read]` **`ssr: false` ist der Rueckfall, nicht die Loesung** —
  // er hielt den Chunk heraus UND machte den Reiter leer
  // (gemessen 2026-08-20, zurueckgenommen).
  const block = dynamikBlock(code, './tab-extended')
  assert.equal(/ssr\s*:\s*false/.test(block), false,
    'ssr: false macht den Reiter leer — auch den Ladehinweis (G-117).')
  assert.match(block, /ssr\s*:\s*true/,
    'ssr: true muss ausdruecklich dastehen.')
  assert.match(block, /loading\s*:/,
    'Ein Ladehinweis gehoert dazu — kein leeres Feld (G-482/G-486).')
})

test('G-117: kein Wert-Import der Extended-Stoffliste in der Schale', () => {
  // `[read]` **Eine Zahl ist kein Grund, eine Stoffliste
  // auszuliefern.** `ansicht.tsx` brauchte nur `.length`.
  for (const datei of ['ansicht.tsx', 'tabs.tsx']) {
    const code = ohneKommentare(lies(datei))
    const holt = /import\s*\{[^}]*\bEXTENDED_(STACK|LABS)\b[^}]*\}\s*from\s*'\.\/daten'/
      .test(code)
    assert.equal(holt, false,
      `${datei} importiert EXTENDED_STACK/EXTENDED_LABS als WERT — das `
      + 'zieht die PED-Wirkstoffliste ins Seitenbuendel (G-117).')
  }
})

test('G-117: die abgeschriebene Zahl stimmt noch', () => {
  // `[read]` **Eine abgeschriebene Zahl ohne Waechter altert still.**
  // `ansicht.tsx` traegt `EXTENDED_ANZAHL` statt `.length`, damit der
  // Import wegfallen kann — dann muss jemand die Zahl nachhalten.
  const schale = ohneKommentare(lies('ansicht.tsx'))
  const m = schale.match(/const\s+EXTENDED_ANZAHL\s*=\s*(\d+)/)
  assert.ok(m, 'EXTENDED_ANZAHL fehlt in ansicht.tsx.')
  const behauptet = Number(m![1])

  // Die Wahrheit steht in `daten-extended.ts` — gezaehlt, nicht
  // geglaubt. `[cmd]` **G-499: die Konstante ist aus `daten.ts`
  // gewandert**, und diese Probe ist dabei rot geworden — richtig
  // so: sie haengt an der Datei, nicht am Namen.
  const daten = lies('daten-extended.ts')
  const von = daten.indexOf('export const EXTENDED_STACK')
  assert.ok(von >= 0, 'EXTENDED_STACK nicht in daten-extended.ts gefunden.')
  const bis = daten.indexOf('export const', von + 10)
  const block = daten.slice(von, bis > von ? bis : undefined)
  const wirklich = (block.match(/^\s{4}name:\s*"/gm) ?? []).length

  assert.equal(behauptet, wirklich,
    `EXTENDED_ANZAHL sagt ${behauptet}, EXTENDED_STACK fuehrt `
    + `${wirklich} Wirkstoffe — das Zaehlerchen am Reiter luegt.`)
})

test('G-117: das serverseitige Gate bleibt (A5)', () => {
  // `[read]` **Die Buendelgrenze ERSETZT das Gate nicht, sie kommt
  // dazu.** Faellt `gate?.offen` weg, rendert der Reiter fuer jeden —
  // und holt sich den Chunk dann auch.
  const code = ohneKommentare(lies('ansicht.tsx'))
  assert.match(code, /gate\?\.offen\s*&&\s*\(?\s*<SuppExtended/,
    'Die serverseitige Bedingung vor <SuppExtended/> fehlt (A5).')

  // Und der Leseweg, der sie speist.
  const regeln = ohneKommentare(
    fs.readFileSync(path.join(process.cwd(), 'src', 'lib', 'supplements',
      'regeln-read.ts'), 'utf8'))
  assert.match(regeln, /reichtDerGrad\(grad\)/,
    'ladeGate() entscheidet nicht mehr ueber reichtDerGrad (A5).')
})

// ══════════════════════════════════════════════════════════════════
// G-499 — die Entwurfsreferenz folgt derselben Regel (E-88)
// ══════════════════════════════════════════════════════════════════

test('G-499: die Extended-Referenz wird NICHT statisch importiert', () => {
  const code = ohneKommentare(lies('ansicht.tsx'))
  // `[read]` **Die Frage ist der WERT-Import**, nicht das Wort:
  // `SuppExtendedReferenz` steht auch in der `dynamic`-Zeile.
  const statisch =
    /import\s*\{[^}]*\bSuppExtendedReferenz\b[^}]*\}\s*from\s*'\.\/mockup-referenz(-extended)?'/
      .test(code)
  assert.equal(statisch, false,
    'ansicht.tsx importiert SuppExtendedReferenz wieder statisch — damit '
    + 'liegt die PED-Stoffliste fuer JEDEN im Seitenbuendel (G-499).')
})

test('G-499: die Referenz kommt ueber `dynamic` und haengt am Gate', () => {
  const code = ohneKommentare(lies('ansicht.tsx'))

  assert.match(code, /dynamic\(\s*\(\)\s*=>\s*import\('\.\/mockup-referenz-extended'\)/,
    'Der dynamische Import der Extended-Referenz fehlt (G-499).')

  const block = dynamikBlock(code, './mockup-referenz-extended')
  assert.equal(/ssr\s*:\s*false/.test(block), false,
    'ssr: false nimmt den Serveranstrich — dieselbe Falle wie in G-117.')
  assert.match(block, /ssr\s*:\s*true/,
    'ssr: true muss ausdruecklich dastehen (G-499).')

  // `[read]` **Der Buendelschnitt allein genuegt NICHT** — Weg b, den
  // Tom ausgeschlossen hat: der Chunk laedt beim Oeffnen nach, die
  // Dosis stuende dann trotzdem im Browser. Die Bedingung muss davor.
  assert.match(code, /gate\?\.offen\s*\r?\n?\s*\?\s*<SuppExtendedReferenz\s*\/>/,
    'Die Gradpruefung vor <SuppExtendedReferenz/> fehlt (G-499, E-88).')
})

test('G-499: ohne Grad steht eine Erklaerung, kein leeres Feld', () => {
  const code = ohneKommentare(lies('ansicht.tsx'))
  // Der Ersatzzweig existiert ...
  assert.match(code, /:\s*<ReferenzOhneGrad\s*\/>/,
    'Der Ersatz fuer die gesperrte Referenz fehlt (G-499/A3).')
  // ... und traegt wirklich einen Satz samt Trennlinie.
  assert.match(code, /function\s+ReferenzOhneGrad/,
    'ReferenzOhneGrad ist nicht definiert.')
  const von = code.indexOf('function ReferenzOhneGrad')
  const block = code.slice(von, von + 1400)
  assert.match(block, /<ReferenzTrenner\b/,
    'Die Trennlinie muss auch ohne Grad stehen (G-365).')
  assert.match(block, /data-probe="referenz-ohne-grad"/,
    'Die Messmarke des Erklaersatzes fehlt.')
  // `[read]` **Ein leerer Absatz waere kein Leerhinweis** — es muss
  // Text darin stehen (E-72: eine Null sieht aus wie ein Ergebnis).
  assert.ok(block.replace(/<[^>]*>/g, '').includes('Erfahrungsgrad'),
    'Der Erklaersatz nennt den Erfahrungsgrad nicht.')
})

test('G-499: die Extended-Konstanten liegen in einer eigenen Datei', () => {
  // `[cmd]` **Ein Modul ist unteilbar:** solange `EXTENDED_STACK` in
  // `daten.ts` stand, zogen die vier Dateien, die dort `STACK` holen,
  // die Wirkstoffliste mit ins Buendel — gemessen am Produktionsbau.
  const daten = ohneKommentare(lies('daten.ts'))
  assert.equal(/export\s+const\s+EXTENDED_(STACK|LABS)/.test(daten), false,
    'EXTENDED_STACK/LABS stehen wieder in daten.ts — damit liefern sie '
    + 'ueber STACK an jeden aus (G-499).')

  const eigen = ohneKommentare(lies('daten-extended.ts'))
  assert.match(eigen, /export\s+const\s+EXTENDED_STACK/,
    'daten-extended.ts fuehrt EXTENDED_STACK nicht.')
  assert.match(eigen, /export\s+const\s+EXTENDED_LABS/,
    'daten-extended.ts fuehrt EXTENDED_LABS nicht.')

  // Und niemand ausser den beiden dynamisch geholten Dateien liest sie.
  const erlaubt = new Set(['tab-extended.tsx', 'mockup-referenz-extended.tsx'])
  for (const datei of fs.readdirSync(HIER)) {
    if (!datei.endsWith('.tsx') && !datei.endsWith('.ts')) continue
    if (datei === 'daten-extended.ts' || erlaubt.has(datei)) continue
    const code = ohneKommentare(lies(datei))
    assert.equal(/from\s*'\.\/daten-extended'/.test(code), false,
      `${datei} importiert daten-extended.ts — nur die beiden dynamisch `
      + 'geholten Extended-Dateien duerfen das (G-499).')
  }
})

// ══════════════════════════════════════════════════════════════════
// G-499/N4 — `spec-daten.ts` traegt keine Enhanced-Eintraege mehr
// ══════════════════════════════════════════════════════════════════
//
// `[cmd]` **Die Beanstandung, 2026-09-08:** mein Bericht behauptete,
// im Seitenchunk staenden *„nur Namen und Preise, keine Dosis, kein
// Schema"*. **Gemessen waren es 13 von 15 Feldmustern** — samt
// `dose`, `half_life`, `legal_status`, `Rx only`, `Schedule III`.
//
// `[read]` **Der Fehler war das Suchmuster:** ich hatte nach VIER
// NAMEN gesucht statt nach den FELDERN. **Diese Proben fragen
// deshalb nach Feldern.**
//
// **Tom, 2026-09-24:** *„preise werden vom user eingepflegt … wir
// verkaufen keine enhanced produkte."* `[cmd]` Die echten Preise
// liegen in `supplements.user_inventory`; `cost_per_serving` im
// Entwurf wird nie echt.

test('G-499/N4: spec-daten.ts fuehrt keine Enhanced-Eintraege', () => {
  const code = ohneKommentare(lies('spec-daten.ts'))
  assert.equal(/mode:\s*"enhanced"/.test(code), false,
    'spec-daten.ts fuehrt wieder mode:"enhanced" — die Liste geht damit '
    + 'ueber fehlende-kacheln.tsx an JEDEN Besucher (G-499/N1).')
  // Die Felder, die nur Enhanced-Eintraege tragen.
  for (const feld of ['half_life', 'legal_status', 'detection_days',
    'requires_pct', 'aromatization']) {
    assert.equal(code.includes(feld), false,
      `spec-daten.ts traegt wieder "${feld}" — ein Enhanced-Feld (G-499/N1).`)
  }
})

test('G-499/N4: die Enhanced-Eintraege sind erhalten, nicht geloescht', () => {
  // `[read]` **Verschoben ist nicht geloescht** — ohne diese Probe
  // waere „alles weg" genauso gruen wie „richtig ausgelagert".
  const eigen = ohneKommentare(lies('spec-daten-enhanced.ts'))
  const von = eigen.indexOf('export const CATALOG_ENHANCED')
  assert.ok(von >= 0, 'CATALOG_ENHANCED fehlt in spec-daten-enhanced.ts.')

  // `[cmd]` **Im BLOCK der Ausfuhr zaehlen, nicht in der Datei.**
  // `[read]` Eine Sabotage, die `CATALOG_ENHANCED` auf `[]` setzt
  // und die Eintraege in ein totes `const _weg = [...]` daneben
  // schiebt, blieb gruen: die 17 Vorkommen standen ja noch im
  // Text. **Die Probe mass die Anwesenheit von Zeichen, nicht die
  // Erreichbarkeit der Daten.**
  // `[read]` **Die Klammertiefe zaehlen, nicht nach `\n];` suchen.**
  // `[cmd]` Eine zweite Fassung tat das — und die Sabotage
  // `CATALOG_ENHANCED = []; const _weg = [ …17 Eintraege… ]`
  // blieb gruen, weil `\n];` erst das ENDE von `_weg` traf und der
  // Schnitt alles dazwischen mitnahm. **Ein gesuchtes Zeichen ist
  // keine Blockgrenze** — dieselbe Lehre wie bei `dynamikBlock`.
  // `[cmd]` **Ab dem `=`, nicht ab dem Namen** — `indexOf('[')`
  // traf sonst die Klammer der TYPANGABE (`KatalogEintrag[]`), die
  // sofort wieder schliesst. **Die Probe meldete dann 0 Eintraege
  // fuer eine unveraenderte Datei** (gemessen 2026-09-08).
  const gleich = eigen.indexOf('=', von)
  const auf = eigen.indexOf('[', gleich)
  assert.ok(auf > gleich, 'CATALOG_ENHANCED oeffnet kein Feld.')
  let tiefe = 0
  let bis = -1
  for (let i = auf; i < eigen.length; i += 1) {
    if (eigen[i] === '[') tiefe += 1
    else if (eigen[i] === ']') {
      tiefe -= 1
      if (tiefe === 0) { bis = i; break }
    }
  }
  assert.ok(bis > auf, 'CATALOG_ENHANCED ist nicht abgeschlossen.')
  const block = eigen.slice(auf, bis)
  const wieviele = (block.match(/mode:\s*"enhanced"/g) ?? []).length
  assert.equal(wieviele, 17,
    `CATALOG_ENHANCED fuehrt ${wieviele} Enhanced-Eintraege, `
    + 'erwartet 17 (gemessen 2026-09-24).')
  assert.match(eigen, /export\s+const\s+INTERACTION_DB_ENHANCED/,
    'Die drei Enhanced-Wechselwirkungspaare fehlen.')
})

test('G-499/N4: die Schale liest spec-daten-enhanced nicht', () => {
  // `[read]` **Dieselbe Regel wie fuer `daten-extended.ts`:** wer
  // die Datei statisch importiert, holt sie ins Seitenbuendel.
  const erlaubt = new Set(['spec-daten-enhanced.ts'])
  for (const datei of fs.readdirSync(HIER)) {
    if (!datei.endsWith('.tsx') && !datei.endsWith('.ts')) continue
    if (erlaubt.has(datei)) continue
    const code = ohneKommentare(lies(datei))
    assert.equal(/from\s*'\.\/spec-daten-enhanced'/.test(code), false,
      `${datei} importiert spec-daten-enhanced.ts — das zieht die `
      + 'PED-Liste zurueck ins Seitenbuendel (G-499/N1).')
  }
})

test('G-499/N4: keine Enhanced-Namen in den Entwurfskacheln', () => {
  // `[cmd]` **`fehlende-kacheln.tsx` trug `['Mo 07:00',
  // 'Testosterone Cypionate', '150 mg']`** — eine Dosis MIT
  // Zeitplan, und die Datei laeuft ueber `ansicht.tsx`/`tabs.tsx`
  // auf JEDEM Reiter.
  const code = ohneKommentare(lies('fehlende-kacheln.tsx'))
  for (const name of ['Testosterone Cypionate', 'MK-677', 'HCG',
    'Anastrozole', 'Nandrolone', 'Oxandrolone']) {
    assert.equal(code.includes(name), false,
      `fehlende-kacheln.tsx nennt wieder "${name}" — diese Datei sieht `
      + 'jeder Besucher (G-499/N1).')
  }
})
