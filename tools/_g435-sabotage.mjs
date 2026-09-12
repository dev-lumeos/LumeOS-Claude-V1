// G-435/A7 - die Gegenprobe.
//
// `[read]` **Ein Waechter, der laeuft und nichts findet, ist von
// einem, der nichts prueft, nicht zu unterscheiden.**
//
// `[cmd]` **Jede Sabotage wird zuerst auf ANKOMMEN geprueft** - GRUEN
// heisst nur dann „blind", wenn die Aenderung wirklich griff.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = path.resolve(import.meta.dirname, '..')
const WEB = path.join(WURZEL, 'apps/web')

const D = {
  baum: path.join(WEB, 'src/lib/koerper/muskelbaum.ts'),
  modale: path.join(WEB, 'src/app/v2/recovery/modale.tsx'),
  kachel: path.join(WEB, 'src/app/v2/recovery/tab-messwerte.tsx'),
  typ: path.join(WEB, 'src/lib/koerper/hierarchie.ts'),
  lesen: path.join(WEB, 'src/lib/koerper/hierarchie-read.ts'),
}
const ORIGINAL = Object.fromEntries(
  Object.entries(D).map(([k, p]) => [k, fs.readFileSync(p, 'utf8')]))
function zurueck() { for (const [k, p] of Object.entries(D)) fs.writeFileSync(p, ORIGINAL[k]) }

function laeuft(muster) {
  try {
    execFileSync('npx', ['tsx', '--test', muster],
      { cwd: WEB, stdio: 'pipe', shell: process.platform === 'win32' })
    return true
  } catch { return false }
}

const NB = 'src/lib/koerper/__tests__/g435-nachbarschaft.test.ts'

const SABOTAGEN = [
  // ══ Teil 3: das Modal ═══════════════════════════════════════════
  {
    name: 'der alte Zustand: das Modal rendert wieder den ganzen Baum',
    datei: 'modale',
    von: '        const n = nachbarschaft(knoten, namen[0])\n        if (!n) return null',
    nach: '        const n = nachbarschaft(knoten, namen[0])\n        if (!n) return null\n        baueBaum(knoten, {})',
  },
  {
    name: 'die Ueberschrift „Alle Muskelgruppen" kommt ins Modal zurueck',
    datei: 'modale',
    von: "              {n.gruppe ? `In der Gruppe · ${n.gruppe.name}` : 'Wurzelgruppe'}",
    nach: '              Alle Muskelgruppen · {n.geschwister.length} von 105 gezeichnet',
  },
  {
    name: 'das Modal ruft `nachbarschaft` nicht mehr',
    datei: 'modale',
    von: '        const n = nachbarschaft(knoten, namen[0])',
    nach: '        const n = { muskel: { id: "x", name: namen[0] }, gruppe: null, geschwister: [], kinder: [] }',
  },
  // ══ Die Funktion ════════════════════════════════════════════════
  {
    name: 'die Geschwister enthalten den Muskel selbst',
    datei: 'baum',
    von: '    .filter(x => x.parent_id === k.parent_id && x.id !== k.id)',
    nach: '    .filter(x => x.parent_id === k.parent_id)',
  },
  {
    name: 'die Gruppe ist die WURZEL statt des Elternteils',
    datei: 'baum',
    von: '  const gruppe = k.parent_id\n    ? knoten.find(x => x.id === k.parent_id) ?? null\n    : null',
    nach: '  const gruppe = knoten.find(x => !x.parent_id) ?? null',
  },
  {
    name: 'ein unbekannter Name liefert den ganzen Baum',
    datei: 'baum',
    von: '  const k = knoten.find(x => x.name.toLowerCase() === name.toLowerCase())\n',
    nach: '  const k = knoten.find(x => x.name.toLowerCase() === name.toLowerCase()) ?? knoten[0]\n',
  },
  {
    name: 'die eigenen Kinder fallen weg',
    datei: 'baum',
    von: '  const kinder = knoten\n    .filter(x => x.parent_id === k.id)',
    nach: '  const kinder = knoten\n    .filter(() => false)',
  },
  // ══ A6: die Kachel ══════════════════════════════════════════════
  //
  // `[read]` **Ohne diese waere „ueberall geloescht" gruen** - die
  // Hierarchie muss aus dem Modal RAUS und in die Kachel REIN.
  {
    name: 'die Hierarchie faellt auch aus der KACHEL weg',
    datei: 'kachel',
    von: '          const werte = mitWerten(baueBaum(knoten, zeigt), a => {',
    nach: '          const werte: AstMitWert[] = []; const _weg = ((a: AstMitWert) => {',
  },
  {
    name: 'die Kachel rueckt nicht mehr ein (flache Liste)',
    datei: 'kachel',
    von: '                  paddingLeft: (a.ebene - 1) * 14,',
    nach: '                  paddingLeft: 0,',
  },
  {
    name: 'der Einrueckungsfehler kommt zurueck: `padding` nach `paddingLeft`',
    datei: 'kachel',
    von: '                    paddingLeft: (a.ebene - 1) * 14,',
    nach: "                    paddingLeft: (a.ebene - 1) * 14, padding: '3px 0',",
  },
]

