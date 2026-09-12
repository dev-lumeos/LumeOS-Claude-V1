// G-436/A7 - die Gegenprobe.
//
// **A7:** *„der Schnitt mit einem erfundenen Kind -> faellt sie?"*
//
// `[read]` **Ein Waechter, der laeuft und nichts findet, ist von
// einem, der nichts prueft, nicht zu unterscheiden.**
//
// `[cmd]` **Jede Sabotage wird zuerst auf ANKOMMEN geprueft.**
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = path.resolve(import.meta.dirname, '..')
const WEB = path.join(WURZEL, 'apps/web')

const D = {
  baum: path.join(WEB, 'src/lib/koerper/muskelbaum.ts'),
  kachel: path.join(WEB, 'src/app/v2/recovery/tab-messwerte.tsx'),
  modale: path.join(WEB, 'src/app/v2/recovery/modale.tsx'),
}
const ORIGINAL = Object.fromEntries(
  Object.entries(D).map(([k, p]) => [k, fs.readFileSync(p, 'utf8')]))
function zurueck() { for (const [k, p] of Object.entries(D)) fs.writeFileSync(p, ORIGINAL[k]) }

function laeuft() {
  try {
    execFileSync('npx', ['tsx', '--test',
      'src/lib/koerper/__tests__/g436-schnitt.test.ts',
      'src/lib/koerper/__tests__/g436-zustaende.test.ts'],
      { cwd: WEB, stdio: 'pipe', shell: process.platform === 'win32' })
    return true
  } catch { return false }
}

const SABOTAGEN = [
  // ══ Der Kern: der Schnitt ═══════════════════════════════════════
  {
    name: 'der Schnitt rechnet AUCH ueber Kinder OHNE Wert (als 0)',
    datei: 'baum',
    von: '    const mitZahl = kinder\n      .map(k => k.wert ?? k.schnitt)\n      .filter((z): z is number => z != null)',
    nach: '    const mitZahl = kinder.map(k => k.wert ?? k.schnitt ?? 0)',
  },
  {
    name: 'der Schnitt ist eine Summe statt eines Mittels',
    datei: 'baum',
    von: '      ? Math.round(mitZahl.reduce((s, z) => s + z, 0) / mitZahl.length)',
    nach: '      ? Math.round(mitZahl.reduce((s, z) => s + z, 0))',
  },
  {
    name: 'ohne Kind mit Wert kommt 0 statt null',
    datei: 'baum',
    von: '      : null\n\n    // ══ Der Engpass: das schwaechste Glied unterhalb ═════════════',
    nach: '      : 0\n\n    // ══ Der Engpass: das schwaechste Glied unterhalb ═════════════',
  },
  // ══ Der Engpass ═════════════════════════════════════════════════
  {
    name: 'der Engpass nimmt das STAERKSTE statt des schwaechsten Glieds',
    datei: 'baum',
    von: '        if (!engpass || c.wert < engpass.wert) engpass = c',
    nach: '        if (!engpass || c.wert > engpass.wert) engpass = c',
  },
  {
    name: 'der Engpass sieht nur direkte Kinder, keine Enkel',
    datei: 'baum',
    von: '        k.engpass,\n      ].filter',
    nach: '        null,\n      ].filter',
  },
  // ══ Die Ansicht ═════════════════════════════════════════════════
  {
    name: 'die alte flache Tabelle steht wieder in der Kachel',
    datei: 'kachel',
    von: '        {(() => {\n          const knoten = muskelbaum?.knoten ?? []',
    nach: '        <table className="v2-tbl"><tbody /></table>\n        {(() => {\n          const knoten = muskelbaum?.knoten ?? []',
  },
  {
    name: 'die Kachel rechnet Schnitt und Engpass nicht mehr',
    datei: 'kachel',
    von: '          const werte = mitWerten(baueBaum(knoten, zeigt), a => {',
    nach: '          const werte = baueBaum(knoten, zeigt).map(a => ({ ...a, wert: null, schnitt: null, schnittAus: 0, engpass: null })) as AstMitWert[]\n          const _ungenutzt = ((a: AstMitWert) => {',
  },
  {
    name: 'die Einrueckung faellt weg (flache Liste)',
    datei: 'kachel',
    von: '                    paddingLeft: (a.ebene - 1) * 14,',
    nach: '                    paddingLeft: 0,',
  },
  {
    name: 'eine GRUPPE ist nicht mehr anwaehlbar',
    datei: 'kachel',
    von: "                ? () => open({ typ: 'muskelgruppe', name: a.name })",
    nach: '                ? undefined',
  },
  {
    name: 'die Verteilung kennt den Gruppenfall nicht mehr',
    datei: 'modale',
    von: "    case 'muskelgruppe': return <GruppenDetailModal name={modal.name}",
    nach: "    case 'muskelgruppe': return null && <GruppenDetailModal name={modal.name}",
  },
]

console.log('\n=== G-436 — die Gegenprobe ===\n')
zurueck()
const gesund = laeuft()
console.log(`Gesund: ${gesund ? 'GRUEN' : 'ROT'}\n`)
if (!gesund) { console.log('Abbruch: schon rot.'); process.exit(1) }

let alleRot = true
for (const s of SABOTAGEN) {
  zurueck()
  const p = D[s.datei]
  const vorher = fs.readFileSync(p, 'utf8')
  if (!vorher.includes(s.von)) {
    console.log(`  ${'FEHLER'.padEnd(7)} ${s.name}`)
    console.log(`          Sabotage kam NICHT an: "${s.von.trim().slice(0, 46)}…"`)
    alleRot = false
    continue
  }
  fs.writeFileSync(p, vorher.replace(s.von, s.nach))
  const nochGruen = laeuft()
  console.log(`  ${(nochGruen ? 'GRUEN' : 'ROT').padEnd(7)} ${s.name}`)
  if (nochGruen) { console.log('          ^^ BLIND'); alleRot = false }
}

zurueck()
console.log(`\nZurueckgesetzt: ${laeuft() ? 'GRUEN' : 'ROT'}`)
console.log(`\n${alleRot ? 'ALLE SABOTAGEN ROT.' : 'NICHT alle rot — siehe oben.'}`)
