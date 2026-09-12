// G-435 — die Hierarchie gehoert nicht ins Modal.
//
// **Tom, 2026-09-12:** *„in den details hat es eine auflistung ‚Alle
// Muskelgruppen · 22 von 95 gezeichnet · 73 Lücken' — für was ist
// die?"*
//
// ══ WAS HIER BEWACHT WIRD ══════════════════════════════════════════
//
// **1 — `nachbarschaft` liefert den Muskel, seine Gruppe und seine
// Geschwister** — NICHT den ganzen Baum.
//
// **2 — das Modal ruft sie auf**, und ruft `baueBaum` NICHT mehr.
// `[read]` **Ein Waechter, der nur die Funktion prueft, bleibt
// gruen, wenn das Modal weiter den ganzen Baum rendert.**
//
// `[cmd]` **Am Schirm gemessen** (`tools/_g435-schau.mjs`,
// 2026-09-12): **73 Zeilen *„(nicht gezeichnet)"* -> 3.**
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { nachbarschaft, baueBaum, type MuskelKnoten } from '../muskelbaum'

const HIER = dirname(fileURLToPath(import.meta.url))

/** Ein kleiner Baum in der Form von `training.muscle_groups`. */
function baum(): MuskelKnoten[] {
  return [
    { id: '1', name: 'Back', parent_id: null },
    { id: '2', name: 'latissimus dorsi', parent_id: '1' },
    { id: '3', name: 'Upper Back', parent_id: '1' },
    { id: '4', name: 'Lower Back', parent_id: '1' },
    { id: '5', name: 'Trapezius', parent_id: '3' },
    { id: '6', name: 'Legs', parent_id: null },
    { id: '7', name: 'Calves', parent_id: '6' },
    { id: '8', name: 'Soleus', parent_id: '7' },
  ]
}

test('G-435: nachbarschaft liefert Gruppe und Geschwister', () => {
  const k = baum()
  const n = nachbarschaft(k, 'latissimus dorsi')
  assert.ok(n, 'der Latissimus fehlt im Baum')
  assert.equal(n.muskel.name, 'latissimus dorsi')
  assert.equal(n.gruppe?.name, 'Back', 'Die Gruppe ist der direkte Elternteil.')
  assert.deepEqual(n.geschwister.map(g => g.name), ['Lower Back', 'Upper Back'],
    'Die Geschwister sind die anderen Kinder derselben Gruppe — '
    + 'OHNE ihn selbst.')
  // `[read]` **Der Latissimus hat keine Kinder** — dann bleibt der
  // Abschnitt „Darunter" leer.
  assert.deepEqual(n.kinder, [])
})

test('G-435: nachbarschaft nennt EIGENE Kinder, wenn es welche gibt', () => {
  const k = baum()
  const n = nachbarschaft(k, 'Calves')
  assert.ok(n)
  assert.equal(n.gruppe?.name, 'Legs')
  assert.deepEqual(n.kinder.map(x => x.name), ['Soleus'],
    '`Calves` traegt `Soleus` — der gehoert unter „Darunter".')
})

test('G-435: eine Wurzel hat keine Gruppe, aber Geschwister', () => {
  const k = baum()
  const n = nachbarschaft(k, 'Back')
  assert.ok(n)
  assert.equal(n.gruppe, null, 'Eine Wurzel hat keinen Elternteil.')
  assert.deepEqual(n.geschwister.map(g => g.name), ['Legs'],
    'Die anderen Wurzeln sind ihre Geschwister.')
})

test('G-435: ein unbekannter Name liefert null, nicht den Baum', () => {
  // `[read]` **Die Gegenrichtung** — ohne sie waere eine Fassung
  // gruen, die bei einem Tippfehler alles zeigt.
  assert.equal(nachbarschaft(baum(), 'gibtesnicht'), null)
})

test('G-435: die Nachbarschaft ist KLEINER als der ganze Baum', () => {
  // ══ Der Kern des Auftrags ═════════════════════════════════════
  //
  // `[cmd]` **G-432/A6 rendert 95 Namen im Modal EINES Muskels.**
  // `[read]` **Diese Probe haelt fest, dass die Nachbarschaft eine
  // Auswahl ist** — sonst waere der Umbau wirkungslos.
  const k = baum()
  const n = nachbarschaft(k, 'latissimus dorsi')!
  const gezeigt = 1 + n.geschwister.length + n.kinder.length
  const ganzerBaum = k.length
  assert.ok(gezeigt < ganzerBaum,
    `Die Nachbarschaft zeigt ${gezeigt} von ${ganzerBaum} Namen — `
    + 'sie muss eine Auswahl sein, nicht der ganze Baum.')
  assert.equal(gezeigt, 3,
    'Latissimus + zwei Geschwister — mehr gehoert nicht ins Modal.')
})

