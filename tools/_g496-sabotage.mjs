// G-496 — die Sabotageprobe zum Waechter.
//
// [read] Bleibt ein Schaden gruen, gibt es VIER Ursachen: blinder
// Waechter / kam nie an / zu weich / zweites Vorkommen.
//
// [cmd] Und KEIN Schaden an einer Datei, die der Dev-Server in ein
// Servermodul uebersetzt (die Lehre aus G-493/N1) -- hier sind es
// nur `.ts`/`.tsx`, die Next bei jeder Aenderung neu laedt.
import { readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'

const WURZEL = path.resolve(import.meta.dirname, '..')
const W = (p) => path.join(WURZEL, 'apps/web/src', p)
const TEST = 'src/lib/supplements/__tests__/g496-etikettenbild.test.ts'

const ROUTE = W('app/api/supplements/etikett/route.ts')
const TAFEL = W('app/v2/supplements/produkt-tafel.tsx')

const SCHAEDEN = [
  [ROUTE, 'die Bildadresse wird vertauscht',
   "const BILD_BASIS = 'https://api.ods.od.nih.gov/dsld/s3/pdf/thumbnails/'",
   "const BILD_BASIS = 'https://api.ods.od.nih.gov/dsld/s3/irgendwo/'"],
  [ROUTE, 'die Kennung wird nicht mehr geprueft',
   'if (!/^\\d{1,12}$/.test(roh)) {', 'if (false) {'],
  [ROUTE, 'die Route laeuft ohne Sitzung',
   '  const { data: { user } } = await createSessionClient().auth.getUser()',
   '  const user = { id: "egal" }'],
  [ROUTE, 'die Bytes werden nicht geprueft',
   '    if (!(k[0] === 0xFF && k[1] === 0xD8 && k[2] === 0xFF)) {',
   '    if (false) {'],
  [ROUTE, 'die Stundengrenze wird verschwiegen',
   '    if (antwort.status === 429) {', '    if (false) {'],
  [ROUTE, 'Retry-After faellt weg',
   "        retryAfter: antwort.headers.get('retry-after'),", '        retryAfter: null,'],
  // [read] Die Zahl steht VIERMAL in der Datei (Kopf, Begruendung,
  // Meldung, Zwischenspeicher-Notiz). Ein Schaden an EINER Stelle
  // laesst die anderen die Zusicherung erfuellen.
  [ROUTE, 'die Grenze steht nicht mehr im Code',
   '1.000', '999'],
  // [read] EINZEILIG suchen -- ein mehrzeiliger Suchtext trifft in
  // einer CRLF-Datei nie (G-492, G-493).
  [TAFEL, 'die Tafel bettet wieder ein Dokument ein',
   '        alt={`Etikett des Produkts',
   '        data-eingebettet={<iframe />}\n        alt={`Etikett des Produkts'],
  [TAFEL, 'das Bild verschwindet',
   '        data-probe="etikett-bild"', '        data-probe="etikett-bildX"'],
  [TAFEL, 'das Rueckfallfeld faellt weg',
   '        <div className="v2-supp-prod-etikett-leer" data-probe="etikett-rueckfall">',
   '        <div className="v2-supp-prod-etikett-leer">'],
  [TAFEL, 'die Quelle nennt das ODS nicht mehr',
   'Office of Dietary Supplements', 'irgendwer'],
  [TAFEL, 'die Lizenz faellt weg',
   'Dietary Supplement Label Database (CC0 1.0)', 'Dietary Supplement Label Database'],
  // [read] Genau der Fehler, den die Messung gefunden hat.
  [TAFEL, 'das Bild wird wieder lazy und versteckt',
   '        alt={`Etikett des Produkts',
   '        loading="lazy"\n        alt={`Etikett des Produkts'],
  [TAFEL, 'der NIH-Link haengt an einem Zustand',
   "      <p className=\"v2-supp-prod-satz\" style={{ marginTop: 10 }}>",
   "      {stand === 'da' && <p className=\"v2-supp-prod-satz\" style={{ marginTop: 10 }}>"],
]

// [read] Die Kontrolle MUSS gruen bleiben.
const KONTROLLE = [ROUTE, 'KONTROLLE (muss GRUEN bleiben)',
  'const FRIST_MS = 15_000', 'const FRIST_MS = 15000']

const laeuft = () => {
  try {
    execFileSync('npx', ['tsx', '--test', TEST], {
      cwd: path.join(WURZEL, 'apps/web'), stdio: 'pipe', shell: true,
    })
    return true
  } catch { return false }
}

let gut = 0, gesamt = 0
const sicherung = new Map()
for (const [datei] of [...SCHAEDEN, KONTROLLE]) {
  if (!sicherung.has(datei)) sicherung.set(datei, readFileSync(datei, 'utf8'))
}
try {
  for (const [datei, name, suche, ersatz] of [...SCHAEDEN, KONTROLLE]) {
    const kontrolle = name.startsWith('KONTROLLE')
    gesamt++
    const original = sicherung.get(datei)
    const kaputt = original.replaceAll(suche, ersatz)
    if (kaputt === original) {
      console.log(`  ??  ${name}: SUCHTEXT NICHT GEFUNDEN -- Schaden kam nie an`)
      continue
    }
    writeFileSync(datei, kaputt)
    const gruen = laeuft()
    const ok = kontrolle ? gruen : !gruen
    if (ok) gut++
    console.log(`  ${ok ? 'OK' : '!!'}  ${gruen ? 'GRUEN' : 'ROT  '}  ${name}`)
    writeFileSync(datei, original)
  }
} finally {
  for (const [datei, inhalt] of sicherung) writeFileSync(datei, inhalt)
}
console.log(`\n${gut}/${gesamt}`)
process.exit(gut === gesamt ? 0 : 1)
