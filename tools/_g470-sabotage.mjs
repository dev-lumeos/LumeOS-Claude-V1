// G-470 — jede Probe muss rot werden koennen.
//
// [read] Der wichtigste Fall zuerst: der URSPRUNGSZUSTAND. Nimmt man
// die Absicherung heraus, ist der Code wieder genau der, der den
// Produktionsbau lahmgelegt hat — und der neue Waechter MUSS das
// sehen. Sonst haette er den Fehler wieder nicht gefunden.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = process.cwd()
const WEB = path.join(WURZEL, 'apps', 'web')
const PROBE = 'src/lib/__tests__/browser-global-grenze.test.ts'
const CLIENT = path.join(WURZEL, 'packages/shared/src/supabase/client.ts')

const FAELLE = [
  // ══ DER URSPRUNGSZUSTAND ═════════════════════════════════════════
  { probe: 'URSPRUNG (lesen)', datei: CLIENT,
    von: "  if (typeof document === 'undefined') return undefined",
    nach: '' },
  // [read] EINZEILIG und eindeutig: `lesen` gibt `undefined` zurueck,
  // `schreiben` nur `return`. Der Unterschied macht die Stelle
  // eindeutig, ohne ein Zeilenende im Suchtext zu brauchen.
  { probe: 'URSPRUNG (schreiben)', datei: CLIENT,
    // [cmd] Ein erster Versuch ersetzte nur `return` durch `{ }` —
    // die `typeof`-Pruefung blieb stehen, und der Waechter sah zu
    // Recht eine Absicherung. [read] Die Sabotage muss die PRUEFUNG
    // entfernen, nicht ihren Rumpf.
    von: "  if (typeof document === 'undefined') return\r\n  const teile",
    nach: '  const teile' },
  // Die Gegenprobe der Erkennung selbst.
  { probe: 'Erkennung', datei: path.join(WEB, PROBE),
    von: "const GLOBALE = ['document', 'window', 'localStorage', 'sessionStorage']",
    nach: "const GLOBALE = []" },
  // Und die Aussage ueber den anderen Waechter.
  { probe: 'Abgrenzung', datei: path.join(WEB, 'src/lib/__tests__/client-grenze.test.ts'),
    von: '// A-60: eine `Map` ueber die Server-Client-Grenze kommt leer an.',
    nach: '// A-60 — betrifft auch document und window.' },
  // ══ G-471: die Huellenprobe ══════════════════════════════════════
  // [read] Ein Browserzugriff im RUMPF der Komponente — genau die
  // Form, die G-470 ausgeloest hat (dort `useMemo`).
  { probe: 'G-471 Huelle', datei: path.join(WEB, 'src/app/v2/shell.tsx'),
    von: '  const pathname = usePathname()',
    nach: "  const pathname = usePathname(); "
      + "const modus = document.documentElement.getAttribute('data-mode')" },
  // [read] Und die Liste selbst: leer heisst „nichts zu pruefen".
  { probe: 'G-471 Liste', datei: path.join(WEB, 'src/lib/__tests__/browser-global-grenze.test.ts'),
    von: "  'apps/web/src/app/v2/shell.tsx',", nach: '' },
  // ══ DIE KONTROLLE ════════════════════════════════════════════════
  // [read] Ein Kommentar, der die bewachten Woerter ENTHAELT.
  { probe: 'KONTROLLE', kontrolle: true, datei: CLIENT,
    von: 'export function createClient() {',
    nach: '// Hinweis: frueher document.cookie und window.localStorage —\n'
      + '// nur als Wort in diesem Kommentar.\n'
      + 'export function createClient() {' },
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
  const orig = fs.readFileSync(f.datei, 'utf8')
  if (!orig.includes(f.von)) {
    ergebnis.push({ probe: f.probe, stand: 'STELLE NICHT GEFUNDEN' })
    continue
  }
  fs.writeFileSync(f.datei, orig.replace(f.von, f.nach))
  const gruen = laeuft()
  fs.writeFileSync(f.datei, orig)
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
