// G-194: die Farbe muss etwas bedeuten.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import { BLOCK_TON, TON_TOKEN, tonFuer, type BlockTon } from '../block-ton'
import { wadaLage } from '../wada-lage'

test('G-194: vier Farben, nicht mehr', () => {
  // **Tom:** *„vier sind eine Ordnung, sieben sind ein Regenbogen."*
  assert.equal(Object.keys(TON_TOKEN).length, 4)
  const benutzt = new Set(Object.values(BLOCK_TON))
  assert.ok(benutzt.size <= 4,
    `Es sind ${benutzt.size} Bedeutungen im Umlauf — hoechstens vier.`)
})

test('G-194: keine neuen Farbwerte, nur Tokens', () => {
  // `[read]` Auftrag: *„Keine neuen Farbwerte — nur vorhandene
  // Tokens."* Ein `#hex` oder `oklch(...)` waere ein neuer Wert.
  for (const [ton, wert] of Object.entries(TON_TOKEN)) {
    assert.match(wert, /^var\(--[a-z-]+\)$/,
      `${ton} traegt keinen Token, sondern «${wert}».`)
  }
})

test('G-194: dieselbe Bedeutung, dieselbe Farbe', () => {
  // `[read]` **Die zweite Bedingung des Auftrags.** „Reinheit" im
  // Ueberblick und „Nicht im Blut nachweisbar" in der Sicherheit sagen
  // dasselbe — sie duerfen nicht auseinanderlaufen.
  assert.equal(BLOCK_TON['Reinheit'], BLOCK_TON['Nicht im Blut nachweisbar'])
  assert.equal(BLOCK_TON['Reinheit'], BLOCK_TON['Überwachung'])
  assert.equal(BLOCK_TON['Reinheit'], BLOCK_TON['Produktqualitaet'])
  // Und was schaden kann, traegt ueberall dieselbe.
  assert.equal(BLOCK_TON['Bei zu viel'], BLOCK_TON['Was nicht zurückkommt'])
  assert.equal(BLOCK_TON['Bei zu viel'], BLOCK_TON['Berichtete Nebenwirkungen'])
})

test('G-194: die zwei Gruppen aus dem Auftrag sitzen richtig', () => {
  // `[read]` *„Ueberwachung ist keine Warnung, sondern was gemessen
  // gehoert; Reinheit ist keine Wirkung, sondern dass der Inhalt
  // unsicher ist."* Beide → `pruefen`.
  assert.equal(tonFuer('Überwachung'), 'pruefen')
  assert.equal(tonFuer('Reinheit'), 'pruefen')
  assert.notEqual(tonFuer('Überwachung'), 'gefahr')
  assert.notEqual(tonFuer('Reinheit'), 'wirkung')
})

test('G-194/G-196: Gliederung bleibt farblos', () => {
  // `[read]` **Eine Farbe, die jeder Block traegt, unterscheidet
  // nichts mehr.**
  //
  // `[cmd]` **G-196 hat „Wann und wie" aus dieser Liste genommen** —
  // der Auftrag fuehrt es unter `pruefen`, und das traegt: der Text
  // sagt, worauf beim Einnehmen zu achten ist (nuechtern, mit Fett,
  // Abstand zu anderen Mitteln). Das ist eine Aussage, keine
  // Gliederung.
  for (const t of ['Fragen', 'Weitere Angaben',
    'Aus der Community', 'Szene-Begriffe', 'Formen']) {
    assert.equal(tonFuer(t), null, `«${t}» traegt eine Farbe ohne Aussage.`)
  }
  assert.equal(tonFuer(null), null)
  assert.equal(tonFuer('Gibt es nicht'), null)
})

test('G-194: der WADA-Block braucht keine fuenfte Farbe', () => {
  // ══ DER PRUEFSTEIN ══════════════════════════════════════════════
  //
  // **Tom:** *„Wenn du dafuer eine fuenfte Farbe brauchst, ist die
  // Ordnung zu fein."*
  const drei: Array<[string, BlockTon]> = [
    ['prohibited', 'gefahr'],
    ['not_prohibited', 'entwarnung'],
    ['monitored', 'pruefen'],
  ]
  for (const [status, erwartet] of drei) {
    const l = wadaLage(status, 'Ein Satz zur Lage.', null)
    assert.equal(l!.ton, erwartet, `${status} traegt den falschen Ton.`)
    assert.ok(erwartet in TON_TOKEN,
      `${status} braeuchte eine Farbe ausserhalb der vier.`)
  }
  // Verboten und erlaubt duerfen NIE dieselbe Farbe tragen.
  assert.notEqual(wadaLage('prohibited', 'x', null)!.ton,
    wadaLage('not_prohibited', 'x', null)!.ton,
    'Eine Entwarnung in Warnfarbe waere falsch.')
})

