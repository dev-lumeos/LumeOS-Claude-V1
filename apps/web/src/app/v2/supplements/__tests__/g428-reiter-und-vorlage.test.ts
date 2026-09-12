// G-428 — der leere Reiter und die zwei nackten Bedienleisten.
//
// ══ WAS HIER BEWACHT WIRD ══════════════════════════════════════════
//
// **1 — die Klammer um `?tab=`.**
//
// `[cmd]` **Gemessen 2026-09-11, beide Konten:**
// `/v2/supplements?tab=injektionen` **gab 1 Kachel und 801 Zeichen**,
// `?tab=injection` **gab 14 Kacheln und 6.605 Zeichen.**
//
// `[cmd]` **Und dieselbe Zahl VOR G-389** (`git checkout 05425238^ --
// ansicht.tsx modale.tsx`): **1 Kachel, 801 Zeichen.** `[read]` **Der
// Reiter war nie kaputt** — die Adresse traf keinen Zweig, und das tat
// sie schon vorher.
//
// **2 — der Ort der zwei Kacheln.**
//
// `[cmd]` **Gemessen vorher:** `Zyklen` und `Protokolle` lagen VOR dem
// Vorlagenraster. **Nachher: beide darin**, je ueber ihrer
// Entwurfsfassung.
//
// ══ WARUM NICHT NUR IM QUELLTEXT GESUCHT WIRD ══════════════════════
//
// `[read]` **Die erste Probe ruft die Klammer AUF** — mit echten
// Werten, nicht mit einer Suche nach ihrem Namen. **Ein Waechter, der
// `bekannt.includes` im Text findet, bleibt gruen, wenn die Bedingung
// verdreht ist.**
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const V2 = path.join(process.cwd(), 'src/app/v2/supplements')
const lies = (f: string) => fs.readFileSync(path.join(V2, f), 'utf8')

/**
 * Die Klammer aus `tab-url.ts`, als reine Rechnung.
 *
 * `[read]` **Sie steht hier ein zweites Mal** — der Hook selbst ruft
 * `useSearchParams`, und das braucht einen Router. **Damit die Kopie
 * nicht driftet, prueft die dritte Probe, dass die Bedingung im Hook
 * WOERTLICH dieselbe ist.**
 */
function klammer(roh: string, standard: string, bekannt?: readonly string[]) {
  return bekannt && bekannt.length > 0 && !bekannt.includes(roh)
    ? standard
    : roh
}

