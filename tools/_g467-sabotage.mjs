// G-467 — jede Probe muss rot werden koennen.
//
// [cmd] EINZEILIG suchen: die Dateien haben CRLF, und ein `\n` im
// Suchtext trifft nie (G-459, G-464 — dort viermal passiert).
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const WEB = path.join(process.cwd(), 'apps', 'web')
const PROBE = 'src/app/v2/supplements/__tests__/g467-filter-speicher.test.ts'
const LAGE = 'src/lib/supplements/produkt-filter-lage.ts'

const FAELLE = [
  { probe: 'A1', datei: LAGE,
    von: "export const FILTER_SCHLUESSEL = 'supplements.produkt_filter'",
    nach: "export const FILTER_SCHLUESSEL = 'Supplements.ProduktFilter'" },
  // Ein Suchwort rutscht durch die Pruefung.
  { probe: 'A2', datei: LAGE,
    von: '  if (!roh || typeof roh !== \'object\' || Array.isArray(roh)) return VORGABE',
    nach: '  if (!roh || typeof roh !== \'object\' || Array.isArray(roh)) return VORGABE\n'
      + '  if (typeof (roh as Record<string, unknown>).frage === \'string\') {\n'
      + '    return { ...VORGABE, ...(roh as object) } as ProduktFilter\n  }' },
  { probe: 'A3', datei: LAGE,
    von: '    form: text(o.form),', nach: '    form: null,' },
  // `null` beim Status wird als „fehlt" gelesen.
  { probe: 'A4', datei: LAGE,
    von: "    status: 'status' in o ? text(o.status) : VORGABE.status,",
    nach: '    status: text(o.status) ?? VORGABE.status,' },
  { probe: 'A5', datei: LAGE,
    von: '  if (!roh || typeof roh !== \'object\' || Array.isArray(roh)) return VORGABE',
    nach: '  if (!roh) return VORGABE' },
  { probe: 'A6', datei: 'src/lib/supplements/produkt-filter-read.ts',
    von: '    if (istVorgabe(filter)) {', nach: '    if (false) {' },
  { probe: 'A7a', datei: LAGE,
    von: '  leisteOffen: true,', nach: '  leisteOffen: false,' },
  { probe: 'A7b', datei: 'src/app/v2/supplements/tab-produkte.tsx',
    von: 'React.useState(VORGABE.leisteOffen)', nach: 'React.useState(true)' },
  { probe: 'A8', datei: LAGE,
    von: "    ? `${n} geladen · der Filter trifft mindestens ${g} Produkte`",
    nach: '    ? `${n} / ${g}`' },
  { probe: 'A9', datei: LAGE,
    von: '    + (f.status !== VORGABE.status ? 1 : 0)', nach: '    + 1' },
  // ══ DIE KONTROLLE ════════════════════════════════════════════════
  { probe: 'KONTROLLE', kontrolle: true, datei: LAGE,
    von: 'function text(v: unknown): string | null {',
    nach: '// Hinweis: frueher frage, istVorgabe, leisteOffen und\n'
      + '// FILTER_SCHLUESSEL — nur als Wort in diesem Kommentar.\n'
      + 'function text(v: unknown): string | null {' },
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
    ergebnis.push({ probe: f.probe, stand: 'STELLE NICHT GEFUNDEN' })
    continue
  }
  fs.writeFileSync(p, orig.replace(f.von, f.nach))
  const gruen = laeuft()
  fs.writeFileSync(p, orig)
  const erwartet = f.kontrolle ? gruen : !gruen
  ergebnis.push({
    probe: f.probe, kontrolle: !!f.kontrolle, gruen,
    stand: erwartet ? 'OK' : (f.kontrolle ? 'ROT STATT GRUEN' : 'BLIND'),
  })
}

ergebnis.push({ probe: '(unveraendert)', gruen: laeuft(), stand: 'Rueckfall' })
console.log(JSON.stringify(ergebnis, null, 2))
const kaputt = ergebnis.filter(e => e.stand !== 'OK' && e.stand !== 'Rueckfall')
console.log(kaputt.length
  ? `\n${kaputt.length} PROBLEM(E)`
  : '\nAlle Proben koennen rot werden, die Kontrolle bleibt gruen.')
