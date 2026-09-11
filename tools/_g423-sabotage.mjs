// G-423 - die Gegenproben.
//
// `[read]` **Eine Pruefung, die nicht rot werden kann, misst nichts.**
// `[cmd]` **Und die Sabotage muss ANKOMMEN** - ein Ersetzen, das ins
// Leere lief, sieht aus wie ein blinder Waechter (Lehre aus G-410).
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = path.resolve(process.cwd())
const WEB = path.join(WURZEL, 'apps/web')

const ZW = 'apps/web/src/lib/supplements/zyklus-write.ts'
const KW = 'apps/web/src/lib/medical/injektion-konfig-write.ts'
const IR = 'apps/web/src/lib/medical/injektion-read.ts'
const AN = 'apps/web/src/app/v2/supplements/ansicht.tsx'
const KA = 'apps/web/src/app/v2/supplements/zyklus-karten.tsx'
// `[cmd]` **Die Konstanten sind nach G-423 in eine eigene Datei
// gezogen** - sonst zoegen sie `next/headers` in den Browser.
const KF = 'apps/web/src/lib/medical/koerperflaechen.ts'

const PROBEN = [
  {
    // `[read]` **Der alte Zustand: gebaut und unerreichbar.** Der
    // Name muss WEG, nicht nur unwirksam - der Waechter liest den
    // Quelltext.
    name: 'DER ALTE ZUSTAND: die Karten sind nicht eingehaengt',
    datei: AN,
    von: '                  <ZyklusKarte',
    nach: '                  <SuppStack /* G-423-Sabotage */',
  },
  {
    name: 'ein vierter Zyklusstand wird erfunden',
    datei: ZW,
    von: "export const ZYKLUS_STATUS = ['active', 'paused', 'stopped'] as const",
    nach: "export const ZYKLUS_STATUS = ['active', 'paused', 'stopped', 'archived'] as const",
  },
  {
    name: 'ein dritter Injektionsweg wird erfunden',
    datei: KF,
    von: "export const INJEKTIONSWEGE = ['injection_im', 'injection_subq'] as const",
    nach: "export const INJEKTIONSWEGE = ['injection_im', 'injection_subq', 'injection_iv'] as const",
  },
  {
    name: 'eine Flaeche faellt aus der Auswahlliste',
    datei: KF,
    von: "  'hands', 'ankles', 'feet', 'latissimus',",
    nach: "  'hands', 'ankles', 'feet',",
  },
  {
    name: 'die Nullzeilenpruefung faellt weg',
    datei: KW,
    von: '  if (zeilen.length === 0) {',
    nach: '  if (zeilen.length === 99999) {',
  },
  {
    name: 'die Session ohne Flaeche geht durch',
    datei: KW,
    von: '  if (!(KOERPERFLAECHEN as readonly string[]).includes(e.body_area_code)) {',
    nach: '  if (false) {',
  },
  {
    name: 'die Rotationsregel wird im Leseweg nachgebaut',
    datei: IR,
    von: '    const zeile = (Array.isArray(v) ? v[0] : null) as Record<string, unknown> | null',
    nach: '    const zeile = (flaechen.length > 1 ? { body_area_code: flaechen[0].body_area_code } : null) as Record<string, unknown> | null',
  },
  {
    name: 'der Leersatz nennt die Bedingung nicht mehr',
    datei: KA,
    von: 'Kein Rotationsvorschlag — dafür braucht es mindestens zwei',
    nach: 'Kein Rotationsvorschlag verfuegbar. Es braucht weitere',
  },
  {
    name: 'der Schreibweg ruft die Funktion nicht mehr',
    datei: ZW,
    von: "await db().rpc('start_supplement_cycle', {",
    nach: "await db().rpc('start_cycle', {",
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