/** Die elf Reiter — aus `ansicht.tsx` gelesen, nicht abgeschrieben. */
function reiterAusDerLeiste(): string[] {
  const ansicht = lies('ansicht.tsx')
  // `[read]` **`exec` in der Schleife statt `matchAll`** — das Ziel
  // dieses Projekts kennt den Iterator nicht (`TS2802`).
  const muster = /\{ id: '([a-z]+)', label: t\(/g
  const ids: string[] = []
  let m: RegExpExecArray | null
  while ((m = muster.exec(ansicht)) !== null) ids.push(m[1])
  return ids
}

test('G-428: ein unbekannter Reiter faellt auf den Standard', () => {
  const ids = reiterAusDerLeiste()
  assert.ok(ids.length >= 11,
    `Die Leiste hat nur ${ids.length} Reiter — erwartet mindestens 11.`)
  assert.ok(ids.includes('injection'),
    'Der Reiter "injection" fehlt in der Leiste.')

  // `[cmd]` **Genau der Wert, den Tom in der Adresse hatte.**
  assert.equal(klammer('injektionen', 'today', ids), 'today',
    'Der deutsche Name "injektionen" trifft keinen Zweig — er MUSS auf '
    + 'den Standardreiter fallen. Sonst zeigt die Seite ihren Kopf und '
    + 'darunter nichts, und das sieht aus wie ein kaputter Reiter.')

  // Und ein paar weitere Tippfehler, die alle dasselbe ergaeben.
  for (const falsch of ['injektion', 'Injection', 'zyklen', '', 'database2']) {
    assert.equal(klammer(falsch, 'today', ids), 'today',
      `"${falsch}" trifft keinen Zweig und muss geklammert werden.`)
  }
})

test('G-428: ein BEKANNTER Reiter wird NICHT geklammert', () => {
  const ids = reiterAusDerLeiste()
  // `[read]` **Die Gegenrichtung** — eine Klammer, die alles auf
  // `today` wirft, waere schlimmer als gar keine. **Jeder Reiter der
  // Leiste muss sich selbst ergeben.**
  for (const id of ids) {
    assert.equal(klammer(id, 'today', ids), id,
      `Der Reiter "${id}" steht in der Leiste und darf nicht `
      + 'auf den Standard umgebogen werden.')
  }
})

test('G-428: ohne Liste bleibt das alte Verhalten', () => {
  // `[read]` **Sechs andere Module rufen den Hook ohne Liste** — fuer
  // sie darf sich nichts aendern, sonst waere das eine stille
  // Aenderung in fuenf Modulen, die niemand beauftragt hat.
  assert.equal(klammer('irgendwas', 'today', undefined), 'irgendwas',
    'Ohne Liste darf NICHT geklammert werden.')
  // `[cmd]` **Und eine LEERE Liste klammert auch nicht** — sonst
  // verschluckte sie jeden Reiter und die Seite zeigte immer nur den
  // Standard.
  assert.equal(klammer('injection', 'today', []), 'injection',
    'Eine leere Liste darf nicht jeden Reiter verschlucken.')
})

test('G-428: die Klammer im Hook ist dieselbe Rechnung', () => {
  // `[read]` **Diese Probe haelt die Kopie oben an den Hook
  // gebunden** — ohne sie koennte `tab-url.ts` sich aendern, waehrend
  // die drei Proben darueber weiter die alte Fassung pruefen.
  const hook = fs.readFileSync(
    path.join(process.cwd(), 'src/lib/tab-url.ts'), 'utf8')
  // Kommentarzeilen weg — sonst faende die Suche ihre eigene
  // Begruendung (die Lehre aus G-389).
  const code = hook.split('\n').filter(z => !z.trim().startsWith('//')).join('\n')
  assert.match(code, /bekannt\s*&&\s*bekannt\.length\s*>\s*0\s*&&\s*!bekannt\.includes\(roh\)/,
    'Die Klammer in `tab-url.ts` sieht anders aus als die Rechnung in '
    + 'diesem Test. Eine von beiden ist veraltet.')
  assert.match(code, /useTabParam\(\s*[\s\S]*?bekannt\?:\s*readonly string\[\]/,
    'Der Hook nimmt keine Reiterliste mehr entgegen.')
})

test('G-428: supplements uebergibt seine Reiterliste', () => {
  const ansicht = lies('ansicht.tsx')
  const code = ansicht.split('\n').filter(z => !z.trim().startsWith('//')).join('\n')
  // `[read]` **Am Aufruf gemessen, nicht am Vorkommen des Namens.**
  assert.match(code, /useTabParam\('today',\s*bekannteReiter\)/,
    'supplements ruft `useTabParam` ohne seine Reiterliste — dann '
    + 'faellt ein unbekannter Reiter wieder ins Leere.')
  // ══ Die Liste wird ABGELEITET, nicht abgeschrieben ═══════════════
  //
  // `[cmd]` **Die erste Fassung dieser Probe war BLIND** — sie fragte
  // nur, ob `reiterIds()` das Wort `tabs(` enthaelt. **Die Sabotage
  // *„die Liste wird abgeschrieben"* (`return ['today', 'stack']`)
  // blieb GRUEN.**
  //
  // `[read]` **Jetzt wird das ERGEBNIS gemessen:** was `reiterIds()`
  // zurueckgibt, muss Eintrag fuer Eintrag der Leiste entsprechen —
  // **eine von Hand gepflegte Liste faellt damit auf, sobald sie
  // abweicht.**
  const rumpf = code.match(/function reiterIds\(\)[^}]*\}/)?.[0] ?? ''
  assert.ok(rumpf.length > 0, '`reiterIds()` ist nicht mehr auffindbar.')
  const abgeleitet = /return tabs\(/.test(rumpf)
  assert.ok(abgeleitet,
    '`reiterIds()` leitet die Liste nicht mehr aus `tabs()` ab, sondern '
    + `gibt etwas anderes zurueck: ${rumpf.slice(0, 120)}. Eine von Hand `
    + 'gepflegte zweite Liste veraltet — genau die Drift, vor der '
    + '`tab-url.ts` gewarnt hat.')
  // `[read]` **Und die Gegenrichtung:** `tabs()` muss wirklich alle
  // Reiter der Leiste tragen, sonst leitete `reiterIds()` eine zu
  // kurze Liste ab und klammerte gute Reiter weg.
  const ids = reiterAusDerLeiste()
  const inTabsFunktion = code.match(/function tabs\([\s\S]*?\n\}/)?.[0] ?? ''
  for (const id of ids) {
    assert.ok(inTabsFunktion.includes(`id: '${id}'`),
      `Der Reiter "${id}" steht nicht in \`tabs()\` — dann fehlt er in `
      + 'der abgeleiteten Liste und wuerde geklammert.')
  }
})

test('G-428: Zyklen und Protokolle stehen IN der Vorlage', () => {
  const ansicht = lies('ansicht.tsx')
  const extended = lies('tab-extended.tsx')
  const code = ansicht.split('\n').filter(z => !z.trim().startsWith('//')).join('\n')

  // ══ Die Schreibwege sind NICHT entfernt ══════════════════════════
  //
  // `[read]` **Der Auftrag sagt es ausdruecklich** — beide Kacheln
  // muessen weiter gerendert werden.
  //
  // `[cmd]` **Die erste Fassung fragte nur, ob `<ProtokollKarte` im
  // Text steht** — und blieb GRUEN, als die Sabotage
  // `false && <ProtokollKarte` daraus machte. **Der Name lebt in
  // einem toten Zweig weiter** (dieselbe Klasse wie G-184:
  // `wadaNote={undefined}`).
  //
  // `[read]` **Jetzt wird gefragt, ob die Kachel ERREICHBAR ist:**
  // kein `false &&`, kein `null &&` davor.
  for (const [kachel, was] of [
    ['ProtokollKarte', 'Protokoll'], ['ZyklusKarte', 'Zyklen'],
  ] as const) {
    assert.match(code, new RegExp(`<${kachel}`),
      `Die ${was}kachel ist verschwunden — sie ist ein Schreibweg und `
      + 'darf nicht entfernt werden.')
    // Was steht in den 80 Zeichen davor?
    const davor = code.slice(
      Math.max(0, code.indexOf(`<${kachel}`) - 80), code.indexOf(`<${kachel}`))
    assert.ok(!/(false|null|undefined|0)\s*&&\s*$/.test(davor),
      `Die ${was}kachel steht hinter einer Bedingung, die nie zutrifft `
      + `(„${davor.trim().slice(-40)}“) — sie ist damit gebaut und `
      + 'unerreichbar, und das sieht im Quelltext aus wie vorhanden.')
  }

  // `[cmd]` **Sie gehen als Fuellung in `SuppExtended`** — nicht als
  // Geschwister davor. **Das war Toms Befund: zwei nackte
  // Bedienleisten VOR der Vorlage.**
  assert.match(code, /<SuppExtended[\s\S]{0,400}?protokolle=\{/,
    'Die Protokollkachel wird nicht mehr in `SuppExtended` '
    + 'hineingereicht — dann steht sie wieder VOR der Vorlage.')
  assert.match(code, /<SuppExtended[\s\S]{0,400}?zyklen=\{/,
    'Die Zyklenkachel wird nicht mehr in `SuppExtended` '
    + 'hineingereicht — dann steht sie wieder VOR der Vorlage.')

  const extCode = extended.split('\n').filter(z => !z.trim().startsWith('//')).join('\n')
  // Und drinnen: an der Stelle, die die Vorlage dafuer hat.
  const vorProtokolle = extCode.indexOf('{protokolle}')
  const activeProtocols = extCode.indexOf('title="Active protocols"')
  assert.ok(vorProtokolle > 0 && activeProtocols > 0,
    'Die Fuellstelle `{protokolle}` oder die Kachel `Active '
    + 'protocols` fehlt in `tab-extended.tsx`.')
  assert.ok(vorProtokolle < activeProtocols,
    'Die echte Protokollkachel steht NICHT ueber der Entwurfsfassung '
    + '`Active protocols` — oben das Angebundene, darunter das '
    + 'Mockup (E-68).')

  const vorZyklen = extCode.indexOf('{zyklen}')
  const cycleTimeline = extCode.indexOf('<CycleTimeline />')
  assert.ok(vorZyklen > 0 && cycleTimeline > 0,
    'Die Fuellstelle `{zyklen}` oder `<CycleTimeline />` fehlt.')
  assert.ok(vorZyklen < cycleTimeline,
    'Die echte Zyklenkachel steht NICHT ueber `Cycle timeline` — '
    + 'das ist der Zyklenbereich der Vorlage (A5, '
    + 'module-supplements.jsx:1212/1381).')
})

test('G-428/A5: die Vorlage HAT einen Zyklenbereich', () => {
  // `[cmd]` **A5 gemessen, nicht behauptet:**
  // `module-supplements.jsx:1381` traegt `const CycleTimeline`, und
  // Zeile 1212 rendert sie unter `Active protocols`.
  //
  // `[read]` **Diese Probe haelt die Messung fest** — wer sie
  // spaeter bezweifelt, laesst sie laufen statt neu zu suchen.
  const vorlage = fs.readFileSync(path.join(
    process.cwd(), '../../docs/spezifikation/10-plattform/design-system',
    'theme-v1/module-supplements.jsx'), 'utf8')
  assert.match(vorlage, /const CycleTimeline = \(\) =>/,
    'Die Vorlage hat keine `CycleTimeline` mehr — dann ist A5 neu zu '
    + 'beantworten.')
  assert.match(vorlage, /title="Cycle timeline · 16 weeks"/,
    'Die Zyklenkachel der Vorlage heisst nicht mehr "Cycle timeline · '
    + '16 weeks".')
  // Und sie steht IM Extended-Bereich, nicht irgendwo.
  const extendedAb = vorlage.indexOf('const SuppExtended')
  const extendedBis = vorlage.indexOf('const ExtendedGate')
  assert.ok(extendedAb > 0 && extendedBis > extendedAb,
    'Der Extended-Bereich der Vorlage ist nicht mehr auffindbar.')
  const block = vorlage.slice(extendedAb, extendedBis)
  assert.match(block, /<CycleTimeline \/>/,
    'Die Vorlage rendert `CycleTimeline` nicht mehr im '
    + 'Extended-Bereich — A5 waere damit anders zu beantworten.')
})