test('G-194: eine Entwarnung traegt nicht die Warnfarbe', () => {
  assert.equal(TON_TOKEN.entwarnung, 'var(--pos)')
  assert.notEqual(TON_TOKEN.entwarnung, TON_TOKEN.gefahr)
  // Und `pruefen` ist nicht die Wirkungsfarbe — sonst hiesse
  // „beobachtet", der Stoff wirke.
  assert.notEqual(TON_TOKEN.pruefen, TON_TOKEN.wirkung)
})

test('G-194: `--fg-dim` traegt keine Ueberschrift', () => {
  // `[cmd]` **Gemessen 2026-08-26**, Canvas → sRGB, WCAG-2:
  // `--fg-dim` liegt bei **2.12** (dunkel) und **2.88** (hell) — unter
  // 4.5:1. `[read]` Die vier gewaehlten Tokens liegen alle darueber.
  const werte = Object.values(TON_TOKEN)
  assert.equal(werte.includes('var(--fg-dim)'), false,
    '`--fg-dim` faellt im Kontrast durch (2.12/2.88) und ist keine '
    + 'Ueberschriftenfarbe, sondern ein Farbfleck.')
})

test('G-196: jede Bedeutung ist eine der vier', () => {
  // ══ DIE NEGATIVPROBE AUS DEM AUFTRAG ════════════════════════════
  //
  // `[read]` **Tom: *„Sonst schleicht sich beim naechsten Block
  // wieder Grau ein"*** — oder eben eine erfundene Bedeutung. Dieser
  // Waechter faengt beides: einen Tippfehler (`gefaehr`) ebenso wie
  // eine fuenfte Farbe, die jemand still einfuehrt.
  const ERLAUBT = new Set(['gefahr', 'wirkung', 'pruefen', 'entwarnung'])
  for (const [titel, ton] of Object.entries(BLOCK_TON)) {
    assert.ok(ERLAUBT.has(ton),
      `«${titel}» traegt «${ton}» — das ist keine der vier Bedeutungen.`)
    assert.ok(ton in TON_TOKEN,
      `«${titel}» traegt «${ton}», wofuer es kein Token gibt.`)
  }
  // Und umgekehrt: kein Token ohne Bedeutung.
  for (const ton of Object.keys(TON_TOKEN)) {
    assert.ok(ERLAUBT.has(ton), `«${ton}» ist eine fuenfte Farbe.`)
  }
})

test('G-196: alle Ueberschriften der Tafel sind entschieden', () => {
  // `[read]` **Der eigentliche Befund von G-196:** die Ordnung stand,
  // aber die Anwendung fehlte an fuenf von acht Stellen. Dieser
  // Waechter zaehlt die Ueberschriften IM CODE und verlangt fuer jede
  // eine Entscheidung — Farbe oder ausdruecklich keine.
  //
  // **Grau ist erlaubt, aber nur als Entscheidung**: die Titel unten
  // stehen namentlich hier, nicht als Rest.
  const OHNE_FARBE = new Set([
    'Weitere Angaben',     // Sammelkasten, keine gemeinsame Aussage
    'Fragen',              // traegt alle vier Bedeutungen zugleich
    'Aus der Community',   // Rahmen um fuenf eigene Bloecke
    'Szene-Begriffe',      // Woerterbuch, keine Aussage
  ])
  const roh = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8')
  const quelle = roh('src/app/v2/supplements/substanz-tafel.tsx')
    + roh('src/app/v2/supplements/substanz-abschnitte.tsx')

  const titel: string[] = []
  const muster = /<BlockTitel\s+titel="([^"]+)"/g
  let treffer: RegExpExecArray | null
  while ((treffer = muster.exec(quelle)) !== null) titel.push(treffer[1])
  assert.ok(titel.length >= 10,
    `Nur ${titel.length} Ueberschriften ueber BlockTitel — es sollten `
    + 'alle sein (G-196).')
  for (const t of titel) {
    assert.ok(BLOCK_TON[t] !== undefined || OHNE_FARBE.has(t),
      `«${t}» ist weder zugeordnet noch ausdruecklich farblos — genau `
      + 'so ist in G-194 das Grau stehengeblieben (G-196).')
  }
})

test('G-194: die Farbordnung ist verdrahtet', () => {
  // `[read]` **Dieselbe Pruefung wie G-186/187/191/184** — eine
  // Zuordnung, die niemand aufruft, ist Papier.
  const roh = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')

  const abschnitte = roh('src/app/v2/supplements/substanz-abschnitte.tsx')
  const tafel = roh('src/app/v2/supplements/substanz-tafel.tsx')
  assert.ok(/tonFuer\s*\(/.test(abschnitte) || /tonFuer\s*\(/.test(tafel),
    'Niemand ruft `tonFuer` auf — die Ordnung waere Papier (G-194).')

  // Und keine handgesetzte Warnfarbe mehr neben der Ordnung.
  const hart = (abschnitte + tafel).match(/color:\s*'var\(--warn\)'/g) ?? []
  assert.equal(hart.length, 0,
    `${hart.length} Ueberschrift(en) setzen die Farbe noch von Hand — `
    + 'dann laufen Bedeutung und Farbe wieder auseinander (G-194).')
})
