// G-464 — jede Probe muss rot werden koennen.
//
// [read] Dazu die KONTROLLE: eine Aenderung, die nichts Tragendes
// beruehrt, muss gruen bleiben — sonst misst die Reihe nur, dass
// jemand die Datei angefasst hat (Lehre aus G-460).
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const WEB = path.join(process.cwd(), 'apps', 'web')
const PROBE = 'src/app/v2/supplements/__tests__/g464-tafel-spalte.test.ts'

const FAELLE = [
  // Die Gruppierung haengt wieder an der Kategorie allein.
  { probe: 'A1/A4', datei: 'src/lib/supplements/produkt-etikett.ts',
    von: '      : buendelFuerZeile(massgeblich)',
    nach: '      : buendelFuer(massgeblich.ingredient_category)' },
  // Der Naehrwert landet bei den Wirkstoffen.
  { probe: 'A1b', datei: 'src/lib/supplements/produkt-etikett.ts',
    von: "    case 'naehrwert': return 'naehrwerte'",
    nach: "    case 'naehrwert': return 'wirkstoffe'" },
  // Der Rueckfall faellt weg.
  { probe: 'A2', datei: 'src/lib/supplements/produkt-etikett.ts',
    von: "    default: return buendelFuer(z.ingredient_category)",
    nach: "    default: return 'hilfsstoffe'" },
  // Hilfsstoffe wandern nach Kategorie.
  { probe: 'A3', datei: 'src/lib/supplements/produkt-etikett.ts',
    von: "    case 'hilfsstoff': return 'hilfsstoffe'",
    nach: "    case 'hilfsstoff': return 'wirkstoffe'" },
  // Die Mischung wird zerrissen.
  // [cmd] EINZEILIG suchen. Die Dateien haben CRLF, und ein `\n` im
  // Suchtext trifft die Stelle nie — die drei Proben galten als
  // gruen, waren aber ungeprueft (derselbe Fehler wie in G-459).
  { probe: 'A5', datei: 'src/lib/supplements/produkt-etikett.ts',
    von: 'const ziel = massgeblich.istMischung',
    nach: 'const ziel = (false as boolean)' },
  // Die Marke haengt wieder an supplement_id allein.
  { probe: 'A6', datei: 'src/lib/supplements/produkte-read.ts',
    von: '|| s(r.nutrient_code) !== null',
    nach: '|| false' },
  // Die Rohtabelle statt der Sicht.
  { probe: 'A7', datei: 'src/lib/supplements/produkte-read.ts',
    von: "c.from('supplier_product_content_catalog')",
    nach: "c.from('product_contents_alt')" },
  // Die Einrueckung faellt weg.
  { probe: 'A8', datei: 'src/lib/supplements/produkte-read.ts',
    von: "        .select('id,blend_id,reihenfolge')",
    nach: "        .select('id,reihenfolge')" },
  // Eine unbekannte Klasse wird durchgereicht statt null.
  { probe: 'A9', datei: 'src/lib/supplements/produkte-read.ts',
    von: "return v === 'naehrwert' || v === 'wirkstoff'",
    nach: "return (v as InhaltsZeile['content_class']) ?? v === 'wirkstoff'" },
  // ══ DIE KONTROLLE ════════════════════════════════════════════════
  // [read] Ein Kommentar, der die bewachten Woerter ENTHAELT. Wird
  // die Reihe davon rot, liest sie ihre eigenen Erklaertexte.
  { probe: 'KONTROLLE', kontrolle: true,
    datei: 'src/lib/supplements/produkte-read.ts',
    von: 'export type FirmenZeile = {',
    nach: '// Hinweis: frueher dsld_name, nutrient_code, blend_id und\n'
      + '// product_contents — alles nur als Wort in diesem Kommentar.\n'
      + 'export type FirmenZeile = {' },
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
