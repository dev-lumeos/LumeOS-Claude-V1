// G-413/A4 — die Gegenprobe: der ALTE Zustand, faellt sie?
//
// `[read]` **Eine Pruefung, die nicht rot werden kann, misst nichts.**
// `[cmd]` **Und die Sabotage muss ANKOMMEN** — ein Ersetzen, das ins
// Leere lief, sieht aus wie ein blinder Waechter (Lehre aus G-410).
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = path.resolve(process.cwd())
const WEB = path.join(WURZEL, 'apps/web')

const TAB = 'apps/web/src/app/v2/nutrition/tab-foods.tsx'
const FILTER = 'apps/web/src/lib/nutrition/herkunft-filter.ts'

const PROBEN = [
  {
    name: 'DER ALTE ZUSTAND: die Kachel liest preferences_hidden nicht',
    datei: TAB,
    von: '              : vorliebenLeerSatz(payload?.preferences_hidden)\n'
      + "                ?? 'Kein Lebensmittel passt zu dieser Auswahl.'}",
    nach: "              : 'Kein Lebensmittel passt zu dieser Auswahl.'}",
  },
  {
    name: 'der Satz nennt die Zahl nicht mehr',
    datei: FILTER,
    von: '  return `Deine Ern',
    nach: "  return 'Deine Ernaehrungsvorlieben blenden hier Treffer aus.' || `Deine Ern",
  },
  {
    name: 'der Satz kommt auch ohne verborgene Treffer',
    datei: FILTER,
    von: "  if (typeof verborgen !== 'number' || verborgen <= 0) return null",
    nach: "  if (typeof verborgen !== 'number') return null\n  if (verborgen <= 0) verborgen = 1",
  },
  {
    name: 'kategorie faellt aus den Abhaengigkeiten',
    datei: TAB,
    von: '  }, [suche, kategorie, tags, seite, sortierung, ohne, herkunft])',
    nach: '  }, [suche, tags, seite, sortierung, ohne, herkunft])',
  },
  {
    name: 'der Kategoriefilter geht nicht mehr an die Anfrage',
    datei: TAB,
    von: "      if (kategorie) params.set('category', kategorie)",
    nach: '      // G-413-Sabotage: entfernt',
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
