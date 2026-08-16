#!/usr/bin/env node
// Repo-weite Encoding-Pruefung. Arbeitet an den BYTES, nie an der
// Konsolenausgabe.
//
// ANLASS (2026-08-16): Dies ist die VIERTE Encoding-Reparatur in diesem
// Projekt. Umschriebene Umlaute, 704 Fragezeichen, UTF-16 durch
// PowerShell, jetzt doppelte Kodierung. `[cmd]` Jede der drei frueheren
// Reparaturen hat den jeweils letzten Fehler behoben und KEINE Pruefung
// hinterlassen — `docs/ssot/32-encoding-schaeden.md` traegt seit dem
// 2026-08-02 einen Abschnitt "Konsequenz fuer TODO (nicht ausgefuehrt)".
// Eine notierte Konsequenz ist keine.
//
// WARUM AN DEN BYTES: Eine Konsole mit CP850 stellt korrektes UTF-8 als
// Zeichensalat dar — `[read]` genau das hat 2026-08-02 zu einem
// Fehlbefund gefuehrt (`client.ts` war sauber, sah aber kaputt aus).
// Umgekehrt zeigt eine UTF-8-Konsole doppelte Kodierung als lesbares
// "c3 83 c2 bc", was harmlos aussieht. Beide Richtungen taeuschen; die Bytes
// nicht.
//
// AUFRUF: node tools/encoding-pruefen.mjs
// Exit 0 = sauber, Exit 1 = Befund.
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = process.cwd()

const ENDUNGEN = new Set([
  '.sql', '.ts', '.tsx', '.mjs', '.js', '.json', '.jsonl',
  '.csv', '.md', '.css',
])

// `[cmd]` `docs/design-system/` und `docs/design-system-analysis/`
// tragen Pfade, die laenger sind als Windows erlaubt — eine rekursive
// Suche bricht dort ab, statt sie zu ueberspringen. Deshalb stehen sie
// hier und nicht nur im Auftrag.
const AUS_ORDNER = new Set([
  'node_modules', '.next', '.next-gate', '.git', '.turbo',
  'referenz', '_archive', 'media',
  'design-system', 'design-system-analysis',
  // `[cmd]` `temp/` steht in .gitignore und enthaelt fremdes Material
  // (heruntergeladene Vorlagen). Was nicht eingecheckt ist, kann auch
  // nicht durch einen Commit Schaden anrichten.
  'temp', 'tmp', '.vscode', '.idea',
])

// backup/schema/ enthaelt erzeugte Sicherungen; sie werden nicht von
// Hand gepflegt und duerfen den Commit nicht blockieren.
const AUS_PFADE = ['backup/schema', 'backup/data']

/**
 * Freistellung fuer Dateien, die beschaedigte Sequenzen als GEGENSTAND
 * tragen statt als Schaden.
 *
 * `[cmd]` Es gibt sie wirklich: fuenf Validierungsabfragen suchen mit
 * `LIKE '%U+FFFD%'` nach genau diesem Zeichen, und der Bericht
 * `32-encoding-schaeden.md` zitiert die Muster, die er beschreibt.
 * `[read]` Die Suche vom 2026-08-02 hat dieselben Dateien schon einmal
 * als Falsch-Positive eingestuft — eine Pruefung, die sie erneut
 * meldet, wird nach zwei Tagen abgeschaltet.
 *
 * Die Freistellung haengt NICHT am Dateinamen, sondern an einer Marke
 * IM Text. Wer sie setzt, sagt damit: hier steht das Zeichen mit
 * Absicht. Eine Liste von Pfaden waere stiller und wuerde mitwandern,
 * wenn jemand eine Datei umbenennt.
 */
const MARKE = 'encoding-pruefung:absicht'

/** Welche Arten eine Datei mit Marke ueberspringen darf. */
const MIT_MARKE_ERLAUBT = new Set(['fffd', 'doppelt'])

/**
 * Die Muster der doppelten Kodierung.
 *
 * Doppelt kodiert heisst: gueltiges UTF-8 wurde ein zweites Mal als
 * UTF-8 kodiert. Aus "u-Umlaut" (c3 bc) wird dann (c3 83 c2 bc).
 * Erkennbar an der Einleitung c383 / c382 — das ist A-Tilde bzw. A-Zirkumflex —
 * gefolgt von einem weiteren Mehrbyte-Zeichen.
 */
