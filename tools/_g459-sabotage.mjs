// G-459 — jede Probe muss rot werden koennen.
//
// [read] Eine gruene Reihe belegt nichts, solange nicht gezeigt ist,
// dass sie ueberhaupt rot werden KANN. Dazu kommt die KONTROLLE: eine
// Aenderung, die nichts Tragendes beruehrt, muss gruen bleiben —
// sonst misst die Reihe nur, dass jemand die Datei angefasst hat.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const WEB = path.join(process.cwd(), 'apps', 'web')
const PROBE = 'src/app/v2/settings/__tests__/g459-allergiekachel.test.ts'

const FAELLE = [
  { probe: 'A1/A2', datei: 'src/lib/allergien/allergie-lage.ts',
    von: "return typeof a.stoff_code === 'string' && a.stoff_code.trim().length > 0",
    nach: 'return true' },
  { probe: 'A3', datei: 'src/lib/allergien/vorschlaege-read.ts',
    von: "rpc('allergy_catalog_suggestions'", nach: "rpc('selbst_gebaut'" },
  { probe: 'A5', datei: 'src/lib/allergien/vorschlaege-read.ts',
    von: 'if (!code) return []', nach: 'if (!code) return [{ code: "", name: "", treffer: 0, quelle: "", prueftProdukte: false, treffertext: null }]' },
  { probe: 'A6', datei: 'src/lib/allergien/allergie-read.ts',
    von: "stoff_code: e.stoff_code?.trim() || null",
    nach: "stoff_code: e.stoff_text.trim().toLowerCase()" },
  { probe: 'A7', datei: 'src/app/v2/settings/allergien-kachel.tsx',
    von: 'stoff_code: gewaehlt?.code ?? null,', nach: '' },
  // [cmd] NICHT ueber die Zeile mit `\n` gehen — die Datei hat CRLF,
  // und die Stelle wurde dadurch nie gefunden. Die Probe galt als
  // gruen, war aber ungeprueft. Stattdessen die ANWEISUNG treffen.
  { probe: 'A8', datei: 'src/app/v2/settings/allergien-kachel.tsx',
    von: 'Trigger von C-503 wiese ihn ab.\r\n                    setGewaehlt(null)',
    nach: 'Trigger von C-503 wiese ihn ab.' },
  { probe: 'A9', datei: 'src/app/globals.css',
    von: '  grid-template-columns: 86px 1fr;', nach: '  display: flex;' },
  { probe: 'A10', datei: 'src/app/v2/settings/allergien-kachel.tsx',
    von: '      <div className="v2-allergie-form">',
    nach: '      <form className="v2-allergie-form">' },
  { probe: 'A11', datei: 'src/lib/allergien/vorschlaege-read.ts',
    von: "{ head: true, count: 'exact' })", nach: '{})' },
  { probe: 'A12', datei: 'src/app/v2/settings/allergien-kachel.tsx',
    von: "typeof treffer[a.id] === 'number'", nach: '(treffer[a.id] ?? 0) >= 0' },
  // ══ DIE KONTROLLE ════════════════════════════════════════════════
  // [read] Ein Erklaertext, der die bewachten Woerter ENTHAELT. Wird
  // die Reihe davon rot, liest sie ihre eigenen Kommentare.
  { probe: 'KONTROLLE', kontrolle: true,
    datei: 'src/lib/allergien/vorschlaege-read.ts',
    von: '// Laeuft ausschliesslich serverseitig.',
    nach: '// Laeuft ausschliesslich serverseitig.\n'
      + '// Hinweis: frueher .range() und ein <form>, Medikamentenkatalog,\n'
      + '// stoffCode( — alles nur als Wort in diesem Kommentar.' },
]

function laeuft() {
  try {
    execFileSync('npx', ['tsx', '--test', PROBE],
      { cwd: WEB, encoding: 'utf8', stdio: 'pipe', shell: true })
    return true
  } catch { return false }
}

if (!laeuft()) {
  console.log('ABBRUCH: die Reihe ist schon ohne Sabotage rot.')
  process.exit(1)
}

const ergebnis = []
for (const f of FAELLE) {
  const p = path.join(WEB, f.datei)
  const orig = fs.readFileSync(p, 'utf8')
  if (!orig.includes(f.von)) {
    ergebnis.push({ ...f, stand: 'STELLE NICHT GEFUNDEN' })
    continue
  }
  fs.writeFileSync(p, orig.replace(f.von, f.nach))
  const gruen = laeuft()
  fs.writeFileSync(p, orig)
  const erwartet = f.kontrolle ? gruen : !gruen
  ergebnis.push({
    probe: f.probe, kontrolle: !!f.kontrolle,
    gruen, stand: erwartet ? 'OK' : (f.kontrolle ? 'ROT STATT GRUEN' : 'BLIND'),
  })
}

// Und am Ende: unveraendert wieder gruen.
ergebnis.push({ probe: '(unveraendert)', gruen: laeuft(), stand: 'Rueckfall' })
console.log(JSON.stringify(ergebnis, null, 2))
const kaputt = ergebnis.filter(e => e.stand !== 'OK' && e.stand !== 'Rueckfall')
console.log(kaputt.length ? `\n${kaputt.length} PROBLEM(E)` : '\nAlle Proben koennen rot werden, die Kontrolle bleibt gruen.')