test('G-435: das Modal ruft nachbarschaft und NICHT baueBaum', () => {
  // ══ Die Wirkung, nicht das Wort ═══════════════════════════════
  //
  // `[read]` **Die Proben oben pruefen die Funktion.** **Ein Modal,
  // das sie ignoriert und weiter `baueBaum` rendert, bliebe
  // gruen.**
  const roh = readFileSync(
    join(HIER, '..', '..', '..', 'app', 'v2', 'recovery', 'modale.tsx'), 'utf8')
  // ══ Kommentare weg — AUCH die JSX-Kommentare ══════════════════
  //
  // `[cmd]` **Die erste Fassung filterte nur `//`-Zeilen** — und fiel
  // ueber ihre eigene Begruendung: der `{/* … */}`-Block darueber
  // zitiert Tom woertlich, samt der Ueberschrift, die sie verbietet.
  //
  // `[read]` **Dieselbe Lehre wie G-389**, nur eine Kommentarform
  // weiter: **ein Waechter, der seinen eigenen Text liest, misst
  // nichts.**
  const ohneJsx = roh.replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  const code = ohneJsx.replace(/\/\*[\s\S]*?\*\//g, '').split('\n')
    .filter(z => !z.trim().startsWith('//') && !z.trim().startsWith('*'))
    .join('\n')

  // `[cmd]` **Hier stand `/nachbarschaft\(knoten, name\)/`** — und
  // fiel, als der Aufruf zu `nachbarschaft(knoten, namen[0])` wurde.
  // `[read]` **Der Waechter prueft die SACHE, nicht die
  // Schreibform** — gesucht ist der Aufruf, nicht sein Argumentname.
  assert.match(code, /nachbarschaft\(\s*knoten\s*,/,
    'Das Modal ruft `nachbarschaft` nicht mehr — dann zeigt es '
    + 'entweder nichts oder wieder den ganzen Baum.')
  // ══ G-436: der Waechter verbot den NAMEN, nicht die Mechanik ══
  //
  // `[cmd]` **Hier stand `!/baueBaum\(/`** — und fiel, als G-436 das
  // GRUPPEN-Fenster baute, das denselben Baum fuer Schnitt und
  // Engpass braucht.
  //
  // `[read]` **Die Zusage aus G-435 gilt weiter**, aber sie gilt fuer
  // das Fenster EINES MUSKELS: dort darf kein Baum gerendert werden.
  // **Ein Namensverbot ueber die ganze Datei altert zur Blockade**
  // (die Lehre `waechter-verbietet-namen-statt-mechanik`).
  const von = code.indexOf('function MuscleDetailModal')
  const bis = code.indexOf('function ProtocolDetailModal')
  // `[read]` **Die Grenze selbst pruefen** — verschiebt jemand die
  // Komponenten, sucht der Ausschnitt sonst lautlos im Leeren, und
  // der Waechter waere blind statt rot.
  assert.ok(von > 0, 'MuscleDetailModal nicht gefunden.')
  assert.ok(bis > von,
    'ProtocolDetailModal steht nicht mehr NACH MuscleDetailModal — '
    + 'der Ausschnitt unten traefe den falschen Bereich.')
  const muskelFenster = code.slice(von, bis)
  assert.ok(muskelFenster.includes('nachbarschaft('),
    'Der Ausschnitt enthaelt nicht einmal den Aufruf, den er '
    + 'bewachen soll — die Grenzen stimmen nicht.')
  assert.ok(!/baueBaum\(/.test(muskelFenster),
    'Das Fenster EINES Muskels ruft `baueBaum` — damit rendert es '
    + 'wieder alle 105 Gruppen darin (Toms Befund aus G-435). '
    + 'Das GRUPPEN-Fenster darf es, dieses nicht.')
  // `[cmd]` **Die erste Fassung suchte `/Alle Muskelgruppen/`** — und
  // fiel ueber ihre EIGENE Begruendung: der Kommentar zitiert Tom
  // woertlich. `[read]` **Also am gerenderten Element ankern**, nicht
  // am Wortlaut (dieselbe Lehre wie G-389).
  assert.ok(!/Alle Muskelgruppen ·|\{d\.gezeichnet\}|\{d\.luecken\}/.test(code),
    'Die Ueberschrift „Alle Muskelgruppen · N von 95" wird wieder '
    + 'gerendert — sie gehoert in die Kachel `Per-muscle detail`, '
    + 'nicht ins Modal EINES Muskels.')
})

test('G-435/A2: der Leseweg fragt NICHT nach ebene oder seite (C-484)', () => {
  // ══ Der blinde Fleck, den die Gegenprobe fand ═════════════════
  //
  // `[cmd]` **Die Spaltenliste ist eine ZEICHENKETTE** — wer `seite`
  // zurueckschreibt, faellt NICHT gegen `tsc`. **Gemessen:** die
  // Sabotage blieb gruen (`tools/_g435-sabotage.mjs`, 2026-09-12).
  //
  // `[read]` **Am Schirm faellt dafuer ganz Recovery aus** — genau
  // der Zustand, den dieser Auftrag behoben hat. **Ein Fehler, den
  // nur der Browser meldet, kommt wieder.**
  const roh = readFileSync(
    join(HIER, '..', 'hierarchie-read.ts'), 'utf8')
  const code = roh.split('\n')
    .filter(z => !z.trim().startsWith('//') && !z.trim().startsWith('*'))
    .join('\n')
  const select = /\.select\(\s*'([^']+)'/.exec(code)?.[1]
  assert.ok(select, 'Kein `.select(...)` in `hierarchie-read.ts` gefunden.')
  const spalten = select.split(',').map(s => s.trim())
  for (const weg of ['ebene', 'seite']) {
    assert.ok(!spalten.includes(weg),
      `Der Leseweg fragt nach \`${weg}\` — diese Spalte hat C-484 `
      + 'ENTFERNT. Die Abfrage faellt, und mit ihr ganz Recovery. '
      + 'Die Tiefe kommt aus `parent_id`, die Seite aus dem '
      + 'Messwert (E-81).')
  }
  // Die Gegenrichtung: was der Baum WIRKLICH braucht, muss drin sein.
  for (const noetig of ['id', 'parent_id', 'code', 'art']) {
    assert.ok(spalten.includes(noetig),
      `\`${noetig}\` fehlt in der Spaltenliste — ohne sie laesst `
      + 'sich der Baum nicht bauen.')
  }
})

test('G-435/A6: die KACHEL zeigt die Hierarchie — eingerueckt', () => {
  // ══ Die andere Haelfte des Umzugs ═════════════════════════════
  //
  // `[read]` **Die Probe darueber sagt nur, dass die Hierarchie aus
  // dem Modal RAUS ist.** `[cmd]` **Ohne diese hier waere „ueberall
  // geloescht" ebenfalls gruen** — und Toms *„da will ich parent und
  // darunter childs sehen"* waere unerfuellt.
  //
  // `[cmd]` **Am Schirm gemessen** (`tools/_g435-kachel.mjs`,
  // 2026-09-12): **vier Einrueckungsstufen** — Arms › Biceps ›
  // Brachialis › Extensor Carpi Radialis.
  const roh = readFileSync(
    join(HIER, '..', '..', '..', 'app', 'v2', 'recovery', 'tab-messwerte.tsx'), 'utf8')
  const ohneJsx = roh.replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  const code = ohneJsx.replace(/\/\*[\s\S]*?\*\//g, '').split('\n')
    .filter(z => !z.trim().startsWith('//') && !z.trim().startsWith('*'))
    .join('\n')

  assert.match(code, /baueBaum\(\s*knoten\s*,/,
    'Die Kachel `Per-muscle detail` baut den Baum nicht mehr — '
    + 'dann ist die Hierarchie NIRGENDS, nicht nur aus dem Modal weg.')
  // `[cmd]` **Die Einrueckung ist das, was sie zur Hierarchie
  // macht** — eine flache Liste mit Ueberschrift saehe im Text
  // gleich aus. `[read]` **Am Schirm fiel genau das auf:** erst
  // stand `paddingLeft` neben `padding`, und die Kurzform gewann.
  assert.match(code, /paddingLeft:\s*\(a\.ebene - 1\)/,
    'Die Zeilen sind nicht mehr nach Tiefe eingerueckt — dann ist '
    + 'es eine flache Liste, keine Hierarchie.')
  assert.ok(!/paddingLeft:[^,]+,\s*padding:/.test(code),
    '`padding` steht NACH `paddingLeft` und ueberschreibt es — am '
    + 'Schirm waere die Liste wieder flach (gemessen: 1 Stufe '
    + 'statt 4).')
})

test('G-435: baueBaum bleibt fuer die KACHEL erhalten', () => {
  // `[read]` **Die Funktion wird nicht geloescht** — G-433 stellt
  // die Kachel `Per-muscle detail` darauf um. **Wer sie entfernt,
  // nimmt der Kachel ihre Grundlage.**
  const k = baum()
  const aeste = baueBaum(k, { 'latissimus dorsi': 'latissimus' })
  assert.equal(aeste.length, 2, 'Zwei Wurzeln: Back und Legs.')
  const back = aeste.find(a => a.name === 'Back')!
  assert.equal(back.kinder.length, 3, 'Back traegt drei Kinder.')
  // Und die Luecken stehen weiter drin.
  assert.equal(back.flaeche, null, '`Back` selbst ist nicht gezeichnet.')
})