const DOPPELT = [
  { bytes: [0xc3, 0x83], name: 'c383' },  // A-Tilde + Folgebyte
  { bytes: [0xc3, 0x82], name: 'c382' },  // A-Zirkumflex + Folgebyte
  // NACHTRAG 2026-08-16 (GO-04): c3a2 fehlte, und die Luecke war nicht
  // theoretisch — ein frischer Commit trug einen doppelt kodierten
  // Gedankenstrich, und diese Pruefung sagte "sauber".
  //
  // Der Grund: Ein ZWEIBYTE-Zeichen (c3 bc = u-Umlaut) wird doppelt
  // kodiert zu c383 c2bc — Einleitung c383. Ein DREIBYTE-Zeichen
  // (e2 80 94 = Gedankenstrich) wird zu c3a2 c280 c294 — Einleitung
  // c3a2. Die ersten beiden Muster decken nur die Zweibyte-Faelle ab,
  // also Umlaute; alle typografischen Zeichen fielen durch.
  { bytes: [0xc3, 0xa2], name: 'c3a2' },  // a-Zirkumflex + Folgebyte
]

function* dateien(dir) {
  let eintraege
  try {
    eintraege = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const e of eintraege) {
    const p = path.join(dir, e.name)
    const rel = path.relative(WURZEL, p).replace(/\\/g, '/')
    if (e.isDirectory()) {
      if (AUS_ORDNER.has(e.name)) continue
      if (AUS_PFADE.some(a => rel === a || rel.startsWith(`${a}/`))) continue
      yield* dateien(p)
    } else if (ENDUNGEN.has(path.extname(e.name).toLowerCase())) {
      yield p
    }
  }
}

/** Zeilennummer zu einem Byte-Versatz — fuer eine brauchbare Meldung. */
function zeileVon(buf, versatz) {
  let n = 1
  for (let i = 0; i < versatz && i < buf.length; i++) {
    if (buf[i] === 0x0a) n++
  }
  return n
}

const befunde = []
const freigestellt = []
let geprueft = 0

/**
 * Nimmt einen Befund auf — es sei denn, die Datei traegt die Marke und
 * die Art ist eine, die sich damit erklaeren laesst. UTF-16 und
 * ungueltiges UTF-8 bleiben IMMER Fehler: die kann niemand mit Absicht
 * wollen.
 */
function melde(befund, hatMarke) {
  if (hatMarke && MIT_MARKE_ERLAUBT.has(befund.art)) {
    freigestellt.push(befund)
    return
  }
  befunde.push(befund)
}

for (const datei of dateien(WURZEL)) {
  const rel = path.relative(WURZEL, datei).replace(/\\/g, '/')
  let buf
  try {
    buf = fs.readFileSync(datei)
  } catch {
    continue
  }
  geprueft++

  // Traegt die Datei die Marke? Roh im Puffer gesucht, damit auch eine
  // Datei mit sonst kaputtem Inhalt sie tragen kann.
  const hatMarke = buf.includes(MARKE)

  // --- 3. UTF-16 und BOM ------------------------------------------
  // `[read]` Die PowerShell-Umleitung (`>`) schreibt UTF-16LE mit
  // Stuecklistenmarke. Das hat zuletzt eine Schemasicherung getroffen,
  // und die damalige Pruefung fragte nur nach dem UTF-8-BOM — sie sah
  // es nicht. Deshalb hier alle drei Marken.
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
    melde({ rel, art: 'utf16', zeile: 1, text: 'UTF-16LE (ff fe)' }, hatMarke)
    continue
  }
  if (buf.length >= 2 && buf[0] === 0xfe && buf[1] === 0xff) {
    melde({ rel, art: 'utf16', zeile: 1, text: 'UTF-16BE (fe ff)' }, hatMarke)
    continue
  }
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    melde({ rel, art: 'bom', zeile: 1, text: 'UTF-8-BOM (ef bb bf)' }, hatMarke)
  }

  // --- 2. Gueltiges UTF-8? ----------------------------------------
  // TextDecoder mit fatal wirft, sobald eine Bytefolge kein UTF-8 ist.
  let text = null
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(buf)
  } catch {
    melde({ rel, art: 'kein-utf8', zeile: 1, text: 'nicht als UTF-8 dekodierbar' }, hatMarke)
    continue
  }

  // --- 1. Doppelte Kodierung --------------------------------------
  for (const muster of DOPPELT) {
    let i = 0
    while (i < buf.length - 2) {
      if (buf[i] === muster.bytes[0] && buf[i + 1] === muster.bytes[1]) {
        const folge = buf[i + 2]
        // Nach A-Tilde/A-Zirkumflex muss ein weiteres Mehrbyte-Zeichen kommen,
        // sonst ist es ein echtes A-Tilde (z. B. in einem franzoesischen
        // Wort) und kein Schaden.
        // NACHTRAG 2026-08-16: `0xe2` fehlte. Beim doppelt kodierten
        // Gedankenstrich (c3a2 e282ac e2809d) steht genau dort ein e2,
        // und die Pruefung lief daran vorbei.
        const istFolgebyte =
          (folge >= 0xc2 && folge <= 0xc3) ||   // c2xx/c3xx
          (folge >= 0xe2 && folge <= 0xe3) ||   // e2xx: Dreibyte-Zeichen
          (folge >= 0x80 && folge <= 0xbf)      // 8x-bx: direkte Folge
        if (istFolgebyte) {
          melde({
            rel,
            art: 'doppelt',
            zeile: zeileVon(buf, i),
            text: `${muster.name} + ${folge.toString(16).padStart(2, '0')}`,
          }, hatMarke)
        }
      }
      i++
    }
  }

  // --- 4. Ersetzungszeichen ---------------------------------------
  // U+FFFD entsteht, wenn ein Dekodierer aufgibt. Es traegt keine
  // Information mehr — der Schaden ist an dieser Stelle endgueltig.
  const ERSATZ = '\uFFFD'   // als Escape, damit diese Datei das Zeichen nicht selbst traegt
  let pos = text.indexOf(ERSATZ)
  while (pos !== -1) {
    const bisher = Buffer.byteLength(text.slice(0, pos), 'utf8')
    melde({
      rel, art: 'fffd', zeile: zeileVon(buf, bisher),
      text: 'Ersetzungszeichen U+FFFD',
    }, hatMarke)
    pos = text.indexOf(ERSATZ, pos + 1)
  }
}