// ══ Teil 1: die drei Vertragszeilen ═══════════════════════════════
//
// `[read]` **Die pruefen KEINE Testdatei, sondern `tsc`** - wer
// `ebene`/`seite` zurueckholt, faellt gegen die Tabelle, nicht gegen
// eine Behauptung.
const TYP_SABOTAGEN = [
  {
    name: 'C-484 rueckgaengig: `ebene` kommt in den Typ zurueck',
    datei: 'typ',
    von: '  /** `wurzel`, `gruppe`, `muskel`, `umriss` oder `kopf`. */\n  art: string | null',
    nach: '  ebene: number | null\n  art: string | null',
  },
]

// ══ Der blinde Fleck: die Spaltenliste ist eine ZEICHENKETTE ══════
//
// `[cmd]` **Diese Sabotage blieb bei `tsc` GRUEN** - deshalb prueft
// sie jetzt die Testdatei, die genau dafuer gebaut wurde.
const LESE_SABOTAGEN = [
  {
    name: 'C-484 rueckgaengig: der Leseweg fragt wieder nach `seite`',
    datei: 'lesen',
    von: "      .select('id,parent_id,code,name_de,name_en,art,muscle_group_id')",
    nach: "      .select('id,parent_id,code,name_de,name_en,art,seite,muscle_group_id')",
  },
  {
    name: 'C-484 rueckgaengig: der Leseweg fragt wieder nach `ebene`',
    datei: 'lesen',
    von: "      .select('id,parent_id,code,name_de,name_en,art,muscle_group_id')",
    nach: "      .select('id,parent_id,code,name_de,name_en,ebene,art,muscle_group_id')",
  },
  {
    name: '`parent_id` faellt weg — der Baum haette keine Tiefe mehr',
    datei: 'lesen',
    von: "      .select('id,parent_id,code,name_de,name_en,art,muscle_group_id')",
    nach: "      .select('id,code,name_de,name_en,art,muscle_group_id')",
  },
]

console.log('\n=== G-435 — die Gegenprobe ===\n')
zurueck()
const gesund = laeuft(NB)
console.log(`Gesund: ${gesund ? 'GRUEN' : 'ROT'}\n`)
if (!gesund) { console.log('Abbruch: schon rot.'); process.exit(1) }

let alleRot = true
for (const s of SABOTAGEN) {
  zurueck()
  const p = D[s.datei]
  const vorher = fs.readFileSync(p, 'utf8')
  if (!vorher.includes(s.von)) {
    console.log(`  ${'FEHLER'.padEnd(7)} ${s.name}`)
    console.log(`          Sabotage kam NICHT an: "${s.von.trim().slice(0, 48)}…"`)
    alleRot = false
    continue
  }
  fs.writeFileSync(p, vorher.replace(s.von, s.nach))
  const nochGruen = laeuft(NB)
  console.log(`  ${(nochGruen ? 'GRUEN' : 'ROT').padEnd(7)} ${s.name}`)
  if (nochGruen) { console.log('          ^^ BLIND'); alleRot = false }
}

// ── Die Typsabotagen laufen gegen `tsc` ─────────────────────────
console.log('\n  — gegen `tsc`, nicht gegen eine Testdatei —\n')
function tscGruen() {
  try {
    execFileSync('npx', ['tsc', '--noEmit', '-p', 'tsconfig.json'],
      { cwd: WEB, stdio: 'pipe', shell: process.platform === 'win32' })
    return true
  } catch { return false }
}
zurueck()
if (!tscGruen()) {
  console.log('  FEHLER  tsc ist schon rot — die Typsabotagen sagen nichts.')
  alleRot = false
} else {
  for (const s of TYP_SABOTAGEN) {
    zurueck()
    const p = D[s.datei]
    const vorher = fs.readFileSync(p, 'utf8')
    if (!vorher.includes(s.von)) {
      console.log(`  ${'FEHLER'.padEnd(7)} ${s.name}`)
      console.log(`          Sabotage kam NICHT an.`)
      alleRot = false
      continue
    }
    fs.writeFileSync(p, vorher.replace(s.von, s.nach))
    const g = tscGruen()
    console.log(`  ${(g ? 'GRUEN' : 'ROT').padEnd(7)} ${s.name}`)
    if (g) { console.log('          ^^ BLIND — der Typ deckt die entfallene Spalte'); alleRot = false }
  }
}

// ── Die Spaltenliste: gegen die Testdatei ───────────────────────
//
// `[read]` **`tsc` sieht eine Zeichenkette nicht an** - gemessen.
console.log('\n  — die Spaltenliste, gegen den Waechter —\n')
for (const s of LESE_SABOTAGEN) {
  zurueck()
  const p = D[s.datei]
  const vorher = fs.readFileSync(p, 'utf8')
  if (!vorher.includes(s.von)) {
    console.log(`  ${'FEHLER'.padEnd(7)} ${s.name}`)
    console.log(`          Sabotage kam NICHT an.`)
    alleRot = false
    continue
  }
  fs.writeFileSync(p, vorher.replace(s.von, s.nach))
  const g = laeuft(NB)
  console.log(`  ${(g ? 'GRUEN' : 'ROT').padEnd(7)} ${s.name}`)
  if (g) { console.log('          ^^ BLIND'); alleRot = false }
}

zurueck()
console.log(`\nZurueckgesetzt: ${laeuft(NB) ? 'GRUEN' : 'ROT'}`)
console.log(`\n${alleRot ? 'ALLE SABOTAGEN ROT.' : 'NICHT alle rot — siehe oben.'}`)
