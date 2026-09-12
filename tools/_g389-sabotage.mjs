// G-389/A5 - die Gegenproben.
//
// `[read]` **Eine Pruefung, die nicht rot werden kann, misst nichts.**
// `[cmd]` **Und die Sabotage muss ANKOMMEN** - ein Ersetzen, das ins
// Leere lief, sieht aus wie ein blinder Waechter (Lehre aus G-410).
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = path.resolve(process.cwd())
const WEB = path.join(WURZEL, 'apps/web')

const SW = 'apps/web/src/lib/medical/injektion-write.ts'
const VK = 'apps/web/src/lib/medical/injektion-vokabular.ts'
const MO = 'apps/web/src/app/v2/supplements/modale.tsx'

const PROBEN = [
  {
    // `[read]` **DER ALTE ZUSTAND**: das Fenster zeigte neun Felder
    // und speicherte nichts.
    name: 'DER ALTE ZUSTAND: der Knopf ist wieder in Entwicklung',
    datei: MO,
    von: '    const r = await injektionAnlegenAktion({',
    nach: '    const r = await keinSchreibweg({',
  },
  {
    name: 'die Nullzeilenpruefung faellt weg',
    datei: SW,
    von: '  if (zeilen.length === 0) {',
    nach: '  if (zeilen.length === 99999) {',
  },
  {
    name: 'ein dritter Injektionsweg wird erfunden',
    datei: VK,
    von: "export const INJEKTIONSWEGE_LOG = ['im', 'sc'] as const",
    nach: "export const INJEKTIONSWEGE_LOG = ['im', 'sc', 'iv'] as const",
  },
  {
    name: 'die Umrechnung der zwei Vokabulare dreht sich um',
    datei: VK,
    von: "  return konfig === 'injection_im' ? 'im' : 'sc'",
    nach: "  return konfig === 'injection_im' ? 'sc' : 'im'",
  },
  {
    name: 'der Schmerzwert darf ueber 3 gehen',
    datei: SW,
    von: '    if (!Number.isInteger(p) || p < 0 || p > 3) {',
    nach: '    if (!Number.isInteger(p) || p < 0 || p > 99) {',
  },
  {
    name: 'die Koerperflaeche wird nicht mehr verlangt',
    datei: SW,
    von: "  if (!e.body_area_code.trim()) {",
    nach: '  if (false) {',
  },
  {
    name: 'ein Volumen von 0 geht durch',
    datei: SW,
    von: '    if (!Number.isFinite(n) || n <= 0) {',
    nach: '    if (!Number.isFinite(n) || n < 0) {',
  },
  {
    name: 'die Nadel wird nicht mehr aus der Konfiguration geholt',
    datei: MO,
    von: '    () => konfig.find(k => k.body_area_code === flaeche && k.route === wegKonfig),',
    nach: '    () => undefined,',
  },
  {
    name: 'die Vorbelegung ueberschreibt die Handeingabe',
    datei: MO,
    von: '    if (nadelBeruehrt) return',
    nach: '    if (false) return',
  },
  {
    name: 'die Validierungssperre faellt',
    datei: MO,
    von: '            disabled={gesperrt || laeuft}',
    nach: '            disabled={laeuft}',
  },
]

const lauf = () => {
  try {
    execFileSync('npx', ['tsx', '--test', 'src/**/__tests__/*.test.ts'],
      { cwd: WEB, encoding: 'utf8', stdio: 'pipe', shell: true })
    return { gruen: true, faelle: [] }
  } catch (e) {
    const aus = `${e.stdout ?? ''}${e.stderr ?? ''}`
    return {
      gruen: false,
      faelle: [...aus.matchAll(/^not ok \d+ - (.+)$/gm)].map(m => m[1].trim()),
    }
  }
}

console.log('Ausgangslage ...')
const start = lauf()
if (!start.gruen) {
  console.log('ABBRUCH: schon vorher rot:', start.faelle)
  process.exit(1)
}
console.log('  GRUEN\n')

let blind = 0
for (const p of PROBEN) {
  const ziel = path.join(WURZEL, p.datei)
  const orig = fs.readFileSync(ziel, 'utf8')
  if (!orig.includes(p.von)) {
    console.log(`${p.name}\n  ANGEKOMMEN? NEIN - Stelle nicht gefunden. Probe untauglich.\n`)
    blind++
    continue
  }
  fs.writeFileSync(ziel, orig.replace(p.von, p.nach), 'utf8')
  const r = lauf()
  fs.writeFileSync(ziel, orig, 'utf8')

  if (r.gruen) {
    console.log(`${p.name}\n  GRUEN - BLIND, der Waechter sieht die Sabotage nicht.\n`)
    blind++
  } else {
    console.log(`${p.name}\n  ROT - ${r.faelle.slice(0, 2).join(' | ')}\n`)
  }
}

console.log(`\n${PROBEN.length - blind} von ${PROBEN.length} Proben wurden ROT.`)
if (blind > 0) console.log(`${blind} BLIND - nachbessern.`)
const ende = lauf()
console.log(ende.gruen ? 'Nach dem Zuruecksetzen wieder GRUEN.' : 'ACHTUNG: nicht sauber zurueckgesetzt!')