// --- Ausgabe ------------------------------------------------------
//
// ZWEI SCHWEREGRADE, und der Unterschied ist begruendet:
//
// FEHLER (Exit 1) sind Schaeden, die Information zerstoeren oder
// falsche Daten erzeugen: doppelte Kodierung, ungueltiges UTF-8,
// UTF-16, das Ersetzungszeichen. Sie gehoeren aufgehalten.
//
// WARNUNG (Exit 0) ist der UTF-8-BOM. Er ist unerwuenscht — drei
// fuehrende Bytes, die in JSON und SQL stoeren koennen — aber er
// zerstoert nichts und laesst sich jederzeit entfernen.
// `[cmd]` Im Bestand tragen ihn 11 Dateien, darunter zwei, die dieser
// Auftrag nicht anfassen darf (`foods/page.tsx` ist fuer G-07
// gesperrt, `docs/BrainstormDocs/` ist Datenquelle). Ihn als Fehler zu
// werten hiesse, das Gate dauerhaft rot zu lassen — und ein dauerhaft
// rotes Gate wird umgangen, nicht repariert. Genau daran ist die
// Encoding-Disziplin dreimal gescheitert.
const FEHLERARTEN = new Set(['doppelt', 'kein-utf8', 'utf16', 'fffd'])

const fehler = befunde.filter(b => FEHLERARTEN.has(b.art))
const warnungen = befunde.filter(b => !FEHLERARTEN.has(b.art))

const jeDatei = new Map()
for (const b of fehler) {
  if (!jeDatei.has(b.rel)) jeDatei.set(b.rel, [])
  jeDatei.get(b.rel).push(b)
}

const freiText = freigestellt.length > 0
  ? ` (${freigestellt.length} mit Marke "${MARKE}" freigestellt)`
  : ''

function warnungenZeigen() {
  if (warnungen.length === 0) return
  const dateien = [...new Set(warnungen.map(w => w.rel))]
  console.log(`[encoding] Hinweis: ${warnungen.length} UTF-8-BOM in ${dateien.length} Datei(en) —`)
  console.log('[encoding] unerwuenscht, aber kein Schaden. Kein Abbruch.')
  for (const d of dateien.slice(0, 12)) console.log(`             ${d}`)
  if (dateien.length > 12) console.log(`             … und ${dateien.length - 12} weitere`)
}

if (fehler.length === 0) {
  console.log(`[encoding] ${geprueft} Dateien geprueft, sauber.${freiText}`)
  warnungenZeigen()
  process.exit(0)
}

warnungenZeigen()
console.error(`[encoding] ROT — ${fehler.length} Befund(e) in ${jeDatei.size} Datei(en):`)
for (const [rel, liste] of [...jeDatei].sort()) {
  const arten = new Map()
  for (const b of liste) arten.set(b.art, (arten.get(b.art) ?? 0) + 1)
  const zus = [...arten].map(([a, n]) => `${n}× ${a}`).join(', ')
  console.error(`  ${rel}  (${zus})`)
  for (const b of liste.slice(0, 3)) {
    console.error(`      Z${b.zeile}: ${b.text}`)
  }
  if (liste.length > 3) console.error(`      … und ${liste.length - 3} weitere`)
}
console.error('')
console.error('[encoding] Doppelte Kodierung ist umkehrbar, solange ALLE')
console.error('[encoding] Sequenzen betroffen sind — siehe docs/ssot/32-encoding-schaeden.md.')
console.error(`[encoding] ${geprueft} Dateien geprueft.${freiText}`)
process.exit(1)
