// G-421 - die Gegenproben.
//
// `[read]` **Eine Pruefung, die nicht rot werden kann, misst nichts.**
// `[cmd]` **Und die Sabotage muss ANKOMMEN** - ein Ersetzen, das ins
// Leere lief, sieht aus wie ein blinder Waechter (Lehre aus G-410).
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = path.resolve(process.cwd())
const WEB = path.join(WURZEL, 'apps/web')

const WRITE = 'apps/web/src/lib/goals/fotosession-write.ts'
const LESEN = 'apps/web/src/lib/goals/lesen.ts'
const KACHEL = 'apps/web/src/app/v2/goals/fehlende-kacheln.tsx'
const MODAL = 'apps/web/src/app/v2/goals/modale.tsx'

const PROBEN = [
  {
    name: 'DER ALTE ZUSTAND: das Modal schreibt wieder ins Leere',
    datei: MODAL,
    von: "    daten.set('pose_type', 'quarter_turns')",
    nach: "    daten.set('pose_type', 'mandatory_8')",
  },
  {
    name: 'die Nullzeilenpruefung faellt weg',
    datei: WRITE,
    von: '  if (roh.length === 0) {',
    nach: '  if (roh.length === 99999) {',
  },
  {
    name: 'eine fuenfte Posenart wird erfunden',
    datei: WRITE,
    von: "  'mandatory_8', 'quarter_turns', 'detail', 'custom',",
    nach: "  'mandatory_8', 'quarter_turns', 'detail', 'custom', 'freestyle',",
  },
  {
    name: 'die Session ohne Foto geht durch',
    datei: WRITE,
    von: "  if (e.posen.length === 0) {",
    nach: "  if (e.posen.length === -1) {",
  },
  {
    name: 'der Bucketname verrutscht',
    datei: WRITE,
    von: "export const FOTO_BUCKET = 'goals-progress-photos'",
    nach: "export const FOTO_BUCKET = 'progress-photos'",
  },
  {
    name: 'der Ausloeser des Modals faellt weg',
    datei: KACHEL,
    von: "onClick={() => open({ typ: 'logPhoto' })}",
    nach: 'onClick={() => undefined}',
  },
  {
    name: 'die Metrik-Kacheln rechnen wieder mit Entwurfszahlen',
    datei: KACHEL,
    von: "  const fett = reihe('body_fat_pct')",
    nach: '  const fett = BODY_METRICS.bodyfat.history',
  },
  {
    name: 'die erfundene Ziellinie bei 12 % kommt zurueck',
    datei: KACHEL,
    von: "                series={[{ data: fett, color: 'var(--acc-suppl)' }]} />",
    nach: "                series={[{ data: fett, color: 'var(--acc-suppl)' },\n"
      + "                  { data: Array(fett.length).fill(12), color: 'var(--fg-dim)' }]} />",
  },
  {
    name: 'die Signatur weicht einer oeffentlichen Adresse',
    datei: LESEN,
    von: '      .createSignedUrls(pfade, SIGNATUR_SEKUNDEN)',
    nach: '      .getPublicUrl(pfade[0]) as unknown as { data: [] }',
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
    console.log(`${p.name}\n  ROT - ${r.faelle.slice(0, 3).join(' | ')}\n`)
  }
}

console.log(`\n${PROBEN.length - blind} von ${PROBEN.length} Proben wurden ROT.`)
if (blind > 0) console.log(`${blind} BLIND - nachbessern.`)
const ende = lauf()
console.log(ende.gruen ? 'Nach dem Zuruecksetzen wieder GRUEN.' : 'ACHTUNG: nicht sauber zurueckgesetzt!')
